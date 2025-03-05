<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div class="center">
	<h1 class="text-3xl">Úlohy</h1>
	<div class="my-5 divide-y divide-gray-800 rounded-xl border-2 border-gray-800">
		{#each data.problems as problem, i (problem.slug)}
			<a
				class="flex w-full cursor-pointer flex-row justify-between p-4 first:rounded-t-md last:rounded-b-md hover:bg-gray-800"
				href={`/problems/${problem.slug}`}
			>
				<span class="flex items-center justify-center">{problem.title}</span>
				<span class="rounded-xl bg-red-600 px-3 py-1">{problem.points} bodov</span>
			</a>
		{/each}
	</div>
</div>
