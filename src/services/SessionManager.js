import { v4 as uuidv4 } from 'uuid';

export class SessionManager {
  constructor() {
    this.waitingUsers = new Map(); // walletAddress -> { socket, joinedAt }
    this.connectedPairs = new Map(); // socketId -> { peerId, walletAddress }
    this.userSessions = new Map(); // socketId -> { walletAddress, sessionId }
  }

  createSession(socketId, walletAddress) {
    const sessionId = uuidv4();
    this.userSessions.set(socketId, { walletAddress, sessionId });
    return sessionId;
  }

  addWaitingUser(walletAddress, socket) {
    this.waitingUsers.set(walletAddress, {
      socket,
      joinedAt: Date.now()
    });
  }

  getWaitingUser(excludeWallet) {
    return Array.from(this.waitingUsers.entries())
      .find(([addr]) => addr !== excludeWallet);
  }

  removeWaitingUser(walletAddress) {
    this.waitingUsers.delete(walletAddress);
  }

  createPeerConnection(socket1Id, socket2Id, wallet1, wallet2) {
    this.connectedPairs.set(socket1Id, { peerId: socket2Id, walletAddress: wallet2 });
    this.connectedPairs.set(socket2Id, { peerId: socket1Id, walletAddress: wallet1 });
  }

  getPeerConnection(socketId) {
    return this.connectedPairs.get(socketId);
  }

  cleanupSession(socketId) {
    const session = this.userSessions.get(socketId);
    if (session) {
      this.waitingUsers.delete(session.walletAddress);
      this.userSessions.delete(socketId);
    }

    const peerConnection = this.connectedPairs.get(socketId);
    if (peerConnection) {
      this.connectedPairs.delete(socketId);
      this.connectedPairs.delete(peerConnection.peerId);
    }

    return { session, peerConnection };
  }

  cleanupInactiveSessions(maxInactiveTime) {
    const now = Date.now();
    for (const [walletAddress, data] of this.waitingUsers.entries()) {
      if (now - data.joinedAt > maxInactiveTime) {
        this.waitingUsers.delete(walletAddress);
      }
    }
  }
}