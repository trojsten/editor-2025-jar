<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	onMount(() => {
		setInterval(() => {
			invalidate('app:results');
		}, 5000);
	});
</script>

<svelte:head>
	<title>Problémy | {data.session.team.name}</title>
</svelte:head>

<div class="center">
	<h1 class="text-3xl">Výsledky</h1>
	<div class="my-5 divide-y divide-gray-800 rounded-xl border-2 border-gray-800">
		{#each data.results.toSorted( (a, b) => (a.points < b.points ? 1 : a.points < b.points ? -1 : 0) ) as team, i (team.id)}
			<span
				class="flex w-full cursor-pointer flex-row justify-between p-4 first:rounded-t-md last:rounded-b-md hover:bg-gray-800"
			>
				<span class="flex items-center justify-center gap-4"
					><span class="text-2xl">{i + 1}.</span> {team.name}</span
				>
				<span class="rounded-xl bg-green-600 px-3 py-1">{team.points} bodov</span>
			</span>
		{/each}
	</div>

	<h1 class="text-3xl">Posledné submity</h1>
	<div class="my-5 divide-y divide-gray-800 rounded-xl border-2 border-gray-800">
		{#each data.submits as submit, i (submit.id)}
			{@const protocol = JSON.parse(submit.protocol)}
			<span
				class="flex w-full cursor-pointer flex-row justify-between p-4 first:rounded-t-md last:rounded-b-md hover:bg-gray-800"
			>
				<span class="flex items-center justify-center gap-4">
					{submit.problem.title} / {submit.team.name}
				</span>
				<span>
					<span class="mr-2 text-gray-500">
						{submit.createdAt.toLocaleString('sk-SK')}
					</span>
					<span
						class="rounded-xl px-2 py-1"
						class:bg-red-600={protocol?.final_verdict && protocol?.final_verdict != 'OK'}
						class:bg-green-600={protocol?.final_verdict && protocol?.final_verdict == 'OK'}
						class:bg-gray-800={!protocol?.final_verdict}
					>
						{#if submit.status == 0}
							{#if protocol?.final_verdict}
								{protocol.final_verdict}
							{:else if !submit.testingStatus}
								Odoslané na Judge
							{:else if submit.testingStatus == 'waiting'}
								Čaká sa na testovanie
							{:else if submit.testingStatus == 'pulling_image'}
								Pripavuje sa testovanie
							{:else if submit.testingStatus == 'measuring_timelimit'}
								Určujem časový limit
							{:else if submit.testingStatus == 'testing'}
								Testujem
							{:else if submit.testingStatus == 'done'}
								Testovanie dokončené
							{:else}
								{submit.testingStatus}
							{/if}
						{:else if submit.status == 2}
							Testovanie zlyhalo
						{:else}
							{protocol?.final_verdict}
						{/if}
					</span>
				</span>
			</span>
		{/each}
	</div>
</div>
