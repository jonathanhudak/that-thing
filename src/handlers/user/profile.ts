import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const DDB_TABLE_NAME = process.env.DDB_TABLE_NAME;
if (!DDB_TABLE_NAME) {
  throw new Error(
    'DynamoDB table name (DDB_TABLE_NAME) is not set in environment variables.'
  );
}

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Event received:', JSON.stringify(event, null, 2));

  const userId = event.requestContext.authorizer?.claims?.sub;

  if (!userId) {
    console.error('User ID (sub) not found in authorizer claims.');
    return {
      statusCode: 401, // Unauthorized or Forbidden
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'User ID not found in token.' }),
    };
  }

  console.log(`Fetching profile for user ID: ${userId}`);

  const params = {
    TableName: DDB_TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: 'PROFILE',
    },
  };

  try {
    const command = new GetCommand(params);
    const { Item } = await docClient.send(command);

    if (Item) {
      console.log('Profile found:', Item);
      // Remove PK/SK from response if they are not part of the user-facing profile model
      const { PK: _PK, SK: _SK, ...profileData } = Item;
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(profileData),
      };
    } else {
      console.log(`Profile not found for PK: USER#${userId}, SK: PROFILE`);
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'User profile not found.' }),
      };
    }
  } catch (error) {
    console.error('Error fetching user profile from DynamoDB:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: 'Failed to retrieve user profile.',
        error: errorMessage,
      }),
    };
  }
};
