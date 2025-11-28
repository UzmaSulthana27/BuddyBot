import { useState } from "react";
import { X, Plus, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateTeamModal({ onClose, onCreate }) {
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState("");

  const handleCreate = () => {
    if (!teamName.trim()) {
      setError("Team name is required");
      return;
    }

    setError("");

    // *** important: match channel modal behaviour ***
    onCreate(teamName.trim(), { origin: "sidebar" });

    setTeamName("");
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 180, damping: 15 }}
          className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
          style={{ backgroundColor: "rgba(255,255,255,0.96)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-[rgb(34,14,49)] flex items-center gap-2">
              <Users size={20} /> Create Team
            </h2>

            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-slate-100"
            >
              <X size={20} className="text-slate-600" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            <label className="text-sm font-medium text-slate-700">
              Team Name
            </label>

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-[rgb(34,14,49)]">
              <Plus size={18} className="text-slate-500" />

              <input
                autoFocus
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="Development, Marketing, Design..."
                className="flex-1 bg-transparent outline-none text-slate-800 placeholder-slate-400"
              />
            </div>

            {error && <p className="text-sm text-rose-600">{error}</p>}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-slate-200 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
            >
              Cancel
            </button>

            <button
              onClick={handleCreate}
              className="px-4 py-2 rounded-lg text-white shadow-lg transition"
              style={{ backgroundColor: "rgb(34, 14, 49)" }}
            >
              Create
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
