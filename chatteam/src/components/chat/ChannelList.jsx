import { Hash, Bot, Plus } from 'lucide-react';

function ChannelList({ team, selectedChannel, onSelectChannel, onCreateChannel }) {
  return (
    <div className="mb-4">
      {/* Team Header */}
      <div className="px-4 py-2 bg-purple-800/50 font-semibold text-sm flex items-center justify-between">
        <span>{team.name}</span>
        <button
          onClick={onCreateChannel}
          className="hover:bg-purple-700 p-1 rounded"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Channel List */}
      {team.channels.map(channel => (
        <button
          key={channel.id}
          onClick={() => onSelectChannel(team, channel)}
          className={`w-full px-6 py-2 text-left hover:bg-purple-800/50 flex items-center space-x-2 ${
            selectedChannel?.id === channel.id ? 'bg-purple-700' : ''
          }`}
        >
          {channel.name === 'ai-help' ? (
            <Bot className="w-4 h-4" />
          ) : (
            <Hash className="w-4 h-4" />
          )}
          <span>{channel.name}</span>
        </button>
      ))}
    </div>
  );
}

export default ChannelList;