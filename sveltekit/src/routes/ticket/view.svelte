<script>
    import {onMount} from "svelte";
    import Loading from "$lib/Loading.svelte";
    import {page} from "$app/stores";
    import {goto} from "$app/navigation";

    let ticket;
    onMount(() => {
        let ticketId = $page.url.searchParams.get("ticketId");
        console.log(ticketId);
        if (!ticketId) {
            goto("/ticket")
            return;
        }

        // TODO Get ticket by id from API
        // fetch()
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
        <div>Description: {ticket.description}</div>
        <div>Reproduction Steps: {ticket.reproduction_steps}</div>
        <div>Expected Results: {ticket.expected_result}</div>
        <!-- TODO Do we need to store comments/conversation? -->
    </div>
{:else}
    <Loading text="Fetching ticket..."/>
{/if}