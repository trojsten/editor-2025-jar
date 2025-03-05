<script lang="ts">
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<div class="center">
	<h1 class="text-2xl">Prihlásenie</h1>
	{#if form?.error}
		<div class="my-4 rounded-xl bg-red-900 p-4 text-white">
			{form?.error}
		</div>
	{/if}
	<form method="POST" class="flex flex-row items-center justify-center">
		<input
			class="m-4 w-[12ch] rounded-xl bg-gray-950 text-center text-3xl text-white"
			name="password"
			type="password"
			required
			placeholder="Heslo"
		/>
	</form>
</div>
