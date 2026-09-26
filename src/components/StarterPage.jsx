import React, { useState } from "react";
import { initialIplTeams } from "../utils/constants";

export const StarterPage = ({
  onStartSolo,
  onStartMultiplayer,
  onOpenRosterStudio,
  activeRosterPreset,
  hasSavedSession,
  onResumeSession,
}) => {
  const [showQuickGuide, setShowQuickGuide] = useState(false);

  const getPresetName = () => {
    if (activeRosterPreset === "2008_vintage") return "1998–2008 Historic Inaugural";
    if (activeRosterPreset === "legends") return "All-Time Legends & T20 Titans";
    return "Official IPL 2025 Mega Auction";
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex flex-col items-center justify-between p-4 md:p-8 relative overflow-hidden select-none">
      {/* Background Stadium Glow & Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-yellow-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Top Bar */}
      <header className="w-full max-w-7xl flex flex-wrap items-center justify-between gap-3 z-10 py-2 border-b border-gray-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-yellow-400 via-amber-500 to-yellow-600 flex items-center justify-center font-black text-black text-xl shadow-lg shadow-yellow-500/20">
            IPL
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black text-white tracking-tight leading-tight">
              Cricket Auction Simulator
            </h1>
            <p className="text-[11px] text-gray-400 font-medium">
              Official T20 Mega Auction & Matchday Arena
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQuickGuide(true)}
            className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-yellow-400/50 rounded-xl text-xs font-bold text-gray-300 hover:text-white transition-all flex items-center gap-1.5"
            title="Read how to play & auction rules"
          >
            <span>📖</span>
            <span>How to Play</span>
          </button>

          <button
            onClick={onOpenRosterStudio}
            className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-xl text-xs font-bold text-gray-300 transition-all flex items-center gap-1.5"
            title="Switch or customize player pool"
          >
            <span>✏️ Pool:</span>
            <span className="text-yellow-400 font-extrabold">{getPresetName()}</span>
          </button>
        </div>
      </header>

      {/* Saved Session Alert Banner (if exists) */}
      {hasSavedSession && (
        <div className="w-full max-w-4xl my-4 z-10 bg-gradient-to-r from-blue-950 via-indigo-950 to-purple-950 border-2 border-indigo-400 p-4 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📂</span>
            <div>
              <h4 className="font-black text-sm md:text-base text-yellow-300">
                Saved Auction Session Found!
              </h4>
              <p className="text-xs text-gray-300">
                You have an in-progress auction checkpoint saved in your browser.
              </p>
            </div>
          </div>
          <button
            onClick={onResumeSession}
            className="px-5 py-2 bg-green-500 hover:bg-green-400 text-black font-black text-xs rounded-xl shadow-lg transition-all active:scale-95"
          >
            ▶ Resume Saved Auction
          </button>
        </div>
      )}

      {/* Hero Centerpiece */}
      <main className="w-full max-w-5xl flex flex-col items-center text-center my-auto py-8 z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-500/20 border border-yellow-400/60 rounded-full text-yellow-300 font-extrabold text-xs uppercase tracking-widest mb-4 shadow-lg shadow-yellow-500/10">
          <span>⚡ Official IPL 2025 Regulations & RTM Rules</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none mb-4">
          Experience the <span className="bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">Mega Auction</span>
        </h1>

        <p className="text-sm md:text-lg text-gray-300 max-w-2xl mb-8 leading-relaxed font-normal">
          Take the owner&apos;s seat. Manage ₹120 Crore purses, execute multi-slab player retentions, battle tactical AI in bidding wars, wield Right to Match (RTM) cards, and build your championship Playing XI!
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8 w-full max-w-md">
          <button
            onClick={onStartSolo}
            className="w-full sm:w-auto flex-1 min-w-[200px] py-4 px-6 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-sm md:text-base rounded-2xl shadow-xl shadow-yellow-500/25 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
          >
            <span>🚀 Enter Auction Arena</span>
            <span className="text-lg">→</span>
          </button>

          <button
            onClick={onStartMultiplayer}
            className="w-full sm:w-auto flex-1 min-w-[180px] py-4 px-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white font-extrabold text-sm md:text-base rounded-2xl shadow-xl shadow-indigo-600/25 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
          >
            <span>👥 Pass & Play Mode</span>
          </button>
        </div>

        {/* 10 Franchises Preview Bar */}
        <div className="w-full max-w-4xl bg-gray-900/60 backdrop-blur-md border border-gray-800 p-3 rounded-2xl mb-8">
          <p className="text-[11px] text-gray-400 font-bold mb-2 uppercase tracking-wider">
            10 Official IPL Franchises Ready for Draft:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
            {initialIplTeams.map((t) => (
              <span
                key={t.id}
                className="px-2.5 py-1 rounded-xl bg-gray-800/90 border border-gray-700 text-gray-200 font-bold text-xs flex items-center gap-1"
              >
                <span className="font-mono text-yellow-400">{t.shortName}</span>
                <span className="text-[10px] text-gray-400 hidden sm:inline">{t.name.split(" ")[0]}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full text-left">
          <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 hover:border-yellow-400/50 transition-all shadow-md group">
            <div className="w-9 h-9 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-lg mb-2.5 group-hover:scale-110 transition-transform">
              🏛️
            </div>
            <h3 className="font-bold text-white text-sm mb-1">Authentic Mega Rules</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Max 6 retentions, 18–25 squad limits, 8 overseas ceiling, and 11+ structured sets with accelerated rounds.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 hover:border-indigo-400/50 transition-all shadow-md group">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-lg mb-2.5 group-hover:scale-110 transition-transform">
              ⚡
            </div>
            <h3 className="font-bold text-white text-sm mb-1">Right to Match (RTM)</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Official RTM card count (6 minus retentions) with 3-stage challenge raise and match decision duels.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 hover:border-green-400/50 transition-all shadow-md group">
            <div className="w-9 h-9 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center text-lg mb-2.5 group-hover:scale-110 transition-transform">
              🏏
            </div>
            <h3 className="font-bold text-white text-sm mb-1">Playing XI & Match Sim</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Build your starting lineup, calculate chemistry score, and simulate an entire 45-match season & playoffs!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 hover:border-purple-400/50 transition-all shadow-md group">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-lg mb-2.5 group-hover:scale-110 transition-transform">
              🎙️
            </div>
            <h3 className="font-bold text-white text-sm mb-1">3D Gavel & Voice FX</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Procedural Web Audio oak strikes, 3-stage tension ticks, and live synthesized auctioneer commentary.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl pt-4 border-t border-gray-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 z-10">
        <div>
          <span>IPL Cricket Auction Simulator</span> • <span>React 18 & Vite</span> • <span>Tailwind CSS</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowQuickGuide(true)}
            className="text-yellow-400/80 hover:text-yellow-300 font-semibold"
          >
            📖 Open Documentation & Guide
          </button>
          <span>•</span>
          <span className="text-gray-400">100% Client-Side • LocalStorage Auto-Save</span>
        </div>
      </footer>

      {/* Quick Guide & Rules In-App Modal */}
      {showQuickGuide && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-fadeIn">
          <div className="bg-gray-900 border-2 border-yellow-500/80 rounded-3xl max-w-2xl w-full p-6 text-white max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📖</span>
                <h3 className="font-black text-lg md:text-xl text-yellow-400">
                  Quick Start & Auction Rules
                </h3>
              </div>
              <button
                onClick={() => setShowQuickGuide(false)}
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center font-bold text-gray-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs md:text-sm text-gray-300 leading-relaxed">
              <section className="bg-gray-950 p-3.5 rounded-xl border border-gray-800">
                <h4 className="font-bold text-white text-sm mb-1.5 flex items-center gap-1.5">
                  <span className="text-yellow-400">1.</span> Choosing Your Mode & Team
                </h4>
                <p>
                  • <strong>Solo Career:</strong> Pick any 1 of the 10 franchises. The remaining 9 are steered by tactical AI personas with role quotas and budget pacing.<br />
                  • <strong>Pass & Play Multiplayer:</strong> Control between 2 to 10 human franchises on one device. Switch active bidding paddles or place direct bids per team.
                </p>
              </section>

              <section className="bg-gray-950 p-3.5 rounded-xl border border-gray-800">
                <h4 className="font-bold text-white text-sm mb-1.5 flex items-center gap-1.5">
                  <span className="text-yellow-400">2.</span> Budget & Squad Limits
                </h4>
                <p>
                  • Starting Purse: <strong>₹120.00 Crore</strong> per team.<br />
                  • Squad Size: <strong>18 to 25 players</strong> total.<br />
                  • Overseas Limit: <strong>Maximum 8 overseas players</strong>.<br />
                  • Minimum Reserve: You must maintain enough purse to sign minimum base price players (₹30L) to reach 18 players.
                </p>
              </section>

              <section className="bg-gray-950 p-3.5 rounded-xl border border-gray-800">
                <h4 className="font-bold text-white text-sm mb-1.5 flex items-center gap-1.5">
                  <span className="text-yellow-400">3.</span> Retentions & RTM Cards
                </h4>
                <p>
                  • Maximum <strong>6 retentions</strong> total (max 5 capped, max 2 uncapped).<br />
                  • Capped Slabs: Slot 1: ₹18 Cr | Slot 2: ₹14 Cr | Slot 3: ₹11 Cr | Slot 4: ₹18 Cr | Slot 5: ₹14 Cr.<br />
                  • Uncapped Slab: ₹4 Cr flat.<br />
                  • <strong>Right to Match (RTM) Formula:</strong> 6 minus Retained Players. RTMs give you the power to challenge and reclaim your former player during the live auction!
                </p>
              </section>

              <section className="bg-gray-950 p-3.5 rounded-xl border border-gray-800">
                <h4 className="font-bold text-white text-sm mb-1.5 flex items-center gap-1.5">
                  <span className="text-yellow-400">4.</span> Dynamic Bidding Increments
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono my-1">
                  <div className="bg-gray-900 p-2 rounded border border-gray-800">Bid &lt; ₹1 Cr: +₹0.05 Cr (5L)</div>
                  <div className="bg-gray-900 p-2 rounded border border-gray-800">₹1 Cr–₹2 Cr: +₹0.10 Cr (10L)</div>
                  <div className="bg-gray-900 p-2 rounded border border-gray-800">₹2 Cr–₹5 Cr: +₹0.20 Cr (20L)</div>
                  <div className="bg-gray-900 p-2 rounded border border-gray-800">Bid &gt; ₹5 Cr: +₹0.50 Cr (50L)</div>
                </div>
                <p className="text-[11px] text-gray-400">
                  Quick-jump buttons (+₹1 Cr, +₹2 Cr) allow you to accelerate bidding instantly!
                </p>
              </section>

              <section className="bg-gray-950 p-3.5 rounded-xl border border-gray-800">
                <h4 className="font-bold text-white text-sm mb-1.5 flex items-center gap-1.5">
                  <span className="text-yellow-400">5.</span> Post-Auction Playing XI & Season Sim
                </h4>
                <p>
                  Once the auction ends, head over to the <strong>Playing XI Builder</strong> to construct your lineup (enforces max 4 overseas, min 1 keeper, min 5 bowlers), calculate your Chemistry Rating, and simulate an entire 45-match IPL Season with Playoffs!
                </p>
              </section>

              <section className="bg-gray-950 p-3.5 rounded-xl border border-gray-800">
                <h4 className="font-bold text-white text-sm mb-1.5 flex items-center gap-1.5">
                  <span className="text-yellow-400">6.</span> Strategic Franchise Management & Multi-Year
                </h4>
                <p>
                  • <strong>Impact Player Rule:</strong> Nominate 5 substitutes and execute tactical 12th man swaps during simulated matches.<br />
                  • <strong>Transfer Window & Trades:</strong> Propose player swaps and cash deals with AI evaluated on squad balance and salary caps.<br />
                  • <strong>Form & Fatigue:</strong> Track streaks (🔥 On Fire to ⚠️ Fatigued) and rotate bowlers across a 14-match season.<br />
                  • <strong>Multi-Year Mini-Auctions:</strong> Carry rosters into Season 2 and 3, release deadweight, and draft rising rookie prodigies!
                </p>
              </section>

              <section className="bg-gray-950 p-3.5 rounded-xl border border-gray-800">
                <h4 className="font-bold text-white text-sm mb-1.5 flex items-center gap-1.5">
                  <span className="text-yellow-400">7.</span> Broadcast Skins, Analytics & Social Reactions
                </h4>
                <p>
                  • <strong>TV Broadcast Skins:</strong> Toggle between 6 high-contrast, authentic broadcast packages: <em>Star Sports 1 HD (Royal Studio Blue & Gold)</em>, <em>Sony MAX (Classic Crimson & Gold Flame)</em>, <em>JioCinema (Cyberpunk Neon Magenta & Cyan)</em>, <em>Lord&apos;s Pavilion (Forest Green & Heritage Gold)</em>, <em>IPL Arena (Obsidian Dark)</em>, and <em>DLF 2008 Vintage Retro</em>.<br />
                  • <strong>Worm & Manhattan Charts:</strong> Interactive run-rate curves, over-by-over run bars, and wicket markers for all match simulations.<br />
                  • <strong>Simulated Social Wire & Pundit Grades:</strong> Real-time analyst tweets on sales/steals, and post-auction franchise report cards graded from <strong>A+ to F</strong>.<br />
                  • <strong>Batter vs Bowler Matrix:</strong> Inspect head-to-head records (Kohli vs Bumrah, Rohit vs Boult, Dhoni vs Narine) with strike rates, dismissals, and tactical advice!
                </p>
              </section>

              <section className="bg-gray-950 p-3.5 rounded-xl border border-gray-800">
                <h4 className="font-bold text-white text-sm mb-1.5 flex items-center gap-1.5">
                  <span className="text-yellow-400">8.</span> Online Rooms, Dedicated Host & HD Squad Cards
                </h4>
                <p>
                  • <strong>Multiplayer Cloud Rooms:</strong> Join rooms via custom room codes (<code>IPL-2025</code>) with zero-latency synchronization via BroadcastChannel and cross-device WebRTC P2P!<br />
                  • <strong>Live Sledge & Banter Box:</strong> Real-time chat with fellow franchise managers to banter and sledge during high-stakes bidding duels.<br />
                  • <strong>Dedicated Auctioneer Podium:</strong> Take the podium as the Live Host with gavel controls (Going Once, Going Twice, SOLD!), customizable countdown speeds, and full soundboard FX.<br />
                  • <strong>HD Squad Card Studio:</strong> Export broadcast-quality 4:5 Instagram & 16:9 wallpaper PNG posters of your squad with custom franchise colors.<br />
                  • <strong>Community Roster Hub:</strong> Load legendary rosters (RCB 2016, MI 2020, CSK 2018, All-Time GOATs) directly into the tournament match simulator!
                </p>
              </section>

              <section className="bg-gray-950 p-3.5 rounded-xl border border-gray-800">
                <h4 className="font-bold text-white text-sm mb-1.5 flex items-center gap-1.5">
                  <span className="text-yellow-400">9.</span> Global T20 Leagues & Custom Tournament Sandbox
                </h4>
                <p>
                  • <strong>World Franchise Leagues:</strong> Switch active tournaments to the <strong>Big Bash League (BBL)</strong>, <strong>SA20</strong>, <strong>Major League Cricket (MLC USA)</strong>, <strong>Pakistan Super League (PSL)</strong>, or <strong>Caribbean Premier League (CPL)</strong> with authentic team rosters, currencies, and purse caps.<br />
                  • <strong>T20 World Cup International Draft:</strong> Lead 10 national teams (India, Australia, England, South Africa, Pakistan, New Zealand, West Indies, Afghanistan, Sri Lanka, USA) through a World T20 draft and championship tournament!<br />
                  • <strong>Custom Tournament Sandbox:</strong> Create custom tournaments with customizable purse (₹20 Cr to ₹200 Cr), team count (4 to 10), overseas quotas (0 to 11), squad limits, and timer speeds!
                </p>
              </section>
            </div>

            <div className="mt-5 pt-3 border-t border-gray-800 flex justify-end">
              <button
                onClick={() => setShowQuickGuide(false)}
                className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs rounded-xl shadow-md"
              >
                Got It! Let&apos;s Play
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
