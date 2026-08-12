# =============================================================
#   A COMPLETE JUMP-AND-RUN  —  written with plain Pygame
# =============================================================
#   How to run it:
#     1. Save this file as  platformer.py
#     2. Open a terminal in the same folder
#     3. Type:   python3 platformer.py
#
#   Controls:   left / right arrows to move,   Space or Up to jump
#   Goal:       grab all four coins to win!
# =============================================================

import pygame

WIDTH = 800           # how wide the game window is
HEIGHT = 400          # how tall it is

GRAVITY = 0.6         # how fast the player speeds up while falling
JUMP_STRENGTH = -13   # how hard a jump pushes up (negative = upward)
MOVE_SPEED = 5        # how many pixels the player walks each frame

# The player is just a rectangle for now: Rect(x, y, width, height).
# Later you can swap this for a sprite from kenney.nl!
player = pygame.Rect(80, 200, 32, 44)
player_vy = 0         # vertical speed: + means falling, - means rising
on_ground = False     # are we standing on something right now?

# Platforms to stand on. Each is Rect(x, y, width, height).
platforms = [
    pygame.Rect(0, 368, 800, 32),     # the ground
    pygame.Rect(180, 300, 140, 20),
    pygame.Rect(380, 240, 140, 20),
    pygame.Rect(600, 300, 140, 20),
]

# Coins to collect, each written as [x, y].
coins = [[240, 270], [440, 210], [660, 270], [120, 330]]
collected = set()     # the numbers of the coins we've picked up
won = False


def draw(screen, font, big_font):
    screen.fill((20, 16, 42))                                   # dark background
    for platform in platforms:
        pygame.draw.rect(screen, (63, 224, 208), platform)     # cyan platforms
    for number, (cx, cy) in enumerate(coins):
        if number not in collected:
            pygame.draw.circle(screen, (255, 207, 77), (cx, cy), 8)  # gold coin
    pygame.draw.rect(screen, (255, 94, 168), player)            # pink player

    text = font.render(f"Coins: {len(collected)}/{len(coins)}", True, "white")
    screen.blit(text, (12, 10))

    if won:
        win_text = big_font.render("YOU WIN!", True, (255, 207, 77))
        rect = win_text.get_rect(center=(WIDTH / 2, HEIGHT / 2))
        screen.blit(win_text, rect)


def update():
    """Called ~60 times a second — the game's heartbeat."""
    global player_vy, on_ground, won
    if won:
        return

    keys = pygame.key.get_pressed()

    # 1. Move left and right
    if keys[pygame.K_LEFT]:
        player.x -= MOVE_SPEED
    if keys[pygame.K_RIGHT]:
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
        coin_box = pygame.Rect(cx - 8, cy - 8, 16, 16)
        if number not in collected and player.colliderect(coin_box):
            collected.add(number)

    # 7. Win once every coin is collected
    if len(collected) == len(coins):
        won = True


def on_key_down(key):
    global player_vy
    if key in (pygame.K_SPACE, pygame.K_UP) and on_ground:
        player_vy = JUMP_STRENGTH


def main():
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption("Jump and Run")
    clock = pygame.time.Clock()
    font = pygame.font.SysFont(None, 30)
    big_font = pygame.font.SysFont(None, 70)

    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                on_key_down(event.key)

        update()
        draw(screen, font, big_font)
        pygame.display.flip()
        clock.tick(60)

    pygame.quit()


if __name__ == "__main__":
    main()
