import { AWSError, Request, SES } from 'aws-sdk';
import { SendEmailRequest, SendEmailResponse } from 'aws-sdk/clients/ses';
import { PromiseResult } from 'aws-sdk/lib/request';
import { EmailData } from './types';

const ses = new SES({
	region: 'us-west-2'
});

export const consumeEmail = async (event) => {
	console.log('Received Message.');
	for (const record of event.Records) {
		const email: EmailData = JSON.parse(record.body);
		console.log('Sending email to ' + email.to);

		const request: SendEmailRequest = {
			Destination: {
				ToAddresses: email.to.split(';')
			},
			Message: {
				Subject: {
					Data: email.subject
				},
				Body: {
					Text: {
						Data: email.body
					}
				}
			},
			Source: email.from
		};

		if (email.html_body) {
			request.Message.Body.Html = {
				Data: email.html_body
			};
		}

		try {
			const req: Request<SendEmailResponse, AWSError> = ses.sendEmail(request);
			const res = <PromiseResult<SendEmailResponse, AWSError>>await req.promise();
			const data: SendEmailResponse | void = res.$response.data;

			console.log(data);
			console.log('Email sent successfully.');

			return {
				statusCode: 201
			};
		} catch (err) {
			console.log('There was an error. Email could not be sent.');
			console.log(err);
			return {
				statusCode: 500,
				body: JSON.stringify(err)
			};
		}
	}
};
