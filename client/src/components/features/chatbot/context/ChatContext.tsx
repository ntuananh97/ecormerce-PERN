'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { chatService } from '@/services/chat.service';
import type { ConversationMessage } from '@/services/chat.service';
import type { ChatContextValue, ChatMessage } from '@/types/chat.types';

const ChatContext = createContext<ChatContextValue | null>(null);

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'bot',
  content:
    'Xin chào! Tôi là trợ lý AI của cửa hàng.\nBạn cần hỗ trợ gì?',
  timestamp: new Date(),
};

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (text: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const botId = `bot-${Date.now()}`;
    const botPlaceholder: ChatMessage = {
      id: botId,
      role: 'bot',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      toolStatus: undefined,
    };

    setMessages((prev) => [...prev, botPlaceholder]);

    const history: ConversationMessage[] = [...messages, userMessage]
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.content,
      }));

    try {
      await chatService.sendMessageStream(history, {
        onStep: (_, message) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === botId ? { ...m, toolStatus: message } : m)),
          );
        },
        onDelta: (chunk) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botId ? { ...m, content: m.content + chunk } : m,
            ),
          );
        },
        onDone: () => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botId ? { ...m, isStreaming: false, toolStatus: undefined } : m,
            ),
          );
          setIsLoading(false);
        },
        onError: (message) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botId
                ? { ...m, content: message || 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.', isStreaming: false, toolStatus: undefined }
                : m,
            ),
          );
          setIsLoading(false);
        },
      });
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId
            ? { ...m, content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.', isStreaming: false, toolStatus: undefined }
            : m,
        ),
      );
      setIsLoading(false);
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
  }, []);

  return (
    <ChatContext.Provider value={{ messages, isLoading, sendMessage, clearMessages }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
