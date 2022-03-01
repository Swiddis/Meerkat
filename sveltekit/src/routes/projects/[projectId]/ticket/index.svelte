<script context="module" lang="ts">
    export const prerender = true;

    let projectId: string;
    export const load = async (page) => {
        return projectId = page.params.projectId;
    };
</script>

<script>
    import {onMount} from "svelte";
    import TicketList from "$lib/TicketList.svelte";
    import Button from "$lib/ui/Button.svelte";

    let tickets;

    onMount(() => {
        fetch(`${import.meta.env.VITE_APP_API_URL}/project/${projectId}/ticket`)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                tickets = data;
            });
    });
</script>

<div class="header">
    <h1>Tickets</h1>
    <span class="spacer"/>
    <a href="ticket/create">
        <Button>Create a Ticket</Button>
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
</style>
