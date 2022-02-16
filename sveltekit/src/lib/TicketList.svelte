<script>
    import Loading from "$lib/Loading.svelte";

    export let loading = true;
    export let tickets = [];
</script>

<div>
    {#if loading}
        <Loading text="Fetching tickets..."/>
    {:else}
        <div id="ticket-container">
            {#if tickets.length == 0}
                There are no tickets...
            {:else}
                {#each tickets as ticket}
                    <div class="ticket">
                        <a href="/ticket/view?ticketId={ticket.id}">
                            <h3 class="name">{ticket.title}
                                <div class="author">- {ticket.author}</div>
                            </h3>
                        </a>
                        <div class="description">{ticket.description}</div>
                    </div>
                {/each}
            {/if}
        </div>
    {/if}
</div>

<style>
    #ticket-container {
        border: 1px solid var(--border-color);
        border-radius: 0.8em;
        padding: 1em;
    }

    .ticket {
        border-left: var(--ticket-border);
        padding: 0.5em 1em 0.5em 1em;
    }

    .ticket h3 {
        margin: 0.4em 0;
    }

    .author {
        display: inline;
        font-size: 0.8rem;
        font-weight: normal;
        color: var(--disabled-text);
    }
</style>