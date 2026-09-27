# 🏛️ NyaySetu (न्यायसेतु)
### *A Transparent Civic Redressal, Public Petition & AI Legal Intelligence Platform*

[![Next.js](https://img.shields.io/badge/Next.js-16.2.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Groq AI](https://img.shields.io/badge/AI-Groq%20LLaMA%203.1-F55036?style=for-the-badge&logo=meta)](https://groq.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Storage-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

## 📌 Executive Summary

**NyaySetu (न्यायसेतु — "Bridge of Justice")** is a civic-tech and legal-empowerment platform built to eliminate bureaucratic bottlenecks, empower citizens, and bridge the trust deficit between residents and municipal authorities in India.

Traditional grievance portals are often one-way black holes where complaints languish indefinitely without accountability or proof. NyaySetu re-engineers civic engagement into a structured **two-tier resolution framework**:
1. **Private Redressal Desk**: Formal complaints routed directly to verified local government departments (Municipal Corporation, Electricity Boards, PWD, Water & Sanitation) with SLA tracking and mandatory resolution proof.
2. **Public Civic Petitions Layer**: When individual requests fail to move administrative gears, citizens can rally collective community pressure through verified civic petitions, signature thresholds, and public victory declarations.
3. **NyayMitra AI Legal Assistant**: An integrated legal copilot powered by Groq LLaMA and legal retrieval systems that helps citizens decode Indian laws (BNS/IPC, RTI Act, Consumer Protection, Municipal Bylaws) and draft legally coherent petitions.

---

## 📑 Table of Contents

- [Core Value Proposition](#-core-value-proposition)
- [Key Features](#-key-features)
- [System Architecture & Workflow](#-system-architecture--workflow)
- [Folder Structure](#-folder-structure)
- [Technology Stack](#-technology-stack)
- [Environment Variables](#-environment-variables)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Database Seeding & Test Credentials](#-database-seeding--test-credentials)
- [API Routes Reference](#-api-routes-reference)
- [Security & Access Control](#-security--access-control)
- [Roadmap & Future Enhancements](#-roadmap--future-enhancements)
- [Contributing & License](#-contributing--license)

---

## 💡 Core Value Proposition

| Traditional Civic Portals | NyaySetu Platform |
| :--- | :--- |
| ❌ Opaque complaint queues with zero status visibility | ✅ **Real-time Status Timelines** with officer audit logs |
| ❌ "Closed" tickets with no verification or proof | ✅ **Mandatory Proof-of-Resolution** (images, reports) required to close issues |
| ❌ Isolated citizen grievances without community leverage | ✅ **Seamless Escalation** to public community petitions with verified signatures |
| ❌ Complex legal and administrative jargon | ✅ **AI-Powered Legal Copilot & Petition Drafting** with Indian Kanoon context |
| ❌ Scattered, unverified authority contact channels | ✅ **Pre-seeded, Category-Mapped Authority Desks** with direct assignment |

---

## 🚀 Key Features

### 1. 📋 Private Grievance Redressal Desk
- **Auto-Routed Assignment**: Complaints are automatically or manually categorized and mapped to the appropriate municipal department (e.g., PSPCL for Electricity, MC for Sanitation & Streetlights, PWD for Roads).
- **Evidence Attachment**: Support for multi-file evidence upload (photos of potholes, broken streetlights, sewage leaks).
- **Whistleblower / Anonymous Mode**: Citizens can submit grievances privately without exposing their identity on public dashboards.
- **Community Upvoting & Support**: Fellow residents facing the same civic problem can hit "Support", aggregating civic weight without duplicating tickets.

### 2. ✊ Public Civic Petitions Layer
- **Community Mobilization**: Convert stalled grievances into high-impact public petitions or initiate grassroots civic campaigns.
- **One-Click Verified Signatures**: Citizens sign petitions with daily anti-spam limits (`petitionsTodayCount`, `petitionsSignedTodayCount`).
- **Milestone & Victory Tracking**: Track signature counts against community targets, declare civic victories, and link resolved grievances back to petitions.
- **Rich Media & Social Sharing**: Custom thumbnails, tags, and category filters for city-wide discovery.

### 3. 🤖 AI Legal Copilot & Petition Drafting
- **AI Petition Assistant**: Powered by Groq (`llama-3.1-8b-instant`), taking unstructured citizen thoughts and transforming them into structured, formal civic petitions (Introduction, Detailed Explanation, Evidence Summary, Legal Recourse, Call to Action).
- **NyayMitra Legal Advisor**: Connects with Indian Legal RAG knowledge engines to cite relevant statutes (RTI Act 2005, Municipal Corporation Acts, Consumer Protection Act 2019, IPC/BNS sections) and advise citizens on next legal steps.

### 4. 👥 Role-Based Dashboards
- **Citizen Dashboard**:
  - Track active grievances, pending petitions, and signature activity.
  - Quick action to create complaints, launch petitions, or consult the AI assistant.
  - Interactive profile and personal history stats.
- **Authority / Admin Dashboard**:
  - Filter incoming issues by category, priority, and status (`reported`, `in_progress`, `resolved`).
  - Update ticket progression with mandatory notes.
  - Upload photographic resolution proof before closing cases.

---

## 🏗️ System Architecture & Workflow

```mermaid
flowchart TD
    subgraph Citizens["🧑‍🤝‍🧑 Citizen Tier"]
        C1[Citizen Registration / Login]
        C2[File Private Grievance]
        C3[Draft / Sign Civic Petition]
        C4[Consult NyayMitra AI Legal Assistant]
    end

    subgraph Platform["⚡ NyaySetu Core Engine (Next.js 16 + App Router)"]
        AUTH[Auth Engine: JWT + Firebase Auth]
        ROUTER[Authority Dispatch & Ticket Engine]
        PETITION[Petition & Signature Aggregator]
        AI_SVC[Groq LLM & Legal RAG Pipeline]
    end

    subgraph Database["💾 Data & Storage Layer"]
        MDB[(MongoDB Atlas - Mongoose 9)]
        UT[UploadThing / Firebase Storage]
    end

    subgraph Authorities["🏛️ Authority Tier"]
        A1[Authority Dashboard]
        A2[Review In-Progress Issues]
        A3[Submit Resolution Proof & Close Ticket]
    end

    C1 --> AUTH
    C2 --> ROUTER
    C3 --> PETITION
    C4 --> AI_SVC

    ROUTER --> MDB
    PETITION --> MDB
    AUTH --> MDB
    C2 -. Evidence Upload .-> UT

    ROUTER --> A1
    A1 --> A2
    A2 --> A3
    A3 --> ROUTER
```

### Grievance Lifecycle

```text
  [ Reported ] ──> [ In Progress ] ──> [ Resolved ]
       │                 │                    │
       │                 ▼                    ▼
       └── Assigned to Authority     Proof & Resolution Note
           (MC, PSPCL, PWD, etc.)       Logged to Timeline
```

---

## 📂 Folder Structure

```text
nyaysetu/
├── .env.local                  # Environment variables (Mongo, Firebase, Groq, JWT)
├── next.config.mjs             # Next.js configuration
├── package.json                # Project dependencies & npm scripts
├── postcss.config.mjs          # PostCSS configuration with Tailwind CSS v4
├── public/                     # Static assets (favicons, SVG illustrations, logos)
└── src/
    ├── app/                    # Next.js App Router (pages and API endpoints)
    │   ├── (auth)/             # Authentication route group
    │   │   ├── forgot-password/# Password recovery flow
    │   │   ├── login/          # Citizen & Authority login
    │   │   └── register/       # Citizen onboarding
    │   │
    │   ├── api/                # Backend API Routes
    │   │   ├── ai/
    │   │   │   ├── legal-advice/     # NyayMitra Legal RAG assistant route
    │   │   │   └── petition-assist/  # Groq LLaMA petition drafter route
    │   │   ├── auth/
    │   │   │   ├── login/            # JWT authentication & session issuance
    │   │   │   ├── logout/           # Cookie invalidation
    │   │   │   ├── me/               # Current authenticated user profile
    │   │   │   ├── profile/          # Profile retrieval & update
    │   │   │   └── register/         # User registration with password hashing
    │   │   ├── grievances/
    │   │   │   ├── route.js          # GET grievances / POST new grievance
    │   │   │   └── [id]/
    │   │   │       ├── route.js      # Individual grievance details & status updates
    │   │   │       ├── cite-petition/# Link a petition to an unresolved grievance
    │   │   │       └── support/      # Add citizen upvote/support to grievance
    │   │   └── petitions/
    │   │       ├── route.js          # GET petitions / POST create petition
    │   │       └── [id]/
    │   │           ├── route.js      # Petition details
    │   │           ├── sign/         # Submit verified e-signature
    │   │           └── signers/      # Paginated signers list
    │   │
    │   ├── dashboard/
    │   │   ├── authority/      # Authority control center & grievance resolution desk
    │   │   │   ├── issue/[id]/ # Detailed issue audit & proof submission view
    │   │   │   └── page.js     # Authority overview dashboard
    │   │   └── citizen/        # Citizen home dashboard
    │   │       ├── my-issues/    # Citizen's reported grievances list
    │   │       ├── my-petitions/ # Citizen's created & signed petitions
    │   │       └── page.js       # Central citizen command hub
    │   │
    │   ├── grievances/         # Public Grievance portal
    │   │   ├── [id]/           # Grievance detail, timeline & support view
    │   │   ├── new/            # Grievance filing wizard (category, evidence, location)
    │   │   └── page.js         # Grievances directory & city filter
    │   │
    │   ├── legal-assistant/    # NyayMitra AI Legal Copilot chat interface
    │   │   └── page.js         # Interactive conversational AI legal advisor
    │   │
    │   ├── petition/           # Public Petitions portal
    │   │   ├── [id]/           # Petition overview, milestone tracker & signature pad
    │   │   ├── new/            # AI-assisted petition builder wizard
    │   │   └── page.js         # Community petitions discovery feed
    │   │
    │   ├── globals.css         # Global design tokens & Tailwind CSS imports
    │   ├── layout.js           # Root layout with font configuration & providers
    │   └── page.js             # High-impact landing page (Hero, metrics, testimonials)
    │
    ├── components/             # Reusable UI components
    │   ├── CitizenSidebar.js   # Side navigation for citizen portal
    │   ├── HoverCard.js        # Interactive card component with subtle animations
    │   └── Navbar.js           # Responsive navigation bar with role detection
    │
    ├── lib/                    # Shared libraries & utilities
    │   ├── db.js               # MongoDB connection pooling & singleton client
    │   ├── useUser.js          # SWR hook for authenticated session state
    │   └── firebase/
    │       ├── admin.js        # Firebase Admin SDK initialization
    │       └── client.js       # Firebase Client SDK initialization
    │
    ├── models/                 # Mongoose Data Models
    │   ├── Authority.js        # Municipal department schema & category mappings
    │   ├── Grievance.js        # Grievance schema, status history & resolution proof
    │   ├── Petition.js         # Petition schema, e-signatures & victory tracking
    │   └── User.js             # User accounts (citizens & authority officers)
    │
    └── scripts/                # Database seeding & administrative CLI scripts
        └── seedAuthorities.js  # Seeds standard municipal departments & officer accounts
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 16.2.1](https://nextjs.org/) (App Router, Server Components & Route Handlers) |
| **Frontend Library** | [React 19.2.4](https://react.dev/) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), Modern Glassmorphic Design System |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/) via [Mongoose 9.3.3](https://mongoosejs.com/) |
| **Authentication** | Dual Layer: **JWT** (HTTP-only secure cookies) + **Firebase Auth** |
| **AI / LLM** | [Groq Cloud](https://groq.com/) (`llama-3.1-8b-instant`), Custom Legal RAG Pipeline |
| **File Storage** | [UploadThing](https://uploadthing.com/) & [Firebase Storage](https://firebase.google.com/products/storage) |
| **State & Fetching** | [SWR](https://swr.vercel.app/) (Stale-While-Revalidate), [Axios](https://axios-http.com/) |
| **Notifications** | [React Hot Toast](https://react-hot-toast.com/) |
| **Markdown Parsing** | [React Markdown](https://github.com/remarkjs/react-markdown) for formatted AI responses |

---

## ⚙️ Environment Variables

Create a `.env.local` file in the project root (`nyaysetu/` or your deployment environment) and supply the following variables:

```bash
# =================================================================
# 🗄️ DATABASE CONNECTION
# =================================================================
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/nyaysetu?retryWrites=true&w=majority

# =================================================================
# 🔐 AUTHENTICATION & SECURITY
# =================================================================
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long

# =================================================================
# 🤖 AI & LLM ENGINE (GROQ & LEGAL RAG)
# =================================================================
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant

# Optional: External Legal Retrieval-Augmented Generation (RAG) Microservice
LEGAL_RAG_BASE_URL=https://your-legal-rag-service.example.com

# =================================================================
# 🔥 FIREBASE (CLIENT & STORAGE)
# =================================================================
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef

# =================================================================
# 🛡️ FIREBASE ADMIN (SERVER-SIDE)
# =================================================================
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

# =================================================================
# 📦 FILE UPLOADS (UPLOADTHING - OPTIONAL)
# =================================================================
UPLOADTHING_TOKEN=your_uploadthing_token
```

---

## 🚀 Getting Started & Local Setup

### 1. Prerequisites
- **Node.js**: v18.18.0 or v20+ recommended
- **npm**, **pnpm**, or **yarn**
- A **MongoDB Atlas** cluster URI or local MongoDB instance

### 2. Clone Repository & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/nyaysetu.git

# Navigate into the project folder
cd nyaysetu/nyaysetu

# Install dependencies
npm install
```

### 3. Configure Environment Variables
Copy or create the `.env.local` file:

```bash
cp .env.example .env.local
# Open .env.local and update with your MongoDB URI, JWT secret, and Groq API key
```

### 4. Seed Seed Authorities & Mock Accounts
Run the seed script to populate municipal authority accounts in MongoDB:

```bash
node src/scripts/seedAuthorities.js
```

### 5. Launch the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🔑 Database Seeding & Test Credentials

The database seeder (`src/scripts/seedAuthorities.js`) initializes test authorities and default credentials:

| Department | Email / Username | Default Password | Categories Handled |
| :--- | :--- | :--- | :--- |
| **Municipal Corporation Jalandhar** | `mc@jalandhar.gov.in` | `authority123` | Sanitation, Parks, Roads, Street Lighting |
| **PSPCL (Electricity Board)** | `pspcl@jalandhar.gov.in` | `authority123` | Electricity & Power Cuts |
| **Water Supply & Sanitation Dept** | `water@jalandhar.gov.in` | `authority123` | Water Supply & Contamination |
| **PWD Jalandhar** | `pwd@jalandhar.gov.in` | `authority123` | Roads, Footpaths, Bridges |

> **Citizen Accounts**: You can self-register any citizen account via the `/register` page.

---

## 📡 API Routes Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new citizen account with bcrypt hash | Public |
| `POST` | `/api/auth/login` | Authenticate user & set HTTP-only JWT cookie | Public |
| `GET` | `/api/auth/me` | Fetch active logged-in user profile from session | Authenticated |
| `POST` | `/api/auth/logout` | Clear session cookie | Authenticated |
| `GET` | `/api/auth/profile` | Detailed user stats and history | Authenticated |

### Grievances (`/api/grievances`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/grievances` | List grievances with category, city, and status filters | Public / Auth |
| `POST` | `/api/grievances` | File a new private/public grievance with evidence | Citizen |
| `GET` | `/api/grievances/:id` | Fetch detailed grievance information & status timeline | Authorized |
| `PATCH` | `/api/grievances/:id` | Update issue status (`in_progress`, `resolved`) with proof | Authority |
| `POST` | `/api/grievances/:id/support` | Upvote an existing civic grievance | Citizen |
| `POST` | `/api/grievances/:id/cite-petition` | Link a public petition to an ongoing grievance | Citizen |

### Petitions (`/api/petitions`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/petitions` | Discover petitions with search, tags, and city filters | Public |
| `POST` | `/api/petitions` | Create a new community petition | Citizen |
| `GET` | `/api/petitions/:id` | Get petition details, signers count, and progress | Public |
| `POST` | `/api/petitions/:id/sign` | Sign petition with rate-limiting verification | Citizen |
| `GET` | `/api/petitions/:id/signers` | View recent public signers | Public |

### AI Legal Copilot (`/api/ai`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/petition-assist` | Draft or polish petition text using Groq LLaMA 3.1 | Citizen |
| `POST` | `/api/ai/legal-advice` | Query Indian Kanoon and legal statutes via RAG pipeline | Citizen |

---

## 🔒 Security & Access Control

- **HTTP-Only Cookies**: JWT tokens are issued and stored exclusively in `HttpOnly`, `SameSite=Lax` cookies, neutralizing Cross-Site Scripting (XSS) token exfiltration.
- **Strict Role Boundaries**:
  - `citizen`: Can file issues, create/sign petitions, access NyayMitra.
  - `authority`: Can only access assigned department issues, update resolution status, and submit proof.
- **Rate-Limiting & Anti-Spam**:
  - Daily caps on new petitions created (`petitionsTodayCount`) and signatures submitted (`petitionsSignedTodayCount`).
- **Input Sanitization**: Control characters and null bytes stripped across user inputs and AI drafting endpoints.

---

## 🗺️ Roadmap & Future Enhancements

- [ ] **Geo-Spatial Heatmaps**: Interactive Mapbox/Leaflet visualization displaying civic grievance density by ward and pin code.
- [ ] **WhatsApp & SMS Bot**: Allow citizens without smartphones to register complaints and receive SMS status alerts via Twilio/Gupshup.
- [ ] **RTI Auto-Filing Engine**: Automatically compile persistent unaddressed grievances into a formatted Right to Information (RTI) application draft.
- [ ] **Multi-Lingual Voice Input**: Speech-to-text supporting Hindi, Punjabi, Bengali, Tamil, and other regional Indian languages.
- [ ] **Decentralized Audit Trail**: Cryptographic timestamping of resolution milestones to prevent retroactive tampering.

---

## 🤝 Contributing

Contributions to NyaySetu are enthusiastically welcomed!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingCivicFeature`)
3. Commit your changes (`git commit -m 'feat: Add geospatial civic heatmaps'`)
4. Push to your branch (`git push origin feature/AmazingCivicFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - feel free to build upon and adapt NyaySetu for civic betterment.

---

<p align="center">
  <b>NyaySetu (न्यायसेतु)</b> — Bridging Citizens and Governance through Transparency, Law & Technology.
</p>
