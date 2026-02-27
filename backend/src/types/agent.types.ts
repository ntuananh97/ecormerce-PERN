export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SSEStepEvent {
  type: 'step';
  data: { toolName: string; message: string };
}

export interface SSEDeltaEvent {
  type: 'delta';
  data: { text: string };
}

export interface SSEDoneEvent {
  type: 'done';
}

export interface SSEErrorEvent {
  type: 'error';
  data: { message: string };
}

export type SSEEvent = SSEStepEvent | SSEDeltaEvent | SSEDoneEvent | SSEErrorEvent;
