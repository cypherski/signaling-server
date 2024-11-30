export function setupSocketHandlers(io, sessionManager, matchingService, signalingService, logger) {
    return (socket) => {
      const sessionId = sessionManager.createSession(socket.id);
      logger.info(`Client connected: ${socket.id} (Session: ${sessionId})`);
  
      socket.on('ready', (data) => {
        try {
          if (!data?.walletAddress) {
            socket.emit('error', { message: 'Invalid wallet address' });
            return;
          }
  
          const match = matchingService.findMatch(socket, data.walletAddress);
          
          if (match) {
            socket.emit('matched', { peer: match.peer.id, initiator: true });
            match.peer.emit('matched', { peer: socket.id, initiator: false });
          }
        } catch (error) {
          logger.error('Error in ready handler:', error);
          socket.emit('error', { message: 'Failed to process ready signal' });
        }
      });
  
      socket.on('signal', (data) => {
        try {
          const { signal, peer } = data;
          if (!peer || !signal) return;
          signalingService.forwardSignal(socket, peer, signal);
        } catch (error) {
          logger.error('Error in signal handler:', error);
        }
      });
  
      socket.on('disconnect', () => {
        try {
          logger.info(`Client disconnected: ${socket.id}`);
          
          const { peerConnection } = sessionManager.cleanupSession(socket.id);
          
          if (peerConnection) {
            signalingService.notifyPeerLeft(socket.id, peerConnection.peerId);
          }
        } catch (error) {
          logger.error('Error in disconnect handler:', error);
        }
      });
    };
  }