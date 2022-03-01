<script lang="ts">
    import {goto} from "$app/navigation";
    import {Project} from "$lib/structs";

    let project: Project = {
        name: "",
        admin: "",
        users: []
    };

    let submitting = false;

    // TODO Get the current user as the admin
    // Allow them to add other users as members of the project.
    const submitForm = () => {
        console.log("Clicked.");
        console.log(project);

        submitting = true;
        fetch(import.meta.env.VITE_APP_API_URL + "/project", {
            method: "post",
            body: JSON.stringify(project)
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
                    goto(`../`);
                submitting = false;
            });
    };
</script>

<div>
    <div class="input-form">
        <input type="text" id="title" name="title" placeholder="Name" bind:value={project.name}/>

        <div>Add members...</div>

        <div class="buttonContainer">
            <!-- TODO Implement button clicks here -->
            <div class="button" id="submit" on:click={submitForm}>Submit</div>
            <div class="button" id="cancel" on:click={() => goto("/projects")}>Cancel</div>
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