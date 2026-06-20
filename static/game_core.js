// ---------------- CANVAS ----------------

const canvas = document.getElementById(

    "gameCanvas"

);

const ctx = canvas.getContext(

    "2d"

);

let scaleX = 1;

let scaleY = 1;


// ---------------- UI ----------------

const scoreElement =

    document.getElementById(

        "score"

    );

const gameOverScreen =

    document.getElementById(

        "gameOver"

    );


// ---------------- GAME STATE ----------------

let bullets = [];

let score = 0;

let gameRunning = false;


// ---------------- PLAYER ----------------

const player = {

    x: WORLD_WIDTH / 2,

    y: WORLD_HEIGHT / 2,

    radius: PLAYER_RADIUS,

    color: "dodgerblue",

    name: "Player"

};


// ---------------- RESIZE ----------------

function resizeCanvas() {

    canvas.width =

        window.innerWidth;

    canvas.height =

        window.innerHeight;

    scaleX =

        canvas.width /

        WORLD_WIDTH;

    scaleY =

        canvas.height /

        WORLD_HEIGHT;

}

resizeCanvas();


// ---------------- POSITION ----------------

function sendPosition(

    screenX,

    screenY

) {

    player.x =

        screenX /

        scaleX;

    player.y =

        screenY /

        scaleY;

}


// ---------------- MOUSE ----------------

window.addEventListener(

    "mousemove",

    e => {

        sendPosition(

            e.clientX,

            e.clientY

        );

    }

);


// ---------------- TOUCH ----------------

window.addEventListener(

    "touchmove",

    e => {

        e.preventDefault();

        let touch =

            e.touches[0];

        sendPosition(

            touch.clientX,

            touch.clientY

        );

    }

);


// ---------------- SCORE ----------------

setInterval(

    () => {

        if (

            gameRunning

        ) {

            // Increase score

            score++;

            // Update display

            scoreElement.innerText =

                "Score: " +

                score;

        }

    },

    1000

);

// ---------------- DRAW PLAYER ----------------

function drawPlayer() {

    ctx.beginPath();

    ctx.arc(

        player.x,

        player.y,

        player.radius,

        0,

        Math.PI * 2

    );

    ctx.fillStyle = player.color;

    ctx.fill();

}

// ---------------- DRAW SHOOTERS ----------------

function drawShooters() {

    shooters.forEach(shooter => {

        ctx.beginPath();

        ctx.arc(

            shooter.x,
            shooter.y,

            SHOOTER_RADIUS,

            0,
            Math.PI * 2

        );

        ctx.fillStyle = "lime";

        ctx.fill();

    });

}

// ---------------- DRAW BULLETS ----------------

// ---------------- DRAW BULLETS ----------------

function drawBullets() {

    bullets.forEach(bullet => {

        // Direction vector

        let length = Math.sqrt(

            bullet.dx * bullet.dx +

            bullet.dy * bullet.dy

        );

        if (length === 0)
            return;

        let ux = bullet.dx / length;
        let uy = bullet.dy / length;

        // Perpendicular vector

        let px = -uy;
        let py = ux;

        // Flame size

        let trailLength = 20;

        let tailX =

            bullet.x -

            ux * trailLength;

        let tailY =

            bullet.y -

            uy * trailLength;

        // ---------------- FLAME TRIANGLE ----------------

        ctx.beginPath();

        ctx.moveTo(

            bullet.x + px * bullet.radius,
            bullet.y + py * bullet.radius

        );

        ctx.lineTo(

            bullet.x - px * bullet.radius,
            bullet.y - py * bullet.radius

        );

        ctx.lineTo(

            tailX,
            tailY

        );

        ctx.closePath();

        let gradient = ctx.createLinearGradient(

            tailX,
            tailY,

            bullet.x,
            bullet.y

        );

        gradient.addColorStop(

            0,

            "rgba(255,255,0,0)"

        );

        gradient.addColorStop(

            0.4,

            "orange"

        );

        gradient.addColorStop(

            1,

            "red"

        );

        ctx.fillStyle = gradient;

        ctx.fill();


        // ---------------- OUTER GLOW ----------------

        ctx.beginPath();

        ctx.arc(

            bullet.x,
            bullet.y,

            bullet.radius + 3,

            0,
            Math.PI * 2

        );

        ctx.fillStyle =

            "rgba(255,120,0,0.4)";

        ctx.fill();


        // ---------------- RED SHELL ----------------

        ctx.beginPath();

        ctx.arc(

            bullet.x,
            bullet.y,

            bullet.radius,

            0,
            Math.PI * 2

        );

        ctx.fillStyle = "red";

        ctx.fill();


        // ---------------- YELLOW CORE ----------------

        ctx.beginPath();

        ctx.arc(

            bullet.x,
            bullet.y,

            bullet.radius * 0.45,

            0,
            Math.PI * 2

        );

        ctx.fillStyle = "yellow";

        ctx.fill();

    });

}

// ---------------- GAME OVER ----------------

function gameOver() {

    gameRunning = false;

    gameOverScreen.style.display =

        "block";

}


// ---------------- RESTART ----------------

function restartGame() {

    score = 0;

    bullets = [];

    player.x =

        WORLD_WIDTH / 2;

    player.y =

        WORLD_HEIGHT / 2;

    scoreElement.innerText =

        "Score: 0";

    gameOverScreen.style.display =

        "none";

    gameRunning = true;

}


// ---------------- HOME ----------------

function goHome() {

    window.location.href = "/";

}


// ---------------- PORTRAIT WARNING ----------------

function showPortraitWarning() {

    ctx.setTransform(

        1,

        0,

        0,

        1,

        0,

        0

    );

    ctx.clearRect(

        0,

        0,

        canvas.width,

        canvas.height

    );

    ctx.fillStyle =

        "white";

    ctx.font =

        "30px Arial";

    ctx.textAlign =

        "center";

    ctx.fillText(

        "Rotate phone to landscape",

        canvas.width / 2,

        canvas.height / 2

    );

}


// ---------------- CLEAR WORLD ----------------

function clearWorld() {

    ctx.setTransform(

        scaleX,

        0,

        0,

        scaleY,

        0,

        0

    );

    ctx.clearRect(

        0,

        0,

        WORLD_WIDTH,

        WORLD_HEIGHT

    );

}


// ---------------- RESIZE ----------------

window.addEventListener(

    "resize",

    () => {

        resizeCanvas();

    }

);