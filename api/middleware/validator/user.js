import vine from '@vinejs/vine';

const registerSchema = vine.object({
    pseudo: vine.string().trim().maxLength(64),
    email: vine.string().email().trim().maxLength(64),
    password: vine.string().minLength(8).maxLength(255),
    birth_date: vine.date().optional(),
    bio: vine.string().trim().maxLength(255),
    is_admin: vine.boolean().optional(),
    photo_id: vine.number().withoutDecimals().optional()
});

const loginSchema = vine.object({
    email: vine.string().email().trim(),
    password: vine.string()
});

const updateSchema = vine.object({
    pseudo: vine.string().trim().maxLength(64).optional(),
    email: vine.string().email().trim().maxLength(64).optional(),
    password: vine.string().minLength(8).maxLength(25).optional(),
    birth_date: vine.date().optional(),
    bio: vine.string().trim().maxLength(255).optional(),
    is_admin: vine.boolean().optional(),
    photo_id: vine.number().withoutDecimals().optional()
});

export const
    register = vine.compile(registerSchema),
    login = vine.compile(loginSchema),
    update = vine.compile(updateSchema);
