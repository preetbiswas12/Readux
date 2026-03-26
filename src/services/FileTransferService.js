"use strict";
/**
 * Project Aegis - File Transfer Service
 * Handles file chunking, streaming, and resumable transfers over WebRTC
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileTransferService = void 0;
var uuid_1 = require("uuid");
/**
 * File Transfer Service
 * Manages P2P file transfers with chunking and progress tracking
 */
var FileTransferService = /** @class */ (function () {
    function FileTransferService() {
        this.DEFAULT_CHUNK_SIZE = 16 * 1024; // 16KB chunks
        this.sendingTransfers = new Map();
        this.receivingTransfers = new Map();
        this.transferHandlers = new Map();
        this.fileReceivedHandlers = new Map();
    }
    /**
     * Calculate simple checksum of data (without crypto-js dependency)
     * Uses sum of byte values mod 65536
     */
    FileTransferService.prototype.calculateHash = function (data) {
        var bytes = new Uint8Array(data);
        var checksum = 0;
        // Simple checksum: sum all bytes and mod by large number
        for (var i = 0; i < bytes.length; i++) {
            checksum = (checksum + bytes[i]) % 0xFFFFFFFF;
        }
        // Also incorporate file size into hash
        var sizeHash = data.byteLength.toString(16);
        return "".concat(checksum.toString(16), "-").concat(sizeHash);
    };
    /**
     * Convert ArrayBuffer to Base64
     */
    FileTransferService.prototype.arrayBufferToBase64 = function (buffer) {
        var bytes = new Uint8Array(buffer);
        var binary = '';
        for (var i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    };
    /**
     * Convert Base64 to ArrayBuffer
     */
    FileTransferService.prototype.base64ToArrayBuffer = function (base64) {
        var binary = atob(base64);
        var bytes = new Uint8Array(binary.length);
        for (var i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    };
    /**
     * Initiate a file transfer
     * Split file into chunks and prepare for sending
     */
    FileTransferService.prototype.initiateTransfer = function (fileBuffer_1, fileName_1, mimeType_1, senderId_1, recipientId_1) {
        return __awaiter(this, arguments, void 0, function (fileBuffer, fileName, mimeType, senderId, recipientId, chunkSize) {
            var fileId, fileHash, totalChunks, metadata, progress;
            if (chunkSize === void 0) { chunkSize = this.DEFAULT_CHUNK_SIZE; }
            return __generator(this, function (_a) {
                fileId = (0, uuid_1.v4)();
                fileHash = this.calculateHash(fileBuffer);
                totalChunks = Math.ceil(fileBuffer.byteLength / chunkSize);
                metadata = {
                    fileId: fileId,
                    fileName: fileName,
                    fileSize: fileBuffer.byteLength,
                    fileHash: fileHash,
                    mimeType: mimeType,
                    chunkSize: chunkSize,
                    totalChunks: totalChunks,
                    senderId: senderId,
                    recipientId: recipientId,
                    timestamp: Date.now(),
                };
                progress = {
                    fileId: fileId,
                    fileName: fileName,
                    totalChunks: totalChunks,
                    chunksTransferred: 0,
                    bytesTransferred: 0,
                    totalBytes: fileBuffer.byteLength,
                    progress: 0,
                    speed: 0,
                    estimatedTimeRemaining: 0,
                    status: 'pending',
                };
                this.sendingTransfers.set(fileId, progress);
                console.log("\uD83D\uDCC4 File transfer initiated: ".concat(fileName, " (").concat((fileBuffer.byteLength / 1024).toFixed(2), "KB)"));
                console.log("\uD83D\uDCE6 Split into ".concat(totalChunks, " chunks of ").concat(chunkSize, " bytes"));
                return [2 /*return*/, metadata];
            });
        });
    };
    /**
     * Send a chunk of the file
     */
    FileTransferService.prototype.sendChunk = function (fileBuffer_1, fileId_1, chunkIndex_1) {
        return __awaiter(this, arguments, void 0, function (fileBuffer, fileId, chunkIndex, chunkSize) {
            var startByte, endByte, chunkBuffer, chunkData, totalChunks, isLastChunk, chunk, progress, elapsed, remainingBytes, handler;
            if (chunkSize === void 0) { chunkSize = this.DEFAULT_CHUNK_SIZE; }
            return __generator(this, function (_a) {
                startByte = chunkIndex * chunkSize;
                endByte = Math.min(startByte + chunkSize, fileBuffer.byteLength);
                chunkBuffer = fileBuffer.slice(startByte, endByte);
                chunkData = this.arrayBufferToBase64(chunkBuffer);
                totalChunks = Math.ceil(fileBuffer.byteLength / chunkSize);
                isLastChunk = chunkIndex === totalChunks - 1;
                chunk = {
                    fileId: fileId,
                    chunkIndex: chunkIndex,
                    chunkData: chunkData,
                    chunkSize: chunkBuffer.byteLength,
                    isLastChunk: isLastChunk,
                };
                progress = this.sendingTransfers.get(fileId);
                if (progress) {
                    progress.chunksTransferred++;
                    progress.bytesTransferred = endByte;
                    progress.progress = (progress.chunksTransferred / progress.totalChunks) * 100;
                    progress.status = 'transferring';
                    elapsed = Date.now() - this.sendingTransfers.get(fileId).bytesTransferred;
                    if (elapsed > 0) {
                        progress.speed = (endByte / elapsed) * 1000; // bytes per second
                        remainingBytes = progress.totalBytes - progress.bytesTransferred;
                        progress.estimatedTimeRemaining = remainingBytes / progress.speed * 1000; // milliseconds
                    }
                    handler = this.transferHandlers.get(fileId);
                    if (handler) {
                        handler(progress);
                    }
                }
                console.log("\uD83D\uDCE4 Chunk ".concat(chunkIndex + 1, "/").concat(totalChunks, " sent (").concat((chunkBuffer.byteLength / 1024).toFixed(2), "KB)"));
                return [2 /*return*/, chunk];
            });
        });
    };
    /**
     * Handle incoming file metadata
     */
    FileTransferService.prototype.handleFileMetadata = function (metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var transfer;
            return __generator(this, function (_a) {
                transfer = {
                    metadata: metadata,
                    chunks: new Map(),
                    receivedChunks: new Set(),
                    startTime: Date.now(),
                    lastChunkTime: Date.now(),
                };
                this.receivingTransfers.set(metadata.fileId, transfer);
                console.log("\uD83D\uDCE5 File incoming: ".concat(metadata.fileName, " (").concat((metadata.fileSize / 1024).toFixed(2), "KB)"));
                console.log("\uD83D\uDCE6 Expecting ".concat(metadata.totalChunks, " chunks of ").concat(metadata.chunkSize, " bytes"));
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle incoming file chunk
     */
    FileTransferService.prototype.handleFileChunk = function (chunk) {
        return __awaiter(this, void 0, void 0, function () {
            var transfer, progress, elapsed, remainingBytes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transfer = this.receivingTransfers.get(chunk.fileId);
                        if (!transfer) {
                            throw new Error("No transfer found for file ".concat(chunk.fileId));
                        }
                        // Store chunk
                        transfer.chunks.set(chunk.chunkIndex, chunk);
                        transfer.receivedChunks.add(chunk.chunkIndex);
                        transfer.lastChunkTime = Date.now();
                        progress = {
                            fileId: chunk.fileId,
                            fileName: transfer.metadata.fileName,
                            totalChunks: transfer.metadata.totalChunks,
                            chunksTransferred: transfer.receivedChunks.size,
                            bytesTransferred: Array.from(transfer.receivedChunks).reduce(function (sum, idx) { var _a; return sum + (((_a = transfer.chunks.get(idx)) === null || _a === void 0 ? void 0 : _a.chunkSize) || 0); }, 0),
                            totalBytes: transfer.metadata.fileSize,
                            progress: (transfer.receivedChunks.size / transfer.metadata.totalChunks) * 100,
                            speed: 0,
                            estimatedTimeRemaining: 0,
                            status: chunk.isLastChunk ? 'completed' : 'transferring',
                        };
                        elapsed = Date.now() - transfer.startTime;
                        if (elapsed > 0) {
                            progress.speed = (progress.bytesTransferred / elapsed) * 1000;
                            remainingBytes = progress.totalBytes - progress.bytesTransferred;
                            progress.estimatedTimeRemaining = (remainingBytes / progress.speed) * 1000;
                        }
                        console.log("\uD83D\uDCE5 Chunk ".concat(chunk.chunkIndex + 1, "/").concat(transfer.metadata.totalChunks, " received (").concat((chunk.chunkSize / 1024).toFixed(2), "KB)"));
                        if (!(chunk.isLastChunk && transfer.receivedChunks.size === transfer.metadata.totalChunks)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.reassembleFile(chunk.fileId)];
                    case 1:
                        _a.sent();
                        progress.status = 'completed';
                        _a.label = 2;
                    case 2: return [2 /*return*/, progress];
                }
            });
        });
    };
    /**
     * Reassemble chunks into complete file
     */
    FileTransferService.prototype.reassembleFile = function (fileId) {
        return __awaiter(this, void 0, void 0, function () {
            var transfer, missingChunks, chunks, i, chunk, buffer, fileBuffer, fileView, offset, _i, chunks_1, chunk, chunkView, calculatedHash, handler;
            return __generator(this, function (_a) {
                transfer = this.receivingTransfers.get(fileId);
                if (!transfer) {
                    throw new Error("No transfer found for file ".concat(fileId));
                }
                try {
                    missingChunks = Array.from({ length: transfer.metadata.totalChunks }, function (_, i) { return i; }).filter(function (i) { return !transfer.receivedChunks.has(i); });
                    if (missingChunks.length > 0) {
                        throw new Error("Missing chunks: ".concat(missingChunks.join(', ')));
                    }
                    chunks = [];
                    for (i = 0; i < transfer.metadata.totalChunks; i++) {
                        chunk = transfer.chunks.get(i);
                        if (!chunk) {
                            throw new Error("Chunk ".concat(i, " not found"));
                        }
                        buffer = this.base64ToArrayBuffer(chunk.chunkData);
                        chunks.push(buffer);
                    }
                    fileBuffer = new ArrayBuffer(transfer.metadata.fileSize);
                    fileView = new Uint8Array(fileBuffer);
                    offset = 0;
                    for (_i = 0, chunks_1 = chunks; _i < chunks_1.length; _i++) {
                        chunk = chunks_1[_i];
                        chunkView = new Uint8Array(chunk);
                        fileView.set(chunkView, offset);
                        offset += chunk.byteLength;
                    }
                    calculatedHash = this.calculateHash(fileBuffer);
                    if (calculatedHash !== transfer.metadata.fileHash) {
                        throw new Error("File hash mismatch: expected ".concat(transfer.metadata.fileHash, ", got ").concat(calculatedHash));
                    }
                    handler = this.fileReceivedHandlers.get(fileId);
                    if (handler) {
                        handler({
                            metadata: transfer.metadata,
                            fileBuffer: fileBuffer,
                        });
                    }
                    console.log("\u2705 File reassembled: ".concat(transfer.metadata.fileName, " (").concat((fileBuffer.byteLength / 1024).toFixed(2), "KB)"));
                    console.log("\u2713 Hash verified: ".concat(calculatedHash));
                    // Cleanup
                    this.receivingTransfers.delete(fileId);
                }
                catch (error) {
                    console.error('File reassembly failed:', error);
                    this.receivingTransfers.delete(fileId);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get transfer progress
     */
    FileTransferService.prototype.getTransferProgress = function (fileId) {
        return this.sendingTransfers.get(fileId);
    };
    /**
     * Get receiving transfer progress
     */
    FileTransferService.prototype.getReceivingProgress = function (fileId) {
        var transfer = this.receivingTransfers.get(fileId);
        if (!transfer)
            return undefined;
        return {
            fileId: fileId,
            fileName: transfer.metadata.fileName,
            totalChunks: transfer.metadata.totalChunks,
            chunksTransferred: transfer.receivedChunks.size,
            bytesTransferred: Array.from(transfer.receivedChunks).reduce(function (sum, idx) { var _a; return sum + (((_a = transfer.chunks.get(idx)) === null || _a === void 0 ? void 0 : _a.chunkSize) || 0); }, 0),
            totalBytes: transfer.metadata.fileSize,
            progress: (transfer.receivedChunks.size / transfer.metadata.totalChunks) * 100,
            speed: 0,
            estimatedTimeRemaining: 0,
            status: 'transferring',
        };
    };
    /**
     * Cancel a file transfer
     */
    FileTransferService.prototype.cancelTransfer = function (fileId) {
        var sendingProgress = this.sendingTransfers.get(fileId);
        if (sendingProgress) {
            sendingProgress.status = 'paused';
            console.log("\u23F8\uFE0F Transfer paused: ".concat(sendingProgress.fileName));
        }
        var receivingTransfer = this.receivingTransfers.get(fileId);
        if (receivingTransfer) {
            this.receivingTransfers.delete(fileId);
            console.log("\u23F8\uFE0F Transfer cancelled: ".concat(receivingTransfer.metadata.fileName));
        }
    };
    /**
     * Resume a paused transfer
     */
    FileTransferService.prototype.resumeTransfer = function (fileId) {
        var progress = this.sendingTransfers.get(fileId);
        if (progress && progress.status === 'paused') {
            progress.status = 'transferring';
            console.log("\u25B6\uFE0F Transfer resumed: ".concat(progress.fileName));
        }
    };
    /**
     * Get list of missing chunks for resumed transfer
     */
    FileTransferService.prototype.getMissingChunks = function (fileId) {
        var transfer = this.receivingTransfers.get(fileId);
        if (!transfer)
            return [];
        return Array.from({ length: transfer.metadata.totalChunks }, function (_, i) { return i; }).filter(function (i) { return !transfer.receivedChunks.has(i); });
    };
    /**
     * Register transfer progress handler
     */
    FileTransferService.prototype.onProgress = function (fileId, handler) {
        var _this = this;
        this.transferHandlers.set(fileId, handler);
        return function () {
            _this.transferHandlers.delete(fileId);
        };
    };
    /**
     * Register file received handler
     */
    FileTransferService.prototype.onFileReceived = function (fileId, handler) {
        var _this = this;
        this.fileReceivedHandlers.set(fileId, handler);
        return function () {
            _this.fileReceivedHandlers.delete(fileId);
        };
    };
    /**
     * Get all active transfers
     */
    FileTransferService.prototype.getActiveTransfers = function () {
        return Array.from(this.sendingTransfers.values());
    };
    /**
     * Get all active receives
     */
    FileTransferService.prototype.getActiveReceives = function () {
        return Array.from(this.receivingTransfers.entries()).map(function (_a) {
            var fileId = _a[0], transfer = _a[1];
            return ({
                fileId: fileId,
                fileName: transfer.metadata.fileName,
                totalChunks: transfer.metadata.totalChunks,
                chunksTransferred: transfer.receivedChunks.size,
                bytesTransferred: Array.from(transfer.receivedChunks).reduce(function (sum, idx) { var _a; return sum + (((_a = transfer.chunks.get(idx)) === null || _a === void 0 ? void 0 : _a.chunkSize) || 0); }, 0),
                totalBytes: transfer.metadata.fileSize,
                progress: (transfer.receivedChunks.size / transfer.metadata.totalChunks) * 100,
                speed: 0,
                estimatedTimeRemaining: 0,
                status: 'transferring',
            });
        });
    };
    /**
     * Clear completed transfers
     */
    FileTransferService.prototype.clearCompleted = function () {
        for (var _i = 0, _a = this.sendingTransfers.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], fileId = _b[0], progress = _b[1];
            if (progress.status === 'completed') {
                this.sendingTransfers.delete(fileId);
            }
        }
    };
    return FileTransferService;
}());
exports.FileTransferService = FileTransferService;
exports.default = new FileTransferService();
