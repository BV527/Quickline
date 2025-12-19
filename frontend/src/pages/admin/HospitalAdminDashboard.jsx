import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { hospitalService } from '../../services/hospitalService';
import { useSocket } from '../../hooks/useSocket';
import { GlassCard, StatusBadge } from '../../components/ui';
import toast from 'react-hot-toast';

const HospitalAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [queueData, setQueueData] = useState([]);
  const [verificationData, setVerificationData] = useState({ tokenNumber: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalPatients: 0, totalWaiting: 0, totalServing: 0 });
  
  // Real-time updates
  useSocket(user);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      fetchDepartmentQueue();
    }
  }, [selectedDepartment]);

  const fetchDepartments = async () => {
    try {
      const response = await hospitalService.getDepartments();
      setDepartments(response.departments);
      if (response.departments.length > 0) {
        setSelectedDepartment(response.departments[0]._id);
      }
    } catch (error) {
      toast.error('Failed to fetch departments');
    }
  };

  const fetchDepartmentQueue = async () => {
    if (!selectedDepartment) return;
    
    try {
      const response = await hospitalService.getDepartmentQueue(selectedDepartment);
      setQueueData(response.appointments);
      
      // Calculate stats
      const totalWaiting = response.appointments.filter(a => a.status === 'waiting').length;
      const totalServing = response.appointments.filter(a => a.status === 'serving').length;
      setStats({
        totalPatients: response.appointments.length,
        totalWaiting,
        totalServing
      });
    } catch (error) {
      toast.error('Failed to fetch queue data');
    }
  };

  const handleVerifyPatient = async (e) => {
    e.preventDefault();
    if (!verificationData.tokenNumber || !verificationData.otp) {
      toast.error('Please enter both token number and OTP');
      return;
    }

    setLoading(true);
    try {
      await hospitalService.verifyPatient(verificationData.tokenNumber, verificationData.otp);
      toast.success('Patient verified successfully!');
      setVerificationData({ tokenNumber: '', otp: '' });
      fetchDepartmentQueue();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleServeNext = async () => {
    if (!selectedDepartment) return;

    setLoading(true);
    try {
      await hospitalService.serveNext(selectedDepartment);
      toast.success('Next patient is being served');
      fetchDepartmentQueue();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to serve next patient');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      await hospitalService.completeAppointment(appointmentId);
      toast.success('Appointment completed');
      fetchDepartmentQueue();
    } catch (error) {
      toast.error('Failed to complete appointment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-blue-100 text-blue-800';
      case 'serving': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
              <h1 className="text-2xl font-bold text-gray-800">Hospital Admin Dashboard</h1>
              <p className="text-gray-600">Welcome, {user?.fullName}</p>
            </div>
            <button onClick={logout} className="glass-button text-gray-700 hover:text-gray-900">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <GlassCard variant="primary">
            <h3 className="text-sm font-medium text-cyan-700 mb-2">Total Patients</h3>
            <p className="text-3xl font-bold text-cyan-800">{stats.totalPatients}</p>
          </GlassCard>
          <GlassCard variant="warning">
            <h3 className="text-sm font-medium text-amber-700 mb-2">Waiting</h3>
            <p className="text-3xl font-bold text-amber-800">{stats.totalWaiting}</p>
          </GlassCard>
          <GlassCard variant="success">
            <h3 className="text-sm font-medium text-green-700 mb-2">Serving</h3>
            <p className="text-3xl font-bold text-green-800">{stats.totalServing}</p>
          </GlassCard>
          <GlassCard>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Department</h3>
            <p className="text-lg font-bold text-gray-800">
              {departments.find(d => d._id === selectedDepartment)?.name || 'Select Dept'}
            </p>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Verification */}
          <div className="lg:col-span-1">
            <GlassCard>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Verify Patient</h2>
              <form onSubmit={handleVerifyPatient} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token Number
                  </label>
                  <input
                    type="text"
                    value={verificationData.tokenNumber}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, tokenNumber: e.target.value }))}
                    className="medical-input"
                    placeholder="Enter token number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OTP
                  </label>
                  <input
                    type="text"
                    value={verificationData.otp}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, otp: e.target.value }))}
                    className="medical-input"
                    placeholder="Enter OTP"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="glass-btn-primary w-full disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify Patient'}
                </button>
              </form>
            </GlassCard>

            {/* Department Selection */}
            <GlassCard className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Department</h3>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="medical-input"
              >
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              
              <button
                onClick={handleServeNext}
                disabled={loading || queueData.length === 0}
                className="w-full glass-btn-primary mt-4 disabled:opacity-50"
              >
                Serve Next Patient
              </button>
            </GlassCard>
          </div>

          {/* Queue Management */}
          <div className="lg:col-span-2">
            <GlassCard>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Current Queue - {departments.find(d => d._id === selectedDepartment)?.name}
                </h2>
                <button
                  onClick={fetchDepartmentQueue}
                  className="glass-button text-gray-700 hover:text-gray-900"
                >
                  Refresh
                </button>
              </div>

              {queueData.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No Patients in Queue</h3>
                  <p className="text-gray-600">The queue is currently empty.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {queueData.map((appointment, index) => (
                    <div key={appointment._id} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 hover:bg-white/30 transition-all duration-300">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            #{index + 1} - {appointment.patientId.fullName}
                          </h3>
                          <p className="text-gray-600">Dr. {appointment.doctorId.name}</p>
                        </div>
                        <StatusBadge status={appointment.status}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </StatusBadge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-500">Time</p>
                          <p className="font-medium">{formatTime(appointment.appointmentTime)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Phone</p>
                          <p className="font-medium">{appointment.patientId.phone}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Token</p>
                          <p className="font-medium font-mono">{appointment.tokenNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">OTP</p>
                          <p className="font-medium font-mono text-blue-600">{appointment.otp}</p>
                        </div>
                      </div>

                      {appointment.status === 'serving' && (
                        <button
                          onClick={() => handleCompleteAppointment(appointment._id)}
                          className="glass-btn-primary"
                        >
                          Complete Appointment
                        </button>
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

export default HospitalAdminDashboard;