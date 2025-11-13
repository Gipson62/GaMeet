import * as userValidator from './validator/user.js';

export const userValidatorMiddleware = {
    login: async (req, res, next) => {
        try {
            req.val = await userValidator.login.validate(req.body);
            next();
        } catch (e) {
            res.status(400).send(e.message);
        }
    },
    register: async (req, res, next) => {
        try {
            req.val = await userValidator.register.validate(req.body);
            next();
        } catch (e) {
            res.status(400).send(e.message);
        }
    },
    update: async (req, res, next) => {
        try {
            req.val = await userValidator.update.validate(req.body);
            next();
        } catch (e) {
            res.status(400).send(e.message);
        }
    }
};
