import vine from '@vinejs/vine';

// Création d'un event avec checks métiers
const createSchema = vine.object({
  name: vine.string().trim().maxLength(64),
  scheduled_date: vine.date().refine(date => date > new Date(), 'La date doit être dans le futur'),
  description: vine.string().trim().maxLength(1024).optional(),
  location: vine.string().trim().maxLength(255).optional(),
  max_capacity: vine.number().withoutDecimals().min(1).optional(),
  game_id: vine.array(vine.number().withoutDecimals()).minLength(1, 'Au moins un jeu requis').optional(),
  photo_id: vine.array(vine.number().withoutDecimals()).minLength(1, 'Au moins une photo requise').optional()
});

// Mise à jour d'un event (tout optionnel avec checks)
const updateSchema = vine.object({
  name: vine.string().trim().maxLength(64).optional(),
  scheduled_date: vine.date().refine(date => date > new Date(), 'La date doit être dans le futur').optional(),
  description: vine.string().trim().maxLength(1024).optional(),
  location: vine.string().trim().maxLength(255).optional(),
  max_capacity: vine.number().withoutDecimals().min(1).optional(),
  game_id: vine.array(vine.number().withoutDecimals()).minLength(1, 'Au moins un jeu requis').optional(),
  photo_id: vine.array(vine.number().withoutDecimals()).minLength(1, 'Au moins une photo requise').optional()
});

// Validation du paramètre ID
const idParamSchema = vine.object({
  id: vine.number().withoutDecimals()
});

export const
  create = vine.compile(createSchema),
  update = vine.compile(updateSchema),
  idParam = vine.compile(idParamSchema);
