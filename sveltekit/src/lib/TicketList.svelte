<script lang='ts'>
	import Loading from '$lib/Loading.svelte';
	import RichText from '$lib/ui/RichText.svelte';
	import { Ticket } from '$lib/structs';
	import Badge from '$lib/ui/Badge.svelte';
	import { slide } from 'svelte/transition';

	export let loading = true;
	export let tickets: Ticket[] = [];

	// Sort by timestamp
	$: tickets.sort((a, b) => new Date(a.timestamp) > new Date(b.timestamp) ? 1 : -1);

</script>

<div>
	{#if loading}
		<Loading>Fetching tickets...</Loading>
	{:else}
		<div id='ticket-section'>
			{#if tickets.length == 0}
				&#x1f604; Congratulations! There are no tickets!
			{:else}
				{#each tickets as ticket}
					<div class='ticket' in:slide>
						<div class='header'>
							<a href='ticket/{ticket.id}'>
								<h3 class='name'>{ticket.title}</h3>
							</a>
							<span class='details'>
                                {#if ticket.author}
                                    <span class='author'>- {ticket.author}</span>
                                {/if}

								{#if ticket.id}
                                    <span class='disabled'>&nbsp;&nbsp;{ticket.id}</span>
                                {/if}
                            </span>
						</div>
						<Badge status={ticket.status}>{ticket.status}</Badge>
						<Badge type={ticket.type}>{ticket.type}</Badge>
						<span><strong>Severity:</strong> {ticket.severity}</span>
						<span><strong>Priority:</strong> {ticket.priority}</span>
						<blockquote>
							<RichText text={ticket.description} outline={false} maxLength={200}></RichText>
						</blockquote>
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
        display: inline-block;
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
        color: var(--fg-color-secondary);
    }

    blockquote {
        margin-left: 0;
    }
</style>