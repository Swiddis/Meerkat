<script context='module'>
	export async function load(page) {
		console.log(page);
		let ticketId = page.params.ticketId;
		console.log('Ticket Id: ' + ticketId);

		if (!ticketId)
			return {
				props: {
					error: 'missing'
				}
			};

		let response = await fetch(import.meta.env.VITE_APP_API_URL + '/ticket/' + ticketId);
		console.log(response);
		if (response.ok) {
			return {
				props: {
					ticket: await response.json()
				}
			};
		} else
			return {
				props: {
					error: 'missing'
				}
			};
	}
</script>

<script>
	import Loading from '$lib/Loading.svelte';
	import RichText from '$lib/ui/RichText.svelte';
	import Badge from '$lib/ui/Badge.svelte';
	import { Resolution } from '$lib/structs';

	export let ticket;
	export let error;

	let resMap = {
		'by design': '#3caefa',
		'fixed': '#27c901',
		'won\'t fix': 'red',
		'postponed': 'purple',
		'duplicate': '#ff7034',
		'not reproducible': 'black',
		'unresolved': 'gray'
	};

	$: {
		if (ticket && !ticket.resolution)
			ticket.resolution = Resolution.unresolved;
	}

	console.log(ticket);

</script>

<a href='../../' class='back' alt='Back to Ticket List'>&#8592; Back to Ticket List</a>
{#if ticket}
	<div class='content'>
		<div class='ticket'>
			<div class='header'>
				<h1>{ticket.title}</h1>
				<Badge status={ticket.status}>{ticket.status}</Badge>
				<Badge type={ticket.type}>{ticket.type}</Badge>
				<a class="edit" href="./edit">&#9998; Edit</a>
				<div>Timestamp: {new Date(ticket.timestamp).toLocaleString()}</div>
			</div>
			<hr />
			<!--        <div>Id: {ticket.id}</div>-->
			<div class='description'>Reproduction Steps</div>
			<RichText text={ticket.reproduction_steps} />

			<div class='description'>Expected Result</div>
			<RichText text={ticket.expected_result} />

			<div class='description'>Description</div>
			<RichText text={ticket.description} />
			<!-- TODO Do we need to store comments/conversation? -->
		</div>
		<div class='sidebar'>
			<h3>Resolution</h3>
			<hr />
			<Badge color={resMap[ticket.resolution]} fontColor='white'>{ticket.resolution}</Badge>

			{#if ticket.author}
				<h3>Author</h3>
				<hr />
				<div class='author'>
					<div class='avatar' />{ticket.author}
				</div>
			{/if}

			{#if ticket.assigned_to}
				<h3>Assignees</h3>
				<hr />
				<div>{ticket.assigned_to}</div>
			{/if}

			<h3>Severity</h3>
			<hr />
			<div>{ticket.severity}</div>
			<h3>Priority</h3>
			<hr />
			<div>{ticket.priority}</div>
		</div>
	</div>
{:else if error == "missing"}
	<h2>404</h2>
	<p>Ticket not found.</p>
{:else}
	<Loading>Fetching ticket...</Loading>
{/if}

<style>
    .content {
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: stretch;
    }

    .ticket {
        flex-grow: 1;
    }

    .sidebar {
        margin-left: 0.5rem;
        padding-right: 2.5rem;
        padding-left: 0.5rem;
        position: relative;
        /*flex-basis: 20%;*/
        border-left: 1px solid var(--disabled-text);
    }

    .sidebar h3 {
        margin: 1rem 0 0;
    }

    .description {
        margin: 0.5em 0;
    }

    .header h1 {
        display: inline-block;
    }

    .author {
        display: flex;
        align-items: center;
    }

    .avatar {
        display: inline-block;
        background: black;
        height: 1em;
        aspect-ratio: 1;
        border-radius: 50%;
        margin-right: 0.5em;
    }

	.edit {
		text-decoration: none;
		background: var(--button-bg);
        color: var(--link-color);
        padding: 0.5em;
        border-radius: 0.5em;
        box-sizing: border-box;
		float: right;
	}

	.edit:hover {
		text-decoration: none;
		background: var(--button-hover);
        color: var(--link-color-hover);
        padding: 0.5em;
        border-radius: 0.5em;
		float: right;
	}
</style>