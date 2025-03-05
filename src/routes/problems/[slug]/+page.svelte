<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let problem = $derived(data.problem);

	import { source } from 'sveltekit-sse';
	const inventory = source('/api/inventory', {
		close({ connect }) {
			console.log('reconnecting...');
			connect();
		}
	})
		.select('inventory')
		.json();

	const onType = async (needed: Map<string, number>) => {
		console.log('Needed:', needed);

		let possible = true;

		for (const [item, quantity] of needed) {
			const a = $inventory?.find((i) => i.item === item);
			if (!a || a?.quantity < quantity) {
				possible = false;
				break;
			}
		}

		if (possible) {
			// send DELETE request
			await fetch(`/api/inventory`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(Array.from(needed.entries()))
			});
		}

		return !possible;
	};
</script>

<div class="grid grid-cols-[1fr_2fr] gap-4">
	<div>
		<div class="flex flex-row justify-between">
			<h1 class="text-3xl">{problem.title}</h1>
			<span class="rounded-xl bg-red-600 px-3 py-1">{problem.points} bodov</span>
		</div>

		<div class="mt-4 text-center">
			<h2 class="text-xl">Inventár</h2>
			<div class="grid grid-cols-4 gap-4">
				{#each $inventory as item, i (item.item)}
					<div class="flex justify-around">
						<span>{item.item}</span><span>{item.quantity}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<div class="h-[calc(100vh-6.5rem)] rounded-xl">
		<Editor language="python" value="" {onType} />
	</div>
</div>
