import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as Infra from '../lib/infra-stack';

describe('InfraStack Cognito Resources', () => {
  let app: cdk.App;
  let stack: Infra.InfraStack;
  let template: Template;

  beforeAll(() => {
    app = new cdk.App();
    // WHEN
    stack = new Infra.InfraStack(app, 'MyTestStack');
    // THEN
    template = Template.fromStack(stack);
  });

  test('Cognito User Pool Created with Email as Username and Auto-Verification', () => {
    template.hasResourceProperties('AWS::Cognito::UserPool', {
      UserPoolName: Match.anyValue(), // Or a specific name if we decide to set one
      UsernameAttributes: ['email'],
      AutoVerifiedAttributes: ['email'],
      Policies: {
        PasswordPolicy: {
          MinimumLength: 8, // Example minimum length
          RequireLowercase: true,
          RequireNumbers: true,
          RequireSymbols: true,
          RequireUppercase: true,
        },
      },
      Schema: Match.arrayWith([
        Match.objectLike({
          // Use objectLike for more flexible matching
          Name: 'email',
          Required: true,
          Mutable: false,
          // AttributeDataType is implicitly String for standard email,
          // and not always explicitly rendered in the schema part of the template
          // for standard attributes in a way that `AttributeDataType: 'String'` directly matches.
        }),
      ]),
    });
  });

  test('Cognito User Pool Client Created', () => {
    // Find the logical ID of the UserPool created in the stack
    const userPoolResources = template.findResources('AWS::Cognito::UserPool');
    const userPoolLogicalIds = Object.keys(userPoolResources);
    expect(userPoolLogicalIds.length).toBeGreaterThanOrEqual(1); // Ensure at least one UserPool exists
    const userPoolLogicalId = userPoolLogicalIds[0]; // Assuming the first one found is the one we want to link

    template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
      ClientName: Match.anyValue(), // Or a specific name
      UserPoolId: {
        Ref: userPoolLogicalId,
      },
      GenerateSecret: false, // Common for web/mobile apps not needing a client secret
      SupportedIdentityProviders: ['COGNITO'], // Expecting the default User Pool provider
      ExplicitAuthFlows: Match.arrayWith([
        'ALLOW_USER_SRP_AUTH',
        'ALLOW_REFRESH_TOKEN_AUTH',
        // 'ALLOW_ADMIN_USER_PASSWORD_AUTH' // If admin flows are needed
      ]),
    });
  });
});

describe('InfraStack DynamoDB Resources', () => {
  let app: cdk.App;
  let stack: Infra.InfraStack;
  let template: Template;

  beforeAll(() => {
    app = new cdk.App();
    stack = new Infra.InfraStack(app, 'MyDynamoTestStack'); // Use a different stack name for this test suite if needed
    template = Template.fromStack(stack);
  });

  test('DynamoDB Table Created with Correct Primary Key and Billing Mode', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: Match.anyValue(), // Or a specific name if we decide to set one
      AttributeDefinitions: [
        // Exact match for all required attributes
        { AttributeName: 'PK', AttributeType: 'S' },
        { AttributeName: 'SK', AttributeType: 'S' },
        { AttributeName: 'GSI1PK', AttributeType: 'S' },
        { AttributeName: 'GSI1SK', AttributeType: 'S' },
        { AttributeName: 'GSI2PK', AttributeType: 'S' },
        { AttributeName: 'GSI2SK', AttributeType: 'S' },
        { AttributeName: 'GSI3PK', AttributeType: 'S' },
        { AttributeName: 'GSI3SK', AttributeType: 'S' },
        { AttributeName: 'GSI4PK', AttributeType: 'S' },
        { AttributeName: 'GSI4SK', AttributeType: 'S' },
      ],
      KeySchema: [
        { AttributeName: 'PK', KeyType: 'HASH' },
        { AttributeName: 'SK', KeyType: 'RANGE' },
      ],
      BillingMode: 'PAY_PER_REQUEST',
      StreamSpecification: {
        StreamViewType: 'NEW_AND_OLD_IMAGES',
      },
    });
  });

  test('GSI1 (UserPostsIndex) Created Correctly', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      GlobalSecondaryIndexes: Match.arrayWith([
        Match.objectLike({
          IndexName: 'UserPostsIndex',
          KeySchema: [
            { AttributeName: 'GSI1PK', KeyType: 'HASH' },
            { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
          ],
          Projection: {
            ProjectionType: 'ALL', // Or KEYS_ONLY, INCLUDE as needed
          },
        }),
      ]),
    });
  });

  test('GSI2 (AccessTypePostsIndex) Created Correctly', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      GlobalSecondaryIndexes: Match.arrayWith([
        Match.objectLike({
          IndexName: 'AccessTypePostsIndex',
          KeySchema: [
            { AttributeName: 'GSI2PK', KeyType: 'HASH' },
            { AttributeName: 'GSI2SK', KeyType: 'RANGE' },
          ],
          Projection: {
            ProjectionType: 'ALL',
          },
        }),
      ]),
    });
  });

  test('GSI3 (AllowedUserPostsIndex) Created Correctly', () => {
    // The AttributeDefinitions for GSI keys are checked in the main table test.
    // This test focuses on the GSI structure itself.
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      GlobalSecondaryIndexes: Match.arrayWith([
        Match.objectLike({
          IndexName: 'AllowedUserPostsIndex',
          KeySchema: [
            { AttributeName: 'GSI3PK', KeyType: 'HASH' },
            { AttributeName: 'GSI3SK', KeyType: 'RANGE' },
          ],
          Projection: {
            ProjectionType: 'ALL',
          },
        }),
      ]),
    });
  });

  test('GSI4 (TagPostsSortedIndex) Created Correctly', () => {
    // The AttributeDefinitions for GSI keys are checked in the main table test.
    // This test focuses on the GSI structure itself.
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      GlobalSecondaryIndexes: Match.arrayWith([
        Match.objectLike({
          IndexName: 'TagPostsSortedIndex',
          KeySchema: [
            { AttributeName: 'GSI4PK', KeyType: 'HASH' },
            { AttributeName: 'GSI4SK', KeyType: 'RANGE' },
          ],
          Projection: {
            ProjectionType: 'ALL',
          },
        }),
      ]),
    });
  });
});

describe('InfraStack Observability Resources', () => {
  let app: cdk.App;
  let stack: Infra.InfraStack;
  let template: Template;

  beforeAll(() => {
    app = new cdk.App();
    // It's important that the stack instance here includes the resources
    // that the alarms will be based on (Cognito User Pool, DynamoDB Table).
    // Using a consistent stack name or ensuring the stack is fully composed.
    stack = new Infra.InfraStack(app, 'MyObservabilityTestStack');
    template = Template.fromStack(stack);
  });

  test('CloudWatch Alarm for DynamoDB Write Throttles Created', () => {
    const tableResources = template.findResources('AWS::DynamoDB::Table');
    const tableLogicalIds = Object.keys(tableResources);
    expect(tableLogicalIds.length).toBeGreaterThanOrEqual(1);
    // Note: In a real scenario with multiple tables, you'd need a more specific way to get the table name.
    // Here, we assume the table name can be derived or is known for dimensioning.
    // For this test, we'll assert the dimension uses a Ref to the table.
    // However, CloudWatch alarms often use the actual TableName string.
    // The L2 construct for Alarm on a Table metric usually handles this.

    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      AlarmDescription: Match.anyValue(), // Using anyValue due to Fn::Join for tokenized table name
      Namespace: 'AWS/DynamoDB',
      MetricName: 'WriteThrottleEvents',
      Dimensions: Match.arrayWith([
        Match.objectLike({
          Name: 'TableName',
          Value: { Ref: tableLogicalIds[0] }, // Assumes the L2 construct correctly refs the table
        }),
      ]),
      Statistic: 'Sum',
      Period: 300, // 5 minutes
      EvaluationPeriods: 1,
      Threshold: 10,
      ComparisonOperator: 'GreaterThanOrEqualToThreshold',
      TreatMissingData: 'notBreaching', // Or 'missing', 'ignore', 'breaching'
    });
  });

  test('CloudWatch Alarm for Cognito SignIn Throttles Created', () => {
    const userPoolResources = template.findResources('AWS::Cognito::UserPool');
    const userPoolLogicalIds = Object.keys(userPoolResources);
    expect(userPoolLogicalIds.length).toBeGreaterThanOrEqual(1);
    // Similar to DynamoDB, the UserPoolId is needed for the dimension.

    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      AlarmDescription: Match.anyValue(), // Using anyValue due to Fn::Join for tokenized UserPoolId
      Namespace: 'AWS/Cognito',
      // The design spike confirmed 'SignInThrottles' is the target metric.
      MetricName: 'SignInThrottles', // As per design spike
      Dimensions: Match.arrayWith([
        Match.objectLike({
          Name: 'UserPoolId',
          Value: { Ref: userPoolLogicalIds[0] },
        }),
        // Cognito metrics are often by UserPoolClient as well, or UserPool,ClientId
        // Match.objectLike({ Name: 'ClientId', Value: { Ref: 'logicalIdOfUserPoolClient'} })
        // For simplicity, assuming UserPoolId dimension is sufficient or primary.
      ]),
      Statistic: 'Sum',
      Period: 60, // 1 minute
      EvaluationPeriods: 1,
      Threshold: 5,
      ComparisonOperator: 'GreaterThanThreshold', // "> 5"
      TreatMissingData: 'notBreaching',
    });
  });
});

describe('InfraStack API Gateway and Lambda Resources', () => {
  let app: cdk.App;
  let stack: Infra.InfraStack;
  let template: Template;
  // let userPoolLogicalId: string; // Removed from describe scope

  beforeAll(() => {
    app = new cdk.App();
    stack = new Infra.InfraStack(app, 'MyApiTestStack');
    template = Template.fromStack(stack);
  });

  test('API Gateway REST API Created', () => {
    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Name: Match.stringLikeRegexp('UserProfileApi'), // Or any other naming convention
      EndpointConfiguration: {
        Types: ['REGIONAL'],
      },
    });
  });

  test('GetUserProfile Lambda Function Created', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'profile.handler', // Assuming the file is profile.js in the dist/handlers/user directory
      Runtime: 'nodejs20.x', // Or the specific Node.js version used
      Code: {
        S3Bucket: Match.anyValue(), // CDK handles asset bundling
        S3Key: Match.anyValue(),
      },
      Role: Match.objectLike({
        // Check that a role is assigned via GetAtt
        'Fn::GetAtt': Match.arrayWith([
          Match.stringLikeRegexp('.*'), // Match any string for the role's logical ID
          'Arn',
        ]),
      }),
      TracingConfig: {
        // Basic X-Ray tracing
        Mode: 'Active',
      },
    });
    // Check basic Lambda execution role policies
    // The following hasResourceProperties call will find an IAM::Role that matches
    // the criteria for a Lambda execution role.
    template.hasResourceProperties('AWS::IAM::Role', {
      // To be more robust, we should ensure we are checking the *correct* role.
      // We can do this by finding the role that has lambda.amazonaws.com as a principal.
      // For now, this assertion will check *any* role that matches these properties.
      // If there are multiple roles, this might need refinement to target the specific Lambda execution role.
      // However, the properties below are specific enough for a Lambda execution role.
      AssumeRolePolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: 'Allow',
            Principal: { Service: 'lambda.amazonaws.com' },
            Action: 'sts:AssumeRole',
          }),
        ]),
      }),
      // Check for AWSLambdaBasicExecutionRole
      ManagedPolicyArns: Match.arrayWith([
        Match.objectLike({
          'Fn::Join': [
            '',
            [
              'arn:',
              Match.objectLike({ Ref: 'AWS::Partition' }),
              ':iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
            ],
          ],
        }),
      ]),
      // Check for AWSLambdaBasicExecutionRole (already asserted)
      // Now, check for the inline policy granting DynamoDB read access,
      // which is created by table.grantReadData(). This creates an AWS::IAM::Policy.
    });

    // Find the logical ID of the Lambda's execution role
    const lambdaFunctions = template.findResources('AWS::Lambda::Function');
    const getUserProfileLambdaLogicalIdKey = Object.keys(lambdaFunctions).find(
      (key) => key.includes('GetUserProfileLambda')
    );
    expect(getUserProfileLambdaLogicalIdKey).toBeDefined();
    const lambdaRoleLogicalId =
      lambdaFunctions[getUserProfileLambdaLogicalIdKey!].Properties.Role[
        'Fn::GetAtt'
      ][0];

    // Find the logical ID of the DynamoDB table
    const tableResources = template.findResources('AWS::DynamoDB::Table');
    const tableLogicalId = Object.keys(tableResources)[0]; // Assuming only one table
    expect(tableLogicalId).toBeDefined();

    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyName: Match.stringLikeRegexp(
        'GetUserProfileLambdaServiceRoleDefaultPolicy[A-F0-9]+'
      ), // Match generated policy name
      Roles: Match.arrayWith([{ Ref: lambdaRoleLogicalId }]),
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: 'Allow',
            Action: Match.arrayWith([
              // grantReadData includes these actions
              'dynamodb:BatchGetItem',
              'dynamodb:GetRecords',
              'dynamodb:GetShardIterator',
              'dynamodb:Query',
              'dynamodb:GetItem',
              'dynamodb:Scan',
              'dynamodb:ConditionCheckItem',
              'dynamodb:DescribeTable',
            ]),
            Resource: Match.arrayWith([
              { 'Fn::GetAtt': [tableLogicalId, 'Arn'] },
              {
                'Fn::Join': [
                  '',
                  [{ 'Fn::GetAtt': [tableLogicalId, 'Arn'] }, '/index/*'],
                ],
              }, // Access to indexes
            ]),
          }),
        ]),
      }),
    });
  });

  test('API Gateway /v1/me GET Method with Lambda Integration and Cognito Authorizer', () => {
    // Find the RestApi logical ID
    const restApiResources = template.findResources('AWS::ApiGateway::RestApi');
    const restApiLogicalId = Object.keys(restApiResources)[0];
    expect(restApiLogicalId).toBeDefined();

    // Find the Lambda function logical ID for GetUserProfile
    const lambdaFunctions = template.findResources('AWS::Lambda::Function');
    // This is a simplification; in a real stack with multiple lambdas, you'd need a more robust way to find the correct one.
    // E.g., by checking properties like Handler or a tag.
    // For now, assuming it's the only one or the first one that matches a naming pattern.
    const getUserProfileLambdaLogicalId = Object.keys(lambdaFunctions).find(
      (key) => key.includes('GetUserProfileLambda')
    );
    expect(getUserProfileLambdaLogicalId).toBeDefined();

    // Find the Cognito User Pool Authorizer logical ID
    const userPoolResources = template.findResources('AWS::Cognito::UserPool');
    const userPoolLogicalId = Object.keys(userPoolResources)[0];
    expect(userPoolLogicalId).toBeDefined();

    const authorizerResources = template.findResources(
      'AWS::ApiGateway::Authorizer'
    );
    const authorizerLogicalId = Object.keys(authorizerResources).find((key) => {
      const props = authorizerResources[key].Properties;
      // Ensure ProviderARNs exists and is an array before calling some
      const providerArns = props.ProviderARNs || [];
      return (
        props.Type === 'COGNITO_USER_POOLS' &&
        props.RestApiId.Ref === restApiLogicalId &&
        providerArns.some(
          (arn: any) =>
            arn['Fn::GetAtt'] && arn['Fn::GetAtt'][0] === userPoolLogicalId
        )
      );
    });
    expect(authorizerLogicalId).toBeDefined();

    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'GET',
      AuthorizerId: { Ref: authorizerLogicalId },
      AuthorizationType: 'COGNITO_USER_POOLS',
      Integration: Match.objectLike({
        Type: 'AWS_PROXY',
        IntegrationHttpMethod: 'POST', // Lambda integrations are POST
        Uri: Match.objectLike({
          'Fn::Join': [
            '',
            // This array must match the structure CDK generates for the Lambda URI
            // It typically includes pseudo-parameters for partition and region
            Match.arrayWith([
              'arn:',
              Match.objectLike({ Ref: 'AWS::Partition' }),
              ':apigateway:',
              Match.objectLike({ Ref: 'AWS::Region' }),
              ':lambda:path/2015-03-31/functions/',
              Match.objectLike({
                'Fn::GetAtt': [getUserProfileLambdaLogicalId!, 'Arn'],
              }), // Added non-null assertion as it's checked above
              '/invocations',
            ]),
          ],
        }),
      }),
      // ResourceId should point to the '/me' resource, which is under '/v1'
      // This part of the test can be complex due to how CDK generates logical IDs for resources.
      // We might need to find the specific AWS::ApiGateway::Resource for /v1/me.
    });

    // Test for CORS (basic example, actual config might be more detailed)
    // This checks if ANY method has an OPTIONS method with these headers,
    // which is a common way CDK adds CORS.
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'OPTIONS',
      Integration: Match.objectLike({
        IntegrationResponses: Match.arrayWith([
          Match.objectLike({
            ResponseParameters: {
              'method.response.header.Access-Control-Allow-Headers':
                Match.anyValue(),
              'method.response.header.Access-Control-Allow-Origin': "'*'", // Or specific origin
              'method.response.header.Access-Control-Allow-Methods':
                Match.stringLikeRegexp('.*GET.*'), // Changed to string regex
            },
          }),
        ]),
      }),
    });
  });
});

// Commented out SQS example test removed.
