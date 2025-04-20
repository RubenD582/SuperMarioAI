class Goomba {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 60  // Speed in units per second
        this.dy = 0; 
        this.dx = -this.speed;
        this.grounded = false;

        this.maxGravity = 1500;  // Max fall speed in units per second
        this.currentFrame = 0;
        this.frameDuration = 200;
        this.frameTime = 0;
        this.isDead = false;
        this.start = false;
        this.deadTimer = null;

        this.points = 100;

        // Load Goomba animations
        this.animations = {
            walk: this.loadFrames('Sprites/Goomba_Walk', 2),
            dead: this.loadFrames('Sprites/Goomba_Flat', 1),
        };

        this.currentAnimation = 'walk';
    }

    loadFrames(basePath, totalFrames) {
        const frames = [];
        for (let i = 1; i <= totalFrames; i++) {
            const img = new Image();
            img.src = totalFrames > 1 ? `${basePath}${i}.png` : `${basePath}.png`;
            frames.push(img);
        }
        return frames;
    }

    animate(deltaTime) {
        this.frameTime += deltaTime;
        const animation = this.animations[this.currentAnimation];

        if (animation.length > 1 && this.frameTime >= this.frameDuration) {
            this.currentFrame = (this.currentFrame + 1) % animation.length;
            this.frameTime = 0;
        }
    }

    update(deltaTime, TICK) {
        if (this.start) {
            // Apply gravity using TICK for consistent fall speed
            if (!this.grounded) {
                this.dy += this.maxGravity * TICK;  // Gravity affected by elapsed time
            }

            // Move Goomba using TICK to keep speed consistent
            this.x += this.dx * TICK;  // Horizontal speed affected by elapsed time
            this.y += this.dy * TICK;  // Vertical speed affected by elapsed time

            this.checkCollision(blocks);  // Check collision after movement
        }

        this.checkPlayerCollision(players);
        this.animate(deltaTime);
    }

    draw(ctx, camera) {
        ctx.save(); 
        const adjustedX = this.x - camera.x;
        const adjustedY = this.y;

        const img = this.currentAnimation === 'dead' 
            ? this.animations.dead[0] 
            : this.animations[this.currentAnimation][this.currentFrame];

        ctx.drawImage(img, adjustedX, adjustedY, this.width, this.height);
        ctx.restore();
    }

    checkCollision(blocks) {
        const goombaBottom = this.y + this.height;
        const goombaLeft = this.x;
        const goombaRight = this.x + this.width;
        const goombaTop = this.y;

        let collidedVertically = false;

        for (let row = 0; row < blocks.length; row++) {
            for (let col = 0; col < blocks[row].length; col++) {
                const block = blocks[row][col];
                if (block && block.solid) {
                    const { left, right, top, bottom } = block.getBoundingBox();

                    const horizontalCollision = goombaRight > left && goombaLeft < right;
                    const verticalCollision = goombaBottom > top && goombaTop < bottom;

                    if (horizontalCollision && verticalCollision) {
                        if (goombaBottom >= top && goombaBottom <= top + 10 && this.dy >= 0) {
                            this.y = top - this.height;
                            this.grounded = true;
                            this.dy = 0;
                            collidedVertically = true;
                        }

                        if (!collidedVertically) {
                            if (this.dx > 0) {
                                this.x = left - this.width;
                                this.dx = -this.speed;
                            } else if (this.dx < 0) {
                                this.x = right; 
                                this.dx = this.speed;
                            }
                        }
                    }
                }
            }
        }

        // If no vertical collision was detected, the Goomba is not grounded
        if (!collidedVertically) {
            this.grounded = false;
        }
    }

    checkPlayerCollision(players) {
        for (let i = players.length - 1; i >= 0; i--) {
            const player = players[i];

            if (player.currentAnimation !== 'dead' && !this.isDead) {
                if (Math.abs(this.x - player.x) <= 650) {
                    this.start = true;
                }

                const playerBottom = player.y + player.height;
                const playerLeft = player.x;
                const playerRight = player.x + player.width;
                const playerTop = player.y;

                const thisBottom = this.y + this.height;
                const thisRight = this.x + this.width;

                const horizontalCollision = playerRight > this.x && playerLeft < thisRight;
                const verticalCollision = playerBottom > this.y && playerTop < thisBottom;

                let verticalTolerance = 10;

                if (horizontalCollision && verticalCollision) {
                    if (playerBottom <= this.y + verticalTolerance) {
                        this.currentAnimation = 'dead';
                        this.start = false;
                        player.vy = -150;

                        player.score += 100;

                        player.score += this.points;

                        if (!this.deadTimer) {
                            this.deadTimer = setTimeout(() => {
                                this.isDead = true;
                            }, 100);
                        }
                        break;
                    } else {
                        player.dead(); // Player hit the Goomba from the side
                    }
                }
            }
        }
    }
}
