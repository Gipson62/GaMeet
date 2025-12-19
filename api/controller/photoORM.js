import prisma from "../database/databaseORM.js";
import multer from "multer";
import fs from "fs";

const uploadDir = "./uploads";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

export const upload = multer({
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter(req, file, cb) {
        if (!file.mimetype.startsWith("image/")) {
        cb(new Error("Seules les images sont autorisées"));
        } else {
        cb(null, true);
        }
    },
    storage 
});

/**
 * @swagger
 * /photo/{id}:
 *   get:
 *     summary: Get photo file by ID
 *     description: Retrieve a photo file from the uploads directory by its ID
 *     tags:
 *       - Photo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Photo ID
 *     responses:
 *       200:
 *         description: Photo file retrieved successfully
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Photo not found
 *       500:
 *         description: Server error
 */
export const getPhotoById = async (req, res)=> {
    try {
        const { id } = req.photoParamsVal;

        const photo = await prisma.photo.findUnique({
            where: {
                id
            }
        });
        if(photo){
            res.sendFile(photo.url, { root: "./uploads"})
        } else {
            res.sendStatus(404);
        }
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
};

/**
 * @swagger
 * /photo:
 *   post:
 *     summary: Upload a new photo
 *     description: Upload an image file and store it with a unique name in the database
 *     tags:
 *       - Photo
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Image file (max 5MB)
 *     responses:
 *       201:
 *         description: Photo uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 photo:
 *                   $ref: '#/components/schemas/Photo'
 *       400:
 *         description: Invalid file or missing required fields
 *       500:
 *         description: Server error
 */
export const addPhoto = async (req, res) => {
    try {
        const { filename } = req.file;

        const photo = await prisma.photo.create({
            data: {
                url: filename,
            },
        });

        res.status(201).json({
            message: 'Photo uploaded successfully',
            photo,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to upload photo' });
    }
};
/**
 * @swagger
 * /photo/{id}:
 *   delete:
 *     summary: Delete a photo
 *     description: Delete a photo by ID and remove associated file (admin only)
 *     tags:
 *       - Photo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Photo ID
 *     responses:
 *       204:
 *         description: Photo deleted successfully
 *       403:
 *         description: Unauthorized - admin access required
 *       404:
 *         description: Photo not found
 *       500:
 *         description: Server error
 */
export const updatePhoto = async (req, res) => {
    try {
        const { id } = req.photoParamsVal;
        const { filename } = req.file;

        if(!req.user.is_admin)
            return res.status(403).json({ message: 'Accès refusé' });

        const existingPhoto = await prisma.photo.findUnique({
            where: {
                id
            }
        });
        if (!existingPhoto) {
            return res.sendStatus(404);
        }

        fs.unlink("./uploads/" + existingPhoto.url, async (err) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }
            const updatedPhoto = await prisma.photo.update({
                where: {
                    id: id
                },
                data: {
                    url: filename
                }
            });
            res.status(200).json({
                message: 'Photo updated successfully',
                photo: updatedPhoto,
            });
        });
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
};
export const deletePhoto = async (req, res) => {
    try {
        const { id } = req.photoParamsVal;

        if(!req.user.is_admin)
            return res.status(403).json({ message: 'Accès refusé' });

        const existingPhoto = await prisma.photo.findUnique({
            where: {
                id: id
            }
        });
        if (!existingPhoto) {
            return res.sendStatus(404);
        }

        fs.unlink("./uploads/" + existingPhoto.url, async (err) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }
            await prisma.photo.delete({
                where: {
                    id: id
                }
            });
            res.status(204).send();
        });

    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
};

