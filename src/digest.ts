import { SQS } from 'aws-sdk';
import { EmailData } from './types';

const sqs = new SQS();

export const main = async () => {
	console.log(new Date().toISOString() + ' Running Cron');
	/* TODO Get users with active issues and fill them in on
			the statuses of said tickets? Would there be a better
			option for what we send to the users?
	 */
	const email: EmailData = {
		to: 'example@mail.com',
		from: 'example2@mail.com',
		subject: 'Daily Digest',
		body: 'This is just a test'
	};

	await sqs.sendMessage({
		QueueUrl: process.env.queueUrl,
		MessageBody: JSON.stringify(email)
	}).promise();
	console.log('Message queued');

	return {
		statusCode: 200,
		body: JSON.stringify({ status: 'success' })
	};
};
