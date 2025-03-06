<script lang="ts">
	let { inventory, double = false } = $props();

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
</script>

<svelte:window
	onkeydown={(e) => {
		shift_pressed = e.shiftKey;
	}}
	onkeyup={(e) => {
		if (!e.shiftKey) shift_pressed = false;
	}}
/>

<div class="flex flex-col gap-2 text-center">
	{#each double ? Array.prototype.concat(keyboard_rows, [[]], shift_keyboard_rows) : shift_pressed ? shift_keyboard_rows : keyboard_rows as row, i (i)}
		<div class="flex h-8 flex-row justify-center gap-2">
			{#each row as char, j (char)}
				{@const count = inventory ? (char in inventory ? inventory[char] : 0) : 0}
				{@const text_color =
					count <= 0
						? 'text-gray-500'
						: count <= 3
							? 'text-red-500'
							: count <= 8
								? 'text-amber-500'
								: count >= 25
									? 'text-green-500'
									: ''}
				{@const bg_color =
					count <= 0
						? 'bg-gray-800'
						: count <= 3
							? 'bg-red-950'
							: count <= 8
								? 'bg-amber-950'
								: count >= 25
									? 'bg-green-950'
									: 'bg-gray-950'}

				<kbd class="kbd lh size-8 rounded-lg leading-8 {text_color} {bg_color}">
					{char}
				</kbd>
			{/each}
		</div>
	{/each}
</div>
