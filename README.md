# Thai School LMS (ระบบจัดการการเรียนการสอน)

A comprehensive Learning Management System designed specifically for Thai schools, supporting grades ป.1 - ม.6 (Primary 1 to Secondary 6).

## 🌟 Features

- **Multi-role System**: Admin, Teacher, Student, Parent
- **Thai Education Standards**: 8 Learning Areas, Thai grading system, ปพ. reports
- **Lesson Management**: Multimedia content, versioning, live class integration
- **Assignments**: Multi-file uploads, grading, feedback, late submissions
- **Examinations**: Multiple question types, question bank, auto-grading
- **Grading**: GPA/GPAX calculation, report cards, progress tracking
- **Communication**: Announcements, messaging, notifications

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TailwindCSS, shadcn/ui |
| Backend | NestJS, Prisma, PostgreSQL |
| Real-time | Socket.io, Redis |
| Storage | MinIO/S3 |
| Monorepo | pnpm workspaces, Turborepo |

## 📁 Project Structure

```
school-management/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── packages/
│   ├── database/     # Prisma schema & client
│   └── shared/       # Shared types, utils, validators
├── docker-compose.yml
└── pnpm-workspace.yaml
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL 16 (via Docker)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd school-management
```

2. Install dependencies
```bash
pnpm install
```

3. Copy environment file
```bash
cp .env.example .env
```

4. Start infrastructure (PostgreSQL, Redis, MinIO)
```bash
docker-compose up -d
```

5. Generate Prisma client and push schema
```bash
pnpm db:generate
pnpm db:push
```

6. Seed initial data
```bash
pnpm db:seed
```

7. Start development servers
```bash
pnpm dev
```

### Access

- **Web App**: http://localhost:3000
- **API**: http://localhost:4000
- **API Docs**: http://localhost:4000/api/docs
- **MinIO Console**: http://localhost:9001

## 🔐 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.ac.th | Admin123! |
| Teacher | teacher@school.ac.th | Teacher123! |
| Student | student@school.ac.th | Student123! |
| Parent | parent@school.ac.th | Parent123! |

## 📝 Scripts

```bash
# Development
pnpm dev           # Start all apps in dev mode
pnpm build         # Build all apps
pnpm lint          # Lint all apps

# Database
pnpm db:generate   # Generate Prisma client
pnpm db:push       # Push schema to database
pnpm db:seed       # Seed initial data
pnpm db:studio     # Open Prisma Studio
```

## 🗺️ Roadmap

- [x] Phase 1: Project Setup & Infrastructure
- [ ] Phase 2: Complete Data Models
- [ ] Phase 3: User Management
- [ ] Phase 4: Lesson & Content System
- [ ] Phase 5: Assignment System
- [ ] Phase 6: Exam & Question Bank
- [ ] Phase 7: Grading & Reports
- [ ] Phase 8: Communication System
- [ ] Phase 9: Admin Panel
- [ ] Phase 10: Testing & Deployment

## 📄 License

Private - All rights reserved

---

พัฒนาเพื่อการศึกษาไทย 🇹🇭
