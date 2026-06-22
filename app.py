from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room
import random
import math
import threading
import time

app = Flask(__name__)
app.config["SECRET_KEY"] = "secret"

socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode="gevent",
    logger=True,
    engineio_logger=True
)

# ---------------- WORLD ----------------

WORLD_WIDTH = 800
WORLD_HEIGHT = 600

shooters = [

    # corners

    (0, 0),
    (WORLD_WIDTH, 0),

    (0, WORLD_HEIGHT),
    (WORLD_WIDTH, WORLD_HEIGHT),

    # edge centers

    (WORLD_WIDTH / 2, 0),
    (WORLD_WIDTH / 2, WORLD_HEIGHT),

    (0, WORLD_HEIGHT / 2),
    (WORLD_WIDTH, WORLD_HEIGHT / 2)

]

# ---------------- COLORS ----------------

PLAYER_COLORS = [

    "#ff4444",
    "#4488ff",
    "#44ff44",
    "#ffff44",

    "#ff44ff",
    "#44ffff",
    "#ff8800",
    "#ff66aa"

]

# ---------------- DATA ----------------

players = {}

rooms = {}

# ---------------- CONNECT ----------------

@socketio.on("connect")
def handle_connect():

    print(

        "CONNECTED:",

        request.sid

    )

# ---------------- HOME ----------------

@app.route("/")
def home():

    return render_template(

        "index.html"

    )


@app.route("/singleplayer")
def singleplayer():

    return render_template(

        "singleplayer.html"

    )

# ---------------- DIFFICULTY ----------------

def get_difficulty(score):

    if score < 20:

        return 2, 2

    if score < 40:

        return 3, 2

    if score < 60:

        return 3, 2.5

    if score < 80:

        return 4, 2.5

    return 4, 3


# ---------------- ROOM PLAYERS ----------------

def send_room_players(room_code):

    room_players = []

    for sid, p in players.items():

        if p["room"] == room_code:

            room_players.append(

                {

                    "id": sid,

                    "name": p["name"],

                    "color": p["color"],

                    "ready": p["ready"]

                }

            )

    socketio.emit(

        "update_room_players",

        room_players,

        to=room_code

    )

# ---------------- CREATE ROOM ----------------

@socketio.on("create_room")
def create_room():

    room_code = str(

        random.randint(

            1000,

            9999

        )

    )

    join_room(

        room_code

    )

    players[request.sid] = {

        "x": 370,

        "y": 300,

        "room": room_code,

        "name": "Player 1",

        "color": random.choice(

            PLAYER_COLORS

        ),

        "ready": False

    }

    rooms[room_code] = {

        "bullets": [],

        "score": 0,

        "winner": "",

        "loser": "",

        "game_started": False,

        "countdown_started": False,

        "last_fire_time": time.time()

    }

    socketio.emit(

        "room_created",

        {

            "room_code": room_code

        },

        to=request.sid

    )

    send_room_players(

        room_code

    )


# ---------------- JOIN ROOM ----------------

@socketio.on("join_room_request")
def join_room_request(data):

    room_code = data["room_code"]

    print(

        "JOIN REQUEST:",

        data

    )

    if room_code not in rooms:

        print(

            "ROOM DOES NOT EXIST"

        )

        return

    join_room(

        room_code

    )

    players[request.sid] = {

        "x": 430,

        "y": 300,

        "room": room_code,

        "name": "Player 2",

        "color": random.choice(

            PLAYER_COLORS

        ),

        "ready": False

    }

    socketio.emit(

        "room_joined",

        {

            "room_code": room_code

        },

        to=request.sid

    )

    socketio.emit(

        "player_joined",

        to=room_code

    )

    send_room_players(

        room_code

    )


# ---------------- UPDATE PROFILE ----------------

@socketio.on("update_profile")
def update_profile(data):

    if request.sid not in players:

        return

    players[request.sid]["name"] = data["name"]

    players[request.sid]["color"] = data["color"]

    room_code = players[request.sid]["room"]

    send_room_players(

        room_code

    )


# ---------------- TOGGLE READY ----------------

@socketio.on("toggle_ready")
def toggle_ready():

    if request.sid not in players:

        return

    room_code = players[request.sid]["room"]

    room = rooms[room_code]

    players[request.sid]["ready"] = (

        not players[request.sid]["ready"]

    )

    send_room_players(

        room_code

    )

    room_players = [

        sid

        for sid, p in players.items()

        if p["room"] == room_code

    ]

    ready_players = [

        sid

        for sid, p in players.items()

        if (

            p["room"] == room_code

            and

            p["ready"]

        )

    ]

    if (

        len(room_players) >= 2

        and

        len(room_players) == len(ready_players)

        and

        not room["countdown_started"]

    ):

        room["countdown_started"] = True

        threading.Thread(

            target=start_countdown,

            args=(room_code,),

            daemon=True

        ).start()


# ---------------- COUNTDOWN ----------------

def start_countdown(room_code):

    values = [

        "3",

        "2",

        "1"

    ]

    for value in values:

        room_players = [

            sid

            for sid, p in players.items()

            if p["room"] == room_code

        ]

        ready_players = [

            sid

            for sid, p in players.items()

            if (

                p["room"] == room_code

                and

                p["ready"]

            )

        ]

        if len(room_players) != len(ready_players):

            rooms[room_code]["countdown_started"] = False

            socketio.emit(

                "start_countdown",

                {

                    "value": "-"

                },

                to=room_code

            )

            return

        socketio.emit(

            "start_countdown",

            {

                "value": value

            },

            to=room_code

        )

        time.sleep(1)

    room_players = [

        sid

        for sid, p in players.items()

        if p["room"] == room_code

    ]

    ready_players = [

        sid

        for sid, p in players.items()

        if (

            p["room"] == room_code

            and

            p["ready"]

        )

    ]

    if len(room_players) != len(ready_players):

        rooms[room_code]["countdown_started"] = False

        socketio.emit(

            "start_countdown",

            {

                "value": "-"

            },

            to=room_code

        )

        return

    socketio.emit(

        "start_countdown",

        {

            "value": "START!"

        },

        to=room_code

    )

    time.sleep(1)

    rooms[room_code]["game_started"] = True

    rooms[room_code]["score"] = 0

    rooms[room_code]["bullets"] = []

    rooms[room_code]["last_fire_time"] = time.time()

    socketio.emit(

        "game_started",

        to=room_code

    )

# ---------------- PLAYER DEAD ----------------

@socketio.on("player_dead")
def player_dead():

    if request.sid not in players:

        return

    room_code = players[request.sid]["room"]

    room = rooms[room_code]

    loser_name = players[request.sid]["name"]

    winner_name = ""

    for sid, p in players.items():

        if (

            p["room"] == room_code

            and

            sid != request.sid

        ):

            winner_name = p["name"]

            break

    room["winner"] = winner_name

    room["loser"] = loser_name

    room["game_started"] = False

    room["countdown_started"] = False

    room["bullets"] = []

    room["last_fire_time"] = time.time()

    # reset ready states

    for sid, p in players.items():

        if p["room"] == room_code:

            p["ready"] = False

    socketio.emit(

        "game_over",

        {

            "winner": room["winner"],

            "loser": room["loser"],

            "score": room["score"]

        },

        to=room_code

    )

    send_room_players(

        room_code

    )


# ---------------- BACK TO ROOM ----------------

@socketio.on("back_to_room")
def back_to_room():

    if request.sid not in players:

        return

    room_code = players[request.sid]["room"]

    room = rooms[room_code]

    room["game_started"] = False

    room["countdown_started"] = False

    room["score"] = 0

    room["bullets"] = []

    room["winner"] = ""

    room["loser"] = ""

    room["last_fire_time"] = time.time()

    for sid, p in players.items():

        if p["room"] == room_code:

            p["ready"] = False

    send_room_players(

        room_code

    )


# ---------------- LEAVE ROOM ----------------

@socketio.on("leave_room_request")
def leave_room_request():

    if request.sid not in players:

        return

    room_code = players[request.sid]["room"]

    leave_room(

        room_code

    )

    del players[request.sid]

    room_has_players = False

    for sid, p in players.items():

        if p["room"] == room_code:

            room_has_players = True

            break

    if room_has_players:

        send_room_players(

            room_code

        )

    else:

        if room_code in rooms:

            del rooms[room_code]


# ---------------- PLAYER MOVEMENT ----------------

@socketio.on("player_move")
def player_move(data):

    if request.sid not in players:

        return

    # only update coordinates

    players[request.sid]["x"] = data["x"]

    players[request.sid]["y"] = data["y"]

# ---------------- DISCONNECT ----------------

@socketio.on("disconnect")
def handle_disconnect():

    print(

        "DISCONNECTED:",

        request.sid

    )

    if request.sid not in players:

        return

    room_code = players[request.sid]["room"]

    del players[request.sid]

    room_has_players = False

    for sid, p in players.items():

        if p["room"] == room_code:

            room_has_players = True

            break

    if room_has_players:

        send_room_players(

            room_code

        )

    else:

        if room_code in rooms:

            del rooms[room_code]


# ---------------- GAME LOOP ----------------

def game_loop():

    while True:

        for room_code in list(rooms.keys()):

            room = rooms[room_code]

            if not room["game_started"]:

                continue

            room_players = []

            for sid, player in players.items():

                if player["room"] == room_code:

                    room_players.append(

                        player

                    )

            if len(room_players) == 0:

                continue

            # ---------------- FIRE BULLETS ----------------

            if (

                time.time()

                -

                room["last_fire_time"]

                >= 1

            ):

                room["score"] += 1

                socketio.emit(

                    "update_score",

                    {

                        "score": room["score"]

                    },

                    to=room_code

                )

                shooter_count, bullet_speed = (

                    get_difficulty(

                        room["score"]

                    )

                )

                selected_shooters = (

                    random.sample(

                        shooters,

                        shooter_count

                    )

                )

                for sx, sy in selected_shooters:

                    target_player = (

                        random.choice(

                            room_players

                        )

                    )

                    dx = (

                        target_player["x"]

                        -

                        sx

                    )

                    dy = (

                        target_player["y"]

                        -

                        sy

                    )

                    distance = math.sqrt(

                        dx * dx

                        +

                        dy * dy

                    )

                    if distance == 0:

                        continue

                    room["bullets"].append(

                        {

                            "x": sx,

                            "y": sy,

                            "dx":

                                dx

                                /

                                distance

                                *

                                bullet_speed,

                            "dy":

                                dy

                                /

                                distance

                                *

                                bullet_speed,

                            "radius": 6

                        }

                    )

                room["last_fire_time"] = time.time()

            # ---------------- MOVE BULLETS ----------------

            for bullet in room["bullets"]:

                bullet["x"] += bullet["dx"]

                bullet["y"] += bullet["dy"]

            # ---------------- REMOVE OFFSCREEN BULLETS ----------------

            room["bullets"] = [

                bullet

                for bullet in room["bullets"]

                if (

                    -50

                    <

                    bullet["x"]

                    <

                    WORLD_WIDTH + 50

                    and

                    -50

                    <

                    bullet["y"]

                    <

                    WORLD_HEIGHT + 50

                )

            ]

            # ---------------- SEND PLAYERS ----------------

            room_players_data = []

            for sid, player in players.items():

                if player["room"] == room_code:

                    room_players_data.append(

                        {

                            "id": sid,

                            "x": player["x"],

                            "y": player["y"],

                            "name": player["name"],

                            "color": player["color"]

                        }

                    )

            socketio.emit(

                "update_players",

                room_players_data,

                to=room_code

            )

            # ---------------- SEND BULLETS ----------------

            socketio.emit(

                "update_bullets",

                room["bullets"],

                to=room_code

            )

        # 33 ticks/sec

        socketio.sleep(

            0.016

        )


# ---------------- START BACKGROUND TASK ----------------

socketio.start_background_task(

    game_loop

)


# ---------------- MAIN ----------------

if __name__ == "__main__":

    socketio.run(

        app,

        host="0.0.0.0",

        port=5000,

        debug=True

    )
