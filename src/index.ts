import express from 'express';
import bodyParser from 'body-parser';
import router from './routes';
import { config } from './config';
import pool from './db';
import { startScheduler } from './scheduler';

const app = express();
app.use(bodyParser.json());
app.use('/', router);

async function start() {
  try {
    // test DB
    await pool.getConnection();
    console.log('Connected to MySQL');
  } catch (err) {
    console.error('Failed to connect to MySQL', err);
  }

  app.listen(config.port, () => {
    console.log(`Energy service listening on ${config.port}`);
  });

  startScheduler();
}

start();
