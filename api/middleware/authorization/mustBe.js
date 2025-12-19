export const admin = (req, res, next) => {
    if (req.user?.is_admin) {
        next();
    } else {
        res.status(403).send({ message: "Accès refusé" });
    }
};
