<script context="module">
    import {goto} from "$app/navigation";

    let ticketId;
    let ticket;

    export async function load(page) {
        console.log(page);
        let ticketId = page.params.ticketId;
        console.log("Ticket Id: " + ticketId);

        if (!ticketId)
            return {
                status: 302,
                redirect: "../ticket"
            };

        let response = await fetch(import.meta.env.VITE_APP_API_URL + "/ticket/" + ticketId);
        console.log(response);
        if (response.ok) {
            return ticket = await response.json();
        } else
            return {
                status: 302,
                redirect: "../ticket"
            };
    }
</script>

<script>
    import {onMount} from "svelte";
    import Loading from "$lib/Loading.svelte";
    import RichText from "$lib/ui/RichText.svelte";


    onMount(() => {
        if (!ticket)
            goto("../ticket");

        else {
            // let ticketId = $page.url.searchParams.get("ticketId");
            console.log(ticket.id);
        }
    });
</script>

{#if ticket}
    <div class="ticket">
        <div>Id: {ticket.id}</div>
        <div>Author: {ticket.author}</div>
        <div>Timestamp: {ticket.timestamp}</div>
        <div>Assigned To: {ticket.assigned_to}</div>
        <div>Status: {ticket.status}</div>
        <div>Resolution: {ticket.resolution}</div>
        <div>Type: {ticket.type}</div>
        <div>Severity: {ticket.severity}</div>
        <div>Priority: {ticket.priority}</div>
        <div>Title: {ticket.title}</div>
        <div>Reproduction Steps: {ticket.reproduction_steps}</div>
        <div>Expected Results: {ticket.expected_result}</div>
        <div class="description">Description</div>
        <RichText text={ticket.description}></RichText>
        <!-- TODO Do we need to store comments/conversation? -->
    </div>
{:else}
    <Loading text="Fetching ticket..."/>
{/if}

<style>
    .description {
        margin: 0.5em 0;
    }
</style>