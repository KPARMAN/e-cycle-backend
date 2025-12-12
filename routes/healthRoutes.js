import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packagePath = path.join(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

const router = express.Router();

const dbStateMap = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

router.get('/', (req, res) => {
  const uptime = process.uptime();
  const timestamp = new Date().toISOString();
  const dbState = mongoose.connection && mongoose.connection.readyState !== undefined
    ? dbStateMap[mongoose.connection.readyState] || 'unknown'
    : 'unknown';

  res.json({
    status: 'ok',
    uptime_seconds: Math.floor(uptime),
    timestamp,
    version: pkg?.version || 'unknown',
    env: process.env.NODE_ENV || 'development',
    database: dbState
  });
});

export default router;
