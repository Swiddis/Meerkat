<script context="module">
    export const prerender = true;
</script>

<script>
    import {onMount} from "svelte";
    import TicketList from "$lib/TicketList.svelte";

    let tickets = [];
    let loading = true;

    onMount(() => {
        fetch(import.meta.env.VITE_APP_API_URL + "/ticket")
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                tickets = data;
                loading = false;
            });
    });
</script>

<div>
    <h1>Tickets</h1>
    <TicketList {tickets} {loading}/>
</div>


<style>
</style>
