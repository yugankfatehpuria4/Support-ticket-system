const express = require('express');
const { body } = require('express-validator');
const {
  getAllTickets,
  updateTicketAdmin,
  getDashboardStats,
  getActivityLogs,
  getAdmins,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/tickets', getAllTickets);
router.patch(
  '/tickets/:id',
  [
    body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('category')
      .optional()
      .isIn(['technical', 'billing', 'general', 'account', 'feature', 'bug', 'network']),
  ],
  validate,
  updateTicketAdmin
);
router.get('/stats', getDashboardStats);
router.get('/activity', getActivityLogs);
router.get('/admins', getAdmins);

module.exports = router;
