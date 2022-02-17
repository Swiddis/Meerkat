<script>
    import {goto} from "$app/navigation";

    let form, user, pass;

    const validateForm = () => {
        return form && user && pass && user.length >= 1 && pass.length >= 1;
    }

    const doLogin = () => {
        if (!validateForm()) return;

        // TODO Submit login data, get authenticated... continue

        goto("/");
    };
</script>

<section id="body" class="center">
    <!-- TODO Hook up forms! -->
    <section class="content">
        <form bind:this={form} id="login">
            <input type="text" placeholder="Username" bind:value={user}/>
            <input type="password" placeholder="Password" bind:value={pass}/>
            <div class="button" on:click={doLogin}>Login</div>
        </form>
        <div class="register-text">Don't have an account? <a href="/register">Register Here!</a></div>
    </section>
</section>

<style>

</style>