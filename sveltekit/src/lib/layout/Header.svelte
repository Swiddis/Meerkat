<script>
	//Define nav bar routes here and which pages should be authenticated.
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { getActiveSession, getCurrentUser, loggedIn } from '$lib/state';

	let pages = [
		{
			path: '/',
			title: 'Home'
		},
		{
			path: '/projects',
			title: 'Projects'
		}
		// Have to navigate to tickets within a project
		// {
		//     path: "/ticket",
		//     title: "Tickets"
		// }
	];

	onMount(() => {
		getActiveSession().then(session => {
			loggedIn.set(session && session.isValid());
		});
	});

	const logout = () => {
		getCurrentUser().signOut();
		loggedIn.set(false);
	};
</script>

<header>
	<img src='/meerkat.png' alt='logo' id='logo' />
	<nav>
		<ul>
			{#each pages as pg}
				{#if !pg.hidden}
					<!--{#if pg.auth && $loggedIn || !pg.auth}-->
					<a sveltekit:prefetch href={pg.path} class='nav-button'
						 alt='{pg.alt || pg.title}'
						 class:active={$page.url.pathname === pg.path}>
						<li>{pg.title}</li>
					</a>
					<!--{/if}-->
				{/if}
			{/each}
		</ul>
	</nav>
	<div class='spacer' />
	{#if !$loggedIn}
		<a href='/login' class='login nav-button' alt='Login'>Login</a>
	{:else}
		<div class='user-container'>
			<span>Welcome, {getCurrentUser().getUsername()}</span>
		</div>
		<a href='#!' class='login nav-button' alt='Logout' on:click={logout}>Logout</a>
	{/if}
</header>

<style>
    header {
        font-size: 1.2em;
        background-color: var(--header-bg-color);
        color: var(--header-fg-color);
        display: flex;
        flex-direction: row;
        align-items: stretch;
        position: sticky;
        top: 0;
        z-index: 10;
        padding: 0 1em;
    }

    #logo {
        height: 4em;
        margin: 0.3em 1em 0.3em 0.3em;
        object-position: center;
        object-fit: fill;
    }

    nav {
        display: flex;
        align-items: stretch;
    }

    ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        align-items: stretch;
    }

    ul > * {
        margin: 0 1px;
    }

    ul li {
        margin: 1em;
    }

    .spacer {
        flex-grow: 1;
    }

    .login.nav-button {
        padding: 1em;
        margin: 0.5em 0 0.5em 0.5em;
    }

    .nav-button {
        background-color: var(--button-bg);
        color: var(--button-fg);
        box-shadow: 0 0 3px #444;
        margin: 0.5em 0.25em;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 1em;
        user-select: none;
        box-sizing: border-box;
        border-top: 0 solid var(--button-bg);
        transition: border-radius 0.25s ease, border-top 0.25s ease, background-color 0.25s ease;
    }

    .nav-button:hover {
        border-radius: 0 0 1em 1em;
        border-top: 5px solid var(--nav-hover);
        background-color: var(--button-hover);
    }

    .nav-button.active {
        border-radius: 0 0 1em 1em;
        border-top: 5px solid var(--link-color);
    }

    .user-container {
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>