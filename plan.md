# Cricket Auction Simulator — Product Plan & Roadmap

## 1. Executive Summary
The **Cricket Auction Simulator** is an interactive, broadcast-grade IPL mega-auction simulation web application built with React 18, Vite, and Tailwind CSS. It accurately recreates the high-intensity atmosphere of a real Indian Premier League player auction with authentic multi-stage retention deduction slabs, dynamic incremental bidding, target-aware AI competitor personas, Right to Match (RTM) card challenge duels, procedural Web Audio gavel strikes, live speech commentary, squad chemistry evaluation, full 45-match tournament simulations, pass-and-play multiplayer, custom roster editing, and local state persistence.

---

## 2. Completed Features & Capabilities (Phase-Wise Breakdown)

### Phase 0: Core Foundation & Franchise Infrastructure
- **10 Official IPL Franchises**:
  - Chennai Super Kings (CSK), Mumbai Indians (MI), Royal Challengers Bengaluru (RCB), Kolkata Knight Riders (KKR), Delhi Capitals (DC), Rajasthan Royals (RR), Sunrisers Hyderabad (SRH), Punjab Kings (PBKS), Gujarat Titans (GT), Lucknow Super Giants (LSG).
- **Starting Budgets**:
  - ₹120.00 Crore base purse per franchise.
  - Real-time purse tracking, spent amount, remaining balance, and visual progress gauges.
- **Official Retention Deduction Slabs**:
  - Capped Retention Slabs: Slot 1 (₹18 Cr), Slot 2 (₹14 Cr), Slot 3 (₹11 Cr), Slot 4 (₹18 Cr), Slot 5 (₹14 Cr).
  - Uncapped Retention Slab: ₹4 Cr flat.
  - Retention caps: Maximum 6 retentions (max 5 capped, max 2 uncapped).
- **Interactive Team Roster (Drag-and-Drop)**:
  - Powered by `react-beautiful-dnd` to arrange batting order and bench order.
  - Visual breakdown by player role and overseas vs. domestic composition.
- **PDF Export via `jspdf`**:
  - Downloadable official summary report of all 10 squads, budgets, and auction ledger.

---

### Phase 1: Authentic Auction Rules, Sets & Tactical Mechanics
- **Right to Match (RTM) Card Suite (`RTMModals.jsx`)**:
  - Automatic RTM allocation formula: $\text{RTM Count} = \max(0, 6 - \text{Retained Players})$.
  - **3-Stage RTM Workflow**:
    1. *Stage 1 (Inquiry)*: Former team asked whether they wish to invoke their RTM card.
    2. *Stage 2 (Final Raise Challenge)*: Winning bidder granted one final chance to raise the bid to deter the RTM.
    3. *Stage 3 (Match Decision)*: Former team decides whether to match the raised price or let the player go.
- **11+ Structured Categorized Sets (`AuctionSetsModal.jsx` & `auctionRules.js`)**:
  - Marquee Set 1 (M1), Marquee Set 2 (M2), Capped Batsmen (BA1), Capped All-Rounders (AL1), Capped Wicketkeepers (WK1), Capped Fast Bowlers (FA1), Capped Spinners (SP1), and Uncapped Sets (UBA, UAL, UWK, UFA, USP).
  - Full set catalog viewer with player status badges (Sold, Unsold, Retained, Under Hammer).
- **Set Completion Interstitial (`SetCompletionModal.jsx`)**:
  - Modal transition after every set summarizing total spending, top buy, overseas count, and previewing the upcoming set.
- **Accelerated Round for Unsold Players (`AcceleratedRoundModal.jsx`)**:
  - Automatically activated when all regular sets conclude.
  - Unsold player recall shortlist with 50% base price discount and rapid 5-second countdown timer.
- **Official Squad Limits & Reserve Fund Protection**:
  - Squad ceiling of 18 to 25 players strictly enforced.
  - Maximum 8 overseas players limit strictly checked before every bid.
  - Purse reserve logic prevents teams from placing bids that would leave them unable to fill the 18-player minimum at base price (₹30 Lakhs).

---

### Phase 2: Target-Aware AI Intelligence & Rivalry Bidding Wars
- **Positional Need Matrices (`aiIntelligence.js`)**:
  - Real-time squad auditing tracking positional deficits: Openers, Middle Order, Finishers, Wicketkeepers, Pace All-Rounders, Spin All-Rounders, Death Bowlers, Powerplay Bowlers, and Mystery Spinners.
  - Urgency rating classification: *Critical, Urgent, Moderate, Filled, Surplus*.
- **Specialist Player Tagging**:
  - Identifies death-over specialists, mystery spinners, and stumper-finishers to trigger priority AI bidding.
- **Purse-Pacing Algorithm**:
  - Computes dynamic ₹/slot pacing status (*Splurge, Balanced, Conserving, Critical Safety*) to prevent AI teams from overspending early.
- **10 Authentic Franchise Strategic Personas**:
  - Distinct archetypes for each team (e.g. CSK veteran loyalty, MI superstar aggressive bidding, RR data-driven scouting, SRH bowling depth, PBKS purse flex).
- **IPL Rivalry Matrix & Dynamic Bidding Wars (`BiddingWarBanner.jsx`)**:
  - Historic rivalry pairs (CSK vs MI, KKR vs RCB, CSK vs RCB, MI vs DC) trigger high-tempo Bidding Wars.
  - Dynamic tempo acceleration, rapid counter-bids, valuation markups, animated neon banners, and warning sound cues.
- **Live AI Scouting Wire & Team Needs Modal (`TeamNeedsModal.jsx`)**:
  - Real-time tactical insight ticker beneath the player showcase card.
  - Comprehensive 10-franchise needs dashboard accessible from the top header.

---

### Phase 3: Squad Chemistry, Playing XI Builder & Match Simulator
- **Playing XI Builder (`PlayingXIModal.jsx`)**:
  - Interactive 11-player lineup selection with designated Captain (C) and Vice-Captain (VC).
  - Batting order configuration (Slots 1 to 11).
  - Enforces official match regulations: $\le 4$ overseas players, $\ge 1$ wicketkeeper, $\ge 5$ bowling options, and exactly 11 players.
- **Squad Chemistry Rating System ($0\text{–}100$)**:
  - Multi-dimensional rating calculating **Batting Power**, **Bowling Penetration**, **Balance & Versatility**, and **Big-Match Experience**.
  - Tier classification medals: **S-Tier (Championship Contender)**, **A-Tier (Playoff Contender)**, and **B/C-Tier (Rebuilding Squad)**.
- **Full 45-Match IPL Season & Tournament Simulator (`TournamentSimulatorModal.jsx`)**:
  - Realistic ball-by-ball probabilistic T20 match engine factoring powerplay, middle, and death phases.
  - Live 10-team Points Table with Matches Played, Won, Lost, Points, and Net Run Rate (NRR).
  - 4-Stage IPL Playoffs: Qualifier 1, Eliminator, Qualifier 2, and Grand Final.
  - Victory ceremony with championship trophy and celebratory confetti animations.
- **Single Exhibition Match**:
  - Custom head-to-head match simulation against any rival franchise across 4 distinct pitch conditions (*Batting Paradise, Spinners Web, Green Top Pace, Balanced Sporting Pitch*) with full scorecards and Player of the Match honors.

---

### Phase 4: Audio FX, 3D Gavel & Immersion
- **Procedural Web Audio Engine (`audioEffects.js`)**:
  - Zero external MP3 dependencies; generated entirely client-side via Web Audio API nodes.
  - Hardwood gavel strike: transient click + wooden cavity bandpass resonance + sub-bass body thump.
  - 3-stage countdown tension clock ticks (3s, 2s, 1s) with rising pitch frequencies.
  - Distinct sound cues for bid paddle pops, high-bid chimes, rivalry war horns, and sold applause.
- **Synthesized Voice Commentary**:
  - Live auctioneer voice commentary powered by the browser SpeechSynthesis API.
  - Calls out bid raises, "Going once... Going twice...", "SOLD!", and RTM invocations.
  - Phonetic normalization ensuring crisp Indian English pronunciation of crore values and player names.
- **3D Animated Gavel Podium (`GavelPodium.jsx`)**:
  - Wooden block and brass gavel with dynamic tilt angles ($-24^\circ, -48^\circ, -72^\circ, +18^\circ$).
  - Sound wave visualizer bars, impact shockwave rings, and 3-stage tension lamps.
- **Audio Settings Suite (`AudioSettingsModal.jsx`)**:
  - Master volume slider, SFX toggle, speech commentary toggle, voice persona selector, speech rate slider, and 6-button sound test pad.

---

### Phase 5: Multiplayer, Custom Rosters, Persistence & Onboarding
- **Pass-and-Play Multi-Manager Mode (`MultiplayerSettingsModal.jsx`)**:
  - Supports 1 to 10 human franchise managers playing locally on one device.
  - Sequential pre-auction retention queue with step indicator.
  - Active Paddle Selector and dedicated direct multi-franchise bid buttons.
  - Human vs. Human and Human vs. AI Right to Match (RTM) duels.
- **Custom Player Studio & JSON Import/Export (`PlayerEditorModal.jsx`)**:
  - Create new custom players with custom roles, base prices, ratings, and IPL stats.
  - Edit existing player attributes, valuations, or remove players from the active pool.
  - One-click JSON export and import of custom roster databases.
- **Authentic Vintage & Dream Presets (`vintageRosters.js`)**:
  - **2025 Official Mega Auction**: Modern pool of 500+ cricketers.
  - **1998–2008 Historic Inaugural Auction**: MS Dhoni, Sachin Tendulkar, Shane Warne, Adam Gilchrist, Glenn McGrath, Sanath Jayasuriya, etc.
  - **All-Time Legends & T20 Titans**: Chris Gayle, AB de Villiers, Lasith Malinga, Kieron Pollard, Suresh Raina, etc.
- **LocalStorage State Persistence & Checkpoint Recovery (`storageUtils.js`)**:
  - Real-time debounced auto-saving of all teams, squads, current bid, auction sets, timers, and ledgers.
  - Automatic detection of saved sessions with a one-click **"▶ Resume Saved Auction"** restore banner.
  - Manual save (`💾 Save`) and clean reset (`🔄 Reset`) controls.
- **Welcome Starter Page & Onboarding Hub (`StarterPage.jsx`)**:
  - High-impact landing page with stadium lighting, franchise preview marquee, and feature breakdown cards.
  - Direct CTA routing for **"🚀 Enter Auction Arena"** (Solo mode) and **"👥 Pass & Play Mode"** (Multiplayer mode).
  - Smooth back-navigation (`← Back to Welcome`) from the team selection modal.
  - Built-in **"📖 How to Play"** quick-reference modal for instant rule and increment lookup.
- **Comprehensive User Manual (`document.md`)**:
  - Standalone 15-chapter handbook detailing every rule, slab, dynamic bracket, RTM scenario, and winning strategy for new players.

---

### Phase 6: Strategic Franchise Management & In-Game Rules (Completed)
- **Impact Player Rule (12th Man Substitution) (`PlayingXIModal.jsx` & `squadSimulator.js`)**:
  - Nominate up to 5 substitutes and a designated 12th Man Impact Player from bench reserves before matches.
  - Situational mid-innings tactical swaps: 1st innings batting firepower reinforcement and 2nd innings death-over bowling defense.
  - Full match substitution telemetry logging in match scorecards.
- **Mid-Season Transfer Window & Player Trades (`TradeCenterModal.jsx`)**:
  - Dedicated multi-franchise trade console accessible from top bar, tournament simulator, and post-auction screen.
  - Player-for-player swaps and cash-plus-player transactions with dynamic budget adjustments.
  - Strict regulatory enforcement: 18–25 squad limits, 8 overseas ceiling, and budget solvency.
  - 3-factor algorithmic AI evaluation engine (talent score balance, positional squad need synergy, and financial value).
- **Dynamic Player Form Streaks & Fitness Fatigue Engine (`playerFormUtils.js`)**:
  - 5 dynamic tiers: 🔥 On Fire (+15%), ⚡ In Form (+8%), ⚪ Standard (1.0x), ❄️ Slump (-10%), and ⚠️ Fatigued (-14%).
  - Fast-bowler fatigue accumulation across consecutive 4-over spells; stamina restoration when rested on the bench.
  - Real-time rating adjustments and visual badges across Playing XI and match simulator.
- **Multi-Year Franchise Mode & Annual Mini-Auctions (`MiniAuctionModal.jsx`)**:
  - Year-over-year progression (Season 1 → Season 2 → Season 3) carrying existing squads forward.
  - Squad retention & release window: release underperforming players to recover contract funds into the purse.
  - Injection of high-potential rookie draft talents (Arjun Verma, Kwena Maphaka, Sameer Rizvi, Cooper Connolly, Allah Ghazanfar, Musheer Khan).
  - Fast-paced live mini-auction floor with AI purse pacing and instant roster signing.

---

### Phase 7: Advanced Visuals, Broadcast Overlays & Social Media Reactions (Completed)
- **Broadcast Television Skin Themes (`src/utils/themeStyles.js`)**:
  - 6 high-contrast, visually unmistakable broadcast packages:
    1. *Star Sports 1 HD*: Royal studio blue, 24K gold borders, and official TV graphics.
    2. *Sony MAX Extraaa Innings*: Classic scarlet crimson, ruby red studio, and blazing gold flame accents.
    3. *JioCinema Ultra Neon*: Cyberpunk cosmic violet, hot magenta, and electric cyan streaming aesthetics.
    4. *Lord's Pavilion Heritage*: Heritage British racing forest green, ivory cricket borders, and regal gold crests.
    5. *IPL Arena Stadium*: Carbon fiber obsidian dark arena with amber floodlights and sleek stadium ambiance.
    6. *DLF IPL 2008 Vintage Retro*: Warm sepia parchment, brass borders, and CRT broadcast scorebug aesthetics.
  - 1-Click TV Broadcast Switcher ribbon directly accessible on the main HUD and theme-adaptive surface styling across cards, controls, and buttons.
- **Beginner-Friendly Auction Option Deck & Bidding Station (`src/components/AuctionControlCenter.jsx` & `src/App.jsx`)**:
  - Streamlined option deck replacing clunky vertical lists with visual cards, 1-click theme switching, and a dedicated **💡 Simple Mode** for newcomers.
  - Redesigned Hero Raise Bid Paddle with prominent increment pill (`+₹0.20 Cr`), leading bid status indicators, and clear secondary actions (Pass & Hammer).
- **Interactive Match Worm & Manhattan Analytics Charts (`src/components/MatchWormChart.jsx`)**:
  - Vector SVG run-rate worm curve comparing Team 1 vs. Team 2 cumulative progression across 20 overs.
  - Interactive 20-over Manhattan bar charts displaying over-by-over runs and red dot wicket markers.
  - Fully embedded in `TournamentSimulatorModal.jsx` across both season league matches and quick exhibition matches.
- **Simulated Social Media Wire & Expert Franchise Report Cards (`src/utils/socialReactions.js` & `src/components/SocialFeedAndGradesModal.jsx`)**:
  - Live analyst and fan tweet ticker beneath the player showcase card with reactions to blockbuster bids, bargains, RTMs, and unsolds.
  - Pundit studio modal with 5 distinct commentator personas (Harsha B., Ian B., Aakash C., Simon D., CricFanatic).
  - Post-auction franchise report cards grading all 10 teams from **A+ to F** based on squad ratings, balance, and purse efficiency.
- **Head-to-Head Batter vs. Bowler Matchup Matrix (`src/data/headToHeadData.js` & `src/components/HeadToHeadModal.jsx`)**:
  - Curated face-off records between marquee IPL titans (Kohli vs Bumrah, Rohit vs Boult, Dhoni vs Narine, Klaasen vs Rashid, etc.).
  - Deterministic matchup generator (`synthesizeH2H`) capable of creating realistic head-to-head stats for any batter and bowler.
  - Strike rates, balls, dismissals, dot balls, boundary tallies, tactical tips, and expert verdicts.

---

### Phase 8: Real-Time Online Multiplayer & Cloud Rooms (Completed)
- **WebRTC / BroadcastChannel Cloud Auction Rooms (`src/utils/multiplayerSync.js` & `src/components/MultiplayerRoomModal.jsx`)**:
  - Real-time room synchronization via native `BroadcastChannel` (zero-latency multi-tab sync) and encrypted WebRTC DataChannel (cross-device P2P).
  - Join via custom room codes (`IPL-2025`), select roles (Auctioneer Host, Franchise Manager, or Spectator), and engage in the live banter & sledge box.
- **Dedicated Host / Auctioneer Gavel Mode (`src/components/AuctioneerHostModal.jsx`)**:
  - Live Auctioneer podium with gavel knockdown controls (Going Once, Going Twice, SOLD, UNSOLD).
  - Pacing governor with customizable timer countdown speeds (Manual host control, 3s Blitz, 5s Standard, 10s Tactical) and auction clock pause.
  - Interactive soundboard FX matrix (Gavel knock, tension ticks, warning gongs, outbid bells, sold fanfares).
- **Graphical Squad Cards & Social Share Studio (`src/components/SquadCardStudioModal.jsx`)**:
  - Broadcast-quality 300 DPI canvas-rendered team poster cards with official franchise colors, metrics, and full squad rosters.
  - Formats for 4:5 Instagram/Twitter portrait and 16:9 landscape wallpapers with direct PNG download and clipboard copy.
- **Community Roster Hub & Dream Squad Gallery (`src/components/CommunityRosterHubModal.jsx`)**:
  - Curated legendary squads (RCB 2016, MI 2020, CSK 2018, All-Time GOATs).
  - User custom squad publishing and direct loading into the tournament match simulator.

---

### Phase 9: Global T20 Leagues & Custom Tournament Creator (Completed)
- **Global T20 Franchise League Presets (`src/data/globalLeaguesData.js` & `src/components/GlobalLeaguesModal.jsx`)**:
  - Authentic presets for 5 global leagues:
    - 🇦🇺 **Big Bash League (BBL)**: 8 teams, A$20M purse, 4 overseas limit.
    - 🇿🇦 **SA20**: 6 teams, R40M purse, 5 overseas limit.
    - 🇺🇸 **Major League Cricket (MLC USA)**: 6 teams, $15M purse, 6 overseas limit.
    - 🇵🇰 **Pakistan Super League (PSL)**: 6 teams, $18M purse, 4 overseas limit.
    - 🏝️ **Caribbean Premier League (CPL)**: 6 teams, $12M purse, 4 overseas limit.
  - Enriched player pool with international superstars (Babar Azam, Shaheen Afridi, Glenn Maxwell, Heinrich Klaasen, Nicholas Pooran, Saurabh Netravalkar).
- **International T20 World Cup Draft Mode**:
  - 10 full international squads (India, Australia, England, South Africa, Pakistan, New Zealand, West Indies, Afghanistan, Sri Lanka, USA).
  - $100M draft cap with unrestricted international drafting and World Cup championship tournament simulation.
- **Custom Tournament & Rule Sandbox Builder**:
  - Total sandbox control: Custom tournament name, 4 to 10 teams, multi-currency ($ / £ / ₹ / R / A$), purse slider (30 to 200), overseas player quotas (0 to 11), squad limits, and timer speed governors.

---

## 3. Future Roadmap & Potential Next Features (What We Can Add)

With the core auction simulation, tactical AI, matchday engine, multiplayer, franchise progression, broadcast visuals, real-time cloud rooms, squad poster studio, global leagues, and custom rule sandbox fully operational, here are the high-impact feature expansions planned for upcoming releases:

---

### Phase 10: Historical Draft Replay Mode & Classic Mega-Auctions (2008–2024)
1. **Iconic Historical Auction Campaigns**:
   - **2008 Inaugural Auction**: Iconic marquee drafts (Dhoni to CSK, Tendulkar icon to MI, Gilchrist to Deccan Chargers, Warne to RR).
   - **2011 10-Franchise Expansion**: Debut of Pune Warriors India & Kochi Tuskers Kerala; Gambhir rebuilds KKR; Rohit Sharma drafted by Mumbai Indians.
   - **2018 The Comeback Mega-Auction**: CSK and RR return after suspension; KL Rahul & Ben Stokes command record bids.
   - **2022 Gujarat & Lucknow Expansion**: 10-team reshuffle with Hardik Pandya leading Gujarat Titans to debut glory.
2. **"What If?" Narrative Scenarios & Challenge Mode**:
   - *The Moneyball Challenge*: Win the IPL Championship with a squad assembled strictly under ₹75 Crore.
   - *Homegrown Pride*: Win without signing any overseas players (100% Indian squad).
   - *RCB 2016 Redemption*: Can you fix RCB's bowling lineup while retaining Kohli, Gayle, and de Villiers?
3. **Era-Accurate Financial & Player Slabs**:
   - Adjust purse rules and valuations to match historical eras (₹20 Cr cap in 2008 vs. ₹60 Cr in 2014 vs. ₹90 Cr in 2022).

---

### Phase 11: Real-Time Auction War Room & AI Moneyball Analytics
1. **Value-Above-Replacement (VAR) & Expected Value Index (xVI)**:
   - Dynamic real-time valuation radar assessing player worth based on historical T20 impact, death-over economy, and boundary percentages.
   - Instant deal-meter tag: *Huge Steal, Fair Value, Premium Buy, Risky Overpay*.
2. **Live Competitor Purse Depletion Heatmap**:
   - Side-by-side war room dashboard tracking remaining purse, vacant slots, overseas quota, and aggressive bidding triggers across all 9 rival teams in real time.
   - Predicts upcoming rival bids based on their unfilled positional needs.
3. **Scout Shortlist & Custom Bid Ceiling Alerts**:
   - Bookmark target players before the auction with personal ceiling prices.
   - Visual and audio alerts when shortlisted players are placed under the hammer.

---

### Phase 12: Stadium Atmosphere, Crowd 3D Immersion & Multi-Language Commentary
1. **Dynamic Stadium Crowd Audio Engine**:
   - Procedural stadium crowd soundscapes with escalating volume during intense bidding wars.
   - Authentic franchise crowd chants (CSK whistle cheers, RCB stadium roar, Mumbai chants) triggered when marquee players are won.
   - Dramatic crowd gasps when a team drops out of a ₹15+ Crore showdown.
2. **Multi-Language Regional Broadcast Commentary**:
   - Synthesized voice commentary options in **Hindi** (*"Kya gazab ki boli lagayi hai!"*), **Tamil** (*"Kalaakkal bid thozhar!"*), and **Indian English** broadcast styles.
3. **Interactive 3D Trophy Cabinet & Franchise Honors**:
   - Virtual franchise boardroom displaying earned IPL Trophies, Orange & Purple Cap winners, Season MVPs, and historic bidding records across multi-year saves.

---

### Phase 13: Fantasy Sports Integration & Franchise Career RPG Mode
1. **In-App Fantasy League Engine**:
   - Draft a Fantasy XI from your auction roster with Captain ($2\times$) and Vice-Captain ($1.5\times$) multipliers.
   - Real-time fantasy point calculation during tournament simulations (strike rate bonuses, dot ball points, maiden overs, 3-wicket hauls).
   - Local and multiplayer Fantasy Leaderboards.
2. **Franchise Owner & Board Expectation System**:
   - Dynamic board objectives (e.g. *"Qualify for playoffs with at least ₹15 Cr surplus"*, *"Sign a marquee domestic all-rounder"*).
   - Post-auction and post-match interactive press conferences where user answers impact squad morale, fan ratings, and board confidence.

---

### Phase 14: Alternative Draft Modes & Auction Sandbox Gimmicks
1. **Secret Sealed-Bid (Blind Auction) Mode**:
   - All franchises submit private sealed bids simultaneously; highest bidder wins the player without seeing opponent valuations until the reveal.
2. **American-Style Snake Draft**:
   - Non-monetary draft pick order (reverse standings from previous season) with pick-trading between teams.
3. **Salary Cap Luxury Tax Mode**:
   - Option to exceed the ₹120 Cr ceiling with progressive luxury tax penalties redistributed to budget-conscious teams.
4. **Custom Card Art & Player Avatar Uploader**:
   - Upload custom face portraits or generate customized jersey avatars for created players.

---

### Phase 15: Progressive Web App (PWA), Offline Support & Mobile Haptics
1. **Offline PWA Capability**:
   - Service worker caching enabling full auction, match simulation, and squad management without an active internet connection.
2. **Mobile Haptic Feedback Engine**:
   - Tactile vibration responses (`navigator.vibrate`) for paddle taps, tension countdown ticks, outbid alerts, and gavel strikes on mobile devices.
3. **QR Code State Sharing**:
   - Generate scan-and-play QR codes to share custom tournament setups, drafted rosters, and match results instantly between devices.

---

## 4. Comprehensive Feature Status & Prioritization Matrix

| Phase | Feature / Capability | Category | Impact | Complexity | Status |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **0** | 10 Official Franchises & ₹120 Cr Purses | Core | Very High | Low | **Completed** |
| **0** | Pre-Auction Retention Deduction Slabs | Core | Very High | Low | **Completed** |
| **0** | Drag-and-Drop Roster Management | Core | High | Low | **Completed** |
| **0** | Official Post-Auction PDF Report | Core | Medium | Low | **Completed** |
| **1** | Right to Match (RTM) 3-Stage Challenge Suite | Rules | Very High | Medium | **Completed** |
| **1** | 11+ Categorized Sets & Progression Catalog | Rules | High | Medium | **Completed** |
| **1** | Accelerated Round for Unsold Players (50% Off) | Rules | Medium | Medium | **Completed** |
| **1** | Strict Squad Limits (18–25) & 8 Overseas Cap | Rules | High | Low | **Completed** |
| **2** | Target-Aware AI Positional Need Matrices | AI | Very High | High | **Completed** |
| **2** | Specialist Tracking & ₹/Slot Purse Pacing | AI | High | Medium | **Completed** |
| **2** | 10 Authentic Franchise AI Personas | AI | High | Medium | **Completed** |
| **2** | IPL Rivalry Matrix & Dynamic Bidding Wars | AI | High | Medium | **Completed** |
| **3** | Playing XI Builder & Formation Rules | Gameplay | High | Medium | **Completed** |
| **3** | Squad Chemistry Rating Engine (0–100) | Gameplay | High | Medium | **Completed** |
| **3** | Full 45-Match IPL Season & Playoffs Simulator | Gameplay | Very High | High | **Completed** |
| **3** | Single Exhibition Match with 4 Pitch Types | Gameplay | Medium | Medium | **Completed** |
| **4** | Procedural Web Audio Oak Gavel & Tension Ticks | Immersion | High | Medium | **Completed** |
| **4** | Synthesized Auctioneer Voice Commentary | Immersion | High | Medium | **Completed** |
| **4** | 3D Animated Gavel Podium & Visualizer | Immersion | Medium | Medium | **Completed** |
| **4** | Comprehensive Audio Settings Suite | Immersion | Medium | Low | **Completed** |
| **5** | Pass-and-Play Multi-Manager Mode (1–10 Teams) | Multiplayer | Very High | Medium | **Completed** |
| **5** | Custom Player Studio & JSON Import/Export | Customization | High | Medium | **Completed** |
| **5** | 2008 Vintage & All-Time Legends Presets | Content | High | Low | **Completed** |
| **5** | LocalStorage Checkpoints & Session Recovery | Persistence | High | Low | **Completed** |
| **5** | Welcome Starter Page with Direct Navigation | Onboarding | High | Low | **Completed** |
| **5** | In-App Quick Guide & Standalone `document.md` | Documentation | High | Low | **Completed** |
| **6** | Impact Player Rule (12th Man Substitution) | Advanced Rules | High | Medium | **Completed** |
| **6** | Mid-Season Player Trades & Transfer Window | Advanced Rules | High | High | **Completed** |
| **6** | Dynamic Player Form Streaks & Fitness Fatigue | Simulation | Medium | Medium | **Completed** |
| **6** | Multi-Year Franchise Mode & Annual Mini-Auctions | Progression | Very High | Very High | **Completed** |
| **7** | 6 Distinct Broadcast TV Skin Themes & 1-Click Switcher | Visuals | High | Medium | **Completed** |
| **7** | Beginner-Friendly Action Deck & Simple Mode | UI/UX | High | Medium | **Completed** |
| **7** | Interactive Match Worm & Manhattan Charts | Analytics | Medium | Medium | **Completed** |
| **7** | Simulated Social Media Reaction Feed & Grades | Immersion | High | Low | **Completed** |
| **7** | Batter vs. Bowler Head-to-Head Matchup Matrix | Analytics | Medium | Medium | **Completed** |
| **8** | WebRTC / WebSocket Real-Time Online Multiplayer | Multiplayer | Very High | High | **Completed** |
| **8** | Dedicated Host / Auctioneer Gavel Mode | Multiplayer | High | Medium | **Completed** |
| **8** | Shareable Graphical Squad Cards (PNG Studio) | Community | Medium | Low | **Completed** |
| **8** | Community Roster Hub & Dream Squad Gallery | Community | High | Medium | **Completed** |
| **9** | Global T20 Leagues Presets (BBL, PSL, CPL, SA20) | Content | High | Medium | **Completed** |
| **9** | International T20 World Cup Draft Mode | Content | High | Medium | **Completed** |
| **9** | Custom Tournament & Rule Sandbox Builder | Sandbox | High | High | **Completed** |
| **10** | Historical Mega-Auctions (2008, 2011, 2018, 2022) | Content | Very High | High | *Planned (Priority 1)* |
| **10** | "What If?" Scenario Challenges & Story Modes | Gameplay | High | Medium | *Planned (Priority 1)* |
| **11** | Value-Above-Replacement (VAR) & Expected Value | Analytics | Very High | High | *Planned (Priority 1)* |
| **11** | Live Competitor Purse Depletion Heatmap & War Room | Analytics | High | Medium | *Planned (Priority 2)* |
| **11** | Target Player Shortlist & Max Bid Ceiling Alerts | Tools | Medium | Low | *Planned (Priority 2)* |
| **12** | Procedural Stadium Crowd Chants & Reactions | Immersion | High | Medium | *Planned (Priority 2)* |
| **12** | Multi-Language Regional Audio (Hindi/Tamil/English) | Immersion | Medium | Medium | *Planned (Priority 3)* |
| **12** | 3D Trophy Cabinet & Franchise Hall of Fame | Progression | Medium | Medium | *Planned (Priority 3)* |
| **13** | Integrated Fantasy Points Engine & Dream XI Hub | Gamification | High | Medium | *Planned (Priority 2)* |
| **13** | Franchise Owner Career Mode & Press Conferences | RPG | High | High | *Planned (Priority 3)* |
| **14** | Blind Sealed-Bid & Snake Draft Alternative Modes | Sandbox | High | Medium | *Planned (Priority 2)* |
| **14** | Salary Cap Luxury Tax & Financial Penalties | Rules | Medium | Low | *Planned (Priority 3)* |
| **15** | PWA Offline Support & Mobile Haptic Feedback | Mobile | High | Medium | *Planned (Priority 2)* |
| **15** | Instant QR Code Tournament & Roster Sharing | Sharing | Medium | Low | *Planned (Priority 3)* |
