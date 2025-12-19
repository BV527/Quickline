import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { queueService } from '@/services/queueService';
import { useQueue } from '@/context/QueueContext';
import PublicLayout from '@/layouts/PublicLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import * as yup from 'yup';

const joinQueueSchema = yup.object({
  name: yup.string().required('Name is required'),
  phone: yup.string().required('Phone number is required'),
});

const JoinQueuePage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToQueue } = useQueue();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(joinQueueSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await queueService.joinQueue(data);
      if (response && response.ticket) {
        addToQueue(response.ticket);
        toast.success('Successfully joined the queue!');
        navigate(`/status/${response.ticket.id}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Join queue error:', error);
      toast.error('Failed to join queue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-md mx-auto">
        <div className="card-purple">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Join Queue
            </h2>
            <p className="text-gray-600">
              Enter your details to get a ticket
            </p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                {...register('name')}
                type="text"
                className="input-field"
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="input-field"
                placeholder="Enter 10-digit phone number"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center text-lg"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  🔄 Joining Queue...
                </>
              ) : (
                'Join Queue'
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Already have a ticket?{' '}
              <button
                onClick={() => {
                  const ticketId = prompt('Enter your ticket ID:');
                  if (ticketId) navigate(`/status/${ticketId}`);
                }}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Check Status
              </button>
            </p>
            <p className="text-xs text-gray-500">
              <button
                onClick={() => navigate('/admin/login')}
                className="text-gray-500 hover:text-gray-700 underline"
              >
                Admin Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default JoinQueuePage;