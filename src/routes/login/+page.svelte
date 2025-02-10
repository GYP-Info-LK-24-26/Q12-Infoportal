<script lang="ts">
    import { enhance } from "$app/forms";

    export let form;
</script>

<svelte:head>
    <title>Anmeldung</title>
</svelte:head>

<h1>Anmeldung</h1>

<form method="post" use:enhance>
    <label for="firstName">Vorname:</label>
    <input type="text" name="firstName" id="firstName"><br>
    <label for="lastName">Nachname:</label>
    <input type="text" name="lastName" id="lastName"><br>
    <label for="birth">Geburtsdatum:</label>
    <input type="date" name="birth" id="birth"><br>
    <button type="submit">Anmelden</button><br>
    {#if form?.error}
        <span>{form.error}</span>
    {/if}
</form>