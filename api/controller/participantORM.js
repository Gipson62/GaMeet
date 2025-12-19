import prisma from '../database/databaseORM.js'


export const addParticipant = async (req, res) => {
  try {
    const event_id = req.eventParamsVal.id;
    const { user_id } = req.body;

    if (!req.user.is_admin) {
      return res.status(403).send({ message: 'Accès refusé' });
    }

    await prisma.participant.create({
      data: {
        event_id: Number(event_id),
        user_id: Number(user_id),
      },
    });

    res.sendStatus(201);
  } catch (e) {

    res.sendStatus(500);
  }
};

export const removeParticipant = async (req, res) => {
  try {
    const event_id = req.eventParamsVal.id;
    // depuis la route /:id/participant
    console.log(event_id);
    console.log('req.eventParamsVal:', req.eventParamsVal);
    const { user_id } = req.val;

    if (!req.user.is_admin) {
      return res.status(403).send({ message: 'Accès refusé' });
    }

    await prisma.participant.delete({
      where: {
        event_id_user_id: {
          event_id: Number(event_id),
          user_id: Number(user_id),
        },
      },
    });

    res.sendStatus(204);
  } catch (e) {

    res.sendStatus(500);
  }
};
