<script context="module" lang="ts">
    let projectId: string;
    export const load = async (page) => {
        return projectId = page.params.projectId;
    };
</script>

<script lang="ts">
    import Button from "$lib/ui/Button.svelte";
</script>

<a href="/projects/{projectId}/ticket">
    <Button>Tickets</Button>
</a>
