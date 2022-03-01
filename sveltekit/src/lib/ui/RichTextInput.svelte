<script lang="ts">
    import Quill from 'quill';
    import Delta from 'quill-delta';
    import {createEventDispatcher, onMount} from "svelte";

    let quill: Quill;

    let target: Element, header: Element;
    export let text;
    export let placeholder: string = "";

    const toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],    // toggled buttons
        ['blockquote', 'code-block'],

        [{'list': 'ordered'}, {'list': 'bullet'}],
        [{'indent': '-1'}, {'indent': '+1'}],         // outdent/indent

        [{'header': [1, 2, 3, 4, 5, false]}],

        [{'color': []}, {'background': []}],          // dropdown with defaults from theme
        [{'font': []}],
        [{'align': []}],

        ['clean']                                     // remove formatting button
    ];

    const dispatch = createEventDispatcher();

    onMount(() => setupQuill());

    const setupQuill = () => {
        if (!target) return;

        quill = new Quill(target, {
            theme: 'snow',
            modules: {
                toolbar: toolbarOptions
            },
            placeholder
        });
        quill.on('text-change', (delta: Delta, oldContents: Delta, source: string) => {
            text = JSON.stringify(quill.getContents());
            dispatch("update", JSON.stringify(quill.getContents()));
        });

        console.log("Setup quill.");
    };
</script>

<div id="header" bind:this={header}/>
<div class="input" bind:this={target}/>

<style>
    @import "https://cdn.quilljs.com/1.3.6/quill.snow.css";

    .input {
        margin-top: 0.2em;
    }
</style>