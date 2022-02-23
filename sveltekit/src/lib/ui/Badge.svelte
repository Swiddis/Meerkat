<script>
    export let color = "red",
        fontColor = "white";
</script>

<span class="badge"
      style="--color: {color}; --font-color: {fontColor};">
    <slot/>
</span>

<style>
    .badge {
        background: var(--color);
        color: var(--font-color);
        padding: 0.5em;
        border-radius: 0.5em;
    }
</style>