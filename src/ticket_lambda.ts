import { DynamoDB } from 'aws-sdk';
import { sendAssignmentEmail } from './email_lambda';
import { Ticket } from './types';
import { v4 as randomUUID } from 'uuid';

const dynamoDb = new DynamoDB.DocumentClient();

// TODO add remaining required fields to validation
function validateTicket(ticket) {
	if (!('status' in ticket) || ['open', 'resolved', 'closed'].indexOf(ticket.status) < 0) {
		return [false, 'Ticket status missing or invalid'];
	}
	if (('resolution' in ticket) && [null, 'fixed', 'by design', 'won\'t fix', 'postponed', 'duplicate', 'not reproducible', 'unresolved'].indexOf(ticket.resolution) < 0) {
		return [false, 'Ticket resolution invalid'];
	}
	if (!('type' in ticket) || ['bug', 'suggestion', 'todo'].indexOf(ticket.type) < 0) {
		return [false, 'Ticket type missing or invalid'];
	}
	if (!('severity' in ticket) || ticket.severity < 0 || ticket.severity > 6) {
		return [false, 'Ticket severity missing or outside of 0-6 range'];
	}
	if (!('priority' in ticket) || ticket.priority < 0 || ticket.priority > 2) {
		return [false, 'Ticket priority missing or outside 0-2 range'];
	}
	if (!ticket.title || ticket.title.trim() == '') {
		return [false, 'Ticket title missing or invalid'];
	}
	if (!ticket.description || ticket.description.trim() == '') {
		return [false, 'Ticket description missing'];
	}
	return [true, ''];
}

export async function getTickets(event) {

	if (event.queryStringParameters) {
		if (event.queryStringParameters.status)
			return getTicketsByStatus(event.queryStringParameters.status);
	}

	const params = {
		TableName: process.env.ticketTableName
	};
	const results = await dynamoDb.scan(params).promise();
	return {
		statusCode: 200,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(results.Items)
	};
}

export async function getTicketsByStatus(status: string) {
	const params = {
		FilterExpression: 'status = :status',
		ExpressionAttributeValues: {
			':status': status
		},
		TableName: process.env.ticketTableName
	};

	const results = await dynamoDb.scan(params).promise();
	return {
		statusCode: 200,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(results.Items)
	};
}

export async function getTicketsByProject(event) {
	const params = {
		FilterExpression: '#proj = :proj',
		ExpressionAttributeNames: {
			'#proj': 'project'
		},
		ExpressionAttributeValues: {
			':proj': event.pathParameters.id
		},
		TableName: process.env.ticketTableName
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
}

export async function getTicket(event) {
	const params = {
		KeyConditionExpression: 'id = :id',
		ExpressionAttributeValues: {
			':id': event.pathParameters.id
		},
		TableName: process.env.ticketTableName
	};
	const results = await dynamoDb.query(params).promise();

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

export async function getTicketsByAssignedUser(user) {
	const params = {
		FilterExpression: 'assigned_to = :user',
		ExpressionAttributeValues: {
			':user': user
		},
		TableName: process.env.ticketTableName
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
}

export async function createTicket(event) {
	let ticket: Ticket = JSON.parse(event.body);

	let validate = validateTicket(ticket);
	if (!validate[0]) {
		return {
			statusCode: 422,
			headers: { 'Content-Type': 'text/plain' },
			body: validate[1]
		};
	}
	const id = randomUUID();
	const params = {
		TableName: process.env.ticketTableName,
		Item: {
			id,
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

	for (let assignment of ticket.assigned_to.split(',')) {
		try {
			console.log('Queuing email to ' + assignment);
			sendAssignmentEmail(assignment, ticket).then();
		} catch (e) {
		}
	}

	return {
		statusCode: 201,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(params.Item)
	};
}

export async function updateTicket(event) {
	const ticket = JSON.parse(event.body);

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
		Key: {
			'id': event.pathParameters.id
		},
		ExpressionAttributeNames: {
			'#project': 'project',
			'#status': 'status',
			'#type': 'type'
		},
		ExpressionAttributeValues: {
			':project': ticket.project,
			':author': ticket.author,
			':assigned_to': ticket.assigned_to ? ticket.assigned_to : [],
			':status': ticket.status,
			':resolution': ticket.resolution,
			':type': ticket.type,
			':severity': ticket.severity,
			':priority': ticket.priority,
			':title': ticket.title,
			':description': ticket.description,
			':reproduction_steps': ticket.reproduction_steps,
			':expected_result': ticket.expected_result
		},
		UpdateExpression: 'SET #project = :project,' +
			' author = :author, assigned_to = :assigned_to, #status = :status,' +
			' resolution = :resolution, #type = :type, severity = :severity,' +
			' priority = :priority, title = :title, description = :description,' +
			' reproduction_steps = :reproduction_steps, expected_result = :expected_result',
		ReturnValues: 'ALL_NEW'
	};

	let result = await dynamoDb.update(params).promise();
	return {
		statusCode: 200,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(result.Attributes)
	};
}

export async function deleteTicket(event) {
	const params = {
		Key: {
			'id': event.pathParameters.id
		},
		TableName: process.env.ticketTableName
	};
	await dynamoDb.delete(params).promise();
	return {
		statusCode: 204
	};
}
