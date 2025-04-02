import db from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const problems = await db.problem.findMany({
		select: { title: true, slug: true, points: true },
		orderBy: [
			{
				points: 'asc'
			},
			{
				title: 'asc'
			}
		]
	});
	return {
		problems
	};
};
