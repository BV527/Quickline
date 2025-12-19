import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { queueService } from '@/services/queueService';
import { useQueue } from '@/context/QueueContext';
import { getPositionText, formatTime } from '@/utils/helpers';
import PublicLayout from '@/layouts/PublicLayout';
import LoadingSpinner from '@/components/LoadingSpinner';

const UserStatusPage = () => {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userPosition, currentServing, setUserTicket } = useQueue();
  const [calculatedPosition, setCalculatedPosition] = useState(null);

  useEffect(() => {
    const fetchTicketStatus = async () => {
      try {
        const response = await queueService.getTicketStatus(ticketId);
        setTicket(response.ticket);
        setUserTicket(response.ticket);
        setCalculatedPosition(response.ticket.position || null);
      } catch (error) {
        toast.error('Ticket not found');
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) {
      fetchTicketStatus();
    }
  }, [ticketId, setUserTicket]);

  useEffect(() => {
    if (userPosition === 0) {
      toast.success('🎉 It\'s your turn!', { duration: 5000 });
    } else if (userPosition <= 3 && userPosition > 0) {
      toast(`⏰ ${getPositionText(userPosition)}`, { duration: 3000 });
    }
  }, [userPosition]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </PublicLayout>
    );
  }

  if (!ticket) {
    return (
      <PublicLayout>
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Ticket Not Found
          </h2>
          <p className="text-gray-600">
            The ticket ID you provided is invalid or expired.
          </p>
        </div>
      </PublicLayout>
    );
  }

  const currentPosition = userPosition !== null ? userPosition : calculatedPosition;
  const isYourTurn = currentPosition === 0;
  const isNearTurn = currentPosition <= 3 && currentPosition > 0;

  return (
    <PublicLayout>
      <div className="max-w-md mx-auto space-y-6">
        {/* Ticket Info Card */}
        <div className={`${isYourTurn ? 'card-green' : 'card'}`}>
          <div className="text-center">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">🎫</span>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-6">
              Your Digital Ticket
            </h2>
            
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 mb-6 text-white shadow-xl">
              <div className="text-4xl font-mono font-bold mb-2">
                {ticket.id}
              </div>
              <div className="text-blue-100 font-medium">
                Ticket ID
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-900">Name</div>
                <div className="text-gray-600">{ticket.name}</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Phone</div>
                <div className="text-gray-600">{ticket.phone}</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">OTP</div>
                <div className="text-gray-600 font-mono">{ticket.otp}</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Joined</div>
                <div className="text-gray-600">{formatTime(ticket.createdAt)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className={`${isYourTurn ? 'card-green' : isNearTurn ? 'card-yellow' : 'card-blue'}`}>
          <div className="text-center">
            {isYourTurn ? (
              <div className="text-green-600">
                <div className="text-6xl mb-4 animate-bounce">🎉</div>
                <h3 className="text-3xl font-bold text-green-800 mb-3">It's Your Turn!</h3>
                <div className="bg-green-500 text-white px-6 py-3 rounded-full font-semibold mb-4">
                  ✨ Please proceed to counter ✨
                </div>
                <p className="text-green-700 font-medium">
                  Show your ticket and OTP to the staff
                </p>
              </div>
            ) : (
              <div>
                <div className={`text-6xl mb-4 ${isNearTurn ? 'text-orange-500 animate-pulse' : 'text-blue-500'}`}>
                  {isNearTurn ? '⏰' : '⏳'}
                </div>
                <h3 className={`text-2xl font-bold mb-3 ${
                  isNearTurn ? 'text-orange-800' : 'text-blue-800'
                }`}>
                  {currentPosition !== null ? getPositionText(currentPosition) : 'Checking position...'}
                </h3>
                <div className={`px-6 py-3 rounded-full font-semibold mb-4 ${
                  isNearTurn ? 'bg-orange-200 text-orange-800' : 'bg-blue-200 text-blue-800'
                }`}>
                  {isNearTurn ? '⚠️ Almost your turn!' : '🚀 Please wait patiently'}
                </div>
                <p className="text-gray-600 font-medium">
                  You'll receive notifications when you're next
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Current Serving Card */}
        {currentServing && (
          <div className="card-green">
            <div className="text-center">
              <div className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl text-white">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-3">
                Now Serving
              </h3>
              <div className="text-3xl font-mono font-bold text-green-600 bg-gradient-to-r from-white to-green-50 bg-opacity-90 rounded-xl py-2 px-4">
                {currentServing.id}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="card-blue">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-500 w-10 h-10 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold">ℹ️</span>
            </div>
            <h3 className="font-bold text-indigo-900 text-lg">Important Notes</h3>
          </div>
          <ul className="text-sm text-indigo-800 space-y-2 font-medium">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Keep your ticket ID and OTP ready
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              You'll receive alerts when your turn is near
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Don't close this page for real-time updates
            </li>
          </ul>
        </div>
      </div>
    </PublicLayout>
  );
};

export default UserStatusPage;