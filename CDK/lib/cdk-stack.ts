import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam'

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    // Create IAM Role for AppSync to access DynamoDB

    // IAM role creation
    // Level2 Construct
    const role = new iam.Role(this, "MBPDynamoDBAccess", {
      assumedBy: new iam.ServicePrincipal('appsync.amazonaws.com'),
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

    const role2 = new iam.Role(this, 'MBPCloudWatchLogging', {
      assumedBy: new iam.ServicePrincipal('appsync.amazonaws.com'),
    })
    role2.addManagedPolicy(iam.ManagedPolicy.fromManagedPolicyArn(this, 'ManagedPolicy', 
      'arn:aws:iam::aws:policy/service-role/AWSAppSyncPushToCloudWatchLogs'));

    
    
  }
}
