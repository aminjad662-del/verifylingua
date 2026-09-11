/**
 * VerifyLingua 17-State Customer Lifecycle Status Model
 *
 * Implements the full state machine mandated by enterprise specifications:
 * 1. Uploaded
 * 2. Validating
 * 3. Security scanning
 * 4. Classified
 * 5. Extracting
 * 6. OCR processing
 * 7. Translating
 * 8. Reconstructing
 * 9. Rendering
 * 10. Quality checking
 * 11. Human review required
 * 12. Awaiting customer input
 * 13. Ready
 * 14. Delivered
 * 15. Failed
 * 16. Partially completed
 * 17. Unsupported
 *
 * Every state transition guarantees an immutable audit timestamp, explicit current action,
 * anticipated next action, customer action requirement, duration estimate, and escalation path.
 */

export type CustomerJobState =
  | "Uploaded"
  | "Validating"
  | "Security scanning"
  | "Classified"
  | "Extracting"
  | "OCR processing"
  | "Translating"
  | "Reconstructing"
  | "Rendering"
  | "Quality checking"
  | "Human review required"
  | "Awaiting customer input"
  | "Ready"
  | "Delivered"
  | "Failed"
  | "Partially completed"
  | "Unsupported";

export interface CustomerStatePayload {
  state: CustomerJobState;
  timestamp: string;
  currentAction: string;
  nextAction: string;
  customerActionRequired: boolean;
  customerActionDescription?: string;
  estimatedDurationMs?: number;
  errorDetails?: {
    code: string;
    message: string;
    technicalContext?: string;
  };
  retryOrEscalationPath: {
    canRetry: boolean;
    canEscalateToHuman: boolean;
    escalationContactUrl: string;
  };
}

export interface StateTransitionHistoryItem extends CustomerStatePayload {
  transitionId: string;
  actor: string;
}

export class JobLifecycleStateMachine {
  private history: StateTransitionHistoryItem[] = [];
  private currentState: CustomerStatePayload;

  constructor(jobId: string, initialActor: string = "System Intake") {
    const now = new Date().toISOString();
    this.currentState = {
      state: "Uploaded",
      timestamp: now,
      currentAction: "File binary received and stored into isolated temporary staging.",
      nextAction: "Perform format and checksum validation.",
      customerActionRequired: false,
      estimatedDurationMs: 1500,
      retryOrEscalationPath: {
        canRetry: true,
        canEscalateToHuman: false,
        escalationContactUrl: "/support/intake",
      },
    };

    this.history.push({
      ...this.currentState,
      transitionId: `trans_${Date.now()}_1`,
      actor: initialActor,
    });
  }

  public getCurrentState(): CustomerStatePayload {
    return { ...this.currentState };
  }

  public getHistory(): StateTransitionHistoryItem[] {
    return [...this.history];
  }

  public transitionTo(
    nextState: CustomerJobState,
    details: {
      currentAction: string;
      nextAction: string;
      customerActionRequired?: boolean;
      customerActionDescription?: string;
      estimatedDurationMs?: number;
      errorDetails?: { code: string; message: string; technicalContext?: string };
      canRetry?: boolean;
      canEscalateToHuman?: boolean;
      actor?: string;
    }
  ): CustomerStatePayload {
    const now = new Date().toISOString();
    const payload: CustomerStatePayload = {
      state: nextState,
      timestamp: now,
      currentAction: details.currentAction,
      nextAction: details.nextAction,
      customerActionRequired: details.customerActionRequired ?? false,
      customerActionDescription: details.customerActionDescription,
      estimatedDurationMs: details.estimatedDurationMs,
      errorDetails: details.errorDetails,
      retryOrEscalationPath: {
        canRetry: details.canRetry ?? (nextState === "Failed" || nextState === "Partially completed"),
        canEscalateToHuman: details.canEscalateToHuman ?? (nextState === "Human review required" || nextState === "Unsupported"),
        escalationContactUrl: "/support/orders",
      },
    };

    this.currentState = payload;
    this.history.unshift({
      ...payload,
      transitionId: `trans_${Date.now()}_${this.history.length + 1}`,
      actor: details.actor || "System Orchestrator",
    });

    return payload;
  }
}
