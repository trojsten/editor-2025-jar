import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import db from '$lib/server/db';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { nanoid } from 'nanoid';

const session: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('sid') ?? nanoid();

	const session = await db.session.upsert({
		where: {
			id: sessionId,
			updated: {
				gte: new Date(new Date().getTime() - parseInt(env.SESSION_MAXAGE ?? '3600') * 1000)
			}
		},
		select: {
			id: true,
			team: {
				select: {
					id: true,
					name: true,
					scanDecrement: true,
					scanIncrement: true,
					backspaceReturn: true,
					processingTime: true,
					solved: { select: { slug: true } }
				}
			}
		},
		update: {
			updated: new Date()
		},
		create: {}
	});

	event.cookies.set('sid', session.id, {
		secure: !dev,
		path: '/',
		maxAge: parseInt(env.SESSION_MAXAGE)
	});

	event.locals.session = session;

	return resolve(event);
};

const protect: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.match(/^\/(problems|scan|api\/inventory)/i))
		if (!event.locals.session.team) {
			return new Response(undefined, {
				headers: { location: `/login` },
				status: 302
			});
		}

	return resolve(event);
};

export const handle: Handle = sequence(session, protect);
