<script>
    import "../app.css";
    import Header from "$lib/Header.svelte";
    import {loading} from "$lib/state.js";

</script>

<svelte:head>
    <title>Foobar</title>
</svelte:head>

<Header/>
<section id="body">
    <slot/>
</section>

<style>
    #body {
        margin: 1rem 2rem;
    }
</style>