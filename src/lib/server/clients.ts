export const clients: Map<
	string,
	Map<string, (eventName: string, data: string) => import('sveltekit-sse').Unsafe<void, Error>>
> = new Map();
