import { writable } from 'svelte/store';
import type {Writable} from 'svelte/store';
import { userPool } from '$lib/amazon';
import type { CognitoUser, CognitoUserSession, IAuthenticationDetailsData } from 'amazon-cognito-identity-js';
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';

export const loading: Writable<boolean> = writable(false);
export const loggedIn: Writable<boolean> = writable(false);

let cachedUser: CognitoUser | null;
let setFetch = false;

export const overrideFetch = () => {
	if (setFetch) return;

	const ff = window.fetch;
	window.fetch = async function() {
		if (!getCurrentUser()) return ff.apply(this, arguments);

		let args = [...arguments];
		if (args[0].includes(import.meta.env.VITE_APP_API_URL) || args[0].includes('localhost') || args[0].includes('127.0.0.1')) {
			// console.log(args);
			if (args.length >= 2) {
				if (!args[1])
					args[1] = [];
				let details = args[1];
				let headers = details['headers'] ? details['headers'] : {};

				if (!headers.Authorization) {
					let jwt = (await getActiveSession()).getAccessToken().getJwtToken();
					headers.Authorization = 'Bearer ' + jwt;
					// console.log("Added Authorization header", jwt);
				}

				details.headers = headers;
			} else {
				let jwt = (await getActiveSession()).getAccessToken().getJwtToken();
				let headers = { headers: { Authorization: 'Bearer ' + jwt } };
				args.push(headers);
			}
		}
		// console.log(args);
		return ff.apply(this, args);
	};
	setFetch = true;
};

export const overrideXMLSend = () => {
	const send = XMLHttpRequest.prototype.send;
	XMLHttpRequest.prototype.send = async function(data) {
		if (!getCurrentUser()) {
			send.apply(this, data);
			return;
		}

		let jwt = (await getActiveSession()).getAccessToken().getJwtToken();
		console.log(jwt);
		if (jwt) {
			this.setRequestHeader('Authorization', 'Bearer ' + jwt);
			// console.log("Added Authorization");
		}
		send.apply(this, data);
	};
};

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

let fetchingSession = false;
export const getActiveSession = async (): Promise<CognitoUserSession> => {
	if (fetchingSession)
		return null;

	fetchingSession = true;
	return await new Promise(resolve => {
		const user = getCurrentUser();

		if (!user) {
			fetchingSession = false;
			resolve(null);
			return;
		}

		user.getSession((err, session) => {
			if (err) {
				console.log(err);
				fetchingSession = false;
				resolve(null);
				return;
			}

			if (!session.isValid()) {
				user.refreshSession(session.getRefreshToken(), (err, newSession) => {
					if (err) {
						console.log(err);
						fetchingSession = false;
						resolve(null);
						return;
					}

					console.log('Session refreshed.');
					fetchingSession = false;
					resolve(newSession);
				});
			} else {
				fetchingSession = false;
				resolve(session);
			}
		});
	});
};

export const signOut = () => {
	getCurrentUser().signOut();
	cachedUser = null;
	loggedIn.set(false);
};
