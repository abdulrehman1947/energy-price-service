import axios from 'axios';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { upsertPrice } from './db';

dayjs.extend(customParseFormat);

export type SyncResult = {
  processed: number;
  inserted: number;
  updated: number;
  skipped: number;
  executionTimeMs?: number;
};

function parseDotDate(s: string) {
  return dayjs(s, 'DD.MM.YYYY');
}

async function processEnergyCharts(url: string, energyType: string): Promise<SyncResult> {
  const res: SyncResult = { processed: 0, inserted: 0, updated: 0, skipped: 0 };
  const operationStartTime = Date.now();
  try {
    console.log(`[${energyType}] Fetching data from ${url}`);
    const r = await axios.get(url, { timeout: 20000 });
    console.log(`[${energyType}] Data fetched successfully, parsing...`);
    if (!r.data || !Array.isArray(r.data)) return res;

    const root = r.data;

    // try to find global xAxisValues on root[0]
    let globalX: string[] | null = null;
    if (root.length > 0 && root[0] && Array.isArray(root[0].xAxisValues)) {
      globalX = root[0].xAxisValues.slice();
    }

    for (const series of root) {
      if (!series || typeof series !== 'object') continue;
      const category = series.name || null;
      const data = Array.isArray(series.data) ? series.data : null;
      let xAxis = Array.isArray(series.xAxisValues) ? series.xAxisValues : null;
      if ((!xAxis || xAxis.length === 0) && globalX) xAxis = globalX;
      if (!data) continue;

      for (let i = 0; i < data.length; i++) {
        const v = data[i];
        if (v === null || v === undefined) {
          res.skipped++;
          continue;
        }
        let dateStr: string | null = null;
        if (xAxis && i < xAxis.length) {
          dateStr = xAxis[i];
        }
        if (!dateStr || dateStr.trim() === '') {
          res.skipped++;
          continue;
        }
        const d = parseDotDate(dateStr);
        if (!d.isValid()) {
          res.skipped++;
          continue;
        }
        const isoDate = d.format('YYYY-MM-DD');
        // value might be number or string
        const num = typeof v === 'number' ? v : Number(v);
        if (Number.isNaN(num)) {
          res.skipped++;
          continue;
        }

        // Upsert into DB
        await upsertPrice(energyType, isoDate, category || 'default', num);
        // we don't know whether it was insert or update easily; increment processed
        res.processed++;
        res.inserted++; // simplest: count all as inserted (consumer expects totals)
      }
    }
    console.log(`[${energyType}] Processing completed in ${Date.now() - operationStartTime}ms`);
  } catch (err) {
    console.error(`[${energyType}] Failed to fetch/process ${url} after ${Date.now() - operationStartTime}ms:`, err);
  }
  return res;
}

export async function syncFromApi(electricityUrl?: string, gasUrl?: string): Promise<SyncResult> {
  const start = Date.now();
  let inserted = 0, updated = 0, skipped = 0, processed = 0;

  try {
    if (electricityUrl) {
      const r = await processEnergyCharts(electricityUrl, 'ELECTRICITY');
      inserted += r.inserted;
      updated += r.updated;
      skipped += r.skipped;
      processed += r.processed;
    }

    if (gasUrl) {
      const r = await processEnergyCharts(gasUrl, 'GAS');
      inserted += r.inserted;
      updated += r.updated;
      skipped += r.skipped;
      processed += r.processed;
    }
  } catch (err) {
    console.error('syncFromApi encountered error:', err);
  }

  const duration = Date.now() - start;
  console.log(`syncFromApi completed in ${duration}ms: processed=${processed}, inserted=${inserted}, updated=${updated}, skipped=${skipped}`);
  return { processed, inserted, updated, skipped, executionTimeMs: duration };
}

export async function getPrices(energyType: string, startDate?: string, endDate?: string) {
  const params: any[] = [energyType];
  let sql = `SELECT price_date, category, value FROM energy_market_prices WHERE energy_type = ?`;
  if (startDate && endDate) {
    sql += ` AND price_date BETWEEN ? AND ?`;
    params.push(startDate, endDate);
  }
  sql += ` ORDER BY price_date ASC`;
  const rows = await (await import('./db')).query(sql, params);
  return rows as Array<{ price_date: string; category: string; value: number | null }>;
}
