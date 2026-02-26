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

export const chatService = {
  async sendMessage(messages: ConversationMessage[]): Promise<ChatResponse> {
    const response = await axiosInstance.post<ApiResponse<ChatResponse>>(
      API_ENDPOINTS.AGENT.CHAT,
      { messages } satisfies ChatRequest,
    );
    return response.data.data;
  },
};
