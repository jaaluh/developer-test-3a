import { migrateToLatest } from './db/migrate';
import { app } from './server';

const port = 3131;

const run = async () => {
  await migrateToLatest();
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}

run();