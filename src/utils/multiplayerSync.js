// src/utils/multiplayerSync.js
/**
 * Real-Time Multiplayer Room Synchronization Engine for Cricket Auction Simulator
 * Supports:
 *  1. BroadcastChannel API: Zero-latency instantaneous multi-tab sync on same machine.
 *  2. WebRTC DataChannel: Peer-to-peer cross-browser connection tokens.
 *  3. In-room event dispatching: Bids, Gavel strikes, Timers, Chat, and Role claims.
 */

export class AuctionRoomSync {
  constructor(roomId, onMessageCallback, role = "spectator", teamId = null, userName = "Player") {
    this.roomId = roomId;
    this.role = role; // 'host' | 'manager' | 'spectator'
    this.teamId = teamId;
    this.userName = userName;
    this.onMessage = onMessageCallback;
    this.channel = null;
    this.peerConnection = null;
    this.dataChannel = null;
    this.connected = false;

    this.initBroadcastChannel();
  }

  initBroadcastChannel() {
    try {
      if (typeof window !== "undefined" && window.BroadcastChannel) {
        this.channel = new BroadcastChannel(`ipl_auction_room_${this.roomId}`);
        this.channel.onmessage = (event) => {
          if (event.data && this.onMessage) {
            this.onMessage(event.data);
          }
        };
        this.connected = true;
      }
    } catch (err) {
      console.warn("BroadcastChannel not supported or error initializing:", err);
    }
  }

  send(type, payload = {}) {
    const message = {
      type,
      roomId: this.roomId,
      sender: {
        role: this.role,
        teamId: this.teamId,
        userName: this.userName,
      },
      timestamp: Date.now(),
      payload,
    };

    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (e) {
        console.error("Failed to post broadcast message:", e);
      }
    }

    if (this.dataChannel && this.dataChannel.readyState === "open") {
      try {
        this.dataChannel.send(JSON.stringify(message));
      } catch (e) {
        console.error("Failed to send WebRTC message:", e);
      }
    }

    return message;
  }

  // WebRTC Peer Connection for Cross-Device Linking
  async createOffer() {
    try {
      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      this.dataChannel = this.peerConnection.createDataChannel("auction_data");
      this.setupDataChannel(this.dataChannel);

      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      return new Promise((resolve) => {
        this.peerConnection.onicecandidate = (event) => {
          if (!event.candidate) {
            const token = btoa(JSON.stringify(this.peerConnection.localDescription));
            resolve(token);
          }
        };
        // Fallback timeout in case gathering stalls
        setTimeout(() => {
          if (this.peerConnection.localDescription) {
            resolve(btoa(JSON.stringify(this.peerConnection.localDescription)));
          }
        }, 1500);
      });
    } catch (err) {
      console.error("Error creating WebRTC offer:", err);
      return null;
    }
  }

  async acceptOffer(offerToken) {
    try {
      const offerDesc = JSON.parse(atob(offerToken));
      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      this.peerConnection.ondatachannel = (event) => {
        this.dataChannel = event.channel;
        this.setupDataChannel(this.dataChannel);
      };

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offerDesc));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      return new Promise((resolve) => {
        this.peerConnection.onicecandidate = (event) => {
          if (!event.candidate) {
            const token = btoa(JSON.stringify(this.peerConnection.localDescription));
            resolve(token);
          }
        };
        setTimeout(() => {
          if (this.peerConnection.localDescription) {
            resolve(btoa(JSON.stringify(this.peerConnection.localDescription)));
          }
        }, 1500);
      });
    } catch (err) {
      console.error("Error accepting WebRTC offer:", err);
      return null;
    }
  }

  async applyAnswer(answerToken) {
    try {
      const answerDesc = JSON.parse(atob(answerToken));
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answerDesc));
      return true;
    } catch (err) {
      console.error("Error applying WebRTC answer:", err);
      return false;
    }
  }

  setupDataChannel(channel) {
    channel.onopen = () => {
      this.connected = true;
      this.send("PEER_JOINED", { role: this.role, teamId: this.teamId, userName: this.userName });
    };

    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (this.onMessage) {
          this.onMessage(data);
        }
      } catch (e) {
        console.error("Error parsing incoming message:", e);
      }
    };

    channel.onclose = () => {
      this.connected = false;
    };
  }

  destroy() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.connected = false;
  }
}
