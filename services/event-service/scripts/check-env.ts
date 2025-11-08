import 'dotenv/config';
import { env } from '../src/config/env.js';

console.log('🔍 Checking environment variables...\n');
console.log('PORT:', env.PORT);
console.log('DATABASE_URL:', env.DATABASE_URL ? '✅ Set' : '❌ Not set');
console.log('USER_SERVICE_URL:', env.USER_SERVICE_URL || '❌ Not set');
console.log('SKIP_USER_VALIDATION:', env.SKIP_USER_VALIDATION);
console.log('\n📋 Raw process.env.USER_SERVICE_URL:', process.env.USER_SERVICE_URL || 'undefined');

if (!env.USER_SERVICE_URL) {
  console.error('\n❌ USER_SERVICE_URL is not configured!');
  console.log('\n💡 Please check:');
  console.log('1. .env file exists in services/event-service/.env');
  console.log('2. USER_SERVICE_URL=http://localhost:3002 is in .env');
  console.log('3. Restart the service after adding the variable');
  process.exit(1);
} else {
  console.log('\n✅ All environment variables are configured correctly!');
}

