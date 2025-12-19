const express = require('express');
const {
  joinQueue,
  getTicketStatus,
  getQueue,
  verifyTicket,
  serveNext,
  getCurrentServing
} = require('../controllers/queueController');
const {
  validateJoinQueue,
  validateTicketId,
  validateVerifyTicket,
  validatePagination
} = require('../middleware/validation');
const { auth } = require('../middleware/auth');
const { queueLimiter } = require('../middleware/security');

const router = express.Router();

router.post('/join', queueLimiter, validateJoinQueue, joinQueue);
router.get('/ticket/:ticketId', validateTicketId, getTicketStatus);
router.get('/', validatePagination, getQueue);
router.post('/verify', auth, validateVerifyTicket, verifyTicket);
router.post('/serve-next', auth, serveNext);
router.get('/current-serving', getCurrentServing);

module.exports = router;