import "@vinejs/vine";
import vine from "@vinejs/vine";

const updateSchema = vine.object({
    id: vine.number().withoutDecimals().optional(),
});

const idParamSchema = vine.object({
    id: vine.number().withoutDecimals(),
});

export const
    update = vine.compile(updateSchema),
    idParam = vine.compile(idParamSchema);