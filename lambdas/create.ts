import { v4 as uuidv4 } from "uuid";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddbClient } from "../lib/ddb-client";
import * as util from "./util";

const TABLE_NAME = process.env.TABLE_NAME || "testEnvironmentTableName";
const PRIMARY_KEY = process.env.PRIMARY_KEY || "testEnvironmentPrimaryKey";

const ddb = DynamoDBDocumentClient.from(ddbClient);

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

  item.ttl = util.getExpirationTime(15); // 15 minutes

  try {
    await ddb.send(new PutCommand(params));
    return {
      statusCode: 201,
      body: item[PRIMARY_KEY],
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
  } catch (e: unknown) {
    const dbError = e as any;
    return {
      statusCode: 500,
      body: dbError,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
  }
};
