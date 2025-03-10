import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import monacoEditorEsmPlugin from 'vite-plugin-monaco-editor-esm';

export default defineConfig({
	plugins: [
		sveltekit(),
		tailwindcss(),
		monacoEditorEsmPlugin({
			languageWorkers: []
		})
	],
	server: {
		watch: {
			ignored: ['**/sqlite.db', '**/sqlite.db-journal']
		}
	},
	optimizeDeps: {
		include: ['monaco-editor']
	}
});
