import { handler } from "../lambdas/create";
import * as AWS from "aws-sdk";
import { AWSError, Request } from "aws-sdk";

jest.mock("aws-sdk");

AWS.DynamoDB.DocumentClient.prototype.put = jest.fn(
  (
    _: AWS.DynamoDB.DocumentClient.PutItemInput,
    cb: any
  ): Request<AWS.DynamoDB.DocumentClient.PutItemOutput, AWSError> => {
    return cb(null, {});
  }
);

describe("test create lambda", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  //https://docs.aws.amazon.com/codebuild/latest/userguide/test-reporting.html
  test("foo", async () => {
    const result = await handler({ body: { foo: "bar" } });
    expect(result.statusCode).toEqual(201);
    // expect(AWS.DynamoDB.DocumentClient.prototype.put).toBeCalled();
  });
});
