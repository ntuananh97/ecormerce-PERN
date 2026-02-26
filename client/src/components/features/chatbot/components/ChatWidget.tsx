'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';
import { ChatProvider } from '../context/ChatContext';
import { ChatContent } from './ChatContent';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat popup */}
      <div
        className={cn(
          'flex w-[360px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl transition-all duration-300 ease-in-out dark:border-zinc-700 dark:bg-zinc-900',
          'sm:w-[380px]',
          isOpen
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-4 scale-95 opacity-0',
        )}
        style={{ height: '520px' }}
      >
        <ChatProvider>
          <ChatHeader onClose={() => setIsOpen(false)} />
          <ChatContent />
          <ChatInput />
        </ChatProvider>
      </div>

      {/* Toggle button */}
      <Button
        size="icon"
        className={cn(
          'h-14 w-14 rounded-full bg-zinc-900 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-zinc-800 hover:shadow-xl dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200',
          isOpen && 'rotate-0',
        )}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Đóng chatbot' : 'Mở chatbot'}
      >
        <span
          className={cn(
            'absolute transition-all duration-200',
            isOpen ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0',
          )}
        >
          <X className="h-6 w-6" />
        </span>
        <span
          className={cn(
            'absolute transition-all duration-200',
            isOpen ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100',
          )}
        >
          <MessageCircle className="h-6 w-6" />
        </span>
      </Button>
    </div>
  );
}
