# Active Context: Scalable API Service

## 1. Current Work Focus
- **Initialization of Memory Bank:** The primary focus is on establishing the foundational documentation for the project within the Memory Bank.
- **Defining Core Project Structure:** Laying out the project's objectives, technical architecture, and context as per the `projectbrief.md`, `productContext.md`, `systemPatterns.md`, and `techContext.md`.

## 2. Recent Changes
- **Created `projectbrief.md`:** Summarized the project's goals and requirements from `docs/initial-idea.md`.
- **Created `productContext.md`:** Detailed the problem space, how the system should work, and user experience goals.
- **Created `systemPatterns.md`:** Outlined the system architecture, key technical decisions, and design patterns.
- **Created `techContext.md`:** Documented the technology stack, development setup, and anticipated dependencies.
- **Updated `projectbrief.md`**: Incorporated `pnpm`, TDD, and metadata-driven API docs.
- **Updated `productContext.md`**: Incorporated `pnpm`, TDD, and metadata-driven API docs.
- **Updated `systemPatterns.md`**: Incorporated TDD and metadata-driven API docs.
- **Updated `techContext.md`**: Incorporated `pnpm`, TDD, and metadata-driven API docs.
- **Currently updating `activeContext.md`**.

## 3. Next Steps (High-Level for Project Initiation)
- **Create `progress.md`:** To track overall project status and evolution.
- **Establish Project Skeleton (TDD Approach):**
    - Initialize a new project with `pnpm` (`package.json`).
    - Set up TypeScript (`tsconfig.json`).
    - Initialize AWS CDK project structure.
    - Configure ESLint and Prettier.
    - Set up basic Git repository structure (e.g., `src`, `infra`, `tests` directories, with initial test files).
- **Begin Implementation of Core Features (TDD Approach):**
    - Write tests for Cognito User Pool setup via CDK, then implement.
    - Write tests for DynamoDB table structure via CDK, then implement.
    - Write tests for initial Lambda functions (e.g., `/me` endpoint), then implement.
    - Focus on clear TypeScript types and JSDoc comments from the start to facilitate metadata extraction for API documentation.

## 4. Active Decisions & Considerations
- **Local Development Tooling:** Decision leans towards `aws-sam-cli` for its closer AWS parity, as noted in `techContext.md`. This will be confirmed when setting up the local environment.
- **Package Manager:** **Decision Made: `pnpm` will be used.**
- **Initial Directory Structure:** A standard structure like `src/` (for Lambda code), `infra/` (for CDK stacks), `tests/` will be adopted.

## 5. Important Patterns & Preferences (Emerging)
- **Documentation First & Living Documentation:** Continue establishing clear documentation. Leverage code metadata (types, JSDoc) to ensure API documentation remains up-to-date with implementation.
- **Test-Driven Development (TDD):** This is now a core development practice. All new functionality will begin with writing tests.
- **Modularity:** The design (dedicated Lambda per endpoint, CDK stacks) leans towards modular components, which TDD will help enforce.
- **Automation:** Emphasis on CI/CD, linting, formatting, and automated testing (integral to TDD) from the outset.

## 6. Learnings & Project Insights (Initial)
- The initial PRD (`docs/initial-idea.md`) is comprehensive and provides a strong foundation.
- The serverless approach with AWS CDK and TypeScript, combined with TDD, is well-suited for the project's objectives of creating a reliable, scalable, cost-effective, and maintainable API.
- Establishing a robust local development environment that supports TDD efficiently will be critical.
- Using `pnpm` will contribute to efficient dependency management.
- Leveraging metadata for API documentation will streamline the documentation process and improve accuracy.

## 7. Open Questions / To Be Discussed
- Specific versioning strategy for API endpoints (e.g., `/v1/posts`). For now, no versioning in the path will be assumed.
- Detailed error handling strategy and standardized API error responses.
