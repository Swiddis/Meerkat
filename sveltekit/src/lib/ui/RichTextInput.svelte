<script lang='ts'>
	import Delta from 'quill-delta';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';

	let quill: any;

	let target: Element, header: Element;
	export let text, plainText, html;
	export let placeholder: string = '';

	const toolbarOptions = [
		['bold', 'italic', 'underline', 'strike'],    // toggled buttons
		['blockquote', 'code-block'],

		[{ 'list': 'ordered' }, { 'list': 'bullet' }],
		[{ 'indent': '-1' }, { 'indent': '+1' }],         // outdent/indent

		[{ 'header': [1, 2, 3, 4, 5, false] }],

		[{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
		[{ 'font': [] }],
		[{ 'align': [] }],

		['clean']                                     // remove formatting button
	];

	const dispatch = createEventDispatcher();

	onMount(() => setupQuill());
	onDestroy(() => destroyQuill());

	const setupQuill = async () => {
		if (!target) return;

		const q = await import('quill');
		quill = new q.default(target, {
			theme: 'snow',
			modules: {
				toolbar: toolbarOptions
			},
			placeholder
		});

		try {
			if (text != '')
				quill.setContents(JSON.parse(text));
		} catch (e) {
		}
		quill.on('text-change', (delta: Delta, oldContents: Delta, source: string) => {
			text = JSON.stringify(quill.getContents());
			plainText = quill.getText();
			html = quill.root.innerHTML;
			dispatch('update', JSON.stringify(quill.getContents()));
		});
	};

	const destroyQuill = () => {
		quill = null;
		if (target)
			target.innerHTML = '';
	};
</script>

<div id='header' bind:this={header} />
<div class='input' bind:this={target} />

<style>
    @import "https://cdn.quilljs.com/1.3.6/quill.snow.css";

    .input {
        margin-top: 0.2em;
    }
</style>