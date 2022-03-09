<script lang='ts'>
	import { onMount } from 'svelte';
	import type { Project } from '$lib/structs';
	import Button from '$lib/ui/Button.svelte';
	import Loading from '$lib/Loading.svelte';
	import { getCurrentUser } from '$lib/state';
	import { goto } from '$app/navigation';

	let projects: Project[];

	onMount(() => {
		const user = getCurrentUser();

		if (!user) {
			goto('/login');
			return;
		}

		fetch(import.meta.env.VITE_APP_API_URL + '/project/user/' + user.getUsername())
			.then((response) => response.json())
			.then((data) => {
				console.log(data);
				projects = data;
			});
	});
</script>

<div class='header'>
	<h1>Projects</h1>
	<span class='spacer' />
	<a href='create'>
		<Button color='#4ad028' fontColor='white'>Create Project</Button>
	</a>
</div>
<hr />
<div>
	{#if !projects}
		<Loading>Loading...</Loading>
	{:else}
		{#if projects.length == 0}
			You don't have any projects. <a href='create' alt='Create a project'>Create a project!</a>
		{:else}
			{#each projects as project}
				<div class='project'>
					<div class='title-line'>
						<h2>
							<a href='{project.id}'>
								{project.name}
							</a>
							<span class='members'>{project.admin} ({project.users.length + (project.admin ? 1 : 0)} members)</span>
						</h2>
						<a href='#' alt='Edit {project.name}' class='edit'><span class='material-icons'>edit</span></a>
					</div>
				</div>
			{/each}
		{/if}
	{/if}
</div>

<style>
    .header {
        display: flex;
        align-items: center;
    }

    h1 {
        display: inline;
        margin: 0;
    }

    a {
        text-decoration: none;
    }

    .members {
        font-size: 1rem;
        margin-left: 0.5em;
    }

    h2, .title-line {
        display: flex;
        align-items: center;
    }

    .edit .material-icons {
        color: var(--fg-color);
        font-size: 1.5rem;
        margin-left: 0.5em;
    }
</style>