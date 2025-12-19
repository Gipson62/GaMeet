const seedAllEvents = async (prisma, gameIds, userIds) => {
    const EVENT_PHOTOS = {
        event1: {
            photo1: "event_lol_tournament_1.jpg",
            photo2: "event_lol_tournament_2.avif"
        },
        event2: {
            photo1: "event_valorant_lan_1.jpg",
            photo2: "event_valorant_lan_2.jpg"
        },
        event3: {
            photo1: "event_elden_ring_rush_1.avif",
            photo2: "event_elden_ring_rush_2.webp"
        },
        event4: {
            photo1: "event_minecraft_build_1.png",
            photo2: "event_minecraft_build_2.png"
        },
        event5: {
            photo1: "event_overwatch_championship_1.png",
            photo2: "event_overwatch_championship_2.avif"
        },
        event6: {
            photo1: "event_cs2_bootcamp_1.jpg",
            photo2: "event_cs2_bootcamp_2.jpg"
        },
        event7: {
            photo1: "event_ffxiv_raid_1.jpg",
            photo2: "event_ffxiv_raid_2.avif"
        },
        event8: {
            photo1: "event_destiny_meetup_1.jpg",
            photo2: "event_destiny_meetup_2.webp"
        },
        event9: {
            photo1: "event_mario_kart_party_1.webp",
            photo2: "event_mario_kart_party_2.jpg"
        },
        event10: {
            photo1: "event_hades_speedrun_1.avif",
            photo2: "event_hades_speedrun_2.avif"
        },
        event11: {
            photo1: "event_fortnite_tournament_1.jpg",
            photo2: "event_fortnite_tournament_2.jpg"
        },
        event12: {
            photo1: "event_civilization_battle_royale_1.png",
            photo2: "event_civilization_battle_royale_2.jpg"
        },
        event13: {
            photo1: "event_six_invitational_1.avif",
            photo2: "event_six_invitational_2.webp",
            photo3: "event_six_invitational_3.avif",
            photo4: "event_six_invitational_4.jpg"
        }
    };

    // Create photo records for all events
    const photoIds = {};
    for (const eventKey in EVENT_PHOTOS) {
        photoIds[eventKey] = {};
        for (const photoKey in EVENT_PHOTOS[eventKey]) {
            const photo = await prisma.photo.create({
                data: { url: EVENT_PHOTOS[eventKey][photoKey] },
                select: { id: true }
            });
            photoIds[eventKey][photoKey] = photo.id;
        }
    }

    // Event 1: League of Legends Tournament
    const event1 = await prisma.event.create({
        data: {
            name: "League of Legends Spring Tournament",
            description: "A competitive 5v5 League of Legends tournament featuring amateur teams from the region. Best teams compete for prize pool and recognition!",
            location: "Game Hub Paris",
            scheduled_date: new Date("2025-02-15T10:00:00"),
            max_capacity: 50,
            author: userIds[0], // Alice
            event_game: {
                create: [
                    { game_id: gameIds[4] } // League of Legends
                ]
            },
            participant: {
                create: [
                    { user_id: userIds[0] },
                    { user_id: userIds[1] },
                    { user_id: userIds[2] }
                ]
            }
        }
    });

    await prisma.event_photo.createMany({
        data: [
            { photo_id: photoIds.event1.photo1, event_id: event1.id },
            { photo_id: photoIds.event1.photo2, event_id: event1.id }
        ]
    });

    // Event 2: VALORANT LAN Party
    const event2PhotoIds = [photoIds.event2.photo1, photoIds.event2.photo2];
    const event2 = await prisma.event.create({
        data: {
            name: "VALORANT LAN Party",
            description: "Tactical FPS showdown! 5v5 VALORANT matches with LAN setup for zero-latency competitive gameplay. Cash prizes for winners.",
            location: "Esports Arena Lyon",
            scheduled_date: new Date("2025-02-22T14:00:00"),
            max_capacity: 40,
            author: userIds[1], // BobGamer
            event_game: {
                create: [
                    { game_id: gameIds[28] } // VALORANT
                ]
            },
            participant: {
                create: [
                    { user_id: userIds[1] },
                    { user_id: userIds[2] },
                    { user_id: userIds[3] }
                ]
            }
        }
    });

    await prisma.event_photo.createMany({
        data: [
            { photo_id: photoIds.event2.photo1, event_id: event2.id },
            { photo_id: photoIds.event2.photo2, event_id: event2.id }
        ]
    });

    // Event 3: Elden Ring Rush Challenge
    const event3PhotoIds = [photoIds.event3.photo1, photoIds.event3.photo2];
    const event3 = await prisma.event.create({
        data: {
            name: "Elden Ring Speedrun Challenge",
            description: "Test your skills in this Elden Ring speedrun competition! Categories: Any% and 100%. See who can beat the game the fastest!",
            location: "Gaming Café Bordeaux",
            scheduled_date: new Date("2025-03-01T16:00:00"),
            max_capacity: 30,
            author: userIds[2], // Charlotte
            event_game: {
                create: [
                    { game_id: gameIds[17] } // Elden Ring
                ]
            },
            participant: {
                create: [
                    { user_id: userIds[2] },
                    { user_id: userIds[3] },
                    { user_id: userIds[0] }
                ]
            }
        }
    });

    await prisma.event_photo.createMany({
        data: [
            { photo_id: photoIds.event3.photo1, event_id: event3.id },
            { photo_id: photoIds.event3.photo2, event_id: event3.id }
        ]
    });

    // Event 4: Minecraft Building Competition
    const event4PhotoIds = [photoIds.event4.photo1, photoIds.event4.photo2];
    const event4 = await prisma.event.create({
        data: {
            name: "Minecraft Creative Building Competition",
            description: "Show off your building skills! participant have 2 hours to create the best structure. Judged by community vote and creativity.",
            location: "Online Event",
            scheduled_date: new Date("2025-03-08T18:00:00"),
            max_capacity: 100,
            author: userIds[3], // David
            event_game: {
                create: [
                    { game_id: gameIds[24] } // Minecraft
                ]
            },
            participant: {
                create: [
                    { user_id: userIds[0] },
                    { user_id: userIds[1] },
                    { user_id: userIds[2] },
                    { user_id: userIds[3] }
                ]
            }
        }
    });

    await prisma.event_photo.createMany({
        data: [
            { photo_id: photoIds.event4.photo1, event_id: event4.id },
            { photo_id: photoIds.event4.photo2, event_id: event4.id }
        ]
    });

    // Event 5: Overwatch 2 Championship
    const event5PhotoIds = [photoIds.event5.photo1, photoIds.event5.photo2];
    const event5 = await prisma.event.create({
        data: {
            name: "Overwatch 2 Championship Series",
            description: "6v6 competitive Overwatch 2 action! Teams battle through group stages to reach the finals. Huge prize pool and sponsorships!",
            location: "AccorHotels Arena Paris",
            scheduled_date: new Date("2025-03-15T10:00:00"),
            max_capacity: 72,
            author: userIds[0], // Alice
            event_game: {
                create: [
                    { game_id: gameIds[26] } // Overwatch 2
                ]
            },
            participant: {
                create: [
                    { user_id: userIds[1] },
                    { user_id: userIds[2] },
                    { user_id: userIds[3] },
                    { user_id: userIds[4] }
                ]
            }
        }
    });

    await prisma.event_photo.createMany({
        data: [
            { photo_id: photoIds.event5.photo1, event_id: event5.id },
            { photo_id: photoIds.event5.photo2, event_id: event5.id }
        ]
    });

    // Event 6: Counter-Strike 2 Bootcamp
    const event6PhotoIds = [photoIds.event6.photo1, photoIds.event6.photo2];
    const event6 = await prisma.event.create({
        data: {
            name: "CS2 Competitive Bootcamp",
            description: "Intensive 3-day Counter-Strike 2 training bootcamp with professional coaches. Improve your skills and compete in finals tournament.",
            location: "E-Sports Academy Marseille",
            scheduled_date: new Date("2025-03-22T09:00:00"),
            max_capacity: 35,
            author: userIds[1], // BobGamer
            event_game: {
                create: [
                    { game_id: gameIds[6] } // Counter-Strike 2
                ]
            },
            participant: {
                create: [
                    { user_id: userIds[2] },
                    { user_id: userIds[3] },
                    { user_id: userIds[4] }
                ]
            }
        }
    });

    await prisma.event_photo.createMany({
        data: [
            { photo_id: photoIds.event6.photo1, event_id: event6.id },
            { photo_id: photoIds.event6.photo2, event_id: event6.id }
        ]
    });

    // Event 7: Final Fantasy XIV Raid Event
    const event7PhotoIds = [photoIds.event7.photo1, photoIds.event7.photo2];
    const event7 = await prisma.event.create({
        data: {
            name: "FFXIV Ultimate Raid Showcase",
            description: "Join our community raid nights! Tackle challenging Ultimate raids in FFXIV with coordinated teams. All skill levels welcome!",
            location: "Discord/In-Game",
            scheduled_date: new Date("2025-03-29T20:00:00"),
            max_capacity: 80,
            author: userIds[2], // Charlotte
            event_game: {
                create: [
                    { game_id: gameIds[19] } // Final Fantasy XIV
                ]
            },
            participant: {
                create: [
                    { user_id: userIds[0] },
                    { user_id: userIds[3] },
                    { user_id: userIds[4] }
                ]
            }
        }
    });

    await prisma.event_photo.createMany({
        data: [
            { photo_id: photoIds.event7.photo1, event_id: event7.id },
            { photo_id: photoIds.event7.photo2, event_id: event7.id }
        ]
    });

    // Event 8: Pokémon Battle Meetup
    const event8PhotoIds = [photoIds.event8.photo1, photoIds.event8.photo2];
    const event8 = await prisma.event.create({
        data: {
            name: "The Desert Perpetual Destiny Raid Prog",
            description: "The new Destiny 2 raid is out! Join us to tackle the raid together. Beginners welcome, let's learn the mechanics as a team!",
            location: "Discord Server/ In-Game",
            scheduled_date: new Date("2025-07-15T15:00:00"),
            max_capacity: 60,
            author: userIds[3], // David
            event_game: {
                create: [
                    { game_id: gameIds[2] } // Destiny 2
                ]
            },
            participant: {
                create: [
                    { user_id: userIds[1] },
                    { user_id: userIds[2] },
                    { user_id: userIds[4] }
                ]
            }
        }
    });

    await prisma.event_photo.createMany({
        data: [
            { photo_id: photoIds.event8.photo1, event_id: event8.id },
            { photo_id: photoIds.event8.photo2, event_id: event8.id }
        ]
    });

    // Event 9: Mario Kart 8 Party Night
    const event9PhotoIds = [photoIds.event9.photo1, photoIds.event9.photo2];
    const event9 = await prisma.event.create({
        data: {
            name: "Mario Kart 8 Deluxe Party Night",
            description: "Casual fun racing! Battle royale style tournament on Mario Kart 8. Bring friends, have fun, and compete for bragging rights!",
            location: "Gaming Café Toulouse",
            scheduled_date: new Date("2025-04-12T19:00:00"),
            max_capacity: 50,
            author: userIds[4], // Eve
            event_game: {
                create: [
                    { game_id: gameIds[8] } // Mario Kart 8
                ]
            },
            participant: {
                create: [
                    { user_id: userIds[0] },
                    { user_id: userIds[1] },
                    { user_id: userIds[2] },
                    { user_id: userIds[3] }
                ]
            }
        }
    });

    await prisma.event_photo.createMany({
        data: [
            { photo_id: photoIds.event9.photo1, event_id: event9.id },
            { photo_id: photoIds.event9.photo2, event_id: event9.id }
        ]
    });

    // Event 10: Hades Speedrun Competition
    const event10PhotoIds = [photoIds.event10.photo1, photoIds.event10.photo2];
    const event10 = await prisma.event.create({
        data: {
            name: "Hades Speedrun Competition",
            description: "Race through the Underworld! Speedrun competition with categories for different difficulty levels. Stream live on Twitch!",
            location: "Online Twitch Stream",
            scheduled_date: new Date("2025-04-19T17:00:00"),
            max_capacity: 40,
            author: userIds[0], // Alice
            event_game: {
                create: [
                    { game_id: gameIds[23] } // Hades
                ]
            },
            participant: {
                create: [
                    { user_id: userIds[2] },
                    { user_id: userIds[3] },
                    { user_id: userIds[4] }
                ]
            }
        }
    });

    await prisma.event_photo.createMany({
        data: [
            { photo_id: photoIds.event10.photo1, event_id: event10.id },
            { photo_id: photoIds.event10.photo2, event_id: event10.id }
        ]
    });

    // Event 11: Fortnite Team Deathmatch
    const event11PhotoIds = [photoIds.event11.photo1, photoIds.event11.photo2];
    const event11 = await prisma.event.create({
        data: {
            name: "Fortnite Team Deathmatch Tournament",
            description: "Epic 4v4 Fortnite team battles! Drop, loot, and dominate. Squad vs squad competition with live commentary and highlights!",
            location: "Gaming Arena Nice",
            scheduled_date: new Date("2025-04-26T13:00:00"),
            max_capacity: 55,
            author: userIds[1], // BobGamer
            event_game: {
                create: [
                    { game_id: gameIds[21] } // Fortnite
                ]
            },
            participant: {
                create: [
                    { user_id: userIds[0] },
                    { user_id: userIds[2] },
                    { user_id: userIds[4] }
                ]
            }
        }
    });

    await prisma.event_photo.createMany({
        data: [
            { photo_id: photoIds.event11.photo1, event_id: event11.id },
            { photo_id: photoIds.event11.photo2, event_id: event11.id }
        ]
    });

    // Event 12: Civilization VI Battle Royale
    const event12PhotoIds = [photoIds.event12.photo1, photoIds.event12.photo2];
    const event12 = await prisma.event.create({
        data: {
            name: "Civilization VI Battle Royale",
            description: "Strategic multiplayer Civ tournament! Each player builds their empire competing for domination. Diplomatic and warfare strategies welcome!",
            location: "Online Tournament",
            scheduled_date: new Date("2025-05-03T15:00:00"),
            max_capacity: 8,
            author: userIds[2], // Charlotte
            event_game: {
                create: [
                    { game_id: gameIds[15] } // Civilization VI
                ]
            },
            participant: {
                create: [
                    { user_id: userIds[1] },
                    { user_id: userIds[3] },
                    { user_id: userIds[4] },
                    { user_id: userIds[0] }
                ]
            }
        }
    });

    await prisma.event_photo.createMany({
        data: [
            { photo_id: photoIds.event12.photo1, event_id: event12.id },
            { photo_id: photoIds.event12.photo2, event_id: event12.id }
        ]
    });

    const event13 = await prisma.event.create({
        data: {
            name: "Rainbow Six Siege Invitational Viewing Party",
            description: "Join us for a viewing party of the Rainbow Six Siege Invitational! Watch top teams compete live and enjoy snacks and drinks with fellow fans.",
            location: "Esports Bar Strasbourg",
            scheduled_date: new Date("2025-05-10T18:00:00"),
            max_capacity: 70,
            author: userIds[3], // DaveEsports
            event_game: {
                create: [
                    { game_id: gameIds[5] } // Rainbow Six Siege
                ]
            },
            participant: {
                create: [
                    { user_id: userIds[0] },
                    { user_id: userIds[1] },
                    { user_id: userIds[2] }
                ]
            }
        }
    });

    await prisma.event_photo.createMany({
        data: [
            { photo_id: photoIds.event13.photo1, event_id: event13.id },
            { photo_id: photoIds.event13.photo2, event_id: event13.id },
            { photo_id: photoIds.event13.photo3, event_id: event13.id },
            { photo_id: photoIds.event13.photo4, event_id: event13.id }
        ]
    });

    // Create some reviews for events
    await prisma.review.createMany({
        data: [
            {
                note: 5,
                description: "Amazing tournament! Very well organized and competitive. Can't wait for the next one!",
                event_id: event1.id,
                user_id: userIds[1]
            },
            {
                note: 4,
                description: "Great event, only thing was the venue was a bit small for the number of participant.",
                event_id: event1.id,
                user_id: userIds[2]
            },
            {
                note: 5,
                description: "The LAN setup was perfect! Zero lag, great matches, professional vibe.",
                event_id: event2.id,
                user_id: userIds[3]
            },
            {
                note: 4,
                description: "Speedrun competition was intense! Would love more categories next time.",
                event_id: event3.id,
                user_id: userIds[0]
            },
            {
                note: 5,
                description: "Minecraft building comp was so creative! Loved seeing everyone's unique creations.",
                event_id: event4.id,
                user_id: userIds[3]
            },
            {
                note: 5,
                description: "Overwatch championship was incredible! The prize pool was generous and matches were thrilling.",
                event_id: event5.id,
                user_id: userIds[4]
            },
            {
                note: 4,
                description: "Great bootcamp experience with professional coaches. Would recommend!",
                event_id: event6.id,
                user_id: userIds[2]
            },
            {
                note: 5,
                description: "FFXIV raid event was perfectly coordinated. Everyone felt included regardless of skill level.",
                event_id: event7.id,
                user_id: userIds[4]
            },
            {
                note: 4,
                description: "Fun Pokémon meetup! Great community vibes.",
                event_id: event8.id,
                user_id: userIds[1]
            },
            {
                note: 5,
                description: "Mario Kart party was hilarious and competitive! Best casual gaming event!",
                event_id: event9.id,
                user_id: userIds[0]
            },
            {
                note: 5,
                description: "Hades speedrun competition was so hype! Stream quality was excellent!",
                event_id: event10.id,
                user_id: userIds[3]
            },
            {
                note: 4,
                description: "Fortnite tournament was fun and well-managed. Good competition level!",
                event_id: event11.id,
                user_id: userIds[2]
            },
            {
                note: 5,
                description: "Civ VI battle royale was a unique experience! Loved the strategic depth.",
                event_id: event12.id,
                user_id: userIds[1]
            },
            {
                note: 5,
                description: "The viewing party for the Six Invitational was fantastic! Great atmosphere and company.",
                event_id: event13.id,
                user_id: userIds[0]
            }
        ]
    });

    console.log('✓ All 12 events created with participant, photos, and reviews');
    return [event1.id, event2.id, event3.id, event4.id, event5.id, event6.id, event7.id, event8.id, event9.id, event10.id, event11.id, event12.id];
}

export default seedAllEvents;
