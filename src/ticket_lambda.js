import AWS from "aws-sdk";
import { randomUUID } from "crypto";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

// TODO add remaining required fields to validation
function validateTicket(ticket) {
  if (!("status" in ticket) || ["open", "resolved", "closed"].indexOf(ticket.status) < 0) {
    return [false, "Ticket status missing or invalid"];
  }
  if (("resolution" in ticket) && [null, "fixed", "by design", "won't fix", "postponed", "duplicate", "not reproducible"].indexOf(ticket.resolution) < 0) {
    return [false, "Ticket resolution invalid"];
  }
  if (!("type" in ticket) || ["bug", "suggestion", "todo"].indexOf(ticket.type) < 0) {
    return [false, "Ticket type missing or invalid"];
  }
  if (!("severity" in ticket) || ticket.severity < 0 || ticket.severity > 6) {
    return [false, "Ticket severity missing or outside of 0-6 range"];
  }
  if (!("priority" in ticket) || ticket.priority < 0 || ticket.priority > 2) {
    return [false, "Ticket priority missing or outside 0-2 range"];
  }
  if (!("title" in ticket)) {
    return [false, "Ticket title missing or invalid"];
  }
  if (!("description" in ticket)) {
    return [false, "Ticket description missing"];
  }
  return [true, ""];
}

export async function getTickets(event, context) {
  const params = {
    TableName: process.env.ticketTableName,
  }
  let results = await dynamoDb.scan(params).promise();
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(results.Items)
  }
}

export async function getTicket(event, context) {
  console.log(JSON.stringify(event));
  console.log(event.pathParameters.id)
  const params = {
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": event.pathParameters.id,
    },
    TableName: process.env.ticketTableName,
  }
  let results = await dynamoDb.query(params).promise();

  if (results.Items.length == 0) {
    return {
      statusCode: 404
    }
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(results.Items[0])
  }
}

export async function createTicket(event, context) {
  let ticket = JSON.parse(event.body);
  console.log(ticket);

  let validate = validateTicket(ticket);
  if (!validate[0]) {
    return {
      statusCode: 422,
      headers: { 'Content-Type': 'text/plain' },
      body: validate[1]
    };
  }

  const params = {
    TableName: process.env.ticketTableName,
    Item: {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      project: ticket.project,
      author: ticket.author,
      assigned_to: ticket.assigned_to,
      status: ticket.status,
      resolution: ticket.resolution,
      type: ticket.type,
      severity: ticket.severity,
      priority: ticket.priority,
      title: ticket.title,
      description: ticket.description,
      reproduction_steps: ticket.reproduction_steps,
      expected_result: ticket.expected_result
    }
  };

  console.log(params);

  await dynamoDb.put(params).promise();
  return {
    statusCode: 201,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params.Item)
  }
}
