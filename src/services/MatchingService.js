import { v4 as uuidv4 } from 'uuid';

export class MatchingService {
  constructor(sessionManager, logger) {
    this.sessionManager = sessionManager;
    this.logger = logger;
  }

  findMatch(socket, walletAddress) {
    if (this.sessionManager.waitingUsers.has(walletAddress)) {
      this.logger.info(`User ${walletAddress} already waiting`);
      return null;
    }

    const waitingUser = this.sessionManager.getWaitingUser(walletAddress);
    
    if (waitingUser) {
      const [peerAddress, peerData] = waitingUser;
      const peerSocket = peerData.socket;
      
      this.sessionManager.removeWaitingUser(peerAddress);
      this.sessionManager.createPeerConnection(socket.id, peerSocket.id, walletAddress, peerAddress);

      this.logger.info(`Matched: ${walletAddress} <-> ${peerAddress}`);
      
      return {
        peer: peerSocket,
        peerAddress
      };
    }

    this.sessionManager.addWaitingUser(walletAddress, socket);
    this.logger.info(`Added to waiting list: ${walletAddress}`);
    return null;
  }
}