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
- **Lambda Cold Starts:** Acknowledge potential for cold starts and plan mitigation (e.g., provisioned concurrency for critical/high-traffic endpoints if performance dictates).
- **DynamoDB Single-Table Design Complexity:** Requires careful planning of access patterns and key structures. Querying can be less intuitive than SQL for developers new to NoSQL single-table designs.
- **IAM Permissions:** Fine-grained IAM roles and policies are crucial for security (least privilege principle for Lambda functions accessing DynamoDB, Cognito, etc.).
- **API Gateway Limits:** Be aware of API Gateway quotas and limits (request size, timeout, etc.).
- **Lambda Limits:** Be aware of Lambda quotas and limits (execution time, memory, concurrent executions, payload size).
- **CDK Deployment Times:** Large CDK stacks can sometimes have longer deployment times. Modularizing stacks might be considered for very large applications.
- **Local Environment Parity:** Strive for high fidelity between local simulation and the actual AWS environment, but acknowledge that perfect parity is challenging.
- **Test-Driven Development (TDD):** All development will strictly follow TDD principles. Tests (primarily unit tests with Jest) will be written before application code.
- **API Documentation from Metadata:** Tools or conventions will be adopted to allow generation of OpenAPI specs from TypeScript types, JSDoc comments, or other code metadata to populate the API Explorer.

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
- **Input Validation:**
    - `zod` or `joi` (for validating request payloads and parameters in Lambda functions, schemas will be defined as part of TDD).
- **API Documentation Generation Tools (Potential):**
    - Libraries that can parse TypeScript/JSDoc to OpenAPI (e.g., `tsoa` if a more integrated framework approach was taken, or custom scripts leveraging `typescript` compiler API). For now, focus on clear JSDoc and type definitions.
- **Local Development Tools:**
    - `aws-sam-cli` (preferred for local simulation due to closer AWS parity) or `serverless-offline`.
    - `dynamodb-local` (often run via Docker, not a direct `pnpm` dep but part of setup).
- **Utility Libraries:**
    - `uuid` (for generating unique IDs, if not provided by DynamoDB or other means sufficiently).
    - Date/time libraries if complex manipulations are needed (e.g., `date-fns`).
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
- **Git Workflow:** Standard Git practices (feature branches, pull requests, etc.). Code merged to main must pass all tests and quality checks.
- **CI/CD Pipeline (e.g., GitHub Actions):**
    - Triggered on pushes/merges to main branches.
    - Steps: Install dependencies (`pnpm install`), lint, format check, build, test (extensive, due to TDD), CDK deploy.
