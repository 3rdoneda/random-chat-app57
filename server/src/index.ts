import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

const app = express();
const server = createServer(app);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for WebRTC
  crossOriginEmbedderPolicy: false, // Disable for WebRTC
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5000",
      "https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci3.w-credentialless-staticblitz.com",
      "https://ajnabicam.com",
      // Add more development URLs
      "http://172.19.7.42:5173",
      "http://172.19.7.43:5173",
      // Allow any localhost and webcontainer URLs for development
      /^https?:\/\/localhost:\d+$/,
      /^https?:\/\/.*\.webcontainer-api\.io$/,
      /^https?:\/\/.*\.w-credentialless-staticblitz\.com$/
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  allowEIO3: true,
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    connections: connectedUsers.size
  });
});

app.get("/", (req, res) => {
  res.send("AjnabiCam Server is running!");
});

// Store connected users
const connectedUsers = new Map<string, any>();
const waitingUsers: string[] = [];
const activeConnections = new Map<string, string>(); // Track active peer connections
const userSessions = new Map<string, { joinTime: number; lastActivity: number }>();

// Cleanup inactive users periodically
setInterval(() => {
  const now = Date.now();
  const inactiveThreshold = 5 * 60 * 1000; // 5 minutes
  
  for (const [socketId, session] of userSessions.entries()) {
    if (now - session.lastActivity > inactiveThreshold) {
      console.log(`🧹 Cleaning up inactive user: ${socketId}`);
      
      // Remove from all data structures
      connectedUsers.delete(socketId);
      userSessions.delete(socketId);
      
      const waitingIndex = waitingUsers.indexOf(socketId);
      if (waitingIndex > -1) {
        waitingUsers.splice(waitingIndex, 1);
      }
      
      const partnerId = activeConnections.get(socketId);
      if (partnerId) {
        activeConnections.delete(socketId);
        activeConnections.delete(partnerId);
        
        // Notify partner if still connected
        if (connectedUsers.has(partnerId)) {
          io.to(partnerId).emit("partnerDisconnected");
        }
      }
    }
  }
}, 60000); // Run every minute

io.on("connection", (socket) => {
  console.log(`🔗 User connected: ${socket.id}`);
  console.log(`   - Total users now: ${connectedUsers.size + 1}`);

  // Track user session
  const now = Date.now();
  userSessions.set(socket.id, {
    joinTime: now,
    lastActivity: now,
  });

  connectedUsers.set(socket.id, {
    id: socket.id,
    isPremium: false,
    genderFilter: "any",
    joinTime: now,
  });

  console.log(`✅ User ${socket.id} added to connected users`);

  // Update activity on any event
  const updateActivity = () => {
    const session = userSessions.get(socket.id);
    if (session) {
      session.lastActivity = Date.now();
    }
  };

  // Handle user profile updates
  socket.on("user:profile", (data) => {
    updateActivity();
    const user = connectedUsers.get(socket.id);
    if (user) {
      connectedUsers.set(socket.id, { ...user, ...data });
    }
  });

  // Handle matching logic
  socket.on("find:match", () => {
    updateActivity();
    console.log(`🔍 User ${socket.id} looking for match. Current state:`);
    console.log(`   - Waiting users: ${waitingUsers.length} [${waitingUsers.join(', ')}]`);
    console.log(`   - Active connections: ${activeConnections.size}`);
    console.log(`   - Total connected users: ${connectedUsers.size}`);

    // Don't add to waiting list if already waiting or already connected
    if (waitingUsers.includes(socket.id) || activeConnections.has(socket.id)) {
      console.log(`❌ User ${socket.id} already waiting or connected - skipping`);
      return;
    }

    // Clean up disconnected users from waiting list
    for (let i = waitingUsers.length - 1; i >= 0; i--) {
      if (!connectedUsers.has(waitingUsers[i])) {
        waitingUsers.splice(i, 1);
      }
    }

    if (waitingUsers.length > 0) {
      const partnerId = waitingUsers.shift();
      if (
        partnerId &&
        partnerId !== socket.id &&
        connectedUsers.has(partnerId)
      ) {
        // Match found
        activeConnections.set(socket.id, partnerId);
        activeConnections.set(partnerId, socket.id);

        console.log(`✅ Match found: ${socket.id} <-> ${partnerId}`);

        socket.emit("user:connect", partnerId);
        io.to(partnerId).emit("user:connect", socket.id);

        console.log(`📤 Sent user:connect events to both users`);
      } else {
        // Partner disconnected, add current user to waiting list
        waitingUsers.push(socket.id);
        console.log(
          `⚠️ Partner ${partnerId} not available, added ${socket.id} to waiting list`,
        );
      }
    } else {
      waitingUsers.push(socket.id);
      console.log(`⏳ Added ${socket.id} to waiting list (now ${waitingUsers.length} waiting)`);
    }
  });

  // Handle WebRTC signaling
  socket.on("offer", ({ offer, to }) => {
    updateActivity();
    if (connectedUsers.has(to)) {
      io.to(to).emit("offer", { offer, from: socket.id });
    }
  });

  socket.on("answer", ({ answer, to }) => {
    updateActivity();
    if (connectedUsers.has(to)) {
      io.to(to).emit("answer", { answer, from: socket.id });
    }
  });

  socket.on("ice-candidate", ({ candidate, to }) => {
    updateActivity();
    if (connectedUsers.has(to)) {
      io.to(to).emit("ice-candidate", { candidate, from: socket.id });
    }
  });

  // Handle peer negotiation
  socket.on("peer:nego:needed", ({ offer, targetChatToken }) => {
    updateActivity();
    if (connectedUsers.has(targetChatToken)) {
      io.to(targetChatToken).emit("peer:nego:needed", {
        offer,
        from: socket.id,
      });
    }
  });

  socket.on("peer:nego:done", ({ answer, to }) => {
    updateActivity();
    if (connectedUsers.has(to)) {
      io.to(to).emit("peer:nego:final", { answer, from: socket.id });
    }
  });

  // Handle messages
  socket.on(
    "send:message",
    ({ message, targetChatToken, isSecret, messageId }) => {
      updateActivity();
      
      // Basic message validation
      if (!message || typeof message !== 'string' || message.length > 1000) {
        console.warn(`Invalid message from ${socket.id}`);
        return;
      }
      
      if (connectedUsers.has(targetChatToken)) {
        io.to(targetChatToken).emit("message:recieved", {
          message,
          from: socket.id,
          isSecret: isSecret || false,
          messageId,
        });
      }
    },
  );

  // Handle premium status sharing
  socket.on("send:premium:status", ({ isPremium, targetChatToken }) => {
    updateActivity();
    if (connectedUsers.has(targetChatToken)) {
      io.to(targetChatToken).emit("partner:premium:status", { isPremium });
    }
  });

  // Handle stay connected requests
  socket.on("stay:connected:response", ({ wantToStay, targetChatToken }) => {
    updateActivity();
    if (connectedUsers.has(targetChatToken)) {
      io.to(targetChatToken).emit("stay:connected:response", {
        wantToStay,
        from: socket.id,
      });
    }
  });

  // Handle skip
  socket.on("skip", () => {
    updateActivity();
    const partnerId = activeConnections.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit("skipped");
      activeConnections.delete(socket.id);
      activeConnections.delete(partnerId);
    }

    // Remove from waiting list if present
    const index = waitingUsers.indexOf(socket.id);
    if (index > -1) {
      waitingUsers.splice(index, 1);
    }
  });

  // Handle ping for connection health
  socket.on("ping", () => {
    updateActivity();
    socket.emit("pong");
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);

    // Clean up active connections
    const partnerId = activeConnections.get(socket.id);
    if (partnerId) {
      console.log(`📤 Notifying partner ${partnerId} of disconnection`);
      io.to(partnerId).emit("partnerDisconnected");
      activeConnections.delete(partnerId);
    }
    activeConnections.delete(socket.id);

    connectedUsers.delete(socket.id);
    userSessions.delete(socket.id);

    // Remove from waiting list if present
    const index = waitingUsers.indexOf(socket.id);
    if (index > -1) {
      waitingUsers.splice(index, 1);
      console.log(`🗑️ Removed ${socket.id} from waiting list`);
    }

    console.log(`   - Total users now: ${connectedUsers.size}`);
    console.log(`   - Waiting users: ${waitingUsers.length}`);
    console.log(`   - Active connections: ${activeConnections.size}`);
  });
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit in production, just log
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Memory usage: ${JSON.stringify(process.memoryUsage())}`);
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy, trying port ${Number(PORT) + 1}`);
    server.listen(Number(PORT) + 1, () => {
      console.log(`Server running on port ${Number(PORT) + 1}`);
    });
  } else {
    console.error('Server error:', err);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
