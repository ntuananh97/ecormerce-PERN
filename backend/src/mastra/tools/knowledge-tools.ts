import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';
import { prisma } from '../../config/database';

type FAQRow = { content: string; score: number };

/**
 * Tool: searchFAQ
 * Performs semantic (vector) similarity search on the knowledge_base table,
 * filtered to entries where metadata.type = 'FAQ'.
 * Embeds the user's query with the same model used during ingestion
 * (text-embedding-3-small / 1536-dim) then runs a cosine similarity search
 * via pgvector (<=> operator).
 */
export const searchFAQ = createTool({
  id: 'search-faq',
  description:
    'Tìm kiếm câu trả lời cho các câu hỏi về chính sách cửa hàng, FAQ (vận chuyển, đổi trả, thanh toán, bảo hành, ...). Nhận câu hỏi của người dùng, thực hiện tìm kiếm ngữ nghĩa trong cơ sở dữ liệu kiến thức và trả về các đoạn nội dung phù hợp nhất. Không yêu cầu đăng nhập.',
  inputSchema: z.object({
    query: z.string().describe('Câu hỏi hoặc chủ đề chính sách cần tìm kiếm (ví dụ: "chính sách đổi trả", "phí vận chuyển")'),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        content: z.string(),
        score: z.number(),
      }),
    ),
    total: z.number(),
  }),
  execute: async (inputData) => {
    // 1. Embed the user's query using the same model as ingestion
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: inputData.query,
    });

    const vectorLiteral = `[${embedding.join(',')}]`;

    // 2. Cosine similarity search via pgvector, filtered to FAQ entries only
    const rows = await prisma.$queryRawUnsafe<FAQRow[]>(
      `SELECT content, 1 - (embedding <=> $1::vector) AS score
       FROM knowledge_base
       WHERE metadata->>'type' = 'FAQ'
       ORDER BY embedding <=> $1::vector
       LIMIT 3`,
      vectorLiteral,
    );

    return {
      results: rows.map((r) => ({
        content: r.content,
        score: Number(r.score),
      })),
      total: rows.length,
    };
  },
});
