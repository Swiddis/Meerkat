<script>
    import {goto} from "$app/navigation";

    let form, email, user, password, confPassword;

    const emailRegex = /^(\w+[+.\w-]*)@(([\w-]+\.?)*)\.([a-z]+)$/i;
    const userRegex = /\w{4,}/;
    // Password must contain 1 letter, 1 number, 1 special character, and must be 8+ characters long
    const passRegex = /^(?=(.*[A-Za-z])+)(?=(.*\d)+)(?=(.*[@$!%*#?&]){2,}).{8,}$/;

    const validateForm = () => {
        if (!form) return false;
        let emailValid = emailRegex.test(email);
        let userValid = userRegex.test(user);
        let passwordValid = passRegex.test(password);
        let passMatch = password == confPassword;


        console.log("Email: " + emailValid)
        console.log("User: " + userValid)
        console.log("Password: " + passwordValid)
        console.log("Match: " + passMatch)
        return emailValid && userValid && passwordValid && passMatch;
    }

    const doRegister = () => {
        if (!validateForm()) return;

        // TODO submit registration form -- validate username/email

        goto("/login");
    };
</script>

<section id="body" class="center">
    <!-- TODO Hook up forms! -->
    <section class="content">
        <form bind:this={form} id="register">
            <input type="text" placeholder="Email" bind:value={email}/>
            <input type="text" placeholder="Username" bind:value={user}/>
            <input type="password" placeholder="Password" bind:value={password}/>
            <input type="password" placeholder="Confirm Password" bind:value={confPassword}/>
            <div class="button" on:click={doRegister}>Register</div>
        </form>
        <div class="register-text">Already have an account? <a href="/login">Login Here!</a></div>
    </section>
</section>

<style>

</style>