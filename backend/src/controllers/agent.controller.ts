import { Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler';
import { ExtendedRequest } from '@/types/express';
import { agentService } from '@/services/agent.service';
import { BadRequestError } from '@/types/errors';

/**
 * Agent Controller Layer
 * Handles HTTP requests and responses for the AI agent chat endpoint
 */
export class AgentController {
  /**
   * POST /api/agent/chat
   * Send a message to the order support agent and receive a response.
   * Requires authentication. The authenticated user's ID is forwarded
   * to the agent via RequestContext for secure data access.
   */
  chat = asyncHandler(async (req: ExtendedRequest, res: Response): Promise<void> => {
    const { message } = req.body as { message?: string };

    if (!message || typeof message !== 'string' || message.trim() === '') {
      throw new BadRequestError('Message is required.');
    }

    const result = await agentService.chat(req.user!.id, message.trim());

    res.status(200).json({
      success: true,
      message: 'Response from agent',
      data: result,
    });
  });
}

export const agentController = new AgentController();
