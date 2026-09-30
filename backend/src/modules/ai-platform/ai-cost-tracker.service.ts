import { Injectable, Logger } from '@nestjs/common';

export interface AiUsageMetric {
  userId?: string;
  endpoint: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  durationMs: number;
  estimatedCostUsd: number;
  timestamp: string;
}

@Injectable()
export class AiCostTrackerService {
  private readonly logger = new Logger(AiCostTrackerService.name);
  private usageHistory: AiUsageMetric[] = [];
  private totalCost = 0;
  private totalTokensCount = 0;

  // Pricing constants (e.g., standard Gemini 1.5 Pro pricing / 1M tokens)
  private readonly PROMPT_COST_PER_MILLION = 3.5;
  private readonly COMPLETION_COST_PER_MILLION = 10.5;

  trackUsage(params: {
    userId?: string;
    endpoint: string;
    model?: string;
    promptTokens?: number;
    completionTokens?: number;
    durationMs: number;
  }): AiUsageMetric {
    const promptTokens = params.promptTokens || 0;
    const completionTokens = params.completionTokens || 0;
    const totalTokens = promptTokens + completionTokens;
    const model = params.model || 'gemini-1.5-pro';

    const cost =
      (promptTokens / 1_000_000) * this.PROMPT_COST_PER_MILLION +
      (completionTokens / 1_000_000) * this.COMPLETION_COST_PER_MILLION;

    const metric: AiUsageMetric = {
      userId: params.userId,
      endpoint: params.endpoint,
      model,
      promptTokens,
      completionTokens,
      totalTokens,
      durationMs: params.durationMs,
      estimatedCostUsd: Number(cost.toFixed(6)),
      timestamp: new Date().toISOString(),
    };

    this.usageHistory.push(metric);
    this.totalCost += metric.estimatedCostUsd;
    this.totalTokensCount += totalTokens;

    // Keep history capped in memory
    if (this.usageHistory.length > 500) {
      this.usageHistory.shift();
    }

    this.logger.log(
      `[AI Observability] Endpoint: ${params.endpoint} | Latency: ${params.durationMs}ms | Tokens: ${totalTokens} | Cost: $${metric.estimatedCostUsd.toFixed(6)}`,
    );

    return metric;
  }

  getMetricsSummary() {
    return {
      totalRequests: this.usageHistory.length,
      totalTokens: this.totalTokensCount,
      totalEstimatedCostUsd: Number(this.totalCost.toFixed(4)),
      averageLatencyMs:
        this.usageHistory.length > 0
          ? Math.round(
              this.usageHistory.reduce((acc, u) => acc + u.durationMs, 0) /
                this.usageHistory.length,
            )
          : 0,
      recentRequests: this.usageHistory.slice(-10).reverse(),
    };
  }
}
