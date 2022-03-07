import { Writable, writable } from 'svelte/store';
import { userPool } from '$lib/amazon';
import type { CognitoUser, CognitoUserSession, IAuthenticationDetailsData } from 'amazon-cognito-identity-js';
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';

export const loading: Writable<boolean> = writable(false);
export const loggedIn: Writable<boolean> = writable(false);

let cachedUser: CognitoUser | null;

export const getCurrentUser = (): CognitoUser | null => cachedUser ? cachedUser : (cachedUser = userPool.getCurrentUser());

export const authenticate = async (user, pass) => {
	let authenticationData: IAuthenticationDetailsData = {
		Username: user,
		Password: pass
	};

	let authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
		authenticationData
	);

	let userData = {
		Username: user,
		Pool: userPool
	};
	let cognitoUser: CognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

	return new Promise(resolve => {
		cognitoUser.authenticateUser(authenticationDetails, {
			onSuccess: (result) => {
				loggedIn.set(true);
				resolve({ success: true });
			},

			onFailure: (error) => {
				resolve({ success: false, error });
			}
		});
	});
};

export const getActiveUserAttributes = async (): Promise<any> => {

	return await new Promise(async (resolve) => {
		let user = getCurrentUser();
		if (!user) {
			resolve(null);
			return;
		}

		let session = await getActiveSession();
		if (!session.isValid()) {
			resolve(null);
			return;
		}

		user.getUserAttributes((err, attributes) => {
			if (err) {
				console.log(err);
				resolve(null);
				return;
			}

			let ret = {};

			for (let attrib of attributes) {
				ret[attrib.Name] = attrib.Value;
			}

			resolve(ret);
		});
	});
};

export const getActiveSession = async (): Promise<CognitoUserSession> => {
	return await new Promise(resolve => {
		const user = getCurrentUser();

		if (!user) {
			resolve(null);
			return;
		}

		user.getSession((err, session) => {
			if (err) {
				console.log(err);
				resolve(null);
				return;
			}

			if (!session.isValid()) {
				user.refreshSession(session.getRefreshToken(), (err, newSession) => {
					if (err) {
						console.log(err);
						resolve(null);
						return;
					}

					console.log('Session refreshed.');
					resolve(newSession);
				});
			} else {
				resolve(session);
			}
		});
	});
};