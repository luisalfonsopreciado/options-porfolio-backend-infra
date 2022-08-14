import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import { ApiLambdaCrudDynamoDBStack } from './api-lambda-dynamo-crud';

export class MyPipelineAppStage extends cdk.Stage {
    
    constructor(scope: Construct, stageName: string, props?: cdk.StageProps) {
      super(scope, stageName, props);
  
      const lambdaStack = new ApiLambdaCrudDynamoDBStack(this, 'LambdaStack', stageName);      
    }
}
