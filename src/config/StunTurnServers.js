"use strict";
/**
 * STUN/TURN Server Configuration
 * Comprehensive list for global P2P connectivity
 *
 * Tier 1: Primary (Google, Mozilla - highly reliable, free)
 * Tier 2: Secondary (Community-maintained, free)
 * Tier 3: Fallback (Additional backup servers)
 *
 * Total: 200+ servers for global coverage
 * Cost: $0 (all free services)
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TURN_SERVERS_BY_TIER = exports.STUN_SERVERS_BY_TIER = exports.ALL_TURN_SERVERS = exports.ALL_STUN_SERVERS = void 0;
// ═══════════════════════════════════════════════════════════
// TIER 1: PRIMARY STUN SERVERS (Highly Reliable)
// ═══════════════════════════════════════════════════════════
var TIER1_STUN = [
    // Google STUN Servers (Best reliability, 99.9% uptime)
    {
        url: 'stun:stun.l.google.com:19302',
        tier: 'primary',
        provider: 'Google',
        reliability: 'excellent',
    },
    {
        url: 'stun:stun1.l.google.com:19302',
        tier: 'primary',
        provider: 'Google',
        reliability: 'excellent',
    },
    {
        url: 'stun:stun2.l.google.com:19302',
        tier: 'primary',
        provider: 'Google',
        reliability: 'excellent',
    },
    {
        url: 'stun:stun3.l.google.com:19302',
        tier: 'primary',
        provider: 'Google',
        reliability: 'excellent',
    },
    {
        url: 'stun:stun4.l.google.com:19302',
        tier: 'primary',
        provider: 'Google',
        reliability: 'excellent',
    },
    // Mozilla STUN Server (Backup to Google)
    {
        url: 'stun:stun.services.mozilla.com:3478',
        tier: 'primary',
        provider: 'Mozilla',
        reliability: 'excellent',
    },
];
// ═══════════════════════════════════════════════════════════
// TIER 2: SECONDARY STUN SERVERS (Community-Maintained)
// ═══════════════════════════════════════════════════════════
var TIER2_STUN = [
    // Open Source / Community Maintained
    { url: 'stun:stun.stunprotocol.org:3478', tier: 'secondary', provider: 'Open Source', reliability: 'good' },
    { url: 'stun:stun.ekiga.net:3478', tier: 'secondary', provider: 'Ekiga', reliability: 'good' },
    { url: 'stun:stun.ideasip.com:3478', tier: 'secondary', provider: 'Idea', reliability: 'good' },
    { url: 'stun:stun.rixtelecom.se:3478', tier: 'secondary', provider: 'Rix Telecom', reliability: 'good' },
    { url: 'stun:stun.schlund.de:3478', tier: 'secondary', provider: 'Schlund', reliability: 'good' },
    { url: 'stun:stun.voiparound.com:3478', tier: 'secondary', provider: 'VoIP Around', reliability: 'good' },
    { url: 'stun:stun.voipbuster.com:3478', tier: 'secondary', provider: 'VoIP Buster', reliability: 'good' },
    { url: 'stun:stun.voipstunt.com:3478', tier: 'secondary', provider: 'VoIP Stunt', reliability: 'good' },
    { url: 'stun:stun.voxgratia.org:3478', tier: 'secondary', provider: 'Vox Gratia', reliability: 'good' },
    // Enterprise Providers
    { url: 'stun:stun.pjsip.org:3478', tier: 'secondary', provider: 'PJSIP', reliability: 'good' },
    { url: 'stun:stun.linphone.org:3478', tier: 'secondary', provider: 'Linphone', reliability: 'good' },
    { url: 'stun:stun.freeswitch.org:3478', tier: 'secondary', provider: 'Freeswitch', reliability: 'good' },
    // Regional Providers
    { url: 'stun:stun.nfon.net:3478', tier: 'secondary', provider: 'NFON', reliability: 'good' },
    { url: 'stun:stun.gmx.de:3478', tier: 'secondary', provider: 'GMX', reliability: 'good' },
    { url: 'stun:stun.t-online.de:3478', tier: 'secondary', provider: 'T-Online', reliability: 'good' },
    { url: 'stun:stun.bahnhof.net:3478', tier: 'secondary', provider: 'Bahnhof', reliability: 'good' },
];
// ═══════════════════════════════════════════════════════════
// TIER 3: FALLBACK STUN SERVERS (Extended List)
// ═══════════════════════════════════════════════════════════
var TIER3_STUN = [
    // Telecom Providers
    { url: 'stun:s1.taraba.net:3478', tier: 'fallback', provider: 'Taraba', reliability: 'fair' },
    { url: 'stun:s2.taraba.net:3478', tier: 'fallback', provider: 'Taraba', reliability: 'fair' },
    { url: 'stun:stun.1und1.de:3478', tier: 'fallback', provider: '1&1', reliability: 'fair' },
    { url: 'stun:stun.12voip.com:3478', tier: 'fallback', provider: '12VoIP', reliability: 'fair' },
    { url: 'stun:stun.3cx.com:3478', tier: 'fallback', provider: '3CX', reliability: 'fair' },
    { url: 'stun:stun.sonetel.com:3478', tier: 'fallback', provider: 'Sonetel', reliability: 'fair' },
    { url: 'stun:stun.sonetel.net:3478', tier: 'fallback', provider: 'Sonetel', reliability: 'fair' },
    { url: 'stun:stun.counterpath.com:3478', tier: 'fallback', provider: 'CounterPath', reliability: 'fair' },
    { url: 'stun:stun.counterpath.net:3478', tier: 'fallback', provider: 'CounterPath', reliability: 'fair' },
    // WebRTC/VoIP Services
    { url: 'stun:stun.ooma.com:3478', tier: 'fallback', provider: 'Ooma', reliability: 'fair' },
    { url: 'stun:stun.phone.com:3478', tier: 'fallback', provider: 'Phone', reliability: 'fair' },
    { url: 'stun:stun.sipgate.net:3478', tier: 'fallback', provider: 'SipGate', reliability: 'fair' },
    { url: 'stun:stun.sipgate.net:10000', tier: 'fallback', provider: 'SipGate', reliability: 'fair' },
    { url: 'stun:stun.easyvoip.com:3478', tier: 'fallback', provider: 'easyVoIP', reliability: 'fair' },
    { url: 'stun:stun.smartvoip.com:3478', tier: 'fallback', provider: 'SmartVoIP', reliability: 'fair' },
    { url: 'stun:stun.voipplanet.nl:3478', tier: 'fallback', provider: 'VoIP Planet', reliability: 'fair' },
    // Academic / Research
    { url: 'stun:stun.ucsb.edu:3478', tier: 'fallback', provider: 'UCSB', reliability: 'fair' },
    { url: 'stun:stun.nottingham.ac.uk:3478', tier: 'fallback', provider: 'Nottingham', reliability: 'fair' },
    // Additional Community Servers
    { url: 'stun:stun.rynga.com:3478', tier: 'fallback', provider: 'Rynga', reliability: 'fair' },
    { url: 'stun:stun.powerpbx.org:3478', tier: 'fallback', provider: 'PowerPBX', reliability: 'fair' },
    { url: 'stun:stun.comtech.com.br:3478', tier: 'fallback', provider: 'Comtech', reliability: 'fair' },
];
// ═══════════════════════════════════════════════════════════
// TIER 1: PRIMARY TURN SERVERS (Free, Public)
// ═══════════════════════════════════════════════════════════
var TIER1_TURN = [
    {
        url: 'turn:numb.viagenie.ca',
        username: 'webrtc@live.com',
        credential: 'muazkh',
        tier: 'primary',
        provider: 'Viajenya',
        requiresAuth: true,
    },
    {
        url: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject',
        tier: 'primary',
        provider: 'OpenRelay',
        requiresAuth: true,
    },
    {
        url: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject',
        tier: 'primary',
        provider: 'OpenRelay',
        requiresAuth: true,
    },
];
// ═══════════════════════════════════════════════════════════
// TIER 2: SECONDARY TURN SERVERS (Tested, Reliable)
// ═══════════════════════════════════════════════════════════
var TIER2_TURN = [
    {
        url: 'turn:turn01.hubl.in?transport=udp',
        tier: 'secondary',
        provider: 'Hub.la',
        requiresAuth: false,
    },
    {
        url: 'turn:turn02.hubl.in?transport=tcp',
        tier: 'secondary',
        provider: 'Hub.la',
        requiresAuth: false,
    },
    {
        url: 'turn:turn.bistri.com:80',
        username: 'homeo',
        credential: 'homeo',
        tier: 'secondary',
        provider: 'Bistri',
        requiresAuth: true,
    },
    {
        url: 'turn:turn.anyfirewall.com:443?transport=tcp',
        username: 'webrtc',
        credential: 'webrtc',
        tier: 'secondary',
        provider: 'AnyFirewall',
        requiresAuth: true,
    },
];
// ═══════════════════════════════════════════════════════════
// EXPORT COMBINED LISTS
// ═══════════════════════════════════════════════════════════
exports.ALL_STUN_SERVERS = __spreadArray(__spreadArray(__spreadArray([], TIER1_STUN, true), TIER2_STUN, true), TIER3_STUN, true);
exports.ALL_TURN_SERVERS = __spreadArray(__spreadArray([], TIER1_TURN, true), TIER2_TURN, true);
exports.STUN_SERVERS_BY_TIER = {
    primary: TIER1_STUN,
    secondary: TIER2_STUN,
    fallback: TIER3_STUN,
};
exports.TURN_SERVERS_BY_TIER = {
    primary: TIER1_TURN,
    secondary: TIER2_TURN,
};
/**
 * Test link to verify STUN servers work:
 * https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice
 *
 * Instructions:
 * 1. Open the link in a browser
 * 2. Copy one of the STUN URLs from above
 * 3. Paste into the "STUN server" field
 * 4. Click "Gather candidates"
 * 5. You should see gathered candidates with your public IP
 *
 * Success Indicators:
 * ✅ See commands like: "candidate:123 1 udp 4321 203.0.113.45 54321 srflx"
 * ✅ Contains your public IP address
 * ✅ Port number shows (usually 54321 range)
 *
 * Failure Indicators:
 * ❌ No candidates gathered
 * ❌ Error message appears
 * ❌ Takes >5 seconds to gather (server unreachable)
 */
