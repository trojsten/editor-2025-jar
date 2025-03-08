import db from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session?.team?.id) {
		return { logged_out: false };
	}

	await db.session.update({
		where: { id: locals.session.id },
		data: { team: { disconnect: { id: locals.session.team.id } } }
	});

	return { logged_out: true };
};
