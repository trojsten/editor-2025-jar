import { env } from '$env/dynamic/private';
import db from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, depends }) => {
	depends('app:problem');
	const problem = await db.problem.findUnique({
		where: {
			slug: params.slug
		}
	});
	const submits = problem
		? await db.submit.findMany({
				where: {
					problemId: problem.id,
					teamId: locals.session.team.id
				}
			})
		: [];
	return {
		problem,
		submits
	};
};

export const actions = {
	default: async ({ request, locals, params }) => {
		const data = await request.formData();

		const program = data.get('program');

		if (!program) {
			return fail(400, { error: `Program not provided` });
		}

		try {
			const problem = await db.problem.findUniqueOrThrow({
				where: {
					slug: params.slug
				}
			});

			const resp = await fetch(env.JUDGE_URL + '/api/submits/', {
				method: 'POST',
				headers: new Headers({ ['X-API-Token']: env.JUDGE_TOKEN }),
				body: JSON.stringify({
					external_user_id: locals.session.team.name,
					task: params.slug,
					filename: 'solution.py',
					program,
					language: 'pypy'
				})
			});

			const data = await resp.json();

			await db.submit.create({
				data: {
					publicId: data.public_id,
					protocolKey: data.protocol_key,
					protocol: JSON.stringify(data.protocol),
					status: data.status,
					testingStatus: data.testing_status,
					problem: { connect: problem },
					team: { connect: { id: locals.session.team.id } }
				}
			});

			return { success: true, publicId: data.public_id, protocolKey: data.protocol_key };
		} catch (e) {
			console.error(e);
			return fail(400, { error: `Error` });
		}
	}
} satisfies Actions;
