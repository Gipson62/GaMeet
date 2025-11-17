import * as userValidator from './validator/user.js';
import * as eventValidator from './validator/event.js';

export const userValidatorMiddleware = {
    profile: async (req, res, next) => {
        try {
            req.val = await userValidator.searchedUser.validate(req.user);
            next();
        } catch (e) {
            res.status(400).send(e.message);
        }
    },
    searchedUser: async (req, res, next) => {
        try {
            req.val = await userValidator.searchedUser.validate(req.params);
            next();
        } catch (e) {
            res.status(400).send(e.message);
        }
    },
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
            req.val.id = req.user.id;
            next();
        } catch (e) {
            res.status(400).send(e.message);
        }
    },
    userToDelete: async (req, res, next) => {
        try {
            req.val = await userValidator.userToDelete.validate(req.params);
            next();
        } catch (e) {
            res.status(400).send(e.message);
        }
    }
    ,
    delete: async (req, res, next) => {
        try {
            req.val = await userValidator.userToDelete.validate(req.user);
            next();
        } catch (e) {
            res.status(400).send(e.message);
        }
    }
};

export const eventValidatorMiddleware = {
    create: async (req, res, next) => {
        try {
            req.val = await eventValidator.create.validate(req.body);
            next();
        } catch (e) {
            res.status(400).send(e.message);
        }
    },
    update: async (req, res, next) => {
        try {
            req.val = await eventValidator.update.validate(req.body);
            next();
        } catch (e) {
            res.status(400).send(e.message);
        }
    },
    idParam: async (req, res, next) => {
        try {
            req.ParamVal = await eventValidator.idParam.validate(req.params);
            next();
        } catch (e) {
            res.status(400).send(e.message);
        }
    }
};
