import { CognitoIdentityServiceProvider, DynamoDB } from 'aws-sdk';
import { UserType } from 'aws-sdk/clients/cognitoidentityserviceprovider';

const dynamoDb = new DynamoDB.DocumentClient();

// TODO validation
function validateUser(user) {
	return [true, ''];
}

export const getUsers = async () => {
	const provider = new CognitoIdentityServiceProvider();

	const requestParams = {
		UserPoolId: process.env.userPoolId
		// AttributesToGet: [
		// 	'sub',
		// 	'username',
		// 	'email'
		// 	// more items
		// ]
		// Filter: 'phone_number="+someNumber"',
		// Limit: 10
	};

	const result: any = await new Promise(resolve => {
		provider.listUsers(requestParams, (err, response) => {
			if (err) {
				resolve({ error: err });
				return;
			}

			let users: UserType[] & any = response.Users || [];
			console.log(users);

			resolve({ users: users });
			return;
		});
	});

	if (result.error) {
		return {
			statusCode: 500,
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ error: result.error })
		};
	} else {
		return {
			statusCode: 200,
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ users: result.users })
		};
	}

	// const params = {
	// 	TableName: process.env.userTableName
	// };
	// let results = await dynamoDb.scan(params).promise();
	// return {
	// 	statusCode: 200,
	// 	headers: { 'Content-Type': 'application/json' },
	// 	body: JSON.stringify(results.Items)
	// };
};

export const getUser = async (event) => {
	const user = await getUserByName(event.pathParameters.id);

	if (user == null) {
		return {
			statusCode: 404
		};
	}

	return {
		statusCode: 200,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(user)
	};
};

export const getUserByName = async (username: string): Promise<UserType | null> => {
	const provider = new CognitoIdentityServiceProvider();

	const results = await new Promise<any>(resolve => {
		provider.adminGetUser({
			Username: username,
			UserPoolId: process.env.userPoolId
		}, (err, response) => {
			if (err) {
				resolve({ success: false, error: err.message });
				return;
			}

			resolve({ success: true, user: response });
		});
	});

	console.log(results);

	return results.success ? results.user : null;
};

// The more I look at this, the more it really does make sense on the front-end.
/*const poolData = {
  UserPoolId: process.env.userPoolId,
  ClientId: process.env.userPoolClientId
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

const buildAttrib = (name, value) => {
  return new AmazonCognitoIdentity.CognitoUserAttribute({Name: name, Value: value});
}

export const signUpUser = async (event) => {
  const body = JSON.parse(event.body);
  const email = body.email;
  const username = body.username;
  const password = body.password;

  let attributeList = [
    buildAttrib('custom:username', username),
    buildAttrib('email', email)
  ];

  let cognitoUser;
  let resolution: any = await new Promise(resolve => {
    userPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) {
        resolve({error: err.message});
        return;
      }

      cognitoUser = result.user;
      console.log('User saved. "Username" is ' + cognitoUser.getUsername());
      resolve(cognitoUser);
    });
  });

  console.log(resolution);

  if (resolution.error) {
    return {
      statusCode: 400,
      body: JSON.stringify(resolution)
    };
  }

  return {
    statusCode: 201
  };
}

export const confirmUser = async (event) => {
  const body = JSON.parse(event.body);
  const userData = {
    Username: body.email,
    Pool: userPool,
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.confirmRegistration(body.code, true, function (err, result) {
    if (err) {
      alert(err.message || JSON.stringify(err));
      return;
    }
    console.log('call result: ' + result);
  });
  //Return something... success :D
  return {
    statusCode: 200,
    body: JSON.stringify({success: true})
  };
}*/

export const promoteUser = async (event) => {
	const provider = new CognitoIdentityServiceProvider();

	const user = event.pathParameters.id;

	const response: any = await new Promise(resolve => {

		provider.adminAddUserToGroup({
			UserPoolId: process.env.userPoolId,
			Username: user,
			GroupName: 'Admin'
		}, (err, response) => {
			if (err) {
				resolve({ error: err.message });
				return;
			}

			resolve({ result: response });
		});
	});

	if (response.error) {
		return {
			statusCode: 400,
			headers: { 'Content-Type': 'text/plain' },
			body: JSON.stringify({ success: false, message: response.error })
		};
	} else {
		return {
			statusCode: 200,
			headers: { 'Content-Type': 'text/plain' },
			body: JSON.stringify({ success: true })
		};
	}

};

export const createUser = async (event) => {
	let user = JSON.parse(event.body);

	let validate = validateUser(user);
	if (!validate[0]) {
		return {
			statusCode: 422,
			headers: { 'Content-Type': 'text/plain' },
			body: validate[1]
		};
	}

	const params = {
		TableName: process.env.userTableName,
		Item: {
			id: user.id,
			username: user.username,
			email: user.email
		}
	};

	await dynamoDb.put(params).promise();
	return {
		statusCode: 201,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(params.Item)
	};
};

export const updateUser = async (event) => {
	let user = JSON.parse(event.body);

	let validate = validateUser(user);
	if (!validate[0]) {
		return {
			statusCode: 422,
			headers: { 'Content-Type': 'text/plain' },
			body: validate[1]
		};
	}

	const params = {
		TableName: process.env.userTableName,
		Key: {
			'id': event.pathParameters.id
		},
		ExpressionAttributeValues: {
			':username': user.username,
			':email': user.email
		},
		UpdateExpression: 'SET username = :username, email = :email',
		ReturnValues: 'ALL_NEW'
	};

	let result = await dynamoDb.update(params).promise();
	return {
		statusCode: 200,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(result.Attributes)
	};
};

export const deleteUser = async (event) => {
	const params = {
		Key: {
			'id': event.pathParameters.id
		},
		TableName: process.env.userTableName
	};
	await dynamoDb.delete(params).promise();
	return {
		statusCode: 204
	};
};
