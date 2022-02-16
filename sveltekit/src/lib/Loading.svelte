<script>
    export let text;
</script>

<div class="loading">
    <img src="/loading.gif"/>{text}
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