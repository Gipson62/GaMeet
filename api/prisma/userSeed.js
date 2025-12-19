const USERS = [
    {
        pseudo: 'Alice',
        id: null,
    },
    {
        pseudo: 'BobGamer',
        id: null,
    },
    {
        pseudo: 'CharlieDev',
        id: null,
    },
    {
        pseudo: 'Diana_P',
        id: null,
    },
    {
        pseudo: 'Evan_99',
        id: null,
    },
    {
        pseudo: 'FionaArt',
        id: null,
    },
];

export { USERS };

const seedAllUsers = async (prisma) => {
    
    const photo1 = await prisma.photo.create({ data: { url: 'monkey_orange.png' } })
    const photo2 = await prisma.photo.create({ data: { url: 'default_pfp.jpg' } })
    const photo3 = await prisma.photo.create({ data: { url: 'default_pfp.jpg' } })

    // Kilou123
    const passwordHash = '$argon2id$v=19$m=65536,t=3,p=4$o00mO/AVSJmW5oyoPCTjow$asYozb3exKcgyFCqq0fTkxA+A6sHMMIg0Yx5s+RRGH0';

    const user1 = await prisma.user.create({
        data: {
            pseudo: 'Alice',
            email: 'alice@example.com',
            password: passwordHash,
            birth_date: new Date(2000, 5, 15),
            is_admin: true,
            bio: 'Je suis admin !',
            photo_id: photo1.id
        },
        
    })

    // User 2: Bob (Utilisateur standard)
    const user2 = await prisma.user.create({
        data: {
            pseudo: 'BobGamer',
            email: 'bob.gamer@example.com',
            password: passwordHash,
            birth_date: new Date(1995, 10, 22), // 22 Novembre 1995
            is_admin: false,
            bio: 'Passionné de RPG et de jeux de stratégie.',
            photo_id: photo2.id
        },
        
    })

// User 3: Charlie (Développeur)
    const user3 = await prisma.user.create({
        data: {
            pseudo: 'CharlieDev',
            email: 'charlie@studio.com',
            password: passwordHash,
            birth_date: new Date(1988, 2, 10), // 10 Mars 1988
            is_admin: false,
            bio: 'Développeur indépendant travaillant sur Unity.',
            photo_id: photo3.id
        },
        
    })

// User 4: Diana (Modératrice / Admin)
    const user4 = await prisma.user.create({
        data: {
            pseudo: 'Diana_P',
            email: 'diana@example.com',
            password: passwordHash,
            birth_date: new Date(1992, 0, 15), // 15 Janvier 1992
            is_admin: true,
            bio: 'Modératrice du forum et fan de FPS.',
            photo_id: photo1.id
        },
        
    })

// User 5: Evan (Nouveau membre)
    const user5 = await prisma.user.create({
        data: {
            pseudo: 'Evan_99',
            email: 'evan99@test.fr',
            password: passwordHash,
            birth_date: new Date(1999, 6, 30), // 30 Juillet 1999
            is_admin: false,
            bio: "Nouveau ici, j'adore Elden Ring !",
            photo_id: photo2.id
        },
        
    })

// User 6: Fiona (Compte pro)
    const user6 = await prisma.user.create({
        data: {
            pseudo: 'FionaArt',
            email: 'contact@fiona-art.com',
            password: passwordHash,
            birth_date: new Date(1985, 11, 5), // 5 Décembre 1985
            is_admin: false,
            bio: 'Concept artist dans le jeu vidéo.',
            photo_id: photo3.id
        },
        
    })
    USERS[0].id = user1.id;
    USERS[1].id = user2.id;
    USERS[2].id = user3.id;
    USERS[3].id = user4.id;
    USERS[4].id = user5.id;
    USERS[5].id = user6.id;
}



export default seedAllUsers;