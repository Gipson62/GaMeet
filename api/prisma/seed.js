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

    const alice = await prisma.user.create({
        data: {
            pseudo: 'Alice',
            email: 'alice@example.com',
            password: passwordHash,
            is_admin: true,
            bio: 'Je suis admin !',
            photo_id: photo1.id
        }
    })

    const bob = await prisma.user.create({
        data: {
            pseudo: 'Bob',
            email: 'bob@example.com',
            password: passwordHash,
            is_admin: false,
            bio: 'J\'aime les jeux.',
            photo_id: photo2.id
        }
    })


    const game1 = await prisma.game.create({
        data: {
            name: 'Super Game',
            description: 'Un jeu test',
            is_approved: true,
            banner_id: photo3.id
        }
    })

    const game2 = await prisma.game.create({
        data: {
            name: 'Mega Game',
            description: 'Un autre jeu',
            is_approved: true
        }
    })


    const event1 = await prisma.event.create({
        data: {
            name: 'Tournoi Alice',
            scheduled_date: new Date('2025-12-20T18:00:00Z'),
            location: 'Paris',
            author: alice.id,

            event_game: { create: [{ game_id: game1.id }, { game_id: game2.id }] },
            event_photo: { create: [{ photo_id: photo1.id }] },
            participant: { create: [{ user_id: bob.id }] }
        }
    })

    const event2 = await prisma.event.create({
        data: {
            name: 'Soirée Bob',
            scheduled_date: new Date('2025-12-25T20:00:00Z'),
            location: 'Lyon',
            author: bob.id,
            event_game: { create: [{ game_id: game1.id }] },
            review: {
                create: [{
                    user_id: alice.id,
                    note: 9,
                    description: "Super soirée",
                    photo_id: photo2.id
                }]
            }
        }
    })


    await prisma.review.create({
        data: {
            user_id: bob.id,
            event_id: event1.id,
            note: 8,
            description: 'Bien organisé',
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