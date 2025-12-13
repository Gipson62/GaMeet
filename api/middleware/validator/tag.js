import "@vinejs/vine";
import vine from "@vinejs/vine";

const createSchema = vine.object({
    name: vine.string().trim().maxLength(64),
});

const nameParamSchema = vine.object({
    name: vine.string().trim().maxLength(64),
});

const gameIdTagSchema = vine.object({
    id: vine.number().withoutDecimals(),
    tag_name: vine.string().trim().maxLength(32),
});

const gameIdParamSchema = vine.object({
    id: vine.number().withoutDecimals(),
});

export const
    create = vine.compile(createSchema),
    nameParam = vine.compile(nameParamSchema),
    idParam = vine.compile(gameIdParamSchema),
    gameIdTagNameParam = vine.compile(gameIdTagSchema);