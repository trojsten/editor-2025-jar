<script lang="ts">
	import { enhance } from '$app/forms';
	import Inventory from '$lib/components/Inventory.svelte';
	import { source } from 'sveltekit-sse';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const inventory = source('/api/inventory', {
		close({ connect }) {
			console.log('reconnecting...');
			connect();
		}
	})
		.select('inventory')
		.json();
</script>

<svelte:head>
	<title>Skenovanie | {data.session.team.name}</title>
</svelte:head>

<div class="center">
	<h1 class="text-2xl">Skenovanie kódov</h1>
	<form
		method="POST"
		class="flex flex-row items-center justify-center"
		use:enhance={() => {
			return async ({ update, result, formElement }) => {
				await update({ reset: true });
				formElement.reset();
			};
		}}
	>
		<!-- svelte-ignore a11y_autofocus -->
		<input
			class="m-4 w-[12ch] rounded-xl bg-gray-950 text-center text-white"
			name="code"
			type="text"
			required
			maxlength="11"
			minlength="11"
			autofocus
		/>
	</form>

	{#if form?.error}
		<div class="my-4 rounded-xl bg-red-900 p-4 text-white">{form?.error}</div>
	{:else if form?.message}
		<div class="my-4 rounded-xl bg-green-900 p-4 text-white">{form?.message}</div>
	{/if}

	<Inventory inventory={$inventory} double></Inventory>
</div>
