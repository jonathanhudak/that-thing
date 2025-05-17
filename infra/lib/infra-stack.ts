import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // Cognito User Pool
    const userPool = new cognito.UserPool(this, 'ApiUserPool', {
      // Logical ID will be derived from 'ApiUserPool'
      userPoolName: `${this.stackName}-UserPool`, // Example of a dynamic name
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        // username: false, // Explicitly disable username if email is the primary alias
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: false, // Typically, verified email is not mutable or requires re-verification
        },
        // Add other standard attributes if needed, e.g., profile, given_name, family_name
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireDigits: true, // Changed from RequireNumbers to requireDigits
        requireSymbols: true,
        requireUppercase: true,
        tempPasswordValidity: cdk.Duration.days(7),
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Or RETAIN/SNAPSHOT for production
    });

    // Cognito User Pool Client
    const userPoolClient = new cognito.UserPoolClient(
      this,
      'ApiUserPoolClient',
      {
        userPool: userPool,
        userPoolClientName: `${this.stackName}-AppClient`,
        authFlows: {
          userSrp: true, // Secure Remote Password
          // adminUserPassword: true, // If admin auth flow is needed
        },
        // Explicitly disable generateSecret for client-side applications
        // For server-side apps that can protect a secret, set to true.
        generateSecret: false,
        // refreshTokenValidity: cdk.Duration.days(30), // Default is 30 days
        // accessTokenValidity: cdk.Duration.minutes(60), // Default is 60 minutes
        // idTokenValidity: cdk.Duration.minutes(60), // Default is 60 minutes
        // supportedIdentityProviders: [], // No third-party IdPs initially
      }
    );

    // Output the User Pool ID and Client ID
    new cdk.CfnOutput(this, 'UserPoolIdOutput', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'UserPoolClientIdOutput', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });

    // DynamoDB Table (Single-Table Design)
    const table = new dynamodb.Table(this, 'ApiSingleTable', {
      tableName: `${this.stackName}-MainTable`,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Or RETAIN for production

      // Define attributes for GSIs if they are different from PK/SK
      // Note: Attributes used in GSIs must be defined here if not already part of the primary key.
      // The CDK L2 construct for Table will automatically add GSI key attributes
      // to AttributeDefinitions if they are specified in addGlobalSecondaryIndex.
      // So, explicit definition here is only needed if they are not used as GSI keys
      // but are still required for some other reason (which is not the case here).
    });

    // GSI1: UserPostsIndex
    table.addGlobalSecondaryIndex({
      indexName: 'UserPostsIndex',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI2: AccessTypePostsIndex
    table.addGlobalSecondaryIndex({
      indexName: 'AccessTypePostsIndex',
      partitionKey: { name: 'GSI2PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI2SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI3: AllowedUserPostsIndex
    table.addGlobalSecondaryIndex({
      indexName: 'AllowedUserPostsIndex',
      partitionKey: { name: 'GSI3PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI3SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI4: TagPostsSortedIndex
    table.addGlobalSecondaryIndex({
      indexName: 'TagPostsSortedIndex',
      partitionKey: { name: 'GSI4PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI4SK', type: dynamodb.AttributeType.STRING }, // Assuming post_created_at is stored as string for GSI SK
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Output the Table Name
    new cdk.CfnOutput(this, 'TableNameOutput', {
      value: table.tableName,
      description: 'Main DynamoDB Table Name',
    });
    new cdk.CfnOutput(this, 'TableArnOutput', {
      value: table.tableArn,
      description: 'Main DynamoDB Table ARN',
    });
  }
}
