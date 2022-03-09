import * as AWS from 'aws-sdk';
import { randomUUID } from 'crypto';
import { Project } from './types';
import { sendProjectEmail } from './email_lambda';
import { getUsersInList } from './user_lambda';
import { UserType } from 'aws-sdk/clients/cognitoidentityserviceprovider';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

// TODO validation
function validateProject(project) {
	return [true, ''];
}

export async function getProjects() {
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

export const getProjectsForUser = async (event) => {
	const user = event.pathParameters.user;
	const params = {
		FilterExpression: 'admin = :user or contains(#users, :user)',
		ExpressionAttributeNames: {
			'#users': 'users'
		},
		ExpressionAttributeValues: {
			':user': user
		},
		TableName: process.env.projectTableName
	};
	const results = await dynamoDb.scan(params).promise();

	if (results.Items.length == 0) {
		return {
			statusCode: 404
		};
	}

	return {
		statusCode: 200,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(results.Items)
	};
};

const getProjectById = async (id: string): Promise<Project> => {
	const params = {
		KeyConditionExpression: 'id = :id',
		ExpressionAttributeValues: {
			':id': id
		},
		TableName: process.env.projectTableName
	};
	let results = await dynamoDb.query(params).promise();

	if (results.Items.length == 0)
		return null;

	return <Project>results.Items[0];

};

export async function getProject(event) {
	const project = await getProjectById(event.pathParameters.id);

	if (project) {
		return {
			statusCode: 200,
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(project)
		};
	} else {
		return {
			statusCode: 404
		};
	}
}

export async function createProject(event) {
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

export async function updateProject(event) {
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

export async function deleteProject(event) {
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

export const getUsersByProject = async (event) => {
	const projectId = event.pathParameters.id;
	const project = await getProjectById(projectId);

	if (!project) {
		return {
			statusCode: 404
		};
	} else {
		// Get users for this project
		project.users.push(project.admin);
		const users: UserType[] = await getUsersInList(project.users);
		return {
			statusCode: 200,
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(users)
		};
	}
};