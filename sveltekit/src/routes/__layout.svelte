<script>
    import "../app.css";
    import Header from "$lib/layout/Header.svelte";
    import Footer from "$lib/layout/Footer.svelte";
    import {page} from "$app/stores";
    import { beforeUpdate } from 'svelte';
    import { overrideFetch, overrideXMLSend } from '$lib/state';

    let path = "";
    $: path = $page.url.pathname + ($page.url.pathname == '/' ? '' : '/');

    beforeUpdate(() => {
        overrideFetch();
        overrideXMLSend();
    });
</script>

<svelte:head>
    <title>Meerkat</title>
    <!-- Well this was quite possibly the most difficult thing to figure out needed to be here... -->
    <base href="{path}"/>
</svelte:head>

<Header/>
<section id="svelte-body">
    <div id="body">
        <slot/>
    </div>
</section>
<Footer/>

<style>
    #svelte-body {
        position: relative;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
    }
</style>