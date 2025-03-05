import db from '$lib/server/db';
import { fail, redirect, type Actions } from '@sveltejs/kit';

export const actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();

		const team = await db.team.findUnique({ where: { password: data.get('password') } });

		console.warn(team, data.get('password'));
		console.warn(locals.session);

		if (!team) {
			return fail(400, { error: 'Incorrect password' });
		}

		await db.session.update({
			where: { id: locals.session.id },
			data: {
				team: { connect: team }
			}
		});

		redirect(303, '/');
	}
} satisfies Actions;
