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

export const upload = multer({ storage });

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

        fs.unlink("./uploads/" + existingPhoto.file_name, async (err) => {
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

        fs.unlink("./uploads/" + existingPhoto.file_name, async (err) => {
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

