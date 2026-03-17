/**
 * Project Aegis - File Transfer Service
 * Handles file chunking, streaming, and resumable transfers over WebRTC
 */

import { v4 as uuidv4 } from 'uuid';

interface FileMetadata {
  fileId: string;
  fileName: string;
  fileSize: number;
  fileHash: string; // Simple checksum of file
  mimeType: string;
  chunkSize: number; // 16KB default
  totalChunks: number;
  senderId: string;
  recipientId: string;
  timestamp: number;
}

interface FileChunk {
  fileId: string;
  chunkIndex: number;
  chunkData: string; // Base64 encoded
  chunkSize: number;
  isLastChunk: boolean;
}

interface TransferProgress {
  fileId: string;
  fileName: string;
  totalChunks: number;
  chunksTransferred: number;
  bytesTransferred: number;
  totalBytes: number;
  progress: number; // 0-100
  speed: number; // bytes per second
  estimatedTimeRemaining: number; // milliseconds
  status: 'pending' | 'transferring' | 'paused' | 'completed' | 'failed';
  error?: string;
}

interface ReceivingTransfer {
  metadata: FileMetadata;
  chunks: Map<number, FileChunk>;
  receivedChunks: Set<number>;
  startTime: number;
  lastChunkTime: number;
}

/**
 * File Transfer Service
 * Manages P2P file transfers with chunking and progress tracking
 */
export class FileTransferService {
  private readonly DEFAULT_CHUNK_SIZE = 16 * 1024; // 16KB chunks
  
  private sendingTransfers: Map<string, TransferProgress> = new Map();
  private receivingTransfers: Map<string, ReceivingTransfer> = new Map();
  private transferHandlers: Map<string, (progress: TransferProgress) => void> = new Map();
  private fileReceivedHandlers: Map<string, (fileData: { metadata: FileMetadata; fileBuffer: ArrayBuffer }) => void> = new Map();

  /**
   * Calculate simple checksum of data (without crypto-js dependency)
   * Uses sum of byte values mod 65536
   */
  private calculateHash(data: ArrayBuffer): string {
    const bytes = new Uint8Array(data);
    let checksum = 0;
    
    // Simple checksum: sum all bytes and mod by large number
    for (let i = 0; i < bytes.length; i++) {
      checksum = (checksum + bytes[i]) % 0xFFFFFFFF;
    }
    
    // Also incorporate file size into hash
    const sizeHash = data.byteLength.toString(16);
    return `${checksum.toString(16)}-${sizeHash}`;
  }

  /**
   * Convert ArrayBuffer to Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert Base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Initiate a file transfer
   * Split file into chunks and prepare for sending
   */
  async initiateTransfer(
    fileBuffer: ArrayBuffer,
    fileName: string,
    mimeType: string,
    senderId: string,
    recipientId: string,
    chunkSize: number = this.DEFAULT_CHUNK_SIZE
  ): Promise<FileMetadata> {
    const fileId = uuidv4();
    const fileHash = this.calculateHash(fileBuffer);
    const totalChunks = Math.ceil(fileBuffer.byteLength / chunkSize);

    const metadata: FileMetadata = {
      fileId,
      fileName,
      fileSize: fileBuffer.byteLength,
      fileHash,
      mimeType,
      chunkSize,
      totalChunks,
      senderId,
      recipientId,
      timestamp: Date.now(),
    };

    // Initialize transfer progress
    const progress: TransferProgress = {
      fileId,
      fileName,
      totalChunks,
      chunksTransferred: 0,
      bytesTransferred: 0,
      totalBytes: fileBuffer.byteLength,
      progress: 0,
      speed: 0,
      estimatedTimeRemaining: 0,
      status: 'pending',
    };

    this.sendingTransfers.set(fileId, progress);

    console.log(
      `📄 File transfer initiated: ${fileName} (${(fileBuffer.byteLength / 1024).toFixed(2)}KB)`
    );
    console.log(`📦 Split into ${totalChunks} chunks of ${chunkSize} bytes`);

    return metadata;
  }

  /**
   * Send a chunk of the file
   */
  async sendChunk(
    fileBuffer: ArrayBuffer,
    fileId: string,
    chunkIndex: number,
    chunkSize: number = this.DEFAULT_CHUNK_SIZE
  ): Promise<FileChunk> {
    const startByte = chunkIndex * chunkSize;
    const endByte = Math.min(startByte + chunkSize, fileBuffer.byteLength);
    const chunkBuffer = fileBuffer.slice(startByte, endByte);
    const chunkData = this.arrayBufferToBase64(chunkBuffer);

    const totalChunks = Math.ceil(fileBuffer.byteLength / chunkSize);
    const isLastChunk = chunkIndex === totalChunks - 1;

    const chunk: FileChunk = {
      fileId,
      chunkIndex,
      chunkData,
      chunkSize: chunkBuffer.byteLength,
      isLastChunk,
    };

    // Update progress
    const progress = this.sendingTransfers.get(fileId);
    if (progress) {
      progress.chunksTransferred++;
      progress.bytesTransferred = endByte;
      progress.progress = (progress.chunksTransferred / progress.totalChunks) * 100;
      progress.status = 'transferring';

      // Calculate speed and ETA
      const elapsed = Date.now() - this.sendingTransfers.get(fileId)!.bytesTransferred;
      if (elapsed > 0) {
        progress.speed = (endByte / elapsed) * 1000; // bytes per second
        const remainingBytes = progress.totalBytes - progress.bytesTransferred;
        progress.estimatedTimeRemaining = remainingBytes / progress.speed * 1000; // milliseconds
      }

      // Notify progress handlers
      const handler = this.transferHandlers.get(fileId);
      if (handler) {
        handler(progress);
      }
    }

    console.log(
      `📤 Chunk ${chunkIndex + 1}/${totalChunks} sent (${(chunkBuffer.byteLength / 1024).toFixed(2)}KB)`
    );

    return chunk;
  }

  /**
   * Handle incoming file metadata
   */
  async handleFileMetadata(metadata: FileMetadata): Promise<void> {
    const transfer: ReceivingTransfer = {
      metadata,
      chunks: new Map(),
      receivedChunks: new Set(),
      startTime: Date.now(),
      lastChunkTime: Date.now(),
    };

    this.receivingTransfers.set(metadata.fileId, transfer);

    console.log(
      `📥 File incoming: ${metadata.fileName} (${(metadata.fileSize / 1024).toFixed(2)}KB)`
    );
    console.log(
      `📦 Expecting ${metadata.totalChunks} chunks of ${metadata.chunkSize} bytes`
    );
  }

  /**
   * Handle incoming file chunk
   */
  async handleFileChunk(chunk: FileChunk): Promise<TransferProgress> {
    const transfer = this.receivingTransfers.get(chunk.fileId);
    if (!transfer) {
      throw new Error(`No transfer found for file ${chunk.fileId}`);
    }

    // Store chunk
    transfer.chunks.set(chunk.chunkIndex, chunk);
    transfer.receivedChunks.add(chunk.chunkIndex);
    transfer.lastChunkTime = Date.now();

    // Calculate progress
    const progress: TransferProgress = {
      fileId: chunk.fileId,
      fileName: transfer.metadata.fileName,
      totalChunks: transfer.metadata.totalChunks,
      chunksTransferred: transfer.receivedChunks.size,
      bytesTransferred: Array.from(transfer.receivedChunks).reduce(
        (sum, idx) => sum + (transfer.chunks.get(idx)?.chunkSize || 0),
        0
      ),
      totalBytes: transfer.metadata.fileSize,
      progress: (transfer.receivedChunks.size / transfer.metadata.totalChunks) * 100,
      speed: 0,
      estimatedTimeRemaining: 0,
      status: chunk.isLastChunk ? 'completed' : 'transferring',
    };

    // Calculate speed
    const elapsed = Date.now() - transfer.startTime;
    if (elapsed > 0) {
      progress.speed = (progress.bytesTransferred / elapsed) * 1000;
      const remainingBytes = progress.totalBytes - progress.bytesTransferred;
      progress.estimatedTimeRemaining = (remainingBytes / progress.speed) * 1000;
    }

    console.log(
      `📥 Chunk ${chunk.chunkIndex + 1}/${transfer.metadata.totalChunks} received (${(chunk.chunkSize / 1024).toFixed(2)}KB)`
    );

    // If this is the last chunk, reassemble the file
    if (chunk.isLastChunk && transfer.receivedChunks.size === transfer.metadata.totalChunks) {
      await this.reassembleFile(chunk.fileId);
      progress.status = 'completed';
    }

    return progress;
  }

  /**
   * Reassemble chunks into complete file
   */
  private async reassembleFile(fileId: string): Promise<void> {
    const transfer = this.receivingTransfers.get(fileId);
    if (!transfer) {
      throw new Error(`No transfer found for file ${fileId}`);
    }

    try {
      // Verify all chunks are received
      const missingChunks = Array.from(
        { length: transfer.metadata.totalChunks },
        (_, i) => i
      ).filter(i => !transfer.receivedChunks.has(i));

      if (missingChunks.length > 0) {
        throw new Error(`Missing chunks: ${missingChunks.join(', ')}`);
      }

      // Reassemble chunks in order
      const chunks: ArrayBuffer[] = [];
      for (let i = 0; i < transfer.metadata.totalChunks; i++) {
        const chunk = transfer.chunks.get(i);
        if (!chunk) {
          throw new Error(`Chunk ${i} not found`);
        }
        const buffer = this.base64ToArrayBuffer(chunk.chunkData);
        chunks.push(buffer);
      }

      // Combine all chunks
      const fileBuffer = new ArrayBuffer(transfer.metadata.fileSize);
      const fileView = new Uint8Array(fileBuffer);
      let offset = 0;

      for (const chunk of chunks) {
        const chunkView = new Uint8Array(chunk);
        fileView.set(chunkView, offset);
        offset += chunk.byteLength;
      }

      // Verify file hash
      const calculatedHash = this.calculateHash(fileBuffer);
      if (calculatedHash !== transfer.metadata.fileHash) {
        throw new Error(
          `File hash mismatch: expected ${transfer.metadata.fileHash}, got ${calculatedHash}`
        );
      }

      // Notify file received handler
      const handler = this.fileReceivedHandlers.get(fileId);
      if (handler) {
        handler({
          metadata: transfer.metadata,
          fileBuffer,
        });
      }

      console.log(
        `✅ File reassembled: ${transfer.metadata.fileName} (${(fileBuffer.byteLength / 1024).toFixed(2)}KB)`
      );
      console.log(`✓ Hash verified: ${calculatedHash}`);

      // Cleanup
      this.receivingTransfers.delete(fileId);
    } catch (error) {
      console.error('File reassembly failed:', error);
      this.receivingTransfers.delete(fileId);
      throw error;
    }
  }

  /**
   * Get transfer progress
   */
  getTransferProgress(fileId: string): TransferProgress | undefined {
    return this.sendingTransfers.get(fileId);
  }

  /**
   * Get receiving transfer progress
   */
  getReceivingProgress(fileId: string): TransferProgress | undefined {
    const transfer = this.receivingTransfers.get(fileId);
    if (!transfer) return undefined;

    return {
      fileId,
      fileName: transfer.metadata.fileName,
      totalChunks: transfer.metadata.totalChunks,
      chunksTransferred: transfer.receivedChunks.size,
      bytesTransferred: Array.from(transfer.receivedChunks).reduce(
        (sum, idx) => sum + (transfer.chunks.get(idx)?.chunkSize || 0),
        0
      ),
      totalBytes: transfer.metadata.fileSize,
      progress: (transfer.receivedChunks.size / transfer.metadata.totalChunks) * 100,
      speed: 0,
      estimatedTimeRemaining: 0,
      status: 'transferring',
    };
  }

  /**
   * Cancel a file transfer
   */
  cancelTransfer(fileId: string): void {
    const sendingProgress = this.sendingTransfers.get(fileId);
    if (sendingProgress) {
      sendingProgress.status = 'paused';
      console.log(`⏸️ Transfer paused: ${sendingProgress.fileName}`);
    }

    const receivingTransfer = this.receivingTransfers.get(fileId);
    if (receivingTransfer) {
      this.receivingTransfers.delete(fileId);
      console.log(`⏸️ Transfer cancelled: ${receivingTransfer.metadata.fileName}`);
    }
  }

  /**
   * Resume a paused transfer
   */
  resumeTransfer(fileId: string): void {
    const progress = this.sendingTransfers.get(fileId);
    if (progress && progress.status === 'paused') {
      progress.status = 'transferring';
      console.log(`▶️ Transfer resumed: ${progress.fileName}`);
    }
  }

  /**
   * Get list of missing chunks for resumed transfer
   */
  getMissingChunks(fileId: string): number[] {
    const transfer = this.receivingTransfers.get(fileId);
    if (!transfer) return [];

    return Array.from(
      { length: transfer.metadata.totalChunks },
      (_, i) => i
    ).filter(i => !transfer.receivedChunks.has(i));
  }

  /**
   * Register transfer progress handler
   */
  onProgress(fileId: string, handler: (progress: TransferProgress) => void): () => void {
    this.transferHandlers.set(fileId, handler);

    return () => {
      this.transferHandlers.delete(fileId);
    };
  }

  /**
   * Register file received handler
   */
  onFileReceived(
    fileId: string,
    handler: (fileData: { metadata: FileMetadata; fileBuffer: ArrayBuffer }) => void
  ): () => void {
    this.fileReceivedHandlers.set(fileId, handler);

    return () => {
      this.fileReceivedHandlers.delete(fileId);
    };
  }

  /**
   * Get all active transfers
   */
  getActiveTransfers(): TransferProgress[] {
    return Array.from(this.sendingTransfers.values());
  }

  /**
   * Get all active receives
   */
  getActiveReceives(): TransferProgress[] {
    return Array.from(this.receivingTransfers.entries()).map(([fileId, transfer]) => ({
      fileId,
      fileName: transfer.metadata.fileName,
      totalChunks: transfer.metadata.totalChunks,
      chunksTransferred: transfer.receivedChunks.size,
      bytesTransferred: Array.from(transfer.receivedChunks).reduce(
        (sum, idx) => sum + (transfer.chunks.get(idx)?.chunkSize || 0),
        0
      ),
      totalBytes: transfer.metadata.fileSize,
      progress: (transfer.receivedChunks.size / transfer.metadata.totalChunks) * 100,
      speed: 0,
      estimatedTimeRemaining: 0,
      status: 'transferring',
    }));
  }

  /**
   * Clear completed transfers
   */
  clearCompleted(): void {
    for (const [fileId, progress] of this.sendingTransfers.entries()) {
      if (progress.status === 'completed') {
        this.sendingTransfers.delete(fileId);
      }
    }
  }
}

export default new FileTransferService();
