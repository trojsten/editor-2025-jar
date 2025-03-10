import { clients } from '$lib/server/clients';
import db from '$lib/server/db';
import { getRandomValue } from '$lib/util';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();

		const code = data.get('code');

		if (typeof code !== 'string') {
			return fail(400, { error: `Code not provided` });
		}

		try {
			const c = await db.code.update({
				where: { code },
				data: { available: { decrement: locals.session.team.scanDecrement } }
			});

			if (c && c.available >= 0) {
				if (c.item.startsWith('special:')) {
					console.log(
						'special code scanned by team ' + locals.session.team.name + ' (' + c.item + ')'
					);
					const args = c.item.split(':');
					const who = args[1]; // all, random, team
					const what = args[2]; // scanIncrement, scanDecrement, backspaceReturn, processingTime
					const count = parseInt(args[3]);
					// maybe this is not needed?
					const count_op = count > 0 ? { increment: count } : { decrement: count };
					const affectedTeams =
						who === 'all'
							? clients.keys().toArray()
							: who === 'team'
								? ([locals.session.team.id] as string[])
								: [
										getRandomValue(Array.prototype.concat(clients.keys(), [locals.session.team.id]))
									]; // lets have random team a little bit more chance of being the team that scanned the code :D

					await db.team.updateMany({
						where: {
							id: {
								in: affectedTeams
							}
						},
						data: {
							[what]: count_op
						}
					});

					for (const team of affectedTeams) {
						const teamClients = clients.get(team);
						if (teamClients) {
							for (const [, emit] of teamClients) {
								emit('upgrade', JSON.stringify({ item: c.item }));
							}
						}
					}

					return { message: `${code}: Upgrade Applied! (${c.available} remaing)` };
				} else {
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
								quantity: locals.session.team.scanIncrement
							},
							update: {
								quantity: { increment: locals.session.team.scanIncrement }
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
			}

			return fail(400, { error: `${code}: Code not longer available` });
		} catch (e) {
			return fail(400, { error: `${code}: Code not available (error)\n` + e });
		}
	}
} satisfies Actions;
