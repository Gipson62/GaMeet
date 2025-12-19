import prisma from '../../database/databaseORM.js';
import { verify } from '../../util/jwt.js';

export const checkJWT = async (req, res, next) => {
    const authorize = req.get('authorization');
    if (authorize?.includes('Bearer')) {
        const jwtEncoded = authorize.split(' ')[1];
        try {
            req.user = verify(jwtEncoded);
            const is_admin = prisma.user.findUnique({
                where: { id: req.user.id },
                select: { is_admin: true }
            });
            req.user.is_admin = is_admin;
            next();
        } catch (e) {
            res.status(401).send(e.message);
        }
    } else {
        res.status(401).send('No jwt');
    }
};