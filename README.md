# 🚀 Shopify AI Search & Recommendation App

A production-grade Shopify embedded app built with **Remix**, designed for **mid-market merchants (500–50,000 SKUs)** to deliver:

* AI-powered product recommendations (via external APIs)
* Intent-based search
* Dynamic admin-controlled filters & sorting UI
* Anonymous user behavior tracking
* Scalable infrastructure (queue + cache + workers)

---

# 📌 Table of Contents

1. High-Level Architecture
2. Technical Philosophy & Rules
3. Core Feature: Filters & Sorting Engine
4. Directory Structure
5. Local Setup & Environment
6. Data Flow Patterns
7. Testing Strategy
8. Deployment Pipeline
9. Common Gotchas

---

# 1️⃣ High-Level Architecture

## 🧩 System Components

### 🔹 Shopify Layer

* Admin API (products, webhooks)
* OAuth authentication
* Theme App Extension (storefront integration)

---

### 🔹 Core Application

#### A. Remix Server

* Handles OAuth flow
* Provides Admin UI (filters, sorting)
* Exposes APIs for storefront

#### B. Worker System

* Processes background jobs:

  * Product sync
  * AI API calls
  * Cache generation

#### C. Data Layer

* PostgreSQL → primary database
* Redis → caching + queue system

---

### 🔹 External AI APIs

* Used only for:

  * Recommendations
  * Search intent parsing
* App acts as a **consumer only**

---

### 🔹 Storefront Layer

* Theme App Extension renders:

  * Recommendations
  * Search results
  * Filters UI
  * Sorting UI

---

# 2️⃣ Technical Philosophy & Rules

## ⚡ Rule 1: API-First Architecture

All logic must be exposed via APIs.
Frontend should never access DB directly.

---

## ⚡ Rule 2: Async Over Sync

Avoid blocking operations:

* AI calls
* Product sync

Use queues and background workers.

---

## ⚡ Rule 3: Aggressive Caching

Cache:

* AI responses
* Search results
* Recommendations
* Filter configurations

---

## ⚡ Rule 4: Idempotency

All operations must be safe to repeat:

* Webhooks
* Jobs

---

## ⚡ Rule 5: Anonymous-First Tracking

Do not depend on login:

* Use session IDs (cookies/localStorage)

---

## ⚡ Rule 6: Graceful Failure

If AI fails:

* Return fallback results
* Never break UI

---

# 3️⃣ Core Feature: Filters & Sorting Engine

## 🧠 Overview

This app includes a **Dynamic Filter & Sorting System** fully controlled by the merchant via the admin panel.

This system has 3 layers:

1. Admin Configuration
2. Backend Query Engine
3. Storefront Dynamic UI

---

## 🔹 Admin-Defined Filters

Merchants can create filters based on:

* Color
* Size
* Material
* Brand
* Price range
* Custom metafields

---

### 📊 Example Config

```json
{
  "name": "Color",
  "field": "tags",
  "type": "multi-select",
  "ui": "checkbox",
  "values": ["red", "blue", "black"]
}
```

---

## 🔹 Backend Filter Engine

Converts user input → database query

Example:

User selects:

* Color = red
* Price < 2000

Query:

```sql
WHERE tags CONTAINS 'red'
AND price < 2000
```

---

## 🔹 Sorting Engine

Admins can define sorting strategies:

* Price (low → high, high → low)
* Newest
* Popularity (based on events)
* Custom ranking (future scope)

---

### 🔄 Sorting Flow

```
Filtered Results → Apply Sorting → Return Final Results
```

---

## 🎨 Dynamic Storefront UI

Filters and sorting are **NOT hardcoded**.

---

### 🔄 UI Flow

1. Theme extension loads container
2. Fetch filter config from API
3. Render UI dynamically
4. Apply filters → call search API

---

### 🔌 Example API

```
GET /api/filters
GET /api/sorting
POST /api/search
```

---

### 🧠 Key Principle

> UI is generated dynamically from backend config

---

## 🔄 End-to-End Flow

```
Admin creates filters → Stored in DB
        ↓
Storefront fetches config → renders UI
        ↓
User selects filters → API request
        ↓
Backend builds query → applies sorting
        ↓
Results returned → UI updates
```

---

## 🗄️ Database Additions

### 📊 Filters Table

```
id
store_id
name
field
type
ui_type
values (JSON)
position
is_active
```

---

### 📊 Sorting Table

```
id
store_id
name
label
field
order
position
is_active
```

---

# 4️⃣ Directory Structure

```
/app
  /routes
    auth.login.jsx
    auth.callback.jsx
    dashboard.jsx
    api.recommendations.js
    api.search.js
    api.filters.js
    api.sorting.js

  /services
    shopify.server.js
    product.service.js
    recommendation.service.js
    search.service.js
    ai.service.js
    filter.service.js
    sorting.service.js

  /models
    product.model.js
    event.model.js
    filter.model.js
    sorting.model.js
    store.model.js

  /workers
    productSync.worker.js
    aiProcessing.worker.js

  /queues
    queue.js

  /utils
    logger.js
    cache.js
    session.js

  /components
    AdminUI/
    Shared/

/extensions
  /theme-app-extension
    /blocks
      recommendation.liquid
      search.liquid
      filters.liquid
      sorting.liquid

/prisma
  schema.prisma

/config
  redis.js
  db.js

/env
  .env
```

---

# 5️⃣ Local Setup & Environment

## 🔧 Requirements

* Node.js (LTS)
* PostgreSQL
* Redis
* Shopify CLI

---

## 🔑 Environment Variables Example

```
SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=
SHOPIFY_SCOPES=

DATABASE_URL=
REDIS_URL=

AI_API_URL=
AI_API_KEY=

APP_URL=
```

---

## ⚙️ Setup Steps

1. Create Shopify app using CLI
2. Setup PostgreSQL database
3. Setup Redis instance
4. Run database migrations
5. Start development server

---

## ⚠️ Notes

* Use ngrok or Cloudflare tunnel for HTTPS
* Shopify requires secure callback URLs

---

# 6️⃣ Data Flow Patterns

## 🔄 Product Sync Flow

```
Shopify → Webhook → Queue → Worker → Database
```

---

## 🔍 Search Flow

```
User → Storefront → API → Cache → AI → Cache → Response
```

---

## 🎯 Recommendation Flow

```
User Events → API → Cache → AI → Cache → Response
```

---

## 👣 Tracking Flow

```
User → Theme Script → Event API → Database
```

---

## 🎛️ Filter + Sorting Flow

```
User Input / AI Intent
        ↓
Map to Filters
        ↓
Build Query
        ↓
Apply Sorting
        ↓
Return Results
```

---
