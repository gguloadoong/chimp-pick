import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

const profilesSampleRate = 0.0;

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? 'development',
  integrations: profilesSampleRate > 0 ? [nodeProfilingIntegration()] : [],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.0,
  profilesSampleRate,
  enabled: process.env.NODE_ENV === 'production',
});
