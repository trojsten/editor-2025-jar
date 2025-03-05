<script lang="ts">
	import { onMount } from 'svelte';

	export let language = 'javascript';
	export let value = '';
	export let theme = 'customTheme'; //'vs-dark';
	export let onType: (needed: Map<string, number>) => Promise<boolean>;

	let editorContainer: HTMLDivElement;

	// Dynamic import of monaco-editor to handle SSR
	let monacoPromise: Promise<typeof import('monaco-editor')>;

	if (typeof window !== 'undefined') {
		monacoPromise = import('monaco-editor');
	}

	onMount(async () => {
		const monaco = await monacoPromise;

		monaco.editor.defineTheme('customTheme', {
			base: 'vs-dark',
			inherit: true,
			rules: [],
			colors: {
				'editor.background': '#030712'
			}
		});

		const editor = monaco.editor.create(editorContainer, {
			value,
			language,
			theme,
			contextmenu: false
		});

		editor.onKeyDown((event) => {
			const { keyCode, ctrlKey, metaKey } = event;
			if ((keyCode === 33 || keyCode === 52 || keyCode == 54) && (metaKey || ctrlKey)) {
				event.preventDefault();
			}
		});

		editor.onDidChangeModelContent(async function (event) {
			const needed: Map<string, number> = new Map();

			for (const change of event.changes) {
				for (const c of change.text.replace(/\s/g, '')) {
					if (needed.has(c)) {
						needed.set(c, needed.get(c) + 1);
					} else {
						needed.set(c, 1);
					}
				}
			}

			if (needed.size === 0) {
				return;
			}

			if (await onType(needed)) {
				// Magic
				editor.getModel().pushEditOperations(
					[], // Pass an empty array for selections
					event.changes.map((change) => ({
						range: new monaco.Range(
							change.range.startLineNumber,
							change.range.startColumn,
							change.range.endLineNumber + change.text.split('\n').length - 1,
							change.range.endColumn + change.text.length
						),
						text: ''
					})),
					() => null
				);
			}
		});

		editor.onMouseDown((event) => {
			const { buttons } = event.event;
			if (buttons != 1) {
				event.event.preventDefault();
			}
		});

		return () => {
			editor.dispose();
		};
	});
</script>

<div bind:this={editorContainer} class="editor-container rounded-xl"></div>

<style>
	.editor-container {
		width: 100%;
		height: 100%; /* Adjust the height as needed */
	}
</style>
