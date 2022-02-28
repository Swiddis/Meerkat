<script lang="ts">
    import {onMount} from "svelte";
    import type {Project} from "$lib/structs";
    import {goto} from "$app/navigation";
    import Button from "$lib/ui/Button.svelte";

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

<div class="header">
    <h1>Projects</h1>
    <span class="spacer"/>
    <Button on:click={() => goto("/projects/create")}>Create Project</Button>
</div>
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
    .header {
        display: flex;
        align-items: center;
    }

    h1 {
        display: inline;
        margin: 0;
    }
</style>