<script context="module" lang="ts">
    let projectId;
    export const load = (page) => {
        console.log(page.params);
        return projectId = page.params.projectId;
    }
</script>

<script lang="ts">
    import {Status, Ticket, Type} from "$lib/structs";
    import RichText from "$lib/ui/RichText.svelte";
    import RichTextInput from "$lib/ui/RichTextInput.svelte";
    import {goto} from "$app/navigation";

    let ticket: Ticket = {
        status: Status.open,
        type: Type.bug,
        severity: 0,
        priority: 0,
        title: "",
        description: ""
    };

    let view;
    let submitting = false;

    const submitForm = () => {
        console.log("Clicked.");
        console.log(ticket);

        submitting = true;
        fetch(import.meta.env.VITE_APP_API_URL + "/ticket", {
            method: "post",
            body: JSON.stringify(ticket)
        })
            .then(res => {
                console.log(res.status);
                if (res.status == 201 || res.status == 200)
                    return res.json();
                else
                    res.text().then(txt => alert(txt));
            })
            .then(data => {
                if (data)
                    goto(`../ticket`);
                submitting = false;
            });
    };
</script>

<div>
    <div class="input-form">
        <div class="project">{projectId}</div>
        <input type="text" id="title" name="title" placeholder="Title" bind:value={ticket.title}/>
        <br/>
        <label for="type">Type</label>
        <select bind:value={ticket.type} id="type" name="type">
            <option value="bug">Bug</option>
            <option value="suggestion">Suggestion</option>
            <option value="todo">Todo</option>
        </select>
        <label for="severity">Severity</label>
        <input type="number" min="0" max="6" id="severity" name="severity" bind:value={ticket.severity}/>
        <label for="priority">Priority</label>
        <input type="number" min="0" max="2" id="priority" name="priority" bind:value={ticket.priority}/>
        <br/>
        <div id="descLabel">Description</div>
        <RichTextInput bind:text={ticket.description}/>
        <!-- We don't really need the update to this view object at all, but it works for now :D -->
        <RichText bind:this={view} bind:text={ticket.description}/>

        <div class="buttonContainer">
            <!-- TODO Implement button clicks here -->
            <div class="button" class:disabled={submitting} id="submit" on:click={submitForm}>Submit</div>
            <div class="button" id="cancel" on:click={() => goto("../ticket")}>Cancel</div>
        </div>
    </div>
</div>

<style>
    #title {
        font-size: 2em;
        outline: none;
        border: 2px solid var(--bg-color);
        margin-bottom: 0.2em;
        width: 60%;
    }

    #title:focus {
        border-bottom: 2px solid #007ed0;
    }

    #descLabel {
        font-size: 1.2em;
        margin-top: 1em;
    }

    input, select {
        margin-right: 1.5em;
    }

    .buttonContainer {
        display: flex;
        justify-content: flex-end;
    }

    .button {
        margin: 0.5em 0.25em;
        padding: 0.75em;
        font-size: 1.1rem;
    }

    #submit {
        --button-bg: limegreen;
        --button-fg: white;
    }

    #cancel {
        --button-bg: gray;
        --button-fg: white;
    }
</style>