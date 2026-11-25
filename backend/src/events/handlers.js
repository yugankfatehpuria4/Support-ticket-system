const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { eventBus, EVENTS } = require('./eventBus');

const logActivity = async ({ eventType, ticket, actor, message, metadata = {} }) => {
  try {
    await ActivityLog.create({
      eventType,
      ticket: ticket || null,
      actor: actor || null,
      message,
      metadata,
    });
  } catch (err) {
    console.error('Failed to write activity log:', err.message);
  }
};

const notifyUser = async ({ userId, ticketId, message, eventType }) => {
  if (!userId) return;
  try {
    await Notification.create({
      user: userId,
      ticket: ticketId || null,
      message,
      eventType,
    });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};

const notifyAdmins = async ({ ticketId, message, eventType, excludeUserId }) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('_id');
    await Promise.all(
      admins
        .filter((a) => String(a._id) !== String(excludeUserId))
        .map((admin) =>
          notifyUser({
            userId: admin._id,
            ticketId,
            message,
            eventType,
          })
        )
    );
  } catch (err) {
    console.error('Failed to notify admins:', err.message);
  }
};

const registerEventHandlers = () => {
  eventBus.on(EVENTS.TICKET_CREATED, async (payload) => {
    const { ticket, actor } = payload;
    const message = `Ticket "${ticket.title}" was created`;
    await logActivity({
      eventType: EVENTS.TICKET_CREATED,
      ticket: ticket._id,
      actor: actor._id,
      message,
      metadata: { priority: ticket.priority, category: ticket.category },
    });
    await notifyAdmins({
      ticketId: ticket._id,
      message,
      eventType: EVENTS.TICKET_CREATED,
      excludeUserId: actor._id,
    });
  });

  eventBus.on(EVENTS.TICKET_UPDATED, async (payload) => {
    const { ticket, actor, changes } = payload;
    const message = `Ticket "${ticket.title}" was updated`;
    await logActivity({
      eventType: EVENTS.TICKET_UPDATED,
      ticket: ticket._id,
      actor: actor._id,
      message,
      metadata: { changes },
    });
  });

  eventBus.on(EVENTS.STATUS_CHANGED, async (payload) => {
    const { ticket, actor, previousStatus, newStatus } = payload;
    const message = `Ticket "${ticket.title}" status changed from ${previousStatus} to ${newStatus}`;
    await logActivity({
      eventType: EVENTS.STATUS_CHANGED,
      ticket: ticket._id,
      actor: actor._id,
      message,
      metadata: { previousStatus, newStatus },
    });
    await notifyUser({
      userId: ticket.createdBy,
      ticketId: ticket._id,
      message,
      eventType: EVENTS.STATUS_CHANGED,
    });
  });

  eventBus.on(EVENTS.TICKET_RESOLVED, async (payload) => {
    const { ticket, actor } = payload;
    const message = `Ticket "${ticket.title}" was marked as resolved`;
    await logActivity({
      eventType: EVENTS.TICKET_RESOLVED,
      ticket: ticket._id,
      actor: actor._id,
      message,
    });
    await notifyUser({
      userId: ticket.createdBy,
      ticketId: ticket._id,
      message,
      eventType: EVENTS.TICKET_RESOLVED,
    });
  });

  eventBus.on(EVENTS.COMMENT_ADDED, async (payload) => {
    const { ticket, actor, comment } = payload;
    const message = `${actor.name} commented on ticket "${ticket.title}"`;
    await logActivity({
      eventType: EVENTS.COMMENT_ADDED,
      ticket: ticket._id,
      actor: actor._id,
      message,
      metadata: { commentId: comment._id },
    });

    const recipient =
      String(actor._id) === String(ticket.createdBy)
        ? null
        : ticket.createdBy;

    if (recipient) {
      await notifyUser({
        userId: recipient,
        ticketId: ticket._id,
        message,
        eventType: EVENTS.COMMENT_ADDED,
      });
    } else {
      await notifyAdmins({
        ticketId: ticket._id,
        message,
        eventType: EVENTS.COMMENT_ADDED,
        excludeUserId: actor._id,
      });
    }
  });

  console.log('Event handlers registered');
};

module.exports = { registerEventHandlers };
