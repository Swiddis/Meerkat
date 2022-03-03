<script context="module" lang="ts">
    import type {Project} from "$lib/structs";

    export const load = async (page) => {
        let projectId = page.params.projectId;
        let res = await fetch(`${import.meta.env.VITE_APP_API_URL}/project/${projectId}`)
        let project: Project = await res.json();

        return {
            props: {
                project
            }
        };
    };
</script>

<script lang="ts">
    import {onMount} from "svelte";
    import TicketList from "$lib/TicketList.svelte";
    import Button from "$lib/ui/Button.svelte";

    let tickets;
    export let project: Project;

    onMount(() => {
        fetch(`${import.meta.env.VITE_APP_API_URL}/project/${project.id}/ticket`)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                tickets = data;
            });
    });
</script>

<a href="../" class="back" alt="Back to Projects">&#8592; Back to Projects</a>
<div class="header">
    <h1>Tickets</h1>
    <span class="spacer"/>
    <a href="ticket/create">
        <Button color={"#4ad028"} fontColor="white">Create a Ticket</Button>
    </a>
</div>
<hr/>
<TicketList {tickets} loading={!tickets}/>

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
