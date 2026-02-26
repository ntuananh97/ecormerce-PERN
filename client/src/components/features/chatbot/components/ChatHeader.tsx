'use client';

import { Button } from '@/components/ui/button';
import { Bot, Trash2, X } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';

interface ChatHeaderProps {
  onClose: () => void;
}

export function ChatHeader({ onClose }: ChatHeaderProps) {
  const { clearMessages } = useChatContext();

  return (
    <div className="flex items-center justify-between rounded-t-2xl bg-zinc-900 px-4 py-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 ring-1 ring-zinc-600">
          <Bot className="h-4 w-4 text-zinc-100" />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-100">Chatbot AI</p>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_theme(colors.emerald.400)]" />
            <p className="text-[11px] text-zinc-400">Trực tuyến</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          onClick={clearMessages}
          title="Xóa lịch sử trò chuyện"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          onClick={onClose}
          title="Đóng"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
