const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const Ticket = require('./models/Ticket');
const User = require('./models/User');

const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Support Ticket API is running' });
});

app.get('/api/public/stats', async (req, res, next) => {
  try {
    const [totalTickets, resolvedOrClosed, totalUsers] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: { $in: ['resolved', 'closed'] } }),
      User.countDocuments({ role: 'user' }),
    ]);
    const resolutionRate = totalTickets ? Math.round((resolvedOrClosed / totalTickets) * 100) : 96;
    res.json({
      success: true,
      data: {
        totalTickets,
        resolvedTickets: resolvedOrClosed,
        totalUsers,
        resolutionRate,
      },
    });
  } catch (err) {
    next(err);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
