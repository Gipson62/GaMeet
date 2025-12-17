import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Début du seeding...')

    // 1. Nettoyer la base de données (ordre inverse des dépendances)
    await prisma.review.deleteMany()
    await prisma.participant.deleteMany()
    await prisma.event_photo.deleteMany()
    await prisma.event_game.deleteMany()
    await prisma.event.deleteMany()
    await prisma.game_tag.deleteMany()
    await prisma.tag.deleteMany()
    await prisma.game.deleteMany()
    await prisma.user.deleteMany()
    await prisma.photo.deleteMany()

    console.log('Base de données nettoyée.')


    const photo1 = await prisma.photo.create({ data: { url: 'https://picsum.photos/200/300?random=1' } })
    const photo2 = await prisma.photo.create({ data: { url: 'https://picsum.photos/200/300?random=2' } })
    const photo3 = await prisma.photo.create({ data: { url: 'https://picsum.photos/200/300?random=3' } })

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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
    })


    const game1 = await prisma.game.create({
        data: {
            name: 'Super Game',
            description: 'Un jeu test',
            release_date: new Date(2000, 5, 15),
            publisher: "Ubisoft",
            studio: "Ubisoft Studio",
            platforms: "Pc, PS5, Xbox",
            is_approved: true,
            banner_id: photo3.id,
            logo_id: photo1.id,
            grid_id: photo2.id
        }
    })

    // Game 2: The Witcher 3
    const game2 = await prisma.game.create({
        data: {
            name: 'The Witcher 3: Wild Hunt',
            description: "Un RPG en monde ouvert centré sur l'histoire, se déroulant dans un univers fantastique visuellement époustouflant.",
            release_date: new Date(2015, 4, 19), // 19 Mai 2015 (Mois 0-indexé)
            publisher: "CD Projekt",
            studio: "CD Projekt RED",
            platforms: "PC, PS5, Xbox, Switch",
            is_approved: true,
            banner_id: photo3.id,
            logo_id: photo1.id,
            grid_id: photo2.id
        }
    })

// Game 3: Elden Ring
    const game3 = await prisma.game.create({
        data: {
            name: 'Elden Ring',
            description: "Un Action-RPG développé par FromSoftware. Levez-vous, Sans-éclat, et laissez la grâce vous guider vers le Cercle d'Elden.",
            release_date: new Date(2022, 1, 25), // 25 Février 2022
            publisher: "Bandai Namco",
            studio: "FromSoftware",
            platforms: "PC, PS5, PS4, Xbox",
            is_approved: true,
            banner_id: photo2.id,
            logo_id: photo3.id,
            grid_id: photo1.id
        }
    })

// Game 4: Hollow Knight (Indé)
    const game4 = await prisma.game.create({
        data: {
            name: 'Hollow Knight',
            description: "Une aventure action-aventure en 2D de style Metroidvania classique dans un vaste monde interconnecté.",
            release_date: new Date(2017, 1, 24), // 24 Février 2017
            publisher: "Team Cherry",
            studio: "Team Cherry",
            platforms: "PC, PS4, Xbox, Switch",
            is_approved: true,
            banner_id: photo1.id,
            logo_id: photo2.id,
            grid_id: photo3.id
        }
    })

// Game 5: Cyberpunk 2077
    const game5 = await prisma.game.create({
        data: {
            name: 'Cyberpunk 2077',
            description: "Un jeu d'action-aventure en monde ouvert qui se déroule à Night City, une mégalopole obsédée par le pouvoir et les modifications corporelles.",
            release_date: new Date(2020, 11, 10), // 10 Décembre 2020
            publisher: "CD Projekt",
            studio: "CD Projekt RED",
            platforms: "PC, PS5, Xbox",
            is_approved: true,
            banner_id: photo3.id,
            logo_id: photo1.id,
            grid_id: photo2.id
        }
    })

// Game 6: God of War Ragnarök
    const game6 = await prisma.game.create({
        data: {
            name: 'God of War Ragnarök',
            description: "Kratos et Atreus doivent s'aventurer dans chacun des neuf royaumes à la recherche de réponses.",
            release_date: new Date(2022, 10, 9), // 9 Novembre 2022
            publisher: "Sony Interactive Entertainment",
            studio: "Santa Monica Studio",
            platforms: "PS5, PS4",
            is_approved: true,
            banner_id: photo2.id,
            logo_id: photo3.id,
            grid_id: photo1.id
        }
    })


    const event1 = await prisma.event.create({
        data: {
            name: 'Tournoi Alice',
            scheduled_date: new Date('2025-12-20'),
            creation_date: new Date('2025-10-01'),
            location: 'Paris',
            author: user1.id,
            max_capacity: 20,
            event_game: { create: [{ game_id: game1.id }, { game_id: game2.id }] },
            event_photo: { create: [{ photo_id: photo1.id }] },
            participant: { create: [{ user_id: user2.id }] }
        }
    })

    const event2 = await prisma.event.create({
        data: {
            name: 'Soirée Chill Witcher 3',
            scheduled_date: new Date('2025-11-10'),
            creation_date: new Date('2025-10-05'),
            location: 'Discord (Online)',
            author: user2.id, // Bob
            max_capacity: 10,
            event_game: { create: [{ game_id: game2.id }] }, // Witcher 3
            event_photo: { create: [{ photo_id: photo2.id }] },
            participant: { create: [{ user_id: user5.id }, { user_id: user3.id }] }
        }
    })

// Event 3: Challenge Hardcore (Organisé par Diana/User4)
    const event3 = await prisma.event.create({
        data: {
            name: 'Elden Ring : Boss Rush',
            scheduled_date: new Date('2026-01-20'),
            creation_date: new Date('2025-12-01'),
            location: 'Lyon',
            author: user4.id, // Diana
            max_capacity: 50,
            event_game: { create: [{ game_id: game3.id }] }, // Elden Ring
            event_photo: { create: [{ photo_id: photo3.id }] },
            participant: { create: [{ user_id: user1.id }, { user_id: user2.id }, { user_id: user6.id }] }
        }
    })

// Event 4: Indie Discovery (Organisé par Charlie/User3)
    const event4 = await prisma.event.create({
        data: {
            name: 'Découverte Hollow Knight',
            scheduled_date: new Date('2025-12-05'),
            creation_date: new Date('2025-11-20'),
            location: 'Bordeaux',
            author: user3.id, // Charlie
            max_capacity: 15,
            event_game: { create: [{ game_id: game4.id }] }, // Hollow Knight
            event_photo: { create: [{ photo_id: photo1.id }] },
            participant: { create: [{ user_id: user4.id }] }
        }
    })

// Event 5: Marathon Cyberpunk (Organisé par Evan/User5)
    const event5 = await prisma.event.create({
        data: {
            name: 'Night City Marathon',
            scheduled_date: new Date('2026-02-14'),
            creation_date: new Date('2026-01-10'),
            location: 'Bruxelles',
            author: user5.id, // Evan
            max_capacity: 100,
            event_game: { create: [{ game_id: game5.id }] }, // Cyberpunk 2077
            event_photo: { create: [{ photo_id: photo2.id }] },
            participant: { create: [] } // Pas encore d'inscrits
        }
    })

// Event 6: Grand Tournoi Multi-Gaming (Organisé par Alice/User1)
    const event6 = await prisma.event.create({
        data: {
            name: 'Ultimate Championship 2026',
            scheduled_date: new Date('2026-06-15'),
            creation_date: new Date('2026-03-01'),
            location: 'Paris Expo',
            author: user1.id, // Alice
            max_capacity: 500,
            // Cet événement concerne plusieurs jeux
            event_game: {
                create: [
                    { game_id: game1.id },
                    { game_id: game5.id },
                    { game_id: game6.id }
                ]
            },
            event_photo: { create: [{ photo_id: photo3.id }] },
            participant: {
                create: [
                    { user_id: user2.id },
                    { user_id: user3.id },
                    { user_id: user4.id },
                    { user_id: user5.id },
                    { user_id: user6.id }
                ]
            }
        }
    })


    await prisma.review.create({
        data: {
            user_id: user1.id,
            event_id: event1.id,
            note: 8,
            description: 'Bien organisé',
        }
    })
// Review 1 : Charlie sur Event 2
    await prisma.review.create({
        data: {
            user_id: user3.id,
            event_id: event2.id,
            note: 9,
            description: "Super ambiance sur Discord, on a bien discuté du lore !",
            created_at: new Date('2025-11-11'),
        }
    })

// Review 2 : Evan sur Event 2
    await prisma.review.create({
        data: {
            user_id: user5.id,
            event_id: event2.id,
            note: 7,
            description: "Sympa mais un peu court, j'aurais voulu jouer plus.",
            created_at: new Date('2025-11-12'),
        }
    })

// Review 3 : Alice sur Event 3
    await prisma.review.create({
        data: {
            user_id: user1.id,
            event_id: event3.id,
            note: 10,
            description: "Un défi incroyable, le niveau des joueurs était dingue.",
            created_at: new Date('2026-01-21'),
        }
    })

// Review 4 : Fiona sur Event 3
    await prisma.review.create({
        data: {
            user_id: user6.id,
            event_id: event3.id,
            note: 5,
            description: "Organisation top mais difficulté trop élevée pour les débutants.",
            created_at: new Date('2026-01-22'),
        }
    })

// Review 5 : Diana sur Event 4
    await prisma.review.create({
        data: {
            user_id: user4.id,
            event_id: event4.id,
            note: 8,
            description: "Une très belle découverte artistique à Bordeaux.",
            created_at: new Date('2025-12-06'),
        }
    })

// Review 6 : Bob sur Event 1
    await prisma.review.create({
        data: {
            user_id: user2.id,
            event_id: event1.id,
            note: 6,
            description: "Bien joué, mais il y avait un peu de lag sur les PC.",
            created_at: new Date('2025-12-21'),
        }
    })

// Review 7 : Charlie sur Event 6
    await prisma.review.create({
        data: {
            user_id: user3.id,
            event_id: event6.id,
            note: 9,
            description: "L'événement de l'année ! La salle était immense.",
            created_at: new Date('2026-06-16'),
        }
    })

// Review 8 : Diana sur Event 6
    await prisma.review.create({
        data: {
            user_id: user4.id,
            event_id: event6.id,
            note: 10,
            description: "Rien à dire, tout était parfait du début à la fin.",
            created_at: new Date('2026-06-17'),
        }
    })

// Review 9 : Evan sur Event 6
    await prisma.review.create({
        data: {
            user_id: user5.id,
            event_id: event6.id,
            note: 4,
            description: "Trop de monde, on étouffait et trop de queue pour jouer.",
            created_at: new Date('2026-06-16'),
        }
    })

// Review 10 : Alice sur Event 5
    await prisma.review.create({
        data: {
            user_id: user1.id,
            event_id: event5.id,
            note: 8,
            description: "Une nuit blanche mémorable à Bruxelles !",
            created_at: new Date('2026-02-15'),
        }
    })

    console.log('Seeding terminé')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })