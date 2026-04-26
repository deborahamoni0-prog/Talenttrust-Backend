# Talenttrust Backend

Backend service for Talenttrust platform with idempotent contract event ingestion pipeline.

## Features

- **Idempotent Event Processing**: Guaranteed safe event replay with deduplication
- **Strict Schema Validation**: Contract-specific payload validation
- **Audit Trail**: Complete processing history and statistics
- **High Performance**: Batch processing with configurable parallelism
- **Security**: Payload integrity verification and comprehensive validation

## Quick Start

### Installation

```bash
npm install
```

### Configuration

Copy environment template:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```bash
PORT=3000
NODE_ENV=development
ENABLE_STRICT_VALIDATION=true
ENABLE_PAYLOAD_INTEGRITY_CHECK=true
MAX_EVENT_AGE_MS=86400000
EVENT_BATCH_SIZE=100
```

### Running the Application

Development:
```bash
npm run dev
```

Production:
```bash
npm run build
npm start
```

### Testing

```bash
npm run test:ci    # Full test suite with coverage
npm run test:watch  # Watch mode during development
```

## API Documentation

See [Event Ingestion Documentation](docs/EVENT_INGESTION_IDEMPOTENCY.md) for detailed API specifications and event schemas.

### Key Endpoints

- `POST /api/v1/events` - Process events with idempotency guarantees
- `POST /api/v1/events/validate` - Validate events without processing
- `GET /api/v1/stats` - Processing statistics
- `GET /api/v1/contracts/{contractId}/history` - Contract event history
- `GET /health` - Service health check

## Architecture

The system implements a robust event ingestion pipeline with:

1. **Event Validation Layer** - Schema validation and structure verification
2. **Deduplication Manager** - Stable key computation and integrity checks
3. **Audit Repository** - Persistent storage of processing outcomes
4. **Ingestion Service** - Orchestration with idempotency guarantees

## Idempotency

Events are identified using the deduplication key format: `contractId:eventId:sequence`

This ensures:
- Safe event replay scenarios
- Prevention of duplicate processing
- Maintained sequence ordering
- Complete auditability

## Supported Contract Types

- **Talent Contracts**: Profile lifecycle events
- **Payment Contracts**: Transaction processing events
- **Review Contracts**: Rating and feedback events

## Development

### Project Structure

```
src/
├── events/           # Event processing services
├── validation/       # Schema validation
├── repository/       # Data persistence layer
├── utils/           # Utility functions
└── index.ts         # Application entry point

tests/
├── unit/            # Unit tests
├── integration/     # API integration tests
└── utils/           # Utility function tests
```

### Code Quality

```bash
npm run lint         # ESLint checking
npm run lint:fix     # Auto-fix linting issues
```

## License

MIT License - see LICENSE file for details.
