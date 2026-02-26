import { Router } from 'express';
import { knowledgeController } from '@/controllers/knowledge.controller';
import { checkAuthentication } from '@/middlewares/checkAuth';
import { checkAdmin } from '@/middlewares/checkRole';

const router = Router();

/**
 * Knowledge Base Routes
 * All routes are prefixed with /api/knowledge
 */

// POST /api/knowledge/ingest - Ingest a document into the vector knowledge base (Admin only)
router.post('/ingest', checkAuthentication, checkAdmin, knowledgeController.ingest);

export default router;
