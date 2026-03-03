import cron from 'node-cron';
import { syncFromApi } from './energyService';
import { config } from './config';

export function startScheduler() {
  const spec =  config.syncCron;
  cron.schedule(spec, async () => {
    console.log('Scheduled sync started');
    try {
      const res = await syncFromApi(config.electricityApiUrl || undefined, config.gasApiUrl || undefined);
      console.log('Scheduled sync finished', res);
    } catch (err) {
      console.error('Scheduled sync failed', err);
    }
  });
}
