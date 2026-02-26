import { MDocument } from '@mastra/rag';
import { embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { prisma } from '@/config/database';
import { randomUUID } from 'crypto';

/**
 * Knowledge Service Layer
 * Handles document ingestion: chunking, embedding, and storage into pgvector
 */
export class KnowledgeService {
  /**
   * Ingest a text document into the knowledge base.
   * The text is split into chunks, each chunk is embedded via OpenAI,
   * then every (chunk, embedding) pair is inserted into the knowledge_base table.
   *
   * @param content - Raw text content of the document
   * @param metadata - Optional JSON metadata (source, tags, etc.)
   * @returns Number of chunks inserted
   */
  async ingest(content: string, metadata?: Record<string, unknown>): Promise<{ chunksCount: number }> {
    // 1. Chunk the document using Mastra's MDocument with recursive strategy
    const doc = MDocument.fromText(content);
    const chunks = await doc.chunk({
      strategy: 'recursive',
      maxSize: 512,
      overlap: 50,
      separators: ['\n\n', '\n', ' '],
    });

    if (chunks.length === 0) {
      return { chunksCount: 0 };
    }

    // 2. Generate embeddings for all chunks using Vercel AI SDK + OpenAI
    const { embeddings } = await embedMany({
      model: openai.embedding('text-embedding-3-small'),
      values: chunks.map((chunk) => chunk.text),
    });

    // 3. Insert each (chunk, embedding) pair into knowledge_base via raw SQL
    //    Prisma does not support the Unsupported("vector(1536)") type in create operations.
    const metadataJson = metadata ? JSON.stringify(metadata) : null;

    await Promise.all(
      chunks.map((chunk, i) => {
        const vectorLiteral = `[${embeddings[i].join(',')}]`;
        const id = randomUUID();

        return prisma.$executeRawUnsafe(
          `INSERT INTO knowledge_base (id, embedding, metadata, content, created_at)
           VALUES ($1, $2::vector, $3::jsonb, $4, NOW())`,
          id,
          vectorLiteral,
          metadataJson,
          chunk.text,
        );
      }),
    );

    return { chunksCount: chunks.length };
  }
}

export const knowledgeService = new KnowledgeService();
