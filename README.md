# Reliable Job Queue with Dead-Letter Recovery

A robust, highly available background job processing engine built with Node.js, Express, and MongoDB. This engine is designed to handle complex background tasks with maximum reliability, ensuring that jobs survive server crashes and execute in the correct order.

## Core Features

- **Durable Queue**: Backed by MongoDB to ensure jobs survive application crashes.
- **Lease Pattern (Visibility Timeout)**: Guarantees exactly-once processing by locking jobs. If a worker crashes mid-job, the lock expires and another worker safely takes over.
- **Priority & Scheduled Execution**: Processes jobs based on priority weight and future scheduled timestamps.
- **Exponential Backoff**: Automatically retries failed jobs with increasing delays (2s, 4s, 8s...) to allow external dependencies time to recover.
- **Dead-Letter Queue (DLQ)**: Jobs that exceed max retries are moved to a DLQ for developer inspection.
- **Idempotency**: Safely resumes partially completed jobs without duplicating side-effects (e.g., charging a credit card twice).
- **Job Dependencies**: Supports complex pipelines where Job B will automatically wait in the queue until Job A has successfully completed.

## Technologies Used
- Node.js
- Express.js
- MongoDB & Mongoose
- UUID (for worker identification)

## Setup & Installation

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure your environment variables in a `.env` file (MongoDB URI, etc).
3. Start the server (which also starts the background worker):
   ```bash
   npm run dev
   ```

## API Reference

### 1. Create a Job
**Endpoint:** `POST /api/jobs/`

**Request Body:**
```json
{
  "type": "send_welcome_email",
  "payload": {
    "userId": "12345",
    "email": "test@example.com",
    "fail_once": true 
  },
  "priority": 10,
  "dependsOn": [] 
}
```
*Note: Passing `fail_once: true` in the payload will force the worker to simulate a crash on the first attempt to demonstrate exponential backoff.*

### 2. Inspect Queue Status
**Endpoint:** `GET /api/jobs/queueStatus`

Returns the real-time counts of pending, processing, completed, and dead jobs, alongside the most recent dead-letter logs.

### 3. Get All Jobs
**Endpoint:** `GET /api/jobs/`

### 4. Get Job By ID
**Endpoint:** `GET /api/jobs/:id`

### 5. Delete Job By ID
**Endpoint:** `DELETE /api/jobs/:id`

## Architecture: How the Worker Functions
When the server starts, a `workerId` is generated using UUID. The worker enters an infinite polling loop. It uses MongoDB's `findOneAndUpdate` to atomically search for the highest priority job that is due to run, and immediately sets `lockedBy` to its `workerId` and `lockedUntil` to 5 minutes in the future. If a dependency check fails, the job is unlocked and delayed. If an error is thrown during processing, the worker increments the attempt counter and sets the next `scheduledAt` time using exponential backoff logic.
