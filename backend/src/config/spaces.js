import { S3Client } from '@aws-sdk/client-s3';

const spacesClient = new S3Client({
  region: 'fra1',
  endpoint: 'https://fra1.digitaloceanspaces.com',
  credentials: {
    accessKeyId: process.env.SPACES_ACCESS_KEY,
    secretAccessKey: process.env.SPACES_SECRET_KEY,
  },
});

export default spacesClient;
