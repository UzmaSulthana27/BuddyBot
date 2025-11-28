import { Bot } from 'lucide-react';

function Message({ message }) {
  return (
    <div className="flex items-start space-x-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
        message.isAI ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white'
      }`}>
        {message.isAI ? (
          <Bot className="w-5 h-5" />
        ) : (
          message.username[0].toUpperCase()
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-baseline space-x-2">
          <span className={`font-semibold ${message.isAI ? 'text-purple-600' : 'text-gray-800'}`}>
            {message.username}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <p className={`text-gray-700 mt-1 ${message.isFile ? 'font-medium text-blue-600' : ''}`}>
          {message.text}
        </p>
      </div>
    </div>
  );
}

export default Message;