import * as AWS from 'aws-sdk';
import { randomUUID } from 'crypto';
import { Project } from './types';
import { sendProjectEmail } from './email_lambda';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

// TODO validation
function validateProject(project) {
	return [true, ''];
}

export async function getProjects(event, context) {
	const params = {
		TableName: process.env.projectTableName
	};
	let results = await dynamoDb.scan(params).promise();
	return {
		statusCode: 200,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(results.Items)
	};
}

export async function getProject(event, context) {
	const params = {
		KeyConditionExpression: 'id = :id',
		ExpressionAttributeValues: {
			':id': event.pathParameters.id
		},
		TableName: process.env.projectTableName
	};
	let results = await dynamoDb.query(params).promise();

	if (results.Items.length == 0) {
		return {
			statusCode: 404
		};
	}

	return {
		statusCode: 200,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(results.Items[0])
	};
}

export async function createProject(event, context) {
	let project: Project = JSON.parse(event.body);

	let validate = validateProject(project);
	if (!validate[0]) {
		return {
			statusCode: 422,
			headers: { 'Content-Type': 'text/plain' },
			body: validate[1]
		};
	}

	const params = {
		TableName: process.env.projectTableName,
		Item: {
			id: randomUUID(),
			name: project.name,
			admin: project.admin,
			users: project.users
		}
	};

	await dynamoDb.put(params).promise();

	for (let user of project.users) {
		try {
			console.log('Queuing email to ' + user);
			sendProjectEmail(user, project).then();
		} catch (e) {
		}
	}

	return {
		statusCode: 201,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(params.Item)
	};
}

export async function updateProject(event, context) {
	let project = JSON.parse(event.body);

	let validate = validateProject(project);
	if (!validate[0]) {
		return {
			statusCode: 422,
			headers: { 'Content-Type': 'text/plain' },
			body: validate[1]
		};
	}

	const params = {
		TableName: process.env.projectTableName,
		Key: {
			'id': event.pathParameters.id
		},
		ExpressionAttributeNames: {
			'#name': 'name',
			'#users': 'users'
		},
		ExpressionAttributeValues: {
			':name': project.name,
			':admin': project.admin,
			':users': project.users
		},
		UpdateExpression: 'SET #name = :name, admin = :admin, #users = :users',
		ReturnValues: 'ALL_NEW'
	};

	let result = await dynamoDb.update(params).promise();
	return {
		statusCode: 200,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(result.Attributes)
	};
}

export async function deleteProject(event, context) {
	const params = {
		Key: {
			'id': event.pathParameters.id
		},
		TableName: process.env.projectTableName
	};
	await dynamoDb.delete(params).promise();
	return {
		statusCode: 204
	};
}
