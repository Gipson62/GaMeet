import "@vinejs/vine";
import vine from "@vinejs/vine";

const createSchema = vine.object({
    name: vine.string().trim().maxLength(64),
    studio: vine.string().trim().maxLength(64),
    publisher: vine.string().trim().maxLength(64),
    platforms: vine.array(vine.string().trim()),
    banner_id: vine.number().withoutDecimals(),
    logo_id: vine.number().withoutDecimals(),
    grid_id: vine.number().withoutDecimals(),
    is_approved: vine.boolean(),
    release_date: vine.date(),
    description: vine.string().trim(),
});

const updateSchema = vine.object({
    name: vine.string().trim().maxLength(64).optional(),
    studio: vine.string().trim().maxLength(64).optional(),
    publisher: vine.string().trim().maxLength(64).optional(),
    platforms: vine.array(vine.string().trim()).optional(),
    banner_id: vine.number().withoutDecimals().optional(),
    logo_id: vine.number().withoutDecimals().optional(),
    grid_id: vine.number().withoutDecimals().optional(),
    is_approved: vine.boolean().optional(),
    release_date: vine.date().optional(),
    description: vine.string().trim().optional(),
});

const idParamSchema = vine.object({
    id: vine.number().withoutDecimals(),
});

export const
    create = vine.compile(createSchema),
    update = vine.compile(updateSchema),
    idParam = vine.compile(idParamSchema);