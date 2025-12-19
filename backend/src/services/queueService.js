const Ticket = require('../models/Ticket');

class QueueService {
  async getQueueStats() {
    const [totalWaiting, currentServing] = await Promise.all([
      Ticket.countDocuments({ status: 'waiting' }),
      Ticket.findOne({ status: 'serving' }).sort({ servedAt: -1 })
    ]);

    return {
      totalWaiting,
      currentServing
    };
  }

  async getWaitingQueue(options = {}) {
    const {
      page = 1,
      limit = 50,
      sort = 'createdAt'
    } = options;

    const skip = (page - 1) * limit;
    
    const [tickets, total] = await Promise.all([
      Ticket.find({ status: 'waiting' })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Ticket.countDocuments({ status: 'waiting' })
    ]);

    return {
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async updateQueuePositions() {
    const waitingTickets = await Ticket.find({ status: 'waiting' })
      .sort({ createdAt: 1 });

    const updatePromises = waitingTickets.map((ticket, index) => 
      Ticket.findByIdAndUpdate(ticket._id, { position: index + 1 })
    );

    await Promise.all(updatePromises);
    return waitingTickets.length;
  }

  async getTicketPosition(ticketId) {
    const ticket = await Ticket.findOne({ id: ticketId });
    if (!ticket) return null;

    if (ticket.status !== 'waiting') {
      return { position: 0, status: ticket.status };
    }

    const position = await Ticket.countDocuments({
      status: 'waiting',
      createdAt: { $lt: ticket.createdAt }
    });

    return { position: position + 1, status: ticket.status };
  }

  async serveNextTicket() {
    const session = await Ticket.startSession();
    
    try {
      await session.withTransaction(async () => {
        const currentServing = await Ticket.findOne({ status: 'serving' });
        if (currentServing) {
          currentServing.status = 'served';
          await currentServing.save({ session });
        }

        const nextTicket = await Ticket.findOne({ status: 'waiting' })
          .sort({ createdAt: 1 })
          .session(session);

        if (nextTicket) {
          nextTicket.status = 'serving';
          nextTicket.servedAt = new Date();
          await nextTicket.save({ session });
        }

        await this.updateQueuePositions();
        
        return nextTicket;
      });
    } finally {
      await session.endSession();
    }
  }
}

module.exports = new QueueService();