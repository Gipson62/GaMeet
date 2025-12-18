import * as userValidator from './validator/user.js';
import * as eventValidator from './validator/event.js';
import * as reviewValidator from './validator/review.js';
import * as gameValidator from './validator/game.js';
import * as tagValidator from './validator/tag.js';
import * as photoValidator from './validator/photo.js';
import * as participantValidator from "./validator/participant.js";
export const userValidatorMiddleware = {
    profile: async (req, res, next) => {
        try {
            req.val = await userValidator.idParam.validate(req.user);
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
    create: async (req, res, next) => {
        try {
            req.val = await userValidator.create.validate(req.body);
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
    idParam: async (req, res, next) => {
        try {
            req.val = await userValidator.idParam.validate(req.params);
            next();
        } catch (e) {
            res.status(400).send(e.message);
        }
    },
    delete: async (req, res, next) => {
        try {
            req.val = await userValidator.idParam.validate(req.user);
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
        } catch (err) {
            console.log(err);
             const fieldErrors = {};
      if (err.issues) {
        for (const issue of err.issues) {
          fieldErrors[issue.path[0]] = issue.message;
        }
      }

      return res.status(400).json({
        message: 'Validation failed',
        errors: fieldErrors,
      });
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
            req.eventParamsVal = await eventValidator.idParam.validate(req.params);
            next();
        } catch (e) {
            res.status(400).send(e.message);
        }
    }
};

export const reviewValidatorMiddleware = {
    create: async (req, res, next) => {
        try {
            req.val = await reviewValidator.create.validate(req.body);
            next();
        } catch (e) {
            res.status(400).send(e.message);
        }
    },
    update: async (req, res, next) => {
        try {
            req.val = await reviewValidator.update.validate(req.body);
            next();
        } catch (e) {
            res.status(400).send(e.message);
        }
    },
    idParam: async (req, res, next) => {
        try {
            req.reviewParamsVal = await reviewValidator.idParam.validate({ id: req.params.reviewId });
            next();
        } catch (e) {
            res.status(400).send(e.message);
        }
    }
};


export const participantValidatorMiddleware = {
  create: async (req, res, next) => {
    try {
        console.log('Validating participant creation with data:', req.body);
      req.val = await participantValidator.create.validate(req.body);
      next();
    } catch (e) {
      res.status(400).send(e.message);
    }
  },

  remove: async (req, res, next) => {
    try {console.log('Validating participant creation with data:', req.body);
      req.val = await participantValidator.remove.validate(req.body);
      next();
    } catch (e) {
      res.status(400).send(e.message);
    }
  },
};


export const gameValidatorMiddleware = {
    create: async (req, res, next) => {
        try {
            req.val = await gameValidator.create.validate(req.body);
            next();
        } catch (err) {
            console.log(err);
            res.status(400).send(err.message);
        }
    },
    update: async (req, res, next) => {
        try {
            req.val = await gameValidator.update.validate(req.body);
            next();
        } catch (err) {
            res.status(400).send(err.message);
        }
    },
    idParam: async (req, res, next) => {
        try {
            req.gameParamsVal = await gameValidator.idParam.validate(req.params);
            next();
        } catch (err) {
            res.status(400).send(err.message);
        }
    }
};

export const tagValidatorMiddleware = {
    create: async (req, res, next) => {
        try {
            req.val = await tagValidator.create.validate(req.body);
            next();
        } catch (err) {
            res.status(400).send(err.message);
        }
    },
    nameParam: async (req, res, next) => {
        try {
            req.gameParamsVal = await tagValidator.nameParam.validate(req.params);
            next();
        } catch (err) {
            res.status(400).send(err.message);
        }
    },
    gameIdParam: async (req, res, next) => {
        try {
            req.gameParamsVal = await tagValidator.idParam.validate(req.params);
            next();
        } catch (err) {
            res.status(400).send(err.message);
        }
    },
    gameIdTagNameParam: async (req, res, next) => {
        try {
            req.gameTagParamsVal = await tagValidator.gameIdTagNameParam.validate(req.params);
            next();
        } catch (err) {
            res.status(400).send(err.message);
        }
    }
}

export const photoValidatorMiddleware = {
    update: async (req, res, next) => {
        try {
            req.photoParamsVal = await photoValidator.update.validate(req.params);
            next();
        } catch (err) {
            res.status(400).send(err.message);
        }
    },
    idParam: async (req, res, next) => {
        try {
            req.photoParamsVal = await photoValidator.idParam.validate(req.params);
            next();
        } catch (err) {
            res.status(400).send(err.message);
        }
    }
}
