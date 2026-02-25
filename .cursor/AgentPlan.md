# 🚀 E-commerce Smart Support Agent Plan (Updated)

## 🏗 1. Overall Architecture: Modular Monolith
The system will run the Agent as a module within the existing Express TS application to maximize available resources.

- **Backend:** Express TS acts as the Gatekeeper (Auth, Rate Limit) and Orchestrator (Mastra).
- **Agent Framework:** Mastra (coordinates Tools and RAG).
- **State Management:** Stateless API. The entire conversation history will be managed by the Client (Next.js) and sent with each Request.
- **Database:** PostgreSQL integrated with pgvector.

## 📁 2. Proposed Directory Structure (Backend)
This organization makes it easy to separate into Microservices in the future if needed.

```text
backend/
├── src/
│   ├── api/                # Traditional REST API (called by Next.js)
│   │   └── chat/
│   │       └── controller.ts # Receives request, checks Auth, calls Agent
│   ├── services/           # Core business logic (Tools will borrow these)
│   │   ├── order.service.ts
│   │   ├── product.service.ts
│   │   └── user.service.ts
│   ├── agents/             # <--- "HEART" OF THE AGENT (Mastra)
│   │   ├── index.ts        # Initialize Mastra instance & LLM configuration
│   │   ├── tools.ts        # Define Tools (calling the services above)
│   │   ├── prompts.ts      # Manage System Prompts (Tone, rules)
│   │   ├── rag.ts          # Configure Vector Store & RAG logic (pgvector)
│   │   └── workflows.ts    # Define process flows (if complex)
│   └── index.ts            # Express entry point
```

## 🔄 3. Data Flow (Stateless Flow)
1.  **Client (Next.js):** Stores `messages[]` in State. When the User sends a new question, the Client sends the entire `messages[]` to `POST /api/chat`.
2.  **Express Controller:**
    *   JWT Authentication.
    *   Extract `user_id` from Token.
    *   Pass the `messages` array and `user_context` to the Mastra Agent.
3.  **Mastra Agent:**
    *   **Analysis:** Read conversation history to understand context.
    *   **Execution:** Call Tools (in `tools.ts`) to check the DB or call RAG (in `rag.ts`) to lookup FAQs.
    *   **Generation:** Synthesize the answer based on real data collected.
4.  **Output:** Express receives the stream from Mastra and pipes it directly to the Frontend.

## 🛠 4. Detailed Implementation Phases

### Phase 1: Foundation & RAG (Static Knowledge)
- [ ] Enable `pgvector` on the existing PostgreSQL.
- [ ] Setup Mastra in `src/agents/index.ts`.
- [ ] Write script to import FAQ/Policy data into the vector table (Using Mastra RAG).
- [ ] Create the first RAG Tool so the Agent can lookup shop information.

### Phase 2: Dynamic Tools (Real Data Connection)
- [ ] Write Wrapper functions in `src/agents/tools.ts`.
    *   *Example:* `get_order_status` tool will call `OrderService.getById()`.
- [ ] Ensure Security: Tools only access data based on the `user_id` provided by Express, preventing the Agent from querying the entire DB.

### Phase 3: API & Frontend Integration
- [ ] Create `/api/chat` Endpoint to handle the `messages` array.
- [ ] Integrate Vercel AI SDK into Next.js for stream display.
- [ ] (Optional) Save chat history to `localStorage` on the Frontend to persist across refreshes.

## ⚠️ 5. Technical Notes for Stateless Model
*   **Token Window:** Since the entire history is sent, limit the Client to sending at most ~10-15 most recent messages to avoid token overflow and API costs.
*   **Security:** Never allow the Client to send sensitive information like "role: admin" in the conversation array. All permissions must be re-validated by Express.
