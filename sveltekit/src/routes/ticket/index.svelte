<script context="module">
    export const prerender = true;
</script>

<script>
    import {onMount} from "svelte";
    import TicketList from "$lib/TicketList.svelte";
    import Button from "$lib/ui/Button.svelte";
    import {goto} from "$app/navigation";

    let tickets;

    onMount(() => {
        fetch(import.meta.env.VITE_APP_API_URL + "/ticket")
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
    <Button on:click={() => goto("/ticket/create")}>Create a Ticket</Button>
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
