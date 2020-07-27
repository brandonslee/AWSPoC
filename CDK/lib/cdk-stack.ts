import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as appsync from '@aws-cdk/aws-appsync';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    // Create IAM Role for AppSync to access DynamoDB

    // IAM role creation - Level2 Construct
    // AppSync to DynamoDB
    const role = new iam.Role(this, "MBPDynamoDBAccess", {
      assumedBy: new iam.ServicePrincipal('appsync.amazonaws.com'),
      roleName: 'MBPDynamoDBAccess',  // explicit role name
    });

    let policy = new iam.Policy(this, "DynamoDBAccess", {
      statements: [
        new iam.PolicyStatement({
          resources: [
            'arn:aws:dynamodb:*:*:table/MBPTicketOrder',
            'arn:aws:dynamodb:*:*:table/MBPTicketOrder/*',
            'arn:aws:dynamodb:*:*:table/MBPTicketList',
            'arn:aws:dynamodb:*:*:table/MBPTicketList/*',            
          ],
          actions: [
            "dynamodb:BatchGetItem",
            "dynamodb:BatchWriteItem",
            "dynamodb:PutItem",
            "dynamodb:DeleteItem",
            "dynamodb:GetItem",
            "dynamodb:Scan",
            "dynamodb:Query",
            "dynamodb:UpdateItem"
          ],
        })
      ]
    });
    role.attachInlinePolicy(policy);

    // AppSync to CloudWatch
    const role2 = new iam.Role(this, 'MBPCloudWatchLogging', {
      assumedBy: new iam.ServicePrincipal('appsync.amazonaws.com'),
      roleName: 'MBPCloudWatchLogging', // explicit role name
    })
    role2.addManagedPolicy(iam.ManagedPolicy.fromManagedPolicyArn(this, 'ManagedPolicy', 
      'arn:aws:iam::aws:policy/service-role/AWSAppSyncPushToCloudWatchLogs'));

    
    // DynamoDB creation
    const ddb1 = new dynamodb.Table(this, 'MBPTicketOrder', {
      tableName: 'MBPTicketOrder',  // explicit table name
      partitionKey: { 
        name: 'orderID',
        type: dynamodb.AttributeType.NUMBER },
      readCapacity: 5,
      writeCapacity: 5,
    });

    const ddb2 = new dynamodb.Table(this, 'MBPTicketList', {
      tableName: 'MBPTicketList', // explicit table name
      partitionKey: {
        name: 'ticketID',
        type: dynamodb.AttributeType.NUMBER },
      readCapacity: 5,
      writeCapacity: 5,
    });

    // AppSync creation
    // Level1 Cfn used as Level2 is experimental at the moment
    const graphQLApi = new appsync.CfnGraphQLApi(this, 'MBP API', {
      authenticationType: 'API_KEY',
      name: 'MBP_API',
    });

    
  }
}
