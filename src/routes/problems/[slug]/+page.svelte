<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import Inventory from '$lib/components/Inventory.svelte';
	import SvelteMarkdown from '@humanspeak/svelte-markdown';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let problem = $derived(data.problem);

	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { env } from '$env/dynamic/public';
	import { source } from 'sveltekit-sse';

	const sseSource = source('/api/inventory', {
		close({ connect }) {
			console.log('reconnecting...');
			connect();
		}
	});
	const inventory = sseSource.select('inventory').json();

	let submits = $state(data.submits.reverse());

	sseSource
		.select('submits-' + data.problem?.slug)
		.json()
		.subscribe((s) => {
			if (!s) return;
			submits = s.reverse();
			const protocol = JSON.parse(s[0]?.protocol);
			if (protocol?.final_verdict && protocol?.final_verdict == 'OK') {
				invalidateAll();
			}
		});

	const onType = async (needed: Map<string, number>) => {
		let possible = true;

		for (const [item, quantity] of needed) {
			if (!$inventory || !(item in $inventory) || $inventory[item] < quantity) {
				possible = false;
				break;
			}
		}

		if (possible) {
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

	const keyboard_rows = [
		['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
		['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
		['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
		['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
	];

	const shift_keyboard_rows = [
		['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+'],
		['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', '|'],
		['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':', '"'],
		['Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?']
	];

	let shift_pressed = $state(false);

	let program: string = $state('print("ahoj editor")');

	let submit_show = $state(-1);
</script>

<svelte:window
	onkeydown={(e) => {
		shift_pressed = e.shiftKey;
	}}
	onkeyup={(e) => {
		if (!e.shiftKey) shift_pressed = false;
	}}
/>

<svelte:head>
	{#if browser}
		<script src="{env.PUBLIC_JUDGE_URL}/static/js/protocol-embed.js"></script>
	{/if}
</svelte:head>

<div class="grid grid-cols-[1fr_2fr] gap-4">
	{#if !problem}
		<div class="text-white">Found problem: Problem not found</div>
	{:else}
		{@const solved = data.session.team.solved.some((p) => p.slug == problem.slug)}
		<div>
			<div class="flex flex-row justify-between">
				<h1 class="text-3xl">{problem.title}</h1>
				<span class="rounded-xl px-3 py-1" class:bg-red-600={!solved} class:bg-green-600={solved}
					>{problem.points} bodov</span
				>
			</div>
			<div class="my-5">
				<Inventory inventory={$inventory}></Inventory>
			</div>

			<div class="mt-4 text-center"></div>

			<div
				class="prose prose-headings:text-white prose-headings:mt-0 h-[calc(100vh-20.75rem)] overflow-y-scroll text-white"
			>
				<SvelteMarkdown source={problem.description} />
				<div class="flex flex-row justify-between">
					<h2>Submity</h2>
					<form method="POST" use:enhance>
						<input type="hidden" name="program" bind:value={program} />
						<button
							type="submit"
							class="py cursor-pointer rounded-xl bg-green-700 px-3 py-1 text-center hover:bg-green-600"
							>Odovzdať</button
						>
					</form>
				</div>
				{#each submits as submit, i (submit.id)}
					{@const protocol = JSON.parse(submit.protocol)}
					<div>
						<button
							type="button"
							class=" my-2 flex w-full cursor-pointer justify-between rounded-xl bg-gray-950 p-2 text-white"
							onclick={submit_show === i ? () => (submit_show = -1) : () => (submit_show = i)}
						>
							<span>{new Date(submit.createdAt).toLocaleString('sk-SK')}</span>
							<span
								class="rounded-xl px-2"
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
						</button>
						{#if submit_show === i}
							<judge-embed-protocol protocol-key={submit.protocolKey}></judge-embed-protocol>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<div class="h-[calc(100vh-6.5rem)] rounded-xl">
			<Editor language="python" bind:value={program} {onType} />
		</div>
	{/if}
</div>
