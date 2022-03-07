<script lang='ts'>
	import { goto } from '$app/navigation';
	import { Project } from '$lib/structs';
	import { onMount } from 'svelte';
	import Button from '$lib/ui/Button.svelte';
	import { getActiveSession, getCurrentUser } from '$lib/state';
	import * as levenshtein from 'js-levenshtein';

	let project: Project = {
		name: '',
		admin: '',
		users: []
	};

	let users = [];
	let filteredUsers = [];
	let submitting = false;
	let usernameSearch = '';

	onMount(async () => {
		if (!getCurrentUser() || !(await getActiveSession())?.isValid()) {
			await goto('/login');
			return;
		}

		project.admin = getCurrentUser().getUsername();

		fetch(import.meta.env.VITE_APP_API_URL + '/user')
			.then(response => response.json())
			.then(data => {
				if (!data.users) return;

				users = [...data.users];
			});
	});


	const searchUsers = () => {
		const search = usernameSearch.toLowerCase();
		return users
			.filter(user => user.Username.includes(search) && !project.users.includes(user.Username) && project.admin != user.Username)
			.sort((user1, user2) => levenshtein(user1, search) - levenshtein(user2, search))
			.slice(0, 4);
	};

	$: filteredUsers = usernameSearch.length > 0 ? [...searchUsers()] : [];

	// TODO Get the current user as the admin
	// Allow them to add other users as members of the project.
	const submitForm = () => {
		console.log('Clicked.');
		console.log(project);

		submitting = true;
		fetch(import.meta.env.VITE_APP_API_URL + '/project', {
			method: 'post',
			body: JSON.stringify(project)
		})
			.then(res => {
				console.log(res.status);
				if (res.status == 201 || res.status == 200)
					return res.json();
				else
					res.text().then(txt => alert(txt));
			})
			.then(data => {
				if (data)
					goto(`/projects`);
				submitting = false;
			});
	};

	const addUser = (user) => {
		if (project.users.includes(user.Username)) return;

		project.users.push(user.Username);
		project = { ...project };
	};

	let selectedIndex = -1;
	const inputKeyUp = (event: KeyboardEvent) => {
		if (['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key))
			event.preventDefault();

		if (event.key == 'Tab') {
			if (selectedIndex > -1)
				usernameSearch = filteredUsers[selectedIndex].Username;
		} else if (event.key == 'ArrowUp') {
			selectedIndex--;
		} else if (event.key == 'ArrowUp') {
			selectedIndex++;
		} else if (event.key == 'Enter') {
			addUser(filteredUsers[selectedIndex]);
			usernameSearch = '';
		}

		if (selectedIndex >= filteredUsers.length)
			selectedIndex == filteredUsers.length - 1;
		else if (selectedIndex < 0 && filteredUsers.length > 0)
			selectedIndex = 0;
		else if (selectedIndex < -1)
			selectedIndex = -1;
	};

	const inputKeyDown = (event: KeyboardEvent) => {
		if (event.key == 'Tab' && usernameSearch.length > 0)
			event.preventDefault();
	};
</script>

<div>
	<div class='input-form'>
		<input type='text' id='title' name='title' placeholder='Name' bind:value={project.name} />

		<div>
			<h2 class='inline'>Add members...</h2>
			<div class='inline aligned input-users'>
				<input type='text' class='username-search' placeholder='Username' bind:value={usernameSearch}
							 on:keyup={inputKeyUp}
							 on:keydown={inputKeyDown} />
				<div class='user-container'>
					{#each filteredUsers as user, index}
						<div class='user-select' on:click={addUser(user)} class:selected={selectedIndex == index}>
							<span class='avatar'></span>
							<span class='username'>{user.Username}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<h2>Members</h2>
		<hr />
		<div class='added-users'>
			<ul class='user-container'>
				<li class='admin user-select'>{project.admin} <span class='disabled'>(You)</span></li>
				{#if project.users.length > 0}
					{#each project.users as user (user)}
						<li class='user-select'>{user}</li>
					{/each}
				{:else}
					<li class='user-select'>No other members added...</li>
				{/if}
			</ul>
		</div>

		<div class='buttonContainer'>
			<Button on:click={submitForm} color='limegreen' fontColor='white' disabled='{submitting}'>Submit</Button>
			<Button on:click={() => goto("/projects")} color='gray' fontColor='white'>Cancel</Button>
		</div>
	</div>
</div>

<style>
    #title {
        font-size: 2em;
        outline: none;
        border: 2px solid var(--bg-color);
        margin-bottom: 0.2em;
        width: 60%;
    }

    #title:focus {
        border-bottom: 2px solid #007ed0;
    }

    input {
        margin-right: 1.5em;
    }

    .username-search {
        font-size: 1.2em;
        margin: 0;
    }

    .inline {
        display: inline;
    }

    .inline.aligned {
        display: inline-flex;
        flex-direction: column;
        position: relative;
    }

    .buttonContainer {
        display: flex;
        justify-content: flex-end;
    }

    .user-container {
        border: 1px solid var(--border-color);
        width: 100%;
        box-sizing: border-box;
        top: 100%;
        z-index: 5;
    }

    .input-users .user-container {
        position: absolute;
    }

    .user-select {
        padding: 0.5em;
    }

    .input-users .user-select.selected {
        background-color: var(--bg-color-secondary);
    }

    .input-users .user-select:hover {
        background-color: var(--bg-color-secondary);
        cursor: pointer;
    }

    .added-users {
        display: inline-block;
        min-width: 20em;
    }

    ul {
        list-style: none;
        padding: 0;
    }

    li {
        margin: 0.2em auto;
    }

</style>