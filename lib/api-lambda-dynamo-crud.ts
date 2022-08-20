import {
  IResource,
  LambdaIntegration,
  MockIntegration,
  PassthroughBehavior,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { App, Stack, RemovalPolicy } from "aws-cdk-lib";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { join } from "path";
import { Construct } from "constructs";
import { createResourceNameWithStage } from "./stage-util";

export class ApiLambdaCrudDynamoDBStack extends Stack {
  constructor(scope: Construct, id: string, stageName: string) {
    super(scope, id);

    const tableNameStage = createResourceNameWithStage("items", stageName);

    const dynamoTable = new Table(this, tableNameStage, {
      partitionKey: {
        name: "itemId",
        type: AttributeType.STRING,
      },
      tableName: tableNameStage,
      timeToLiveAttribute: "ttl",
      /**
       *  The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
       * the new table, and it will remain in your account until manually deleted. By setting the policy to
       * DESTROY, cdk destroy will delete the table (even if it has data in it)
       */
      removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
    });

    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: [
          "aws-sdk", // Use the 'aws-sdk' available in the Lambda runtime
        ],
      },
      depsLockFilePath: join(__dirname, "../", "lambdas", "package-lock.json"),
      environment: {
        PRIMARY_KEY: "itemId",
        TABLE_NAME: dynamoTable.tableName,
        STAGE_NAME: stageName, 
      },
      runtime: Runtime.NODEJS_14_X,
    };

    // Create a Lambda function for each of the CRUD operations
    const getOneLambda = new NodejsFunction(
      this,
      createResourceNameWithStage("getOneItemFunction", stageName),
      {
        entry: join(__dirname, "../", "lambdas", "get-one.ts"),
        ...nodeJsFunctionProps,
      }
    );
    const createOneLambda = new NodejsFunction(
      this,
      createResourceNameWithStage("createItemFunction", stageName),
      {
        entry: join(__dirname, "../", "lambdas", "create.ts"),
        ...nodeJsFunctionProps,
      }
    );
    const updateOneLambda = new NodejsFunction(
      this,
      createResourceNameWithStage("updateItemFunction", stageName),
      {
        entry: join(__dirname, "../", "lambdas", "update-one.ts"),
        ...nodeJsFunctionProps,
      }
    );
    const deleteOneLambda = new NodejsFunction(
      this,
      createResourceNameWithStage("deleteItemFunction", stageName),
      {
        entry: join(__dirname, "../", "lambdas", "delete-one.ts"),
        ...nodeJsFunctionProps,
      }
    );

    // Grant the Lambda function read access to the DynamoDB table
    dynamoTable.grantReadWriteData(getOneLambda);
    dynamoTable.grantReadWriteData(createOneLambda);
    dynamoTable.grantReadWriteData(updateOneLambda);
    dynamoTable.grantReadWriteData(deleteOneLambda);

    // Integrate the Lambda functions with the API Gateway resource
    const createOneIntegration = new LambdaIntegration(createOneLambda);
    const getOneIntegration = new LambdaIntegration(getOneLambda);
    const updateOneIntegration = new LambdaIntegration(updateOneLambda);
    const deleteOneIntegration = new LambdaIntegration(deleteOneLambda);

    // Create an API Gateway resource for each of the CRUD operations
    const api = new RestApi(
      this,
      createResourceNameWithStage("itemsApi", stageName),
      {
        restApiName: "Items Service - " + stageName,
      }
    );

    const items = api.root.addResource("items");
    items.addMethod("POST", createOneIntegration);
    addCorsOptions(items);

    const singleItem = items.addResource("{id}");
    singleItem.addMethod("GET", getOneIntegration);
    singleItem.addMethod("PATCH", updateOneIntegration);
    singleItem.addMethod("DELETE", deleteOneIntegration);
    addCorsOptions(singleItem);
  }
}

export function addCorsOptions(apiResource: IResource) {
  apiResource.addMethod(
    "OPTIONS",
    new MockIntegration({
      integrationResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers":
              "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
            "method.response.header.Access-Control-Allow-Origin": "'*'",
            "method.response.header.Access-Control-Allow-Credentials":
              "'false'",
            "method.response.header.Access-Control-Allow-Methods":
              "'OPTIONS,GET,PUT,POST,DELETE'",
          },
        },
      ],
      passthroughBehavior: PassthroughBehavior.NEVER,
      requestTemplates: {
        "application/json": '{"statusCode": 200}',
      },
    }),
    {
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers": true,
            "method.response.header.Access-Control-Allow-Methods": true,
            "method.response.header.Access-Control-Allow-Credentials": true,
            "method.response.header.Access-Control-Allow-Origin": true,
          },
        },
      ],
    }
  );
}
