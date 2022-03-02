import * as sst from "@serverless-stack/resources";
import {PermissionType} from "@serverless-stack/resources";

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
            consumer: "src/email_consumer.consumeEmail",
            permissions: ["s3", "ses"]
        });
        queue.attachPermissions(PermissionType.ALL);

        // Create an HTTP API
        const api = new sst.Api(this, "Api", {
            defaultFunctionProps: {
                // Allow the API to access the table
                permissions: [projectTable, ticketTable, userTable, queue],
                // Pass in the table name to our API
                environment: {
                    projectTableName: projectTable.dynamodbTable.tableName,
                    ticketTableName: ticketTable.dynamodbTable.tableName,
                    userTableName: userTable.dynamodbTable.tableName,
                    queueUrl: queue.sqsQueue.queueUrl
                },
            },
            routes: {
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

                // Email :D
                "POST /email": "src/email_lambda.postEmail",
            },
        });

        // Deploy our Svelte app
        const site = new sst.ViteStaticSite(this, "SvelteJSSite", {
            path: "sveltekit",
            environment: {
                // Pass in the API endpoint to our app
                VITE_APP_API_URL: api.url,
            },
            errorPage: "index.html"
        });

        // Deploy a cron-job to send a 'daily digest'
        const cron = new sst.Cron(this, "DailyDigest", {
            schedule: "cron(0 17 * * ? *)", // Cron jobs are in UTC+0 time, so 17 is 10:00 here.
            job: "src/digest.main",
        });
        cron.jobFunction.addEnvironment("queueUrl", queue.sqsQueue.queueUrl);
        cron.attachPermissions([queue]);

        // Show the URLs in the output
        this.addOutputs({
            SiteUrl: site.url,
            ApiEndpoint: api.url,
            QueueUrl: queue.sqsQueue.queueUrl,
        });
    }
}
