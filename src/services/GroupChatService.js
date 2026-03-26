"use strict";
/**
 * Project Aegis - Group Chat Service
 * Handles multi-user group chats with full-mesh P2P architecture
 * Max 10-15 users per group (scalability bound)
 */
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
var uuid_1 = require("uuid");
var SQLiteService_1 = require("./SQLiteService");
/**
 * Group Chat Service (Singleton)
 * Manages full-mesh P2P group chats with up to 15 users
 */
var GroupChatService = /** @class */ (function () {
    function GroupChatService() {
        this.groups = new Map();
        this.groupMessages = new Map();
        this.groupMemberPresence = new Map();
        this.groupHandlers = new Map();
        this.groupStateHandlers = new Map();
        this.memberPresenceHandlers = new Map();
        this.MAX_GROUP_SIZE = 15;
        console.log("\uD83D\uDC65 GroupChatService initialized (max ".concat(this.MAX_GROUP_SIZE, " users per group)"));
    }
    /**
     * Create a new group chat
     */
    GroupChatService.prototype.createGroup = function (name, members, creatorAlias, description) {
        return __awaiter(this, void 0, void 0, function () {
            var allMembers, groupId, group, presenceMap, _i, allMembers_1, member;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        allMembers = __spreadArray([creatorAlias], members.filter(function (m) { return m !== creatorAlias; }), true);
                        if (allMembers.length > this.MAX_GROUP_SIZE) {
                            throw new Error("Group size (".concat(allMembers.length, ") exceeds maximum (").concat(this.MAX_GROUP_SIZE, ")"));
                        }
                        groupId = (0, uuid_1.v4)();
                        group = {
                            id: groupId,
                            name: name,
                            members: allMembers,
                            createdBy: creatorAlias,
                            createdAt: Date.now(),
                            description: description,
                            isArchived: false,
                        };
                        this.groups.set(groupId, group);
                        this.groupMessages.set(groupId, []);
                        presenceMap = new Map();
                        for (_i = 0, allMembers_1 = allMembers; _i < allMembers_1.length; _i++) {
                            member = allMembers_1[_i];
                            presenceMap.set(member, {
                                alias: member,
                                isOnline: false,
                                lastSeen: Date.now(),
                            });
                        }
                        this.groupMemberPresence.set(groupId, presenceMap);
                        // Persist to local database
                        return [4 /*yield*/, SQLiteService_1.SQLiteService.createGroupChat(groupId, name, allMembers, creatorAlias, description)];
                    case 1:
                        // Persist to local database
                        _a.sent();
                        console.log("\uD83D\uDC65 Group created: \"".concat(name, "\" (").concat(allMembers.length, " members) - ").concat(groupId));
                        return [2 /*return*/, group];
                }
            });
        });
    };
    /**
     * Get a group by ID
     */
    GroupChatService.prototype.getGroup = function (groupId) {
        return this.groups.get(groupId);
    };
    /**
     * Get all groups for a user
     */
    GroupChatService.prototype.getUserGroups = function (userAlias) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.groups.values()).filter(function (g) {
                        return g.members.includes(userAlias) && !g.isArchived;
                    })];
            });
        });
    };
    /**
     * Add a member to existing group
     */
    GroupChatService.prototype.addMember = function (groupId, newMemberAlias, adderAlias) {
        return __awaiter(this, void 0, void 0, function () {
            var group, presenceMap;
            return __generator(this, function (_a) {
                group = this.groups.get(groupId);
                if (!group) {
                    throw new Error("Group ".concat(groupId, " not found"));
                }
                // Check permissions (only creator or admin can add)
                if (group.createdBy !== adderAlias) {
                    throw new Error('Only group creator can add members');
                }
                // Check size limit
                if (group.members.length >= this.MAX_GROUP_SIZE) {
                    throw new Error("Group is at maximum size (".concat(this.MAX_GROUP_SIZE, "). Cannot add more members."));
                }
                // Check if already a member
                if (group.members.includes(newMemberAlias)) {
                    console.warn("@".concat(newMemberAlias, " is already a member of group \"").concat(group.name, "\""));
                    return [2 /*return*/];
                }
                // Add member
                group.members.push(newMemberAlias);
                presenceMap = this.groupMemberPresence.get(groupId) || new Map();
                presenceMap.set(newMemberAlias, {
                    alias: newMemberAlias,
                    isOnline: false,
                    lastSeen: Date.now(),
                });
                this.groupMemberPresence.set(groupId, presenceMap);
                console.log("\u2713 Added @".concat(newMemberAlias, " to group \"").concat(group.name, "\""));
                return [2 /*return*/];
            });
        });
    };
    /**
     * Remove a member from group
     */
    GroupChatService.prototype.removeMember = function (groupId, memberAlias, removerAlias) {
        return __awaiter(this, void 0, void 0, function () {
            var group, index, presenceMap;
            return __generator(this, function (_a) {
                group = this.groups.get(groupId);
                if (!group) {
                    throw new Error("Group ".concat(groupId, " not found"));
                }
                // Check permissions
                if (group.createdBy !== removerAlias) {
                    throw new Error('Only group creator can remove members');
                }
                index = group.members.indexOf(memberAlias);
                if (index === -1) {
                    throw new Error("@".concat(memberAlias, " is not a member of this group"));
                }
                group.members.splice(index, 1);
                presenceMap = this.groupMemberPresence.get(groupId);
                if (presenceMap) {
                    presenceMap.delete(memberAlias);
                }
                console.log("\u2713 Removed @".concat(memberAlias, " from group \"").concat(group.name, "\""));
                return [2 /*return*/];
            });
        });
    };
    /**
     * Send message to all members in a group (full-mesh broadcast)
     */
    GroupChatService.prototype.sendGroupMessage = function (groupId, senderAlias, content, encryptedContent) {
        return __awaiter(this, void 0, void 0, function () {
            var group, messageId, message, groupMessages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        group = this.groups.get(groupId);
                        if (!group) {
                            throw new Error("Group ".concat(groupId, " not found"));
                        }
                        // Verify sender is a member
                        if (!group.members.includes(senderAlias)) {
                            throw new Error("@".concat(senderAlias, " is not a member of this group"));
                        }
                        messageId = (0, uuid_1.v4)();
                        message = {
                            id: messageId,
                            groupId: groupId,
                            from: senderAlias,
                            content: content,
                            encryptedContent: encryptedContent,
                            timestamp: Date.now(),
                            delivered: false,
                            readBy: new Set([senderAlias]), // Sender always has read
                        };
                        groupMessages = this.groupMessages.get(groupId) || [];
                        groupMessages.push(message);
                        this.groupMessages.set(groupId, groupMessages);
                        // Persist to database
                        return [4 /*yield*/, SQLiteService_1.SQLiteService.saveGroupMessage(messageId, groupId, senderAlias, content, encryptedContent)];
                    case 1:
                        // Persist to database
                        _a.sent();
                        console.log("\uD83D\uDCAC Group message sent to \"".concat(group.name, "\" (").concat(group.members.length, " members): ").concat(messageId));
                        // TODO: In integration with WebRTC, send to each member via P2P tunnel
                        // for (const member of group.members) {
                        //   if (member !== senderAlias) {
                        //     await WebRTCService.sendGroupMessage(member, message);
                        //   }
                        // }
                        return [2 /*return*/, messageId];
                }
            });
        });
    };
    /**
     * Handle incoming group message from a peer
     */
    GroupChatService.prototype.handleIncomingGroupMessage = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var group, groupMessages, handler;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        group = this.groups.get(message.groupId);
                        if (!group) {
                            console.warn("Received message for unknown group: ".concat(message.groupId));
                            return [2 /*return*/];
                        }
                        groupMessages = this.groupMessages.get(message.groupId) || [];
                        groupMessages.push(message);
                        this.groupMessages.set(message.groupId, groupMessages);
                        // Persist to database
                        return [4 /*yield*/, SQLiteService_1.SQLiteService.saveGroupMessage(message.id, message.groupId, message.from, message.content, message.encryptedContent)];
                    case 1:
                        // Persist to database
                        _a.sent();
                        handler = this.groupHandlers.get(message.groupId);
                        if (handler) {
                            handler(message);
                        }
                        console.log("\uD83D\uDCAC Group message received in \"".concat(group.name, "\" from @").concat(message.from, ": ").concat(message.id));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Mark message as read in group
     */
    GroupChatService.prototype.markGroupMessageRead = function (groupId, messageId, readerAlias) {
        return __awaiter(this, void 0, void 0, function () {
            var groupMessages, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        groupMessages = this.groupMessages.get(groupId) || [];
                        message = groupMessages.find(function (m) { return m.id === messageId; });
                        if (!message) {
                            throw new Error("Message ".concat(messageId, " not found in group"));
                        }
                        message.readBy.add(readerAlias);
                        // Persist to database
                        return [4 /*yield*/, SQLiteService_1.SQLiteService.markGroupMessageRead(messageId, readerAlias)];
                    case 1:
                        // Persist to database
                        _a.sent();
                        console.log("\u2713 Marked group message as read: ".concat(messageId));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update member presence in group
     */
    GroupChatService.prototype.updateMemberPresence = function (groupId, memberAlias, isOnline) {
        return __awaiter(this, void 0, void 0, function () {
            var presenceMap, presence, handler;
            return __generator(this, function (_a) {
                presenceMap = this.groupMemberPresence.get(groupId);
                if (!presenceMap) {
                    return [2 /*return*/];
                }
                presence = presenceMap.get(memberAlias);
                if (presence) {
                    presence.isOnline = isOnline;
                    presence.lastSeen = Date.now();
                    handler = this.memberPresenceHandlers.get("".concat(groupId, ":").concat(memberAlias));
                    if (handler) {
                        handler(presence);
                    }
                    console.log("\uD83D\uDCCD @".concat(memberAlias, " is now ").concat(isOnline ? 'online' : 'offline', " in group ").concat(groupId));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get group state (members, presence, message count)
     */
    GroupChatService.prototype.getGroupState = function (groupId) {
        var group = this.groups.get(groupId);
        if (!group)
            return undefined;
        var presenceMap = this.groupMemberPresence.get(groupId) || new Map();
        var messages = this.groupMessages.get(groupId) || [];
        var onlineCount = Array.from(presenceMap.values()).filter(function (p) { return p.isOnline; }).length;
        return {
            groupId: groupId,
            memberCount: group.members.length,
            onlineCount: onlineCount,
            totalMessages: messages.length,
            lastMessage: messages[messages.length - 1],
            memberPresence: presenceMap,
        };
    };
    /**
     * Get group messages (with pagination)
     */
    GroupChatService.prototype.getGroupMessages = function (groupId_1) {
        return __awaiter(this, arguments, void 0, function (groupId, limit, offset) {
            var messages;
            if (limit === void 0) { limit = 50; }
            if (offset === void 0) { offset = 0; }
            return __generator(this, function (_a) {
                messages = this.groupMessages.get(groupId) || [];
                return [2 /*return*/, messages.slice(Math.max(0, messages.length - limit - offset), messages.length - offset)];
            });
        });
    };
    /**
     * Get member presence in group
     */
    GroupChatService.prototype.getMemberPresence = function (groupId, memberAlias) {
        var presenceMap = this.groupMemberPresence.get(groupId);
        return presenceMap === null || presenceMap === void 0 ? void 0 : presenceMap.get(memberAlias);
    };
    /**
     * Get all members' presence in group
     */
    GroupChatService.prototype.getGroupPresence = function (groupId) {
        var presenceMap = this.groupMemberPresence.get(groupId);
        return presenceMap ? Array.from(presenceMap.values()) : [];
    };
    /**
     * Register handler for incoming group messages
     */
    GroupChatService.prototype.onGroupMessage = function (groupId, handler) {
        var _this = this;
        this.groupHandlers.set(groupId, handler);
        return function () {
            _this.groupHandlers.delete(groupId);
        };
    };
    /**
     * Register handler for group state changes
     */
    GroupChatService.prototype.onGroupStateChange = function (groupId, handler) {
        var _this = this;
        this.groupStateHandlers.set(groupId, handler);
        return function () {
            _this.groupStateHandlers.delete(groupId);
        };
    };
    /**
     * Register handler for member presence changes
     */
    GroupChatService.prototype.onMemberPresenceChange = function (groupId, memberAlias, handler) {
        var _this = this;
        var key = "".concat(groupId, ":").concat(memberAlias);
        this.memberPresenceHandlers.set(key, handler);
        return function () {
            _this.memberPresenceHandlers.delete(key);
        };
    };
    /**
     * Archive a group (soft delete)
     */
    GroupChatService.prototype.archiveGroup = function (groupId, archiverAlias) {
        return __awaiter(this, void 0, void 0, function () {
            var group;
            return __generator(this, function (_a) {
                group = this.groups.get(groupId);
                if (!group) {
                    throw new Error("Group ".concat(groupId, " not found"));
                }
                // Only creator can archive
                if (group.createdBy !== archiverAlias) {
                    throw new Error('Only group creator can archive the group');
                }
                group.isArchived = true;
                console.log("\uD83D\uDCE6 Group archived: \"".concat(group.name, "\""));
                return [2 /*return*/];
            });
        });
    };
    /**
     * Delete a group permanently
     */
    GroupChatService.prototype.deleteGroup = function (groupId, removerAlias) {
        return __awaiter(this, void 0, void 0, function () {
            var group;
            return __generator(this, function (_a) {
                group = this.groups.get(groupId);
                if (!group) {
                    throw new Error("Group ".concat(groupId, " not found"));
                }
                // Only creator can delete
                if (group.createdBy !== removerAlias) {
                    throw new Error('Only group creator can delete the group');
                }
                this.groups.delete(groupId);
                this.groupMessages.delete(groupId);
                this.groupMemberPresence.delete(groupId);
                console.log("\uD83D\uDDD1\uFE0F Group deleted: \"".concat(group.name, "\""));
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get group statistics
     */
    GroupChatService.prototype.getGroupStats = function () {
        var totalMembers = 0;
        var totalMessages = 0;
        for (var _i = 0, _a = this.groups.values(); _i < _a.length; _i++) {
            var group = _a[_i];
            if (!group.isArchived) {
                totalMembers += group.members.length;
            }
        }
        for (var _b = 0, _c = this.groupMessages.values(); _b < _c.length; _b++) {
            var messages = _c[_b];
            totalMessages += messages.length;
        }
        var activeGroups = Array.from(this.groups.values()).filter(function (g) { return !g.isArchived; }).length;
        return {
            totalGroups: activeGroups,
            totalMembers: totalMembers,
            avgGroupSize: activeGroups > 0 ? Math.round(totalMembers / activeGroups) : 0,
            totalMessages: totalMessages,
        };
    };
    /**
     * Get groups user is a member of
     */
    GroupChatService.prototype.getUserGroupsSync = function (userAlias) {
        return Array.from(this.groups.values()).filter(function (g) {
            return g.members.includes(userAlias) && !g.isArchived;
        });
    };
    return GroupChatService;
}());
exports.default = new GroupChatService();
