# ⚡ Distributed Background Job Queue System (Backend)

[![Live Demo](https://img.shields.io/badge/Live_Demo-Render_Cloud-brightgreen?style=for-the-badge&logo=render)](https://redis-job-queue-backend1.onrender.com/api-docs)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/poojasahuu2006-design/redis-job-queue-backend-)
[![Swagger UI](https://img.shields.io/badge/API_Docs-OpenAPI_3.0-85EA2D?style=for-the-badge&logo=swagger)](https://redis-job-queue-backend1.onrender.com/api-docs)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_20-339933?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)
[![Redis](https://img.shields.io/badge/Cache-Redis-DC382D?style=for-the-badge&logo=redis)](https://redis.io)

A robust, enterprise-grade asynchronous background job queuing and worker processing engine built with **Node.js**, **Express.js**, **MongoDB Atlas**, and **Redis**. Designed to handle high-concurrency tasks, background scheduling, job dependencies (DAGs), transient error retries, and dead-letter queues.

---

## 🚀 Live Demo & Interactive Swagger UI

Experience the live API and test queue processing in real-time directly from your browser:

[![Launch Live Demo](https://img.shields.io/badge/🔗_Launch_Live_Demo-Swagger_UI-00C853?style=for-the-badge&logo=swagger&logoColor=white)](https://redis-job-queue-backend1.onrender.com/api-docs)

| Resource | URL | Status |
|---|---|---|
| 🌐 **Live Demo (Interactive Swagger UI)** | [https://redis-job-queue-backend1.onrender.com/api-docs](https://redis-job-queue-backend1.onrender.com/api-docs) | ![Online](https://img.shields.io/badge/Status-Online-brightgreen) |
| 🚀 **API Base URL** | [https://redis-job-queue-backend1.onrender.com](https://redis-job-queue-backend1.onrender.com) | ![Online](https://img.shields.io/badge/Status-Online-brightgreen) |
| 🩺 **System Health Check** | [https://redis-job-queue-backend1.onrender.com/health](https://redis-job-queue-backend1.onrender.com/health) | ![Healthy](https://img.shields.io/badge/Health-200_OK-brightgreen) |

---

## 🧪 30-Second Live Demo Walkthrough

1. **Launch the Live Demo:** Open [**Swagger UI**](https://redis-job-queue-backend1.onrender.com/api-docs).
2. **Create a Job:** Scroll to `POST /api/jobs` → Click **Try it out** → Execute with:
   ```json
   {
     "type": "IMAGE_COMPRESSION_TASK",
     "payload": { "filename": "banner.png", "targetSize": "500kb" },
     "priority": 5,
     "maxAttempts": 3
   }
   ```
3. **Watch the Worker Process:** The worker claims the job using a lease lock, runs step 1 and step 2 idempotently, and marks it `completed`.
4. **Inspect Queue Statistics:** Execute `GET /api/jobs/queueStatus` to see live counts of `pending`, `processing`, `completed`, and `dead` letter items!

---

## ⚙️ Core Architectural Pillars

- **Durable Job Queue & Worker Lease Pattern:** Workers lock claimed tasks using `lockedUntil` time-leases, mathematically preventing race conditions and duplicate processing across concurrent workers.
- **Priority-Based Scheduling:** Jobs with higher priority scores are claimed and executed first.
- **Exponential Backoff Retries:** Failed jobs are automatically retried using exponential backoff ($2^{\text{attempt}}$ seconds) to prevent cascading failures.
- **Dead-Letter Queue (DLQ):** Tasks that exceed `maxAttempts` are moved to a Dead-Letter Queue for analysis and alerting.
- **Step-Level Idempotency:** If a worker crashes midway, subsequent workers resume only the uncompleted steps without repeating prior work.
- **Job Dependency Graph (DAG):** Jobs can declare `dependsOn: [parentId]` so downstream jobs only execute after prerequisite tasks finish successfully.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/jobs` | Enqueue a new task with payload, priority, and retries |
| `GET` | `/api/jobs` | List all jobs with their lifecycle statuses and attempt history |
| `GET` | `/api/jobs/queueStatus` | Inspect queue statistics & Dead Letter Queue (DLQ) |
| `GET` | `/api/jobs/:id` | Fetch details and completed execution steps of a specific job |
| `DELETE` | `/api/jobs/:id` | Cancel and purge a job from the queue |
| `GET` | `/health` | Service health check |

---

## 💻 Local Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/poojasahuu2006-design/redis-job-queue-backend-.git
cd redis-job-queue-backend-
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.kpjsxdz.mongodb.net/job_queue?retryWrites=true&w=majority
# Optional Redis:
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4. Run the Server & Worker
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Swagger docs available locally at: `http://localhost:3000/api-docs`

---

## 👤 Author
- **Pooja Sahu** — [GitHub Profile](https://github.com/poojasahuu2006-design)
