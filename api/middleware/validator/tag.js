import "@vinejs/vine";
import vine from "@vinejs/vine";

const createSchema = vine.object({
    name: vine.string().trim().maxLength(64),
});

const updateSchema = vine.object({
    name: vine.string().trim().maxLength(64).optional(),
});

const nameParamSchema = vine.object({
    name: vine.string().trim().maxLength(64),
});



export const
    create = vine.compile(createSchema),
    update = vine.compile(updateSchema),
    idParam = vine.compile(nameParamSchema);