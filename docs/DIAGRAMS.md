# RozgarSetu diagrams (DFD, architecture, user stories, classes)

This page collects **Level 0 / Level 1 data flow**, **system architecture**, **user-oriented views**, and **domain class** diagrams. Narrative detail lives in [ARCHITECTURE.md](ARCHITECTURE.md); run instructions are in the [root README](../README.md).

Notation: diagrams use [Mermaid](https://mermaid.js.org/) (renders on GitHub and many Markdown viewers).

---

## 1. Data flow diagram — Level 0 (context)

Level 0 shows the system as **one process** (`0`) with **external entities** and **data stores**. Arrows are labeled with the main data moved (requests, JSON, files).

```mermaid
flowchart TB
  subgraph entities [External entities]
    E1[Client]
    E2[Worker]
    E3[Admin]
    E4[External services]
  end
  P0(["0 RozgarSetu System"])
  DS1[("D1 MongoDB")]
  DS2[("D2 RS-bot datasets and models")]

  E1 <-->|"HTTPS JSON UI API"| P0
  E2 <-->|"HTTPS JSON UI API"| P0
  E3 <-->|"HTTPS JSON admin API"| P0
  P0 <-->|"persist users jobs applications reviews"| DS1
  P0 <-->|"load workers jobs CSV caches ML"| DS2
  P0 <-->|"optional images"| E4
  P0 <-->|"optional maps geocode"| E4
```

| Symbol | Meaning |
|--------|---------|
| **Client / Worker / Admin** | People using the React app in the browser (different roles and routes). |
| **0 RozgarSetu System** | The combined frontend, Node API, and RS-bot behavior seen as one system boundary. |
| **D1 MongoDB** | Authoritative data for users, workers, jobs, applications, reviews, admins. |
| **D2 RS-bot datasets** | Files under `RS-bot/` used for recommendations and NLP (not the primary OLTP store). |
| **External services** | Optional: Cloudinary (images), Maps/geocoding APIs (assistant). |

---

## 2. Data flow diagram — Level 1

Level 1 **decomposes process 0** into major subprocesses. Data stores are numbered for traceability to Level 0.

```mermaid
flowchart TB
  subgraph p [Processes]
    P1["1.1 Auth and profiles"]
    P2["1.2 Worker discovery and detail"]
    P3["1.3 Jobs applications hiring"]
    P4["1.4 Reviews"]
    P5["1.5 Admin operations"]
    P6["1.6 Assistant and ML RS-bot"]
  end

  DS1[("D1 MongoDB collections")]
  DS2[("D2 Bot files and in-memory models")]

  P1 <-->|"User Worker Admin"| DS1
  P2 <-->|"Worker User"| DS1
  P3 <-->|"Job Application"| DS1
  P4 <-->|"Review"| DS1
  P5 <-->|"Admin audit"| DS1
  P6 <-->|"read recommend"| DS2
  P6 -.->|"optional enrich"| DS1

  P1 <--> P2
  P2 <--> P3
  P3 <--> P4
  P5 <--> P1
  P5 <--> P2
  P6 <--> P2
```

| Process | Typical flows |
|---------|----------------|
| **1.1** | Register, login, JWT cookies, profile updates for client/worker/admin. |
| **1.2** | List/search workers, filters, worker detail pages. |
| **1.3** | Post jobs, applications, status, hire linkage. |
| **1.4** | Submit and list reviews tied to worker and client. |
| **1.5** | Admin dashboard, managed entities (depends on your routes). |
| **1.6** | Natural language, recommendations, map features; may read worker-like data from D2; UI on `/assistant`. |

The dashed line suggests optional alignment between ML recommendations and MongoDB-backed worker records (deployment-specific).

---

## 3. System architecture diagram (layers)

Layered view complements the component diagram in [ARCHITECTURE.md](ARCHITECTURE.md#high-level-system-context).

```mermaid
flowchart TB
  subgraph presentation [Presentation layer]
    SPA[React SPA Router Redux]
    Vite[Vite dev server or static host]
  end
  subgraph application [Application layer]
    NodeAPI[Express REST /api/v1]
    BotAPI[FastAPI RS-bot]
  end
  subgraph data [Data layer]
    Mongo[(MongoDB)]
    Files[CSV caches pickles RS-bot]
  end
  subgraph external [External integrations]
    Cloud[Cloudinary]
    Maps[Maps geocoding]
  end

  SPA --> Vite
  SPA -->|"/api/v1 proxy"| NodeAPI
  SPA -->|"/rs-bot-proxy"| BotAPI
  NodeAPI --> Mongo
  NodeAPI --> Cloud
  BotAPI --> Files
  BotAPI --> Maps
```

---

## 4. User stories and journeys

### 4.1 User story map (by persona)

High-level **“As a … I want … so that …”** themes grouped by actor.

```mermaid
mindmap
  root((RozgarSetu))
    Client
      Register and log in
      Browse and filter workers
      View worker details and history
      Book or apply and track status
      Leave reviews
    Worker
      Register and log in
      Maintain profile and availability
      See clients and applications
    Admin
      Secure dashboard access
      Manage users and workers
    Any authenticated user
      Open AI assistant for natural search
```

### 4.2 Example client journey (simplified)

```mermaid
journey
  title Client path from landing to hire intent
  section Discover
    Open home page: 5: Client
    Browse workers with filters: 4: Client
    Open worker description: 5: Client
  section Act
    Log in or sign up: 3: Client
    Start booking or application flow: 4: Client
```

---

## 5. Domain class diagram (MongoDB / Mongoose)

Reflects `website/BE_Proj-main/backend/models/`. Types are conceptual; ObjectIds are MongoDB references.

```mermaid
classDiagram
  class User {
    +String fullname
    +Number phoneNumber
    +String email
    +String password
    +String address
    +String city
    +Number pincode
    +String profilePhoto
  }
  class Worker {
    +String fullname
    +Number phoneNumber
    +String password
    +String skills
    +String address
    +String city
    +Number pincode
    +String avaliability
    +Number experienceYears
    +String profilePhoto
  }
  class Admin {
    +String fullname
    +String email
    +String password
  }
  class Job {
    +String title
    +String description
    +String requirements
    +Number salary
    +String location
    +String jobType
    +ObjectId createdBy
    +ObjectId workerHired
    +ObjectId[] applications
  }
  class Application {
    +ObjectId client
    +ObjectId worker
    +Date bookingDate
    +String status
  }
  class Review {
    +ObjectId worker
    +ObjectId client
    +Number rating
    +String comment
  }

  User "1" --> "*" Job : creates
  User "1" --> "*" Application : client
  Worker "1" --> "*" Application : worker
  Job "0..1" --> "1" Worker : workerHired
  Job "*" --> "*" Application : applications
  User "1" --> "*" Review : client
  Worker "1" --> "*" Review : worker
```

**Notes:**

- `Job.applications` stores references to `Application` documents.
- `Application` links a **client** (`User`) and **worker** (`Worker`) directly; hiring flows may also update `Job.workerHired`.
- `Admin` is separate from `User` / `Worker` (admin auth is its own route namespace).

---

## 6. Frontend state model (Redux slices)

Not a database schema, but a **structural** view of client-side state in `frontend/src/redux/`.

```mermaid
classDiagram
  class authSlice {
    +user
    +loading
  }
  class workSlice {
    +allWorkers
    +singleWorker
    +searchWorkerByText
    +searchQuery
    +browseFilters
  }
  class applicationSlice {
    +applicants
    +clientHires
  }
  class reviewSlice {
    +reviews
    +avgRating
    +loading
  }
  class store {
    +auth
    +work
    +application
    +review
  }
  store *-- authSlice
  store *-- workSlice
  store *-- applicationSlice
  store *-- reviewSlice
```

---

## Related documents

| Document | Content |
|----------|---------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Component behavior, routes, APIs, RS-bot endpoints |
| [../README.md](../README.md) | How to run backend, frontend, and RS-bot |
