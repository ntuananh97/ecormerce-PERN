function TypingIndicator() {
    return (
      <div className="flex items-end gap-2">
        <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s] dark:bg-zinc-500" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s] dark:bg-zinc-500" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 dark:bg-zinc-500" />
        </div>
      </div>
    );
  }

  export default TypingIndicator;