import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { unmarshallOutput } from "@aws-sdk/lib-dynamodb/dist-types/commands/utils";
import { ddbClient } from "../lib/ddb-client";
import { createResourceNameWithStage } from "../lib/stage-util";

const TABLE_NAME =
  (process.env.TABLE_NAME && process.env.STAGE_NAME)
    ? createResourceNameWithStage(
        process.env.TABLE_NAME,
        process.env.STAGE_NAME
      )
    : "testEnvironmentTableName";

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
    const response: GetCommandOutput = await ddb.send(new GetCommand(params));
    if (response.Item) {
      delete response.Item["ttl"];
      const body = unmarshallOutput(response.Item, []);
      
      return {
        statusCode: 200,
        body,
        headers: {
          "Access-Control-Allow-Origin":
            "https://luisalfonsopreciado.github.io",
        },
      };
    } else {
      return { statusCode: 404 };
    }
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};
