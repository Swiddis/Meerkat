<script context='module' lang='ts'>
	export const load = async (page) => {
		const searchParams: URLSearchParams = page.url.searchParams;
		const username = searchParams.has('username') ? searchParams.get('username') : undefined;
		console.log(username);

		if (username)
			return {
				props: {
					username,
					supplied: true
				}
			};
		else
			return {};
	};
</script>

<script lang='ts'>
	import { userPool } from '$lib/amazon';
	import { goto } from '$app/navigation';
	import type { ICognitoUserData } from 'amazon-cognito-identity-js';
	import { CognitoUser } from 'amazon-cognito-identity-js';

	export let username;
	export let supplied = false;
	let code;
	let error;

	let userData: ICognitoUserData;
	let cognitoUser: CognitoUser;

	$: if (username) {
		userData = {
			Username: username,
			Pool: userPool
		};
		cognitoUser = new CognitoUser(userData);
	}

	const enter = (event: KeyboardEvent) => {
		if (event.key == 'Enter')
			confirmUser();
	};

	const confirmUser = () => {
		if (!code || code.length == 0) {
			error = 'No code provided!';
			return;
		}

		cognitoUser.confirmRegistration(code, true, function(err, result) {
			if (err) {
				console.log(err);
				if (err.message == 'User cannot be confirmed. Current status is CONFIRMED')
					error = 'Email already confirmed.';
				else if (err.message == 'Invalid verification code provided, please try again.')
					error = 'Invalid code';
				else
					error = `An error has occurred: ${err.message ? err.message : JSON.stringify(err)}`;
				return;
			}

			console.log('call result: ' + result);
			// Success :D
			if (result == 'SUCCESS') {
				alert('Successfully confirmed email address');
				goto('/login');
			}
		});
	};

	const requestNewCode = () => {
		if (!username) {
			error = 'Invalid username provided. Please double check that you have entered it correctly.';
			return;
		}
		cognitoUser.resendConfirmationCode((err, result) => {
			if (err) {
				error = err.message ? err.message : JSON.stringify(err);
				return;
			}

			console.log('call result: ', result);
			if (result)
				alert('Email sent. Check your username.');
		});
	};
</script>

<div class='center'>
	<div class='conf-wrapper center'>
		<h1>Enter Confirmation Code</h1>
		{#if !supplied}
			<label for='username'>Email </label>
			<input name='username'
						 id='username'
						 bind:value={username}
						 placeholder='example@example.com' />
		{/if}
		<label for='code'>Code </label>
		<input name='code'
					 id='code'
					 bind:value={code}
					 on:keydown={enter}
					 placeholder='XXXXXX' />
		<div class='error' class:shown={!!error}>{error}</div>
		<div class='button' on:click={confirmUser}>Confirm</div>
		<div>Don't have a code?
			<a class='link'
				 alt='Resend confirmation code'
				 href='#!'
				 on:click={requestNewCode}>Request a new one</a></div>
	</div>
</div>

<style>
    .center {
        flex-direction: column;
        flex-grow: 1;
    }

    label {
        display: block;
    }

    .conf-wrapper {
        margin: 1em auto;
        font-size: 1.5rem;
    }

    .conf-wrapper input {
        font-size: 1em;
        display: block;
        margin-bottom: 1em;
    }

    .error {
        display: none;
        color: red;
        margin: 0 auto;
        text-align: center;
    }

    .error.shown {
        display: block;
    }
</style>