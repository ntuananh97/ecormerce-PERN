import { RequestContext } from '@mastra/core/request-context';
import { mastra } from '../mastra';
import type { ConversationMessage } from '@/types/agent.types';

/**
 * Agent Service Layer
 * Handles all business logic for interacting with the Mastra AI agent
 */
export class AgentService {
  /**
   * Send conversation history to the support agent and get a response.
   * The userId is passed via RequestContext so tools can securely query
   * only the authenticated user's data.
   * @param userId - Authenticated user's ID (optional)
   * @param messages - Full conversation history from the client
   * @returns The agent's text response
   */
  async chat(userId: string | undefined, messages: ConversationMessage[]): Promise<{ text: string }> {
    const requestContext = new RequestContext<{ userId: string }>();
    if (userId) {
      requestContext.set('userId', userId);
    }

    const agent = mastra.getAgent('supportAgent');

    // Mastra's MessageListInput is a union of AI SDK internal types.
    // Our ConversationMessage shape is compatible at runtime; the cast avoids TS resolution issues.
    const result = await agent.generate(messages as Parameters<typeof agent.generate>[0], {
      requestContext,
      maxSteps: 5,
    });

    return { text: result.text };
  }
}

export const agentService = new AgentService();
