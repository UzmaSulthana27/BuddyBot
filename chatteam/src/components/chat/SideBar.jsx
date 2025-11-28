import React, { useState } from "react";
import { Users, Plus, LogOut, X } from "lucide-react";
import ChannelList from "./ChannelList";
import CreateTeamModal from "../modals/CreateTeamModal";
import CreateChannelModal from "../modals/CreateChannelModal";

/**
 * Sidebar
 * Props:
 *  - user, teams, selectedChannel
 *  - onSelectChannel(channel)
 *  - onCreateTeam(workspaceName)  <-- will be called when CreateTeamModal creates
 *  - onCreateChannel(team, channelName)  <-- will be called when CreateChannelModal creates
 *  - onLogout()
 *  - isOpen, onClose()
 */
function Sidebar({
  user = { username: "User" },
  teams = [],
  selectedChannel = null,
  onSelectChannel = () => {},
  onCreateTeam = () => {},
  onCreateChannel = () => {},
  onLogout = () => {},
  isOpen = true,
  onClose = () => {},
}) {
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);

  // For channel modal
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [channelTeam, setChannelTeam] = useState(null);

  // Called by team modal: forward to parent & close modal
  const handleCreateWorkspace = (name) => {
    onCreateTeam(name);
    setShowCreateWorkspace(false);
  };

  // Open the channel modal for a given team (called from ChannelList)
  const openCreateChannelModal = (team) => {
    setChannelTeam(team);
    setShowCreateChannel(true);

    // Also optionally notify parent that creation flow started (keeps compatibility)
    // We intentionally do NOT call `onCreateChannel` here with just the team,
    // because the parent may expect (team, channelName) on final creation.
    // If your App expects only `team` to open a modal there, keep using that pattern.
  };

  // Called when CreateChannelModal submits a channel name
  const handleCreateChannelSubmit = (channelName) => {
    if (!channelTeam) {
      // defensive: fall back to calling parent without team if missing
      onCreateChannel(null, channelName);
    } else {
      // forward the created channel to parent: (team, channelName)
      onCreateChannel(channelTeam, channelName);
    }

    // close modal and clear
    setShowCreateChannel(false);
    setChannelTeam(null);
  };

  return (
    <>
      <div
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative z-30 w-64 text-white flex flex-col transition-transform duration-300 h-full`}
        style={{ background: "rgb(34, 14, 49)" }}
      >
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-white" />
              <h2 className="font-bold text-lg">ChatTeam</h2>
            </div>

            <div className="flex items-center gap-2">
              {/* My workspace label + plus button */}
              {/* <button
                onClick={() => setShowCreateWorkspace(true)}
                className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/6 transition"
                title="Create Workspace"
                aria-label="Create workspace"
              >
                <span className="text-sm">My workspace</span>
                <Plus className="w-4 h-4" />
              </button> */}

              {/* close on mobile */}
              <button onClick={onClose} className="md:hidden ml-2 p-1 rounded hover:bg-white/6">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Teams and Channels List */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          {teams && teams.length > 0 ? (
            teams.map((team) => (
              <ChannelList
                key={team.id}
                team={team}
                selectedChannel={selectedChannel}
                onSelectChannel={onSelectChannel}
                // When ChannelList signals "create channel", open the local modal
                onCreateChannel={() => openCreateChannelModal(team)}
              />
            ))
          ) : (
            <div className="px-3 py-4 text-sm text-slate-300">No workspaces yet. Create one to get started.</div>
          )}
        </div>

        {/* Footer with User Info and New Team */}
        <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <button
            onClick={() => setShowCreateWorkspace(true)}
            className="w-full bg-white/6 hover:bg-white/8 py-2 rounded-md flex items-center justify-center gap-2 mb-3 transition"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">New Team</span>
          </button>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                {user?.username ? user.username[0].toUpperCase() : "U"}
              </div>

              <div>
                <div className="text-sm font-medium">{user?.username ?? "Anonymous"}</div>
                <div className="text-xs text-slate-300">Online</div>
              </div>
            </div>

            <button onClick={onLogout} className="hover:bg-white/6 p-2 rounded-md">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Team Modal (rewritten) */}
      {showCreateWorkspace && (
        <CreateTeamModal
          onClose={() => setShowCreateWorkspace(false)}
          onCreate={handleCreateWorkspace}
        />
      )}

      {/* Create Channel Modal (rewritten) */}
      {showCreateChannel && (
        <CreateChannelModal
          onClose={() => {
            setShowCreateChannel(false);
            setChannelTeam(null);
          }}
          onCreate={handleCreateChannelSubmit}
        />
      )}
    </>
  );
}

export default Sidebar;
