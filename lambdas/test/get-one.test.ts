import { handler as getLambda } from "../get-one";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const ddbMock = mockClient(DynamoDBDocumentClient);

describe("test get lambda", () => {
  beforeEach(() => {
    jest.resetModules();
    ddbMock.reset();
  });

  test("testGetLambda", async () => {
    ddbMock.on(GetCommand).resolves({ Item: { foo: "bar" } });

    const result = await getLambda({ pathParameters: { id: "someId" } });

    expect(result.statusCode).toEqual(200);
    expect(result.body).toBeDefined();
  });

  test("testGetLambdaNoID", async () => {
    ddbMock.on(GetCommand).resolves({});

    const result = await getLambda({ pathParameters: {} });

    expect(result.statusCode).toEqual(400);
  });

  test("testGetLambdaException", async () => {
    ddbMock.on(GetCommand).rejects("some Error");

    const result = await getLambda({ pathParameters: { id: "someId" } });

    expect(result.statusCode).toEqual(500);
  });
});
