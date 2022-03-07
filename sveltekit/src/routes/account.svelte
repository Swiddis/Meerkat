<script>
    import {onMount} from "svelte";
    import {jwt} from "$lib/state";
    import {goto} from "$app/navigation";

    // let test = $page.url.searchParams;
    // for (let item of test.keys()) {
    //     console.log(item + ": " + test.get(item));
    // }

    let user;
    onMount(() => {
        if (!jwt.get()) {
            // Redirect
            console.log("No JWT");
            goto("/login");
            return;
        }
        let username = jwt.getUsername();
        // TODO get user from DB and load in applicable data.
        console.log("JWT: " + username);
        /* fetch(import.meta.env.VITE_APP_API_URL + "/user")
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                user = data;
            }); */
    })
</script>

<section id="body">
    {#if user}
        <h1>Welcome, {user}.</h1>
    {:else}
        <h2>Loading...</h2>
    {/if}
</section>

<style>

</style>