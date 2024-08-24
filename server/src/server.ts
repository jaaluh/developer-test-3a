import { migrateToLatest } from './db/migrate';
import { insertSeedData } from './db/seedData';
import { app } from './app';

const port = 3131;

const run = async () => {
  await migrateToLatest();
  await insertSeedData();
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}

run();