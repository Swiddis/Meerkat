<script>
    //Define nav bar routes here and which pages should be authenticated.
    import {page} from "$app/stores";

    let pages = [
        {
            path: "/",
            title: "Home"
        },
        {
            path: "/tickets",
            title: "Tickets"
        }
    ];
</script>

<header>
    <img src="/meerkat.png" alt="logo" id="logo"/>
    <nav>
        <ul>
            {#each pages as pg}
                {#if !pg.hidden}
                    <!--{#if pg.auth && $loggedIn || !pg.auth}-->
                    <a sveltekit:prefetch href={pg.path} class="button"
                       class:active={$page.url.pathname === pg.path}>
                        <li>{pg.title}</li>
                    </a>
                    <!--{/if}-->
                {/if}
            {/each}
        </ul>
    </nav>
</header>

<style>
    header {
        font-size: 1.2em;
        background-color: var(--header-bg-color);
        color: var(--header-fg-color);
        display: flex;
        flex-direction: row;
        align-items: stretch;
        position: sticky;
        top: 0;
    }

    #logo {
        height: 4em;
        margin: 0.3em;
        object-position: center;
        object-fit: fill;
    }

    nav {
        display: flex;
        align-items: stretch;
    }

    ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        align-items: stretch;
    }

    ul > * {
        margin: 0 1px;
    }

    ul li {
        margin: 1em;
    }
</style>