'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import type { ChatMessage } from '@/types/chat.types';
import TypingIndicator from './TypingIndicator';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex items-end gap-2', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarFallback
          className={cn(
            'text-xs',
            isUser
              ? 'bg-indigo-600 text-white'
              : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300',
          )}
        >
          {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm',
          isUser
            ? 'rounded-br-sm bg-indigo-600 text-white'
            : 'rounded-bl-sm border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100',
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">
          {message.isStreaming && <TypingIndicator />}
          {message.content || message.toolStatus}</p>
        <p
          className={cn(
            'mt-1 text-right text-[10px]',
            isUser ? 'text-indigo-200' : 'text-zinc-400 dark:text-zinc-500',
          )}
        >
          {message.timestamp.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
