# GGH Proposal AI (OpenClaw Powered)

Enterprise-grade AI-powered proposal generation platform by GGH Software Development Services, powered by the **OpenClaw Agentic Engine**.

## Core Features

- **OpenClaw Agentic Flow**: Automated generation of professional project proposals using high-fidelity AI agents.
- **Agentic Analysis**: Intelligent processing of project scope, timelines, and budget constraints with step-by-step reasoning.
- **Version History**: Persistent storage of generated proposals for review and comparison.
- **Modern UI**: High-fidelity interface built with Next.js, Tailwind CSS, and shadcn/ui.

## Architecture Overview

This project follows the GGH Software Development Services standards:

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **State Management**: Zustand (Global), TanStack Query (Server State)
- **Folder Structure**: Feature-based (`src/features`)
- **UI Components**: shadcn/ui + Lucide icons
- **Validation**: Zod + React Hook Form

## Project Structure

```text
src/
├── app/              # Next.js App Router routes (routing logic only)
├── features/         # Domain-specific logic (home, auth, dashboard, etc.)
│   └── home/
│       └── components/
└── shared/           # Reusable components, hooks, lib, and utils
    ├── components/   # UI components
    ├── hooks/        # Shared React hooks
    ├── lib/          # Third-party library configurations (query-provider, utils)
    └── utils/        # Helper functions
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Standards & Quality

- **Linting**: ESLint + Prettier
- **Testing**: Vitest (Unit/Integration)
- **Git**: Conventional Commits

---
*GGH Software Development Services — Build it right, build it once.*
