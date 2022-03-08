import { EmailData } from './types';
import { SQS } from 'aws-sdk';

const sqs = new SQS();

export const postEmail = async (event) => {
	const data = <EmailData>JSON.parse(event.body);
	console.log(data);

	await sqs.sendMessage({
		QueueUrl: process.env.queueUrl,
		MessageBody: JSON.stringify(data)
	}).promise();
	console.log('Message queued');

	return {
		statusCode: 200,
		body: JSON.stringify({ status: 'successful' })
	};
};