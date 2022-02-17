<script>
    import "../app.css";
    import Header from "$lib/layout/Header.svelte";
    import Footer from "$lib/layout/Footer.svelte";

</script>

<svelte:head>
    <title>Foobar</title>
</svelte:head>

<Header/>
<section id="svelte-body">
    <slot/>
</section>
<Footer/>

<style>
    #svelte-body {
        margin: 1rem 2rem;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
    }
</style>