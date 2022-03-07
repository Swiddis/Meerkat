<script context='module' lang='ts'>
	export const load = async (page) => {
		const searchParams: URLSearchParams = page.url.searchParams;
		const email = searchParams.has('email') ? searchParams.get('email') : undefined;
		console.log(email);

		if (email)
			return {
				props: {
					email,
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

	export let email;
	export let supplied = false;
	let code;
	let error;

	const emailRegex = /^(\w+[+.\w-]*)@(([\w-]+\.?)*)\.([a-z]+)$/i;

	let userData: ICognitoUserData;
	let cognitoUser: CognitoUser;

	$: if (email) {
		userData = {
			Username: email,
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
		if (!email || !emailRegex.test(email)) {
			error = 'Invalid email provided. Please double check that you have entered it correctly.';
			return;
		}
		cognitoUser.resendConfirmationCode((err, result) => {
			if (err) {
				error = err.message ? err.message : JSON.stringify(err);
				return;
			}

			console.log('call result: ', result);
			if (result)
				alert('Email sent. Check your email.');
		});
	};
</script>

<div class='center'>
	<div class='conf-wrapper center'>
		<h1>Enter Confirmation Code</h1>
		{#if !supplied}
			<label for='email'>Email </label>
			<input name='email'
						 id='email'
						 bind:value={email}
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
		<div class='button' on:click={requestNewCode}>Request a new code</div>
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