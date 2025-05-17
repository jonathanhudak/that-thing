import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
// import * as iam from 'aws-cdk-lib/aws-iam'; // Removed as it's unused
import * as path from 'path';
// import * as cw_actions from 'aws-cdk-lib/aws-cloudwatch-actions'; // If actions like SNS are needed

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

    // CloudWatch Alarms
    // DynamoDB Write Throttles Alarm
    const _dynamoDbWriteThrottleAlarm = new cloudwatch.Alarm(
      this,
      'DynamoDbWriteThrottleAlarm',
      {
        alarmName: `${this.stackName}-DynamoDB-WriteThrottleEvents`,
        alarmDescription: `Alarm for DynamoDB WriteThrottleEvents on table ${table.tableName}`,
        metric: table.metric('WriteThrottleEvents', {
          statistic: cloudwatch.Statistic.SUM,
          period: cdk.Duration.minutes(5),
        }),
        threshold: 10,
        evaluationPeriods: 1,
        comparisonOperator:
          cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }
    );

    // Cognito SignIn Throttles Alarm
    // Note: 'SignInThrottles' might not be a standard metric directly available via userPool.metric().
    // If it's not, a custom metric or a different standard metric would be needed.
    // For now, proceeding as if it's available or can be created as a Metric object.
    // The test expects MetricName: 'SignInThrottles', Namespace: 'AWS/Cognito'.
    const cognitoSignInThrottleMetric = new cloudwatch.Metric({
      namespace: 'AWS/Cognito',
      metricName: 'SignInThrottles', // As per design spike and test
      dimensionsMap: {
        UserPoolId: userPool.userPoolId,
        // ClientId: userPoolClient.userPoolClientId, // Some Cognito metrics are per UserPool, some per ClientId
      },
      statistic: cloudwatch.Statistic.SUM,
      period: cdk.Duration.minutes(1),
    });

    const _cognitoSignInThrottleAlarm = new cloudwatch.Alarm(
      this,
      'CognitoSignInThrottleAlarm',
      {
        alarmName: `${this.stackName}-Cognito-SignInThrottles`,
        alarmDescription: `Alarm for Cognito SignInThrottles on UserPool ${userPool.userPoolId}`,
        metric: cognitoSignInThrottleMetric,
        threshold: 5,
        evaluationPeriods: 1,
        comparisonOperator:
          cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }
    );

    // API Gateway REST API
    const api = new apigateway.RestApi(this, 'UserProfileApi', {
      restApiName: `${this.stackName}-UserProfileApi`,
      description: 'API for user profiles, posts, and tags.',
      deployOptions: {
        stageName: 'dev', // Default stage, can be configured further
        tracingEnabled: true, // Enable X-Ray tracing
        loggingLevel: apigateway.MethodLoggingLevel.INFO, // Enable execution logging
        dataTraceEnabled: true,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS, // Or specify allowed origins
        allowMethods: apigateway.Cors.ALL_METHODS, // Or specify allowed methods like ['GET', 'POST', 'PUT', 'DELETE']
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
        // statusCode: 200 // Default is 204 for OPTIONS if not specified by integration
      },
      endpointConfiguration: {
        types: [apigateway.EndpointType.REGIONAL],
      },
    });

    // Cognito User Pool Authorizer for API Gateway
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      'ApiCognitoAuthorizer',
      {
        cognitoUserPools: [userPool],
        authorizerName: `${this.stackName}-CognitoAuthorizer`,
        // identitySource: 'method.request.header.Authorization' // Default
      }
    );

    // Lambda Function for GetUserProfile
    const getUserProfileLambda = new lambda.Function(
      this,
      'GetUserProfileLambda',
      {
        functionName: `${this.stackName}-GetUserProfile`,
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset(
          path.join(__dirname, '../../dist/handlers/user')
        ), // Assumes profile.js is in dist/handlers/user
        handler: 'profile.handler', // Filename 'profile.js', function 'handler'
        memorySize: 128,
        timeout: cdk.Duration.seconds(10),
        tracing: lambda.Tracing.ACTIVE, // Enable X-Ray tracing for Lambda
        environment: {
          DDB_TABLE_NAME: table.tableName,
        },
        // Default execution role provides CloudWatch Logs permissions (AWSLambdaBasicExecutionRole)
      }
    );
    // Grant table read access to the lambda
    table.grantReadData(getUserProfileLambda);

    // API Gateway Resources and Methods
    const v1Resource = api.root.addResource('v1'); // /v1
    const meResource = v1Resource.addResource('me'); // /v1/me

    meResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getUserProfileLambda),
      {
        authorizer: authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    // Output API Gateway URL
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'API Gateway base URL',
    });
    new cdk.CfnOutput(this, 'ApiGatewayMeUrl', {
      value: `${api.url}v1/me`,
      description: 'API Gateway /v1/me URL',
    });
  }
}
