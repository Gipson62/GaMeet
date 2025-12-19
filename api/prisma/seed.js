import { PrismaClient } from '@prisma/client'
import seedAllGames from './gameSeed.js'
import seedAllUsers, { USERS } from './userSeed.js'
import seedAllEvents from './eventSeed.js'
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

    console.log('Seeding des jeux...');
    //Arrays of all game IDs
    const gameIDs = await seedAllGames(prisma);
    console.log('Jeux seedés. IDs des jeux:', gameIDs);

    console.log('Seeding des utilisateurs...');
    //Creating users and getting their IDs
    await seedAllUsers(prisma);
    const [user1, user2, user3, user4, user5, user6] = USERS;
    console.log('✓ Utilisateurs seedés. IDs des utilisateurs:', [user1.id, user2.id, user3.id, user4.id, user5.id, user6.id]);


    console.log('Seeding des événements...');
    const eventIds = await seedAllEvents(prisma, gameIDs, [user1.id, user2.id, user3.id, user4.id, user5.id, user6.id]);
    console.log('✓ Événements seedés. IDs des événements:', eventIds);

    console.log('Seeding terminé');
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