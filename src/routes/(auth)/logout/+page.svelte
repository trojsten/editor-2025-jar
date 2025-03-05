<script lang="ts">
	import { browser } from '$app/environment';
	import { goto, invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// invalidate session
	if (browser && data.logged_out) invalidate('app:session');

	onMount(() => {
		goto('/');
	});
</script>
