import * as sst from "@serverless-stack/resources";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as apigAuthorizers from "@aws-cdk/aws-apigatewayv2-authorizers-alpha";
// import {PermissionType} from "@serverless-stack/resources";

export default class MeerkatStack extends sst.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create the tables
    const projectTable = new sst.Table(this, "Project", {
      fields: {
        id: sst.TableFieldType.STRING,
        name: sst.TableFieldType.STRING,
        admin: sst.TableFieldType.STRING, // TODO flesh out permissions
        users: [sst.TableFieldType.STRING]
      },
      primaryIndex: {partitionKey: "id"}
    });

    const ticketTable = new sst.Table(this, "Ticket", {
      fields: {
        id: sst.TableFieldType.STRING,
        project: sst.TableFieldType.STRING,
        author: sst.TableFieldType.STRING,
        timestamp: sst.TableFieldType.STRING,
        assigned_to: sst.TableFieldType.STRING,
        status: sst.TableFieldType.STRING,
        resolution: sst.TableFieldType.STRING,
        type: sst.TableFieldType.STRING,
        severity: sst.TableFieldType.NUMBER,
        priority: sst.TableFieldType.NUMBER,
        title: sst.TableFieldType.STRING,
        description: sst.TableFieldType.STRING,
        reproduction_steps: sst.TableFieldType.STRING,
        expected_result: sst.TableFieldType.STRING,
      },
      primaryIndex: {partitionKey: "id"},
    });

    const userTable = new sst.Table(this, "User", {
      fields: {
        id: sst.TableFieldType.STRING,
        username: sst.TableFieldType.STRING,
        email: sst.TableFieldType.STRING
      },
      primaryIndex: {partitionKey: "id"}
    });

    const queue = new sst.Queue(this, "EmailQueue", {
      consumer: "src/email_consumer.consumeEmail"
    });
    queue.attachPermissions(sst.PermissionType.ALL);

    const userPool = new cognito.UserPool(this, "UserPool", {
      selfSignUpEnabled: true,
      signInAliases: {email: true, username: true, preferredUsername: true},
      signInCaseSensitive: false,

    });

    const userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      userPool,
      authFlows: {userPassword: true, userSrp: true},
    });

    const defaultAuthorizer = new apigAuthorizers.HttpUserPoolAuthorizer("Authorizer", userPool, {
      userPoolClients: [userPoolClient]
    });
    const defaultAuthorizationType = sst.ApiAuthorizationType.JWT;

    const buildAuthenticatedEndpoint = (handler) => {
      return {
        function: handler,
        authorizer: defaultAuthorizer,
        authorizationType: defaultAuthorizationType,
      };
    };

    // Create a HTTP API
    const api = new sst.Api(this, "Api", {
      // defaultAuthorizer,
      // defaultAuthorizationType,
      defaultFunctionProps: {
        // Allow the API to access the table
        permissions: [projectTable, ticketTable, userTable],
        // Pass in the table name to our API
        environment: {
          projectTableName: projectTable.dynamodbTable.tableName,
          ticketTableName: ticketTable.dynamodbTable.tableName,
          userTableName: userTable.dynamodbTable.tableName,
          queueUrl: queue.sqsQueue.queueUrl,
          userPoolId: userPool.userPoolId,
          userPoolClientId: userPoolClient.userPoolClientId
        },
      },
      routes: {
        /*
         Maybe this should be authenticated... Maybe not.
         The point is, we can (and maybe should) authenticate
         individual endpoints rather than the lot.
        */
        // "GET /ticket": buildAuthenticatedEndpoint("src/ticket_lambda.getTickets"),
        "GET /ticket": "src/ticket_lambda.getTickets",
        "GET /ticket/{id}": "src/ticket_lambda.getTicket",
        "POST /ticket": "src/ticket_lambda.createTicket",
        "DELETE /ticket/{id}": "src/ticket_lambda.deleteTicket",
        "PUT /ticket/{id}": "src/ticket_lambda.updateTicket",
        "GET /user": "src/user_lambda.getUsers",
        "GET /user/{id}": "src/user_lambda.getUser",
        "POST /user": "src/user_lambda.createUser",
        "DELETE /user/{id}": "src/user_lambda.deleteUser",
        "PUT /user/{id}": "src/user_lambda.updateUser",
        "GET /project/{id}/ticket": "src/ticket_lambda.getTicketsByProject",
        "GET /project": "src/project_lambda.getProjects",
        "GET /project/{id}": "src/project_lambda.getProject",
        "POST /project": "src/project_lambda.createProject",
        "DELETE /project/{id}": "src/project_lambda.deleteProject",
        "PUT /project/{id}": "src/project_lambda.updateProject",
        "POST /email": "src/email_lambda.postEmail",

        // "POST /signup": "src/user_lambda.signUpUser",
        // "POST /confirm": "src/user_lambda.confirmUser",
      },
    });

    // Deploy our Svelte app
    const site = new sst.ViteStaticSite(this, "SvelteJSSite", {
      path: "sveltekit",
      environment: {
        // Pass in the API endpoint to our app
        VITE_APP_API_URL: api.url,
        VITE_COGNITO_POOL: userPool.userPoolId,
        VITE_COGNITO_ID: userPoolClient.userPoolClientId
      },
      errorPage: "index.html"
    });

    // Show the URLs in the output
    this.addOutputs({
      SiteUrl: site.url,
      ApiEndpoint: api.url,
      QueueUrl: queue.sqsQueue.queueUrl,
      UserPoolId: userPool.userPoolId,
      UserPoolClientId: userPoolClient.userPoolClientId
    });
  }
}
