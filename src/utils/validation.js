export function validateWalletAddress(address) {
    if (!address || typeof address !== 'string') {
      return false;
    }
    // Basic Solana address validation (base58 string of correct length)
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  }
  
  export function validateSignalData(data) {
    if (!data || typeof data !== 'object') {
      return false;
    }
  
    // Validate signal object has required properties
    if (!data.signal || typeof data.signal !== 'object') {
      return false;
    }
  
    // Validate peer ID if present
    if (data.peer && typeof data.peer !== 'string') {
      return false;
    }
  
    return true;
  }
  
  export function validateSocketId(id) {
    return typeof id === 'string' && id.length > 0;
  }
  
  export function sanitizeSignalData(data) {
    // Only pass through allowed signal properties
    const { type, sdp, candidate, usernameFragment, sdpMLineIndex, sdpMid } = data.signal;
    return {
      signal: {
        type,
        sdp,
        candidate,
        usernameFragment,
        sdpMLineIndex, 
        sdpMid
      },
      peer: data.peer
    };
  }