// ---------------- START ----------------

restartGame();

// ---------------- FIRE TIMER ----------------

let lastFireTime = Date.now();

// ---------------- RANDOM SHOOTERS ----------------

function getRandomShooters(count) {

    let available = [...shooters];

    let selected = [];

    while (

        selected.length < count &&
        available.length > 0

    ) {

        let index = Math.floor(

            Math.random() * available.length

        );

        selected.push(

            available[index]

        );

        available.splice(index, 1);

    }

    return selected;

}

// ---------------- CREATE BULLETS ----------------

function fireBullets() {

    let difficulty = getDifficulty(score);

    let selectedShooters = getRandomShooters(

        difficulty.shooterCount

    );

    selectedShooters.forEach(shooter => {

        let dx = player.x - shooter.x;
        let dy = player.y - shooter.y;

        let distance = Math.sqrt(

            dx * dx +
            dy * dy

        );

        if (distance === 0)
            return;

        bullets.push({

            x: shooter.x,
            y: shooter.y,

            dx:

                dx / distance *
                difficulty.bulletSpeed,

            dy:

                dy / distance *
                difficulty.bulletSpeed,

            radius: BULLET_RADIUS

        });

    });

}

// ---------------- MOVE BULLETS ----------------

function moveBullets() {

    bullets.forEach(bullet => {

        bullet.x += bullet.dx;

        bullet.y += bullet.dy;

    });

}

// ---------------- REMOVE BULLETS ----------------

function removeBullets() {

    bullets = bullets.filter(

        bullet =>

            bullet.x > -50 &&
            bullet.x < WORLD_WIDTH + 50 &&

            bullet.y > -50 &&
            bullet.y < WORLD_HEIGHT + 50

    );

}

// ---------------- COLLISION ----------------

function checkCollision() {

    for (let bullet of bullets) {

        if (

            isColliding(

                player,

                bullet

            )

        ) {

            gameOver();

            return;

        }

    }

}

// ---------------- ANIMATE ----------------

function animate() {

    // TEMPORARILY DISABLE PORTRAIT CHECK

    /*
    if (

        window.innerHeight >

        window.innerWidth

    ) {

        showPortraitWarning();

        requestAnimationFrame(

            animate

        );

        return;

    }
    */

    clearWorld();

    if (gameRunning) {

        // Fire bullets every second

        if (

            Date.now() -

            lastFireTime >= 1000

        ) {

            fireBullets();

            lastFireTime = Date.now();

        }

        moveBullets();

        removeBullets();

        checkCollision();

        drawShooters();

        drawBullets();

        drawPlayer();

    }

    requestAnimationFrame(

        animate

    );

}

// ---------------- START LOOP ----------------

animate();