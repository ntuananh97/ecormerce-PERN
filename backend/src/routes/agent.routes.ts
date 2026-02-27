import { Router } from 'express';
import { agentController } from '../controllers/agent.controller';
import { optionalAuthentication } from '@/middlewares/checkAuth';

const router = Router();

/**
 * Agent Routes
 * All routes are prefixed with /api/agent
 * Authentication is optional: authenticated users can access all features
 * (order lookup + product search), unauthenticated users can only use
 * public features (product stock lookup).
 */

// POST /api/agent/chat - Send a message to the support agent (REST, returns full JSON)
router.post('/chat', optionalAuthentication, agentController.chat);

// POST /api/agent/chat/stream - Stream a support agent response via SSE
router.post('/chat/stream', optionalAuthentication, agentController.chatStream);

export default router;
