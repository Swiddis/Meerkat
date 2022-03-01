<script>
    import "../app.css";
    import Header from "$lib/layout/Header.svelte";
    import Footer from "$lib/layout/Footer.svelte";
</script>

<svelte:head>
    <title>Meerkat</title>
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