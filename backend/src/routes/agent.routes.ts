import { Router } from 'express';
import { agentController } from '../controllers/agent.controller';
import { checkAuthentication } from '@/middlewares/checkAuth';

const router = Router();

/**
 * Agent Routes
 * All routes are prefixed with /api/agent
 * All routes require authentication
 */

// POST /api/agent/chat - Send a message to the order support agent
router.post('/chat', checkAuthentication, agentController.chat);

export default router;
