Product Requirements Document: Scalable API Service for Post, User, and Tag Management

1. Introduction
This document outlines the requirements for a low-cost, performant, and scalable RESTful API service built using AWS Cloud Development Kit (CDK). The service manages three core entities—Posts, Users, and Tags—offering CRUD (Create, Read, Update, Delete) operations with robust access control. The codebase will be written in TypeScript to leverage type safety and maintainability.

2. Objectives

Deliver a RESTful API for managing Posts, Users, and Tags with CRUD operations.
Ensure scalability to handle varying traffic loads efficiently.
Minimize operational costs using serverless architecture.
Enforce access control to protect user data based on specified permissions.
Maintain a TypeScript codebase for type safety and developer productivity.
Achieve professional-grade unit test coverage for reliability and quality.
Provide a local development environment with an API explorer UI for rapid iteration.
Enforce strict code quality standards using ESLint and Prettier.

3. Features

User authentication via Amazon Cognito, supporting email/password and future OAuth scalability.
CRUD operations for Posts with access levels: private, public, or allowed_user.
CRUD operations for Tags with access levels: private or public.
Ability to assign Tags to Posts with permission checks.
Secure API endpoints with Cognito authentication.
Scalable data storage using Amazon DynamoDB.
Infrastructure defined as code using AWS CDK in TypeScript.
Local API simulation for development with an interactive API explorer UI.
Codebase adhering to strict ESLint and Prettier rules for TypeScript and AWS CDK.

4. Functional Requirements
4.1 Data Models
User

email: string (unique)
password: Securely hashed (managed by Cognito)
posts: Post[] (relationship, not stored directly)
updated_at: date
created_at: date
friends: User[] (relationship, reserved for future use)

Post

name: string
content: string
updated_at: date
created_at: date
user_id: User (owner)
tags: Tag[] (relationship)
access: 'private' | 'public' | { type: 'allowed_user', users: User[] }

Tag

name: string
updated_at: date
created_at: date
user_id: User (owner)
access: 'private' | 'public'

4.2 User Management

Sign-Up: Users register with email and password via Amazon Cognito.
Profile Creation: Post-sign-up, a DynamoDB user profile is created via a Lambda trigger.
Authentication: Users log in to obtain a JWT token for API access.
Profile Updates: Authenticated users can update their profile (e.g., email).
Future Scalability: Cognito supports adding OAuth providers (e.g., Google, Facebook) later.

4.3 Post Management

Create: Authenticated users create posts with name, content, tags, and access level.
Read: Users retrieve posts based on access:
private: Owner only.
public: Anyone.
allowed_user: Specified users.


Update: Owners can modify their posts.
Delete: Owners can delete their posts.

4.4 Tag Management

Create: Authenticated users create tags with name and access level.
Read: Users retrieve tags:
public: Anyone.
private: Owner only.


Update: Owners can modify their tags.
Delete: Owners can delete their tags.

4.5 Access Control

Posts:
private: Accessible only by the owner.
public: Accessible by all authenticated users.
allowed_user: Accessible by users listed in allowed_users.


Tags:
private: Can only be assigned to posts by the owner.
public: Can be assigned to posts by any user.


Tag Assignment: When adding tags to posts, verify the user has permission (public tag or owner of private tag).
Visibility: If a user can view a post, they can see all its tags, regardless of tag access level.

5. Non-Functional Requirements

Scalability: Automatically scale with traffic using serverless components.
Performance: Optimize response times, mitigating Lambda cold starts where necessary.
Cost-Effectiveness: Leverage on-demand pricing for low usage costs.
Security: Secure endpoints with authentication and enforce access control.
Maintainability: Use TypeScript and CDK for a clean, manageable codebase.
Testability: Achieve high unit test coverage for all business logic.
Local Development: Provide a seamless local development experience with API simulation and explorer UI.
Code Quality: Enforce strict linting and formatting rules for consistency and readability.

6. Technical Design
6.1 Architecture Overview

API Layer: Amazon API Gateway with Cognito authorizer.
Compute Layer: AWS Lambda functions for CRUD operations.
Data Layer: Amazon DynamoDB with a single-table design.
Authentication: Amazon Cognito User Pool for user management.
Local Development: Simulate API Gateway and Lambda locally with tools like aws-sam-cli or serverless-offline.
API Explorer UI: Integrate Swagger UI or OpenAPI Explorer for local API documentation and testing.

6.2 Data Model (DynamoDB Single Table)

Partition Key (PK): Entity identifier (e.g., USER#<id>, POST#<id>).
Sort Key (SK): Sub-entity or relationship (e.g., PROFILE, POST#<id>).

Sample Items

User: PK=USER#<user_id>, SK=PROFILE, attributes: {email, created_at, updated_at}
Post: PK=USER#<user_id>, SK=POST#<post_id>, attributes: {name, content, access, created_at, updated_at}
Tag: PK=USER#<user_id>, SK=TAG#<tag_id>, attributes: {name, access, created_at, updated_at}
Post-Tag: PK=POST#<post_id>, SK=TAG#<tag_id>
Allowed User: PK=POST#<post_id>, SK=ALLOWED_USER#<user_id>

6.3 API Endpoints
User Endpoints

GET /me
Description: Retrieve the authenticated user's profile.
Response: User data (email, timestamps).


PUT /me
Description: Update the authenticated user's profile.
Body: { email: string }
Response: Updated user data.



Post Endpoints

POST /posts
Description: Create a post for the authenticated user.
Body: { name: string, content: string, tags: string[], access: 'private' | 'public' | { type: 'allowed_user', users: string[] } }
Response: Created post data.


GET /posts/{postId}
Description: Retrieve a post if accessible.
Response: Post data or 403/404 error.


PUT /posts/{postId}
Description: Update a post if owned.
Body: Same as POST.
Response: Updated post data or 403 error.


DELETE /posts/{postId}
Description: Delete a post if owned.
Response: Success or 403 error.



Tag Endpoints

POST /tags
Description: Create a tag for the authenticated user.
Body: { name: string, access: 'private' | 'public' }
Response: Created tag data.


GET /tags/{tagId}
Description: Retrieve a tag if public or owned.
Response: Tag data or 403/404 error.


PUT /tags/{tagId}
Description: Update a tag if owned.
Body: Same as POST.
Response: Updated tag data or 403 error.


DELETE /tags/{tagId}
Description: Delete a tag if owned.
Response: Success or 403 error.



6.4 Lambda Functions

Structure: One Lambda per endpoint (e.g., createPostLambda, getTagLambda).
Responsibilities:
Validate input using TypeScript interfaces and libraries (e.g., Joi or zod).
Perform DynamoDB operations (put, get, update, delete).
Enforce access control logic.



6.5 Access Control Logic

Get Post:
If access == 'public': Allow.
If access == 'private': Check user_id == authenticated user.
If access.type == 'allowed_user': Query PK=POST#<id>, SK begins_with ALLOWED_USER# and verify user presence.


Get Tag:
If access == 'public': Allow.
If access == 'private': Check user_id == authenticated user.


Assign Tags to Post:
For each tag: Allow if access == 'public' or user_id == authenticated user.



7. Local Development Environment
7.1 Local API Simulation

Tools: Use aws-sam-cli or serverless-offline to simulate AWS Lambda and API Gateway locally.
Data Persistence: Integrate DynamoDB Local for local data storage and testing.
Scripts: Provide npm scripts to start the local environment with a single command (e.g., npm run local).

7.2 API Explorer UI

Tool: Integrate Swagger UI or OpenAPI Explorer for interactive API documentation.
Configuration: Generate or maintain an OpenAPI specification for the API.
Access: Make the UI accessible via a local URL (e.g., http://localhost:3000/docs).
Features: Allow developers to explore endpoints, view request/response schemas, and test API calls directly from the UI.

7.3 Setup Instructions

Prerequisites: List required software (e.g., Node.js, Docker for DynamoDB Local).
Installation: Provide steps to install dependencies and set up the local environment.
Usage: Document how to start the local API and access the explorer UI.
Examples: Include sample requests and responses for key endpoints.

8. Code Quality Standards
8.1 ESLint Configuration

Rules: Use a mainstream TypeScript ESLint configuration (e.g., @typescript-eslint/recommended).
AWS CDK: Apply CDK-specific linting rules if available.
Enforcement: Configure ESLint to run on pre-commit hooks and in CI/CD pipelines.

8.2 Prettier Configuration

Rules: Use a widely adopted Prettier configuration (e.g., prettier-config-standard).
Integration: Set up Prettier to format code on save and enforce formatting in CI/CD.
Consistency: Ensure all team members use the same Prettier settings.

8.3 Additional Tools

TypeScript: Enforce strict type checking with strict: true in tsconfig.json.
Husky/Lint-Staged: Use pre-commit hooks to run linting and formatting automatically.

9. Development and Testing

Codebase: TypeScript for Lambda functions and CDK.
Infrastructure: AWS CDK in TypeScript to define resources.
Unit Tests: Use Jest with aws-sdk-mock for mocking AWS services.
Integration Tests: Add tests that run against the local API to verify end-to-end functionality.
Coverage: Test all CRUD operations, access control scenarios, and local API behavior.
API Explorer Tests: Ensure the UI correctly reflects the API and allows interaction.

10. Deployment

CDK Stack: Deploy Cognito User Pool, DynamoDB table, Lambda functions, and API Gateway.
CI/CD: Set up pipelines for automated testing (including local API tests) and deployment (e.g., GitHub Actions).

11. Future Considerations

Add OAuth providers to Cognito for alternative logins.
Implement friendship features using the friends field.
Extend APIs with pagination and filtering (e.g., GET /posts?access=public).
Optimize costs and performance with monitoring tools (e.g., CloudWatch).

12. Risks and Mitigations

Lambda Cold Starts: Use provisioned concurrency for critical endpoints.
DynamoDB Design: Validate single-table design with realistic workloads.
Security: Regularly audit Cognito and IAM configurations.
Cost Overruns: Set billing alerts and monitor usage.
Local Environment Parity: Ensure local simulation closely matches production behavior.


This updated PRD now includes comprehensive support for a first-class local API with an API explorer UI and enforces strict code quality standards, ensuring a robust and efficient development process.
