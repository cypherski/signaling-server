import 'dotenv/config';

const getAllowedOrigins = () => {
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(',');
  }
  return process.env.NODE_ENV === 'production'
    ? ['https://solmates.club', 'https://www.solmates.club']
    : ['http://localhost:5173'];
};

export const config = {
  port: process.env.PORT || 10000,
  env: process.env.NODE_ENV || 'development',
  cors: {
    origin: getAllowedOrigins(),
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  socket: {
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket'],
    maxHttpBufferSize: 1e6 // 1 MB
  },
  session: {
    cleanupInterval: 5 * 60 * 1000, // 5 minutes
    maxInactiveTime: 5 * 60 * 1000  // 5 minutes
  }
};