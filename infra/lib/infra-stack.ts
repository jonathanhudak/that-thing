import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';

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
  }
}
