import vine from '@vinejs/vine';

// Création d'un event
const createSchema = vine.object({
    name: vine.string().trim().maxLength(64),
    scheduled_date: vine.date({
        formats: ['iso8601']
    }),
    description: vine.string().trim().maxLength(1024).optional(),
    location: vine.string().trim().maxLength(255).optional(),
    max_capacity: vine.number().withoutDecimals().optional(),
    game_id: vine.array(vine.number().withoutDecimals()).optional(),
    photo_id: vine.array(vine.number().withoutDecimals()).optional()
});

// Mise à jour d'un event (tout optionnel)
const updateSchema = vine.object({
    name: vine.string().trim().maxLength(64).optional(),
    scheduled_date: vine.date({
        formats: ['iso8601']
    }).optional(),
    description: vine.string().trim().maxLength(1024).optional(),
    location: vine.string().trim().maxLength(255).optional(),
    max_capacity: vine.number().withoutDecimals().optional(),
    game_id: vine.array(vine.number().withoutDecimals()).optional(),
    photo_id: vine.array(vine.number().withoutDecimals()).optional()
});

// Validation du paramètre ID
const idParamSchema = vine.object({
    id: vine.number().withoutDecimals()
});

export const
    create = vine.compile(createSchema),
    update = vine.compile(updateSchema),
    idParam = vine.compile(idParamSchema);
