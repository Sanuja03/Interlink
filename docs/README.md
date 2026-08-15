# Interlink
second Year software development group project Syncx

# InterLink — AI-Enhanced Recruitment Management System

InterLink is a web-based, multi-tenant recruitment management platform that automates and streamlines the end-to-end hiring process — from job posting and candidate applications through AI-assisted shortlisting, interview coordination, and structured scoring. It brings recruiters, interviewers, candidates, and platform administrators onto a single system, with AI woven into the stages where it saves the most time: CV screening, interview question generation, and an in-app assistant powered by retrieval-augmented generation (RAG).

## Overview

Hiring is slow because the work is fragmented across job boards, inboxes, spreadsheets, and calendars. InterLink consolidates that workflow into one platform and applies AI to the highest-effort steps. Each company operates as an isolated tenant with its own jobs, candidates, interviewers, and data, while a super-admin layer oversees the platform as a whole.

The system is built as a Spring Boot backend exposing a secured REST API, paired with a React single-page frontend. Authentication and file storage are handled through Supabase, and JWTs are validated by the backend as an OAuth2 resource server.

## Key Features

**Multi-tenant architecture.** Every company is a self-contained tenant. Jobs, applications, candidate pipelines, interviewers, and settings are scoped per tenant, with role-based access enforced across four roles: Super Admin, Company Admin, Interviewer, and Candidate.

**Job posting management.** Company admins can create, publish, and manage job postings, which candidates then browse and apply to through the public application portal.

**Candidate application portal.** Candidates maintain a profile (education, experience, skills, preferences, résumé) and apply to open roles. A personal dashboard tracks application status and upcoming interviews.

**AI-based CV shortlisting.** Applications are screened and ranked against job requirements to surface the strongest candidates automatically, reducing manual résumé review. Résumés are parsed from uploaded PDFs and documents.

**AI question generator.** The platform generates tailored interview questions to support interviewers in running consistent, role-relevant interviews.

**RAG chatbot.** An in-app assistant answers questions using retrieval-augmented generation, with persisted chat sessions and message history (and per-session usage limits).

**End-to-end interview process.** InterLink covers the full interview lifecycle:
- Interviewer availability management (weekly availability and per-day slots)
- Interview requests from company admins to interviewers
- Request status tracking and interviewer responses
- Interview scheduling with an integrated calendar
- A structured scorecard system with reusable templates for evaluating candidates
- Interview summaries and hiring decisions

**Dashboards for every role.** Dedicated dashboards for company admins, candidates, interviewers, and the super admin, each surfacing the metrics and actions relevant to that role.

**Super-admin console.** Platform-wide oversight of companies, users, jobs, interviews, activity logs, and global settings.

## Tech Stack

### Backend
- **Java 21** with **Spring Boot 3.4.4**
- **Spring Web** — REST API
- **Spring Security** + **OAuth2 Resource Server** — JWT-based authentication and authorization
- **Spring Data JPA** — persistence layer
- **PostgreSQL** — primary datastore
- **Spring WebFlux (WebClient)** — outbound calls to external services (AI providers, Supabase)
- **Apache PDFBox** and **Apache POI** — parsing résumés and documents (PDF / Office formats)
- **Jackson** — JSON serialization
- **Lombok** — boilerplate reduction
- **Bean Validation** — request validation

### Frontend
- **React 19** with **Vite 7** — SPA and build tooling
- **React Router 7** — client-side routing
- **Tailwind CSS 3** — styling
- **React Hook Form** — form handling and validation
- **Axios** — API client
- **React Hot Toast** — notifications
- **Lucide React** — icons

### Platform Services
- **Supabase** — authentication, storage, and admin operations
- **OpenAI** — AI question generation, CV shortlisting, and the RAG chatbot

## Architecture

The backend follows a modular, feature-oriented structure. Each feature module encapsulates its own controllers, services, DTOs, entities, and repositories, keeping domains loosely coupled and independently maintainable.

```
Backend (Spring Boot — "InterLink")
├── common/            Shared responses and utilities
├── config/            App, CORS, Dotenv, OpenAI, and RestTemplate configuration
└── modules/
    ├── CompanyAdmin/       Application management, candidate history & profiles,
    │                       company dashboard & details, shortlisting, scorecards,
    │                       interview summaries, RAG chatbot, and the full
    │                       interview process (availability, requests, scheduling,
    │                       status, lifecycle)
    ├── SuperAdmin/         Companies, users, jobs, interviews, dashboard,
    │                       activity logs, and settings
    ├── auth/               Candidate / Company / Interviewer / User accounts,
    │                       signup, OTP, and Supabase integration
    ├── calendar/           Interview calendar events
    ├── candidatedashboard/ Candidate application tracking and dashboard
    ├── candidateprofile/   Candidate profile, education, experience, skills, résumé
    └── cjobpost/           Company job postings
```

The frontend is a Vite-powered React application that consumes the backend REST API and authenticates against Supabase.

## Getting Started

### Prerequisites
- Java 21+
- Node.js 20+ (required by Vite 7 and several dependencies)
- PostgreSQL
- A Supabase project (URL, keys)
- An OpenAI API key

### Backend

```bash
cd Backend/demo 3
# Configure environment variables (see below), then:
./mvnw spring-boot:run
```

### Frontend

```bash
cd Frontend
npm install
npm run dev      # start the dev server
npm run build    # production build
npm run preview  # preview the production build
```


## Roles

| Role | Capabilities |
|------|--------------|
| **Super Admin** | Oversees the whole platform: companies, users, jobs, interviews, activity logs, and global settings. |
| **Company Admin** | Manages their tenant: job posts, applications, shortlisting, interview requests, scorecards, and dashboards. |
| **Interviewer** | Sets availability, responds to interview requests, conducts interviews, and submits scorecards. |
| **Candidate** | Builds a profile, applies to jobs, tracks applications, and attends scheduled interviews. |


