const Comment = require('../models/Comment');
const Ticket = require('../models/Ticket');
const { eventBus, EVENTS } = require('../events/eventBus');

const addComment = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const isOwner = String(ticket.createdBy) === String(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (['closed'].includes(ticket.status)) {
      return res.status(400).json({ success: false, message: 'Cannot comment on a closed ticket' });
    }

    const comment = await Comment.create({
      ticket: ticket._id,
      author: req.user._id,
      body: req.body.body,
    });

    await comment.populate('author', 'name email role');

    eventBus.emit(EVENTS.COMMENT_ADDED, {
      ticket,
      actor: req.user,
      comment,
    });

    res.status(201).json({ success: true, message: 'Comment added', data: { comment } });
  } catch (err) {
    next(err);
  }
};

const getComments = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const isOwner = String(ticket.createdBy) === String(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const comments = await Comment.find({ ticket: ticket._id })
      .sort('createdAt')
      .populate('author', 'name email role');

    res.json({ success: true, data: { comments } });
  } catch (err) {
    next(err);
  }
};

module.exports = { addComment, getComments };
