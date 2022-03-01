<script lang="ts">
    import {onMount} from "svelte";
    import {Status, Type} from "$lib/structs";

    export let color = "",
        fontColor = "";

    export let type: Type;
    export let status: Status;

    onMount(() => {
        if (type)
            switch (type) {
                case Type.bug:
                    setColor("red");
                    setFontColor("white");
                    break;
                case Type.suggestion:
                    setColor("#3caefa");
                    setFontColor("white");
                    break;
                case Type.todo:
                    setColor("#0faf13");
                    setFontColor("white");
                    break;
                default:
                    break;
            }
        else if (status)
            switch (status) {
                case Status.open:
                    setColor("#3caefa");
                    setFontColor("white");
                    break;
                case Status.closed:
                    setColor("red");
                    setFontColor("white");
                    break;
                case Status.resolved:
                    setColor("green");
                    setFontColor("white");
                    break;
                default:
                    break;
            }
    });

    const setFontColor = (col: string, force: boolean = false) => {
        if (force || fontColor == "")
            fontColor = col;
    }

    const setColor = (col: string, force: boolean = false) => {
        if (force || color == "")
            color = col;
    }
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
        box-sizing: border-box;
        position: relative;
        display: inline-block;
    }
</style>