import * as AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { createResourceNameWithStage } from "../lib/stage-util";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddbClient } from "../lib/ddb-client";

const TABLE_NAME =
  (process.env.TABLE_NAME && process.env.STAGE_NAME)
    ? createResourceNameWithStage(
        process.env.TABLE_NAME,
        process.env.STAGE_NAME
      )
    : "testEnvironmentTableName";

const PRIMARY_KEY = process.env.PRIMARY_KEY || "testEnvironmentPrimaryKey";

const ddb =  DynamoDBDocumentClient.from(ddbClient);

export const handler = async (event: any = {}): Promise<any> => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: "invalid request, you are missing the parameter body",
    };
  }
  const item =
    typeof event.body == "object" ? event.body : JSON.parse(event.body);
  item[PRIMARY_KEY] = uuidv4();
  const params = {
    TableName: TABLE_NAME,
    Item: item,
  };

  const secondsSinceEpoch = Math.round(Date.now() / 1000);
  const expirationTime = secondsSinceEpoch + 900; // 15 minutes
  item.ttl = expirationTime;

  try {
    await ddb.send(new PutCommand(params));
    return {
      statusCode: 201,
      body: item[PRIMARY_KEY],
      headers: {
        "Access-Control-Allow-Origin": "https://luisalfonsopreciado.github.io",
      },
    };
  } catch (e: unknown) {
    const dbError = e as any;
    return { statusCode: 500, body: dbError };
  }
};
