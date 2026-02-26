import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

/**
 * Tool: searchProducts
 * Searches for active products by name keyword and returns up to 3 candidates
 * including full stock information. Sufficient for a single-step stock lookup.
 */
export const searchProducts = createTool({
  id: 'search-products',
  description:
    'Tìm kiếm sản phẩm theo tên. Trả về tối đa 3 sản phẩm phù hợp bao gồm tên, giá, danh mục và số lượng tồn kho. Không yêu cầu đăng nhập.',
  inputSchema: z.object({
    keyword: z.string().describe('Từ khóa tên sản phẩm cần tìm kiếm'),
  }),
  outputSchema: z.object({
    products: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(),
        stock: z.number(),
        categoryName: z.string().nullable(),
      }),
    ),
    total: z.number(),
  }),
  execute: async (inputData) => {
    const where: Prisma.ProductWhereInput = {
      name: { contains: inputData.keyword, mode: 'insensitive' },
      status: 'active',
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take: 3,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          category: { select: { name: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        stock: p.stock,
        categoryName: p.category?.name ?? null,
      })),
      total,
    };
  },
});

/**
 * Tool: checkProductStock
 * Retrieves full stock information for a specific product by ID.
 * Use when the user provides or selects a specific product ID directly.
 */
export const checkProductStock = createTool({
  id: 'check-product-stock',
  description:
    'Kiểm tra tình trạng tồn kho của một sản phẩm cụ thể theo ID. Trả về đầy đủ thông tin bao gồm số lượng tồn kho và tình trạng còn hàng/hết hàng. Không yêu cầu đăng nhập.',
  inputSchema: z.object({
    productId: z.string().describe('ID của sản phẩm cần kiểm tra tồn kho'),
  }),
  outputSchema: z.object({
    found: z.boolean(),
    product: z
      .object({
        id: z.string(),
        name: z.string(),
        price: z.number(),
        stock: z.number(),
        inStock: z.boolean(),
        categoryName: z.string().nullable(),
      })
      .nullable(),
  }),
  execute: async (inputData) => {
    const product = await prisma.product.findUnique({
      where: { id: inputData.productId, status: 'active' },
      include: { category: { select: { name: true } } },
    });

    if (!product) {
      return { found: false, product: null };
    }

    return {
      found: true,
      product: {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        stock: product.stock,
        inStock: product.stock > 0,
        categoryName: product.category?.name ?? null,
      },
    };
  },
});
