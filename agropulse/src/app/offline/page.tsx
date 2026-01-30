import { Wifi, WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-100 rounded-full animate-pulse"></div>
            <WifiOff className="h-20 w-20 text-orange-500 relative" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">You're Offline</h1>
        <p className="text-lg text-gray-600 mb-8">
          It looks like you've lost your internet connection, but don't worry—AgroPulse works offline!
        </p>

        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What can you do?</h2>
          <ul className="text-left space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-green-500 font-bold mt-1">✓</span>
              <span className="text-gray-600">Read previously loaded messages and listings</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 font-bold mt-1">✓</span>
              <span className="text-gray-600">Draft new messages and crop listings</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 font-bold mt-1">✓</span>
              <span className="text-gray-600">View cached market prices and data</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 font-bold mt-1">✓</span>
              <span className="text-gray-600">
                Your drafts will automatically sync when you're back online
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
          <Wifi className="h-8 w-8 text-blue-500 mx-auto mb-3" />
          <p className="text-gray-700">
            Your internet connection will be restored soon. AgroPulse will automatically sync your drafts and pending actions.
          </p>
        </div>
      </div>
    </div>
  );
}
