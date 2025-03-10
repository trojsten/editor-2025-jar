<script lang="ts">
	import { onMount } from 'svelte';

	let {
		language,
		value = $bindable(),
		theme = 'customTheme',
		onType
	}: {
		language: string;
		value: string;
		theme?: string;
		onType: (needed: Map<string, number>, deleted: Map<string, number>) => Promise<boolean>;
	} = $props();

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
			contextmenu: false,
			readOnlyMessage: {
				value:
					'Čakajte prosím, ešte spracovávame vašu predchádzajúcu požiadavku. Za meškanie sa v mene Železničnej spoločnosti Trojstenu, náhodného dopravcu, neospravedlňujeme.'
			}
		});

		editor.onKeyDown((event) => {
			const { keyCode, ctrlKey, metaKey } = event;
			if ((keyCode === 33 || keyCode === 52 || keyCode == 54) && (metaKey || ctrlKey)) {
				event.preventDefault();
			}
		});

		let lastReverted = false;
		let lastPosition = editor.getPosition();

		editor.onDidChangeModelContent(async function (event) {
			const wasReadonly = editor.getOption(monaco.editor.EditorOption.readOnly);
			if (!wasReadonly) {
				editor.updateOptions({
					readOnly: true
				});
			}
			const needed: Map<string, number> = new Map();
			const deleted: Map<string, number> = new Map();

			for (const change of event.changes) {
				for (const c of change.text.replace(/\s/g, '')) {
					if (needed.has(c)) {
						needed.set(c, needed.get(c) + 1);
					} else {
						needed.set(c, 1);
					}
				}
				const deletedText = value
					.split('\n')
					[
						change.range.startLineNumber - 1
					].substring(change.range.startColumn - 1, change.range.endColumn - 1);
				for (const c of deletedText) {
					if (deleted.has(c)) {
						deleted.set(c, deleted.get(c) + 1);
					} else {
						deleted.set(c, 1);
					}
				}
			}

			if (lastReverted && wasReadonly) {
				lastReverted = false;
				editor.updateOptions({
					readOnly: false
				});
				return;
			}

			if (await onType(needed, deleted)) {
				// Magic
				// editor.getModel().pushEditOperations(
				// 	[], // Pass an empty array for selections
				// 	event.changes.map((change) => ({
				// 		range: new monaco.Range(
				// 			change.range.startLineNumber,
				// 			change.range.startColumn,
				// 			change.range.endLineNumber + change.text.split('\n').length - 1,
				// 			change.range.endColumn + change.text.length
				// 		),
				// 		text: ''
				// 	})),
				// 	() => null
				// );
				lastReverted = true;
				editor.setValue(value);
				if (lastPosition) editor.setPosition(lastPosition);
			} else {
				lastReverted = false;

				value = editor.getValue();
				lastPosition = editor.getPosition();
				editor.updateOptions({
					readOnly: false
				});
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
