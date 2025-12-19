import { Link } from 'react-router-dom';

const SystemSelector = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏥 Hospital Management System
          </h1>
          <p className="text-xl text-gray-600">
            Choose your access portal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Hospital System */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-200 hover:border-blue-400 transition-colors">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🏥</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Hospital OPD System
              </h2>
              <p className="text-gray-600">
                Modern appointment booking and queue management
              </p>
            </div>

            <div className="space-y-4">
              <Link
                to="/patient/login"
                className="block w-full btn-primary text-center"
              >
                👤 Patient Portal
              </Link>
              
              <Link
                to="/admin/login"
                className="block w-full btn-secondary text-center"
              >
                👨‍⚕️ Hospital Admin
              </Link>

              <div className="text-sm text-gray-500 mt-4">
                <p><strong>Admin:</strong> admin@hospital.com / admin123</p>
                <p><strong>Features:</strong> Appointments, Real-time Queue, OTP Verification</p>
              </div>
            </div>
          </div>

          {/* Legacy System */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200 hover:border-gray-400 transition-colors">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📋</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Legacy Queue System
              </h2>
              <p className="text-gray-600">
                Simple walk-in queue management
              </p>
            </div>

            <div className="space-y-4">
              <Link
                to="/queue"
                className="block w-full btn-secondary text-center"
              >
                🎫 Join Queue
              </Link>
              
              <Link
                to="/admin/login"
                className="block w-full btn-secondary text-center"
              >
                ⚙️ Legacy Admin
              </Link>

              <div className="text-sm text-gray-500 mt-4">
                <p><strong>Admin:</strong> admin / admin123</p>
                <p><strong>Features:</strong> Simple Queue, Ticket System</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              <strong>📱 Mobile Access:</strong> Use the Network URL from your terminal for mobile devices
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSelector;