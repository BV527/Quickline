import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { queueService } from '@/services/queueService';
import { useQueue } from '@/context/QueueContext';
import { formatTime, maskOTP } from '@/utils/helpers';
import AdminLayout from '@/layouts/AdminLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import * as yup from 'yup';

const verifyTicketSchema = yup.object({
  ticketId: yup.string().required('Ticket ID is required'),
  otp: yup.string().required('OTP is required'),
});

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const { queue, currentServing, setLoading: setQueueLoading } = useQueue();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(verifyTicketSchema),
  });

  useEffect(() => {
    const fetchQueue = async () => {
      setQueueLoading(true);
      try {
        await queueService.getQueue();
      } catch (error) {
        toast.error('Failed to load queue data');
      } finally {
        setQueueLoading(false);
      }
    };

    fetchQueue();
  }, [setQueueLoading]);

  const handleVerifyTicket = async (data) => {
    setLoading(true);
    try {
      await queueService.verifyTicket(data.ticketId, data.otp);
      toast.success('Ticket verified successfully!');
      setShowVerifyModal(false);
      reset();
    } catch (error) {
      toast.error('Invalid ticket or OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleServeNext = async () => {
    setLoading(true);
    try {
      await queueService.serveNext();
      toast.success('Next ticket served!');
    } catch (error) {
      toast.error('Failed to serve next ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <HospitalAdminLink />
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="stat-card border-blue-400">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  📊 Queue Length
                </h3>
                <div className="text-4xl font-bold text-blue-600">
                  {queue.length}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  People waiting
                </p>
              </div>
              <div className="bg-blue-100 p-4 rounded-full">
                <span className="text-3xl">📊</span>
              </div>
            </div>
          </div>

          <div className="stat-card border-green-400">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  🎯 Currently Serving
                </h3>
                <div className="text-2xl font-bold text-green-600">
                  {currentServing ? currentServing.id : 'None'}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {currentServing ? 'Active ticket' : 'No active ticket'}
                </p>
              </div>
              <div className="bg-green-100 p-4 rounded-full">
                <span className="text-3xl">🎯</span>
              </div>
            </div>
          </div>

          <div className="stat-card border-purple-400">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                ⚙️ Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowVerifyModal(true)}
                  className="btn-primary w-full text-sm"
                >
                  🔍 Verify Ticket
                </button>
                <button
                  onClick={handleServeNext}
                  disabled={loading || queue.length === 0}
                  className="btn-success w-full text-sm flex items-center justify-center"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : null}
                  ▶️ Serve Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Current Serving Details */}
        {currentServing && (
          <div className="bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl shadow-xl p-8 border-2 border-green-300">
            <div className="flex items-center mb-6">
              <div className="bg-green-500 p-3 rounded-full mr-4">
                <span className="text-2xl text-white">🎯</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-800">
                  Currently Serving
                </h3>
                <p className="text-green-600">
                  Active customer details
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-white to-green-50 p-4 rounded-xl shadow-md">
                <div className="font-semibold text-gray-700 text-sm mb-1">Ticket ID</div>
                <div className="text-xl font-bold text-green-600 font-mono">{currentServing.id}</div>
              </div>
              <div className="bg-gradient-to-br from-white to-green-50 p-4 rounded-xl shadow-md">
                <div className="font-semibold text-gray-700 text-sm mb-1">Name</div>
                <div className="text-lg font-semibold text-gray-800">{currentServing.name}</div>
              </div>
              <div className="bg-gradient-to-br from-white to-green-50 p-4 rounded-xl shadow-md">
                <div className="font-semibold text-gray-700 text-sm mb-1">Phone</div>
                <div className="text-lg font-semibold text-gray-800">{currentServing.phone}</div>
              </div>
              <div className="bg-gradient-to-br from-white to-green-50 p-4 rounded-xl shadow-md">
                <div className="font-semibold text-gray-700 text-sm mb-1">Started</div>
                <div className="text-lg font-semibold text-gray-800">{formatTime(currentServing.servedAt)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Queue List */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-100 rounded-2xl shadow-xl p-8 border border-blue-200">
          <div className="flex items-center mb-6">
            <div className="bg-blue-500 p-3 rounded-full mr-4">
              <span className="text-2xl text-white">📋</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-800">
                Waiting Queue ({queue.length})
              </h3>
              <p className="text-blue-600">
                People waiting to be served
              </p>
            </div>
          </div>
          
          {queue.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
              <div className="text-6xl mb-4">📋</div>
              <h4 className="text-xl font-semibold text-gray-600 mb-2">No tickets in queue</h4>
              <p className="text-gray-500">Queue is empty - ready for new customers!</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                      🏁 Position
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                      🎫 Ticket ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                      👤 Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                      📞 Phone
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                      🔐 OTP
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                      ⏰ Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {queue.map((ticket, index) => (
                    <tr key={`${ticket.id}-${index}`} className={`hover:bg-blue-50 transition-colors ${
                      index === 0 ? 'bg-green-50 border-l-4 border-green-500' :
                      index < 3 ? 'bg-yellow-100 border-l-4 border-yellow-500' : 'bg-gray-50'
                    }`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                          index === 0 ? 'bg-green-100 text-green-800' :
                          index < 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          #{index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-blue-600">
                        {ticket.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {ticket.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {ticket.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-purple-600">
                        {maskOTP(ticket.otp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatTime(ticket.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Verify Ticket Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Verify Ticket</h3>
        <form onSubmit={handleSubmit(handleVerifyTicket)}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ticket ID
            </label>
            <input
              {...register('ticketId')}
              type="text"
              className="input-field"
              placeholder="Enter ticket ID"
            />
            {errors.ticketId && (
              <p className="text-red-500 text-sm mt-1">{errors.ticketId.message}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OTP
            </label>
            <input
              {...register('otp')}
              type="text"
              className="input-field"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
            />
            {errors.otp && (
              <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowVerifyModal(false)}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center"
            >
              {loading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : null}
              Verify
            </button>
          </div>
        </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboardPage;