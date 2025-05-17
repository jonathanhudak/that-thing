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

// Commenting out the SQS example test as it's not relevant now
// test('SQS Queue Created', () => {
//   const app = new cdk.App();
//   // WHEN
//   const stack = new Infra.InfraStack(app, 'MyTestStack');
//   // THEN
//   const template = Template.fromStack(stack);

//   template.hasResourceProperties('AWS::SQS::Queue', {
//     VisibilityTimeout: 300
//   });
// });
