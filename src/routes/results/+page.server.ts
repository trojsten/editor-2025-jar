import db from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ depends }) => {
	depends('app:results');

	const teams = await db.team.findMany({
		select: {
			id: true,
			name: true,
			solved: {
				select: {
					id: true,
					points: true
				}
			}
		}
	});

	const submits = await db.submit.findMany({
		select: {
			id: true,
			problem: {
				select: {
					id: true,
					title: true,
					points: true
				}
			},
			team: {
				select: {
					id: true,
					name: true
				}
			},
			protocol: true,
			status: true,
			testingStatus: true,
			createdAt: true
		},
		take: 10,
		orderBy: {
			createdAt: 'desc'
		}
	});

	return {
		submits: submits,
		results: teams.map((team) => ({
			id: team.id,
			name: team.name,
			points: team.solved.reduce((acc, solved) => acc + solved.points, 0)
		}))
	};
};
