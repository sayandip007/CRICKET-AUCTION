import React, { useState } from "react";

export default function MatchWormChart({ matchResult }) {
  const [activeView, setActiveView] = useState("WORM"); // 'WORM' | 'MANHATTAN'

  if (!matchResult || !matchResult.inn1 || !matchResult.inn2) return null;

  const { inn1, inn2, battingFirstTeam, bowlingFirstTeam } = matchResult;

  // Compute cumulative run curves for 20 overs
  const team1Overs = inn1.overLog || [];
  const team2Overs = inn2.overLog || [];

  const maxOvers = 20;
  const maxRuns = Math.max(inn1.totalRuns, inn2.totalRuns, 180) + 15;

  // SVG Coordinates calculation for Worm Graph
  const svgWidth = 600;
  const svgHeight = 240;
  const padding = { top: 20, right: 30, bottom: 30, left: 45 };

  const chartW = svgWidth - padding.left - padding.right;
  const chartH = svgHeight - padding.top - padding.bottom;

  const getX = (overNum) => padding.left + (overNum / maxOvers) * chartW;
  const getY = (runs) => padding.top + chartH - (runs / maxRuns) * chartH;

  // Build SVG Path for Innings 1
  let pathD1 = `M ${getX(0)} ${getY(0)}`;
  const points1 = [{ over: 0, runs: 0, wickets: 0, bowler: "" }];
  team1Overs.forEach((o) => {
    pathD1 += ` L ${getX(o.over)} ${getY(o.totalRuns)}`;
    points1.push(o);
  });

  // Build SVG Path for Innings 2
  let pathD2 = `M ${getX(0)} ${getY(0)}`;
  const points2 = [{ over: 0, runs: 0, wickets: 0, bowler: "" }];
  team2Overs.forEach((o) => {
    pathD2 += ` L ${getX(o.over)} ${getY(o.totalRuns)}`;
    points2.push(o);
  });

  return (
    <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 text-xs">
      {/* Header and Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">📈</span>
          <div>
            <h4 className="font-extrabold text-sm text-yellow-400">
              Interactive Match Analytics & Curves
            </h4>
            <p className="text-[10px] text-gray-400">
              Comparative run-rate worm curve & over-by-over Manhattan run bars
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => setActiveView("WORM")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeView === "WORM"
                ? "bg-yellow-500 text-black shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🐛 Worm Graph
          </button>
          <button
            onClick={() => setActiveView("MANHATTAN")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeView === "MANHATTAN"
                ? "bg-cyan-600 text-white shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🏙️ Manhattan Chart
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
          <span className="font-bold text-white">
            {battingFirstTeam.shortName}: {inn1.totalRuns}/{inn1.wickets}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
          <span className="font-bold text-white">
            {bowlingFirstTeam.shortName}: {inn2.totalRuns}/{inn2.wickets}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-400 text-[10px]">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
          <span>Wicket Fall</span>
        </div>
      </div>

      {/* View 1: Worm Curve */}
      {activeView === "WORM" && (
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[500px]">
            {/* Grid Lines */}
            {[0, 50, 100, 150, 200].map((r) => {
              if (r > maxRuns) return null;
              const y = getY(r);
              return (
                <g key={r}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={svgWidth - padding.right}
                    y2={y}
                    stroke="#27272a"
                    strokeDasharray="3,3"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    fill="#71717a"
                    fontSize="9"
                    textAnchor="end"
                    fontFamily="monospace"
                  >
                    {r}
                  </text>
                </g>
              );
            })}

            {/* Over Grid Lines (Powerplay, Middle, Death) */}
            {[6, 15, 20].map((ov) => {
              const x = getX(ov);
              return (
                <g key={ov}>
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + chartH}
                    stroke="#3f3f46"
                    strokeDasharray="2,2"
                  />
                  <text
                    x={x}
                    y={padding.top + chartH + 16}
                    fill="#a1a1aa"
                    fontSize="9"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {ov} ov
                  </text>
                </g>
              );
            })}

            {/* Worm Line 1 (Yellow) */}
            <path
              d={pathD1}
              fill="none"
              stroke="#eab308"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Wicket Indicators for Team 1 */}
            {points1.map((p, i) => {
              if (p.wickets > 0) {
                return (
                  <circle
                    key={`w1_${i}`}
                    cx={getX(p.over)}
                    cy={getY(p.totalRuns)}
                    r="4"
                    fill="#f43f5e"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                );
              }
              return null;
            })}

            {/* Worm Line 2 (Cyan) */}
            <path
              d={pathD2}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Wicket Indicators for Team 2 */}
            {points2.map((p, i) => {
              if (p.wickets > 0) {
                return (
                  <circle
                    key={`w2_${i}`}
                    cx={getX(p.over)}
                    cy={getY(p.totalRuns)}
                    r="4"
                    fill="#f43f5e"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                );
              }
              return null;
            })}
          </svg>
        </div>
      )}

      {/* View 2: Manhattan Chart (Runs per Over) */}
      {activeView === "MANHATTAN" && (
        <div className="w-full overflow-x-auto space-y-2 pt-1">
          <div className="grid grid-cols-20 gap-1 text-center font-mono">
            {Array.from({ length: 20 }, (_, i) => i + 1).map((ov) => {
              const r1 = team1Overs.find((o) => o.over === ov)?.runs || 0;
              const w1 = team1Overs.find((o) => o.over === ov)?.wickets || 0;
              const r2 = team2Overs.find((o) => o.over === ov)?.runs || 0;
              const w2 = team2Overs.find((o) => o.over === ov)?.wickets || 0;

              return (
                <div key={ov} className="flex flex-col items-center justify-end h-32">
                  <div className="flex items-end gap-0.5 h-24 w-full justify-center">
                    {/* Team 1 Bar */}
                    <div
                      style={{ height: `${Math.min(100, (r1 / 24) * 100)}%` }}
                      className="w-2 rounded-t bg-yellow-400 relative group cursor-pointer"
                      title={`${battingFirstTeam.shortName} Over ${ov}: ${r1} runs${w1 > 0 ? ` (${w1}W)` : ""}`}
                    >
                      {w1 > 0 && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-rose-500" />
                      )}
                    </div>

                    {/* Team 2 Bar */}
                    <div
                      style={{ height: `${Math.min(100, (r2 / 24) * 100)}%` }}
                      className="w-2 rounded-t bg-cyan-400 relative group cursor-pointer"
                      title={`${bowlingFirstTeam.shortName} Over ${ov}: ${r2} runs${w2 > 0 ? ` (${w2}W)` : ""}`}
                    >
                      {w2 > 0 && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-rose-500" />
                      )}
                    </div>
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1">{ov}</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 px-1 pt-1 border-t border-gray-900">
            <span>Powerplay (1-6)</span>
            <span>Middle Overs (7-15)</span>
            <span>Death Overs (16-20)</span>
          </div>
        </div>
      )}
    </div>
  );
}
