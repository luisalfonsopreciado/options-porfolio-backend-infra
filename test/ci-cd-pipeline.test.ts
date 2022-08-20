import { handler as createLambda } from "../lambdas/create";
import * as AWS from "aws-sdk";
import { AWSError, Request } from "aws-sdk";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

jest.mock("aws-sdk");

AWS.DynamoDB.DocumentClient.prototype.put = jest.fn(
  (
    _: AWS.DynamoDB.DocumentClient.PutItemInput,
    cb: any
  ): Request<AWS.DynamoDB.DocumentClient.PutItemOutput, AWSError> => {
    return cb(null, {});
  }
);

const ddbMock = mockClient(DynamoDBDocumentClient);

describe("test create lambda", () => {
  beforeEach(() => {
    jest.resetModules();
    ddbMock.reset();
  });

  //https://docs.aws.amazon.com/codebuild/latest/userguide/test-reporting.html
  test("testCreateLambda", async () => {
    ddbMock.on(PutCommand).resolves({});

    const result = await createLambda({ body: { foo: "bar" } });

    expect(result.statusCode).toEqual(201);
    expect(ddbMock);
  });

  test("testCreateLambdaException", async () => {
    ddbMock.on(PutCommand).rejects("some Error");

    const result = await createLambda({ body: { foo: "bar" } });

    expect(result.statusCode).toEqual(500);
  });
});
