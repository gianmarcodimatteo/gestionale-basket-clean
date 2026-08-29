import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getDailyReport(req, res) {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Date parameter required' });
    }

    // Parse date and create date range for the day
    const reportDate = new Date(date);
    reportDate.setUTCHours(0, 0, 0, 0);
    const nextDay = new Date(reportDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const report = await prisma.dailyReport.findFirst({
      where: {
        date: {
          gte: reportDate,
          lt: nextDay,
        },
      },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ data: report });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function saveDailyReport(req, res) {
  try {
    const { date, coaching, strength, medical } = req.body;
    console.log('💾 saveDailyReport received:', { date, coaching, strength, medical });
    console.log('👤 User from token:', req.user);

    if (!date) {
      return res.status(400).json({ error: 'Date parameter required' });
    }

    // Parse date
    const reportDate = new Date(date);
    reportDate.setUTCHours(0, 0, 0, 0);
    const nextDay = new Date(reportDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const data = {
      coaching: coaching || { pre: '', post: '' },
      strength: strength || { pre: '', post: '' },
      medical: medical || { pre: '', post: '' },
      updatedBy: req.user?.id,
    };

    // Find existing report for this date
    const existingReport = await prisma.dailyReport.findFirst({
      where: {
        date: {
          gte: reportDate,
          lt: nextDay,
        },
      },
    });

    // Update or create
    let result;
    if (existingReport) {
      result = await prisma.dailyReport.update({
        where: { id: existingReport.id },
        data,
      });
      console.log('✅ Daily report updated successfully');
    } else {
      result = await prisma.dailyReport.create({
        data: {
          ...data,
          date: reportDate,
        },
      });
      console.log('✅ Daily report created successfully');
    }

    res.status(201).json({ data: result });
  } catch (error) {
    console.error('❌ Error saving daily report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
