import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = createServer(app);
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
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AjnabiCam Server is running!");
});

// Store connected users
const connectedUsers = new Map();
const waitingUsers: string[] = [];
const activeConnections = new Map(); // Track active peer connections

io.on("connection", (socket) => {
  console.log(`🔗 User connected: ${socket.id}`);
  console.log(`   - Total users now: ${connectedUsers.size + 1}`);

  connectedUsers.set(socket.id, {
    id: socket.id,
    isPremium: false,
    genderFilter: "any",
  });

  console.log(`✅ User ${socket.id} added to connected users`);

  // Handle user profile updates
  socket.on("user:profile", (data) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      connectedUsers.set(socket.id, { ...user, ...data });
    }
  });

  // Handle matching logic
  socket.on("find:match", () => {
    console.log(`🔍 User ${socket.id} looking for match. Current state:`);
    console.log(`   - Waiting users: ${waitingUsers.length} [${waitingUsers.join(', ')}]`);
    console.log(`   - Active connections: ${activeConnections.size}`);
    console.log(`   - Total connected users: ${connectedUsers.size}`);

    // Don't add to waiting list if already waiting or already connected
    if (waitingUsers.includes(socket.id) || activeConnections.has(socket.id)) {
      console.log(`❌ User ${socket.id} already waiting or connected - skipping`);
      return;
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
    if (connectedUsers.has(to)) {
      io.to(to).emit("offer", { offer, from: socket.id });
    }
  });

  socket.on("answer", ({ answer, to }) => {
    if (connectedUsers.has(to)) {
      io.to(to).emit("answer", { answer, from: socket.id });
    }
  });

  socket.on("ice-candidate", ({ candidate, to }) => {
    if (connectedUsers.has(to)) {
      io.to(to).emit("ice-candidate", { candidate, from: socket.id });
    }
  });

  // Handle peer negotiation
  socket.on("peer:nego:needed", ({ offer, targetChatToken }) => {
    if (connectedUsers.has(targetChatToken)) {
      io.to(targetChatToken).emit("peer:nego:needed", {
        offer,
        from: socket.id,
      });
    }
  });

  socket.on("peer:nego:done", ({ answer, to }) => {
    if (connectedUsers.has(to)) {
      io.to(to).emit("peer:nego:final", { answer, from: socket.id });
    }
  });

  // Handle messages
  socket.on(
    "send:message",
    ({ message, targetChatToken, isSecret, messageId }) => {
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
    if (connectedUsers.has(targetChatToken)) {
      io.to(targetChatToken).emit("partner:premium:status", { isPremium });
    }
  });

  // Handle stay connected requests
  socket.on("stay:connected:response", ({ wantToStay, targetChatToken }) => {
    if (connectedUsers.has(targetChatToken)) {
      io.to(targetChatToken).emit("stay:connected:response", {
        wantToStay,
        from: socket.id,
      });
    }
  });

  // Handle skip
  socket.on("skip", () => {
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

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Clean up active connections
    const partnerId = activeConnections.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit("partnerDisconnected");
      activeConnections.delete(partnerId);
    }
    activeConnections.delete(socket.id);

    connectedUsers.delete(socket.id);

    // Remove from waiting list if present
    const index = waitingUsers.indexOf(socket.id);
    if (index > -1) {
      waitingUsers.splice(index, 1);
    }
  });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
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
