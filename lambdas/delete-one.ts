import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ddbClient } from "../lib/ddb-client";

const TABLE_NAME = process.env.TABLE_NAME || "testEnvironmentTableName";
const PRIMARY_KEY = process.env.PRIMARY_KEY || "testEnvironmentPrimaryKey";

const ddb = DynamoDBDocumentClient.from(ddbClient);

const pathParameterErrorResponse = {
  statusCode: 400,
  body: `Error: You are missing the path parameter id`,
};

export const handler = async (event: any = {}): Promise<any> => {
  if (!event.pathParameters) {
    return pathParameterErrorResponse;
  }

  const requestedItemId = event.pathParameters.id;
  if (!requestedItemId) {
    return pathParameterErrorResponse;
  }

  const params = {
    TableName: TABLE_NAME,
    Key: {
      [PRIMARY_KEY]: requestedItemId,
    },
  };

  try {
    await ddb.send(new DeleteCommand(params));
    return {
      statusCode: 200,
      body: "",
      headers: {
        "Access-Control-Allow-Origin": "https://luisalfonsopreciado.github.io",
      },
    };
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};
