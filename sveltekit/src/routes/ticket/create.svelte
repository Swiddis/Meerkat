<script lang="ts">
    import {Status, Ticket, Type} from "$lib/structs";
    import Button from "$lib/ui/Button.svelte";
    import Badge from "$lib/ui/Badge.svelte";

    let ticket: Ticket = {
        status: Status.open,
        type: Type.bug,
        severity: 0,
        priority: 0,
        title: "Bug",
        description: ""
    };

    const onCreate = () => {
        console.log("Clicked");
    };
</script>

<div>
    <input type="text" name="title" id="title" placeholder="Title" bind:value={ticket.title}/>
    <Badge>Test</Badge>

    <Button color="#0c1" fontColor="white" hoverColor="#090" on:click={onCreate}>Create Issue</Button>
</div>

<style>
    #title {
        outline: none;
        border: none;
        border-bottom: 1px solid #2e4a56;
        font-size: 3em;
    }
</style>