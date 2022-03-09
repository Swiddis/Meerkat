<script lang='ts'>
	import { createEventDispatcher, onMount } from 'svelte';
	import levenshtein from 'js-levenshtein';

	export let owner;
	/**
	 * A filter function designated by the parent function.
	 * @param username - The user to check if it should stay in the filtered list.
	 *
	 * A true value keeps it in the list, a false one removes it.
	 */
	export let filterFunc: (username: string) => boolean = () => true;
	export let placeholder = 'Username';
	let users = [];
	let filteredUsers = [];
	let usernameSearch = '';
	let inputBox;
	let selectedIndex = -1;
	let focused = false;

	let dispatch = createEventDispatcher();

	onMount(async () => {
		fetch(import.meta.env.VITE_APP_API_URL + '/user')
			.then(response => response.json())
			.then(data => {
				if (!data.users) return;

				users = [...data.users];
				if (usernameSearch.length > 0)
					filteredUsers = searchUsers();
			});
	});

	const searchUsers = () => {
		const search = usernameSearch.toLowerCase();
		return users
			.filter(user => user.Username.includes(search)
				&& filterFunc(user.Username)
				&& owner != user.Username)
			.sort((user1, user2) => levenshtein(user1, search) - levenshtein(user2, search))
			.slice(0, 4);
	};

	$: filteredUsers = usernameSearch.length > 0 ? [...searchUsers()] : [];


	const inputKeyUp = (event: KeyboardEvent) => {
		if (['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key))
			event.preventDefault();

		if (event.key == 'Tab') {
			if (selectedIndex > -1)
				usernameSearch = filteredUsers[selectedIndex].Username;
		} else if (event.key == 'ArrowUp') {
			selectedIndex--;
		} else if (event.key == 'ArrowDown') {
			selectedIndex++;
		} else if (event.key == 'Enter') {
			addUser(filteredUsers[selectedIndex]);
			usernameSearch = '';
		}

		if (selectedIndex >= filteredUsers.length)
			selectedIndex = filteredUsers.length - 1;
		else if (selectedIndex < 0 && filteredUsers.length > 0)
			selectedIndex = 0;
		else if (selectedIndex < -1)
			selectedIndex = -1;
	};

	const inputKeyDown = (event: KeyboardEvent) => {
		if (event.key == 'Tab' && usernameSearch.length > 0)
			event.preventDefault();
	};

	const addUser = (user) => {
		dispatch('addUser', user);
		usernameSearch = '';
		inputBox.blur();
	};
</script>

<div class='inline aligned input-users'>
	<input type='text' class='username-search'
				 {placeholder}
				 bind:this={inputBox}
				 bind:value={usernameSearch}
				 on:keyup={inputKeyUp}
				 on:keydown={inputKeyDown}
				 on:focus={() => focused = true}
				 on:blur={()=> focused = false} />
	<div class='user-container'>
		{#if focused}
			{#each filteredUsers as user, index}
				<div class='user-select'
						 on:mousedown={event => event.preventDefault()}
						 on:click={() => addUser(user)}
						 on:mouseenter={() => selectedIndex = index}
						 class:selected={selectedIndex == index}>
					<span class='avatar'></span>
					<span class='username'>{user.Username}</span>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
    input {
        margin-right: 1.5em;
    }

    .username-search {
        font-size: 1.2em;
        margin: 0;
    }

    .inline {
        display: inline;
    }

    .inline.aligned {
        display: inline-flex;
        flex-direction: column;
        position: relative;
    }

    .user-container {
        border: 1px solid var(--border-color);
        width: 100%;
        box-sizing: border-box;
        top: 100%;
        z-index: 5;
    }

    .input-users .user-container {
        position: absolute;
    }

    .user-select {
        padding: 0.5em;
        background-color: var(--bg-color);
    }

    .input-users .user-select.selected, .input-users .user-select:hover {
        cursor: pointer;
        background-color: var(--bg-color-secondary);
    }

</style>