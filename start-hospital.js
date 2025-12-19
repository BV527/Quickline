const { spawn } = require('child_process');
const path = require('path');

console.log('🏥 Starting Hospital OPD System...\n');

// Kill any existing processes on port 5000
const killPort = spawn('cmd', ['/c', 'netstat -ano | findstr :5000'], { stdio: 'pipe' });
killPort.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach(line => {
    if (line.includes('LISTENING')) {
      const pid = line.trim().split(/\s+/).pop();
      if (pid && !isNaN(pid)) {
        console.log(`🔄 Killing existing process on port 5000 (PID: ${pid})`);
        spawn('cmd', ['/c', `taskkill /PID ${pid} /F`], { stdio: 'inherit' });
      }
    }
  });
  
  // Wait a moment then start backend
  setTimeout(startBackend, 2000);
});

killPort.on('error', () => {
  // No existing process, start directly
  startBackend();
});

function startBackend() {
  console.log('🚀 Starting Backend Server...');
  
  const backend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    shell: true
  });

  backend.on('error', (error) => {
    console.error('❌ Backend Error:', error.message);
  });

  // Wait for backend to start, then start frontend
  setTimeout(startFrontend, 5000);
}

function startFrontend() {
  console.log('🎨 Starting Frontend Server...');
  
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'inherit',
    shell: true
  });

  frontend.on('error', (error) => {
    console.error('❌ Frontend Error:', error.message);
  });

  console.log('\n✅ Hospital System Starting...');
  console.log('📱 Patient Portal: http://localhost:5173/patient/login');
  console.log('👨‍⚕️ Admin Portal: http://localhost:5173/admin/login');
  console.log('🔧 API Server: http://localhost:5000');
  console.log('\n👤 Admin Login: admin@hospital.com / admin123');
}

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Hospital System...');
  process.exit(0);
});