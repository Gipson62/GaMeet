import vine from '@vinejs/vine';

const createSchema = vine.object({
    name: String,
});

export const create = vine.compile(createSchema);