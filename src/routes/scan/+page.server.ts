import { clients } from '$lib/server/clients';
import db from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();

		const code = data.get('code');

		if (!code) {
			return fail(400, { error: `Code not provided` });
		}

		try {
			const c = await db.code.update({
				where: { code },
				data: { available: { decrement: 1 } }
			});

			if (c && c.available >= 0) {
				const [, inventory] = await db.$transaction([
					db.inventory.upsert({
						where: {
							item_teamId: {
								item: c.item,
								teamId: locals.session.team.id
							}
						},
						create: {
							team: { connect: { id: locals.session.team.id } },
							item: c.item,
							quantity: 1
						},
						update: {
							quantity: { increment: 1 }
						}
					}),
					db.inventory.findMany({
						where: { team: { id: locals.session.team.id } },
						select: { item: true, quantity: true }
					})
				]);

				const team = clients.get(locals.session.team.id);
				const inv = inventory.reduce((acc, { item, quantity }) => {
					acc[item] = quantity;
					return acc;
				}, {});
				if (team) {
					for (const [, emit] of team) {
						emit('inventory', JSON.stringify(inv));
					}
				}

				return { message: `${code}: OK (${c.available} remaing)` };
			}

			return fail(400, { error: `${code}: Code not longer available` });
		} catch {
			return fail(400, { error: `${code}: Code not available (error)` });
		}
	}
} satisfies Actions;
