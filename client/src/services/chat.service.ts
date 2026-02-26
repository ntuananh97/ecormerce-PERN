import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants/api.constants';
import type { ApiResponse } from '@/types/api.types';

interface ChatRequest {
  message: string;
}

interface ChatResponse {
  text: string;
}

export const chatService = {
  async sendMessage(message: string): Promise<ChatResponse> {
    const response = await axiosInstance.post<ApiResponse<ChatResponse>>(
      API_ENDPOINTS.AGENT.CHAT,
      { message } satisfies ChatRequest,
    );
    return response.data.data;
  },
};
