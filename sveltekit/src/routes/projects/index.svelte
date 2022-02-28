<script lang="ts">
    import {onMount} from "svelte";
    import type {Project} from "$lib/structs";

    let projects: Project[];

    onMount(() => {
        fetch(import.meta.env.VITE_APP_API_URL + "/project")
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                projects = data;
            });
    });
</script>

<h1>Projects</h1>
<hr/>
<div>
    {#if !projects}
        Loading...
    {:else}
        {#if projects.length == 0}
            You don't have any projects. <a href="/projects/create" alt="Create a project">Create a project!</a>
        {:else}
            {#each projects as project}

            {/each}
        {/if}
    {/if}
</div>

<style>

</style>