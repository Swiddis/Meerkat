<div class='loading'>
	<img src='/loading.gif' alt='loading' />
	<slot />
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