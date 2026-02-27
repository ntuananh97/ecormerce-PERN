# API Documentation

This document provides a comprehensive list of all available API endpoints in the backend. All routes are prefixed with `/api`.

## Table of Contents
- [General](#general)
- [Authentication](#authentication)
- [Users](#users)
- [Projects](#projects)
- [Categories](#categories)
- [Products](#products)
- [Cart](#cart)
- [Checkout](#checkout)
- [Payments](#payments)
- [AI Agent](#ai-agent)
- [Knowledge Base](#knowledge-base)

---

## General

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check endpoint to verify server status. |

## Authentication (`/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/register` | Register a new user account. | No |
| `POST` | `/login` | Authenticate user and receive access/refresh tokens. | No |
| `POST` | `/logout` | Invalidate current user session and logout. | No |
| `POST` | `/refresh-token` | Refresh the authentication token using a refresh token. | No |
| `GET` | `/me` | Get information about the currently authenticated user. | Yes |

## Users (`/users`)

| Method | Endpoint | Description | Auth Required | Admin Only |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/` | Get a list of all users (paginated). | Yes | Yes |
| `GET` | `/me` | Get profile details of the currently logged-in user. | Yes | No |
| `PUT` | `/me` | Update current user's profile information. | Yes | No |
| `PUT` | `/me/change-password` | Change password for the current user. | Yes | No |
| `GET` | `/:id` | Get detailed information about a specific user by ID. | Yes | Yes |
| `POST` | `/` | Create a new user account. | Yes | Yes |
| `PUT` | `/:id` | Update information for a specific user. | Yes | Yes |
| `PUT` | `/:id/change-status` | Enable or disable a user account. | Yes | Yes |
| `PUT` | `/:id/delete` | Soft delete a user account (marks as deleted). | Yes | Yes |
| `DELETE` | `/:id` | Permanently delete a user account from the database. | Yes | Yes |

## Projects (`/projects`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/` | Get all projects owned by the authenticated user (paginated). | Yes |
| `POST` | `/` | Create a new project. | Yes |
| `PUT` | `/:id` | Update an existing project (owner only). | Yes |
| `DELETE` | `/:id` | Delete a project (owner only). | Yes |

## Categories (`/categories`)

| Method | Endpoint | Description | Auth Required | Admin Only |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/` | Get all product categories (paginated). | No | No |
| `GET` | `/:id` | Get details of a specific category by ID. | No | No |
| `POST` | `/` | Create a new category. | Yes | Yes |
| `PUT` | `/:id` | Update an existing category. | Yes | Yes |
| `DELETE` | `/:id` | Delete a category. | Yes | Yes |

## Products (`/products`)

| Method | Endpoint | Description | Auth Required | Admin Only |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/` | Get all products with filtering and pagination. | No | No |
| `GET` | `/:id` | Get details of a specific product by ID. | No | No |
| `POST` | `/` | Create a new product. | Yes | Yes |
| `POST` | `/multiple` | Bulk create multiple products. | Yes | Yes |
| `PUT` | `/:id` | Update an existing product. | Yes | Yes |
| `DELETE` | `/:id` | Delete a product. | Yes | Yes |

## Cart (`/carts`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/me` | Retrieve the authenticated user's shopping cart. | Yes |
| `POST` | `/items` | Add a product item to the shopping cart. | Yes |
| `PUT` | `/items/:id` | Update the quantity of an item in the cart. | Yes |
| `DELETE` | `/items/:id` | Remove a specific item from the shopping cart. | Yes |

## Checkout (`/checkout`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/` | Initialize a checkout session. | Yes |
| `POST` | `/create-order` | Create an order from the current items in the cart. | Yes |
| `GET` | `/orders` | Get a list of orders for the authenticated user. | Yes |
| `GET` | `/orders/:id` | Get detailed information for a specific order. | Yes |

## Payments (`/payments`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/` | Create and process a payment for an order. | Yes |
| `GET` | `/:id/status` | Retrieve the current status of a payment. | Yes |

## AI Agent (`/agent`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/chat` | Chat with the AI agent. Returns a full JSON response after processing completes. | Optional |
| `POST` | `/chat/stream` | Chat with the AI agent via Server-Sent Events (SSE). Streams intermediate tool steps and text tokens in real-time. | Optional |

### POST `/agent/chat`

**Request body:**
```json
{
  "messages": [
    { "role": "user", "content": "Đơn hàng của tôi đâu?" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Response from agent",
  "data": {
    "text": "Tôi tìm thấy 2 đơn hàng của bạn..."
  }
}
```

### POST `/agent/chat/stream`

Streams a `text/event-stream` response. Each event is a JSON object wrapped in SSE format (`data: <JSON>\n\n`).

**Request body:** same as `/agent/chat`.

**SSE Event types:**

| `type` | Payload | Description |
| :--- | :--- | :--- |
| `step` | `{ toolName: string, message: string }` | A tool is being called (intermediate status). |
| `delta` | `{ text: string }` | A single text token of the final answer. |
| `done` | — | Stream has finished successfully. |
| `error` | `{ message: string }` | An error occurred during processing. |

**Example stream:**
```
data: {"type":"step","data":{"toolName":"searchProducts","message":"Đang gọi searchProducts..."}}

data: {"type":"delta","data":{"text":"Tôi"}}

data: {"type":"delta","data":{"text":" tìm"}}

data: {"type":"done"}
```

## Knowledge Base (`/knowledge`)

Endpoints for managing the RAG vector knowledge base used by the AI agent.

| Method | Endpoint | Description | Auth Required | Admin Only |
| :--- | :--- | :--- | :---: | :---: |
| `POST` | `/ingest` | Ingest a text document into the vector knowledge base. | Yes | Yes |

### POST `/knowledge/ingest`

Accepts a plain-text document, splits it into chunks, generates 1536-dim embeddings via OpenAI `text-embedding-3-small`, and stores each chunk with its embedding vector in the `knowledge_base` table (pgvector).

**Request body:**
```json
{
  "content": "Your document text here...",
  "metadata": { "source": "return-policy", "tags": ["returns", "shipping"] }
}
```

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `content` | `string` | Yes | The raw text of the document to be ingested. |
| `metadata` | `object` | No | Arbitrary JSON metadata attached to every chunk (e.g. source, tags). |

**Response:**
```json
{
  "success": true,
  "message": "Document ingested successfully",
  "data": {
    "chunksCount": 12
  }
}
```
