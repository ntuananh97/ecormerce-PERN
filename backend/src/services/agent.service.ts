import { Response } from 'express';
import { RequestContext } from '@mastra/core/request-context';
import { mastra } from '../mastra';
import type { ConversationMessage, SSEEvent } from '@/types/agent.types';

function sendSSE(res: Response, event: SSEEvent): void {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

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

  /**
   * Stream conversation history to the support agent via SSE.
   * Writes SSE events directly to the Express response:
   *   - 'step'  when a tool is being called
   *   - 'delta' for each text token
   *   - 'done'  when the stream finishes
   *   - 'error' if an error occurs
   * @param userId - Authenticated user's ID (optional)
   * @param messages - Full conversation history from the client
   * @param res - Express Response to write SSE events into
   */
  async chatStream(
    userId: string | undefined,
    messages: ConversationMessage[],
    res: Response,
  ): Promise<void> {
    const requestContext = new RequestContext<{ userId: string }>();
    if (userId) {
      requestContext.set('userId', userId);
    }

    const agent = mastra.getAgent('supportAgent');

    const stream = await agent.stream(messages as Parameters<typeof agent.stream>[0], {
      requestContext,
      maxSteps: 5,
    });

    for await (const chunk of stream.fullStream) {
      if (res.writableEnded) break;

      switch (chunk.type) {
        case 'tool-call':
          sendSSE(res, {
            type: 'step',
            data: { toolName: chunk.payload.toolName, message: `Đang gọi ${chunk.payload.toolName}...` },
          });
          break;
        case 'text-delta':
          sendSSE(res, { type: 'delta', data: { text: chunk.payload.text } });
          break;
        case 'finish':
          sendSSE(res, { type: 'done' });
          break;
        case 'error':
          sendSSE(res, { type: 'error', data: { message: String(chunk.payload.error) } });
          break;
      }
    }
  }
}

export const agentService = new AgentService();
