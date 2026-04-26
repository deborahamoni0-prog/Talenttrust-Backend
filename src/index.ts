import express from 'express';
import dotenv from 'dotenv';
import { EventIngestionService, EventIngestionConfig } from './events/eventIngestionService';
import { InMemoryEventAuditRepository, EventAuditService } from './repository/eventAuditRepository';
import { ContractEvent } from './events/types';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Initialize services
const auditRepository = new InMemoryEventAuditRepository();
const auditService = new EventAuditService(auditRepository);

// Configuration
const config: EventIngestionConfig = {
  enableStrictValidation: process.env.ENABLE_STRICT_VALIDATION === 'true',
  enablePayloadIntegrityCheck: process.env.ENABLE_PAYLOAD_INTEGRITY_CHECK !== 'false',
  maxEventAgeMs: parseInt(process.env.MAX_EVENT_AGE_MS || '86400000'), // 24 hours default
  batchSize: parseInt(process.env.EVENT_BATCH_SIZE || '100')
};

const eventIngestionService = new EventIngestionService(auditService, config);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Event ingestion endpoint
app.post('/api/v1/events', async (req, res) => {
  try {
    const { events, contractType } = req.body;

    if (!events || !Array.isArray(events)) {
      return res.status(400).json({
        error: 'Invalid request: events array is required'
      });
    }

    if (!contractType || typeof contractType !== 'string') {
      return res.status(400).json({
        error: 'Invalid request: contractType is required'
      });
    }

    const results = await eventIngestionService.processBatch(events, contractType);

    res.json({
      processed: results.length,
      results,
      summary: {
        accepted: results.filter(r => r.status === 'accepted').length,
        rejected: results.filter(r => r.status === 'rejected').length,
        duplicates: results.filter(r => r.status === 'duplicate').length
      }
    });

  } catch (error) {
    console.error('Error processing events:', error);
    res.status(500).json({
      error: 'Internal server error during event processing'
    });
  }
});

// Single event validation endpoint (dry run)
app.post('/api/v1/events/validate', async (req, res) => {
  try {
    const { event, contractType } = req.body;

    if (!event || !contractType) {
      return res.status(400).json({
        error: 'Invalid request: event and contractType are required'
      });
    }

    const validationResult = eventIngestionService.validateEvent(event, contractType);

    res.json({
      isValid: validationResult.isValid,
      errors: validationResult.errors
    });

  } catch (error) {
    console.error('Error validating event:', error);
    res.status(500).json({
      error: 'Internal server error during event validation'
    });
  }
});

// Statistics endpoint
app.get('/api/v1/stats', async (req, res) => {
  try {
    const stats = await eventIngestionService.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      error: 'Internal server error fetching statistics'
    });
  }
});

// Contract history endpoint
app.get('/api/v1/contracts/:contractId/history', async (req, res) => {
  try {
    const { contractId } = req.params;
    const history = await eventIngestionService.getContractHistory(contractId);
    res.json(history);
  } catch (error) {
    console.error('Error fetching contract history:', error);
    res.status(500).json({
      error: 'Internal server error fetching contract history'
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Talenttrust Backend API running on port ${PORT}`);
  console.log(`Configuration: ${JSON.stringify(config, null, 2)}`);
});

export default app;
