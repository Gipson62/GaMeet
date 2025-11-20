import vine from '@vinejs/vine';

const createSchema = vine.object({
    note: vine.number().withoutDecimals().min(0).max(10),
    description: vine.string().trim().maxLength(1024).optional(),
    photo_id: vine.number().withoutDecimals().optional()
});

const updateSchema = vine.object({
    note: vine.number().withoutDecimals().min(0).max(10).optional(),
    description: vine.string().trim().maxLength(1024).optional(),
    photo_id: vine.number().withoutDecimals().optional()
});

const idParamSchema = vine.object({
    id: vine.number().withoutDecimals()
});

export const
    create = vine.compile(createSchema),
    update = vine.compile(updateSchema),
    idParam = vine.compile(idParamSchema);
