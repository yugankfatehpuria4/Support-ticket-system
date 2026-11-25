const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const { eventBus, EVENTS } = require('../events/eventBus');
const { buildTicketQuery } = require('../utils/ticketQuery');

const createTicket = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;

    const ticket = await Ticket.create({
      title,
      description,
      category,
      priority,
      createdBy: req.user._id,
    });

    eventBus.emit(EVENTS.TICKET_CREATED, {
      ticket,
      actor: req.user,
    });

    res.status(201).json({ success: true, message: 'Ticket created', data: { ticket } });
  } catch (err) {
    next(err);
  }
};

const getMyTickets = async (req, res, next) => {
  try {
    const { filter, pageNum, limitNum, skip, sortOrder } = buildTicketQuery(req.query, {
      createdBy: req.user._id,
    });

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

const getMyStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [byStatus, byPriority, byCategory, recentTickets, userTickets] = await Promise.all([
      Ticket.aggregate([
        { $match: { createdBy: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Ticket.aggregate([
        { $match: { createdBy: userId } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Ticket.aggregate([
        { $match: { createdBy: userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      Ticket.find({ createdBy: userId })
        .sort('-updatedAt')
        .limit(5)
        .populate('assignedTo', 'name email'),
      Ticket.find({ createdBy: userId }).select('_id'),
    ]);

    const ticketIds = userTickets.map((t) => t._id);
    const recentActivity = ticketIds.length
      ? await ActivityLog.find({ ticket: { $in: ticketIds } })
          .sort('-createdAt')
          .limit(8)
          .populate('actor', 'name role')
          .populate('ticket', 'title status')
      : [];

    const totalTickets = byStatus.reduce((sum, s) => sum + s.count, 0);

    res.json({
      success: true,
      data: {
        totalTickets,
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

const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const isOwner = String(ticket.createdBy._id) === String(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [comments, activities] = await Promise.all([
      Comment.find({ ticket: ticket._id })
        .sort('createdAt')
        .populate('author', 'name email role'),
      ActivityLog.find({ ticket: ticket._id })
        .sort('-createdAt')
        .populate('actor', 'name email role'),
    ]);

    res.json({ success: true, data: { ticket, comments, activities } });
  } catch (err) {
    next(err);
  }
};

const updateMyTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (String(ticket.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You can only edit your own tickets' });
    }

    if (['resolved', 'closed'].includes(ticket.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit a resolved or closed ticket',
      });
    }

    const allowed = ['title', 'description', 'category', 'priority'];
    const changes = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== ticket[field]) {
        changes[field] = { from: ticket[field], to: req.body[field] };
        ticket[field] = req.body[field];
      }
    });

    await ticket.save();

    if (Object.keys(changes).length) {
      eventBus.emit(EVENTS.TICKET_UPDATED, { ticket, actor: req.user, changes });
    }

    res.json({ success: true, message: 'Ticket updated', data: { ticket } });
  } catch (err) {
    next(err);
  }
};

const deleteMyTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (String(ticket.createdBy) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (ticket.status !== 'open' && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Only open tickets can be deleted by users',
      });
    }

    await Promise.all([
      Comment.deleteMany({ ticket: ticket._id }),
      Notification.deleteMany({ ticket: ticket._id }),
      ticket.deleteOne(),
    ]);

    res.json({ success: true, message: 'Ticket deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getMyStats,
  getTicketById,
  updateMyTicket,
  deleteMyTicket,
};
