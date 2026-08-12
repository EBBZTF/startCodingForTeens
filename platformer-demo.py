# =============================================================
#   A COMPLETE JUMP-AND-RUN  —  written with Pygame Zero
# =============================================================
#   How to run it:
#     1. Save this file as  platformer.py
#     2. Open a terminal in the same folder
#     3. Type:   pgzrun platformer.py
#
#   Controls:   left / right arrows to move,   Space or Up to jump
#   Goal:       grab all four coins to win!
# =============================================================

WIDTH = 800           # how wide the game window is
HEIGHT = 400          # how tall it is

GRAVITY = 0.6         # how fast the player speeds up while falling
JUMP_STRENGTH = -13   # how hard a jump pushes up (negative = upward)
MOVE_SPEED = 5        # how many pixels the player walks each frame

# The player is just a rectangle for now: Rect((x, y), (width, height)).
# Later you can swap this for a sprite from kenney.nl!
player = Rect((80, 200), (32, 44))
player_vy = 0         # vertical speed: + means falling, - means rising
on_ground = False     # are we standing on something right now?

# Platforms to stand on. Each is Rect((x, y), (width, height)).
platforms = [
    Rect((0, 368), (800, 32)),     # the ground
    Rect((180, 300), (140, 20)),
    Rect((380, 240), (140, 20)),
    Rect((600, 300), (140, 20)),
]

# Coins to collect, each written as [x, y].
coins = [[240, 270], [440, 210], [660, 270], [120, 330]]
collected = set()     # the numbers of the coins we've picked up
won = False


def draw():
    """Pygame Zero runs this whenever the screen needs redrawing."""
    screen.fill((20, 16, 42))                              # dark background
    for platform in platforms:
        screen.draw.filled_rect(platform, (63, 224, 208))  # cyan platforms
    for number, (cx, cy) in enumerate(coins):
        if number not in collected:
            screen.draw.filled_circle((cx, cy), 8, (255, 207, 77))  # gold coin
    screen.draw.filled_rect(player, (255, 94, 168))         # pink player
    screen.draw.text(f"Coins: {len(collected)}/{len(coins)}",
                     (12, 10), fontsize=30, color="white")
    if won:
        screen.draw.text("YOU WIN!", center=(WIDTH / 2, HEIGHT / 2),
                         fontsize=70, color=(255, 207, 77))


def update():
    """Pygame Zero runs this ~60 times a second — the game's heartbeat."""
    global player_vy, on_ground, won
    if won:
        return

    # 1. Move left and right
    if keyboard.left:
        player.x -= MOVE_SPEED
    if keyboard.right:
        player.x += MOVE_SPEED

    # 2. Gravity: add a little downward speed each frame, then move
    player_vy += GRAVITY
    player.y += player_vy

    # 3. Land on platforms
    on_ground = False
    for platform in platforms:
        # only land if we're falling AND came down from above the platform
        if player.colliderect(platform) and player_vy >= 0:
            if player.bottom - player_vy <= platform.top + 1:
                player.bottom = platform.top
                player_vy = 0
                on_ground = True

    # 4. Don't walk off the edges of the screen
    if player.left < 0:
        player.left = 0
    if player.right > WIDTH:
        player.right = WIDTH

    # 5. If we fall off the bottom, start again from the top
    if player.top > HEIGHT:
        player.topleft = (80, 200)
        player_vy = 0

    # 6. Collect any coin we touch
    for number, (cx, cy) in enumerate(coins):
        coin_box = Rect((cx - 8, cy - 8), (16, 16))
        if number not in collected and player.colliderect(coin_box):
            collected.add(number)

    # 7. Win once every coin is collected
    if len(collected) == len(coins):
        won = True


def on_key_down(key):
    """Pygame Zero runs this once each time a key is pressed down."""
    global player_vy
    if key in (keys.SPACE, keys.UP) and on_ground:
        player_vy = JUMP_STRENGTH
