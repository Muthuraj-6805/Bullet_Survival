// ---------------- WORLD ----------------

const WORLD_WIDTH = 800;
const WORLD_HEIGHT = 600;

// ---------------- PLAYER ----------------

const PLAYER_RADIUS = 20;

// ---------------- BULLETS ----------------

const BULLET_RADIUS = 6;

// ---------------- SHOOTERS ----------------

const SHOOTER_RADIUS = 20;

// 8 shooters

const shooters = [

    // corners
    { x: 0, y: 0 },
    { x: WORLD_WIDTH, y: 0 },
    { x: 0, y: WORLD_HEIGHT },
    { x: WORLD_WIDTH, y: WORLD_HEIGHT },

    // edge centers
    { x: WORLD_WIDTH / 2, y: 0 },
    { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT },
    { x: 0, y: WORLD_HEIGHT / 2 },
    { x: WORLD_WIDTH, y: WORLD_HEIGHT / 2 }

];

// ---------------- DIFFICULTY ----------------

function getDifficulty(score) {

    // 0 - 19
    if (score < 20) {

        return {

            shooterCount: 2,
            bulletSpeed: 2

        };

    }

    // 20 - 39
    if (score < 40) {

        return {

            shooterCount: 3,
            bulletSpeed: 2

        };

    }

    // 40 - 59
    if (score < 60) {

        return {

            shooterCount: 3,
            bulletSpeed: 2.5

        };

    }

    // 60 - 79
    if (score < 80) {

        return {

            shooterCount: 4,
            bulletSpeed: 2.5

        };

    }

    // 80+

    return {

        shooterCount: 4,
        bulletSpeed: 3

    };

}

// ---------------- COLLISION ----------------

function isColliding(player, bullet) {

    let dx = player.x - bullet.x;
    let dy = player.y - bullet.y;

    let distance = Math.sqrt(

        dx * dx +
        dy * dy

    );

    return (

        distance <

        player.radius + bullet.radius

    );

}