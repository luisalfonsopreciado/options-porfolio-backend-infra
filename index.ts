import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CiCdAwsPipelineStack } from "./lib/ci-cd-pipeline";

const app = new cdk.App();
new CiCdAwsPipelineStack(app, "CiCdAwsPipelineStack", {
  env: {
    account: "402245779373",
    region: "us-east-1",
  },
});

app.synth();
