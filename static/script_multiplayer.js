// ---------------- SOCKET ----------------

const socket = io({

    transports: ["websocket"],

    reconnection: true,

    reconnectionAttempts: Infinity,

    reconnectionDelay: 1000

});

// ---------------- CONNECTION LOGGING ----------------

socket.on(

    "connect",

    () => {

        console.log(

            "CONNECTED"

        );

        console.log(

            "Socket ID:",

            socket.id

        );

    }

);

socket.on(

    "disconnect",

    reason => {

        console.log(

            "DISCONNECTED"

        );

        console.log(

            reason

        );

    }

);

socket.on(

    "connect_error",

    err => {

        console.log(

            "CONNECT ERROR"

        );

        console.log(

            err

        );

    }

);

// ---------------- STATE ----------------

let roomCode = null;

let roomPlayers = [];

let otherPlayers = {};

// ---------------- UI ----------------

const menu = document.getElementById("menu");

const lobby = document.getElementById("lobby");

const gameUI = document.getElementById("gameUI");

const roomInfo = document.getElementById("roomInfo");

const playersList = document.getElementById("playersList");

const countdownText = document.getElementById("countdownText");

const statusText = document.getElementById("statusText");

const createRoomBtn =
    document.getElementById("createRoomBtn");

const joinRoomBtn =
    document.getElementById("joinRoomBtn");

const readyBtn =
    document.getElementById("readyBtn");

const exitRoomBtn =
    document.getElementById("exitRoomBtn");

const backRoomBtn =
    document.getElementById("backRoomBtn");

lobby.style.display = "none";

gameUI.style.display = "none";


// ---------------- CREATE ROOM ----------------

createRoomBtn.addEventListener(

    "click",

    () => {

        socket.emit(

            "create_room"

        );

    }

);


// ---------------- JOIN ROOM ----------------

joinRoomBtn.addEventListener(

    "click",

    () => {

        let code =

            document

                .getElementById(

                    "roomCode"

                )

                .value

                .trim();

        if (code !== "") {

            socket.emit(

                "join_room_request",

                {

                    room_code: code

                }

            );

        }

    }

);


// ---------------- ROOM CREATED ----------------

socket.on(

    "room_created",

    data => {

        roomCode = data.room_code;

        document.getElementById(

            "roomCodeText"

        ).innerHTML =

            "<b>Room Code:</b> "

            + roomCode;

        menu.style.display = "none";

        lobby.style.display = "block";

    }

);


// ---------------- ROOM JOINED ----------------

socket.on(

    "room_joined",

    data => {

        console.log(

            "ROOM JOINED"

        );

        console.log(

            data

        );

        roomCode = data.room_code;

        roomInfo.innerText =

            "Room Code: "

            + roomCode;

        menu.style.display = "none";

        lobby.style.display = "block";

    }

);


// ---------------- PLAYER JOINED ----------------

socket.on(

    "player_joined",

    () => {

        console.log(

            "Player joined"

        );

    }

);

// ---------------- ROOM PLAYERS ----------------

socket.on(

    "update_room_players",

    players => {

        console.log(

            "===== UPDATE ROOM PLAYERS ====="

        );

        console.log(

            players

        );

        roomPlayers = players;

        if (!playersList) {

            console.log(

                "playersList is NULL"

            );

            return;

        }

        playersList.innerHTML = "";

        players.forEach(

            p => {

                let card = `

<div class="playerCard">

<h3 style="color:${p.color}">
${p.name}
</h3>

<input
class="nameInput"
value="${p.name}"
onchange="changeName(this.value)"
>

<br><br>

<input
type="color"
value="${p.color}"
onchange="changeColor(this.value)"
>

<br><br>

Status :

${p.ready ? "READY" : "NOT READY"}

</div>

`;

                playersList.innerHTML += card;

            }

        );

    }

);


// ---------------- PROFILE ----------------

function changeName(name) {

    let myCard = roomPlayers.find(

        p => p.id === socket.id

    );

    socket.emit(

        "update_profile",

        {

            name: name,

            color:

                myCard ?

                myCard.color :

                "#4488ff"

        }

    );

}


function changeColor(color) {

    let myCard = roomPlayers.find(

        p => p.id === socket.id

    );

    socket.emit(

        "update_profile",

        {

            name:

                myCard ?

                myCard.name :

                "Player",

            color: color

        }

    );

}


// ---------------- READY BUTTON ----------------

readyBtn.addEventListener(

    "click",

    () => {

        socket.emit(

            "toggle_ready"

        );

    }

);


// ---------------- EXIT ROOM ----------------

exitRoomBtn.addEventListener(

    "click",

    () => {

        socket.emit(

            "leave_room_request"

        );

        location.reload();

    }

);


// ---------------- COUNTDOWN ----------------

socket.on(

    "start_countdown",

    data => {

        document.getElementById(

            "countdownValue"

        ).innerText =

            data.value;

    }

);


// ---------------- GAME START ----------------

socket.on(

    "game_started",

    () => {

        lobby.style.display = "none";

        gameUI.style.display = "block";

        countdownText.innerText = "";

        score = 0;

        bullets = [];

        gameRunning = true;

    }

);


// ---------------- SCORE ----------------

socket.on(

    "update_score",

    data => {

        score = data.score;

        scoreElement.innerText =

            "Score: "

            + score;

    }

);


// ---------------- BULLETS ----------------

socket.on(

    "update_bullets",

    serverBullets => {

        bullets = serverBullets;

    }

);


// ---------------- GAME OVER ----------------

socket.on(

    "game_over",

    data => {

        gameRunning = false;

        document.getElementById(

            "winnerText"

        ).innerText =

            data.winner;

        document.getElementById(

            "loserText"

        ).innerText =

            data.loser;

        document.getElementById(

            "finalScore"

        ).innerText =

            data.score;

        gameOverScreen.style.display =

            "block";

    }

);


// ---------------- BACK TO ROOM ----------------

backRoomBtn.addEventListener(

    "click",

    () => {

        socket.emit(

            "back_to_room"

        );

        gameOverScreen.style.display =

            "none";

        gameUI.style.display =

            "none";

        lobby.style.display =

            "block";

    }

);

// ---------------- PLAYER POSITIONS ----------------

socket.on(

    "update_players",

    players => {

        otherPlayers = {};

        players.forEach(

            p => {

                if (

                    p.id !== socket.id

                ) {

                    otherPlayers[p.id] = {

                        x: p.x,

                        y: p.y,

                        name: p.name,

                        color: p.color

                    };

                }

            }

        );

    }

);


// ---------------- SEND POSITION ----------------

function sendPosition(

    screenX,

    screenY

) {

    player.x = screenX / scaleX;

    player.y = screenY / scaleY;

    socket.emit(

        "player_move",

        {

            x: player.x,

            y: player.y

        }

    );

}


// ---------------- DRAW OTHER PLAYERS ----------------

function drawOtherPlayers() {

    for (

        let id in otherPlayers

    ) {

        let p = otherPlayers[id];

        ctx.beginPath();

        ctx.arc(

            p.x,

            p.y,

            PLAYER_RADIUS,

            0,

            Math.PI * 2

        );

        ctx.fillStyle = p.color;

        ctx.fill();

    }

}


// ---------------- COLLISION ----------------

function checkCollision() {

    for (

        let bullet of bullets

    ) {

        if (

            isColliding(

                player,

                bullet

            )

        ) {

            socket.emit(

                "player_dead"

            );

            return;

        }

    }

}


// ---------------- MAIN LOOP ----------------

function animate() {

    // Portrait warning

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

    clearWorld();

    // GAME PHASE

    if (

        gameRunning

    ) {

        checkCollision();

        drawShooters();

        drawBullets();

        drawPlayer();

        drawOtherPlayers();

    }

    requestAnimationFrame(

        animate

    );

}


// ---------------- START ----------------

animate();
