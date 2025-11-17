export const admin = (req, res, next) => {
    if(req.session.is_admin){
        next();
    } else {
        res.sendStatus(403);
    }
};
