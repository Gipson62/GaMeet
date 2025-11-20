export const admin = (req, res, next) => {
    if(req.user?.is_admin){
        next();
    } else {
        res.sendStatus(403);
    }
};
