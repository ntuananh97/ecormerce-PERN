import { Response } from 'express';
import { asyncHandler } from '@/middlewares/errorHandler';
import { ExtendedRequest } from '@/types/express';
import { knowledgeService } from '@/services/knowledge.service';
import { BadRequestError } from '@/types/errors';

/**
 * Knowledge Controller Layer
 * Handles HTTP requests and responses for the knowledge base ingest endpoint
 */
export class KnowledgeController {
  /**
   * POST /api/knowledge/ingest
   * Accepts a plain-text document (and optional metadata) from the request body,
   * chunks it, generates embeddings, and stores them in the knowledge_base table.
   * Requires admin authentication.
   */
  ingest = asyncHandler(async (req: ExtendedRequest, res: Response): Promise<void> => {
    const { content, metadata } = req.body as {
      content?: string;
      metadata?: Record<string, unknown>;
    };

    if (!content || typeof content !== 'string' || content.trim() === '') {
      throw new BadRequestError('content is required and must be a non-empty string.');
    }

    if (metadata !== undefined && (typeof metadata !== 'object' || Array.isArray(metadata))) {
      throw new BadRequestError('metadata must be a plain object.');
    }

    const result = await knowledgeService.ingest(content.trim(), metadata);

    res.status(200).json({
      success: true,
      message: 'Document ingested successfully',
      data: {
        chunksCount: result.chunksCount,
      },
    });
  });
}

export const knowledgeController = new KnowledgeController();
