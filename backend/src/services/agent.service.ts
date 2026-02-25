import { RequestContext } from '@mastra/core/request-context';
import { mastra } from '../mastra';

/**
 * Agent Service Layer
 * Handles all business logic for interacting with the Mastra AI agent
 */
export class AgentService {
  /**
   * Send a chat message to the order support agent and get a response.
   * The userId is passed via RequestContext so tools can securely query
   * only the authenticated user's data.
   * @param userId - Authenticated user's ID
   * @param message - The user's chat message
   * @returns The agent's text response
   */
  async chat(userId: string, message: string): Promise<{ text: string }> {
    const requestContext = new RequestContext<{ userId: string }>();
    requestContext.set('userId', userId);

    const agent = mastra.getAgent('orderAgent');

    const result = await agent.generate(message, {
      requestContext,
      maxSteps: 5,
    });

    return { text: result.text };
  }
}

export const agentService = new AgentService();
