<script>
	import { goto } from '$app/navigation';
	import { buildAttrib, userPool } from '$lib/amazon';

	let form, email, user, password, confPassword;
	let error;

	const emailRegex = /^(\w+[+.\w-]*)@(([\w-]+\.?)*)\.([a-z]+)$/i;
	const userRegex = /\w{4,}/;
	// Password must contain 1 letter, 1 number, 1 special character, and must be 8+ characters long
	const passRegex = /^(?=(.*[A-Za-z])+)(?=(.*\d)+)(?=(.*[@$!%*#?&]){1,}).{8,}$/;

	const validateForm = () => {
		if (!form) return false;
		let emailValid = emailRegex.test(email);
		let userValid = userRegex.test(user);
		let passwordValid = passRegex.test(password);
		let passMatch = password == confPassword;

		console.log('Email: ' + emailValid);
		console.log('User: ' + userValid);
		console.log('Password: ' + passwordValid);
		console.log('Match: ' + passMatch);

		if (!emailValid)
			error = 'Email is invalid';
		else if (!userValid)
			error = 'Username must be at least 4 characters';
		else if (!passwordValid)
			error = 'Password must be at least 8 letters, include 1 upper and 1 lowercase letter,' +
				' 1 number, and 1 special character.';

		return emailValid && userValid && passwordValid && passMatch;
	};

	const doRegister = () => {
		if (validateForm()) signUpUser();
	};

	const signUpUser = () => {
		let attributeList = [buildAttrib('email', email)];

		let cognitoUser;
		userPool.signUp(user, password, attributeList, null, (err, result) => {
			if (err) {
				// Uh-oh.
				// alert('We\'ve encountered a problem...');
				error = err.message ? err.message : JSON.stringify(err);
				return;
			}

			cognitoUser = result.user;
			console.log('User saved. "Username" is ' + cognitoUser.getUsername());
			// Success :D -- Move on to get confirmation
			goto(`/confirm?username=${user}`);
		});
	};
</script>

<section id='body' class='center'>
	<section class='content'>
		<form bind:this={form} id='register'>
			<input type='text' placeholder='Email' bind:value={email} />
			<input type='text' placeholder='Username' bind:value={user} />
			<input type='password' placeholder='Password' bind:value={password} />
			<input type='password' placeholder='Confirm Password' bind:value={confPassword} />
			<div class='button' on:click={doRegister}>Register</div>
			<div class='error' class:shown={!!error}>{error}</div>
		</form>
		<div class='register-text'>Already have an account? <a href='/login'>Login Here!</a></div>
	</section>
</section>

<style>
    .error.shown {
        display: block;
    }

    .error {
        display: none;
    }
</style>
