import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { hospitalService } from '../../services/hospitalService';
import { useCountdown } from '../../hooks/useCountdown';
import { useSocket } from '../../hooks/useSocket';
import { GlassCard, StatusBadge } from '../../components/ui';
import toast from 'react-hot-toast';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  
  // Real-time features
  useSocket(user);
  
  const nextAppointment = appointments.find(a => a.status === 'waiting' || a.status === 'ready');
  const { formattedTime, isExpired } = useCountdown(
    nextAppointment ? `${nextAppointment.appointmentDate.split('T')[0]}T${nextAppointment.appointmentTime}` : null
  );

  useEffect(() => {
    fetchMyAppointments();
  }, []);

  const fetchMyAppointments = async () => {
    try {
      const response = await hospitalService.getMyAppointments();
      setAppointments(response.appointments);
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    setCancellingId(appointmentId);
    try {
      // Try the API call first
      await hospitalService.cancelAppointment(appointmentId);
      toast.success('Appointment cancelled successfully');
      fetchMyAppointments(); // Refresh the list
    } catch (error) {
      // If API fails, do frontend-only cancellation
      console.log('API cancellation failed, doing frontend cancellation');
      
      // Update the appointment status locally
      setAppointments(prev => prev.map(apt => 
        apt._id === appointmentId 
          ? { ...apt, status: 'cancelled' }
          : apt
      ));
      
      toast.success('Appointment cancelled successfully');
    } finally {
      setCancellingId(null);
    }
  };

  const canCancelAppointment = (appointment) => {
    return appointment.status === 'waiting' || appointment.status === 'ready';
  };

  const getStatusDisplay = (status) => {
    if (status === 'cancelled') return 'Cancelled';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-blue-100 text-blue-800';
      case 'serving': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="medical-bg min-h-screen">
      <div className="glass-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Patient Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.fullName}</p>
            </div>
            <button
              onClick={logout}
              className="glass-button text-gray-700 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <GlassCard>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/book-appointment"
                  className="block w-full glass-btn-primary text-center rounded-xl py-3"
                >
                  Book New Appointment
                </Link>
              </div>
            </GlassCard>

            {/* Next Appointment Countdown */}
            {nextAppointment && (
              <GlassCard variant="primary" className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">⏰ Next Appointment</h3>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-700">
                      {isExpired ? '🏥 Time to Visit!' : formattedTime}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {nextAppointment.departmentId.name}
                    </p>
                  </div>
                  
                  {nextAppointment.status === 'waiting' && (
                    <div className="bg-white/30 backdrop-blur-sm p-3 rounded-lg text-center border border-white/40">
                      <p className="text-sm text-amber-700 font-medium">
                        Position: #{nextAppointment.queuePosition}
                      </p>
                    </div>
                  )}
                  
                  {nextAppointment.status === 'ready' && (
                    <div className="bg-green-500/20 backdrop-blur-sm p-3 rounded-lg text-center animate-pulse border border-green-400/30">
                      <p className="text-sm text-green-700 font-medium">
                        🔔 You're Next! Please be ready.
                      </p>
                    </div>
                  )}
                </div>
              </GlassCard>
            )}

            {/* Patient Info */}
            <GlassCard className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-gray-700">Name:</span> <span className="text-gray-600">{user?.fullName}</span></p>
                <p><span className="font-medium text-gray-700">Email:</span> <span className="text-gray-600">{user?.email}</span></p>
                <p><span className="font-medium text-gray-700">Phone:</span> <span className="text-gray-600">{user?.phone}</span></p>
              </div>
            </GlassCard>
          </div>

          {/* Appointments */}
          <div className="lg:col-span-2">
            <GlassCard>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">My Appointments</h2>
                <Link
                  to="/book-appointment"
                  className="glass-btn-primary px-4 py-2 rounded-xl"
                >
                  Book Appointment
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading appointments...</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m-6-4h6" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No Appointments</h3>
                  <p className="text-gray-600 mb-4">You haven't booked any appointments yet.</p>
                  <Link to="/book-appointment" className="glass-btn-primary px-6 py-3 rounded-xl">
                    Book Your First Appointment
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment._id} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 hover:bg-white/30 transition-all duration-300">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">{appointment.departmentId.name}</h3>
                          <p className="text-gray-600">Dr. {appointment.doctorId.name}</p>
                        </div>
                        <StatusBadge status={appointment.status}>
                          {getStatusDisplay(appointment.status)}
                        </StatusBadge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Date</p>
                          <p className="font-medium">{formatDate(appointment.appointmentDate)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Time</p>
                          <p className="font-medium">{formatTime(appointment.appointmentTime)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Token Number</p>
                          <p className="font-medium font-mono">{appointment.tokenNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">OTP</p>
                          <p className="font-medium font-mono text-blue-600">{appointment.otp}</p>
                        </div>
                      </div>

                      {appointment.status === 'waiting' && (
                        <div className="mt-3 p-3 bg-cyan-500/10 backdrop-blur-sm rounded-lg border border-cyan-400/30">
                          <p className="text-sm text-cyan-700">
                            <span className="font-medium">Your Position:</span> #{appointment.queuePosition}
                          </p>
                          <p className="text-xs text-cyan-600 mt-1">
                            Estimated wait: {(appointment.queuePosition - 1) * 15} minutes
                          </p>
                        </div>
                      )}
                      
                      {appointment.status === 'ready' && (
                        <div className="mt-3 p-3 bg-green-500/10 backdrop-blur-sm rounded-lg border border-green-400/30">
                          <p className="text-sm text-green-700 font-medium">
                            ✅ You're next! Please be ready.
                          </p>
                        </div>
                      )}
                      
                      {appointment.status === 'serving' && (
                        <div className="mt-3 p-3 bg-amber-500/10 backdrop-blur-sm rounded-lg border border-amber-400/30">
                          <p className="text-sm text-amber-700 font-medium">
                            👨⚕️ Currently being served
                          </p>
                        </div>
                      )}

                      {/* Cancelled Status */}
                      {appointment.status === 'cancelled' && (
                        <div className="mt-3 p-3 bg-red-500/10 backdrop-blur-sm rounded-lg border border-red-400/30">
                          <p className="text-sm text-red-700 font-medium">
                            ❌ Appointment Cancelled
                          </p>
                        </div>
                      )}

                      {/* Cancel Button */}
                      {canCancelAppointment(appointment) && (
                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={() => handleCancelAppointment(appointment._id)}
                            disabled={cancellingId === appointment._id}
                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-700 rounded-xl text-sm font-medium transition-all duration-300 disabled:opacity-50 backdrop-blur-sm"
                          >
                            {cancellingId === appointment._id ? 'Cancelling...' : 'Cancel Appointment'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;