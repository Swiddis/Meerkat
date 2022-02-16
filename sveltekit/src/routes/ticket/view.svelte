<script>
    import {onMount} from "svelte";
    import Loading from "$lib/Loading.svelte";
    import {page} from "$app/stores";

    let ticket;
    onMount(() => {
        let ticketId = $page.url.searchParams.get("ticketId");
        console.log(ticketId);
        if (!ticketId) return;

        // TODO Get ticket by id from API
        // fetch()
    });
</script>

{#if ticket}

{:else}
    <Loading text="Fetching ticket..."/>
{/if}