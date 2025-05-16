# Project Progress: Scalable API Service

## 1. Current Status
- **Phase:** Project Initiation & Documentation.
- **Overall Progress:** 0% (Code Implementation), 100% (Memory Bank Documentation Updated).
- **Date:** 2025-05-15 (Corresponds to the latest update of this document)

## 2. What Works
- **Memory Bank Core Files (Updated):**
    - `projectbrief.md`: Updated with `pnpm`, TDD, metadata API docs.
    - `productContext.md`: Updated with `pnpm`, TDD, metadata API docs.
    - `systemPatterns.md`: Updated with TDD, metadata API docs.
    - `techContext.md`: Updated with `pnpm`, TDD, metadata API docs.
    - `activeContext.md`: Updated with `pnpm`, TDD, metadata API docs.
    - `progress.md`: Currently being updated.
- **Initial Idea Document:** `docs/initial-idea.md` (Serves as the source PRD).

## 3. What's Left to Build (High-Level Roadmap from `activeContext.md`, reflecting TDD and `pnpm`)
- **Project Skeleton & Setup (TDD Approach):**
    - Initialize project with `pnpm` (`package.json`).
    - Configure TypeScript (`tsconfig.json`).
    - Initialize AWS CDK project.
    - Set up ESLint, Prettier.
    - Define basic directory structure (`src/`, `infra/`, `tests/` with initial test files).
    - Initialize Git repository.
- **Core Infrastructure (CDK, TDD Approach):**
    - Write tests for Amazon Cognito User Pool setup, then implement.
    - Write tests for Amazon DynamoDB table (single-table design) setup, then implement.
    - Write tests for IAM Roles and Policies for Lambda functions, then implement.
- **Core API Features (Lambda & API Gateway via CDK, TDD Approach):**
    - Focus on clear TypeScript types and JSDoc for metadata-driven API documentation from the start.
    - **User Management (TDD):**
        - Tests for Cognito sign-up/sign-in integration and Lambda trigger for profile, then implement.
        - Tests for `GET /me` endpoint, then implement.
        - Tests for `PUT /me` endpoint, then implement.
    - **Post Management (TDD):**
        - Tests for `POST /posts`, then implement.
        - Tests for `GET /posts/{postId}`, then implement.
        - Tests for `PUT /posts/{postId}`, then implement.
        - Tests for `DELETE /posts/{postId}`, then implement.
    - **Tag Management (TDD):**
        - Tests for `POST /tags`, then implement.
        - Tests for `GET /tags/{tagId}`, then implement.
        - Tests for `PUT /tags/{tagId}`, then implement.
        - Tests for `DELETE /tags/{tagId}`, then implement.
- **Access Control Logic (TDD):** Implementation within each relevant Lambda, driven by tests.
- **Local Development Environment:**
    - Setup and scripts for `aws-sam-cli` (preferred) or `serverless-offline`.
    - Integration of DynamoDB Local.
    - API Explorer UI (Swagger/OpenAPI, with documentation from code metadata).
- **Testing (as part of TDD):**
    - Unit tests (Jest) written before code for all Lambda functions and CDK constructs where applicable.
    - Integration tests (Jest) for API endpoints, also approached with TDD.
- **CI/CD Pipeline:**
    - Automated build, test, and deployment.

## 4. Known Issues / Blockers
- None at this exact moment, as development has not yet commenced. Potential future issues are listed in `projectbrief.md` (Risks and Mitigations).

## 5. Evolution of Project Decisions
- **2025-05-15:**
    - **Decision:** Initialize the Memory Bank as the first step of the project.
    - **Rationale:** To establish a clear, documented foundation before any code is written, aligning with Cline's operational model.
    - **Impact:** All core memory bank files (`projectbrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md`, `activeContext.md`, `progress.md`) created based on `docs/initial-idea.md`.
- **2025-05-15 (Initial Memory Bank Setup - from `activeContext.md`):**
    - **Consideration:** `aws-sam-cli` vs `serverless-offline` for local development. `aws-sam-cli` is a slight preference initially.
    - **Consideration:** `npm` as the default package manager.
- **2025-05-15 (Memory Bank Update - User Feedback):**
    - **Decision:** Adopt `pnpm` as the package manager.
    - **Rationale:** User preference for `pnpm`'s efficiency.
    - **Impact:** All references to `npm` in documentation changed to `pnpm`. Project setup will use `pnpm`.
    - **Decision:** Implement exclusive Test-Driven Development (TDD).
    - **Rationale:** User requirement to ensure adequate test coverage and guide development.
    - **Impact:** Development workflow, testing strategies, and relevant documentation updated to reflect TDD.
    - **Decision:** Leverage code metadata for API documentation generation.
    - **Rationale:** User requirement for simpler API documentation maintenance.
    - **Impact:** Documentation and planning updated to include strategies for metadata extraction for API Explorer.
    - **Impact (Overall):** All core memory bank files reviewed and updated to reflect these decisions.
