import { clients } from '$lib/server/clients';
import db from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const inventory = await db.inventory.findMany({
		where: { team: locals.session.team },
		select: { item: true, quantity: true }
	});

	return {
		inventory
	};
};

export const actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();

		const code = data.get('code');

		if (!code) {
			return fail(400, { error: `Code not provided` });
		}

		const inventory = await db.inventory.findMany({
			where: { team: locals.session.team },
			select: { item: true, quantity: true }
		});

		try {
			const c = await db.code.update({
				where: { code },
				data: { available: { decrement: 1 } }
			});

			if (c && c.available >= 0) {
				await db.inventory.upsert({
					where: {
						item_teamId: {
							item: c.item,
							teamId: locals.session.team.id
						}
					},
					create: {
						team: { connect: locals.session.team },
						item: c.item,
						quantity: 1
					},
					update: {
						quantity: { increment: 1 }
					}
				});

				const team = clients.get(locals.session.team.id);
				if (team) {
					for (const [, emit] of team) {
						emit('inventory', JSON.stringify(inventory));
					}
				}

				return { message: `${code}: OK (${c.available} remaing)`, inventory };
			}

			return fail(400, { error: `${code}: Code not longer available`, inventory });
		} catch {
			return fail(400, { error: `${code}: Code not available (error)`, inventory });
		}
	}
} satisfies Actions;
