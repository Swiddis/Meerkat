<script>
    import "../app.css";
    import Header from "$lib/layout/Header.svelte";
    import Footer from "$lib/layout/Footer.svelte";

</script>

<svelte:head>
    <title>Foobar</title>
</svelte:head>

<Header/>
<section id="body">
    <slot/>
</section>
<Footer/>

<style>
    #body {
        margin: 1rem 2rem;
    }
</style>