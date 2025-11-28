import { Hash, Bot, Menu } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

function ChatArea({ 
  channel, 
  team, 
  messages, 
  onSendMessage,
  onFileUpload,
  aiTyping,
  onOpenSidebar
}) {
  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <Hash className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-xl">Select a channel to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Channel Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={onOpenSidebar} className="md:hidden">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          {channel.name === 'ai-help' ? (
            <Bot className="w-5 h-5 text-purple-600" />
          ) : (
            <Hash className="w-5 h-5 text-gray-600" />
          )}
          <div>
            <h3 className="font-semibold text-gray-800">{channel.name}</h3>
            <p className="text-xs text-gray-500">{team?.name}</p>
          </div>
        </div>
        {channel.name === 'ai-help' && (
          <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
            AI Enabled
          </div>
        )}
      </div>

      {/* Messages */}
      <MessageList messages={messages} aiTyping={aiTyping} />

      {/* Input */}
      <MessageInput 
        onSendMessage={onSendMessage}
        onFileUpload={onFileUpload}
        channelName={channel.name}
      />
    </div>
  );
}

export default ChatArea;