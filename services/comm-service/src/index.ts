import 'dotenv/config';

import { env } from './config/env.js';
import { createApp } from './server/app.js';

async function bootstrap() {
  try {
    const app = await createApp();

    app.listen(env.PORT, () => {
      console.log(`Communication Service is running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Communication Service', error);
    process.exit(1);
  }
}

void bootstrap();
