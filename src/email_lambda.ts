import { EmailData, Ticket } from './types';
import { SQS } from 'aws-sdk';
import { getUserByName } from './user_lambda';
import { getAttribute } from './user_util';

const sqs = new SQS();

export const postEmail = async (event) => {
	const data = <EmailData>JSON.parse(event.body);
	console.log(data);

	const result = await sendEmail(data);

	if (result.success) {
		console.log('Message queued');

		return {
			statusCode: 200,
			body: JSON.stringify({ status: 'successful' })
		};
	} else {
		return {
			statusCode: 500,
			body: JSON.stringify({ message: result.error })
		};
	}
};

export const sendAssignmentEmail = async (username: string, ticket: Ticket) => {
	const user = await getUserByName(username);
	sendEmail({
		to: getAttribute(user, 'email'),
		from: 'Meerkat Bug Tracker <the.only.t.craft@gmail.com>',
		subject: 'You\'ve been assigned to a new ticket!',
		body: `
		${ticket.title} - ${ticket.author}
		Severity: ${ticket.severity} Priority: ${ticket.priority}
		----
		Description
		${ticket.email_data.description_plain}
		
		Reproduction
		${ticket.email_data.reproduction_plain}
		
		Expected Results
		${ticket.email_data.expected_plain}
		`,
		html_body: `
		<div>
		<h1 style='display: inline'>${ticket.title}</h1>
		<span> - ${ticket.author}</span>
		</div>
		<div>Severity: ${ticket.severity} Priority: ${ticket.priority}</div>
		<hr/>
		<h2>Description</h2>
		${ticket.email_data.description_html}
		<br/>
		<h2>Reproduction</h2>
		${ticket.email_data.reproduction_html}
		<br/>
		<h2>Expected Results</h2>
		${ticket.email_data.expected_html}
		<br/>
		`
	}).then();
};

export const sendEmail = async (email: EmailData): Promise<any> => {
	return new Promise(resolve => {
		sqs.sendMessage({
			QueueUrl: process.env.queueUrl,
			MessageBody: JSON.stringify(email)
		}, (err, result) => {
			if (err) {
				resolve({ success: false, error: err.message });
				return;
			}

			resolve({ success: true });
		});
	});
};