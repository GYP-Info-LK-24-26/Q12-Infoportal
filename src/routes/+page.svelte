<script lang="ts">
	import { page } from "$app/stores";
    import Schedule from "$lib/components/Schedule.svelte";
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<div>
	{#if $page.data.user}
		<h2>
			<b>Hallo {$page.data.user.firstName} {$page.data.user.lastName}!</b>
		</h2>
		<Schedule />
	{/if}
</div>
