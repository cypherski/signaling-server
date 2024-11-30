import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from './config/index.js';
import { Logger } from './utils/logger.js';
import { SessionManager } from './services/SessionManager.js';
import { MatchingService } from './services/MatchingService.js';
import { SignalingService } from './services/SignalingService.js';
import { setupSocketHandlers } from './handlers/socketHandlers.js';

// Initialize Express app and create HTTP server
const app = express();
const httpServer = createServer(app);
const logger = new Logger();

// Set up CORS middleware
app.use(cors(config.cors));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Initialize Socket.IO with CORS configuration
const io = new Server(httpServer, {
  cors: config.cors,
  ...config.socket
});

// Initialize services
const sessionManager = new SessionManager();
const matchingService = new MatchingService(sessionManager, logger);
const signalingService = new SignalingService(io, logger);

// Maps to store waiting users and connected pairs
const waitingUsers = new Map();
const connectedPairs = new Map();

// Socket connection handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle ready event when user wants to be matched
  socket.on('ready', (data) => {
    try {
      if (!data?.walletAddress) {
        console.error('Invalid ready event - missing wallet address');
        socket.emit('error', { message: 'Invalid wallet address' });
        return;
      }

      console.log(`User ${data.walletAddress} is ready for matching`);

      // Don't add if already waiting
      if (waitingUsers.has(data.walletAddress)) {
        console.log(`User ${data.walletAddress} already waiting`);
        return;
      }

      // Find a match if there are waiting users
      const waitingUser = Array.from(waitingUsers.entries()).find(([addr]) => addr !== data.walletAddress);
      
      if (waitingUser) {
        const [peerAddress, peerData] = waitingUser;
        const peerSocket = peerData.socket;
        waitingUsers.delete(peerAddress);
        
        // Set up the peer connection
        connectedPairs.set(socket.id, { peerId: peerSocket.id, walletAddress: peerAddress });
        connectedPairs.set(peerSocket.id, { peerId: socket.id, walletAddress: data.walletAddress });
        
        console.log(`Matched users: ${data.walletAddress} <-> ${peerAddress}`);
        
        // Notify both peers
        socket.emit('matched', { peer: peerSocket.id, initiator: true });
        peerSocket.emit('matched', { peer: socket.id, initiator: false });
      } else {
        // Add to waiting list if no match found
        waitingUsers.set(data.walletAddress, {
          socket,
          timestamp: Date.now()
        });
        console.log(`Added to waiting list: ${data.walletAddress}`);
      }
    } catch (error) {
      console.error('Error in ready handler:', error);
      socket.emit('error', { message: 'Failed to process ready signal' });
    }
  });

  // Handle WebRTC signaling
  socket.on('signal', (data) => {
    try {
      const peerConnection = connectedPairs.get(socket.id);
      if (peerConnection) {
        const peerSocket = io.sockets.sockets.get(peerConnection.peerId);
        if (peerSocket) {
          console.log(`Forwarding signal from ${socket.id} to ${peerConnection.peerId}`);
          peerSocket.emit('signal', { signal: data.signal });
        }
      }
    } catch (error) {
      console.error('Error in signal handler:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    try {
      // Clean up connected pairs
      const peerConnection = connectedPairs.get(socket.id);
      if (peerConnection) {
        const peerSocket = io.sockets.sockets.get(peerConnection.peerId);
        if (peerSocket) {
          peerSocket.emit('peerDisconnected');
        }
        connectedPairs.delete(socket.id);
        connectedPairs.delete(peerConnection.peerId);
      }

      // Clean up waiting users
      for (const [address, data] of waitingUsers.entries()) {
        if (data.socket.id === socket.id) {
          waitingUsers.delete(address);
          break;
        }
      }

      console.log('User disconnected:', socket.id);
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
});

// Start cleanup interval for inactive sessions
setInterval(() => {
  sessionManager.cleanupInactiveSessions(config.session.maxInactiveTime);
}, config.session.cleanupInterval);

// Start server
httpServer.listen(config.port, () => {
  logger.info(`Signaling server running on port ${config.port}`);
});

export default app;