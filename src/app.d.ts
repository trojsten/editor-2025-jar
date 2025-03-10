// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session: Prisma.SessionGetPayload<{
				select: {
					id: true;
					team: {
						select: {
							id: true;
							name: true;
							scanDecrement: true;
							scanIncrement: true;
							backspaceReturn: true;
							processingTime: true;
						};
						solved: { select: { slug: true } };
					};
				};
			}>;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
