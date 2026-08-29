import { GetObjectCommand } from '@aws-sdk/client-s3';
import jwt from 'jsonwebtoken';
import spacesClient from '../config/spaces.js';

const BUCKET_NAME = 'geas-basket-storage';

export const getFileStream = async (req, res) => {
  try {
    const { folder, fileId } = req.params;
    let token = req.headers.authorization?.split(' ')[1] || req.query.token;

    if (!token) {
      return res.status(401).json({ error: 'Token not provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error('Token verification error:', err);
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
    });

    if (!folder || !fileId) {
      return res.status(400).json({ error: 'Missing folder or fileId' });
    }

    const fileName = `${folder}/${fileId}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
    };

    const command = new GetObjectCommand(params);
    const response = await spacesClient.send(command);

    res.setHeader('Content-Type', response.ContentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileId}"`);

    response.Body.pipe(res);
  } catch (error) {
    console.error('Error streaming file:', error);
    res.status(404).json({ error: 'File not found' });
  }
};
