import cron from 'node-cron';
import { syncFromApi } from './energyService';
import { config } from './config';

// Wrapper function to add timeout protection
async function syncWithTimeout(timeoutMs: number = 300000): Promise<any> {
  return Promise.race([
    syncFromApi(config.electricityApiUrl || undefined, config.gasApiUrl || undefined),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Sync operation timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

export function startScheduler() {
  const spec = config.syncCron;
  cron.schedule(spec, async () => {
    const syncStartTime = new Date().toISOString();
    console.log(`[${syncStartTime}] Scheduled sync started`);
    try {
      const res = await syncWithTimeout();
      console.log(`Scheduled sync finished:`, res);
    } catch (err) {
      console.error('Scheduled sync failed:', err instanceof Error ? err.message : String(err));
    }
  });
  console.log(`Scheduler started with cron spec: ${spec}`);
}
