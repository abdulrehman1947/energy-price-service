import express from 'express';
import { syncFromApi, getPrices } from './energyService';
import { config } from './config';

const router = express.Router();

router.post('/energy/sync', async (req, res) => {
  try {
    const result = await syncFromApi(config.electricityApiUrl || undefined, config.gasApiUrl || undefined);
    // res.json(result);
    // send in response a summary string for easier logging in Java service
    const summary = `Processed ${result.processed} records (Inserted: ${result.inserted}, Updated: ${result.updated}, Skipped: ${result.skipped}) in ${result.executionTimeMs}ms`;
    console.log(summary);
    res.json(result);
  } catch (err) {
    console.error('manual sync failed', err);
    res.status(500).json({ processed: 0, inserted: 0, updated: 0, skipped: 0 });
  }
});

router.get('/energy/prices', async (req, res) => {
  const energyType = (req.query.energyType as string) || '';
  const startDate = (req.query.startDate as string) || undefined;
  const endDate = (req.query.endDate as string) || undefined;

  if ((!startDate && endDate) || (startDate && !endDate)) {
    return res.status(400).send('Provide both startDate and endDate or neither');
  }

  try {
    const rows = await getPrices(energyType, startDate, endDate);
    const out = rows.map(r => ({ date: r.price_date, category: r.category, value: r.value }));
    res.json(out);
  } catch (err) {
    console.error('failed to get prices', err);
    res.status(500).send('error');
  }
});

export default router;
