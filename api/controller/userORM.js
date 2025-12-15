import prisma from '../database/databaseORM.js'
import { hash, compare } from '../util/index.js'
import  { sign } from '../util/jwt.js'

export const getUser = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id : req.val.id
            },
            select: {
                id: true,
                pseudo: true,
                bio: true,
                creation_date: true,

                photo: true,
                event: true,
                participant: true,
                review: true
            }
        })
        if (user) {
            res.send(user)
        } else {
            res.sendStatus(404)
        }
    } catch (e) {
        console.error(e)
        res.sendStatus(500)
    }
}
export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                pseudo: true,
                email: true,
                is_admin: true,
                birth_date: true,
                bio: true,
                creation_date: true,

                photo: true,
                event: true,
                participant: true,
                review: true
            }
        });

        res.send(users);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
};

export const addUser = async (req, res) => {
    try {
        const { pseudo, email, password, birth_date, bio, photo_id } = req.val

        // Vérifie si l’email existe déjà
        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) return res.status(409).send({ message: 'Email déjà utilisé' })

        const {id} = await prisma.user.create({
            data: {
                pseudo,
                email,
                birth_date,
                bio,
                is_admin: false,
                photo_id,
                password: await hash(password)
            },
            select: {
                id: true
            }
        })

        res.status(201).send({id})
    } catch (e) {
        console.error(e)
        res.sendStatus(500)
    }
}

export const updateUser = async (req, res) => {
    try {
        const {id, pseudo, birth_date, bio, email, photo_id } = req.val;
        await prisma.user.update({
            data: {
                pseudo,
                birth_date,
                bio,
                email,
                photo_id
            },
            where: {
                id
            }
        })
        res.sendStatus(204)
    } catch (e) {
        console.error(e)
        res.sendStatus(500)
    }
}

export const deleteUser = async (req, res) => {
    try {
        const {id} = req.val;
        await prisma.$transaction([
            prisma.review.deleteMany({
                where: { user_id: id }
            }),
            prisma.participant.deleteMany({
                where: { user_id: id }
            }),
            prisma.user.delete({
                where: { id }
            })
        ]);

        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.val

        // Récupère l’utilisateur par email
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) return res.status(404).send({ message: 'Utilisateur introuvable' })

        // Vérifier mdp
        const valid = await compare(password, user.password)
        if (!valid) return res.status(401).send({ message: 'Mot de passe incorrect' })

        // Création du token JWT
        const token = sign(
            {
                id: user.id,
                email: user.email,
                is_admin: user.is_admin
            },
            { expiresIn: '2h' }
        )

        res.send({
            message: 'Connexion réussie',
            token,
            user: {
                id: user.id,
                pseudo: user.pseudo,
                email: user.email,
                is_admin: user.is_admin
            }
        })
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }



}


