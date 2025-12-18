const BINDING_OF_ISAAC = {
    grid_id: null,
    banner_id: null,
    logo_id: null,
    grid: "the_binding_of_isaac_grid.png",
    banner: "the_binding_of_isaac_banner.png",
    logo: "the_binding_of_isaac_logo.png"
}
const THE_WITCHER_3 = {
    grid_id: null,
    banner_id: null,
    logo_id: null,
    grid: "the_witcher_3_grid.png",
    banner: "the_witcher_3_banner.png",
    logo: "the_witcher_3_logo.png"
}
const DESTINY_2 = {
    grid_id: null,
    banner_id: null,
    logo_id: null,
    grid: "destiny_2_grid.jpg",
    banner: "destiny_2_banner.jpg",
    logo: "destiny_2_logo.png"
}
const WAR_THUNDER = {
    grid_id: null,
    banner_id: null,
    logo_id: null,
    grid: "war_thunder_grid.jpg",
    banner: "war_thunder_banner.jpg",
    logo: "war_thunder_logo.png"
}
const LEAGUE_OF_LEGENDS = {
    grid_id: null,
    banner_id: null,
    logo_id: null,
    grid: "league_of_legends_grid.png",
    banner: "league_of_legends_banner.jpg",
    logo: "league_of_legends_logo.png"
}
const RAINBOW_SIX_SIEGE = {
    grid_id: null,
    banner_id: null,
    logo_id: null,
    grid: "rainbow_six_siege_grid.jpg",
    banner: "rainbow_six_siege_banner.jpg",
    logo: "rainbow_six_siege_logo.png"
}

const seedAllGames = async (prisma) => {
    await prisma.tag.createMany({
        data: [
            { name: "Action" },
            { name: "Adventure" },
            { name: "RPG" },
            { name: "Indie" },
            { name: "Platformer" },
            { name: "Puzzle" },
            { name: "Sports" },
            { name: "Stratégie" },
            { name: "Simulation" },
            { name: "Difficile" },
            { name: "Multijoueur" },
            { name: "FPS" },
            { name: "MOBA" },
            { name: "Roguelike" },
            { name: "Horreur" },
            { name: "Open-World" },
            { name: "Story-Rich" },
            { name: "Looter-Shooter" },
            { name: "PvP" },
            { name: "Co-op" },
            { name: "Tactical" },
        ],
        skipDuplicates: true,
    });
    BINDING_OF_ISAAC.grid_id = await prisma.photo.create({
        data: {
            url: BINDING_OF_ISAAC.grid,
        },
        select: { id: true }
    });
    BINDING_OF_ISAAC.banner_id = await prisma.photo.create({
        data: {
            url: BINDING_OF_ISAAC.banner,
        },
        select: { id: true }
    });
    BINDING_OF_ISAAC.logo_id = await prisma.photo.create({
        data: {
            url: BINDING_OF_ISAAC.logo,
        },
        select: { id: true }
    });
    const bindingOfIsaac = await prisma.game.create({
        data: {
            name: "The Binding of Isaac: Rebirth",
            studio: "Nicalis, Inc.",
            publisher: "Nicalis, Inc.",
            description: "The Binding of Isaac: Rebirth is a roguelike dungeon crawler video game designed by Edmund McMillen and developed and published by Nicalis, Inc. It is a remake of the original The Binding of Isaac game, which was released in 2011. The game features randomly generated levels, items, and enemies, providing a unique experience with each playthrough. Players control Isaac, a young boy who must navigate through his mother's basement to escape her attempts to sacrifice him, battling grotesque monsters and bosses along the way.",
            release_date: new Date("2014-11-04"),
            platforms: "PC, Mac, Linux, PS4, PS Vita, Xbox One, Nintendo Switch",
            grid_id: BINDING_OF_ISAAC.grid_id.id,
            banner_id: BINDING_OF_ISAAC.banner_id.id,
            logo_id: BINDING_OF_ISAAC.logo_id.id,
            is_approved: true,
        }
    });
    await prisma.game_tag.createMany({
        data: [
            { game_id: bindingOfIsaac.id, tag_name: "Roguelike" },
            { game_id: bindingOfIsaac.id, tag_name: "Indie" },
            { game_id: bindingOfIsaac.id, tag_name: "Action" },
            { game_id: bindingOfIsaac.id, tag_name: "Difficile" },
        ]
    });
    THE_WITCHER_3.grid_id = await prisma.photo.create({
        data: {
            url: THE_WITCHER_3.grid,
        },
        select: { id: true }
    });
    THE_WITCHER_3.banner_id = await prisma.photo.create({
        data: {
            url: THE_WITCHER_3.banner,
        },
        select: { id: true }
    });
    THE_WITCHER_3.logo_id = await prisma.photo.create({
        data: {
            url: THE_WITCHER_3.logo,
        },
        select: { id: true }
    });
    const witcher3 = await prisma.game.create({
        data: {
            name: "The Witcher 3: Wild Hunt",
            studio: "CD Projekt Red",
            publisher: "CD Projekt",
            description: "The Witcher 3: Wild Hunt is an action role-playing game developed by CD Projekt Red. It is the third installment in The Witcher series, based on the book series by Andrzej Sapkowski. Players assume the role of Geralt of Rivia, a monster hunter known as a Witcher, as he embarks on a quest to find his adopted daughter, Ciri, who is on the run from the Wild Hunt, a spectral cavalcade determined to capture her for her Elder Blood powers. The game features an open world environment, rich storytelling, and complex characters.",
            release_date: new Date("2015-05-19"),
            platforms: "PC, PS4, Xbox One, Nintendo Switch",
            grid_id: THE_WITCHER_3.grid_id.id,
            banner_id: THE_WITCHER_3.banner_id.id,
            logo_id: THE_WITCHER_3.logo_id.id,
            is_approved: true,
        }
    });
    await prisma.game_tag.createMany({
        data: [
            { game_id: witcher3.id, tag_name: "RPG" },
            { game_id: witcher3.id, tag_name: "Adventure" },
            { game_id: witcher3.id, tag_name: "Action" },
            { game_id: witcher3.id, tag_name: "Open-World" },
            { game_id: witcher3.id, tag_name: "Story-Rich" },
        ]
    });
    DESTINY_2.grid_id = await prisma.photo.create({
        data: {
            url: DESTINY_2.grid,
        },
        select: { id: true }
    });
    DESTINY_2.banner_id = await prisma.photo.create({
        data: {
            url: DESTINY_2.banner,
        },
        select: { id: true }
    });
    DESTINY_2.logo_id = await prisma.photo.create({
        data: {
            url: DESTINY_2.logo,
        },
        select: { id: true }
    });
    const destiny2 = await prisma.game.create({
        data: {
            name: "Destiny 2",
            studio: "Bungie",
            publisher: "Bungie",
            description: "Destiny 2 is an online-only multiplayer first-person shooter video game developed by Bungie. It is the sequel to the 2014 game Destiny and its subsequent expansions. In Destiny 2, players assume the role of Guardians, protectors of Earth's last safe city as they wield a power called Light to defend humanity against various alien threats. The game features both player versus environment (PvE) and player versus player (PvP) modes, with a focus on cooperative gameplay, raids, and competitive multiplayer matches.",
            release_date: new Date("2017-09-06"),
            platforms: "PC, PS4, PS5, Xbox One, Xbox Series X/S",
            grid_id: DESTINY_2.grid_id.id,
            banner_id: DESTINY_2.banner_id.id,
            logo_id: DESTINY_2.logo_id.id,
            is_approved: true,
        }
    });
    await prisma.game_tag.createMany({
        data: [
            { game_id: destiny2.id, tag_name: "FPS" },
            { game_id: destiny2.id, tag_name: "Multijoueur" },
            { game_id: destiny2.id, tag_name: "Looter-Shooter" },
            { game_id: destiny2.id, tag_name: "PvP" },
            { game_id: destiny2.id, tag_name: "Co-op" },
        ]
    });
    WAR_THUNDER.grid_id = await prisma.photo.create({
        data: {
            url: WAR_THUNDER.grid,
        },
        select: { id: true }
    });
    WAR_THUNDER.banner_id = await prisma.photo.create({
        data: {
            url: WAR_THUNDER.banner,
        },
        select: { id: true }
    });
    WAR_THUNDER.logo_id = await prisma.photo.create({
        data: {
            url: WAR_THUNDER.logo,
        },
        select: { id: true }
    });
    const warThunder = await prisma.game.create({
        data: {
            name: "War Thunder",
            studio: "Gaijin Entertainment",
            publisher: "Gaijin Entertainment",
            description: "War Thunder is a free-to-play vehicular combat multiplayer video game developed and published by Gaijin Entertainment. The game is set during the mid-20th century and features a wide range of military vehicles, including aircraft, tanks, and ships from various countries. Players can engage in battles across different theaters of war, participating in both player versus environment (PvE) and player versus player (PvP) modes. War Thunder emphasizes realistic gameplay mechanics, vehicle physics, and historical accuracy, offering an immersive experience for fans of military simulations.",
            release_date: new Date("2013-11-15"),
            platforms: "PC, PS4, PS5, Xbox One, Xbox Series X/S",
            grid_id: WAR_THUNDER.grid_id.id,
            banner_id: WAR_THUNDER.banner_id.id,
            logo_id: WAR_THUNDER.logo_id.id,
            is_approved: true,
        }
    });
    await prisma.game_tag.createMany({
        data: [
            { game_id: warThunder.id, tag_name: "Simulation" },
            { game_id: warThunder.id, tag_name: "Multijoueur" },
            { game_id: warThunder.id, tag_name: "PvP" },
            { game_id: warThunder.id, tag_name: "Action" },
        ]
    });
    LEAGUE_OF_LEGENDS.grid_id = await prisma.photo.create({
        data: {
            url: LEAGUE_OF_LEGENDS.grid,
        },
        select: { id: true }
    });
    LEAGUE_OF_LEGENDS.banner_id = await prisma.photo.create({
        data: {
            url: LEAGUE_OF_LEGENDS.banner,
        },
        select: { id: true }
    });
    LEAGUE_OF_LEGENDS.logo_id = await prisma.photo.create({
        data: {
            url: LEAGUE_OF_LEGENDS.logo,
        },
        select: { id: true }
    });
    const lol = await prisma.game.create({
        data: {
            name: "League of Legends",
            studio: "Riot Games",
            publisher: "Riot Games",
            description: "League of Legends (LoL) is a multiplayer online battle arena (MOBA) game developed and published by Riot Games. In League of Legends, players assume the role of a 'champion' with unique abilities and battle against a team of other players or computer-controlled champions. The primary objective is to destroy the opposing team's Nexus, a structure located within their base. The game features various modes, including ranked matches, casual games, and special events. League of Legends is known for its competitive esports scene, with numerous tournaments and leagues held worldwide.",
            release_date: new Date("2009-10-27"),
            platforms: "PC, Mac",
            grid_id: LEAGUE_OF_LEGENDS.grid_id.id,
            banner_id: LEAGUE_OF_LEGENDS.banner_id.id,
            logo_id: LEAGUE_OF_LEGENDS.logo_id.id,
            is_approved: true,
        }
    });
    await prisma.game_tag.createMany({
        data: [
            { game_id: lol.id, tag_name: "MOBA" },
            { game_id: lol.id, tag_name: "Multijoueur" },
            { game_id: lol.id, tag_name: "PvP" },
            { game_id: lol.id, tag_name: "Stratégie" },
        ]
    });
    RAINBOW_SIX_SIEGE.grid_id = await prisma.photo.create({
        data: {
            url: RAINBOW_SIX_SIEGE.grid,
        },
        select: { id: true }
    });
    RAINBOW_SIX_SIEGE.banner_id = await prisma.photo.create({
        data: {
            url: RAINBOW_SIX_SIEGE.banner,
        },
        select: { id: true }
    });
    RAINBOW_SIX_SIEGE.logo_id = await prisma.photo.create({
        data: {
            url: RAINBOW_SIX_SIEGE.logo,
        },
        select: { id: true }
    });
    const rainbow6 = await prisma.game.create({
        data: {
            name: "Tom Clancy's Rainbow Six Siege",
            studio: "Ubisoft Montreal",
            publisher: "Ubisoft",
            description: "Tom Clancy's Rainbow Six Siege is a tactical shooter video game developed by Ubisoft Montreal and published by Ubisoft. The game focuses on team-based gameplay, where players assume the roles of various operators from different counter-terrorism units around the world. Each operator has unique abilities and gadgets that can be used to breach, defend, or gather intelligence. The game features destructible environments, allowing players to create new lines of sight and entry points during matches. Rainbow Six Siege emphasizes strategy, communication, and coordination among team members, making it a popular choice for competitive esports.",
            release_date: new Date("2015-12-01"),
            platforms: "PC, PS4, PS5, Xbox One, Xbox Series X/S",
            grid_id: RAINBOW_SIX_SIEGE.grid_id.id,
            banner_id: RAINBOW_SIX_SIEGE.banner_id.id,
            logo_id: RAINBOW_SIX_SIEGE.logo_id.id,
            is_approved: true,
        }
    });
    await prisma.game_tag.createMany({
        data: [
            { game_id: rainbow6.id, tag_name: "FPS" },
            { game_id: rainbow6.id, tag_name: "Tactical" },
            { game_id: rainbow6.id, tag_name: "Multijoueur" },
            { game_id: rainbow6.id, tag_name: "PvP" },
        ]
    });
}

export default seedAllGames;