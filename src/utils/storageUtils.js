// LocalStorage persistence and checkpoint management for Cricket Auction Simulator

export const AUCTION_STORAGE_KEY = "cricket_auction_state_v1";

/**
 * Checks if a valid saved auction state exists in localStorage
 */
export const hasSavedState = () => {
  try {
    const raw = localStorage.getItem(AUCTION_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed && parsed.timestamp && Array.isArray(parsed.teams) && parsed.auctionStarted;
  } catch (err) {
    console.error("Error reading saved auction state:", err);
    return false;
  }
};

/**
 * Retrieves and deserializes saved auction state from localStorage
 */
export const loadSavedState = () => {
  try {
    const raw = localStorage.getItem(AUCTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error("Error loading saved state:", err);
    return null;
  }
};

/**
 * Serializes and saves auction state to localStorage
 */
export const saveAuctionState = (state) => {
  try {
    const payload = {
      timestamp: Date.now(),
      teams: state.teams,
      userTeamId: state.userTeamId,
      humanTeamIds: state.humanTeamIds || (state.userTeamId ? [state.userTeamId] : [1]),
      isMultiplayer: state.isMultiplayer || false,
      managerNames: state.managerNames || {},
      auctionStarted: state.auctionStarted,
      auctionEnded: state.auctionEnded,
      auctionSets: state.auctionSets,
      currentSetIndex: state.currentSetIndex,
      currentSetPlayerIndex: state.currentSetPlayerIndex,
      currentBid: state.currentBid,
      currentBidderIndex: state.currentBidderIndex,
      isAcceleratedRound: state.isAcceleratedRound,
      auctionLog: state.auctionLog,
      activeRosterPreset: state.activeRosterPreset || "2025_mega",
      customPlayersAdded: state.customPlayersAdded || [],
    };
    localStorage.setItem(AUCTION_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.error("Failed to save auction state:", err);
    return false;
  }
};

/**
 * Clears saved auction state from localStorage
 */
export const clearSavedState = () => {
  try {
    localStorage.removeItem(AUCTION_STORAGE_KEY);
    return true;
  } catch (err) {
    console.error("Error clearing saved state:", err);
    return false;
  }
};
