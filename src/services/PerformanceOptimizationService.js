"use strict";
/**
 * Project Aegis - Performance Optimization Service
 * Manages codec selection, bandwidth monitoring, and quality adjustment
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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Performance Optimization Service (Singleton)
 * Monitors connection quality and adjusts codec/quality settings dynamically
 */
var PerformanceOptimizationService = /** @class */ (function () {
    function PerformanceOptimizationService() {
        this.bandwidthHistory = new Map();
        this.connectionMetrics = new Map();
        this.qualitySettings = new Map();
        this.codecPreferences = [];
        this.performanceHandlers = new Map();
        // Bandwidth thresholds (in bps)
        this.BANDWIDTH_THRESHOLDS = {
            excellent: 5000000, // 5 Mbps+
            good: 2500000, // 2.5 Mbps
            fair: 1000000, // 1 Mbps
            poor: 500000, // 500 kbps
        };
        this.initializeCodecPreferences();
        console.log('⚙️ PerformanceOptimizationService initialized');
    }
    /**
     * Initialize codec preferences (ordered by quality)
     */
    PerformanceOptimizationService.prototype.initializeCodecPreferences = function () {
        // Audio codecs
        this.codecPreferences.push({
            name: 'Opus',
            type: 'audio',
            mimeType: 'audio/opus',
            priority: 10,
            minBandwidth: 16000, // 16 kbps
        }, {
            name: 'PCMU',
            type: 'audio',
            mimeType: 'audio/PCMU',
            priority: 5,
            minBandwidth: 64000, // 64 kbps
        }, {
            name: 'G722',
            type: 'audio',
            mimeType: 'audio/G722',
            priority: 4,
            minBandwidth: 64000,
        });
        // Video codecs
        this.codecPreferences.push({
            name: 'VP9',
            type: 'video',
            mimeType: 'video/VP9',
            priority: 10,
            minBandwidth: 1500000, // 1.5 Mbps
            maxBandwidth: 10000000,
        }, {
            name: 'H264',
            type: 'video',
            mimeType: 'video/H264',
            priority: 8,
            minBandwidth: 1000000, // 1 Mbps
            maxBandwidth: 8000000,
        }, {
            name: 'VP8',
            type: 'video',
            mimeType: 'video/VP8',
            priority: 6,
            minBandwidth: 500000, // 500 kbps
            maxBandwidth: 5000000,
        });
    };
    /**
     * Select best codec based on available bandwidth
     */
    PerformanceOptimizationService.prototype.selectOptimalCodec = function (type, bandwidthBps) {
        var filteredCodecs = this.codecPreferences
            .filter(function (c) { return c.type === type && c.minBandwidth <= bandwidthBps; })
            .sort(function (a, b) { return b.priority - a.priority; });
        if (filteredCodecs.length === 0) {
            console.warn("\u26A0\uFE0F No suitable ".concat(type, " codec found for bandwidth ").concat((bandwidthBps / 1000).toFixed(0), " kbps"));
            // Fallback to lowest bandwidth codec
            return this.codecPreferences
                .filter(function (c) { return c.type === type; })
                .sort(function (a, b) { return a.minBandwidth - b.minBandwidth; })[0] || null;
        }
        return filteredCodecs[0];
    };
    /**
     * Get recommended quality settings based on bandwidth
     */
    PerformanceOptimizationService.prototype.getRecommendedQualitySettings = function (bandwidth) {
        var settings = {
            resolution: '720p',
            framerate: 30,
            bitrate: 2000,
            codec: 'H264',
            adaptiveQuality: true,
        };
        if (bandwidth >= this.BANDWIDTH_THRESHOLDS.excellent) {
            // Excellent: 1080p, 60fps
            settings.resolution = '1080p';
            settings.framerate = 60;
            settings.bitrate = 5000;
            settings.codec = 'VP9';
        }
        else if (bandwidth >= this.BANDWIDTH_THRESHOLDS.good) {
            // Good: 720p, 30fps
            settings.resolution = '720p';
            settings.framerate = 30;
            settings.bitrate = 2500;
            settings.codec = 'H264';
        }
        else if (bandwidth >= this.BANDWIDTH_THRESHOLDS.fair) {
            // Fair: 480p, 24fps
            settings.resolution = '480p';
            settings.framerate = 24;
            settings.bitrate = 1000;
            settings.codec = 'VP8';
        }
        else if (bandwidth >= this.BANDWIDTH_THRESHOLDS.poor) {
            // Poor: 360p, 15fps
            settings.resolution = '360p';
            settings.framerate = 15;
            settings.bitrate = 500;
            settings.codec = 'VP8';
        }
        else {
            // Very poor: 240p, 10fps
            settings.resolution = '240p';
            settings.framerate = 10;
            settings.bitrate = 250;
            settings.codec = 'VP8';
        }
        return settings;
    };
    /**
     * Record bandwidth measurement
     */
    PerformanceOptimizationService.prototype.recordBandwidth = function (peerId, uploadBps, downloadBps) {
        var stats = {
            uploadBps: uploadBps,
            downloadBps: downloadBps,
            timestamp: Date.now(),
            quality: this.classifyBandwidth(Math.min(uploadBps, downloadBps)),
        };
        if (!this.bandwidthHistory.has(peerId)) {
            this.bandwidthHistory.set(peerId, []);
        }
        var history = this.bandwidthHistory.get(peerId);
        history.push(stats);
        // Keep only last 100 measurements
        if (history.length > 100) {
            history.shift();
        }
        console.log("\uD83D\uDCCA Bandwidth recorded for @".concat(peerId, ": \u2191").concat((uploadBps / 1000000).toFixed(1), "Mbps \u2193").concat((downloadBps / 1000000).toFixed(1), "Mbps (").concat(stats.quality, ")"));
    };
    /**
     * Classify bandwidth into quality tiers
     */
    PerformanceOptimizationService.prototype.classifyBandwidth = function (bandwidthBps) {
        if (bandwidthBps >= this.BANDWIDTH_THRESHOLDS.excellent)
            return 'excellent';
        if (bandwidthBps >= this.BANDWIDTH_THRESHOLDS.good)
            return 'good';
        if (bandwidthBps >= this.BANDWIDTH_THRESHOLDS.fair)
            return 'fair';
        return 'poor';
    };
    /**
     * Update connection metrics
     */
    PerformanceOptimizationService.prototype.updateConnectionMetrics = function (peerId, metrics) {
        var existing = this.connectionMetrics.get(peerId) || {
            bandwidth: null,
            latency: 0,
            packetLoss: 0,
            jitter: 0,
            rttMean: 0,
            quality: 'good',
        };
        var updated = __assign(__assign({}, existing), metrics);
        // Classify quality based on metrics
        if (updated.latency > 500 || updated.packetLoss > 5) {
            updated.quality = 'poor';
        }
        else if (updated.latency > 150 || updated.packetLoss > 2) {
            updated.quality = 'fair';
        }
        else if (updated.latency > 75 || updated.packetLoss > 1) {
            updated.quality = 'good';
        }
        else {
            updated.quality = 'excellent';
        }
        this.connectionMetrics.set(peerId, updated);
        // Trigger handler
        var handler = this.performanceHandlers.get(peerId);
        if (handler) {
            handler(updated);
        }
        console.log("\uD83D\uDCC8 Connection metrics for @".concat(peerId, ": latency=").concat(updated.latency, "ms, loss=").concat(updated.packetLoss, "%, quality=").concat(updated.quality));
    };
    /**
     * Get current connection metrics
     */
    PerformanceOptimizationService.prototype.getConnectionMetrics = function (peerId) {
        return this.connectionMetrics.get(peerId);
    };
    /**
     * Get average bandwidth over time window
     */
    PerformanceOptimizationService.prototype.getAverageBandwidth = function (peerId, windowMs) {
        if (windowMs === void 0) { windowMs = 10000; }
        var history = this.bandwidthHistory.get(peerId);
        if (!history || history.length === 0)
            return null;
        var now = Date.now();
        var recentStats = history.filter(function (s) { return now - s.timestamp <= windowMs; });
        if (recentStats.length === 0)
            return null;
        var totalBps = recentStats.reduce(function (sum, s) { return sum + Math.min(s.uploadBps, s.downloadBps); }, 0);
        return totalBps / recentStats.length;
    };
    /**
     * Get quality recommendations
     */
    PerformanceOptimizationService.prototype.getQualityRecommendations = function (peerId) {
        var recommendations = [];
        var metrics = this.connectionMetrics.get(peerId);
        var bandwidth = this.getAverageBandwidth(peerId);
        if (!metrics || !bandwidth) {
            return ['Connection quality unknown'];
        }
        if (metrics.quality === 'poor') {
            recommendations.push('🔴 Connection quality is poor');
            recommendations.push('Consider moving closer to router or reducing background activity');
            if (metrics.latency > 500) {
                recommendations.push("Latency is high (".concat(metrics.latency, "ms). Check network stability."));
            }
            if (metrics.packetLoss > 5) {
                recommendations.push("Packet loss is high (".concat(metrics.packetLoss, "%). Try wired connection."));
            }
        }
        else if (metrics.quality === 'fair') {
            recommendations.push('🟡 Connection quality is fair');
            recommendations.push('Performance may be degraded. Video quality may reduce automatically.');
        }
        else if (metrics.quality === 'good') {
            recommendations.push('🟢 Connection quality is good');
            recommendations.push('Performance is acceptable for most use cases.');
        }
        else {
            recommendations.push('🟢 Connection quality is excellent');
            recommendations.push('Optimal performance. All features are available.');
        }
        if (bandwidth < this.BANDWIDTH_THRESHOLDS.poor) {
            recommendations.push("Bandwidth is low (".concat((bandwidth / 1000000).toFixed(1), "Mbps). Video may not be available."));
        }
        return recommendations;
    };
    /**
     * Register handler for performance metrics updates
     */
    PerformanceOptimizationService.prototype.onPerformanceMetrics = function (peerId, handler) {
        var _this = this;
        this.performanceHandlers.set(peerId, handler);
        return function () {
            _this.performanceHandlers.delete(peerId);
        };
    };
    /**
     * Get bandwidth history for visualization
     */
    PerformanceOptimizationService.prototype.getBandwidthHistory = function (peerId, limit) {
        if (limit === void 0) { limit = 50; }
        var history = this.bandwidthHistory.get(peerId) || [];
        return history.slice(Math.max(0, history.length - limit));
    };
    /**
     * Get all available codecs
     */
    PerformanceOptimizationService.prototype.getAvailableCodecs = function (type) {
        if (type) {
            return this.codecPreferences.filter(function (c) { return c.type === type; });
        }
        return this.codecPreferences;
    };
    /**
     * Get performance stats
     */
    PerformanceOptimizationService.prototype.getPerformanceStats = function () {
        var metrics = Array.from(this.connectionMetrics.values());
        var qualities = metrics.map(function (m) { return m.quality; });
        var qualityCounts = {
            excellent: qualities.filter(function (q) { return q === 'excellent'; }).length,
            good: qualities.filter(function (q) { return q === 'good'; }).length,
            fair: qualities.filter(function (q) { return q === 'fair'; }).length,
            poor: qualities.filter(function (q) { return q === 'poor'; }).length,
        };
        var averageQuality = 'good';
        if (qualityCounts.poor > qualityCounts.good)
            averageQuality = 'poor';
        else if (qualityCounts.excellent > qualityCounts.good * 2)
            averageQuality = 'excellent';
        else if (qualityCounts.fair > qualityCounts.good)
            averageQuality = 'fair';
        var totalBandwidth = 0;
        for (var _i = 0, _a = this.bandwidthHistory.values(); _i < _a.length; _i++) {
            var history_2 = _a[_i];
            for (var _b = 0, history_1 = history_2; _b < history_1.length; _b++) {
                var stat = history_1[_b];
                totalBandwidth += stat.uploadBps + stat.downloadBps;
            }
        }
        return {
            activeConnections: this.connectionMetrics.size,
            averageQuality: averageQuality,
            totalBandwidthMonitored: (totalBandwidth / 1000000).toFixed(2) + ' MB',
            codecCount: this.codecPreferences.length,
        };
    };
    /**
     * Clear perf data for a connection
     */
    PerformanceOptimizationService.prototype.clearMetrics = function (peerId) {
        this.bandwidthHistory.delete(peerId);
        this.connectionMetrics.delete(peerId);
        this.qualitySettings.delete(peerId);
        this.performanceHandlers.delete(peerId);
        console.log("\uD83D\uDDD1\uFE0F Performance metrics cleared for @".concat(peerId));
    };
    return PerformanceOptimizationService;
}());
exports.default = new PerformanceOptimizationService();
