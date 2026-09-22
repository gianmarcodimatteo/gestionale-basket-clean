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

    // Set longer timeout for streaming (60 minutes)
    req.setTimeout(3600000);
    res.setTimeout(3600000);

    res.setHeader('Content-Type', response.ContentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileId}"`);
    res.setHeader('Content-Length', response.ContentLength);
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Keep-Alive', 'timeout=300, max=1000');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    response.Body.pipe(res);

    response.Body.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Stream error' });
      }
    });

    res.on('error', (error) => {
      console.error('Response error:', error);
    });
  } catch (error) {
    console.error('Error streaming file:', error);
    if (!res.headersSent) {
      res.status(404).json({ error: 'File not found' });
    }
  }
};
