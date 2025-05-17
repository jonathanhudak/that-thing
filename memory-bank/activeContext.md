# Active Context: Scalable API Service

## 1. Current Work Focus

- **Enhancing Architecture and Finalizing Design based on Solutions Architect Review:** Integrating detailed findings from `research/solutions-architect-findings-to-enhance-architecture.md` into all core Memory Bank documents. This involves deepening the specifications for security, DynamoDB access patterns, scalability, error handling, observability, cost management, and testing.

## 2. Recent Changes

- **Initial Memory Bank Setup:**
  - Created `projectbrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md`.
  - Incorporated `pnpm`, TDD, and metadata-driven API docs into these initial files.
- **Solutions Architect Review Integration (Ongoing):**
  - Updated `projectbrief.md` with enhanced non-functional requirements (security, cost, API versioning) and expanded risks/mitigations.
  - Updated `productContext.md` to emphasize UX related to error handling, performance, and developer experience through observability.
  - Updated `systemPatterns.md` with detailed access control models, DynamoDB GSI designs, query patterns, error handling, observability, and scalability strategies.
  - Updated `techContext.md` with tools for extended testing, AWS services for monitoring/cost, and reinforced technical considerations.
  - **Currently updating `activeContext.md`** to reflect these architectural enhancements and next steps.

## 3. Next Steps (Post-Architectural Enhancement)

- **Finalize `progress.md`:** Update to reflect the completion of architectural enhancements and current project status.
- **Validate Enhanced Architecture:** Review all updated Memory Bank documents to ensure consistency and completeness of the refined architecture.
- **Detailed Design Spike (If Needed):** For any remaining specific design points (e.g., exact CloudWatch alarm thresholds, API Gateway cache TTLs), conduct a brief focused investigation.
- **Establish Project Skeleton (TDD Approach, reflecting enhanced architecture):**
  - Initialize a new project with `pnpm` (`package.json`).
  - Set up TypeScript (`tsconfig.json`).
  - Initialize AWS CDK project structure (infra, src, tests).
  - Configure ESLint, Prettier, Husky, Lint-Staged.
  - Implement CI/CD pipeline basics (GitHub Actions) including linting, formatting, and initial test runs.
- **Begin Implementation of Core Infrastructure & Features (TDD Approach):**
  - **Authentication (Cognito):** Write tests, then implement CDK constructs for Cognito User Pool.
  - **Database (DynamoDB):** Write tests, then implement CDK constructs for the single table with defined GSIs.
  - **Observability Setup (CloudWatch, X-Ray):** Write tests (for CDK constructs if applicable), then implement basic logging, metrics, and tracing setup.
  - **Core API (User Profile - e.g., `GET /v1/me`):** Write tests (unit, integration), then implement Lambda function, API Gateway endpoint, and IAM roles.
  - Continue with other entities (Posts, Tags) following the TDD cycle.
- **Future Feature Design (High-Level):**
  - **Personal Access Token (PAT) System:** Outline core requirements and patterns for PAT generation, storage, validation, and management APIs. (Details in `projectbrief.md` and `systemPatterns.md`).

## 4. Active Decisions & Considerations

- **Local Development Tooling:** Decision remains `aws-sam-cli` (preferred) or `serverless-offline`. To be confirmed during skeleton setup.
- **Package Manager:** **Decision Made: `pnpm` will be used.**
- **Initial Directory Structure:** Standard `src/`, `infra/`, `tests/` confirmed.
- **API Versioning:** **Decision Made: Path-based versioning (e.g., `/v1/`) will be implemented from the start.**
- **Error Handling:** **Decision Made: Standardized HTTP error codes and resilient error handling with retry mechanisms will be implemented.** (Specifics detailed in `systemPatterns.md`).
- **Observability:** **Decision Made: AWS CloudWatch (Logs, Metrics, Alarms) and AWS X-Ray will be used.** (Specifics in `systemPatterns.md` and `techContext.md`).
- **Cost Management:** **Decision Made: AWS Cost Explorer and Budgets will be utilized for monitoring and control.**
- **Schema Evolution:** **Decision Made: Flexible schemas and batch migration strategies (e.g., Lambda) will be planned for.**
- **Extended Testing:** **Decision Made: Load, security, and performance testing will be incorporated into the CI/CD pipeline.** (Tools listed in `techContext.md`).
- **Security Model:** Detailed in `systemPatterns.md` (Cognito, Lambda auth, IAM least privilege, HTTPS).
- **DynamoDB Design:** Detailed in `systemPatterns.md` (single-table, GSIs, query patterns).
- **Future Feature - Personal Access Tokens (PATs):** Acknowledged as a future requirement for enabling programmatic access and MCP server integration. High-level considerations are noted in `projectbrief.md` and `systemPatterns.md`.

## 5. Important Patterns & Preferences (Reinforced)

- **Documentation First & Living Documentation:** Memory Bank is central. API documentation from code metadata.
- **Test-Driven Development (TDD):** Core development methodology.
- **Modularity:** Enforced by dedicated Lambdas and CDK constructs.
- **Automation:** CI/CD, linting, formatting, automated testing (unit, integration, extended).
- **Security by Design:** Integrating security considerations from the start.
- **Cost Awareness:** Designing and operating with cost-effectiveness in mind.

## 6. Learnings & Project Insights (Post-SA Review)

- The initial PRD and Memory Bank setup provided a good starting point.
- The Solutions Architect review highlighted the critical importance of detailing non-functional requirements (security, scalability, observability, cost) and specific implementation patterns (DynamoDB GSIs, error handling) _before_ starting code.
- A proactive approach to schema evolution, API versioning, and comprehensive testing is essential for long-term project health.
- Serverless architecture, while offering benefits, requires careful design in areas like cold starts, IAM permissions, and distributed tracing to be effective.
- The potential for future extensibility via features like Personal Access Tokens (PATs) reinforces the need for a solid, secure, and well-documented core API.

## 7. Open Questions / To Be Discussed

- **Resolved:** API versioning strategy (Path-based `/v1/`).
- **Resolved:** Detailed error handling strategy (Standardized HTTP codes, retries).
- **Resolved (Design Spike - 2025-05-16):**
  - **API Gateway Cache TTLs:** Initial values defined (e.g., User Profile: 300s; Public Posts: 60s; Public Post Listings: 30s). Details in `systemPatterns.md`.
  - **CloudWatch Alarm Thresholds:** Initial values defined for Lambda errors/duration, API Gateway latency/5XX errors, DynamoDB throttling, Cognito errors. Details in `systemPatterns.md`.
  - **DynamoDB `TAG#{tag_id}` / `POST#{post_id}` Relationship:** Decided to use a new GSI (`TagPostsSortedIndex` with `GSI4PK = TAG#{tag_id}`, `GSI4SK = post_created_at`) for fetching posts by tag, sorted by post creation date. The relationship item `PK = TAG#{tag_id}, SK = POST#{post_id}` will include `post_created_at`. Details in `systemPatterns.md`.
- **Future - Personal Access Tokens (PATs):**
  - Detailed design for token scopes (e.g., read-only, read/write specific entities).
  - Specifics of token expiry and refresh mechanisms.
  - UI/API design for user management of their PATs (creation, listing, revocation).
  - Choice of hashing algorithm and salt management for stored token hashes.
