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
	import type { Ticket } from '$lib/structs';
	import RichTextInput from '$lib/ui/RichTextInput.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Button from '$lib/ui/Button.svelte';
	import { getActiveSession } from '$lib/state';
	import UserSelect from '$lib/ui/UserSelect.svelte';
	import { slide } from 'svelte/transition';
	import { Resolution, Status, Type } from '$lib/structs';

	export let projectId;

	let ticket: Ticket = {
		status: Status.open,
		type: Type.bug,
		severity: 0,
		priority: 0,
		title: '',
		description: '',
		resolution: Resolution.unresolved,
		project: '',
		assigned_to: '',
		email_data: {
			description_plain: '',
			description_html: '',
			reproduction_plain: '',
			reproduction_html: '',
			expected_plain: '',
			expected_html: ''
		}
	};

	$: if (projectId) ticket.project = projectId;

	let users = [];
	let assignedUsers = [];
	let submitting = false;

	onMount(async () => {
		if (!getCurrentUser() || !(await getActiveSession())?.isValid()) {
			await goto('/login');
			return;
		}

		ticket.author = getCurrentUser().getUsername();

		fetch(`${import.meta.env.VITE_APP_API_URL}/project/${projectId}/users`)
			.then(response => response.json())
			.then(data => {
				if (!data.users) return;

				users = [...data.users];
			});
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

	const filterUsers = (username) => ticket.author != username && !ticket.assigned_to.split(',').includes(username);

	const addUser = (user) => {
		let assigned = ticket.assigned_to.length == 0 ? [] : ticket.assigned_to.split(',');

		if (assigned.includes(user.Username)) return;

		assigned.push(user.Username);
		assignedUsers.push(user);
		assignedUsers = [...assignedUsers];

		ticket.assigned_to = assigned.join(',');
		ticket = { ...ticket };
	};

	const removeUser = (user) => {
		let assigned = (ticket.assigned_to.length == 0 ? [] : ticket.assigned_to.split(','))
			.filter(us => us != user.Username);

		assignedUsers = assignedUsers.filter(us => us.Username != user.Username);
		ticket.assigned_to = assigned.join(',');
		ticket = { ...ticket };
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

		<div>
			<h2 class='inline'>{assignedUsers.length > 0 ? "Assigned Users" : "Assign a user"}</h2>
			{#if assignedUsers.length > 0}
				<div class='assigned-container'>
					{#each assignedUsers as user, index}
						<div class='assigned' transition:slide>
							<span class='avatar'></span>
							<span class='username'>{user.Username}</span>

							<span class='spacer' />
							<span class='close material-icons'
										on:click={() => removeUser(user)}
										title='Remove user'>close</span>
						</div>
						{#if assignedUsers.length > index + 1}
							<hr />
						{/if}
					{/each}
				</div>
			{/if}

			<UserSelect
				filterFunc='{filterUsers}'
				on:addUser={event => addUser(event.detail)} />
		</div>

		<div id='desc-label'>Description</div>
		<RichTextInput bind:text={ticket.description}
									 bind:plainText={ticket.email_data.description_plain}
									 bind:html={ticket.email_data.description_html} />

		<div id='repro-label'>Reproduction Steps</div>
		<RichTextInput bind:text={ticket.reproduction_steps}
									 bind:plainText={ticket.email_data.reproduction_plain}
									 bind:html={ticket.email_data.reproduction_html} />

		<div id='expected-label'>Expected Result</div>
		<RichTextInput bind:text={ticket.expected_result}
									 bind:plainText={ticket.email_data.expected_plain}
									 bind:html={ticket.email_data.expected_html} />

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

    .assigned-container {
        width: 15em;
        margin-bottom: 0.5em;
    }

    .assigned-container hr {
        width: 100%;
    }

    .assigned {
        padding: 0.5em;
        display: flex;
        flex-direction: row;
        align-items: center;
        border-left: var(--ticket-border);
    }

    .avatar {
        display: inline-block;
        border-radius: 50%;
        background-color: black;
        height: 1.5em;
        aspect-ratio: 1;
        margin-right: 0.5em
    }

    .close {
        color: red;
        font-weight: bold;
    }

    .close:hover {
        cursor: pointer;
        color: darkred;
    }
</style>