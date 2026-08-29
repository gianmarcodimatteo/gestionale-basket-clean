import { PutObjectCommand } from '@aws-sdk/client-s3';
import spacesClient from '../config/spaces.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const BUCKET_NAME = 'geas-basket-storage';

export const uploadToSpaces = async (file, folder) => {
  try {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${folder}/${uuidv4()}-${Date.now()}${fileExtension}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'private',
    };

    await spacesClient.send(new PutObjectCommand(params));

    const fileUrl = `https://${BUCKET_NAME}.fra1.digitaloceanspaces.com/${fileName}`;
    return fileUrl;
  } catch (error) {
    console.error('Error uploading to Spaces:', error);
    throw new Error('Failed to upload file to Spaces');
  }
};
