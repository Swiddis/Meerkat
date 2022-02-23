<script lang="ts">
    export let color = "#bebebe",
        fontColor = "black",
        hoverColor = "#6497bd";
</script>

<div class="button" style="--button-bg: {color}; --button-fg: {fontColor}; --button-hover: {hoverColor}" on:click>
    <slot/>
</div>

<style>

</style>