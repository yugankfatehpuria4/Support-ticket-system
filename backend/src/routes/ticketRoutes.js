const express = require('express');
const { body } = require('express-validator');
const {
  createTicket,
  getMyTickets,
  getMyStats,
  getTicketById,
  updateMyTicket,
  deleteMyTicket,
} = require('../controllers/ticketController');
const { addComment, getComments } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category')
      .optional()
      .isIn(['technical', 'billing', 'general', 'account', 'feature', 'bug', 'network']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  ],
  validate,
  createTicket
);

router.get('/', getMyTickets);
router.get('/stats', getMyStats);
router.get('/:id', getTicketById);
router.put(
  '/:id',
  [
    body('title').optional().trim().notEmpty().isLength({ max: 200 }),
    body('description').optional().trim().notEmpty(),
    body('category')
      .optional()
      .isIn(['technical', 'billing', 'general', 'account', 'feature', 'bug', 'network']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  ],
  validate,
  updateMyTicket
);
router.delete('/:id', deleteMyTicket);

router.get('/:id/comments', getComments);
router.post(
  '/:id/comments',
  [body('body').trim().notEmpty().withMessage('Comment body is required').isLength({ max: 2000 })],
  validate,
  addComment
);

module.exports = router;
