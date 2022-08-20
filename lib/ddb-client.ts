// Create service client module using ES6 syntax.
import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";

declare global {
  interface ReadableStream {}
  interface File {}
}


// Set the AWS Region.
const REGION = "us-east-1"; //e.g. "us-east-1"
const ddbConfig: DynamoDBClientConfig = { region: REGION };

// Create an Amazon DynamoDB service client object.
const ddbClient = new DynamoDBClient(ddbConfig);

export { ddbClient };
