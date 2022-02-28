<script>
    export let text;
</script>

<div class="loading">
    <img src="/loading.gif" alt="loading"/>{text}
</div>

<style>
    img {
        height: 2em;
        margin-right: 0.5em;
    }

    .loading {
        display: flex;
        align-items: center;
    }
</style>