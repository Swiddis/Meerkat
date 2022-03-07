import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';
import type { CognitoUserPool } from 'amazon-cognito-identity-js';

export const poolData = {
	UserPoolId: import.meta.env.VITE_COGNITO_POOL,
	ClientId: import.meta.env.VITE_COGNITO_ID
};
export const userPool: CognitoUserPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

export const buildAttrib = (name, value) => {
	return new AmazonCognitoIdentity.CognitoUserAttribute({ Name: name, Value: value });
};