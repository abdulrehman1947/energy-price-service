import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  mysql: {
    host: process.env.MYSQL_HOST ,
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
    user: process.env.MYSQL_USER ,
    password: process.env.MYSQL_PASSWORD ,
    database: process.env.MYSQL_DATABASE 
  },
  electricityApiUrl: process.env.ELECTRICITY_API_URL || '',
  gasApiUrl: process.env.GAS_API_URL || '',
  // Cron spec: default every 5 minutes
  syncCron: process.env.SYNC_CRON || '*/5 * * * *'
};
