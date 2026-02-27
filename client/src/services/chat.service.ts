import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants/api.constants';
import type { ApiResponse } from '@/types/api.types';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ConversationMessage[];
}

interface ChatResponse {
  text: string;
}

export interface StreamCallbacks {
  onStep?: (toolName: string, message: string) => void;
  onDelta?: (text: string) => void;
  onDone?: () => void;
  onError?: (message: string) => void;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const chatService = {
  async sendMessage(messages: ConversationMessage[]): Promise<ChatResponse> {
    const response = await axiosInstance.post<ApiResponse<ChatResponse>>(
      API_ENDPOINTS.AGENT.CHAT,
      { messages } satisfies ChatRequest,
    );
    return response.data.data;
  },

  async sendMessageStream(messages: ConversationMessage[], callbacks: StreamCallbacks): Promise<void> {
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.AGENT.CHAT_STREAM}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages } satisfies ChatRequest),
    });

    if (!response.ok || !response.body) {
      callbacks.onError?.(`Server error: ${response.status}`);
      return;
    }

    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += value;
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (!raw) continue;

        try {
          const event = JSON.parse(raw) as {
            type: 'step' | 'delta' | 'done' | 'error';
            data?: { toolName?: string; message?: string; text?: string };
          };

          switch (event.type) {
            case 'step':
              callbacks.onStep?.(event.data?.toolName ?? '', event.data?.message ?? '');
              break;
            case 'delta':
              callbacks.onDelta?.(event.data?.text ?? '');
              break;
            case 'done':
              callbacks.onDone?.();
              break;
            case 'error':
              callbacks.onError?.(event.data?.message ?? 'Đã có lỗi xảy ra.');
              break;
          }
        } catch {
          // Ignore malformed SSE lines
        }
      }
    }
  },
};
