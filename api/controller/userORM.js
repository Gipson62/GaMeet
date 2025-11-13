import prisma from '../database/databaseORM.js'
import { hash, compare } from '../util/index.js'
import  { sign } from '../util/jwt.js'

export const getUserById = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.id
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

export const addUser = async (req, res) => {
    try {
        const { pseudo, email, password, birth_date, bio, is_admin, photo_id } = req.val

        // Vérifie si l’email existe déjà
        const existing = await prisma.user.findUnique({ where: { email } })

        if (existing) return res.status(409).send({ message: 'Email déjà utilisé' })

        const {id} = await prisma.user.create({
            data: {
                pseudo,
                email,
                password: await hash(password),
                birth_date: birth_date ? new Date(birth_date) : null,
                bio: bio ?? null,
                is_admin: is_admin ?? false,
                photo_id: photo_id ?? null
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
        const { id } = req.user;

        if (!id) {
            return res.status(400).send('Missing user ID');
        }

        const updateData = { ...req.val};

        if (updateData.password) {
            updateData.password = await hash(updateData.password);
        }
        if (updateData.birth_date) {
            updateData.birth_date = new Date(updateData.birth_date);
        }
        await prisma.user.update({
            where: { id },
            data: updateData
        })

        res.sendStatus(204)
    } catch (e) {
        console.error(e)
        res.sendStatus(500)
    }
}

export const deleteUser = async (req, res) => {
    try {
        const id = req.user?.id;

        if (!id) {
            return res.status(400).send('Missing user ID');
        }

        await prisma.user.delete({
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
