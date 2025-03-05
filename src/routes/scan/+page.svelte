<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { form, data }: PageProps = $props();

	console.error(form);

	let inventory = $derived(form?.inventory ?? data.inventory);
</script>

<div class="center">
	<h1 class="text-2xl">Skenovanie kódov</h1>
	{#if form?.error}
		<div class="my-4 rounded-xl bg-red-900 p-4 text-white">{form?.error}</div>
	{:else if form?.message}
		<div class="my-4 rounded-xl bg-green-900 p-4 text-white">{form?.message}</div>
	{/if}

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
			class="m-4 w-[12ch] rounded-xl bg-gray-950 text-center text-3xl text-white"
			name="code"
			type="text"
			required
			maxlength="11"
			minlength="11"
			autofocus
		/>
	</form>

	<div class="mt-4 text-center">
		<h2 class="text-xl">Inventár</h2>
		<div class="grid grid-cols-4 gap-4">
			{#each inventory as item, i (item.item)}
				<div class="flex justify-around"><span>{item.item}</span><span>{item.quantity}</span></div>
			{/each}
		</div>
	</div>
</div>
