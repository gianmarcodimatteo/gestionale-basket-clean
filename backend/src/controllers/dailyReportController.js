import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const reportsDir = path.join(__dirname, '../../reports');

// Ensure reports directory exists
async function ensureReportsDir() {
  try {
    await fs.mkdir(reportsDir, { recursive: true });
  } catch (err) {
    // Directory might already exist
  }
}

const getReportPath = (date) => {
  const dateStr = typeof date === 'string' ? date : new Date(date).toISOString().split('T')[0];
  return path.join(reportsDir, `${dateStr}.json`);
};

export async function getDailyReport(req, res) {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Date parameter required' });
    }

    const reportPath = getReportPath(date);

    try {
      const content = await fs.readFile(reportPath, 'utf-8');
      const data = JSON.parse(content);
      res.json({ data });
    } catch (err) {
      if (err.code === 'ENOENT') {
        res.status(404).json({ error: 'Report not found' });
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function saveDailyReport(req, res) {
  try {
    await ensureReportsDir();

    const { date, coaching, strength, medical } = req.body;
    console.log('💾 saveDailyReport received:', { date, coaching, strength, medical });
    console.log('👤 User from token:', req.user);

    if (!date) {
      return res.status(400).json({ error: 'Date parameter required' });
    }

    const reportPath = getReportPath(date);
    const data = {
      date,
      coaching: coaching || { pre: '', post: '' },
      strength: strength || { pre: '', post: '' },
      medical: medical || { pre: '', post: '' },
      updatedAt: new Date().toISOString(),
      updatedBy: req.user?.id,
    };

    console.log('📝 Saving to file:', reportPath);
    await fs.writeFile(reportPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log('✅ Daily report saved successfully');
    res.status(201).json({ data });
  } catch (error) {
    console.error('❌ Error saving daily report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
