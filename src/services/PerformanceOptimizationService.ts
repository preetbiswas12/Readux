/**
 * Project Aegis - Performance Optimization Service
 * Manages codec selection, bandwidth monitoring, and quality adjustment
 */

/**
 * Performance & Quality Monitoring
 */
interface BandwidthStats {
  uploadBps: number; // Bytes per second
  downloadBps: number;
  timestamp: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface CodecInfo {
  name: string;
  type: 'audio' | 'video';
  mimeType: string;
  priority: number; // 0 = lowest priority, 10 = highest
  minBandwidth: number; // Minimum bandwidth in bps for optimal performance
  maxBandwidth?: number; // Maximum bandwidth for this codec
}

interface QualitySettings {
  resolution: '1080p' | '720p' | '480p' | '360p' | '240p';
  framerate: number; // fps
  bitrate: number; // kbps
  codec: string;
  adaptiveQuality: boolean;
}

interface ConnectionMetrics {
  bandwidth: BandwidthStats | null;
  latency: number; // milliseconds
  packetLoss: number; // percentage 0-100
  jitter: number; // milliseconds
  rttMean: number; // round-trip time mean
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

/**
 * Performance Optimization Service (Singleton)
 * Monitors connection quality and adjusts codec/quality settings dynamically
 */
class PerformanceOptimizationService {
  private bandwidthHistory: Map<string, BandwidthStats[]> = new Map();
  private connectionMetrics: Map<string, ConnectionMetrics> = new Map();
  private qualitySettings: Map<string, QualitySettings> = new Map();
  private codecPreferences: CodecInfo[] = [];
  private performanceHandlers: Map<string, (metrics: ConnectionMetrics) => void> = new Map();

  // Bandwidth thresholds (in bps)
  private readonly BANDWIDTH_THRESHOLDS = {
    excellent: 5000000, // 5 Mbps+
    good: 2500000, // 2.5 Mbps
    fair: 1000000, // 1 Mbps
    poor: 500000, // 500 kbps
  };

  constructor() {
    this.initializeCodecPreferences();
    console.log('⚙️ PerformanceOptimizationService initialized');
  }

  /**
   * Initialize codec preferences (ordered by quality)
   */
  private initializeCodecPreferences(): void {
    // Audio codecs
    this.codecPreferences.push(
      {
        name: 'Opus',
        type: 'audio',
        mimeType: 'audio/opus',
        priority: 10,
        minBandwidth: 16000, // 16 kbps
      },
      {
        name: 'PCMU',
        type: 'audio',
        mimeType: 'audio/PCMU',
        priority: 5,
        minBandwidth: 64000, // 64 kbps
      },
      {
        name: 'G722',
        type: 'audio',
        mimeType: 'audio/G722',
        priority: 4,
        minBandwidth: 64000,
      }
    );

    // Video codecs
    this.codecPreferences.push(
      {
        name: 'VP9',
        type: 'video',
        mimeType: 'video/VP9',
        priority: 10,
        minBandwidth: 1500000, // 1.5 Mbps
        maxBandwidth: 10000000,
      },
      {
        name: 'H264',
        type: 'video',
        mimeType: 'video/H264',
        priority: 8,
        minBandwidth: 1000000, // 1 Mbps
        maxBandwidth: 8000000,
      },
      {
        name: 'VP8',
        type: 'video',
        mimeType: 'video/VP8',
        priority: 6,
        minBandwidth: 500000, // 500 kbps
        maxBandwidth: 5000000,
      }
    );
  }

  /**
   * Select best codec based on available bandwidth
   */
  selectOptimalCodec(type: 'audio' | 'video', bandwidthBps: number): CodecInfo | null {
    const filteredCodecs = this.codecPreferences
      .filter(c => c.type === type && c.minBandwidth <= bandwidthBps)
      .sort((a, b) => b.priority - a.priority);

    if (filteredCodecs.length === 0) {
      console.warn(
        `⚠️ No suitable ${type} codec found for bandwidth ${(bandwidthBps / 1000).toFixed(0)} kbps`
      );
      // Fallback to lowest bandwidth codec
      return this.codecPreferences
        .filter(c => c.type === type)
        .sort((a, b) => a.minBandwidth - b.minBandwidth)[0] || null;
    }

    return filteredCodecs[0];
  }

  /**
   * Get recommended quality settings based on bandwidth
   */
  getRecommendedQualitySettings(bandwidth: number): QualitySettings {
    const settings: QualitySettings = {
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
    } else if (bandwidth >= this.BANDWIDTH_THRESHOLDS.good) {
      // Good: 720p, 30fps
      settings.resolution = '720p';
      settings.framerate = 30;
      settings.bitrate = 2500;
      settings.codec = 'H264';
    } else if (bandwidth >= this.BANDWIDTH_THRESHOLDS.fair) {
      // Fair: 480p, 24fps
      settings.resolution = '480p';
      settings.framerate = 24;
      settings.bitrate = 1000;
      settings.codec = 'VP8';
    } else if (bandwidth >= this.BANDWIDTH_THRESHOLDS.poor) {
      // Poor: 360p, 15fps
      settings.resolution = '360p';
      settings.framerate = 15;
      settings.bitrate = 500;
      settings.codec = 'VP8';
    } else {
      // Very poor: 240p, 10fps
      settings.resolution = '240p';
      settings.framerate = 10;
      settings.bitrate = 250;
      settings.codec = 'VP8';
    }

    return settings;
  }

  /**
   * Record bandwidth measurement
   */
  recordBandwidth(peerId: string, uploadBps: number, downloadBps: number): void {
    const stats: BandwidthStats = {
      uploadBps,
      downloadBps,
      timestamp: Date.now(),
      quality: this.classifyBandwidth(Math.min(uploadBps, downloadBps)),
    };

    if (!this.bandwidthHistory.has(peerId)) {
      this.bandwidthHistory.set(peerId, []);
    }

    const history = this.bandwidthHistory.get(peerId)!;
    history.push(stats);

    // Keep only last 100 measurements
    if (history.length > 100) {
      history.shift();
    }

    console.log(
      `📊 Bandwidth recorded for @${peerId}: ↑${(uploadBps / 1000000).toFixed(1)}Mbps ↓${(downloadBps / 1000000).toFixed(1)}Mbps (${stats.quality})`
    );
  }

  /**
   * Classify bandwidth into quality tiers
   */
  private classifyBandwidth(bandwidthBps: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (bandwidthBps >= this.BANDWIDTH_THRESHOLDS.excellent) return 'excellent';
    if (bandwidthBps >= this.BANDWIDTH_THRESHOLDS.good) return 'good';
    if (bandwidthBps >= this.BANDWIDTH_THRESHOLDS.fair) return 'fair';
    return 'poor';
  }

  /**
   * Update connection metrics
   */
  updateConnectionMetrics(peerId: string, metrics: Partial<ConnectionMetrics>): void {
    const existing = this.connectionMetrics.get(peerId) || {
      bandwidth: null,
      latency: 0,
      packetLoss: 0,
      jitter: 0,
      rttMean: 0,
      quality: 'good',
    };

    const updated: ConnectionMetrics = { ...existing, ...metrics };

    // Classify quality based on metrics
    if (updated.latency > 500 || updated.packetLoss > 5) {
      updated.quality = 'poor';
    } else if (updated.latency > 150 || updated.packetLoss > 2) {
      updated.quality = 'fair';
    } else if (updated.latency > 75 || updated.packetLoss > 1) {
      updated.quality = 'good';
    } else {
      updated.quality = 'excellent';
    }

    this.connectionMetrics.set(peerId, updated);

    // Trigger handler
    const handler = this.performanceHandlers.get(peerId);
    if (handler) {
      handler(updated);
    }

    console.log(
      `📈 Connection metrics for @${peerId}: latency=${updated.latency}ms, loss=${updated.packetLoss}%, quality=${updated.quality}`
    );
  }

  /**
   * Get current connection metrics
   */
  getConnectionMetrics(peerId: string): ConnectionMetrics | undefined {
    return this.connectionMetrics.get(peerId);
  }

  /**
   * Get average bandwidth over time window
   */
  getAverageBandwidth(peerId: string, windowMs: number = 10000): number | null {
    const history = this.bandwidthHistory.get(peerId);
    if (!history || history.length === 0) return null;

    const now = Date.now();
    const recentStats = history.filter(s => now - s.timestamp <= windowMs);

    if (recentStats.length === 0) return null;

    const totalBps = recentStats.reduce(
      (sum, s) => sum + Math.min(s.uploadBps, s.downloadBps),
      0
    );

    return totalBps / recentStats.length;
  }

  /**
   * Get quality recommendations
   */
  getQualityRecommendations(peerId: string): string[] {
    const recommendations: string[] = [];
    const metrics = this.connectionMetrics.get(peerId);
    const bandwidth = this.getAverageBandwidth(peerId);

    if (!metrics || !bandwidth) {
      return ['Connection quality unknown'];
    }

    if (metrics.quality === 'poor') {
      recommendations.push('🔴 Connection quality is poor');
      recommendations.push('Consider moving closer to router or reducing background activity');

      if (metrics.latency > 500) {
        recommendations.push(`Latency is high (${metrics.latency}ms). Check network stability.`);
      }
      if (metrics.packetLoss > 5) {
        recommendations.push(`Packet loss is high (${metrics.packetLoss}%). Try wired connection.`);
      }
    } else if (metrics.quality === 'fair') {
      recommendations.push('🟡 Connection quality is fair');
      recommendations.push('Performance may be degraded. Video quality may reduce automatically.');
    } else if (metrics.quality === 'good') {
      recommendations.push('🟢 Connection quality is good');
      recommendations.push('Performance is acceptable for most use cases.');
    } else {
      recommendations.push('🟢 Connection quality is excellent');
      recommendations.push('Optimal performance. All features are available.');
    }

    if (bandwidth < this.BANDWIDTH_THRESHOLDS.poor) {
      recommendations.push(
        `Bandwidth is low (${(bandwidth / 1000000).toFixed(1)}Mbps). Video may not be available.`
      );
    }

    return recommendations;
  }

  /**
   * Register handler for performance metrics updates
   */
  onPerformanceMetrics(peerId: string, handler: (metrics: ConnectionMetrics) => void): () => void {
    this.performanceHandlers.set(peerId, handler);

    return () => {
      this.performanceHandlers.delete(peerId);
    };
  }

  /**
   * Get bandwidth history for visualization
   */
  getBandwidthHistory(peerId: string, limit: number = 50): BandwidthStats[] {
    const history = this.bandwidthHistory.get(peerId) || [];
    return history.slice(Math.max(0, history.length - limit));
  }

  /**
   * Get all available codecs
   */
  getAvailableCodecs(type?: 'audio' | 'video'): CodecInfo[] {
    if (type) {
      return this.codecPreferences.filter(c => c.type === type);
    }
    return this.codecPreferences;
  }

  /**
   * Get performance stats
   */
  getPerformanceStats(): {
    activeConnections: number;
    averageQuality: string;
    totalBandwidthMonitored: string;
    codecCount: number;
  } {
    const metrics = Array.from(this.connectionMetrics.values());
    const qualities = metrics.map(m => m.quality);

    const qualityCounts = {
      excellent: qualities.filter(q => q === 'excellent').length,
      good: qualities.filter(q => q === 'good').length,
      fair: qualities.filter(q => q === 'fair').length,
      poor: qualities.filter(q => q === 'poor').length,
    };

    let averageQuality = 'good';
    if (qualityCounts.poor > qualityCounts.good) averageQuality = 'poor';
    else if (qualityCounts.excellent > qualityCounts.good * 2) averageQuality = 'excellent';
    else if (qualityCounts.fair > qualityCounts.good) averageQuality = 'fair';

    let totalBandwidth = 0;
    for (const history of this.bandwidthHistory.values()) {
      for (const stat of history) {
        totalBandwidth += stat.uploadBps + stat.downloadBps;
      }
    }

    return {
      activeConnections: this.connectionMetrics.size,
      averageQuality,
      totalBandwidthMonitored: (totalBandwidth / 1000000).toFixed(2) + ' MB',
      codecCount: this.codecPreferences.length,
    };
  }

  /**
   * Clear perf data for a connection
   */
  clearMetrics(peerId: string): void {
    this.bandwidthHistory.delete(peerId);
    this.connectionMetrics.delete(peerId);
    this.qualitySettings.delete(peerId);
    this.performanceHandlers.delete(peerId);
    console.log(`🗑️ Performance metrics cleared for @${peerId}`);
  }
}

export default new PerformanceOptimizationService();
