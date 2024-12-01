# SolMates Signaling Server

WebSocket signaling server for SolMates video chat application.

## Features

- Real-time WebSocket communication using Socket.IO
- Secure peer matching system
- Session management and cleanup
- Health monitoring
- Production-ready CORS and security settings

## Prerequisites

- Node.js >= 20
- npm >= 9

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd signaling-server
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```
PORT=10000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,https://solmates.club
```

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

## API Documentation

### WebSocket Events

#### `connection`
Fired when a client connects to the server.

#### `ready`
Client signals they are ready to be matched.
- Payload: `{ walletAddress: string }`

#### `matched`
Server notifies clients they have been matched.
- Payload: `{ peer: string, initiator: boolean }`

#### `signal`
WebRTC signaling data exchange.
- Payload: `{ signal: Object, peer: string }`

#### `disconnect`
Fired when a client disconnects.

### HTTP Endpoints

#### GET /health
Health check endpoint.
- Response: `{ status: string, timestamp: string, uptime: number }`

## Deployment

The server is configured for deployment on Render.com using the provided `render.yaml` configuration.

### Environment Variables

- `NODE_VERSION`: Set to 20
- `NODE_ENV`: Set to "production"
- `PORT`: Server port (default: 10000)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins

## Security

- CORS protection
- Input validation
- Rate limiting
- Session cleanup
- Secure WebSocket configuration

## Architecture

```
src/
├── config/         # Configuration
├── handlers/       # Socket event handlers
├── services/       # Core services
├── utils/         # Utilities
└── index.js       # Entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT#   s i g n a l i n g - s e r v e r  
 