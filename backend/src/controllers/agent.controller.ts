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
}

export const agentController = new AgentController();
