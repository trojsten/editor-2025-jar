import { env } from '$env/dynamic/private';
import { clients } from '$lib/server/clients';
import db from '$lib/server/db';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();

	if (data.token != env.JUDGE_TOKEN) {
		return new Response(undefined, { status: 401 });
	}

	const submit = await db.submit.update({
		where: {
			publicId: data.public_id
		},
		data: {
			protocol: JSON.stringify(data.protocol),
			status: data.status,
			testingStatus: data.testing_status
		},
		select: {
			problem: {
				select: {
					slug: true
				}
			},
			team: {
				select: {
					id: true,
					solved: {
						select: {
							slug: true
						}
					}
				}
			}
		}
	});

	if (data.protocol.final_verdict == 'OK') {
		submit.team.solved.push({ slug: submit.problem.slug });
		await db.team.update({
			where: {
				id: submit.team.id
			},
			data: {
				solved: {
					set: submit.team.solved
				}
			}
		});
	}

	const team = clients.get(submit.team.id);

	const submits = JSON.stringify(
		await db.submit.findMany({
			where: {
				team: { id: submit.team.id },
				problem: submit.problem
			}
		})
	);

	if (team) {
		for (const [, emit] of team) {
			emit('submits-' + submit.problem.slug, submits);
		}
	}

	return new Response();
};
