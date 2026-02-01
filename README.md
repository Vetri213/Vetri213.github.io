# Snake Master: Gesture-Controlled Snake Game

Snake Master is a modern take on the classic Snake game, where you control the snake using hand gestures captured by your webcam. Point in a direction, and your snake will follow!

## How It Works

The game uses:
- **Pygame** for the game interface
- **OpenCV** for webcam capture
- **MediaPipe** for hand tracking and gesture recognition

## Gesture Controls

Control your snake with these hand gestures:

| Direction | Gesture |
|-----------|---------|
| Up | ![Up](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hand_up-b4cRJu0kV2q6O5WBIs8oEGaVjZGibc.png) |
| Down | ![Down](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hand_down-idBBdnVjGbdu8oVLKPFi9RAa5B5afb.png) |
| Left | ![Left](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hand_left-wryh395hgEXPjXQR4bmeFS1DaOgkoN.png) |
| Right | ![Right](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hand_right-swTQCKNFsiavJDtp6UiXlLjmGm4to3.png) |

## Game Features

- Control the snake with hand gestures
- Wraparound screen edges
- High score tracking
- Colorful snake and food

## Requirements

- Python 3.7+
- Webcam
- Libraries: pygame, opencv-python, mediapipe

## Installation

\`\`\`bash
# Install required libraries
pip install pygame opencv-python mediapipe

# Clone the repository
git clone https://github.com/Vetri213/Snake_Master.git

# Run the game
python main.py
\`\`\`

## Game Controls

- During gameplay: Use hand gestures to control the snake
- After game over: Show 3 fingers to retry, 4 fingers to quit
\`\`\`

Now, let's create a Python script that demonstrates how the game works:

\`\`\`python file="demo.py" type="code"
import pygame
import cv2
import mediapipe as mp
import numpy as np
import time

# Initialize pygame
pygame.init()
screen_width, screen_height = 800, 600
screen = pygame.display.set_mode((screen_width, screen_height))
pygame.display.set_caption("Snake Master Demo")

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GREEN = (0, 255, 0)
RED = (255, 0, 0)
BLUE = (0, 0, 255)
PURPLE = (128, 0, 128)

# Font
font = pygame.font.SysFont("Arial", 24)

# Load gesture images
def load_image(url, size=(150, 150)):
    # In a real implementation, you would download and load the image
    # For this demo, we'll create a placeholder
    img = pygame.Surface(size)
    img.fill(WHITE)
    text = font.render(url.split('/')[-1][:5], True, BLACK)
    img.blit(text, (10, 60))
    return img

# Create gesture images
gesture_up = load_image("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hand_up-b4cRJu0kV2q6O5WBIs8oEGaVjZGibc.png")
gesture_down = load_image("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hand_down-idBBdnVjGbdu8oVLKPFi9RAa5B5afb.png")
gesture_left = load_image("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hand_left-wryh395hgEXPjXQR4bmeFS1DaOgkoN.png")
gesture_right = load_image("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hand_right-swTQCKNFsiavJDtp6UiXlLjmGm4to3.png")

# Game state
current_direction = "right"
snake_positions = [(100, 100), (90, 100), (80, 100)]
food_position = (300, 200)
score = 0
game_over = False

# Demo webcam frame
webcam_frame = pygame.Surface((320, 240))
webcam_frame.fill(BLACK)

# Function to draw snake
def draw_snake(positions):
    for i, pos in enumerate(positions):
        color = PURPLE if i == 0 else GREEN
        pygame.draw.rect(screen, color, (pos[0], pos[1], 10, 10))

# Function to draw food
def draw_food(pos):
    pygame.draw.rect(screen, RED, (pos[0], pos[1], 15, 15))

# Function to update snake position
def update_snake(positions, direction):
    head_x, head_y = positions[0]
    
    if direction == "right":
        new_head = (head_x + 10, head_y)
    elif direction == "left":
        new_head = (head_x - 10, head_y)
    elif direction == "up":
        new_head = (head_x, head_y - 10)
    elif direction == "down":
        new_head = (head_x, head_y + 10)
    
    # Wrap around screen edges
    new_head = (new_head[0] % screen_width, new_head[1] % screen_height)
    
    positions.insert(0, new_head)
    positions.pop()
    
    return positions

# Function to simulate hand detection
def simulate_hand_detection(frame_count):
    # Simulate changing directions every few seconds
    directions = ["right", "up", "left", "down"]
    return directions[(frame_count // 60) % 4]

# Main demo loop
def run_demo():
    global snake_positions, food_position, score, game_over, current_direction
    
    clock = pygame.time.Clock()
    frame_count = 0
    
    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:
                    # Reset game
                    snake_positions = [(100, 100), (90, 100), (80, 100)]
                    food_position = (300, 200)
                    score = 0
                    game_over = False
                    current_direction = "right"
        
        screen.fill(BLUE)
        
        # Draw UI elements
        screen.blit(font.render(f"Score: {score}", True, WHITE), (10, 10))
        screen.blit(font.render("Snake Master Demo", True, WHITE), (screen_width//2 - 100, 10))
        
        # Draw webcam frame placeholder
        pygame.draw.rect(screen, BLACK, (screen_width - 330, 10, 320, 240))
        screen.blit(webcam_frame, (screen_width - 330, 10))
        
        # Draw gesture guide
        screen.blit(font.render("Gesture Controls:", True, WHITE), (10, screen_height - 180))
        screen.blit(gesture_up, (10, screen_height - 150))
        screen.blit(gesture_down, (170, screen_height - 150))
        screen.blit(gesture_left, (330, screen_height - 150))
        screen.blit(gesture_right, (490, screen_height - 150))
        
        if not game_over:
            # Simulate hand detection
            detected_direction = simulate_hand_detection(frame_count)
            
            # Update direction based on detection
            if detected_direction != current_direction:
                # Don't allow 180-degree turns
                opposites = {"right": "left", "left": "right", "up": "down", "down": "up"}
                if opposites[detected_direction] != current_direction:
                    current_direction = detected_direction
            
            # Update snake
            snake_positions = update_snake(snake_positions, current_direction)
            
            # Check for collisions with food
            if abs(snake_positions[0][0] - food_position[0]) &lt; 15 and abs(snake_positions[0][1] - food_position[1]) &lt; 15:
                # Grow snake
                snake_positions.append(snake_positions[-1])
                # Move food
                food_position = (np.random.randint(0, screen_width - 20), np.random.randint(0, screen_height - 20))
                score += 1
            
            # Check for collisions with self
            if snake_positions[0] in snake_positions[1:]:
                game_over = True
            
            # Draw food and snake
            draw_food(food_position)
            draw_snake(snake_positions)
            
            # Show current direction
            direction_text = f"Current Direction: {current_direction.upper()}"
            screen.blit(font.render(direction_text, True, WHITE), (screen_width//2 - 100, screen_height - 40))
        else:
            # Game over screen
            game_over_text = font.render("Game Over! Press SPACE to restart", True, WHITE)
            screen.blit(game_over_text, (screen_width//2 - 150, screen_height//2))
        
        pygame.display.flip()
        clock.tick(10)  # Slower speed for demo
        frame_count += 1
    
    pygame.quit()

if __name__ == "__main__":
    run_demo()
