import { env } from '$env/dynamic/private';
import db from '$lib/server/db';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();

	if (data.token != env.JUDGE_TOKEN) {
		return new Response(undefined, { status: 401 });
	}

	await db.submit.update({
		where: {
			publicId: data.public_id
		},
		data: {
			protocol: JSON.stringify(data.protocol),
			status: data.status,
			testingStatus: data.testing_status
		}
	});

	return new Response();
};
