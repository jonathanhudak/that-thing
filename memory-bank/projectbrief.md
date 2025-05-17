# Project Brief: Scalable API Service for Post, User, and Tag Management

## 1. Introduction
This project aims to build a low-cost, performant, and scalable RESTful API service using AWS Cloud Development Kit (CDK). The service will manage three core entities—Posts, Users, and Tags—offering CRUD (Create, Read, Update, Delete) operations with robust access control. The codebase will be written in TypeScript to leverage type safety and maintainability.

This document is derived from the initial Product Requirements Document (PRD) found in `docs/initial-idea.md`.

## 2. Core Objectives
- Deliver a RESTful API for managing Posts, Users, and Tags with CRUD operations.
- Ensure scalability to handle varying traffic loads efficiently.
- Minimize operational costs using serverless architecture.
- Enforce access control to protect user data based on specified permissions.
- Maintain a TypeScript codebase for type safety and developer productivity.
- Achieve professional-grade unit test coverage through exclusive Test-Driven Development (TDD) for reliability and quality.
- Provide a local development environment with an API explorer UI (generated leveraging code metadata) for rapid iteration.
- Enforce strict code quality standards using ESLint and Prettier.
- Utilize `pnpm` as the package manager for efficient dependency management.

## 3. Key Features
- User authentication via Amazon Cognito, supporting email/password and future OAuth scalability.
- CRUD operations for Posts with access levels: private, public, or allowed_user.
- CRUD operations for Tags with access levels: private or public.
- Ability to assign Tags to Posts with permission checks.
- Secure API endpoints with Cognito authentication.
- Scalable data storage using Amazon DynamoDB.
- Infrastructure defined as code using AWS CDK in TypeScript.
- Local API simulation for development with an interactive API explorer UI, with documentation generated from code metadata where possible.
- Codebase adhering to strict ESLint and Prettier rules for TypeScript and AWS CDK.

## 4. Functional Requirements Overview
### 4.1 Data Models
- **User**: `email`, `password` (Cognito managed), `posts` (relationship), `updated_at`, `created_at`, `friends` (future).
- **Post**: `name`, `content`, `updated_at`, `created_at`, `user_id` (owner), `tags` (relationship), `access` ('private' | 'public' | { type: 'allowed_user', users: User[] }).
- **Tag**: `name`, `updated_at`, `created_at`, `user_id` (owner), `access` ('private' | 'public').

### 4.2 User Management
- Sign-Up, Profile Creation (DynamoDB via Lambda trigger), Authentication (JWT), Profile Updates.

### 4.3 Post Management
- Create, Read (based on access: private, public, allowed_user), Update, Delete (owner-restricted).

### 4.4 Tag Management
- Create, Read (based on access: public, private), Update, Delete (owner-restricted).

### 4.5 Access Control
- **Posts**: private (owner), public (all authenticated), allowed_user (specified users).
- **Tags**: private (owner assign only), public (any user assign).
- Tag Assignment: Permission check based on tag access.
- Visibility: If post is viewable, all its tags are viewable.

## 5. Non-Functional Requirements Overview
- **Scalability**: Serverless components, designed to handle varying loads.
- **Performance**: Optimized response times, mitigation of cold starts (e.g., provisioned concurrency for critical endpoints), API Gateway caching where appropriate.
- **Cost-Effectiveness**: On-demand pricing, proactive cost monitoring (e.g., AWS Budgets, Cost Explorer), and resource optimization.
- **Security**: Secure endpoints (HTTPS), robust access control enforced in Lambda functions, least privilege IAM roles, Cognito for authentication, regular vulnerability monitoring (e.g., AWS Security Hub).
- **Maintainability**: TypeScript, CDK, well-documented code and infrastructure.
- **Testability**: High unit test coverage achieved via exclusive Test-Driven Development (TDD).
- **Local Development**: API simulation, explorer UI (leveraging metadata for documentation).
- **Code Quality**: ESLint, Prettier.
- **Package Management**: `pnpm`.

## 6. Technical Design Overview
- **Architecture**: API Gateway (Cognito authorizer), Lambda (CRUD), DynamoDB (single-table).
- **Authentication**: Cognito User Pool.
- **Local Dev**: `aws-sam-cli` or `serverless-offline`, DynamoDB Local, API Explorer (Swagger/OpenAPI, leveraging metadata).
- **Data Model (DynamoDB Single Table)**:
    - PK: Entity ID (e.g., `USER#<id>`, `POST#<id>`).
    - SK: Sub-entity/relationship (e.g., `PROFILE`, `POST#<post_id>`).
- **API Endpoints**: Path-based versioning (e.g., `/v1/me`, `/v1/posts`), standard HTTP methods for CRUD.
- **Lambda Functions**: One per endpoint, input validation (e.g., using `zod`), DynamoDB ops, access control logic.
- **Error Handling**: Standardized HTTP error codes and resilient error handling with retry mechanisms for transient failures.
- **Observability**: Comprehensive logging (CloudWatch Logs), metrics (CloudWatch Metrics), and tracing (AWS X-Ray).

## 7. Local Development Environment
- **Simulation**: `aws-sam-cli` or `serverless-offline`, DynamoDB Local.
- **API Explorer**: Swagger UI or OpenAPI Explorer.
- **Setup**: Clear instructions, prerequisites, `pnpm` scripts.

## 8. Code Quality Standards
- **ESLint**: `@typescript-eslint/recommended`, CDK rules.
- **Prettier**: Standard config.
- **Tooling**: Strict TypeScript, Husky/Lint-Staged.

## 9. Development and Testing
- **Codebase**: TypeScript (Lambda, CDK).
- **Infrastructure**: AWS CDK in TypeScript.
- **Testing**: Exclusive Test-Driven Development (TDD) using Jest, `aws-sdk-mock` (or equivalent for SDK v3), integration tests, API explorer tests.

## 10. Deployment
- **CDK Stack**: Cognito, DynamoDB, Lambda, API Gateway.
- **CI/CD**: Automated testing and deployment (e.g., GitHub Actions).

## 11. Future Considerations
- OAuth integration for authentication.
- Friendship features (e.g., connecting users).
- Advanced API pagination, filtering, and sorting capabilities.
- Enhanced real-time monitoring and alerting dashboards.
- **Personal Access Tokens (PATs):** An API endpoint for users to generate time-limited PATs for their account. These tokens will enable programmatic access to their data, facilitating integrations like MCP servers for LLM-driven generative features. This will require secure token generation, storage (e.g., hashed in DynamoDB), and validation mechanisms.

## 12. Risks and Mitigations
- Cold Starts (provisioned concurrency, optimized Lambda settings), DynamoDB Design (thorough access pattern analysis, GSI planning, schema evolution strategy), Security (regular audits, AWS Security Hub, least privilege), Cost (AWS Budgets, Cost Explorer, resource optimization), Local Env Parity, API Versioning (clear strategy), Extended Testing (load, security, performance testing in CI/CD).
