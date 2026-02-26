'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SendHorizontal } from 'lucide-react';
import { type KeyboardEvent, useState } from 'react';
import { useChatContext } from '../context/ChatContext';

export function ChatInput() {
  const { sendMessage, isLoading } = useChatContext();
  const [value, setValue] = useState('');

  const handleSend = async () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;

    setValue('');
    await sendMessage(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="border-t border-zinc-200 bg-white px-3 py-3 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 transition-shadow focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:focus-within:border-indigo-500">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập câu hỏi..."
          disabled={isLoading}
          className="h-8 flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
        />
        <Button
          size="icon"
          className="h-7 w-7 shrink-0 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40"
          onClick={() => void handleSend()}
          disabled={!value.trim() || isLoading}
        >
          <SendHorizontal className="h-3.5 w-3.5" />
        </Button>
      </div>
      <p className="mt-1.5 text-center text-[10px] text-zinc-400 dark:text-zinc-500">
        AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
      </p>
    </div>
  );
}
