import { clients } from '$lib/server/clients';
import db from '$lib/server/db';
import { produce } from 'sveltekit-sse';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
  return produce(
    function start({ emit }) {
      // Map the session id to an emitter.
      // This will also indicate to you that the client is "online".
      const team = clients.get(locals.session.team.id);

      if (team) team.set(locals.session.id, emit);
      else {
        const map = new Map();
        map.set(locals.session.id, emit);
        clients.set(locals.session.team.id, map);
      }

      db.inventory
        .findMany({
          where: { team: { id: locals.session.team.id } },
          select: { item: true, quantity: true }
        })
        .then((inventory) => {
          const inv = inventory.reduce((acc, { item, quantity }) => {
            acc[item] = quantity;
            return acc;
          }, {});
          emit('inventory', JSON.stringify(inv));
        });
    },
    {
      // Client goes "offline", so remove the entry.
      stop() {
        const team = clients.get(locals.session.team.id);

        if (team) team.delete(locals.session.id);
      }
    }
  );
};

export const DELETE: RequestHandler = async ({ locals, request }) => {
  await db.$transaction(
    (await request.json()).map(([char, count]: [string, number]) =>
      db.inventory.update({
        where: {
          item_teamId: {
            item: char,
            teamId: locals.session.team.id
          }
        },
        data: {
          quantity: {
            decrement: count
          }
        }
      })
    )
  );

  const inventory = await db.inventory.findMany({
    where: { team: { id: locals.session.team.id } },
    select: { item: true, quantity: true }
  });
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

  return new Response();
};
