// src/components/MultiplayerRoomModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { TEAMS } from "../utils/constants";
import { toast } from "react-toastify";

export default function MultiplayerRoomModal({
  isOpen,
  onClose,
  activeRoomId,
  roomRole,
  roomTeamId,
  onJoinRoom,
  onLeaveRoom,
  syncEngine,
  onOpenHostConsole,
}) {
  const [inputRoomId, setInputRoomId] = useState(activeRoomId || "IPL-2025");
  const [selectedRole, setSelectedRole] = useState(roomRole || "manager");
  const [selectedTeam, setSelectedTeam] = useState(roomTeamId || "csk");
  const [userName, setUserName] = useState("Manager 1");
  const [chatMessages, setChatMessages] = useState([
    { id: 1, author: "System", text: "Welcome to IPL Cloud Auction Rooms. Real-time sync active via BroadcastChannel & WebRTC.", timestamp: "Just now" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [peerOfferToken, setPeerOfferToken] = useState("");
  const [peerAnswerToken, setPeerAnswerToken] = useState("");
  const [activeTab, setActiveTab] = useState("lobby"); // 'lobby' | 'webrtc' | 'rules'
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  if (!isOpen) return null;

  const handleCreateOrJoin = () => {
    if (!inputRoomId.trim()) {
      toast.error("Please enter a valid room code.");
      return;
    }
    onJoinRoom(inputRoomId.trim().toUpperCase(), selectedRole, selectedRole === "manager" ? selectedTeam : null, userName);
    toast.success(`Joined Room ${inputRoomId.trim().toUpperCase()} as ${selectedRole === "host" ? "Auctioneer Host" : selectedTeam.toUpperCase()}!`);
  };

  const handleSendChat = (e) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      id: Date.now(),
      author: selectedRole === "host" ? "🎙️ Host" : `${TEAMS[selectedTeam]?.name || userName}`,
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    if (syncEngine) {
      syncEngine.send("CHAT_MESSAGE", newMsg);
    }
    setChatInput("");
  };

  const handleGenerateOffer = async () => {
    if (!syncEngine) {
      toast.info("Please join the room first to initialize the engine.");
      return;
    }
    toast.info("Generating WebRTC Peer Token...");
    const token = await syncEngine.createOffer();
    if (token) {
      setPeerOfferToken(token);
      toast.success("Offer token generated! Send this to your friend on another device.");
    } else {
      toast.error("Could not generate offer token.");
    }
  };

  const handleAcceptOffer = async () => {
    if (!syncEngine || !peerOfferToken.trim()) {
      toast.error("Please provide a valid Offer Token.");
      return;
    }
    const answer = await syncEngine.acceptOffer(peerOfferToken.trim());
    if (answer) {
      setPeerAnswerToken(answer);
      toast.success("Answer token created! Send back to the host device.");
    }
  };

  const handleApplyAnswer = async () => {
    if (!syncEngine || !peerAnswerToken.trim()) {
      toast.error("Please provide an Answer Token.");
      return;
    }
    const ok = await syncEngine.applyAnswer(peerAnswerToken.trim());
    if (ok) {
      toast.success("WebRTC Peer connection established directly between devices!");
    } else {
      toast.error("Failed to apply answer token.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-gray-900 border border-gray-700 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-5 bg-gradient-to-r from-blue-950 via-gray-900 to-indigo-950 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 rounded-2xl bg-blue-500/20 border border-blue-500/30">🌐</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-black text-white">IPL Cloud Auction Rooms</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  Real-Time Sync
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Bid live with friends across multiple browser windows, tabs, or devices.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800 px-5 pt-2 gap-2 bg-gray-950/60">
          <button
            onClick={() => setActiveTab("lobby")}
            className={`px-4 py-2 text-xs font-black rounded-t-xl transition-all ${
              activeTab === "lobby"
                ? "bg-gray-900 text-yellow-400 border-t-2 border-yellow-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🏟️ Room Lobby & Chat
          </button>
          <button
            onClick={() => setActiveTab("webrtc")}
            className={`px-4 py-2 text-xs font-black rounded-t-xl transition-all ${
              activeTab === "webrtc"
                ? "bg-gray-900 text-cyan-400 border-t-2 border-cyan-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            📲 Cross-Device P2P Linking
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`px-4 py-2 text-xs font-black rounded-t-xl transition-all ${
              activeTab === "rules"
                ? "bg-gray-900 text-purple-400 border-t-2 border-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            📜 Multiplayer Guide
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === "lobby" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Room Settings & Role */}
              <div className="md:col-span-5 space-y-4">
                <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 space-y-3">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Room Configuration</h4>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">Room Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputRoomId}
                        onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
                        placeholder="e.g. IPL-2025"
                        className="bg-gray-900 border border-gray-700 px-3 py-2 rounded-xl text-sm font-black text-yellow-400 w-full tracking-wider focus:outline-none focus:border-yellow-500 uppercase"
                      />
                      <button
                        onClick={() => setInputRoomId(`IPL-${Math.floor(1000 + Math.random() * 9000)}`)}
                        className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-xl"
                        title="Random Room Code"
                      >
                        🎲
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">Display Name</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Your Name"
                      className="bg-gray-900 border border-gray-700 px-3 py-2 rounded-xl text-sm text-white w-full focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">Select Role</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: "manager", label: "🏏 Manager" },
                        { id: "host", label: "🎙️ Auctioneer" },
                        { id: "spectator", label: "👀 Spectator" },
                      ].map((r) => (
                        <button
                          key={r.id}
                          onClick={() => setSelectedRole(r.id)}
                          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center border ${
                            selectedRole === r.id
                              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/60"
                              : "bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-850"
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedRole === "manager" && (
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 block mb-1">Select Franchise</label>
                      <select
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        className="bg-gray-900 border border-gray-700 px-3 py-2 rounded-xl text-xs font-bold text-white w-full focus:outline-none focus:border-yellow-500"
                      >
                        {Object.values(TEAMS).map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} (₹{t.purse} Cr)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={handleCreateOrJoin}
                      className="w-full py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black rounded-xl text-xs shadow-lg shadow-yellow-500/20 transition-all uppercase tracking-wider"
                    >
                      {activeRoomId === inputRoomId ? "🔄 Update Room Role" : "🚀 Join / Host Room"}
                    </button>

                    {activeRoomId && (
                      <button
                        onClick={onLeaveRoom}
                        className="w-full py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold rounded-xl text-xs border border-rose-800/40 transition-all"
                      >
                        Leave Room
                      </button>
                    )}
                  </div>
                </div>

                {/* Host Shortcut */}
                {selectedRole === "host" && (
                  <div className="bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/40 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-black text-purple-200">Host Console Ready</h5>
                      <p className="text-[11px] text-purple-300/80">Manage gavel strikes & countdown speeds.</p>
                    </div>
                    <button
                      onClick={onOpenHostConsole}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl text-xs shadow-md transition"
                    >
                      Open Podium
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Live In-Room Chat & Activity */}
              <div className="md:col-span-7 flex flex-col bg-gray-950 rounded-2xl border border-gray-800 h-[380px] overflow-hidden">
                <div className="p-3 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-gray-200">
                      Room Channel: <span className="text-yellow-400 font-mono">{activeRoomId || inputRoomId}</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400">Zero-Latency P2P</span>
                </div>

                {/* Chat Feed */}
                <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="bg-gray-900/60 p-2.5 rounded-xl border border-gray-800/60">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-yellow-400 text-[11px]">{msg.author}</span>
                        <span className="text-[10px] text-gray-500">{msg.timestamp}</span>
                      </div>
                      <p className="text-gray-300 break-words">{msg.text}</p>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>

                {/* Quick Sledges */}
                <div className="px-3 py-1.5 bg-gray-900/40 border-t border-gray-800/60 flex items-center gap-1.5 overflow-x-auto text-[10px]">
                  <span className="text-gray-500 font-semibold shrink-0">Banter:</span>
                  {[
                    "Not letting you have him! 💸",
                    "Purse running dry? 😂",
                    "RTM Incoming! 🃏",
                    "Sold to us! 🏆",
                    "Going once... Going twice! 🔨",
                  ].map((sledge, i) => (
                    <button
                      key={i}
                      onClick={() => setChatInput(sledge)}
                      className="px-2 py-0.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 shrink-0 transition"
                    >
                      {sledge}
                    </button>
                  ))}
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSendChat} className="p-2.5 bg-gray-900 border-t border-gray-800 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Send a sledge or comment..."
                    className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs rounded-xl transition"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "webrtc" && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 space-y-3">
                <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                  <span>📱</span> Direct Peer-to-Peer Connection across Devices
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Connect a laptop and a smartphone directly without external servers. Device A generates an <strong>Offer Token</strong>, Device B accepts it and creates an <strong>Answer Token</strong>.
                </p>

                <div className="space-y-2 pt-2">
                  <label className="text-[11px] font-bold text-gray-300">1. Host Device: Create Offer</label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleGenerateOffer}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl"
                    >
                      Generate Offer Token
                    </button>
                    {peerOfferToken && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(peerOfferToken);
                          toast.success("Offer token copied!");
                        }}
                        className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-xl"
                      >
                        Copy Token 📋
                      </button>
                    )}
                  </div>
                  {peerOfferToken && (
                    <textarea
                      readOnly
                      value={peerOfferToken}
                      className="w-full bg-gray-900 border border-gray-700 p-2 rounded-xl text-[10px] font-mono text-cyan-300 h-20 overflow-y-auto"
                    />
                  )}
                </div>

                <div className="space-y-2 pt-3 border-t border-gray-800">
                  <label className="text-[11px] font-bold text-gray-300">2. Second Device: Paste Offer & Create Answer</label>
                  <textarea
                    placeholder="Paste Device A's Offer Token here..."
                    value={peerOfferToken}
                    onChange={(e) => setPeerOfferToken(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 p-2 rounded-xl text-[10px] font-mono text-white h-16"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAcceptOffer}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl"
                    >
                      Create Answer Token
                    </button>
                    {peerAnswerToken && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(peerAnswerToken);
                          toast.success("Answer token copied!");
                        }}
                        className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-xl"
                      >
                        Copy Answer 📋
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-gray-800">
                  <label className="text-[11px] font-bold text-gray-300">3. Host Device: Paste Answer Token</label>
                  <textarea
                    placeholder="Paste Device B's Answer Token here to finalize..."
                    value={peerAnswerToken}
                    onChange={(e) => setPeerAnswerToken(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 p-2 rounded-xl text-[10px] font-mono text-white h-16"
                  />
                  <button
                    onClick={handleApplyAnswer}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
                  >
                    Confirm Peer Connection 🤝
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "rules" && (
            <div className="bg-gray-950 p-5 rounded-2xl border border-gray-800 space-y-4 text-xs text-gray-300 leading-relaxed">
              <h4 className="text-sm font-black text-yellow-400">Multiplayer Room Architecture</h4>
              <p>
                <strong>1. Same-Device Multi-Tab Testing:</strong> Open two or more browser tabs or windows with the same Room Code (e.g. <code className="text-yellow-400 bg-gray-900 px-1 py-0.5 rounded">IPL-2025</code>). They synchronize instantaneously via the browser's native <code className="text-cyan-400">BroadcastChannel</code> API.
              </p>
              <p>
                <strong>2. Host & Managers Separation:</strong> One participant acts as the <strong>Live Auctioneer</strong>, controlling when the hammer falls and warning timers. Other players control their respective franchise paddles (CSK, MI, RCB, KKR) to bid against each other in real-time.
              </p>
              <p>
                <strong>3. Cross-Device Linking:</strong> For playing across different phones and PCs, use the <em>Cross-Device P2P Linking</em> tab to establish direct encrypted WebRTC data channels without needing third-party servers.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-950 border-t border-gray-800 flex items-center justify-between">
          <div className="text-[11px] text-gray-400">
            Status: {activeRoomId ? <span className="text-emerald-400 font-bold">🟢 Connected to {activeRoomId}</span> : <span className="text-yellow-500">⚪ In Standalone Mode</span>}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs rounded-xl transition"
          >
            Close Lobby
          </button>
        </div>
      </div>
    </div>
  );
}
