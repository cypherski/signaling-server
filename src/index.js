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

const app = express();
const httpServer = createServer(app);
const logger = new Logger();

// Enable CORS
app.use(cors(config.cors));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const io = new Server(httpServer, {
  cors: config.cors,
  ...config.socket
});

// Initialize services
const sessionManager = new SessionManager();
const matchingService = new MatchingService(sessionManager, logger);
const signalingService = new SignalingService(io, logger);

// Set up socket handlers
io.on('connection', setupSocketHandlers(io, sessionManager, matchingService, signalingService, logger));

// Start cleanup interval
setInterval(() => {
  sessionManager.cleanupInactiveSessions(config.session.maxInactiveTime);
}, config.session.cleanupInterval);

// Start server
httpServer.listen(config.port, () => {
  logger.info(`Signaling server running on port ${config.port}`);
});