export class SignalingService {
    constructor(io, logger) {
      this.io = io;
      this.logger = logger;
    }
  
    forwardSignal(fromSocket, toSocketId, signal) {
      const peerSocket = this.io.sockets.sockets.get(toSocketId);
      if (peerSocket) {
        this.logger.info(`Signal: ${fromSocket.id} -> ${toSocketId} (${signal.type})`);
        peerSocket.emit('signal', { signal });
        return true;
      }
      return false;
    }
  
    notifyPeerLeft(socketId, peerId) {
      const peerSocket = this.io.sockets.sockets.get(peerId);
      if (peerSocket) {
        this.logger.info(`Notifying peer ${peerId} of disconnect from ${socketId}`);
        peerSocket.emit('peer-left');
        return true;
      }
      return false;
    }
  }