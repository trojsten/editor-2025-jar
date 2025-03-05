import db from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const problem = await db.problem.findUnique({
		where: {
			slug: params.slug
		}
	});
	return {
		problem
	};
};
