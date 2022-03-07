<script lang='ts'>
	import { goto } from '$app/navigation';
	import { authenticate } from '$lib/state';

	let form, user, pass;
	let loading = false;
	let error;

	const validateForm = () => {
		return form && user && pass && user.length >= 1 && pass.length >= 1;
	};

	const doLogin = async () => {
		if (!validateForm()) return;

		loading = true;
		let result = await authenticate(user, pass);

		loading = false;
		if (result.success)
			goto('/');
		else
			error = result.error.message;
	};


</script>

<section id='body' class='center'>
	<!-- TODO Hook up forms! -->
	<section class='content'>
		<form bind:this={form} id='login'>
			<input type='text' placeholder='Username' bind:value={user} />
			<input type='password' placeholder='Password' bind:value={pass} />
			<div class='button' on:click={doLogin}>
				{loading ? "Logging in..." : "Login"}
			</div>
			<div class='error' class:shown={!!error}>{error}</div>
		</form>
		<div class='register-text'>Don't have an account? <a href='/register'>Register Here!</a></div>
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