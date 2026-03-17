# Claude's Work Memory

## Project Aegis - Serverless P2P Chat (Zero Infrastructure Cost)

### Core Concept
100% Peer-to-Peer (P2P), End-to-End Encrypted (E2EE) communication suite with **$0 infrastructure cost** and **zero centralized servers**. Uses mesh networking where every client is a node.

---

## 1. Architecture Overview

**Model:** Mesh/P2P (not Client-Server)
- **Identity:** Cryptographic key pairs (Public/Private), not database entries
- **Transport:** Direct UDP/TCP tunnels between devices via WebRTC
- **Storage:** Source of truth is on user's physical hardware
- **Key Principle:** Local-first logic with decentralized synchronization

---

## 2. Technical Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React Native (Expo) | Cross-platform mobile |
| **Discovery** | GunDB + SEA | Decentralized user lookup & key mgmt |
| **Tunneling** | WebRTC (react-native-webrtc) | P2P video, audio, data channels |
| **Signaling** | GunDB Relay | Handshake swap without custom server |
| **Local DB** | SQLite (expo-sqlite) | Chat history, timestamps, media paths |
| **Encryption** | libsignal / SEA | AES-256 & RSA for E2EE |
| **NAT Traversal** | Google Public STUN | Firewall bypass ($0) |
| **DB Encryption** | SQLCipher | Local database encryption |

---

## 3. Feature Execution

### A. Authentication & Search (DHT instead of Database)
1. **Signup:** Generate unique keypair (Pub/Priv), user picks alias (@preet)
2. **Publication:** Announce to Gun network: `alias @preet -> pubKey XYZ`
3. **Search:** Crawl decentralized graph to find pubKey + IP/signaling data

### B. Text & Read Receipts (WebRTC Data Channels)
- Message encrypted with recipient's public key
- Timestamps generated locally (Lamport Timestamps for clock skew)
- **Double Tick:** ACK packet when received
- **Blue Tick:** READ packet when chat UI opened

### C. Audio & Video Calling
1. Call request via GunDB
2. Both exchange ICE candidates (network addresses)
3. Direct encrypted stream established (no third-party relay)

### D. File, Photo & Video Transfer
1. **Chunking:** Break into 16KB chunks
2. **Streaming:** Send sequentially over data channel
3. **Reconstruction:** Receive chunks, write to local filesystem

---

## 4. Notification Workaround (Mobile Background)

**Android:** Persistent foreground service with WebSocket/UDP listener (permanent notification icon required)

**iOS:** Background fetch cycles or Firebase trigger to wake app for P2P network checks

---

## 5. Security (E2EE Protocol)

- **Key Exchange:** ECDH (Elliptic Curve Diffie-Hellman)
- **Perfect Forward Secrecy:** New keys per session
- **Local Encryption:** SQLCipher database keyed to login password

---

## 6. R&D Roadmap

### Phase 1: The Handshake (Week 1-2)
- [ ] Integrate GunDB with public relay discovery
- [ ] BIP-39 seed generation & key derivation
- [ ] User signup (generate keypair, pick alias @username)
- [ ] Login/logout from stored seed phrase
- [ ] SEA authentication sign/verify

### Phase 2: The Tunnel (Week 3-4)
- [ ] Integrate react-native-webrtc
- [ ] WebRTC data channel for text messages
- [ ] SQLite local storage for chat history
- [ ] Offline message queue (pending table)
- [ ] GunDB presence detection for sync trigger
- [ ] Basic sender ↔ receiver text flow

### Phase 3: The Media (Week 5-6)
- [ ] WebRTC audio/video streams
- [ ] Libsignal Double Ratchet integration
- [ ] Call request UI (via GunDB signaling)
- [ ] STUN latency testing
- [ ] ICE candidate exchange
- [ ] Video/audio permission handling

### Phase 4: Persistence & Scale (Week 7-8)
- [ ] Android Foreground Service (AlwaysOnline mode)
- [ ] Battery Saver mode (15-min check intervals)
- [ ] File chunking for 10MB+ transfers
- [ ] Message history peer-to-peer sync (new device)
- [ ] Group chat full-mesh architecture
- [ ] Local error logging + crash export
- [ ] TURN fallback for strict NAT

---

## 7. Architectural Decisions (Design Constraints)

### 1. GunDB Relay Strategy
- **Model:** Hybrid Public Relays + Peer-as-Relay
- **Discovery:** Public relays (gun.eco, dweb.link) only for initial key lookup
- **Transport:** Once connected via WebRTC, peers act as their own relays
- **Privacy:** Never store unencrypted chat on public relays—use them to "find the boat, not store the cargo"

### 2. Offline Message Queuing
- **Model:** Local Queue (Sender-Side Persistence)
- **Sync:** Purely synchronous tunnels; messages queued locally until recipient comes online
- **Trigger:** GunDB "presence" feature signals when peer is online → WebRTC handshake → flush queue
- **Guarantee:** No messages sit on public relays waiting

### 3. Group Chats
- **Architecture:** Full Mesh (each participant owns local copy)
- **Scale:** Up to 10-15 people per group
- **Protocol:** Sender loops through all group member pubKeys, sends individually
- **Guarantee:** No shared "conversation document" on any server

### 4. TURN Servers for Strict NAT
- **Fallback:** Community-run free TURN (Open Relay Project, etc.)
- **Limit:** Accept "Network Restricted" error for extreme corporate firewalls
- **Reasoning:** Private TURN has bandwidth costs; stay at $0
- **Reality:** ~80% of users succeed with STUN alone

### 5. Key Recovery/Backup
- **Method:** BIP-39 Recovery Passphrase (12-Word Seed)
- **Device Loss:** Identity is gone unless user saved seed
- **No Cloud:** Avoid third-party backup providers
- **Regen:** 12-word seed generates same SEA keypair on new device

### 6. Android Battery Drain
- **Default:** Battery Saver mode (message checks every 15 minutes)
- **Optional:** Toggle "Always Online" (Foreground Service + persistent notification)
- **Trade-off:** Users choose between battery life and instant messaging

### 7. Encryption Library Split
- **SEA:** User authentication + signing handshake (proof of identity)
- **Libsignal (Double Ratchet):** Message exchange with Perfect Forward Secrecy
- **Key Rotation:** New keys per session; old message key leak ≠ conversation breach

### 8. React Native Implementation
- **Choice:** Bare React Native (or Expo Development Builds)
- **Reason:** Need access to AndroidManifest.xml + native Java/Kotlin
- **Requirement:** Implement Foreground Service for P2P background listening
- **Limitation:** Standard Expo Managed won't allow reliable background operation

### 9. Message History Sync (Multi-Device)
- **Model:** Peer-to-Peer Sync via Local Network
- **Trigger:** New device generates "Sync Request"
- **Flow:** Old device must be online to push SQLite history to new device
- **Guarantee:** No history ever pulled from a server

### 10. Analytics/Telemetry
- **Model:** Local Error Logs + Optional Export
- **Privacy:** Zero automatic pings to Sentry/LogRocket
- **Crash Handling:** Save crash.txt locally; user can choose to share
- **Visibility:** All errors stay on user's device unless explicitly reported

---

## 8. Budget & Sustainability

- **Development:** $0 (open source)
- **Hosting:** $0 (user-hosted/P2P)
- **Scaling:** $0 (network grows stronger with more peers)

---

## Session Log - March 17, 2026

### Phase 1: The Handshake ✅ COMPLETE

#### Infrastructure Setup:
- ✅ Initialized Bare React Native project with Expo
- ✅ Configured pnpm package manager
- ✅ Added Phase 1 dependencies:
  - bip39 (BIP-39 seed generation)
  - gun (GunDB P2P discovery)
  - tweetnacl (NaCl cryptography)
  - expo-secure-store (secure storage)
  - expo-sqlite (local database)
  - uuid (unique identifiers)

#### Core Services Created:

1. **CryptoService** (`src/services/CryptoService.ts`)
   - BIP-39 seed generation (12-word phrases)
   - Deterministic keypair derivation from seed
   - Message signing & verification (SEA-like)
   - ECDH ephemeral keypair generation
   - Encryption/decryption stubs (for Phase 3 libsignal)
   - Cryptographic randomness utilities

2. **GunDBService** (`src/services/GunDBService.ts`)
   - GunDB DHT initialization (public relays)
   - User registration & discovery
   - Presence tracking (online/offline)
   - ICE candidate exchange (for WebRTC signaling)
   - Call request publishing/subscription
   - Relay fallback strategy

3. **SQLiteService** (`src/services/SQLiteService.ts`)
   - Local database initialization
   - Message history table (sender, recipient, timestamp)
   - Pending messages queue (offline support)
   - Contacts management
   - Group chats & group messages
   - App state persistence (user identity)
   - Message delivery & read tracking (double/blue ticks)

4. **StorageService** (`src/services/StorageService.ts`)
   - Secure storage for BIP-39 seed
   - Private key protection
   - User identity persistence
   - Login state tracking

5. **AppContext** (`src/contexts/AppContext.tsx`)
   - Global app state management
   - Signup workflow (seed generation)
   - Login workflow (seed recovery)
   - Online presence management
   - Battery mode toggle (saver/always)

#### UI Screens Created:

1. **SplashScreen** - App initialization state
2. **SignupScreen** - New account creation with seed display
3. **LoginScreen** - Account recovery via 12-word seed
4. **ChatListScreen** - Conversation list

---

### Phase 2: The Tunnel ✅ COMPLETE

#### New Services Created:

1. **WebRTCService** (`src/services/WebRTCService.ts`)
   - P2P peer connection establishment
   - Data channel creation & management
   - SDP offer/answer exchange
   - ICE candidate handling
   - Connection state monitoring
   - STUN/TURN server configuration
   - Media track support (audio/video)

2. **MessageService** (`src/services/MessageService.ts`)
   - Text message encryption/decryption
   - Message packet creation
   - ACK packets (double tick - delivered)
   - READ packets (blue tick - read)
   - Offline queue flushing on presence
   - Message handler registration
   - Chat history retrieval

#### Updated Services:

3. **AppContext** - Now includes:
   - WebRTC peer connection management
   - Peer connectivity triggers
   - Presence-based connection setup
   - Pending message flushing

#### New UI Screens:

4. **ChatDetailScreen** - Peer-to-peer messaging:
   - Message list with send/receive
   - ACK/READ status indicators (double/blue ticks)
   - Connection status (online/offline badge)
   - Optimistic message UI
   - Message history loading
   - Call initiation buttons (audio/video)

5. **Updated ChatListScreen**:
   - User search by alias
   - Conversation list display
   - Navigation to chat detail
   - Connection initiation on peer search

#### Current Functionality (Phase 2):
✅ WebRTC peer connection setup  
✅ Data channel messaging  
✅ Message ACK/READ tracking  
✅ Offline message queue  
✅ User discovery & search  
✅ Conversation persistence  
✅ Connection status indicators  

---

### Phase 3: The Media ✅ COMPLETE

#### New Services Created:

1. **KeyExchangeService** (`src/services/KeyExchangeService.ts`)
   - Double Ratchet algorithm for Perfect Forward Secrecy
   - ECDH ephemeral keypair generation
   - Session key initialization & rotation
   - Message encryption/decryption with nonce
   - Session termination & cleanup
   - Key counter management for replay prevention

2. **AudioVideoService** (`src/services/AudioVideoService.ts`)
   - Audio capture and track management
   - Video capture and track management
   - Platform-specific permission handling (iOS/Android)
   - Supported codec detection
   - Media stream lifecycle management

3. **CallService** (`src/services/CallService.ts`)
   - Call state machine (6 states: idle → ringing → calling → active → ended/rejected)
   - Call lifecycle management (initiate, accept, reject, end)
   - Ephemeral key exchange for encrypted calls
   - Local/remote stream management
   - Call state notifications & handlers
   - Call session tracking
   - Duration calculation

#### Updated Services:

4. **WebRTCService** - Extended with:
   - Media track support (addLocalStream, onTrack)
   - Audio/video track management
   - Stream negotiation
   - RTCView integration for video rendering
   - Connection event listeners for media

5. **AppContext** - Now includes:
   - Call management methods (initiateCall, acceptCall, rejectCall, endCall)
   - Incoming call request handling
   - Call state notifications
   - Global call state persistence

#### New UI Screens:

6. **CallScreen** (`src/screens/CallScreen.tsx`)
   - Active call UI with dual video display
   - Local video (picture-in-picture)
   - Remote video (fullscreen)
   - Call timer with elapsed duration
   - Mute/unmute audio toggle
   - Camera on/off toggle (video calls)
   - End call button
   - Connection status badge
   - Loading state while establishing connection
   - Call ended overlay with duration

#### Dependencies Added:
- ✅ expo-av (^14.0.1) - Audio/video capture
- ✅ react-native-webrtc (^124.0.7) - Media streaming

#### Current Functionality (Phase 3):
✅ WebRTC audio/video streams  
✅ Double Ratchet Perfect Forward Secrecy  
✅ Call request signaling via GunDB  
✅ Media permission handling  
✅ Video/audio track management  
✅ Call state machine & lifecycle  
✅ Real-time stream display (RTCView)  
✅ Audio/video controls (mute, camera toggle)  
✅ All TypeScript compilation (zero errors)  
✅ Service singleton pattern with correct exports  

---

### Phase 4: Background Listening & Battery Optimization ✅ PHASE 4.1 COMPLETE, 4.2 UI COMPLETE

#### Phase 4.1: Android Foreground Service (✅ COMPLETE)

**Completed:**
- ✅ BatteryModeService: Battery optimization with 'saver' (15-min polling) vs 'always' (foreground) modes
- ✅ BackgroundService: Background listening orchestration with GunDB queries for incoming calls
- ✅ SettingsScreen: User-facing UI with battery mode toggle and status display
- ✅ AppContext Integration: Full lifecycle management (init, login, signup, logout)
- ✅ StorageService Persistence: Battery mode preference saved/loaded across restarts
- ✅ GunDB Call Queries: Real-time call detection with timestamp filtering to prevent duplicates
- ✅ All TypeScript compilation (0 errors)

**Files Created:**
- src/services/BatteryModeService.ts (instance methods, config state machine)
- src/services/BackgroundService.ts (orchestration, GunDB queries, polling)
- src/screens/SettingsScreen.tsx (battery mode toggle, status display)
- Updated src/contexts/AppContext.tsx (background service lifecycle hooks)
- Updated src/services/StorageService.ts (battery mode persistence)

#### Phase 4.2: Error Handling & Logging ✅ COMPLETE (UI LAYER)

**Completed:**
- ✅ ErrorLoggingService: Comprehensive error categorization, crash reports, export
  - Methods: logError(), logWarning(), logInfo(), logCrash()
  - Features: Debug mode toggle, in-memory store (1000 log limit), SQLiteService persistence
  - Export: JSON and text formats via Share API
  - Diagnostics: getDiagnosticSummary() aggregates errors by category
- ✅ NetworkDiagnosticsService: STUN/GunDB connectivity testing with quality scoring
  - Tests: runDiagnostics() comprehensive suite, testGunDBConnection(), testSTUNConnectivity()
  - Quality scoring: excellent/good/fair/poor/offline based on latency thresholds
  - ICE candidate gathering with 3-second timeout
  - Actionable recommendations generation
- ✅ ErrorExportScreen: Full React Native UI component with dual tabs
  - Logs tab: Debug mode toggle, error summary stats, recent logs viewer, crash reports
  - Network Diagnostics tab: Run tests, display results, quality indicators, recommendations
  - Features: Export button, clear logs with confirmation, loading states
- ✅ SettingsScreen integration: Added "Diagnostics" button with navigation callback
- ✅ App.tsx navigation: Added diagnostics screen state and routing ('diagnostics' screen type)
- ✅ Import path corrections: Fixed relative imports in App.tsx (./contexts -> ../contexts)
- ✅ StatusBar compatibility: Replaced deprecated barStyle prop with hidden={false}
- ✅ All TypeScript compilation (0 errors for Phase 4.2)

**Files Created:**
- src/services/ErrorLoggingService.ts (300+ lines, singleton with full logging API)
- src/services/NetworkDiagnosticsService.ts (250+ lines, singleton with diagnostic tests)
- src/screens/ErrorExportScreen.tsx (410+ lines, complete UI with tabs, export, refresh)

**Files Modified:**
- src/screens/SettingsScreen.tsx: Added onOpenDiagnostics prop, Diagnostics button section
- src/App.tsx: Added ErrorExportScreen import, 'diagnostics' AppScreen type, conditional rendering, fixed imports

#### Phase 4.3-4.8: Remaining Tasks ⏳ NOT STARTED

**4.3: TURN Fallback**

---

## PROJECT STATUS SUMMARY

**Completed ✅**
- Phase 1: User authentication (BIP-39, keypairs, identity management, GunDB DHT lookup)
- Phase 2: Text messaging (WebRTC data channels, message delivery tracking, offline queue)
- Phase 3: Audio/video calls (real-time media streaming, encryption, call management)
- Phase 4.1: Background listening (Android foreground service, battery optimization, GunDB polling)
- Phase 4.2: Error & diagnostics UI (ErrorLoggingService, NetworkDiagnosticsService, ErrorExportScreen)
- All TypeScript compilation errors fixed (0 errors, 0 warnings)
- Service architecture with singleton pattern properly implemented
- Navigation integrated with state-based screen management (chat-list, settings, diagnostics)

**In Progress / Pending ⏳**
- Phase 4.3: TURN Fallback (community TURN servers for strict NAT)
- Phase 4.4: File Transfer (chunking, streaming, resumable uploads)
- Phase 4.5: Multi-device Message History Sync (peer-to-peer sync via local network)
- Phase 4.6: Group Chat Scaling (full-mesh architecture for 10-15 user groups)
- Phase 4.7: Performance Optimization (codec selection, bandwidth monitoring, quality adjustment)
- Phase 4.8: End-to-End Testing (real device testing, NAT traversal verification)

**Current State**
- Core P2P infrastructure stable and feature-complete up to Phase 4.2
- All services are singletons with proper TypeScript interfaces
- ErrorLoggingService ready for app-wide crash handling integration
- NetworkDiagnosticsService ready for troubleshooting and connection quality monitoring
- ErrorExportScreen provides user-facing diagnostics and log management
- Ready for next phase: TURN fallback implementation or file transfer features
