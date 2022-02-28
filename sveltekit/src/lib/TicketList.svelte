<script lang="ts">
    import Loading from "$lib/Loading.svelte";
    import RichText from "$lib/ui/RichText.svelte";
    import {Ticket} from "$lib/structs";

    export let loading = true;
    export let tickets: Ticket[] = [];

    // Sort by timestamp
    $: tickets.sort((a, b) => new Date(a.timestamp) > new Date(b.timestamp) ? 1 : -1);

</script>

<div>
    {#if loading}
        <Loading text="Fetching tickets..."/>
    {:else}
        <div id="ticket-section">
            {#if tickets.length == 0}
                &#x1f604; Congratulations! There are no tickets!
            {:else}
                {#each tickets as ticket}
                    <div class="ticket">
                        <a href="/ticket/view/{ticket.id}">
                            <h3 class="name">{ticket.title}
                                {#if ticket.author}
                                    <span class="author">- {ticket.author}</span>
                                {/if}

                                {#if ticket.id}
                                    <span class="disabled">&nbsp;&nbsp;{ticket.id}</span>
                                {/if}
                            </h3>
                        </a>
                        <RichText text={ticket.description} outline={false} maxLength={200}></RichText>
                    </div>
                {/each}
            {/if}
        </div>
    {/if}
</div>

<style>
    #ticket-section {
        border: 1px solid var(--border-color);
        border-radius: 0.8em;
        padding: 1em;
    }

    .ticket {
        border-left: var(--ticket-border);
        padding: 0.5em 1em 0.5em 1em;
        margin: 0.5em auto;
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

    .disabled {
        font-size: 0.6rem;
    }

    a {
        text-decoration: none;
    }
</style>