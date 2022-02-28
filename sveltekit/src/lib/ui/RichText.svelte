<script lang="ts">
    import Quill from 'quill';
    import {onMount} from "svelte";
    import {writable} from "svelte/store";


    let quill: Quill;

    let target: Element;
    export let text: writable<string> | string = writable("");

    onMount(() => setupQuill());

    const setupQuill = () => {
        if (!target) return;

        quill = new Quill(target, {theme: 'bubble', readOnly: true});
        if (typeof text == "string") updateText(text);
        else text.subscribe(txt => updateText(txt));
    };

    const updateText = (str: string) => {
        if (str == "") return;
        quill.setContents(JSON.parse(str));
    };
</script>

<svelte:options accessors={true}/>

<div class="textview" bind:this={target}/>

<style>
    @import "https://cdn.quilljs.com/1.3.6/quill.snow.css";

    .textview {
        border: 1px solid lightgray;
    }
</style>