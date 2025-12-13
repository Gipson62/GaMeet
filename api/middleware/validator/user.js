import vine from '@vinejs/vine';

const userIDSchema = vine.object({
    id: vine.number()
});

const registerSchema = vine.object({
    pseudo: vine.string().trim().minLength(3).maxLength(64),
    email: vine.string().email().trim().maxLength(64),
    password: vine.string().minLength(8).maxLength(25),
    birth_date: vine.date(),
    bio: vine.string().trim().maxLength(255).optional(),
    photo_id: vine.number().withoutDecimals().optional()
});

const loginSchema = vine.object({
    email: vine.string().email().trim(),
    password: vine.string()
});

const updateSchema = vine.object({
    pseudo: vine.string().trim().maxLength(64).optional(),
    email: vine.string().email().trim().maxLength(64).optional(),
    birth_date: vine.date().optional(),
    bio: vine.string().trim().maxLength(255).optional(),
    photo_id: vine.number().withoutDecimals().optional()
});

export const
    create = vine.compile(registerSchema),
    update = vine.compile(updateSchema),
    idParam = vine.compile(userIDSchema),
    login = vine.compile(loginSchema);