<script lang='ts'>
	import { onMount } from 'svelte';
	import type { Project } from '$lib/structs';
	import Button from '$lib/ui/Button.svelte';
	import Loading from '$lib/Loading.svelte';

	let projects: Project[];

	onMount(() => {
		fetch(import.meta.env.VITE_APP_API_URL + '/project')
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
				<a href='{project.id}'>
					<h2>{project.name}</h2>
				</a>
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
</style>