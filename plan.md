# Cricket Auction Simulator — Product Plan & Roadmap

## 1. Executive Summary
The **Cricket Auction Simulator** is an interactive, browser-based IPL mega-auction simulation web application built with React, Vite, and Tailwind CSS. It recreates the high-intensity atmosphere of a real Indian Premier League player auction with multi-team bidding, player retention mechanics, budget management, squad constraints, drag-and-drop roster management, and exportable reports.

---

## 2. Current Features & Capabilities (What We Have)

### 2.1 Team & Franchise Management
- **10 Official IPL Franchises**:
  - Chennai Super Kings (CSK)
  - Delhi Capitals (DC)
  - Gujarat Titans (GT)
  - Kolkata Knight Riders (KKR)
  - Lucknow Super Giants (LSG)
  - Mumbai Indians (MI)
  - Punjab Kings (PBKS)
  - Rajasthan Royals (RR)
  - Royal Challengers Bengaluru (RCB)
  - Sunrisers Hyderabad (SRH)
- **Franchise Selection**:
  - Users select one team to manage as human franchise owner/bidder.
  - Remaining 9 teams are controlled by automated AI bidding logic.
- **Budget & Purse Allocation**:
  - Base purse of ₹120.00 Crore per franchise.
  - Real-time budget tracking (spent, remaining, and percentage gauge).

### 2.2 Pre-Auction Retention System
- **Official Retention Rules**:
  - Maximum 6 players retained per team.
  - Maximum 5 capped international/Indian players.
  - Maximum 2 uncapped Indian players.
- **Graduated Retention Slabs**:
  - Capped retention costs: 1st (₹18 Cr), 2nd (₹14 Cr), 3rd (₹11 Cr), 4th (₹18 Cr), 5th (₹14 Cr).
  - Uncapped retention cost: ₹4 Cr flat.
- **Interactive Retention Modal**:
  - Dynamic purse deduction display with real-time validation.
  - Automatic validation preventing illegal slot combinations.
  - Seamless handover into the live auction pool.

### 2.3 Live Auction Arena & Bidding Engine
- **Player Showcase Card**:
  - High-resolution player headshots and role icons (Batsman, Bowler, All-Rounder, Wicketkeeper).
  - Player metadata: Nationality badge, age, base price, and capped status.
  - Dynamic current highest bid and leading bidder team badge.
- **Dynamic Bid Increments**:
  - Bid < ₹1.00 Cr: +₹0.05 Cr (+5 Lakhs)
  - Bid between ₹1.00 Cr – ₹2.00 Cr: +₹0.10 Cr (+10 Lakhs)
  - Bid between ₹2.00 Cr – ₹5.00 Cr: +₹0.20 Cr (+20 Lakhs)
  - Bid > ₹5.00 Cr: +₹0.50 Cr (+50 Lakhs)
  - Quick-jump increment buttons (+₹1 Cr, +₹2 Cr).
- **10-Second Timer & Hammer Countdown**:
  - Visual countdown timer resetting on each valid bid.
  - Status progression: *"Bidding active"* → *"Going once..."* → *"Going twice..."* → *"SOLD!"*.
- **AI Competitor Bidding**:
  - Automated bidding rounds from rival franchises based on purse availability and remaining player slots.
- **Pass & Unsold Flow**:
  - Players with zero bids marked as "UNSOLD" and recorded in the auction ledger.

### 2.4 Analytics, Roster Management & Exports
- **Player Stats Modal**:
  - Full T20/IPL career stats: matches, runs, highest score, batting average, strike rate, wickets, bowling average, economy, and best bowling figures.
- **Interactive Team Roster (Drag-and-Drop)**:
  - Powered by `react-beautiful-dnd` to reorder starting lineup and bench order.
  - Breakdown of players by role and overseas vs. domestic split.
- **Franchise Overview Grid**:
  - 10-team live dashboard with animated neon pulses on active bidding teams.
  - Overseas count badge (tracking the 8-player ceiling).
- **Comprehensive Auction Log & Ledger**:
  - Full auction history table showing status (Sold/Unsold), buying team, and final price.
- **PDF Export via jsPDF**:
  - One-click downloadable report summarizing all franchise squads and auction outcomes.

---

## 3. Future Roadmap (What We Can Add)

### Phase 1: Authentic Auction Rules & Tactical Mechanics
1. **Right to Match (RTM) Card Implementation**:
   - Number of RTMs given = (6 - Number of Retained Players).
   - If an eligible previous player is won by another team, the original team can exercise the RTM card.
   - Winning team can increase bid one last time; RTM holder can match that final bid to seal the player.
2. **Auction Pool Categorization & Sets**:
   - Marquee Set 1 & 2 (Kohli, Rohit, Bumrah, Pant, etc.).
   - Role-based sets (Set 1: Batsmen, Set 2: All-Rounders, Set 3: Wicketkeepers, Set 4: Fast Bowlers, Set 5: Spinners).
   - Alternating Capped and Uncapped sets.
3. **Accelerated Round / Unsold Recall**:
   - At the end of regular sets, teams submit a shortlist of unsold players to bring back to the podium at discounted base prices.
4. **Squad Size & Minimum Purse Rules**:
   - Enforce mandatory squad size (Minimum 18, Maximum 25 players).
   - Enforce maximum 8 overseas players limit strictly across all bids.
   - Reserve funds logic: Teams cannot bid so much that they cannot fill the minimum 18-player quota with minimum base prices (₹30 Lakhs).

### Phase 2: Enhanced AI Intelligence & Team Needs
1. **Target-Aware AI Bidding**:
   - Team need matrices: Teams missing a primary wicketkeeper or death bowler will aggressively bid for those specific roles.
   - Purse-pacing algorithm: AI balances aggressive spending for star players vs. budget preservation for squad depth.
2. **Rivalry & Bidding Wars**:
   - Simulating fierce bidding wars between traditional rivals (e.g. MI vs. CSK, RCB vs. KKR) for marquee players.

### Phase 3: Squad Chemistry, XI Builder & Match Simulator
1. **Playing XI Builder & Balance Score**:
   - Automatic formation checker (e.g. at least 1 WK, 5 bowling options, max 4 overseas in Playing XI).
   - Overall Team Rating (Batting, Bowling, Balance, and Experience scores out of 100).
2. **Quick Tournament / Match Simulator**:
   - Simulate a mock IPL season with the newly formed rosters using batting/bowling ratings.
   - Points table, playoffs, and championship trophy crowning.

### Phase 4: Audio, Sound Effects & Immersion
1. **Auctioneer Sound Effects & Gavel Animation**:
   - Realistic gavel strike audio when a player is "SOLD".
   - 3-second tension ticking sound and gavel hammer drop animation.
   - Synthesized voice / audio commentary announcing "Bid raised to ₹X Crores by [Team]".

### Phase 5: Multiplayer, Customization & Onboarding (Completed)
1. **Pass-and-Play & Multi-Manager Mode**:
   - Multi-franchise control with 1 to 10 human managers configured via `MultiplayerSettingsModal`.
   - Sequential multi-team pre-auction retention queue with step tracking.
   - Live auction active paddle switcher and dedicated multi-franchise direct bidding paddles.
   - Comprehensive human-vs-human and human-vs-AI Right to Match (RTM) duels.
   - AI bidding engine strictly restricted to automated franchises.
2. **Custom Rosters & Player Editor**:
   - Interactive `PlayerEditorModal` supporting custom player creation, stat editing, and deletions.
   - Built-in authentic vintage roster presets:
     - 2025 Official Mega Auction (Default 500+ players)
     - 2008 Historic Inaugural Auction (Tendulkar, Dhoni, Warne, Gilchrist, McGrath, etc.)
     - All-Time Legends & T20 Titans (Gayle, De Villiers, Malinga, Pollard, Raina, Bumrah, etc.)
   - One-click JSON roster export and import capabilities.
3. **Local Storage Persistence & State Recovery**:
   - Real-time debounced auto-save checkpoint serializer (`storageUtils.js`).
   - Session recovery prompt on initial load with 1-click restore or clean start.
   - Header controls for manual checkpoint saving and auction resets.
4. **Welcome Starter Page & Onboarding Hub (`StarterPage.jsx`)**:
   - High-impact visual landing screen with stadium lighting and ambience.
   - Direct CTA navigation buttons: "🚀 Enter Auction Arena" (Solo mode) and "👥 Pass & Play Mode".
   - Seamless navigation into team selection with mode pre-selection and "← Back to Welcome" returns.
   - 10-Franchise preview marquee and core feature breakdown cards.
   - Built-in "📖 How to Play" quick-reference modal for instant rule lookup.
5. **Comprehensive User Documentation (`document.md`)**:
   - Complete, standalone user manual explaining all mechanics, rules, slabs, RTM, and strategies.

---

## 4. Prioritization Matrix

| Feature | Impact | Complexity | Priority | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Welcome Starter Page & Navigation** | High | Low | P0 | Completed |
| **User Documentation (`document.md`)** | High | Low | P0 | Completed |
| **RTM (Right to Match) System** | Very High | Medium | P0 | Completed |
| **Strict Squad Constraints (18-25 squad, max 8 overseas)** | High | Low | P0 | Completed |
| **LocalStorage State Persistence** | High | Low | P0 | Completed |
| **Auction Sets / Pool Categorization** | High | Medium | P1 | Completed |
| **Enhanced Role-Aware AI Bidding** | High | Medium | P1 | Completed |
| **Audio FX & Gavel Sound** | Medium | Low | P1 | Completed |
| **Playing XI Rating & Chemistry** | High | Medium | P2 | Completed |
| **Accelerated Round for Unsold Players** | Medium | Medium | P2 | Completed |
| **Pass-and-Play Multi-Manager Mode** | Very High | Medium | P2 | Completed |
| **Custom Player/Roster Editor & Presets** | Medium | High | P3 | Completed |
| **Mock Season / Match Simulator** | High | High | P3 | Completed |
