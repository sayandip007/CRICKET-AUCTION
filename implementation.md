# Cricket Auction Simulator — Technical Implementation Guide

This document details the architectural design and code implementation of the features in the **Cricket Auction Simulator**, including the newly completed **Phase 1: Authentic Auction Rules & Tactical Mechanics**, as well as blueprints for subsequent phases.

---

## 1. Architecture & Tech Stack Overview

- **Framework**: React 18 (Single Page Application)
- **Build Tool**: Vite 7 with `@vitejs/plugin-react`
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss";` in `src/index.css`)
- **Drag & Drop**: `react-beautiful-dnd` for roster reordering
- **Notifications**: `react-toastify` for real-time bid alerts and sale celebrations
- **PDF Generation**: `jspdf` for generating structured post-auction squad reports
- **State Management**: React Hooks (`useState`, `useEffect`, `useMemo`, `useCallback`)
- **Modular Utilities**:
  - `src/utils/auctionRules.js`: Domain rules, squad limits, RTM calculations, dynamic rating algorithm, and set builder.
  - `src/utils/constants.js`: Franchises, base purses, roles, and asset mappings.
  - `src/components/RTMModals.jsx`: Complete Right to Match interactive modal suite.
  - `src/components/AuctionSetsModal.jsx`: Full categorized auction catalog and status viewer.
  - `src/components/SetCompletionModal.jsx`: Set transition interstitial with sales highlights and upcoming set preview.
  - `src/components/AcceleratedRoundModal.jsx`: Unsold recall selector with 50% discount and rapid bidding setup.

---

## 2. Phase 1 Implementation Details (Completed)

### 2.1 Right to Match (RTM) System

#### Overview
Under official IPL 2025 mega-auction regulations, franchises that do not use all 6 retention slots receive **Right to Match (RTM)** cards for the live auction pool:
$$\text{team.rtmCount} = \max(0, 6 - \text{team.retainedPlayers.length})$$

Every player is cross-referenced with `src/data/previous.json` using `buildPreviousPlayersMap()`. When an eligible previous player is auctioned:
1. If won by a rival franchise, the player's previous team has the right to invoke their RTM card.
2. The winning bidder is granted **one final chance to raise their challenge bid**.
3. The previous franchise then makes the final decision: match the raised bid to sign the player or pass and let the winning bidder take them.

#### RTM State Machine (`src/App.jsx` & `src/components/RTMModals.jsx`)
```
                          Auction Clock Reaches 0
                                     │
                                     ▼
                Is Winner != Previous Team & Prev Team Has RTM & Budget?
                                     │
                    ┌────────────────┴────────────────┐
                    │ No                              │ Yes
                    ▼                                 ▼
             Finalize Sale                 Pause Auction Clock
                                           Enter stage: "RTM_INQUIRY"
                                                      │
                            ┌─────────────────────────┴────────────────────────┐
                            │ Previous Team Declines                           │ Previous Team Exercises RTM
                            ▼                                                  ▼
                  Sold to Winning Bidder                         Enter stage: "FINAL_RAISE"
                                                                 Winning Bidder Sets Final Price
                                                                               │
                                                                               ▼
                                                                 Enter stage: "FINAL_DECISION"
                                                                 Previous Team Decides: Match?
                                                                 ┌─────────────┴─────────────┐
                                                                 │ Yes                       │ No
                                                                 ▼                           ▼
                                                         Sold to Previous Team       Sold to Winning Bidder
                                                         (Deduct 1 RTM Card)         (At Final Price)
```

#### Modal Suite
- `RTMInquiryModal`: Shown to the user when their previous star is won by an AI team. Displays player rating, previous team association, winning bid, and remaining RTM cards.
- `RTMFinalRaiseModal`: Shown to the user if an AI franchise exercises RTM on their winning bid. The user can hold their bid or raise by +₹0.50Cr, +₹1.00Cr, +₹2.00Cr, or enter a custom amount up to their allowable reserve cap.
- `RTMMatchDecisionModal`: Shown to the user when an opponent raises their challenge bid. The user decides whether to match the raised amount or pass.

---

### 2.2 Auction Pool Categorization & Sets

The 500-player database is organized into structured, authentic IPL sets using `buildAuctionSets()` in `src/utils/auctionRules.js`:

| Set Code | Set Name | Category | Description |
| :--- | :--- | :--- | :--- |
| **M1** | Marquee Players Set 1 | Marquee | Top 8 superstars across roles (Rating ≥ 88, Base Price ₹2.00Cr) |
| **M2** | Marquee Players Set 2 | Marquee | Second batch of 8 world-class elite cricketers |
| **BA1** | Capped Batters Set 1 | Capped Batters | Established specialist batsmen |
| **AL1** | Capped All-Rounders Set 1 | Capped All-Rounders | Dual-threat match winners |
| **WK1** | Capped Wicketkeepers Set 1 | Capped Wicketkeepers | Stumpers and middle-order finishers |
| **FA1** | Capped Fast Bowlers Set 1 | Capped Fast Bowlers | Express pacers and death-over specialists |
| **SP1** | Capped Spinners Set 1 | Capped Spinners | Mystery spinners and turn masters |
| **UBA1** | Uncapped Batters Set 1 | Uncapped Batters | Emerging domestic batting prospects |
| **UAL1** | Uncapped All-Rounders Set 1 | Uncapped All-Rounders | Emerging dynamic all-rounders |
| **UWK1** | Uncapped Wicketkeepers Set 1 | Uncapped Wicketkeepers | Next-generation glovemen |
| **UBOW1** | Uncapped Bowlers Set 1 | Uncapped Bowlers | Raw domestic pace and spin prospects |
| **ACC** | Accelerated Round | Accelerated | Recalled unsold players with 50% discount & rapid timer |

#### Set Progression & Interstitial UI
- **Top Set Banner**: Renders the active set code, set title, description, and player progress (e.g. `Player 3 of 8 in Set`).
- **Sets Catalog Modal (`AuctionSetsModal`)**: Provides a full sidebar navigation of all batches, real-time player statuses (`Under Hammer`, `Sold to [Team]`, `Unsold`, `Upcoming`), and player stat cards.
- **Set Completion Modal (`SetCompletionModal`)**: Appears automatically upon completing a set. Highlights total sold vs. unsold, purse spent, top buy in the set, and previews the upcoming set.

---

### 2.3 Accelerated Round / Unsold Recall

When all regular sets conclude:
1. `auctionLog` is scanned for players with `soldTo === "Unsold"`.
2. If unsold players exist, the application triggers `AcceleratedRoundModal`:
   - Lists all unsold players with their original base price and a **50% discounted base price** (minimum ₹0.30 Cr).
   - Shows teams requiring recruitment to fulfill the mandatory 18-player squad limit.
   - Provides quick-shortlist buttons: "Select All" / recommended shortlist.
3. Upon launch:
   - Switches to an **accelerated 5-second countdown clock** (compared to 12s in regular rounds).
   - Displays a glowing amber `⚡ ACCELERATED ROUND` badge in the header.
   - AI bidding intervals accelerate to 1.6s for high-tempo bidding.

---

### 2.4 Strict Squad Constraints & Minimum Reserve Calculation

To mirror official IPL squad composition rules, every bid is validated by `canTeamBid()` in `src/utils/auctionRules.js`:

#### Rules Enforced:
1. **Squad Limits**: Minimum **18 players**, Maximum **25 players**.
2. **Overseas Ceiling**: Maximum **8 overseas players** per franchise.
3. **Minimum Purse Reserve Formula**:
   $$\text{Slots Remaining to 18} = \max(0, 18 - (\text{currentSquadSize} + 1))$$
   $$\text{Reserve Needed} = \text{Slots Remaining} \times 0.30\text{ Cr}$$
   $$\text{Max Allowed Bid} = \max(0, \text{budget} - \text{Reserve Needed})$$

#### User Bid Button Validation:
- If team has 25 players: Button disabled with *"Squad limit reached (25/25)"*.
- If player is overseas and team has 8 overseas: Disabled with *"Overseas cap reached (8/8)"*.
- If bid exceeds max allowable bid: Disabled with *"Exceeds max bid ₹X.XXCr (Reserve needed for 18 players)"*.
- If budget < bid: Disabled with *"Insufficient purse"*.

#### AI Bidding Engine:
- Before placing any bid, the AI evaluates `canTeamBid()`. Teams that would violate squad constraints or lack the reserve for 18 players are strictly excluded.
- Scoring factors in role necessity, player rating, budget pacing, and squad completion urgency.

---

## 3. Data Structures & Schemas

### 3.1 Franchise Object (`src/utils/constants.js`)
```javascript
{
  id: 1,
  name: "Chennai Super Kings",
  shortName: "CSK",
  color: "border-yellow-400",
  headerColor: "bg-yellow-500",
  budget: 120.0, // in Crores
  players: [],   // Array of signed players
  rtmCount: 6,   // Initial RTMs = 6 - retentions
}
```

### 3.2 Player Object with Ratings & Previous Team
```javascript
{
  id: 1,
  name: "Ruturaj Gaikwad",
  role: "Batsman",
  age: 28,
  nationality: "Indian",
  basePrice: 2.0,
  matches: 74,
  runs: 2502,
  highestScore: 108,
  wickets: 0,
  battingAverage: 40.35,
  battingStrikeRate: 137.48,
  image: "/images/players/Ruturaj.png",
  previousTeamId: 1,
  previousTeamName: "Chennai Super Kings",
  isCapped: true,
  rating: 94
}
```

## 3. Phase 2 Implementation Details (Completed)

### 3.1 Target-Aware AI Bidding & Positional Deficit Matrix

To simulate the intelligent roster-building behavior of real IPL franchise analysts, AI bidding logic is driven by `analyzeTeamNeeds()` and `evaluateAIBid()` in `src/utils/aiIntelligence.js`.

#### Specialization Breakdown (`getPlayerSpecializations`):
Beyond basic roles, cricketers are classified into tactical specializations:
- **Death Bowler**: Economy $\le 8.2$ with bowling average $\le 24$ or $\ge 40$ wickets (e.g., Bumrah, Arshdeep, Pathirana).
- **Mystery & Spin Masters**: Economy $\le 7.4$ with high spin control (e.g., Rashid Khan, Chahal, Narine, Kuldeep).
- **Stumper Finisher**: Wicketkeepers with batting strike rate $\ge 135$ or average $\ge 28$ (e.g., Pant, Klaasen, Samson, Pooran).
- **Powerplay Enforcers & Anchor Batters**: Classified based on boundary strike rates ($>145$) and consistency averages ($>36$).
- **Finishing All-Rounders**: Dual-threat finishers with batting strike rate $\ge 150$ and wickets in hand.

#### Squad Quotas & Deficit Urgency:
Every franchise monitors positional requirements against authentic IPL roster composition standards:
$$\text{Ideal Quotas: } \text{Batsmen } (4\text{–}6), \text{ Keepers } (2\text{–}3), \text{ All-Rounders } (3\text{–}5), \text{ Bowlers } (5\text{–}7)$$

Deficit status is dynamically evaluated:
- **CRITICAL**: 0 Wicketkeepers or 0 Death Bowlers signed (urgency score: +100).
- **URGENT**: Position below minimum legal quota (urgency score: +85).
- **MODERATE**: Position below ideal target (urgency score: +50 to +65).
- **FILLED**: Ideal target reached (urgency score: +20).
- **SURPLUS**: Position at or exceeding max ceiling (urgency score: -20; AI backs off).

---

### 3.2 Purse-Pacing Algorithm & Strategic Franchise Personas

Franchises pace their auction expenditure across the duration of the mega auction using `calculatePursePacing()`:
$$\text{Purse Per Slot to 18} = \frac{\text{team.budget}}{\max(1, 18 - \text{team.players.length})}$$

#### Pacing Tiers:
1. **SPLURGE ($\ge ₹5.5\text{ Cr/slot}$)**: High purse surplus. Willing to aggressively drive up bids on marquee superstars.
2. **BALANCED ($₹3.0\text{ Cr – } ₹5.49\text{ Cr/slot}$)**: Disciplined spending on squad deficits and core targets.
3. **CONSERVING ($₹1.5\text{ Cr – } ₹2.99\text{ Cr/slot}$)**: Budget preservation mode; restricts bidding to value buys and strictly avoids bidding wars.
4. **CRITICAL SAFETY ($< ₹1.5\text{ Cr/slot}$)**: Approaching minimum safety reserve (₹0.30 Cr/slot for mandatory 18 players). Refuses non-essential bids.

#### 10 Authentic Franchise Strategic Personas (`FRANCHISE_PERSONAS`):
| Franchise | Strategic Archetype | Core Priority | Spending Persona | Arch-Rivals |
| :--- | :--- | :--- | :--- | :--- |
| **CSK** | Tactical Veterans | High experience, spin masters, all-rounders | Balanced | MI, RCB, RR |
| **MI** | Championship Core | Lethal death bowling, top-order firepower | Calculated Heavy | CSK, RCB, KKR |
| **RCB** | Superstar Centric | Marquee batters, stumper finishers | Aggressive Splurge | KKR, CSK, MI |
| **KKR** | Power & Spin | Mystery spin, Caribbean power hitters | Aggressive | RCB, SRH, MI |
| **SRH** | Pace Battery | Express pace units, death-over specialists | Aggressive | KKR, CSK, RCB |
| **RR** | Moneyball & Spin | High-value domestic scouts, leg spin masters | Value Hunter | CSK, PBKS, LSG |
| **DC** | Indian Core Builder | Young domestic core, versatile keepers | Balanced | PBKS, GT, MI |
| **PBKS** | Purse Disruptor | Massive purse ambition, fearless bidding | High Splurge | DC, RR, RCB |
| **GT** | Systematic Balance | Methodical balance, economical seamers | Balanced | LSG, DC, MI |
| **LSG** | Multi-Utility | Multi-dimensional all-rounders, agile keepers | Balanced | GT, RCB, RR |

---

### 3.3 Rivalry & High-Stakes Bidding Wars Engine

#### Traditional IPL Rivalry Matrix:
- **CSK ⚔️ MI**: *"El Clásico of IPL"* (9 titles between them)
- **KKR ⚔️ RCB**: *"Kolkata-Bengaluru Derby"* (Historic 2008 IPL opener rivalry)
- **CSK ⚔️ RCB**: *"Southern Derby"* (Kaveri clash)
- **RCB ⚔️ MI**: *"Battle of Titans"* (Mega-city showdown)
- **DC ⚔️ PBKS**: *"Northern Derby"* (Capital vs. Punjab supremacy)
- **GT ⚔️ LSG**: *"Class of 2022 Derby"* (Expansion debutants clash)
- **KKR ⚔️ SRH**: *"Eastern Showdown"* (Orange Army vs. Purple & Gold)
- **CSK ⚔️ RR**: *"2008 Final Rematch"* (Inaugural contenders)

#### Escalation & Bidding War Mechanics:
1. **Trigger Condition**: When two teams counter each other consecutively or an arch-rival bids against the leading bidder (`getRivalryDetails()`), a **Bidding War** is triggered.
2. **Valuation Ceiling Inflation**: Arch-rivals inflate their valuation cap by **+15% to +30%** specifically to deny marquee and high-rated stars to their rivals.
3. **Pacing Acceleration**: Bidding interval drops dynamically from 2.6s down to **1.0s – 1.7s** during active rivalry duels for heart-racing bidding action.
4. **UI Banner (`BiddingWarBanner.jsx`)**: Displays animated glowing swords, intensity level (*Heated Duel* $\rightarrow$ *Fierce Clash* $\rightarrow$ *All-Out Bidding War*), team purse comparison, and tactical wire commentary.
5. **AI Scouting Wire**: Live tactical commentary bar under the player showcase card showing real-time AI thoughts and intentions.

---

### 3.4 Target-Aware AI & Intelligence Modal (`TeamNeedsModal.jsx`)

Users can inspect all 10 franchises anytime:
- **Positional Need Matrix**: Real-time progress bars for Batsmen, Wicketkeepers, All-Rounders, and Bowlers against ideal quotas.
- **Specialist Deficit Badges**: Tracks death-over bowlers and spin masters with `⚠️ CRITICAL DEFICIT` alerts.
- **Purse-Pacing Gauge**: Visual indicator showing remaining purse and ₹/slot pacing.
- **Scouting Intel Report**: Contextual advice on user squad balance and tactical predictions of opponent bids.
- **Interactive Links**: Click any arch-rival pill to immediately scout that opponent.

---

## 4. Phase 3 Implementation Details (Completed)

### 4.1 Playing XI Builder & Formation Checker (`validatePlayingXI`, `orderPlayingXI`, `autoSelectBestXI`)

The **Playing XI Builder** enables managers to craft their matchday lineup, adjust batting order, designate Captain (C) and Vice-Captain (VC), and swap bench reserves with real-time IPL rule compliance:

#### Formation Constraints Enforced:
- **Exact Squad Size**: Exactly 11 players in the active matchday lineup.
- **Overseas Quota Ceiling**: Maximum 4 overseas players allowed in the Playing XI ($\le 4$).
- **Wicketkeeping Obligation**: Minimum 1 designated Wicketkeeper ($\ge 1\text{ WK}$).
- **Bowling Options Requirement**: Minimum 5 viable bowling options (Bowlers or All-Rounders with bowling capabilities, $\ge 5$).
- **Batting Depth Assessment**: Validates balanced distribution across Openers (1–2), Anchors (3), Middle-Order (4–5), Finishers (6–7), and Bowlers (8–11).

#### Smart Automation:
- **`autoSelectBestXI()`**: Algorithmic selector that solves the constraint satisfaction problem: picks the highest-impact wicketkeeper, selects the top 4–5 bowling options within overseas limits, fills remaining slots with premium batters, and orders the lineup logically using `orderPlayingXI()`.
- **Interactive Lineup Drag & Re-order**: Instant up/down arrow buttons to promote or demote batters, and click-to-swap mechanism between active XI and bench reserves.

---

### 4.2 Squad Chemistry & Multi-Factor Rating System (`calculateTeamRatings`)

Franchise roster strength and team balance are evaluated via five interrelated mathematical rating dimensions ($0\text{–}100$):

1. **Batting Rating ($0\text{–}100$)**:
   $$\text{Batting Rating} = \frac{\sum_{i=1}^{11} \text{Rating}_i \times W_i}{\sum W_i}$$
   Weighted positionally: Top-order (1–3: $W=1.4$), Middle-order (4–6: $W=1.2$), Finishers (7–8: $W=0.9$), Tailenders (9–11: $W=0.4$). Factored by individual career averages, strike rates, and career runs.

2. **Bowling Rating ($0\text{–}100$)**:
   Evaluates the top 5 designated bowling options in the XI with descending weights ($1.3, 1.2, 1.1, 1.0, 0.9$). Incorporates economy rates ($<7.2$ elite), strike rates, wickets, and death-bowling capabilities. Penalizes severely if fewer than 5 bowlers are picked.

3. **Balance Score ($0\text{–}100$)**:
   Rewards tactical diversity: optimal all-rounder count (2–4 all-rounders: $+12$), presence of wicketkeeper ($+8$), $6+$ bowling options ($+6$), and penalizes rule violations (e.g., $0$ keepers: $-20$; $>4$ overseas: $-18$).

4. **Experience Score ($0\text{–}100$)**:
   Calculated from career IPL matches played and capped international player ratio:
   $$\text{Experience} = \min\left(98, 45 + \frac{\text{Avg Matches}}{100} \times 35 + \frac{\text{Capped Count}}{11} \times 20\right)$$

5. **Overall Squad Chemistry (OVR)**:
   $$\text{OVR} = (\text{Batting} \times 0.35) + (\text{Bowling} \times 0.35) + (\text{Balance} \times 0.15) + (\text{Experience} \times 0.15)$$
   - $\ge 88$: **🏆 Title Contender** (S-Tier)
   - $82\text{–}87$: **⚡ Playoff Lock** (A-Tier)
   - $75\text{–}81$: **⚔️ Playoff Contender** (B-Tier)
   - $< 75$: **🌱 Rebuilding / Dark Horse** (C-Tier)

---

### 4.3 Realistic T20 Match Simulator Engine (`simulateT20Match`, `simulateInnings`)

A physics- and probability-grounded match simulation engine modeling authentic 20-over T20 cricket dynamics:

#### Stadium & Pitch Conditions (`PITCH_CONDITIONS`):
- **Balanced Surface** (*Narendra Modi Stadium, Ahmedabad*): Par 175, neutral contest.
- **Batting Paradise** (*M. Chinnaswamy Stadium, Bengaluru*): Par 205, $+25\%$ boundary modifier, higher six-hitting frequency.
- **Turning Track** (*Chepauk, Chennai*): Par 155, $+35\%$ spin impact, gripped surface.
- **Pace & Bounce** (*Wankhede Stadium, Mumbai*): Par 188, $+22\%$ pace and swing impact, late dew factor.

#### Inning Simulation Dynamics:
- **Coin Toss & Strategy**: Realistic toss simulation with T20 chasing preference ($65\%$ bowl first).
- **Match Phases**:
  - *Powerplay (Overs 1–6)*: Field restrictions boost run rate ($1.1\times$).
  - *Middle Overs (Overs 7–15)*: Spin control and boundary suppression ($0.95\times$).
  - *Death Overs (Overs 16–20)*: Accelerated boundary-hitting and heightened wicket probability ($1.35\times$).
- **Complete Scorecards**: Batting figures (Runs, balls, 4s, 6s, strike rate, dismissal modes), Bowling cards (Overs, maidens, runs, wickets, economy), extras, and over-by-over ball trajectory logs (`4 1 W 6 • 2`).
- **Player of the Match (POTM)**: High-impact algorithm evaluating runs scored ($+1.1/\text{run}$, milestone bonuses for $50+$ and $80+$), wickets taken ($+28/\text{wicket}$), and economy bonuses.

---

### 4.4 Full IPL Season & Playoff Tournament Engine (`TournamentSimulatorModal.jsx`)

#### League Stage (45 Matches, 10 Teams):
- Complete single round-robin schedule (`generateSeasonSchedule()`) where every franchise faces every other franchise once.
- Simulation modes: **"▶ Simulate Next Match"** (step-by-step), **"⚡ Fast-Simulate Entire Season"** (instant execution).
- **Official Points Table (`updatePointsTable`)**:
  - Real-time updates for Matches Played (P), Won (W), Lost (L), Points (PTS), and Form ticker ($[\text{W, W, L, W, L}]$).
  - Exact Net Run Rate (NRR) computation:
    $$\text{NRR} = \frac{\text{Total Runs Scored}}{\text{Total Overs Faced}} - \frac{\text{Total Runs Conceded}}{\text{Total Overs Bowled}}$$
  - Automatic qualification ranking with top 4 highlighted with emerald playoff borders.

#### IPL Playoffs Bracket:
- **Qualifier 1**: #1 vs #2 (Winner advances to Final; Loser to Qualifier 2).
- **Eliminator**: #3 vs #4 (Winner advances to Qualifier 2; Loser eliminated).
- **Qualifier 2**: Loser Q1 vs Winner Eliminator (Winner advances to Final).
- **Grand Final**: Winner Q1 vs Winner Q2 for the IPL Championship.
- **Championship Trophy Crowning**: Confetti fireworks (`canvas-confetti`), golden winner banner, victory margin, and tournament MVP accolades.

#### Quick Exhibition Match:
- Choose Home Franchise vs Away Challenger, select specific stadium/pitch, and inspect detailed head-to-head scorecards and player highlights.

---

## 5. Phase 4 Implementation Details: Audio, Sound Effects & Immersion (Completed)

### 5.1 Procedural Web Audio FX Synthesizer Engine (`src/utils/audioEffects.js`)

- **Zero External Asset Dependency**: Synthesizes 100% authentic procedural sound waves natively via the browser's Web Audio API (`AudioContext`), immune to missing asset 404 errors, network latency, or CORS restrictions.
- **Realistic Hardwood Gavel Strike (`playGavelStrike(intensity)`)**:
  - *Transient Crack*: White noise buffer filtered through a high-Q bandpass filter (2,400 Hz, $Q=3.5$) with rapid exponential decay (45ms) simulating wood-on-wood strike impact.
  - *Hardwood Body Resonance*: Dual oscillators at 460 Hz (exponential ramp down to 280 Hz) and 820 Hz (ramp down to 540 Hz) modeling oak/mahogany sound-block acoustic resonance.
  - *Sub-Bass Tactile Thump*: Low sine wave sweeping from 95 Hz down to 40 Hz over 120ms, delivering a heavy physical thud through speakers and headphones.
  - *Triple Strike (`playTripleGavelStrike`)*: Automated sequence of 2 light warning taps followed by a definitive full-force hammer slam.
- **Tension Countdown Ticking Clock (`playClockTick(secondsLeft)`)**:
  - Crisp acoustic woodblock clicks with increasing frequency and gain as the bidding timer counts down:
    - **3s left**: 850 Hz woodblock click.
    - **2s left**: 1,150 Hz urgent wood click.
    - **1s left**: 1,580 Hz high-alert tick with rapid 35ms decay.
- **Bid Paddle Pop & Milestone Chimes (`playBidSound`, `playMilestoneChime`, `playMegaBidChime`)**:
  - Clean paddle raise acoustic pop for every bid placed by user or AI.
  - Crystalline harmonic dual chime ($1,046.5\text{ Hz} \rightarrow 1,318.5\text{ Hz}$) for high-value bids ($\ge \text{₹}8\text{Cr}$).
  - Shimmering 4-note golden arpeggio ($C_6, E_6, G_6, C_7$) for marquee mega-bids ($\ge \text{₹}15\text{Cr}$).
- **Rivalry Clash War Horn (`playBiddingWarHorn`)**:
  - Dramatic lowpass-filtered sawtooth brass swell ($300\text{ Hz} \rightarrow 1,200\text{ Hz} \rightarrow 250\text{ Hz}$) triggered when a historic derby bidding war ignites.
- **Right to Match (RTM) Shimmer (`playRTMAlert`)**:
  - Ascending 4-note triangle wave fanfare ($E_5, A_5, D_6, A_6$) with electric shimmer upon RTM invocation.
- **Unsold Flat Tone (`playUnsoldBuzzer`)**:
  - Muted descending two-tone wood tap ($320\text{ Hz} \rightarrow 180\text{ Hz}, 240\text{ Hz} \rightarrow 140\text{ Hz}$) when a player passes without bids.
- **Stadium Applause & Cheering (`playApplause`)**:
  - Bandpass-filtered burst noise envelope simulating crowd cheering and clapping on marquee signings and tournament champion crowning.

---

### 5.2 Synthesized Auctioneer Voice Commentary Engine (`speakAuctioneer`)

- Grounded in HTML5 `window.speechSynthesis` with auto-discovery of English voice models (prioritizing British, Indian, or natural English accents).
- **Phonetic Text Normalization**: Automatically converts `"₹18.00Cr"` to `"18 Crore"`, `"CSK"` to `"Chennai Super Kings"`, `"MI"` to `"Mumbai Indians"`, `"RCB"` to `"Royal Challengers"`, etc.
- **Snappy Auctioneer Cadence**: Tuned to $1.05\times$ speech rate for authentic auction tempo.
- **Anti-Queue Smart Debounce**: Automatically cancels stale bid announcements during rapid AI counter-bidding to prevent audio backlogs, while enforcing immediate priority interruptions for `"SOLD!"`, `"GOING ONCE"`, and `"GOING TWICE"`.
- **Broadcast Commentary Lines**:
  - *"Bid raised to ₹X Crore by [Franchise]!"*
  - *"Going once at ₹X Crore to [Franchise]..."*
  - *"Going twice at ₹X Crore to [Franchise]... Any more bids?"*
  - *"SOLD! [Player] sold to [Franchise] for ₹X Crore!"*
  - *"Right to Match card exercised by [Franchise] on [Player]!"*
  - *"Bidding war between [Franchise A] and [Franchise B]!"*
  - *"Unsold! [Player] passes without bid."*

---

### 5.3 Interactive 3D Gavel Podium (`GavelPodium.jsx`)

- **3D Hardwood Gavel & Official Strike Block**:
  - Polished hardwood mallet with brass center ring resting on an oak sound block with brass inlays.
  - **Dynamic Tension Physics**:
    - **3s left**: Gavel lifts back $-24^\circ$ (`Going Once` amber lamp glows).
    - **2s left**: Gavel pulls back $-48^\circ$ (`Going Twice` orange lamp glows).
    - **1s left**: Gavel cocks back $-72^\circ$ with vibrating tension pulse (`Hammer Fall` red lamp flashes).
    - **On SOLD**: Gavel whips forward into sound block ($+18^\circ$), compressing the block ($4\text{px}$) with an expanding golden shockwave ripple ring and bouncing 3D "SOLD!" badge.
- **Live Auctioneer Audio Visualizer**: 4-bar dancing waveform indicator that animates in real-time when speech synthesis is active.
- **Podium Quick Controls**: Quick Mute/Unmute toggle (🔊 / 🔇), SFX toggle, Voice Commentary toggle, and Audio Settings launcher.

---

### 5.4 Audio & Sound Settings Suite (`AudioSettingsModal.jsx`)

- Continuous Master Volume Slider ($0\%\text{–}100\%$).
- Sound FX toggle and Auctioneer Voice toggle.
- Voice selection dropdown detecting all available system English voices.
- Speech rate slider ($0.8\times\text{–}1.35\times$).
- **Interactive 6-Button Sound Test Pad**:
  - `🔨 Gavel Strike`: Tests the hardwood hammer crack and sub-thump.
  - `⏳ Tension Tick`: Tests the 3-stage countdown clicks.
  - `🙋‍♂️ Bid Paddle`: Tests the paddle pop.
  - `💰 Mega-Bid Chime`: Tests the 4-note golden arpeggio.
  - `🎺 Rivalry Horn`: Tests the dramatic derby war horn.
  - `👏 Applause`: Tests stadium crowd applause.
  - `🎙️ Test Live Commentary`: Synthesizes a full auctioneer broadcast sample.

---

## 6. Phase 5 Implementation Details: Multiplayer, Custom Rosters & State Recovery (Completed)

### 6.1 Pass-and-Play & Multi-Manager Engine (`MultiplayerSettingsModal.jsx` & `App.jsx`)

- **Flexible Multi-Franchise Ownership**:
  - Supports 1 to 10 human managers drafting concurrently on the same device.
  - Seamlessly toggled from initial start screen or on-the-fly via the `👥 Multi-Manager` header control.
  - Curated rival presets:
    - *Solo Manager*: 1 Human, 9 AI franchises.
    - *El Clásico Derby*: CSK & MI human-managed, 8 AI.
    - *Big 4 Rivals*: CSK, MI, RCB, KKR human-managed.
    - *Full War Room*: All 10 IPL franchises human-controlled.
  - Manager personalization: Custom player/manager names assigned to each franchise (e.g. "Alex (CSK)", "Rahul (MI)").

- **Multi-Manager Pre-Auction Retention Queue**:
  - Implements an asynchronous queue state machine (`retentionQueue`, `retentionStepIndex`, `totalRetentionSteps`) stepping sequentially through every human franchise's retentions.
  - `pendingHumanRetentionsRef` collects user retentions before running `getAIRetentions(humanTeamIds, teams, previousPlayersData)` for all automated franchises.
  - Preserves legitimate squad slots, purse deductions, and calculated RTM counts across all 10 franchises.

- **Dual-Action Live Bidding Console**:
  - **Active Paddle Switcher**: Instant tab switching between human managers (`setActiveHumanTeamId`).
  - **Multi-Manager Direct Paddles**: Color-coded, real-time paddle buttons for every human franchise rendered directly beneath the auction podium. Friends can slam their respective team's paddle simultaneously with independent `canTeamBid` verification, remaining purse badges, and dedicated `Pass` controls.
  - **Intelligent RTM Duel Resolution**:
    - Automatically checks `humanTeamIds.includes(prevTeam.id)`: if any human franchise holds RTM on a winning bid, the prompt is immediately routed to that specific manager.
    - If rival winning bidder is also human, routes to `FINAL_RAISE` for that human opponent, enabling authentic head-to-head friend duels.
  - **Strict AI Exclusion**: Automated bidding loop strictly excludes all `humanTeamIds`, guaranteeing the AI never bids on behalf of human players.

---

### 6.2 Custom Rosters & Database Studio (`PlayerEditorModal.jsx` & `vintageRosters.js`)

- **Interactive Database Studio (`PlayerEditorModal.jsx`)**:
  - **Search & Filter Grid**: Real-time filtering by player name and tactical roles (Batsman, Bowler, All-Rounder, Wicketkeeper).
  - **Dynamic Player Creator**: Add custom cricketers with customized base prices, roles, batting/bowling statistics, age, capped status, and auto-computed dynamic ratings (`calculatePlayerRating`).
  - **Inline Attribute Editor**: Edit base prices, player ratings, roles, and statistics directly on any active player.
  - **Pool Trimmer**: Delete unwanted players from the active auction pool.
  - **Import & Export Suite**:
    - *JSON Export*: Downloads the complete customized roster file (`cricket_auction_roster_[preset].json`).
    - *JSON Import*: Parses and injects custom external JSON player databases with automated validation.

- **Built-in Vintage & Fantasy Roster Presets (`src/data/vintageRosters.js`)**:
  1. **2025 Official Mega Auction (Default)**: Full 500+ modern IPL player pool (Pant, Rahul, Iyer, Arshdeep, Starc, etc.).
  2. **2008 Historic Inaugural Auction**: Authentic vintage roster recreating the historic first-ever IPL auction:
     - Sachin Tendulkar, Sourav Ganguly, Rahul Dravid, MS Dhoni, Shane Warne, Adam Gilchrist, Ricky Ponting, Sanath Jayasuriya, Glenn McGrath, Muttiah Muralitharan, Brett Lee, Brendon McCullum, Jacques Kallis, Shoaib Akhtar, Gautam Gambhir, young Rohit Sharma (2008 Prodigy), Virat Kohli (2008 U-19 Draft Sensation), etc.
  3. **All-Time Legends & T20 Titans**: Dream fantasy mega-roster:
     - AB de Villiers, Chris Gayle, Lasith Malinga, Virat Kohli, Rohit Sharma, Jasprit Bumrah, MS Dhoni, Suresh Raina, Kieron Pollard, Sunil Narine, David Warner, Dwayne Bravo, Rashid Khan, Andre Russell, Yuzvendra Chahal, Hardik Pandya, Trent Boult, KL Rahul, Suryakumar Yadav, Kagiso Rabada.
  - Dynamic Set Reconstruction: Switching presets automatically rebuilds all 11+ auction sets (`buildAuctionSets`) while preserving currently signed squad players.

---

### 6.3 LocalStorage Persistence & State Recovery (`src/utils/storageUtils.js`)

- **Robust State Serialization**:
  - Serializes all auction dimensions: `teams`, `userTeamId`, `humanTeamIds`, `activeHumanTeamId`, `managerNames`, `auctionSets`, `currentSetIndex`, `currentSetPlayerIndex`, `currentBid`, `currentBidderIndex`, `isAcceleratedRound`, `auctionLog`, and `activeRosterPreset`.
  - Storage Key: `cricket_auction_state_v1`.
- **Debounced Real-Time Auto-Save**:
  - Automatically commits auction state to `localStorage` 1.2 seconds after any bid, player sale, set transition, or squad change.
- **Recovery Interstitial Banner**:
  - Detects existing saved sessions on app mount (`hasSavedState`).
  - Displays top banner with **"▶ Resume Saved Auction"** (restoring exact player, bid, timer, squads, and ledger) or **"✕ Discard & Start Fresh"** (`clearSavedState`).
- **Header Checkpoint Controls**:
  - `💾 Save`: Instant manual checkpoint save with toast notification.
  - `🔄 Reset`: Confirmation prompt to clear storage and start a pristine new simulation.

---

### 6.4 Welcome Starter Page & Onboarding Navigation (`src/components/StarterPage.jsx`)

- **Dedicated Entry Portal**:
  - High-impact visual landing screen with ambient stadium lighting (`blur-[130px]`), gold accents, and franchise marquee badges.
  - Acts as the default application view (`showStarterPage = true`) prior to auction initiation.
- **Direct Mode Routing**:
  - **"🚀 Enter Auction Arena"**: Triggers `onStartSolo` → sets `teamSelectionInitialMode = "solo"` and hides the starter page to reveal the team selection modal.
  - **"👥 Pass & Play Mode"**: Triggers `onStartMultiplayer` → sets `teamSelectionInitialMode = "multiplayer"` for seamless multi-manager setup.
  - **"← Back to Welcome"**: In-modal back-navigation allows users to cleanly return from team selection to the starter page.
- **Feature Showcase & In-App Guide**:
  - 4 interactive feature cards explaining Authentic Mega Rules, Right to Match (RTM), Playing XI & Match Sim, and 3D Gavel FX.
  - Integrated **"📖 How to Play"** modal with quick rules, budget limits, retention slabs, and dynamic bid brackets.
- **Saved Session Prompt Integration**:
  - Prominently surfaces saved session detection banner with direct **"▶ Resume Saved Auction"** restore button.

---

### 6.5 Comprehensive User Manual (`document.md`)

- Complete 14-section user documentation guide covering:
  - Welcome & overview
  - Starter Page navigation
  - Solo vs. Pass-and-Play Multi-Manager setup
  - 10 Franchises & ₹120 Cr budget constraints
  - Pre-auction retentions and graduated deduction slabs
  - 3-Stage RTM duel workflow
  - Live auction arena, dynamic increments, and quick jumps
  - Structured auction sets and Accelerated Round unsold recall
  - Roster Studio, vintage presets, and custom JSON import/export
  - Playing XI Builder, formation rules, and Squad Chemistry scoring
  - Full 45-match IPL season simulation, points table, NRR, and playoffs
  - Procedural Web Audio FX and synthesized voice commentary
  - LocalStorage checkpoint recovery and PDF report export
  - Tactical advice and winning strategies

---

## 7. Data Structures & Schemas

### 7.1 Franchise Object (`src/utils/constants.js`)
```javascript
{
  id: 1,
  name: "Chennai Super Kings",
  shortName: "CSK",
  color: "border-yellow-400",
  headerColor: "bg-yellow-500",
  budget: 120.0, // in Crores
  players: [],   // Array of signed players
  rtmCount: 6,   // Initial RTMs = 6 - retentions
}
```

### 7.2 Player Object with Ratings & Previous Team
```javascript
{
  id: 1,
  name: "Ruturaj Gaikwad",
  role: "Batsman",
  age: 28,
  nationality: "Indian",
  basePrice: 2.0,
  matches: 74,
  runs: 2502,
  highestScore: 108,
  wickets: 0,
  battingAverage: 40.35,
  battingStrikeRate: 137.48,
  image: "/images/players/Ruturaj.png",
  previousTeamId: 1,
  previousTeamName: "Chennai Super Kings",
  isCapped: true,
  rating: 94
}
```

### 7.3 LocalStorage Checkpoint Schema (`src/utils/storageUtils.js`)
```javascript
{
  timestamp: 1727189400000,
  teams: [ ... ],
  userTeamId: 1,
  humanTeamIds: [1, 6],
  activeHumanTeamId: 1,
  managerNames: { "1": "Alex", "6": "Rahul" },
  auctionStarted: true,
  auctionEnded: false,
  auctionSets: [ ... ],
  currentSetIndex: 2,
  currentSetPlayerIndex: 4,
  currentBid: 5.5,
  currentBidderIndex: 0,
  isAcceleratedRound: false,
  auctionLog: [ ... ],
  activeRosterPreset: "2025_mega"
}
```

---

## 8. Verification Checklist

- [x] **Phase 1 RTM Logic**: Initial RTM counts calculated ($6 - \text{retained}$) with interactive 3-stage modal workflow.
- [x] **Phase 1 Auction Sets**: 11+ structured sets with set headers, progression tracking, and catalog modal.
- [x] **Phase 1 Set Completion**: Interstitial transition modal summarizing set sales and previewing next set.
- [x] **Phase 1 Accelerated Round**: Unsold recall modal with 50% discount and rapid 5s countdown timer.
- [x] **Phase 1 Squad Constraints**: 18–25 player limits, 8 overseas player cap, and minimum reserve calculation.
- [x] **Phase 2 Target-Aware AI Needs**: Positional quotas, deficit urgency levels (Critical, Urgent, Moderate, Filled, Surplus).
- [x] **Phase 2 Specialist Tracking**: Death bowlers, mystery spinners, and stumper finishers identified and prioritized.
- [x] **Phase 2 Purse-Pacing Algorithm**: Real-time ₹/slot pacing status (Splurge, Balanced, Conserving, Critical Safety).
- [x] **Phase 2 10 Franchise Personas**: Authentic strategic archetypes, preferred roles, and spending styles.
- [x] **Phase 2 IPL Rivalry Matrix**: Historic rivalry derbies (CSK vs MI, KKR vs RCB, CSK vs RCB, etc.).
- [x] **Phase 2 Bidding War Engine**: Dynamic tempo acceleration, valuation inflation, and `BiddingWarBanner` UI.
- [x] **Phase 2 AI Scouting Wire**: Real-time tactical insight ticker beneath the player showcase card.
- [x] **Phase 2 Team Needs Modal**: Full scouting dashboard accessible from the header and franchise cards.
- [x] **Phase 3 Playing XI Builder**: 11-player lineup selector, Captain & Vice-Captain assignments, batting order controls.
- [x] **Phase 3 Formation Validation**: Enforces $\le 4$ overseas, $\ge 1$ wicketkeeper, $\ge 5$ bowling options, and 11-player quota.
- [x] **Phase 3 Squad Chemistry Scoring**: Batting, Bowling, Balance, and Experience scores ($0\text{–}100$) with Tier classification.
- [x] **Phase 3 T20 Match Simulator**: Realistic ball-by-ball physics, powerplay/death phases, 4 venue pitch types, full scorecards, and POTM.
- [x] **Phase 3 Tournament Season Mode**: 45-match league schedule, live Points Table with NRR, 4-stage IPL Playoffs, and Confetti Championship trophy crowning.
- [x] **Phase 3 Quick Exhibition Match**: Custom head-to-head match-up simulator with stadium pitch conditions.
- [x] **Phase 4 Procedural Web Audio FX**: Gavel strike (transient + hardwood resonance + sub-thump), tension clock ticks (3s/2s/1s), paddle pops, high-bid chimes, rivalry horn, and applause.
- [x] **Phase 4 Synthesized Auctioneer Voice**: `SpeechSynthesis` speech commentary announcing bids, "Going once", "Going twice", "SOLD!", RTM calls, and bidding wars with phonetic normalization.
- [x] **Phase 4 3D Gavel Podium**: Animated hardwood gavel with $-24^\circ/-48^\circ/-72^\circ/+18^\circ$ tension angles, impact shockwaves, tension lamps, and live speech visualizer waves.
- [x] **Phase 4 Audio Settings Suite**: Master volume slider, SFX toggle, voice toggle, voice selector, speech rate, and 6-button sound test pad.
- [x] **Phase 5 Pass-and-Play Multiplayer**: 1 to 10 human managers, multi-franchise retention queue, active paddle switcher, dedicated direct multi-paddles, and human-vs-human RTM duels.
- [x] **Phase 5 Custom Rosters & Database Studio**: Interactive player editor, add custom players, edit prices/stats, delete players, JSON import/export.
- [x] **Phase 5 Vintage Presets**: 2025 Mega Auction (Default), 2008 Historic Inaugural (Tendulkar, Warne, Dhoni, etc.), and All-Time Legends & T20 Titans.
- [x] **Phase 5 LocalStorage State Recovery**: Automatic debounced checkpoint serialization, load/restore detection banner, manual save, and clean reset.
- [x] **Phase 5 Welcome Starter Page**: High-impact landing page, Solo & Pass-and-Play entry buttons, franchise marquee, in-app quick guide, and saved session restore banner.
- [x] **User Manual & Guide (`document.md`)**: Comprehensive 14-section user manual with step-by-step instructions, rules, tables, and strategies.
- [x] **Roster Drag & Drop**: Intact with `react-beautiful-dnd`.
- [x] **PDF Export**: Post-auction summary generation via `jspdf`.
- [x] **ESLint & Vite**: 0 lint errors, 0 warnings, clean production compilation.
