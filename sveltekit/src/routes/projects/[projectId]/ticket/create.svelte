<script context='module' lang='ts'>
	import { getCurrentUser } from '$lib/state';

	export const load = (page) => {
		console.log(page.params);

		return {
			props: {
				projectId: page.params.projectId
			}
		};
	};
</script>

<script lang='ts'>
	import { Resolution, Status, Ticket, Type } from '$lib/structs';
	import RichTextInput from '$lib/ui/RichTextInput.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Button from '$lib/ui/Button.svelte';
	import { getActiveSession } from '$lib/state';

	export let projectId;

	let ticket: Ticket = {
		status: Status.open,
		type: Type.bug,
		severity: 0,
		priority: 0,
		title: '',
		description: '',
		resolution: Resolution.unresolved,
		project: ''
	};

	$: if (projectId) ticket.project = projectId;

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
		fetch(import.meta.env.VITE_APP_API_URL + '/ticket', {
			method: 'post',
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
					goto(`../../`);
				submitting = false;
			});
	};
</script>

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
			<Button on:click={() => goto("../../")} color='gray' fontColor='white'>Cancel</Button>
		</div>
	</div>
</div>

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