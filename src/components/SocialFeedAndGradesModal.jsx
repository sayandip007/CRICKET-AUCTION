import React, { useState } from "react";
import { calculateFranchiseGrades } from "../utils/socialReactions";

export default function SocialFeedAndGradesModal({
  isOpen,
  onClose,
  socialPosts = [],
  teams = [],
}) {
  const [activeTab, setActiveTab] = useState("GRADES"); // 'GRADES' | 'SOCIAL'

  if (!isOpen) return null;

  const franchiseGrades = calculateFranchiseGrades(teams);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-50 p-3 sm:p-4 animate-fadeIn">
      <div className="bg-gray-900 border-2 border-yellow-500/80 rounded-3xl max-w-4xl w-full p-5 sm:p-6 text-white max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📰</span>
            <div>
              <h3 className="font-black text-lg md:text-xl text-yellow-400">
                Pundit Studio & Social Reaction Wire
              </h3>
              <p className="text-xs text-gray-400">
                Simulated cricket analyst commentary, viral fan chatter & post-auction franchise report cards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center font-bold text-gray-300 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-5">
          <div className="bg-gray-950 p-1 rounded-2xl border border-gray-800 flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab("GRADES")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === "GRADES"
                  ? "bg-yellow-500 text-black shadow-md shadow-yellow-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              📊 Expert Auction Report Cards (A+ to F)
            </button>
            <button
              onClick={() => setActiveTab("SOCIAL")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === "SOCIAL"
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span>💬 Live Fan & Pundit Feed</span>
              {socialPosts.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono">
                  {socialPosts.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab 1: Expert Franchise Grades */}
        {activeTab === "GRADES" && (
          <div className="space-y-4">
            <div className="p-3.5 bg-gradient-to-r from-yellow-950/40 via-gray-950 to-amber-950/40 border border-yellow-500/30 rounded-2xl flex items-center justify-between text-xs">
              <span className="text-gray-300">
                Grading criteria: <strong>Player Ratings</strong>, <strong>Role Balance (Keepers & Bowlers)</strong>, <strong>Squad Depth (18-25)</strong>, and <strong>Purse Efficiency</strong>.
              </span>
              <span className="font-extrabold text-yellow-400 font-mono">10 FRANCHISES GRADED</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {franchiseGrades.map((g) => (
                <div
                  key={g.team.id}
                  className="bg-gray-950 rounded-2xl border border-gray-800 p-4 hover:border-yellow-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-800/80">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3.5 h-3.5 rounded-full ${
                            g.team.headerColor || "bg-yellow-500"
                          }`}
                        />
                        <h4 className="font-black text-sm text-white">{g.team.name}</h4>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-xl font-black text-sm border font-mono ${g.gradeColor}`}
                      >
                        {g.grade}
                      </div>
                    </div>

                    <p className="text-xs text-gray-300 italic mb-3 leading-relaxed">
                      "{g.verdict}"
                    </p>

                    {/* Numerical breakdown */}
                    <div className="grid grid-cols-3 gap-2 text-center text-[11px] mb-3">
                      <div className="p-2 rounded-xl bg-gray-900 border border-gray-800">
                        <span className="text-gray-500 text-[10px] block">Avg Rating</span>
                        <span className="font-bold text-yellow-400 font-mono">
                          {g.avgRating}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-gray-900 border border-gray-800">
                        <span className="text-gray-500 text-[10px] block">Spent Purse</span>
                        <span className="font-bold text-green-400 font-mono">
                          ₹{g.spentBudget}Cr
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-gray-900 border border-gray-800">
                        <span className="text-gray-500 text-[10px] block">Roster Size</span>
                        <span className="font-bold text-cyan-300 font-mono">
                          {g.count} (✈ {g.overseas})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Role distribution tags */}
                  <div className="pt-2 border-t border-gray-900 flex items-center justify-between text-[10px] text-gray-400">
                    <span>🏏 {g.roles.batters} Bat</span>
                    <span>🧤 {g.roles.keepers} WK</span>
                    <span>⚡ {g.roles.allRounders} AR</span>
                    <span>🎯 {g.roles.bowlers} Bowl</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Live Fan & Pundit Feed */}
        {activeTab === "SOCIAL" && (
          <div className="space-y-3">
            {socialPosts.length === 0 ? (
              <div className="text-center py-12 bg-gray-950 rounded-2xl border border-gray-800">
                <span className="text-4xl block mb-2">📡</span>
                <h4 className="font-bold text-white text-sm">Feed Awaiting Auction Activity</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                  As bids are placed, players are sold, or RTM cards are deployed, live pundit hot-takes and fan tweets will populate here!
                </p>
              </div>
            ) : (
              socialPosts.slice().reverse().map((post) => (
                <div
                  key={post.id}
                  className="bg-gray-950 p-4 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all text-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm">
                        {post.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-white">{post.author}</span>
                          <span className="text-cyan-400 font-mono text-[11px]">{post.handle}</span>
                        </div>
                        <span className="text-[10px] text-gray-500">{post.role}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">{post.time}</span>
                  </div>

                  <p className="text-gray-200 text-sm leading-relaxed mb-3 font-medium">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-4 text-gray-400 text-[11px] pt-2 border-t border-gray-900">
                    <span className="flex items-center gap-1 hover:text-rose-400 transition-colors cursor-pointer">
                      ❤️ {post.likes}
                    </span>
                    <span className="flex items-center gap-1 hover:text-green-400 transition-colors cursor-pointer">
                      🔁 {post.retweets}
                    </span>
                    <span className="text-gray-600 text-[10px]">#IPL2025 #MegaAuction</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
