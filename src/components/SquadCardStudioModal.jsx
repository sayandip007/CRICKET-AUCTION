// src/components/SquadCardStudioModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { TEAMS } from "../utils/constants";
import { toast } from "react-toastify";

export default function SquadCardStudioModal({
  isOpen,
  onClose,
  teams,
}) {
  const [selectedTeamId, setSelectedTeamId] = useState("csk");
  const [cardLayout, setCardLayout] = useState("portrait"); // 'portrait' | 'landscape'
  const canvasRef = useRef(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  const team = teams.find((t) => t.id === selectedTeamId) || teams[0] || TEAMS.csk;

  // Render High-Resolution Canvas Card
  useEffect(() => {
    if (!isOpen || !team) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isPortrait = cardLayout === "portrait";
    const width = isPortrait ? 900 : 1200;
    const height = isPortrait ? 1200 : 800;

    canvas.width = width;
    canvas.height = height;

    // Team color mapping
    const teamColors = {
      csk: { primary: "#facc15", secondary: "#1e3a8a", dark: "#0f172a" },
      mi: { primary: "#004ba0", secondary: "#d4af37", dark: "#051630" },
      rcb: { primary: "#d90429", secondary: "#d4af37", dark: "#180205" },
      kkr: { primary: "#3a225d", secondary: "#ecc94b", dark: "#1a0e2e" },
      dc: { primary: "#004c97", secondary: "#ef4444", dark: "#061830" },
      pbks: { primary: "#dc2626", secondary: "#e2e8f0", dark: "#200608" },
      rr: { primary: "#ea0089", secondary: "#004ba0", dark: "#220015" },
      srh: { primary: "#f97316", secondary: "#000000", dark: "#260f02" },
      gt: { primary: "#1b2133", secondary: "#d4af37", dark: "#0c0f18" },
      lsg: { primary: "#00a3e0", secondary: "#f59e0b", dark: "#031c27" },
    };

    const color = teamColors[team.id] || { primary: "#facc15", secondary: "#3b82f6", dark: "#0f172a" };

    // Background Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, color.dark);
    bgGradient.addColorStop(0.5, "#0b0f19");
    bgGradient.addColorStop(1, "#020408");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative geometric accents
    ctx.save();
    ctx.strokeStyle = color.primary;
    ctx.lineWidth = 10;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, width - 80, height - 80);
    ctx.restore();

    // Top Header Banner
    ctx.fillStyle = color.primary;
    ctx.fillRect(50, 50, width - 100, 130);

    // Header Text
    ctx.fillStyle = color.dark;
    ctx.font = "900 48px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(team.name.toUpperCase(), 80, 120);

    ctx.font = "bold 20px sans-serif";
    ctx.fillText("OFFICIAL SQUAD ROSTER • IPL MEGA AUCTION", 82, 155);

    // Metric Badges on Header Right
    ctx.textAlign = "right";
    ctx.font = "900 36px sans-serif";
    ctx.fillText(`₹${team.spent || 0} Cr SPENT`, width - 80, 115);

    ctx.font = "bold 20px sans-serif";
    ctx.fillText(`REMAINING PURSE: ₹${team.purse || 0} Cr`, width - 80, 150);

    // Sub-bar with Squad counts
    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
    ctx.fillRect(50, 195, width - 100, 55);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "left";
    const overseasCount = team.players ? team.players.filter((p) => p.country && p.country !== "India").length : 0;
    const totalPlayers = team.players ? team.players.length : 0;
    ctx.fillText(
      `SQUAD SIZE: ${totalPlayers} / 25   ·   OVERSEAS: ${overseasCount} / 8   ·   BALANCE GRADE: ${totalPlayers >= 18 ? "A (COMPLIANT)" : "INCOMPLETE"}`,
      80,
      230
    );

    // Render Players in Columns
    const players = team.players || [];
    const maxToDisplay = isPortrait ? 18 : 22;
    const displayList = players.slice(0, maxToDisplay);

    const cols = isPortrait ? 2 : 3;
    const colWidth = (width - 140) / cols;
    const startY = 280;
    const rowHeight = isPortrait ? 44 : 38;

    ctx.textAlign = "left";

    displayList.forEach((player, idx) => {
      const colIdx = Math.floor(idx / 9);
      const rowIdx = idx % 9;
      const x = 70 + colIdx * colWidth;
      const y = startY + rowIdx * (rowHeight + 12);

      // Card row background
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      ctx.fillRect(x, y, colWidth - 20, rowHeight);

      // Left Accent Strip
      ctx.fillStyle = color.primary;
      ctx.fillRect(x, y, 6, rowHeight);

      // Player Name
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 18px sans-serif";
      const nameText = `${idx + 1}. ${player.name} ${player.country !== "India" ? "✈️" : ""}`;
      ctx.fillText(nameText.length > 22 ? nameText.substring(0, 20) + "..." : nameText, x + 16, y + 26);

      // Role & Price
      ctx.fillStyle = color.primary;
      ctx.font = "900 16px sans-serif";
      ctx.textAlign = "right";
      const priceText = `₹${player.price || player.basePrice || 1} Cr`;
      ctx.fillText(priceText, x + colWidth - 30, y + 26);

      // Role Subtext
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(player.role?.toUpperCase() || "PLAYER", x + colWidth - 30, y + 40);

      ctx.textAlign = "left";
    });

    // Empty Slots notice if any
    if (players.length < 18) {
      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        `⚠️ SQUAD INCOMPLETE: Needs ${18 - players.length} more players to reach the mandatory 18-player minimum!`,
        width / 2,
        height - 110
      );
    }

    // Footer Watermark & Authenticity
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.font = "14px monospace";
    ctx.textAlign = "center";
    ctx.fillText("PRODUCED BY CRICKET AUCTION SIMULATOR • BRODCAST CERTIFIED • REAL-TIME AI ENGINE", width / 2, height - 55);

    // Save data URL for preview
    setImagePreviewUrl(canvas.toDataURL("image/png"));
  }, [isOpen, selectedTeamId, cardLayout, team, teams]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!imagePreviewUrl) return;
    const link = document.createElement("a");
    link.download = `${team.name.replace(/\s+/g, "_")}_Squad_Card.png`;
    link.href = imagePreviewUrl;
    link.click();
    toast.success(`Downloaded ${team.name} Squad Card! 📸`);
  };

  const handleCopyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error("Could not capture image blob.");
          return;
        }
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        toast.success("Squad Card copied to clipboard! Paste it anywhere.");
      });
    } catch (err) {
      console.warn("Direct image clipboard write failed, copying data URL:", err);
      if (imagePreviewUrl) {
        navigator.clipboard.writeText(imagePreviewUrl);
        toast.info("Image URL copied to clipboard!");
      }
    }
  };

  const handleCopyRosterJson = () => {
    const jsonStr = JSON.stringify(
      {
        franchise: team.name,
        spent: team.spent,
        purse: team.purse,
        players: (team.players || []).map((p) => ({
          name: p.name,
          role: p.role,
          price: p.price,
          country: p.country,
        })),
      },
      null,
      2
    );
    navigator.clipboard.writeText(jsonStr);
    toast.success("Roster JSON copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-gray-900 border border-gray-700 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950 via-gray-900 to-teal-950 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40">🖼️</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-black text-white">Graphical Squad Card Studio</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  HD Poster Export
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Generate and export broadcast-quality PNG squad cards for Twitter, Instagram, or Discord.
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

        {/* Controls Toolbar */}
        <div className="p-4 bg-gray-950/80 border-b border-gray-800 flex flex-wrap items-center justify-between gap-3">
          {/* Franchise Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400">Franchise:</span>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="bg-gray-900 border border-gray-700 px-3 py-1.5 rounded-xl text-xs font-bold text-yellow-400 focus:outline-none focus:border-yellow-500"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({(t.players || []).length} players)
                </option>
              ))}
            </select>
          </div>

          {/* Aspect Ratio */}
          <div className="flex items-center gap-1.5 bg-gray-900 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => setCardLayout("portrait")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                cardLayout === "portrait"
                  ? "bg-yellow-400 text-black font-extrabold shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              📱 4:5 Portrait
            </button>
            <button
              onClick={() => setCardLayout("landscape")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                cardLayout === "landscape"
                  ? "bg-yellow-400 text-black font-extrabold shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              💻 16:9 Landscape
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyToClipboard}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs rounded-xl transition"
            >
              📋 Copy Image
            </button>
            <button
              onClick={handleCopyRosterJson}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs rounded-xl transition"
            >
              📄 Copy JSON
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition"
            >
              ⬇️ Download PNG
            </button>
          </div>
        </div>

        {/* Preview Container */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 flex items-center justify-center bg-gray-950/40">
          <canvas ref={canvasRef} className="hidden" />

          {imagePreviewUrl ? (
            <div className="relative max-h-[60vh] max-w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
              <img
                src={imagePreviewUrl}
                alt="Squad Card Preview"
                className="max-h-[60vh] max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              Generating High-Resolution Squad Card...
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-950 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
          <span>Resolution: {cardLayout === "portrait" ? "900 x 1200 px" : "1200 x 800 px"} · 300 DPI Broadcast Quality</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition"
          >
            Close Studio
          </button>
        </div>
      </div>
    </div>
  );
}
