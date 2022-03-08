import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { GetUserResponse } from 'aws-sdk/clients/cognitoidentityserviceprovider';

interface ErrorData {
	error?: string,
	Username?: string,
	UserAttributes?: []
}

interface Auth {
	value?: ErrorData | GetUserResponse,
	success: boolean,
}

export const handler = async (event) => {
	const authentication: Auth = await authenticate(event);

	// const context = JSON.stringify({
	// 	someString: 'some value',
	// 	someBoolean: true,
	// 	someNumber: 1
	// });

	const result = {
		principalId: authentication.value?.Username || 'unknown',
		policyDocument: buildPolicy(authentication.success ? 'Allow' : 'Deny', event.methodArn),
		context: {}
	};

	return result;
};

const authenticate = async (event) => {
	try {
		const token = getTokenOrThrow(event);
		const info: GetUserResponse | ErrorData = await new Promise(resolve => {
			const provider = new CognitoIdentityServiceProvider();

			provider.getUser({ AccessToken: token },
				(err, response) => {
					if (err) {
						resolve({ error: err.message });
						return;
					}

					provider.adminListGroupsForUser({
						Username: response.Username,
						UserPoolId: process.env.userPoolId
					}, (err, groupResponse) => {
						if (err) {
							resolve({ error: err.message });
							return;
						}

						if (groupResponse.Groups.filter(group => group.GroupName == 'Admin').length == 0) {
							resolve({ error: 'Not in group' });
							return;
						}

						resolve(response);
					});
				});
		});

		if ('error' in info && info.error)
			return { success: false, value: info };

		return { success: true, value: info };
	} catch (error) {
		return { success: false };
	}
};

// The methodArn specifies exactly which function should be
// allowed ou denied access. You could use "*" to allow access
// to any of your functions, though it is always better to keep
// security tight.
const buildPolicy = (effect: string, methodArn: string) => {
	return {
		Version: '2012-10-17',
		Statement: [
			{
				Action: 'execute-api:Invoke',
				Effect: effect,
				Resource: methodArn
			}
		]
	};
};

const getTokenOrThrow = (event) => {
	const auth = (event.authorizationToken || '');
	const [scheme, token] = auth.split(' ', 2);
	if ((scheme || '').toLowerCase() !== 'bearer')
		throw new Error('Authorization header value did not start with \'Bearer\'.');
	if (!token?.length)
		throw new Error('Authorization header did not contain a Bearer token.');

	return token;
};
