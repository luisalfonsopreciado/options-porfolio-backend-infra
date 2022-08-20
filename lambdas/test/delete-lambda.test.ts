import { handler as deleteLambda } from "../delete-one";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const ddbMock = mockClient(DynamoDBDocumentClient);

describe("test delete lambda", () => {
  beforeEach(() => {
    jest.resetModules();
    ddbMock.reset();
  });

  test("testDeleteLambda", async () => {
    ddbMock.on(DeleteCommand).resolves({});

    const result = await deleteLambda({ pathParameters: { id: "someId" } });

    expect(result.statusCode).toEqual(200);
    expect(ddbMock);
  });

  test("testDeleteLambdaNoID", async () => {
    ddbMock.on(DeleteCommand).resolves({});

    const result = await deleteLambda({});

    expect(result.statusCode).toEqual(400);
    expect(ddbMock);
  });

  test("testDeleteLambdaException", async () => {
    ddbMock.on(DeleteCommand).rejects("some Error");

    const result = await deleteLambda({ pathParameters: { id: "someId" } });

    expect(result.statusCode).toEqual(500);
  });
});
