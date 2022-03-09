<script lang='ts'>
	import { onDestroy, onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import Delta from 'quill-delta';

	let quill: any;

	let target: Element;
	export let text: writable<string> | string = writable('');
	export let outline: boolean = true;
	export let maxLength: number = -1;

	onMount(() => setupQuill());
	onDestroy(() => destroyQuill());

	const setupQuill = async () => {
		if (!target) return;
		const q = await import('quill');
		quill = new q.default(target, { theme: 'bubble', readOnly: true });

		if (typeof text == 'string') updateText(text);
		else text.subscribe(txt => updateText(txt));
	};

	const destroyQuill = () => {
		quill = undefined;
		if (target)
			target.innerHTML = '';
	};

	const updateText = (str: string) => {
		if (str == '') return;

		try {
			if (str != '')
				quill.setContents(JSON.parse(str));
		} catch (e) {
		}
		if (maxLength != -1 && quill.getText().length > maxLength) {
			quill.setContents(quill.getContents(0, maxLength).concat(new Delta({ ops: [{ insert: '...\n' }] })));
		}
	};

	$: if (text && quill && typeof text == 'string') updateText(text);
</script>

<!--<svelte:options accessors={true}/>-->

<div class='wrapper'>
	<div class:outline={outline} bind:this={target} />
</div>

<style>
    @import "https://cdn.quilljs.com/1.3.6/quill.snow.css";

    .wrapper {
        margin: 1em 0;
    }

    .outline {
        border: 1px solid lightgray;
    }
</style>