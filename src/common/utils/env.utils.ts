export function getEnv() {
  const ENV = process.env.NODE_ENV ?? 'dev';
  return ENV;
}

export function isDevEnv() {
  return getEnv().toLowerCase() === 'dev';
}
