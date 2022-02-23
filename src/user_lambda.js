import AWS from "aws-sdk";
import { randomUUID } from "crypto";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

// TODO validation
function validateUser(user) {
  return [true, ""];
}

export async function getUsers(event, context) {
  const params = {
    TableName: process.env.userTableName,
  }
  let results = await dynamoDb.scan(params).promise();
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(results.Items)
  }
}

export async function getUser(event, context) {
  const params = {
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": event.pathParameters.id,
    },
    TableName: process.env.userTableName,
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

export async function createUser(event, context) {
  let user = JSON.parse(event.body);

  let validate = validateUser(user);
  if (!validate[0]) {
    return {
      statusCode: 422,
      headers: { 'Content-Type': 'text/plain' },
      body: validate[1]
    };
  }

  const params = {
    TableName: process.env.userTableName,
    Item: {
      id: randomUUID(),
      username: user.username,
      email: user.email
    }
  };

  await dynamoDb.put(params).promise();
  return {
    statusCode: 201,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params.Item)
  }
}

export async function updateUser(event, context) {
  let user = JSON.parse(event.body);

  let validate = validateUser(user);
  if (!validate[0]) {
    return {
      statusCode: 422,
      headers: { 'Content-Type': 'text/plain' },
      body: validate[1]
    };
  }

  const params = {
    TableName: process.env.userTableName,
    Key: {
      "id": event.pathParameters.id
    },
    ExpressionAttributeValues: {
      ":username": user.username,
      ":email": user.email
    },
    UpdateExpression: "SET username = :username, email = :email",
    ReturnValues: "ALL_NEW"
  };

  let result = await dynamoDb.update(params).promise();
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result.Attributes)
  };
}

export async function deleteUser(event, context) {
  const params = {
    Key: {
      "id": event.pathParameters.id
    },
    TableName: process.env.userTableName,
  }
  await dynamoDb.delete(params).promise();
  return {
    statusCode: 204
  };
}
