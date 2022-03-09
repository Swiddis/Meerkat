import { SQS } from 'aws-sdk';
import { EmailData } from './types';
import { getUsers } from './user_lambda';
import { getTicketsByAssignedUser } from './ticket_lambda';
import { getAttribute } from './user_util';

const sqs = new SQS();

const emailFormat = `
The following tickets still need your attention:
{tickets}
These tickets are unresolved and pending next steps!
- The Meerkat Team
`;

export const main = async () => {
	console.log(new Date().toISOString() + ' Running Cron');
	/* TODO Get users with active issues and fill them in on
			the statuses of said tickets? Would there be a better
			option for what we send to the users?
	 */

	const userData = await getUsers();
	const users = JSON.parse(userData.body).users;
	const messages: EmailData[] = [];
	let index = 0;

	for (const user of users) {
		const ticketData = await getTicketsByAssignedUser(user.Username);

		if (ticketData.statusCode && ticketData.statusCode == 404)
			continue;

		const tickets = JSON.parse(ticketData.body);
		console.log(tickets);

		let ticketText = '';
		for (const ticket of tickets) {
			ticketText += `"${ticket.title}" posted by ${ticket.author}. Severity: ${ticket.severity} Priority: ${ticket.priority}\n\n`;
		}

		const emailText = emailFormat
			.replace('{tickets}', ticketText);

		const email: EmailData = {
			to: getAttribute(user, 'email'),
			from: 'Meerkat Bug Tracker <the.only.t.craft@gmail.com>', // We need a sender here...
			subject: 'Meerkat Daily Digest',
			body: emailText
		};

		messages.push(email);
	}

	if (messages.length > 0) {
		await sqs.sendMessageBatch({
			QueueUrl: process.env.queueUrl,
			Entries: messages.map(message => {
				return {
					Id: String(index++),
					MessageBody: JSON.stringify(message)
				};
			})
		}).promise();
		console.log('Messages queued');
	} else
		console.log('No messages to queue.');

	return {
		statusCode: 200,
		body: JSON.stringify({ status: 'success' })
	};
};
