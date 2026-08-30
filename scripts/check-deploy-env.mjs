import nextEnv from '@next/env';

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const errors = [];
const required = [
  'MONGODB_URI',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'NEXT_PUBLIC_WHATSAPP_NUMBER',
  'NEXT_PUBLIC_SITE_URL',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'JWT_SECRET',
];

for (const name of required) {
  if (!process.env[name]?.trim()) errors.push(`${name} is required.`);
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
if (siteUrl && (!siteUrl.startsWith('https://') || /localhost|127\.0\.0\.1/i.test(siteUrl))) {
  errors.push('NEXT_PUBLIC_SITE_URL must be the deployed HTTPS origin, not localhost.');
}

if ((process.env.JWT_SECRET || '').length < 32) {
  errors.push('JWT_SECRET must contain at least 32 characters.');
}

if (!/^\d{8,15}$/.test(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '')) {
  errors.push('NEXT_PUBLIC_WHATSAPP_NUMBER must contain 8–15 digits including country code.');
}

if (errors.length) {
  console.error('Deployment environment check failed:\n');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Deployment environment check passed.');
