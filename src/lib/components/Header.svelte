<script>
    import Auth from './Auth.svelte';
</script>

<header>
	<nav>
	</nav>

	<Auth />
</header>

<style>
	header {
		position: sticky;
		top: 0;
		display: flex;
		justify-content: space-between;
	}

	nav {
		display: flex;
		justify-content: center;
		--background: rgba(255, 255, 255, 0.7);
	}
</style>
