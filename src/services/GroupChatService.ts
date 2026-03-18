/**
 * Project Aegis - Group Chat Service
 * Handles multi-user group chats with full-mesh P2P architecture
 * Max 10-15 users per group (scalability bound)
 */

import { v4 as uuidv4 } from 'uuid';
import { SQLiteService } from './SQLiteService';

/**
 * Group Chat Data Structures
 */
interface GroupChat {
  id: string;
  name: string;
  members: string[]; // List of member aliases
  createdBy: string;
  createdAt: number;
  description?: string;
  isArchived: boolean;
}

interface GroupMessage {
  id: string;
  groupId: string;
  from: string;
  content: string;
  encryptedContent?: string;
  timestamp: number;
  delivered: boolean;
  readBy: Set<string>; // Set of aliases who read the message
}

interface GroupMemberPresence {
  alias: string;
  isOnline: boolean;
  lastSeen: number;
}

interface GroupState {
  groupId: string;
  memberCount: number;
  onlineCount: number;
  totalMessages: number;
  lastMessage?: GroupMessage;
  memberPresence: Map<string, GroupMemberPresence>;
}

/**
 * Group Chat Service (Singleton)
 * Manages full-mesh P2P group chats with up to 15 users
 */
class GroupChatService {
  private groups: Map<string, GroupChat> = new Map();
  private groupMessages: Map<string, GroupMessage[]> = new Map();
  private groupMemberPresence: Map<string, Map<string, GroupMemberPresence>> = new Map();
  private groupHandlers: Map<string, (message: GroupMessage) => void> = new Map();
  private groupStateHandlers: Map<string, (state: GroupState) => void> = new Map();
  private memberPresenceHandlers: Map<string, (presence: GroupMemberPresence) => void> = new Map();

  private readonly MAX_GROUP_SIZE = 15;

  constructor() {
    console.log(`👥 GroupChatService initialized (max ${this.MAX_GROUP_SIZE} users per group)`);
  }

  /**
   * Create a new group chat
   */
  async createGroup(
    name: string,
    members: string[],
    creatorAlias: string,
    description?: string
  ): Promise<GroupChat> {
    // Validate group size (including creator)
    const allMembers = [creatorAlias, ...members.filter(m => m !== creatorAlias)];
    if (allMembers.length > this.MAX_GROUP_SIZE) {
      throw new Error(
        `Group size (${allMembers.length}) exceeds maximum (${this.MAX_GROUP_SIZE})`
      );
    }

    const groupId = uuidv4();
    const group: GroupChat = {
      id: groupId,
      name,
      members: allMembers,
      createdBy: creatorAlias,
      createdAt: Date.now(),
      description,
      isArchived: false,
    };

    this.groups.set(groupId, group);
    this.groupMessages.set(groupId, []);
    
    // Initialize presence tracking for all members
    const presenceMap = new Map<string, GroupMemberPresence>();
    for (const member of allMembers) {
      presenceMap.set(member, {
        alias: member,
        isOnline: false,
        lastSeen: Date.now(),
      });
    }
    this.groupMemberPresence.set(groupId, presenceMap);

    // Persist to local database
    await SQLiteService.createGroupChat(groupId, name, allMembers, creatorAlias, description);

    console.log(`👥 Group created: "${name}" (${allMembers.length} members) - ${groupId}`);
    return group;
  }

  /**
   * Get a group by ID
   */
  getGroup(groupId: string): GroupChat | undefined {
    return this.groups.get(groupId);
  }

  /**
   * Get all groups for a user
   */
  async getUserGroups(userAlias: string): Promise<GroupChat[]> {
    return Array.from(this.groups.values()).filter(g =>
      g.members.includes(userAlias) && !g.isArchived
    );
  }

  /**
   * Add a member to existing group
   */
  async addMember(groupId: string, newMemberAlias: string, adderAlias: string): Promise<void> {
    const group = this.groups.get(groupId);
    if (!group) {
      throw new Error(`Group ${groupId} not found`);
    }

    // Check permissions (only creator or admin can add)
    if (group.createdBy !== adderAlias) {
      throw new Error('Only group creator can add members');
    }

    // Check size limit
    if (group.members.length >= this.MAX_GROUP_SIZE) {
      throw new Error(
        `Group is at maximum size (${this.MAX_GROUP_SIZE}). Cannot add more members.`
      );
    }

    // Check if already a member
    if (group.members.includes(newMemberAlias)) {
      console.warn(`@${newMemberAlias} is already a member of group "${group.name}"`);
      return;
    }

    // Add member
    group.members.push(newMemberAlias);

    // Initialize presence
    const presenceMap = this.groupMemberPresence.get(groupId) || new Map();
    presenceMap.set(newMemberAlias, {
      alias: newMemberAlias,
      isOnline: false,
      lastSeen: Date.now(),
    });
    this.groupMemberPresence.set(groupId, presenceMap);

    console.log(`✓ Added @${newMemberAlias} to group "${group.name}"`);
  }

  /**
   * Remove a member from group
   */
  async removeMember(groupId: string, memberAlias: string, removerAlias: string): Promise<void> {
    const group = this.groups.get(groupId);
    if (!group) {
      throw new Error(`Group ${groupId} not found`);
    }

    // Check permissions
    if (group.createdBy !== removerAlias) {
      throw new Error('Only group creator can remove members');
    }

    const index = group.members.indexOf(memberAlias);
    if (index === -1) {
      throw new Error(`@${memberAlias} is not a member of this group`);
    }

    group.members.splice(index, 1);

    // Remove from presence tracking
    const presenceMap = this.groupMemberPresence.get(groupId);
    if (presenceMap) {
      presenceMap.delete(memberAlias);
    }

    console.log(`✓ Removed @${memberAlias} from group "${group.name}"`);
  }

  /**
   * Send message to all members in a group (full-mesh broadcast)
   */
  async sendGroupMessage(
    groupId: string,
    senderAlias: string,
    content: string,
    encryptedContent?: string
  ): Promise<string> {
    const group = this.groups.get(groupId);
    if (!group) {
      throw new Error(`Group ${groupId} not found`);
    }

    // Verify sender is a member
    if (!group.members.includes(senderAlias)) {
      throw new Error(`@${senderAlias} is not a member of this group`);
    }

    const messageId = uuidv4();
    const message: GroupMessage = {
      id: messageId,
      groupId,
      from: senderAlias,
      content,
      encryptedContent,
      timestamp: Date.now(),
      delivered: false,
      readBy: new Set([senderAlias]), // Sender always has read
    };

    // Store message locally
    const groupMessages = this.groupMessages.get(groupId) || [];
    groupMessages.push(message);
    this.groupMessages.set(groupId, groupMessages);

    // Persist to database
    await SQLiteService.saveGroupMessage(
      messageId,
      groupId,
      senderAlias,
      content,
      encryptedContent
    );

    console.log(
      `💬 Group message sent to "${group.name}" (${group.members.length} members): ${messageId}`
    );

    // TODO: In integration with WebRTC, send to each member via P2P tunnel
    // for (const member of group.members) {
    //   if (member !== senderAlias) {
    //     await WebRTCService.sendGroupMessage(member, message);
    //   }
    // }

    return messageId;
  }

  /**
   * Handle incoming group message from a peer
   */
  async handleIncomingGroupMessage(message: GroupMessage): Promise<void> {
    const group = this.groups.get(message.groupId);
    if (!group) {
      console.warn(`Received message for unknown group: ${message.groupId}`);
      return;
    }

    // Store message
    const groupMessages = this.groupMessages.get(message.groupId) || [];
    groupMessages.push(message);
    this.groupMessages.set(message.groupId, groupMessages);

    // Persist to database
    await SQLiteService.saveGroupMessage(
      message.id,
      message.groupId,
      message.from,
      message.content,
      message.encryptedContent
    );

    // Trigger handler
    const handler = this.groupHandlers.get(message.groupId);
    if (handler) {
      handler(message);
    }

    console.log(
      `💬 Group message received in "${group.name}" from @${message.from}: ${message.id}`
    );
  }

  /**
   * Mark message as read in group
   */
  async markGroupMessageRead(groupId: string, messageId: string, readerAlias: string): Promise<void> {
    const groupMessages = this.groupMessages.get(groupId) || [];
    const message = groupMessages.find(m => m.id === messageId);

    if (!message) {
      throw new Error(`Message ${messageId} not found in group`);
    }

    message.readBy.add(readerAlias);

    // Persist to database
    await SQLiteService.markGroupMessageRead(messageId, readerAlias);

    console.log(`✓ Marked group message as read: ${messageId}`);
  }

  /**
   * Update member presence in group
   */
  async updateMemberPresence(
    groupId: string,
    memberAlias: string,
    isOnline: boolean
  ): Promise<void> {
    const presenceMap = this.groupMemberPresence.get(groupId);
    if (!presenceMap) {
      return;
    }

    const presence = presenceMap.get(memberAlias);
    if (presence) {
      presence.isOnline = isOnline;
      presence.lastSeen = Date.now();

      // Trigger handler
      const handler = this.memberPresenceHandlers.get(`${groupId}:${memberAlias}`);
      if (handler) {
        handler(presence);
      }

      console.log(
        `📍 @${memberAlias} is now ${isOnline ? 'online' : 'offline'} in group ${groupId}`
      );
    }
  }

  /**
   * Get group state (members, presence, message count)
   */
  getGroupState(groupId: string): GroupState | undefined {
    const group = this.groups.get(groupId);
    if (!group) return undefined;

    const presenceMap = this.groupMemberPresence.get(groupId) || new Map();
    const messages = this.groupMessages.get(groupId) || [];

    const onlineCount = Array.from(presenceMap.values()).filter(p => p.isOnline).length;

    return {
      groupId,
      memberCount: group.members.length,
      onlineCount,
      totalMessages: messages.length,
      lastMessage: messages[messages.length - 1],
      memberPresence: presenceMap,
    };
  }

  /**
   * Get group messages (with pagination)
   */
  async getGroupMessages(groupId: string, limit: number = 50, offset: number = 0): Promise<GroupMessage[]> {
    const messages = this.groupMessages.get(groupId) || [];
    return messages.slice(Math.max(0, messages.length - limit - offset), messages.length - offset);
  }

  /**
   * Get member presence in group
   */
  getMemberPresence(groupId: string, memberAlias: string): GroupMemberPresence | undefined {
    const presenceMap = this.groupMemberPresence.get(groupId);
    return presenceMap?.get(memberAlias);
  }

  /**
   * Get all members' presence in group
   */
  getGroupPresence(groupId: string): GroupMemberPresence[] {
    const presenceMap = this.groupMemberPresence.get(groupId);
    return presenceMap ? Array.from(presenceMap.values()) : [];
  }

  /**
   * Register handler for incoming group messages
   */
  onGroupMessage(groupId: string, handler: (message: GroupMessage) => void): () => void {
    this.groupHandlers.set(groupId, handler);

    return () => {
      this.groupHandlers.delete(groupId);
    };
  }

  /**
   * Register handler for group state changes
   */
  onGroupStateChange(groupId: string, handler: (state: GroupState) => void): () => void {
    this.groupStateHandlers.set(groupId, handler);

    return () => {
      this.groupStateHandlers.delete(groupId);
    };
  }

  /**
   * Register handler for member presence changes
   */
  onMemberPresenceChange(
    groupId: string,
    memberAlias: string,
    handler: (presence: GroupMemberPresence) => void
  ): () => void {
    const key = `${groupId}:${memberAlias}`;
    this.memberPresenceHandlers.set(key, handler);

    return () => {
      this.memberPresenceHandlers.delete(key);
    };
  }

  /**
   * Archive a group (soft delete)
   */
  async archiveGroup(groupId: string, archiverAlias: string): Promise<void> {
    const group = this.groups.get(groupId);
    if (!group) {
      throw new Error(`Group ${groupId} not found`);
    }

    // Only creator can archive
    if (group.createdBy !== archiverAlias) {
      throw new Error('Only group creator can archive the group');
    }

    group.isArchived = true;
    console.log(`📦 Group archived: "${group.name}"`);
  }

  /**
   * Delete a group permanently
   */
  async deleteGroup(groupId: string, removerAlias: string): Promise<void> {
    const group = this.groups.get(groupId);
    if (!group) {
      throw new Error(`Group ${groupId} not found`);
    }

    // Only creator can delete
    if (group.createdBy !== removerAlias) {
      throw new Error('Only group creator can delete the group');
    }

    this.groups.delete(groupId);
    this.groupMessages.delete(groupId);
    this.groupMemberPresence.delete(groupId);

    console.log(`🗑️ Group deleted: "${group.name}"`);
  }

  /**
   * Get group statistics
   */
  getGroupStats(): {
    totalGroups: number;
    totalMembers: number;
    avgGroupSize: number;
    totalMessages: number;
  } {
    let totalMembers = 0;
    let totalMessages = 0;

    for (const group of this.groups.values()) {
      if (!group.isArchived) {
        totalMembers += group.members.length;
      }
    }

    for (const messages of this.groupMessages.values()) {
      totalMessages += messages.length;
    }

    const activeGroups = Array.from(this.groups.values()).filter(g => !g.isArchived).length;

    return {
      totalGroups: activeGroups,
      totalMembers,
      avgGroupSize: activeGroups > 0 ? Math.round(totalMembers / activeGroups) : 0,
      totalMessages,
    };
  }

  /**
   * Get groups user is a member of
   */
  getUserGroupsSync(userAlias: string): GroupChat[] {
    return Array.from(this.groups.values()).filter(g =>
      g.members.includes(userAlias) && !g.isArchived
    );
  }
}

export default new GroupChatService();
