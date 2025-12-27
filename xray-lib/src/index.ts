export interface XRayStep {
  step: string;
  timestamp: number;
  input?: any;
  output?: any;
  reasoning?: string;
  metadata?: Record<string, any>;
}

export interface XRayTrace {
  traceId: string;
  startTime: number;
  endTime?: number;
  steps: XRayStep[];
  metadata?: Record<string, any>;
}

export class XRay {
  private currentTrace: XRayTrace | null = null;
  private onTraceComplete?: (trace: XRayTrace) => void;

  /**
   * Start a new trace
   */
  startTrace(traceId: string, metadata?: Record<string, any>): void {
    this.currentTrace = {
      traceId,
      startTime: Date.now(),
      steps: [],
      metadata,
    };
  }

  /**
   * Log a step in the current trace
   */
  logStep(
    stepName: string,
    input?: any,
    output?: any,
    reasoning?: string,
    metadata?: Record<string, any>
  ): void {
    if (!this.currentTrace) {
      throw new Error('No active trace. Call startTrace() first.');
    }

    const step: XRayStep = {
      step: stepName,
      timestamp: Date.now(),
      input,
      output,
      reasoning,
      metadata,
    };

    this.currentTrace.steps.push(step);
  }

  /**
   * End the current trace and return it
   */
  endTrace(): XRayTrace {
    if (!this.currentTrace) {
      throw new Error('No active trace to end.');
    }

    this.currentTrace.endTime = Date.now();
    const completedTrace = this.currentTrace;
    this.currentTrace = null;

    if (this.onTraceComplete) {
      this.onTraceComplete(completedTrace);
    }

    return completedTrace;
  }

  /**
   * Get the current trace (useful for inspection)
   */
  getCurrentTrace(): XRayTrace | null {
    return this.currentTrace;
  }

  /**
   * Set a callback to be called when a trace is completed
   */
  onComplete(callback: (trace: XRayTrace) => void): void {
    this.onTraceComplete = callback;
  }
}

/**
 * Create a new XRay instance
 */
export function createXRay(): XRay {
  return new XRay();
}
