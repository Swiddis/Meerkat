<script lang='ts'>
	import { goto } from '$app/navigation';
	import { Project } from '$lib/structs';
	import { onMount } from 'svelte';
	import Button from '$lib/ui/Button.svelte';
	import { getActiveSession, getCurrentUser } from '$lib/state';
	import UserSelect from '$lib/ui/UserSelect.svelte';

	let project: Project = {
		name: '',
		admin: '',
		users: []
	};

	let submitting = false;

	onMount(async () => {
		if (!getCurrentUser() || !(await getActiveSession())?.isValid()) {
			await goto('/login');
			return;
		}

		project.admin = getCurrentUser().getUsername();
	});

	const filterUsers = (username) => !project.users.includes(username);

	// TODO Get the current user as the admin
	// Allow them to add other users as members of the project.
	const submitForm = () => {
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

	const removeUser = (user: string) => {
		project.users = project.users.filter(us => us != user);
		project = { ...project };
	};
</script>

<div>
	<div class='input-form'>
		<input type='text' id='title' name='title' placeholder='Name' bind:value={project.name} />

		<div>
			<h2 class='inline'>Add members...</h2>
			<UserSelect owner='{project.admin}' filterFunc='filterUsers' />
		</div>

		<h2>Members</h2>
		<hr />
		<div class='added-users'>
			<ul class='user-container'>
				<li class='admin user-select'>{project.admin} <span class='disabled'>(You)</span></li>
				{#if project.users.length > 0}
					{#each project.users as user (user)}
						<li class='user-select'>
							<span class='username'>{user}</span>
							<span class='spacer' />
							<span class='remove material-icons' title='Remove user' on:click={removeUser(user)}>close</span>
						</li>
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

    .added-users .user-select {
        display: flex;
        align-items: center;
    }

    .added-users .remove.material-icons {
        color: red;
        display: none;
        font-size: 1em;
        font-weight: bold;
    }

    .remove:hover {
        cursor: pointer;
    }

    .user-select:hover .remove {
        display: inline;
    }

    ul {
        list-style: none;
        padding: 0;
    }

    li {
        margin: 0.2em auto;
    }

</style>