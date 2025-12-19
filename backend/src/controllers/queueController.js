const Ticket = require('../models/Ticket');
const queueService = require('../services/queueService');
const { generateOTP, generateTicketId } = require('../utils/jwt');

const joinQueue = async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    const existingTicket = await Ticket.findOne({
      phone,
      status: { $in: ['waiting', 'serving'] }
    });

    if (existingTicket) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active ticket in the queue'
      });
    }

    const ticketId = generateTicketId();
    const otp = generateOTP();

    const ticket = new Ticket({
      id: ticketId,
      name,
      phone,
      email,
      otp,
      status: 'waiting'
    });

    await ticket.save();
    await queueService.updateQueuePositions();

    const position = await queueService.getTicketPosition(ticketId);

    req.io.emit('queue-updated', {
      queue: await queueService.getWaitingQueue(),
      currentServing: await Ticket.findOne({ status: 'serving' })
    });

    res.status(201).json({
      success: true,
      message: 'Successfully joined the queue',
      data: {
        ticket: {
          id: ticket.id,
          name: ticket.name,
          phone: ticket.phone,
          otp: ticket.otp,
          status: ticket.status,
          position: position.position,
          createdAt: ticket.createdAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to join queue',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findOne({ id: ticketId });
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    const position = await queueService.getTicketPosition(ticketId);

    res.json({
      success: true,
      data: {
        ticket: {
          id: ticket.id,
          name: ticket.name,
          phone: ticket.phone,
          otp: ticket.otp,
          status: ticket.status,
          position: position.position,
          createdAt: ticket.createdAt,
          servedAt: ticket.servedAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get ticket status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getQueue = async (req, res) => {
  try {
    const { page, limit, sort } = req.query;
    
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      sort: sort || 'createdAt'
    };

    const [queueData, currentServing, stats] = await Promise.all([
      queueService.getWaitingQueue(options),
      Ticket.findOne({ status: 'serving' }),
      queueService.getQueueStats()
    ]);

    res.json({
      success: true,
      data: {
        queue: queueData.tickets,
        currentServing,
        stats,
        pagination: queueData.pagination
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get queue',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const verifyTicket = async (req, res) => {
  try {
    const { ticketId, otp } = req.body;

    const ticket = await Ticket.findOne({ id: ticketId });
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (ticket.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    if (ticket.status === 'served') {
      return res.status(400).json({
        success: false,
        message: 'Ticket already served'
      });
    }

    res.json({
      success: true,
      message: 'Ticket verified successfully',
      data: {
        ticket: {
          id: ticket.id,
          name: ticket.name,
          phone: ticket.phone,
          status: ticket.status
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const serveNext = async (req, res) => {
  try {
    await queueService.serveNextTicket();
    
    const [currentServing, queueData] = await Promise.all([
      Ticket.findOne({ status: 'serving' }),
      queueService.getWaitingQueue()
    ]);

    req.io.emit('ticket-served', {
      currentServing,
      queue: queueData.tickets
    });

    if (currentServing) {
      req.io.emit('your-turn', { ticketId: currentServing.id });
    }

    const nearTurnTickets = queueData.tickets.slice(0, 3);
    nearTurnTickets.forEach((ticket, index) => {
      if (index < 3) {
        req.io.emit('alert-near', {
          ticketId: ticket.id,
          position: index + 1
        });
      }
    });

    res.json({
      success: true,
      message: 'Next ticket served successfully',
      data: {
        currentServing,
        queue: queueData.tickets
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to serve next ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getCurrentServing = async (req, res) => {
  try {
    const currentServing = await Ticket.findOne({ status: 'serving' });
    
    res.json({
      success: true,
      data: {
        currentServing
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get current serving ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  joinQueue,
  getTicketStatus,
  getQueue,
  verifyTicket,
  serveNext,
  getCurrentServing
};