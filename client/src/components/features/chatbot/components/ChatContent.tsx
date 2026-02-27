'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef } from 'react';
import { useChatContext } from '../context/ChatContext';
import { ChatBubble } from './ChatBubble';
import TypingIndicator from './TypingIndicator';



export function ChatContent() {
  const { messages, isLoading } = useChatContext();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <ScrollArea className="flex-1 bg-zinc-50 px-4 py-3 dark:bg-zinc-900/60">
      <div className="flex flex-col gap-3">
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        {/* {isLoading && <TypingIndicator />} */}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
