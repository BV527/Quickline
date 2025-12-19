import { usePWA } from '@/hooks/usePWA';

const InstallPrompt = () => {
  const { isInstallable, installApp } = usePWA();

  if (!isInstallable) return null;

  const handleInstall = async () => {
    await installApp();
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Install Quickline</h3>
          <p className="text-sm text-blue-100">Add to home screen for better experience</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleInstall}
            className="bg-white text-blue-600 px-4 py-2 rounded font-medium text-sm"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;