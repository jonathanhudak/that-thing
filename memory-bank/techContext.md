# Tech Context: Scalable API Service

## 1. Core Technologies
- **Cloud Provider:** Amazon Web Services (AWS)
- **Primary Language:** TypeScript (for both application code and infrastructure)
- **Infrastructure as Code:** AWS Cloud Development Kit (CDK)
- **API Gateway:** Amazon API Gateway (REST APIs)
- **Compute:** AWS Lambda
- **Database:** Amazon DynamoDB (Single-Table Design)
- **Authentication:** Amazon Cognito User Pools
- **Runtime Environment:** Node.js (for Lambda functions)
- **Monitoring & Observability:** AWS CloudWatch (Logs, Metrics, Alarms), AWS X-Ray
- **Cost Management:** AWS Cost Explorer, AWS Budgets
- **Security Monitoring (Potential):** AWS Security Hub

## 2. Development Setup & Environment
- **Local API Simulation:**
    - Tools: `aws-sam-cli` or `serverless-offline` (to be decided or support both if feasible).
    - Purpose: Simulate API Gateway and Lambda functions locally.
- **Local Database:** DynamoDB Local (typically run via Docker).
- **Package Manager:** `pnpm` (Performant npm) - chosen for efficiency.
- **Version Control:** Git (assumed, standard practice).
- **IDE:** Any modern IDE supporting TypeScript (e.g., VS Code).
- **Key `tsconfig.json` settings:**
    - `strict: true` (enforced)
    - `esModuleInterop: true`
    - Target: Modern Node.js version compatible with AWS Lambda runtime.

## 3. Technical Constraints & Considerations
- **Lambda Performance & Cold Starts:** Optimize memory allocation and execution time. Use provisioned concurrency for critical/high-traffic endpoints to mitigate cold starts.
- **DynamoDB Capacity & Performance:** Careful planning of access patterns, key structures, and GSIs. Utilize on-demand capacity mode for automatic scaling, but monitor and consider provisioned capacity for predictable high-throughput workloads. Monitor for hot partitions.
- **IAM Permissions:** Enforce least privilege principle for all IAM roles, especially for Lambda functions accessing DynamoDB, Cognito, etc.
- **API Gateway Configuration:** Configure appropriate throttling limits based on expected traffic. Implement caching for frequently accessed GET requests with suitable TTLs. Be aware of quotas and limits (request size, timeout).
- **Lambda Resource Limits:** Be aware of Lambda quotas and limits (execution time, memory, concurrent executions, payload size).
- **CDK Deployment Times:** Large CDK stacks can sometimes have longer deployment times. Modularizing stacks might be considered for very large applications.
- **Local Environment Parity:** Strive for high fidelity between local simulation and the actual AWS environment, but acknowledge that perfect parity is challenging.
- **Test-Driven Development (TDD):** All development will strictly follow TDD principles. Tests (primarily unit tests with Jest) will be written before application code.
- **API Documentation from Metadata:** Tools or conventions will be adopted to allow generation of OpenAPI specs from TypeScript types, JSDoc comments, or other code metadata to populate the API Explorer.
- **Schema Evolution & Data Migration:** Plan for flexible schemas in DynamoDB. Develop strategies for batch data migrations (e.g., using Lambda functions) for significant schema changes.
- **Extended Testing:** Beyond unit and integration tests, incorporate load testing, security testing, and performance testing into the development lifecycle and CI/CD pipeline.
- **Personal Access Token (PAT) Security (Future):** Secure generation, storage (hashed), and validation of PATs. This includes considerations for token entropy, expiry, scope management, and protection against leakage or replay attacks. Potential need for custom API Gateway authorizer for PATs if Cognito authorizers are not suitable.

## 4. Key Dependencies (Anticipated)
### Node.js Packages:
- **AWS SDK v3 (`@aws-sdk/*`):** For interacting with AWS services (DynamoDB, Cognito, etc.) from Lambda functions. Use modular clients.
    - `@aws-sdk/client-dynamodb`
    - `@aws-sdk/lib-dynamodb` (for DocumentClient)
    - `@aws-sdk/client-cognito-identity-provider`
- **AWS CDK Libraries (`aws-cdk-lib`):** Core CDK library and specific L2/L3 constructs for AWS services.
    - `aws-cdk-lib/aws-lambda`
    - `aws-cdk-lib/aws-apigateway`
    - `aws-cdk-lib/aws-dynamodb`
    - `aws-cdk-lib/aws-cognito`
    - `aws-cdk-lib/aws-iam`
- **TypeScript (`typescript`):** Core dependency for the language.
- **ESLint & Plugins:**
    - `eslint`
    - `@typescript-eslint/eslint-plugin`
    - `@typescript-eslint/parser`
    - `eslint-config-prettier` (to make ESLint and Prettier work together)
    - Potentially CDK-specific ESLint plugins.
- **Prettier (`prettier`):** For code formatting.
    - `prettier-config-standard` (or chosen shared config).
- **Testing Frameworks & Libraries:**
    - `jest` (for unit and integration tests)
    - `ts-jest` (Jest preprocessor for TypeScript)
    - `@types/jest`
    - `aws-sdk-client-mock` (for mocking AWS SDK v3 clients in tests, essential for TDD).
- **Extended Testing Tools (Potential):**
    - Load Testing: `artillery`, `k6`, `locust`
    - Security Testing: `OWASP ZAP`, `npm audit`, `snyk` (integrated into CI/CD)
- **Input Validation:**
    - `zod` or `joi` (for validating request payloads and parameters in Lambda functions, schemas will be defined as part of TDD).
- **API Documentation Generation Tools (Potential):**
    - Libraries that can parse TypeScript/JSDoc to OpenAPI (e.g., `tsoa` if a more integrated framework approach was taken, or custom scripts leveraging `typescript` compiler API). For now, focus on clear JSDoc and type definitions.
- **Local Development Tools:**
    - `aws-sam-cli` (preferred for local simulation due to closer AWS parity) or `serverless-offline`.
    - `dynamodb-local` (often run via Docker, not a direct `pnpm` dep but part of setup).
- **Utility Libraries:**
    - `uuid` (for generating unique IDs).
    - Date/time libraries if complex manipulations are needed (e.g., `date-fns`).
    - Cryptography libraries (e.g., Node.js `crypto` module) for secure hashing of PATs.
- **Pre-commit Hooks:**
    - `husky`
    - `lint-staged`

## 5. Tool Usage Patterns
- **Development Cycle (TDD):**
    1. Write a failing test (Jest).
    2. Write minimal code to make the test pass.
    3. Refactor code.
- **Package Management:** All package operations via `pnpm` (e.g., `pnpm add`, `pnpm install`, `pnpm run`).
- **`pnpm run build`:** Compiles TypeScript code (e.g., `tsc`).
- **`pnpm run test`:** Executes unit and integration tests using Jest. Watch mode (`pnpm run test:watch`) will be common during TDD.
- **`pnpm run lint`:** Runs ESLint to check for code quality issues.
- **`pnpm run format`:** Runs Prettier to format the codebase.
- **`pnpm run local` (or similar):** Starts the local development server (API simulation + DynamoDB Local). This script will orchestrate `aws-sam-cli local start-api` or `serverless offline start`.
- **`pnpm run deploy` (or `cdk deploy`):** Deploys the infrastructure and application code to AWS using AWS CDK.
    - `cdk synth`: Synthesizes CloudFormation templates.
    - `cdk diff`: Compares deployed stack with local changes.
- **API Explorer UI:** Accessed via a local URL (e.g., `http://localhost:3000/docs`) during local development. Documentation within will be sourced from code metadata.
- **Git Workflow:**
    - Standard Git practices (feature branches, pull requests, etc.). Code merged to main must pass all tests and quality checks.
    - **Commit Messages:** All commits MUST follow the Conventional Commits specification (e.g., `feat: ...`, `fix: ...`, `docs: ...`, `style: ...`, `refactor: ...`, `test: ...`, `chore: ...`). This includes a clear type, an optional scope, and a concise subject line. A detailed body should be provided for significant changes.
- **CI/CD Pipeline (e.g., GitHub Actions):**
    - Triggered on pushes/merges to main branches.
    - Steps: Install dependencies (`pnpm install`), lint, format check, build, unit & integration tests (extensive, due to TDD), security scans, load/performance tests (potentially on staging), CDK deploy.
