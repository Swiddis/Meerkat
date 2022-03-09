<script context='module' lang='ts'>
	import type { Project } from '$lib/structs';

	export async function load(page) {
		const projectId = page.params.projectId;
		console.log('Project ID is ' + projectId);


		let response = await fetch(import.meta.env.VITE_APP_API_URL + '/project/' + projectId);
		if (response.ok) {
			const project: Project = await response.json();

			return {
				props: {
					project
				}
			};
		} else
			return {
				status: 302,
				redirect: '/projects'
			};
	}
</script>

<script lang='ts'>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getCurrentUser } from '$lib/state';
	import UserSelect from '$lib/ui/UserSelect.svelte';
	import { slide } from 'svelte/transition';
	import Button from '$lib/ui/Button.svelte';

	export let project: Project;
	let noAccess = false;
	let submitting = false;

	onMount(() => {
		const user = getCurrentUser();
		console.log(project);
		if (!user) {
			goto('/login');
			return;
		} else if (user.getUsername() != project.admin) {
			noAccess = true;
		}
	});

	const filterUsers = (user) => !project.users.includes(user) && user != project.admin;

	const addUser = (user) => {
		if (project.users.includes(user))
			return;

		project.users.push(user);
		project = { ...project };
	};

	const removeUser = (user) => {
		project.users = project.users.filter(us => us != user);
		project = { ...project };
	};

	const saveProject = () => {
		submitting = true;
		fetch(`${import.meta.env.VITE_APP_API_URL}/project/${project.id}`, {
			method: 'put',
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
					goto(`/projects/${project.id}`);
				submitting = false;
			});
	};

</script>

<div>
	{#if noAccess}
		<h1 class='error'>You're not the owner of this project. You can't edit it.</h1>
	{:else}
		<div class='project'>
			<h1>{project.name}</h1>
			<div>Owner: {project.admin}</div>
			<hr />
			<span>Add more users? </span>
			<UserSelect filterFunc='{filterUsers}' on:addUser={event => addUser(event.detail.Username)} />

			<br />
			<div class='added-users'>
				<ul class='user-container'>
					<li class='admin user-select'>
						<span class='avatar'></span>
						<span class='username'>{project.admin} <span class='disabled'>(Admin)</span></span>
					</li>
					{#if project.users.length > 0}
						{#each project.users as user (user)}
							<li class='user-select' transition:slide>
								<span class='avatar'></span>
								<span class='username'>{user}</span>
								<span class='spacer' />
								<span class='remove material-icons' title='Remove user' on:click={removeUser(user)}>close</span>
							</li>
						{/each}
					{:else}
						<li class='user-select' transition:slide>No other members added...</li>
					{/if}
				</ul>
			</div>
			<div class='buttonContainer'>
				<Button on:click={saveProject} color='limegreen' fontColor='white' disabled='{submitting}'>Save</Button>
				<Button on:click={() => goto(`/projects/${project.id}`)} color='gray' fontColor='white'>Cancel</Button>
			</div>
		</div>
	{/if}
</div>

<style>
    .user-container {
        border: 1px solid var(--border-color);
        width: 100%;
        box-sizing: border-box;
        top: 100%;
        z-index: 5;
    }

    .user-select {
        padding: 0.5em;
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

    .avatar {
        display: inline-block;
        border-radius: 50%;
        background-color: black;
        height: 1.5em;
        aspect-ratio: 1;
        margin-right: 0.5em
    }


    ul {
        list-style: none;
        padding: 0;
    }

    li {
        margin: 0.2em auto;
    }

    .buttonContainer {
        display: flex;
        justify-content: flex-end;
    }
</style>