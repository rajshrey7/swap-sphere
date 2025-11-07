/**
 * Matching Engine Microservice
 * Perfect Match Engine - Intelligent skill-matching service
 */

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import matchingRouter from './routes/matching.route.js';
import userRouter from './routes/user.route.js';
import { semanticService } from './services/semantic.service.js';

const port = process.env.MATCHING_ENGINE_PORT || 8081;

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'matching-engine',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/matching', matchingRouter);
app.use('/api/users', userRouter);

// Initialize semantic service on startup
async function initialize() {
  try {
    console.log('Initializing Matching Engine...');
    await semanticService.initialize();
    console.log('Matching Engine initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Matching Engine:', error);
    process.exit(1);
  }
}

// Start server
async function start() {
  await initialize();
  
  app.listen(port, () => {
    console.log(`----- Matching Engine Running on port ${port} -----`);
    console.log(`Health check: http://localhost:${port}/health`);
    console.log(`API endpoints:`);
    console.log(`  POST /api/matching/find - Find matches for a user`);
    console.log(`  POST /api/matching/score - Calculate match score between two users`);
    console.log(`  POST /api/users - Create/update user profile`);
    console.log(`  GET /api/users/:id - Get user by ID`);
    console.log(`  GET /api/users - Get all users`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

