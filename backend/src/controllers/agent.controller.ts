import { Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler';
import { ExtendedRequest } from '@/types/express';
import { agentService } from '@/services/agent.service';
import { BadRequestError } from '@/types/errors';
import type { ConversationMessage } from '@/types/agent.types';

/**
 * Agent Controller Layer
 * Handles HTTP requests and responses for the AI agent chat endpoint
 */
export class AgentController {
  /**
   * POST /api/agent/chat
   * Send a conversation history to the support agent and receive a response.
   * The authenticated user's ID is forwarded via RequestContext for secure data access.
   * The client is responsible for maintaining conversation state; backend does not persist history.
   */
  chat = asyncHandler(async (req: ExtendedRequest, res: Response): Promise<void> => {
    const { messages } = req.body as { messages?: ConversationMessage[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new BadRequestError('messages must be a non-empty array.');
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'user' || !lastMessage.content?.trim()) {
      throw new BadRequestError('The last message must be a non-empty user message.');
    }

    const result = await agentService.chat(req.user?.id, messages);

    res.status(200).json({
      success: true,
      message: 'Response from agent',
      data: result,
    });
  });

  /**
   * POST /api/agent/chat/stream
   * Stream the support agent response via Server-Sent Events (SSE).
   * Sends 'step' events for tool calls, 'delta' events for text tokens,
   * 'done' on completion, and 'error' if something goes wrong.
   * Not wrapped in asyncHandler — errors are sent as SSE error events.
   */
  chatStream = async (req: ExtendedRequest, res: Response): Promise<void> => {
    const { messages } = req.body as { messages?: ConversationMessage[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ success: false, message: 'messages must be a non-empty array.' });
      return;
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'user' || !lastMessage.content?.trim()) {
      res.status(400).json({ success: false, message: 'The last message must be a non-empty user message.' });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    req.on('close', () => {
      res.end();
    });

    try {
      await agentService.chatStream(req.user?.id, messages, res);
    } catch (err) {
      if (!res.writableEnded) {
        const message = err instanceof Error ? err.message : 'Error occurred.';
        res.write(`data: ${JSON.stringify({ type: 'error', data: { message } })}\n\n`);
      }
    } finally {
      if (!res.writableEnded) {
        res.end();
      }
    }
  };
}

export const agentController = new AgentController();
