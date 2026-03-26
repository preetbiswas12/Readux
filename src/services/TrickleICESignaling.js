"use strict";
/**
 * Trickle ICE Signaling via GunDB
 * Streams ICE candidates in real-time for faster connection establishment
 *
 * Uses existing GunDBService methods:
 * - publishSDPOffer/fetchSDPOffer
 * - publishSDPAnswer/fetchSDPAnswer
 * - publishICECandidates/fetchICECandidates
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrickleICEService = exports.TrickleICESignaling = void 0;
var gundbService_1 = require("./gundbService");
var TrickleICESignaling = /** @class */ (function () {
    function TrickleICESignaling() {
        this.candidateCounts = new Map();
    }
    /**
     * Publish SDP offer to peer
     */
    TrickleICESignaling.prototype.publishSDPOffer = function (peerId, callId, sdp) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, gundbService_1.GunDBService.publishSDPOffer(peerId, { type: 'offer', sdp: sdp }, callId)];
                    case 1:
                        _a.sent();
                        console.log("\uD83D\uDCE4 [TrickleICE] Published SDP offer to @".concat(peerId));
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('[TrickleICE] Failed to publish SDP offer:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetch SDP offer from peer
     */
    TrickleICESignaling.prototype.fetchSDPOffer = function (peerId, callId) {
        return __awaiter(this, void 0, void 0, function () {
            var offer, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, gundbService_1.GunDBService.fetchSDPOffer(peerId, callId)];
                    case 1:
                        offer = _a.sent();
                        if (offer === null || offer === void 0 ? void 0 : offer.sdp) {
                            console.log("\uD83D\uDCE5 [TrickleICE] Fetched SDP offer from @".concat(peerId));
                            return [2 /*return*/, offer.sdp];
                        }
                        return [2 /*return*/, null];
                    case 2:
                        error_2 = _a.sent();
                        console.warn('[TrickleICE] Failed to fetch SDP offer:', error_2);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Publish SDP answer to peer
     */
    TrickleICESignaling.prototype.publishSDPAnswer = function (peerId, callId, sdp) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, gundbService_1.GunDBService.publishSDPAnswer(peerId, { type: 'answer', sdp: sdp }, callId)];
                    case 1:
                        _a.sent();
                        console.log("\uD83D\uDCE4 [TrickleICE] Published SDP answer to @".concat(peerId));
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('[TrickleICE] Failed to publish SDP answer:', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetch SDP answer from peer
     */
    TrickleICESignaling.prototype.fetchSDPAnswer = function (peerId, callId) {
        return __awaiter(this, void 0, void 0, function () {
            var answer, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, gundbService_1.GunDBService.fetchSDPAnswer(peerId, callId)];
                    case 1:
                        answer = _a.sent();
                        if (answer === null || answer === void 0 ? void 0 : answer.sdp) {
                            console.log("\uD83D\uDCE5 [TrickleICE] Fetched SDP answer from @".concat(peerId));
                            return [2 /*return*/, answer.sdp];
                        }
                        return [2 /*return*/, null];
                    case 2:
                        error_4 = _a.sent();
                        console.warn('[TrickleICE] Failed to fetch SDP answer:', error_4);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Publish ICE candidates to peer (batched)
     */
    TrickleICESignaling.prototype.publishCandidates = function (peerId, candidates) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, gundbService_1.GunDBService.publishICECandidates(peerId, candidates)];
                    case 1:
                        _a.sent();
                        console.log("\u2708\uFE0F  [TrickleICE] Published ".concat(candidates.length, " candidate(s) to @").concat(peerId));
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.warn('[TrickleICE] Failed to publish candidates:', error_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetch ICE candidates from peer
     */
    TrickleICESignaling.prototype.fetchCandidates = function (peerId) {
        return __awaiter(this, void 0, void 0, function () {
            var candidates, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, gundbService_1.GunDBService.fetchICECandidates(peerId)];
                    case 1:
                        candidates = _a.sent();
                        if (candidates && candidates.length > 0) {
                            console.log("\u2708\uFE0F  [TrickleICE] Fetched ".concat(candidates.length, " candidate(s) from @").concat(peerId));
                            // Normalize address family
                            return [2 /*return*/, candidates.map(function (c) {
                                    var _a;
                                    return (__assign(__assign({}, c), { addressFamily: (((_a = c.address) === null || _a === void 0 ? void 0 : _a.includes(':'))
                                            ? 'ipv6'
                                            : 'ipv4') }));
                                })];
                        }
                        return [2 /*return*/, []];
                    case 2:
                        error_6 = _a.sent();
                        console.warn('[TrickleICE] Failed to fetch candidates:', error_6);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Publish presence/online status
     */
    TrickleICESignaling.prototype.publishPresence = function (peerId, isOnline) {
        return __awaiter(this, void 0, void 0, function () {
            var error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, gundbService_1.GunDBService.publishPresence(peerId, isOnline)];
                    case 1:
                        _a.sent();
                        console.log("\uD83D\uDC64 [TrickleICE] Published presence (".concat(isOnline ? 'online' : 'offline', ") as @").concat(peerId));
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        console.warn('[TrickleICE] Failed to publish presence:', error_7);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Subscribe to presence updates from peer
     */
    TrickleICESignaling.prototype.subscribeToPresence = function (peerId, onPresenceChange) {
        var unsubscribe = gundbService_1.GunDBService.subscribePresence(peerId, onPresenceChange);
        console.log("\uD83D\uDC42 [TrickleICE] Subscribed to presence from @".concat(peerId));
        return unsubscribe;
    };
    /**
     * Get stats on trickle ICE performance
     */
    TrickleICESignaling.prototype.getStats = function (peerId) {
        var count = this.candidateCounts.get(peerId) || 0;
        return {
            candidateCount: count,
            avgLatency: 50, // Typical GunDB latency
            messagesPerSecond: Math.min(count / 5, 10), // Typical rate
        };
    };
    return TrickleICESignaling;
}());
exports.TrickleICESignaling = TrickleICESignaling;
exports.TrickleICEService = new TrickleICESignaling();
exports.default = exports.TrickleICEService;
