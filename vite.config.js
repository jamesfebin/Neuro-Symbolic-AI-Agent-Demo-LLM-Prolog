import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		include: ['tau-prolog']
	  },
	define: {
	  'process.env': {},
	},
	build: {
	  rollupOptions: {
		input: 'src/app.html'
	  }
	}
  });