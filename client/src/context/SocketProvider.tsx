import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import MockMatchingService from "../lib/mockMatchingService";

interface ISocketContext {
  socket: Socket | null;
  setSocket: (socket: Socket | null) => void;
  mockMatching: MockMatchingService;
  isUsingMockMode: boolean;
}

const SocketContext = createContext<ISocketContext | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isUsingMockMode, setIsUsingMockMode] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastConnectionAttempt, setLastConnectionAttempt] = useState<number>(0);
  const mockMatching = MockMatchingService.getInstance();

  // Add error handling
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Socket Provider Error:", event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const shouldAttemptConnection = useCallback(() => {
    const now = Date.now();
    const timeSinceLastAttempt = now - lastConnectionAttempt;
    const minInterval = Math.min(5000 * Math.pow(2, connectionAttempts), 30000); // Exponential backoff, max 30s
    return timeSinceLastAttempt > minInterval;
  }, [connectionAttempts, lastConnectionAttempt]);

  useEffect(() => {
    if (!socket && shouldAttemptConnection()) {
      setLastConnectionAttempt(Date.now());
      setConnectionAttempts(prev => prev + 1);
      
      // Determine socket URL based on environment
      let socketUrl: string;

      if (window.location.hostname.includes('webcontainer-api.io')) {
        // WebContainer environment - use HTTP (not HTTPS) for WebSocket
        const protocol = 'http';
        const host = window.location.hostname.replace('5173', '80');
        const baseUrl = `${protocol}://${host}`;
        socketUrl = baseUrl;
      } else if (window.location.hostname === "localhost") {
        socketUrl = "http://localhost:8000";
      } else {
        socketUrl = `http://${window.location.hostname}:8000`;
      }

      console.log('Attempting to connect to:', socketUrl);

      const newSocket = io(socketUrl, {
        transports: ["websocket", "polling"],
        secure: false, // Disable secure connection for WebContainer
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        withCredentials: false, // Disable credentials for WebContainer
      });

      console.log("Attempting socket connection to:", socketUrl);

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
        setIsUsingMockMode(false);
        setConnectionAttempts(0); // Reset on successful connection
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      newSocket.on("connect_error", (error) => {
        console.log("Socket connection failed, falling back to mock mode");
        console.error("Socket connection error:", error);
        
        // Prevent infinite retry loops
        if (connectionAttempts >= 5) {
          console.log("Max connection attempts reached, enabling mock mode permanently");
          setIsUsingMockMode(true);
          mockMatching.startBotSimulation();
          return;
        }
        
        // Set a timeout before falling back to mock mode
        setTimeout(() => {
          if (!newSocket.connected) {
            console.log("Connection timeout, enabling mock mode");
            setIsUsingMockMode(true);
            mockMatching.startBotSimulation();
          }
        }, 5000);
        
        // Try alternative port based on environment
        if (window.location.hostname.includes('webcontainer-api.io')) {
          console.log("Trying alternative WebContainer port 81 and 82...");
          const altProtocol = 'http';
          const altHost = window.location.hostname.replace('5173', '81');
          const altUrl = `${altProtocol}://${altHost}`;
          const altSocket = io(altUrl, {
            transports: ["websocket", "polling"],
            secure: false,
            timeout: 20000,
            forceNew: true,
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 1000,
            withCredentials: false,
          });
          
          altSocket.on("connect", () => {
            console.log("Connected to alternative WebContainer port:", altSocket.id);
            setSocket(altSocket);
            setIsUsingMockMode(false);
          });
          
          altSocket.on("connect_error", () => {
            console.log("Port 81 failed, trying port 82...");
            const alt2Host = window.location.hostname.replace('5173', '82');
            const alt2Url = `${altProtocol}://${alt2Host}`;
            const alt2Socket = io(alt2Url, {
              transports: ["websocket", "polling"],
              secure: false,
              timeout: 20000,
              forceNew: true,
              reconnection: true,
              reconnectionAttempts: 3,
              reconnectionDelay: 1000,
              withCredentials: false,
            });
            
            alt2Socket.on("connect", () => {
              console.log("Connected to alternative WebContainer port 82:", alt2Socket.id);
              setSocket(alt2Socket);
              setIsUsingMockMode(false);
            });
            
            alt2Socket.on("connect_error", () => {
              console.log("All WebContainer ports failed, falling back to mock matching mode");
              setIsUsingMockMode(true);
              mockMatching.startBotSimulation();
              alt2Socket.close();
            });
            
            altSocket.close();
          });
        } else if (window.location.hostname === "localhost" && socketUrl.includes(":8000")) {
          console.log("Trying alternative port 8001...");
          const altSocket = io("http://localhost:8001", {
            transports: ["websocket", "polling"],
            secure: false,
            timeout: 20000,
            forceNew: true,
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 1000,
          });
          
          altSocket.on("connect", () => {
            console.log("Connected to alternative port:", altSocket.id);
            setSocket(altSocket);
            setIsUsingMockMode(false);
          });
          
          altSocket.on("connect_error", () => {
            console.log("Alternative port also failed, falling back to mock matching mode");
            setIsUsingMockMode(true);
            mockMatching.startBotSimulation();
            altSocket.close();
          });
        } else {
          console.log("Falling back to mock matching mode");
          setIsUsingMockMode(true);
          mockMatching.startBotSimulation();
        }
      });

      newSocket.on("reconnect", (attemptNumber) => {
        console.log("Socket reconnected after", attemptNumber, "attempts");
      });

      newSocket.on("reconnect_error", (error) => {
        console.error("Socket reconnection error:", error);
      });

      setSocket(newSocket);

      return () => {
        console.log("Cleaning up socket connection");
        newSocket.close();
      };
    }
  }, [socket, shouldAttemptConnection, connectionAttempts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        console.log("Component unmounting, closing socket");
        socket.close();
        setSocket(null);
      }
    };
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{ socket, setSocket, mockMatching, isUsingMockMode }}
    >
      {children}
    </SocketContext.Provider>
  );
};
