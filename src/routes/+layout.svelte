<script lang="ts">
	import '../app.css';
	let { data, children } = $props();
</script>

<header class="flex h-16 w-full flex-row justify-between bg-gray-950 p-5 text-white">
	<div class="flex flex-row gap-4">
		<a href="/" class="font-bold">Editor Jar 2025</a>
		{#if data.session.team}
			<a href="/problems">Úlohy</a>
			<a href="/scan">Skenovanie</a>
		{/if}
	</div>
	<div class="flex flex-row gap-4">
		{#if data.session.team}
			<span class="font-bold">{data.session.team.name}</span>
			<a href="/logout">Odhlásiť sa</a>
		{:else}
			<a href="/login">Prihlásiť sa</a>
		{/if}
	</div>
</header>
<main class="min-h-[calc(100vh-4rem)] bg-gray-900 p-5 text-gray-100">
	{@render children()}
</main>
<footer></footer>
