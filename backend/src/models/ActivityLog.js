const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      enum: [
        'TICKET_CREATED',
        'TICKET_UPDATED',
        'STATUS_CHANGED',
        'COMMENT_ADDED',
        'TICKET_RESOLVED',
      ],
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      default: null,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    message: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ ticket: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
