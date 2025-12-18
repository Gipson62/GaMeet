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
    grid: "the_witcher_3_grid.jpg",
    banner: "the_witcher_3_banner.jpg",
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

const seedAllGames = async (prisma) => {
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
    await prisma.game.create({
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
    await prisma.game.create({
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
    await prisma.game.create({
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
    


}

export default seedAllGames;