import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hospitalService } from '../../services/hospitalService';
import toast from 'react-hot-toast';

const BookAppointment = () => {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotBookings, setSlotBookings] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fixed time slots
  const timeSlots = [
    { time: '09:00', label: '9:00 AM', maxPatients: 10 },
    { time: '14:00', label: '2:00 PM', maxPatients: 10 },
    { time: '18:00', label: '6:00 PM', maxPatients: 10 }
  ];

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      fetchDoctors(selectedDepartment);
    }
  }, [selectedDepartment]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      generateTimeSlots();
    }
  }, [selectedDoctor, selectedDate, slotBookings]);

  const fetchDepartments = async () => {
    try {
      const response = await hospitalService.getDepartments();
      if (response && response.departments) {
        setDepartments(response.departments);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to fetch departments');
    }
  };

  const fetchDoctors = async (departmentId) => {
    try {
      const response = await hospitalService.getDepartmentDoctors(departmentId);
      if (response && response.doctors) {
        setDoctors(response.doctors);
      }
      setSelectedDoctor('');
      setAvailableSlots([]);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to fetch doctors');
    }
  };

  const generateTimeSlots = () => {
    const slots = timeSlots.map(slot => {
      const dateKey = `${selectedDate}-${slot.time}`;
      const bookedCount = slotBookings[dateKey] || 0;
      const availableCount = Math.max(0, slot.maxPatients - bookedCount);
      
      // Calculate estimated waiting time (15 minutes per patient)
      const waitingTime = bookedCount * 15;
      const waitingHours = Math.floor(waitingTime / 60);
      const waitingMinutes = waitingTime % 60;
      
      let waitingDisplay = '';
      if (waitingTime === 0) {
        waitingDisplay = 'No wait';
      } else if (waitingHours > 0) {
        waitingDisplay = `${waitingHours}h ${waitingMinutes}m wait`;
      } else {
        waitingDisplay = `${waitingMinutes}m wait`;
      }
      
      return {
        ...slot,
        bookedCount,
        availableCount,
        waitingTime,
        waitingDisplay,
        isAvailable: availableCount > 0
      };
    });
    
    setAvailableSlots(slots);
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast.error('Please fill all fields');
      return;
    }

    const dateKey = `${selectedDate}-${selectedTime}`;
    const currentBookings = slotBookings[dateKey] || 0;
    
    if (currentBookings >= 10) {
      toast.error('This time slot is fully booked');
      return;
    }

    setLoading(true);
    
    try {
      await hospitalService.bookAppointment({
        doctorId: selectedDoctor,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime
      });

      // Update slot bookings
      setSlotBookings(prev => ({
        ...prev,
        [dateKey]: currentBookings + 1
      }));

      toast.success('Appointment booked successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen medical-bg">
      <div className="glass-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h8M8 16h6" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">QuickLine</h1>
                <p className="text-gray-700">Book Your Appointment</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="glass-button"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="glass-card">
          <form onSubmit={handleBookAppointment} className="space-y-6">
            {/* Department Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="medical-input"
                required
              >
                <option value="">Choose a department</option>
                {departments.map((dept) => (
                  <option key={dept._id || dept.id} value={dept._id || dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor Selection */}
            {selectedDepartment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Doctor
                </label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="medical-input"
                  required
                >
                  <option value="">Choose a doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id || doctor.id} value={doctor._id || doctor.id}>
                      Dr. {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Selection */}
            {selectedDoctor && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getTodayDate()}
                  max={getMaxDate()}
                  className="medical-input"
                  required
                />
              </div>
            )}

            {/* Time Selection */}
            {selectedDate && availableSlots.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time Slot
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => slot.isAvailable && setSelectedTime(slot.time)}
                      disabled={!slot.isAvailable}
                      className={`p-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                        selectedTime === slot.time
                          ? 'bg-cyan-500/20 border-2 border-cyan-400 text-cyan-700 backdrop-blur-sm'
                          : slot.isAvailable
                          ? 'bg-white/20 border border-white/30 text-gray-700 hover:bg-white/30 backdrop-blur-sm'
                          : 'bg-gray-200/20 border border-gray-300/30 text-gray-400 cursor-not-allowed backdrop-blur-sm'
                      }`}
                    >
                      <div className="text-lg font-semibold">{slot.label}</div>
                      <div className={`text-xs mt-1 ${
                        slot.isAvailable ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {slot.availableCount}/10 available
                      </div>
                      <div className={`text-xs mt-1 ${
                        slot.waitingTime === 0 ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {slot.waitingDisplay}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            {selectedTime && (
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="medical-btn"
                >
                  {loading ? 'Booking Appointment...' : 'Book Appointment'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;