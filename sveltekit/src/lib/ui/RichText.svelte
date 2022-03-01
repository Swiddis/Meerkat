<script lang="ts">
    import {onMount} from "svelte";
    import {writable} from "svelte/store";
    import Quill from 'quill';
    import Delta from "quill-delta";

    let quill: Quill;

    let target: Element;
    export let text: writable<string> | string = writable("");
    export let outline: boolean = true;
    export let maxLength: number = -1;

    onMount(() => setupQuill());

    const setupQuill = async () => {
        if (!target) return;
        quill = new Quill(target, {theme: 'bubble', readOnly: true});

        if (typeof text == "string") updateText(text);
        else text.subscribe(txt => updateText(txt));
    };

    const updateText = (str: string) => {
        if (str == "") return;

        quill.setContents(JSON.parse(str));
        if (maxLength != -1 && quill.getText().length > maxLength) {
            quill.setContents(quill.getContents(0, maxLength).concat(new Delta({ops: [{insert: "...\n"}]})));
        }
    };

    $: if (text && quill && typeof text == "string") updateText(text);
</script>

<!--<svelte:options accessors={true}/>-->

<div class="wrapper">
    <div class:outline={outline} bind:this={target}/>
</div>

<style>
    @import "https://cdn.quilljs.com/1.3.6/quill.snow.css";

    .outline {
        border: 1px solid lightgray;
    }
</style>