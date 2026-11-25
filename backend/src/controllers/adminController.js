const Ticket = require('../models/Ticket');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const { eventBus, EVENTS } = require('../events/eventBus');
const { buildTicketQuery } = require('../utils/ticketQuery');

const getAllTickets = async (req, res, next) => {
  try {
    const { filter, pageNum, limitNum, skip, sortOrder } = buildTicketQuery(req.query);

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .sort(sortOrder)
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email'),
      Ticket.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const updateTicketAdmin = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const previousStatus = ticket.status;
    const { status, priority, assignedTo, category } = req.body;
    const changes = {};

    if (priority && priority !== ticket.priority) {
      changes.priority = { from: ticket.priority, to: priority };
      ticket.priority = priority;
    }
    if (category && category !== ticket.category) {
      changes.category = { from: ticket.category, to: category };
      ticket.category = category;
    }
    if (assignedTo !== undefined) {
      changes.assignedTo = { from: ticket.assignedTo, to: assignedTo };
      ticket.assignedTo = assignedTo || null;
    }
    if (status && status !== ticket.status) {
      ticket.status = status;
    }

    await ticket.save();

    if (status && status !== previousStatus) {
      eventBus.emit(EVENTS.STATUS_CHANGED, {
        ticket,
        actor: req.user,
        previousStatus,
        newStatus: status,
      });
      if (status === 'resolved') {
        eventBus.emit(EVENTS.TICKET_RESOLVED, { ticket, actor: req.user });
      }
    }

    if (Object.keys(changes).length) {
      eventBus.emit(EVENTS.TICKET_UPDATED, { ticket, actor: req.user, changes });
    }

    const populated = await Ticket.findById(ticket._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    res.json({ success: true, message: 'Ticket updated', data: { ticket: populated } });
  } catch (err) {
    next(err);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const [byStatus, byPriority, byCategory, totalUsers, recentTickets, recentActivity] =
      await Promise.all([
        Ticket.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Ticket.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
        Ticket.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
        User.countDocuments({ role: 'user' }),
        Ticket.find()
          .sort('-createdAt')
          .limit(6)
          .populate('createdBy', 'name email')
          .populate('assignedTo', 'name email'),
        ActivityLog.find()
          .sort('-createdAt')
          .limit(10)
          .populate('actor', 'name email role')
          .populate('ticket', 'title status'),
      ]);

    const totalTickets = byStatus.reduce((sum, s) => sum + s.count, 0);

    res.json({
      success: true,
      data: {
        totalTickets,
        totalUsers,
        byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
        byPriority: Object.fromEntries(byPriority.map((p) => [p._id, p.count])),
        byCategory: Object.fromEntries(byCategory.map((c) => [c._id, c.count])),
        recentTickets,
        recentActivity,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('name email role');
    res.json({ success: true, data: { admins } });
  } catch (err) {
    next(err);
  }
};

const getActivityLogs = async (req, res, next) => {
  try {
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (req.query.ticketId) filter.ticket = req.query.ticketId;

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum)
        .populate('actor', 'name email role')
        .populate('ticket', 'title status'),
      ActivityLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTickets,
  updateTicketAdmin,
  getDashboardStats,
  getActivityLogs,
  getAdmins,
};
