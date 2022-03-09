<script context='module'>
	import { getCurrentUser } from '$lib/state';

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

<script lang='ts'>
	import Loading from '$lib/Loading.svelte';
	import { Resolution } from '$lib/structs';
	import RichTextInput from '$lib/ui/RichTextInput.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Button from '$lib/ui/Button.svelte';
	import { getActiveSession } from '$lib/state';

	export let projectId;

	export let ticket;
	export let error;

	$: {
		if (projectId) ticket.project = projectId;
		if (ticket && !ticket.resolution)
			ticket.resolution = Resolution.unresolved;
		if (ticket.resolution) {
			switch (ticket.resolution) {
				case "unresolved":
					ticket.status = "open";
					break;
				default:
					ticket.status = "closed";
					break;
			}
		}
	}

	let view;
	let submitting = false;

	onMount(async () => {
		if (!getCurrentUser() || !(await getActiveSession())?.isValid()) {
			await goto('/login');
			return;
		}

		ticket.author = getCurrentUser().getUsername();
	});

	const submitForm = () => {
		console.log('Clicked.');
		if (submitting)
			return;

		console.log(ticket);
		submitting = true;
		fetch(import.meta.env.VITE_APP_API_URL + '/ticket/' + ticket.id, {
			method: 'put',
			body: JSON.stringify(ticket)
		})
			.then(res => {
				console.log(res.status);
				if (res.status == 201 || res.status == 200)
					return res.json();
				else
					res.text().then(txt => alert(txt));
			})
			.then(data => {
				if (data)
					goto(`../`);
				submitting = false;
			});
	};
</script>

{#if ticket}
	<div>
		<div class='input-form'>
			<input type='text' id='title' name='title' placeholder='Title' bind:value={ticket.title} />
			<br />
			<label for='type'>Type</label>
			<select bind:value={ticket.type} id='type' name='type'>
				<option value='bug'>Bug</option>
				<option value='suggestion'>Suggestion</option>
				<option value='todo'>Todo</option>
			</select>
			<label for='resolution'>Resolution</label>
			<select bind:value={ticket.resolution} id='resolution' name='resolution'>
				<option value='unresolved'>Unresolved</option>
				<option value='fixed'>Fixed</option>
				<option value='by design'>By design</option>
				<option value="won't fix">Won't fix</option>
				<option value='postponed'>Postponed</option>
				<option value='duplicate'>Duplicate</option>
				<option value='not reproducible'>Not Reproducible</option>
			</select>
			<label for='severity'>Severity</label>
			<input type='number' min='0' max='6' id='severity' name='severity' bind:value={ticket.severity} />
			<label for='priority'>Priority</label>
			<input type='number' min='0' max='2' id='priority' name='priority' bind:value={ticket.priority} />
			<br />
			<div id='desc-label'>Description</div>
			<RichTextInput bind:text={ticket.description} />

			<div id='repro-label'>Reproduction Steps</div>
			<RichTextInput bind:text={ticket.reproduction_steps} />

			<div id='expected-label'>Expected Result</div>
			<RichTextInput bind:text={ticket.expected_result} />

			<div class='buttonContainer'>
				<Button on:click={submitForm} color='limegreen' fontColor='white' disabled='{submitting}'>Submit</Button>
				<Button on:click={() => goto("../")} color='gray' fontColor='white'>Cancel</Button>
			</div>
		</div>
	</div>
{:else if error == "missing"}
	<h2>404</h2>
	<p>Ticket not found.</p>
{:else}
	<Loading>Fetching ticket...</Loading>
{/if}

<style>
    #title {
        font-size: 2em;
        outline: none;
        border: 2px solid var(--bg-color);
        margin-bottom: 0.2em;
        width: 60%;
    }

    #title:focus {
        border-bottom: 2px solid #007ed0;
    }

    #desc-label, #repro-label, #expected-label {
        font-size: 1.2em;
        margin-top: 1em;
    }

    input, select {
        margin-right: 1.5em;
    }

    .buttonContainer {
        display: flex;
        justify-content: flex-end;
    }
</style>