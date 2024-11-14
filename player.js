constants = {
    empty: 0,
    solid: 1,
    player: 2,
    mysteryBlock: 3,
    enemy: 4,
}

class Player {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.facing = 'right';
        this.vy = 0; 
        this.vx = 0;
        this.currentAnimation = 'idle';
        this.grounded = true;
        this.distance = 0;
        this.fitness = 0;
        this.score = 0;

        this.mysteryBlock = 0;

        this.frameDuration = 100;
        this.currentFrame = 0;
        this.frameTime = 0;

        this.deadTimer = null;

        this.lifespan = 0; 
        this.isDead = false;
        this.startTime = null;

        this.MIN_WALK = 4.453125;
        this.MAX_WALK = 93.75;
        this.MAX_RUN = 153.75;
        this.ACC_WALK = 133.59375;
        this.ACC_RUN = 200.390625;
        this.DEC_REL = 182.8125;
        this.DEC_SKID = 365.625;
        this.MIN_SKID = 33.75;

        this.STOP_FALL = 1575;
        this.WALK_FALL = 1800;
        this.RUN_FALL = 2025;
        this.STOP_FALL_A = 450;
        this.WALK_FALL_A = 421.875;
        this.RUN_FALL_A = 562.5;

        this.MAX_FALL = 270;
        this.FALL_ACC = 562.5;

        this.MIN_VX = -this.MAX_RUN;
        this.MAX_VX = this.MAX_RUN;
        this.MIN_VY = -this.MAX_FALL;
        this.MAX_VY = this.MAX_FALL;

        this.levelEnd = tileWidth * (map[0].length - 12);

        this.isDead = false;
        
        this.color =  Math.floor(Math.random() * 1);    
        this.animations = {
            'idle': this.loadFrames(`Sprites/${this.color}/Mario_Small_Idle`, 1),
            'run': this.loadFrames(`Sprites/${this.color}/Mario_Small_Run`, 3), 
            'jump': this.loadFrames(`Sprites/${this.color}/Mario_Small_Jump`, 1),
            'skid': this.loadFrames(`Sprites/${this.color}/Mario_Small_Slide`, 1),
            'dead': this.loadFrames(`Sprites/${this.color}/Mario_Small_Death`, 1),
        };

        this.neuralNetwork = new NeuralNetwork(231, 50, 4);
        this.keys = {
            left: false,
            right: false,
            up: false,
            b: false,
        };
    }

    loadFrames(basePath, totalFrames) {
        const frames = [];
        if (totalFrames > 1) {
            for (let i = 1; i <= totalFrames; i++) {
                const img = new Image();
                img.src = `${basePath}${i}.png`;
                frames.push(img);
            }
        } else {
            const img = new Image();
            img.src = `${basePath}.png`;
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

    draw(ctx, camera) {
        ctx.save(); 
    
        const adjustedX = this.x - camera.x;
    
        const originalX = adjustedX;
    
        if (this.facing === 'left') {
            ctx.translate(originalX + this.width, this.y);
            ctx.scale(-1, 1);
        } else {
            ctx.translate(originalX, this.y);
        }
    
        if (this.currentAnimation == 'run') {
            ctx.drawImage(this.animations[this.currentAnimation][this.currentFrame], 0, 0, this.width, this.height);
        } else {
            ctx.drawImage(this.animations[this.currentAnimation][0], 0, 0, this.width, this.height);
        }
    
        ctx.restore(); 

        if (drawHitBox) {
            this.drawBoundingBox(ctx, camera);
        }
        
    }
    
    drawBoundingBox(ctx, camera) {
        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;

        const adjustedX = this.x - camera.x;
        const adjustedY = this.y;

        ctx.strokeRect(adjustedX, adjustedY, this.width, this.height); 
        ctx.restore();
    }

    update(deltaTime, TICK) {
        if (this.currentAnimation !== 'dead') {
            if (this.startTime === null) {  
                this.startTime = Date.now();
            }
            
            // Calculate elapsed time
            const elapsedTime = Date.now() - this.startTime;
            if (elapsedTime >= 100) {
                this.lifespan += 1;
                this.startTime = Date.now();
            }

            this.distance = Math.max(0, Math.min(100, (this.x / this.levelEnd) * 100));

            this.processInput();
            const isMoving = Math.abs(this.vx) > 0;
    
            if (this.grounded) {
                if (!isMoving) {
                    this.currentAnimation = 'idle';
                } else {
                    this.currentAnimation = 'run';
                }
    
                this.handleMovement(TICK);
    
                // Apply vertical acceleration due to gravity
                this.vy += this.FALL_ACC * TICK;
    
                if (this.keys.up) {
                    if (Math.abs(this.vx) < 16) {
                        this.vy = -240;
                        this.FALL_ACC = this.STOP_FALL;
                    } else if (Math.abs(this.vx) < 40) {
                        this.vy = -240;
                        this.FALL_ACC = this.WALK_FALL;
                    } else {
                        this.vy = -300;
                        this.FALL_ACC = this.RUN_FALL;
                    }

                    this.currentAnimation = 'jump';
                    this.grounded = false;
                }
            } else {
                if (this.vy < 0 && this.keys.up) {
                    if (this.FALL_ACC == this.STOP_FALL) {
                        this.vy -= (this.STOP_FALL - this.STOP_FALL_A) * TICK;
                    }
                    if (this.FALL_ACC == this.WALK_FALL) {
                        this.vy -= (this.WALK_FALL - this.WALK_FALL_A) * TICK;
                    }
                    if (this.FALL_ACC == this.RUN_FALL) {
                        this.vy -= (this.RUN_FALL - this.RUN_FALL_A) * TICK;
                    }
                }
                this.vy += this.FALL_ACC * TICK;

                if (this.keys.right && !this.keys.left) {
                    if (Math.abs(this.vx) > this.MAX_WALK) {
                        this.vx += this.ACC_RUN * TICK
                    } else {
                        this.vx += this.ACC_WALK * TICK
                    }
                } else if (this.keys.left && !this.keys.right) {
                    if (Math.abs(this.vx) > this.MAX_WALK) {
                        this.vx -= this.ACC_RUN * TICK
                    } else {
                        this.vx -= this.ACC_WALK * TICK
                    }
                }
            }
    
            this.clampVelocity();
    
            this.checkCollision(); // Check for collisions after velocity updates
    
            // Update position
            this.x += this.vx * TICK * 2;
            this.y += this.vy * TICK * 2;
    
            this.animate(deltaTime);
        } else {
            this.vy += this.STOP_FALL_A * TICK;
            this.y += this.vy * TICK * 2;
        }
    }
    
    processInput() {
        let vision = this.playerVision().flat();
    
        // The min value in the player vision array is 0, representing air.
        // The current max value in the player vision array is 4, representing an enemy 
        const minValue = 0;
        const maxValue = 4;
    
        // Normalize vision array
        for (let i = 0; i < vision.length; i++) {
            if (vision[i] < minValue || vision[i] > maxValue) {
                vision[i] = Math.max(minValue, Math.min(maxValue, vision[i]));
            }
            vision[i] = ((vision[i] - minValue) / (maxValue - minValue)) * 2 - 1;
        }
    
        const normalizedVx = 2 * ((this.vx - this.MIN_VX) / (this.MAX_VX - this.MIN_VX)) - 1;
        const normalizedVy = 2 * ((this.vy - this.MIN_VY) / (this.MAX_VY - this.MIN_VY)) - 1;
    
        const clampedNormalizedVx = Math.max(-1, Math.min(1, normalizedVx));
        const clampedNormalizedVy = Math.max(-1, Math.min(1, normalizedVy));
    
        let normalizedX = (this.x / (tileWidth * map[0].length)) * 2 - 1;
        let normalizedY = (this.y / (tileHeight * map.length)) * 2 - 1;
    
        normalizedX = Math.max(-1, Math.min(1, normalizedX));
        normalizedY = Math.max(-1, Math.min(1, normalizedY));
    
        const maxTime = 400; // Example maximum time in seconds
        const normalizedTimeAlive = Math.max(-1, Math.min(1, (this.lifespan / maxTime) * 2 - 1));

        const normalizedDistance = (this.distance / 50) - 1;

        // Construct inputs array
        const inputs = [
            clampedNormalizedVx,       // Player x speed
            clampedNormalizedVy,       // Player y speed
            normalizedX,               // Player x position
            normalizedY,               // Player y position
            normalizedDistance,   // Distance to level end
            normalizedTimeAlive,
            ...vision,                 // 15x15 grid of blocks around the player
        ];
    
        // Feed the inputs to the neural network
        const outputs = this.neuralNetwork.feedforward(inputs);
        this.keys.left = outputs[0] > 0;  // Action if output is positive
        this.keys.right = outputs[1] > 0; // Action if output is positive
        this.keys.up = outputs[2] > 0;    // Action if output is positive

        // If the fourth output is positive, deactivate all actions
        if (outputs[3] > 0) {
            this.keys.left = false;
            this.keys.right = false;
            this.keys.up = false;
        }
    }
    
    
    handleMovement(TICK) {
        if (Math.abs(this.vx) < this.MIN_WALK) {
            this.vx = 0;
            this.currentAnimation = 'idle';
        
            if (this.keys.left) {
                this.vx -= this.MIN_WALK;
                this.facing = 'left';
            }
            if (this.keys.right) {
                this.vx += this.MIN_WALK;
                this.facing = 'right';
            }
        } else {
            if (this.facing === 'right') {
                if (this.keys.right) {
                    if (this.keys.b) {
                        this.vx += this.ACC_RUN * TICK;
                    } else {
                        this.vx += this.ACC_WALK * TICK;
                    }
                } else if (this.keys.left) {
                    this.vx -= this.DEC_SKID * TICK;
                    this.currentAnimation = 'skid';
        
                    if (this.vx <= 0) {
                        this.vx = 0;
                        this.facing = 'left'; 
                    }
                } else {
                    this.vx -= this.DEC_REL * TICK;
                    if (this.vx < 0) {
                        this.vx = 0;
                    }
                }
            } else if (this.facing === 'left') {
                if (this.keys.left) {
                    if (this.keys.b) {
                        this.vx -= this.ACC_RUN * TICK;
                    } else {
                        this.vx -= this.ACC_WALK * TICK;
                    }
                } else if (this.keys.right) {
                    this.vx += this.DEC_SKID * TICK;
                    this.currentAnimation = 'skid';
        
                    if (this.vx >= 0) {
                        this.vx = 0;
                        this.facing = 'right'; 
                    }
                } else {
                    this.vx += this.DEC_REL * TICK;
                    if (this.vx > 0) {
                        this.vx = 0; 
                    }
                }
            }
        }
    }
    
    
    clampVelocity() {
        if (this.vy >= this.MAX_FALL) this.vy = this.MAX_FALL;
        if (this.vy <= -this.MAX_FALL) this.vy = -this.MAX_FALL;
        if (this.vx >= this.MAX_RUN) this.vx = this.MAX_RUN;
        if (this.vx <= -this.MAX_RUN) this.vx = -this.MAX_RUN;
    
        // Ensure the player does not exceed walking speed when not running
        if (this.vx >= this.MAX_WALK && !this.keys.b) this.vx = this.MAX_WALK;
        if (this.vx <= -this.MAX_WALK && !this.keys.b) this.vx = -this.MAX_WALK;
    }
    

    checkCollision() {
        const playerBottom = this.y + this.height;
        const playerLeft = this.x;
        const playerRight = this.x + this.width;
        const playerTop = this.y;
    
        let collidedVertically = false;
        let verticalTolerance = 5;
    
        // Check if player is below the canvas, if so, mark as dead
        if (playerBottom >= canvas.height) {
            this.isDead = true;
        }
    
        const checkRadius = 2; // Number of blocks to check in each direction
    
        // Calculate the block indices around the player
        const playerBlockX = Math.floor(playerLeft / tileWidth);
        const playerBlockY = Math.floor(playerTop / tileHeight);
    
        // Define the range of blocks to check
        const startRow = Math.max(0, playerBlockY - checkRadius);
        const endRow = Math.min(blocks.length - 1, playerBlockY + checkRadius);
        const startCol = Math.max(0, playerBlockX - checkRadius);
        const endCol = Math.min(blocks[0].length - 1, playerBlockX + checkRadius);
    
        // Only check blocks near the player
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const block = blocks[row][col];
                if (block && block.solid) {
                    const { left, right, top, bottom } = block.getBoundingBox();
    
                    // Check for horizontal collision
                    const horizontalCollision = playerRight > left && playerLeft < right;
                    // Check for vertical collision
                    const verticalCollision = playerBottom > top && playerTop < bottom;
    
                    if (horizontalCollision && verticalCollision) {
                        // Vertical collision resolution
                        if (playerBottom <= top + verticalTolerance && this.vy > 0) {
                            // Landing on top of a block
                            this.y = top - this.height;
                            this.grounded = true;
                            this.vy = 0;
                            collidedVertically = true;
                        } else if (playerTop >= bottom - verticalTolerance && this.vy < 0) {
                            // Only move bricks and secret
                            if (block.index == 2 || block.index == 3) {
                                if (block instanceof MysteryBlock) {
                                    if (!block.complete) {
                                        this.mysteryBlock += 1;
                                        block.empty = true;
                                        block.moveUp();
                                    }
                                } else {
                                    block.moveUp();
                                }
                            }
    
                            // Jumping from below
                            this.y = bottom + verticalTolerance;
                            this.vy = 0;
                            collidedVertically = true;
                        }
    
                        if (!collidedVertically) {
                            if (this.vx > 0) {
                                this.x = left - this.width;
                                this.vx = 0;
                            } else if (this.vx < 0) {
                                this.x = right; // Move player right to resolve collision
                                this.vx = 0;
                            }
                        }
                    }
                }
            }
        }
    
        // If no vertical collision was detected, the player is not grounded
        if (!collidedVertically) {
            this.grounded = false;
        }
    }
    
    playerVision() {
        const playerTileRow = Math.floor(this.y / tileHeight);
        const playerTileCol = Math.floor(this.x / tileWidth);
    
        const gridSize = 15;
        const halfGridSize = Math.floor(gridSize / 2);
    
        // Fill in the player vision with null values at first
        const surroundingTiles = Array.from({ length: gridSize }, () => 
            Array.from({ length: gridSize }, () => null)
        );

        for (let rowOffset = -halfGridSize; rowOffset <= halfGridSize; rowOffset++) {
            for (let colOffset = -halfGridSize; colOffset <= halfGridSize; colOffset++) {
                const row = playerTileRow + rowOffset;
                const col = playerTileCol + colOffset;
    
                if (row >= 0 && row < blocks.length && col >= 0 && col < blocks[row].length) {
                    let block = blocks[row][col];
                    
                    let xCoordinate = rowOffset + halfGridSize;
                    let yCoordinate = colOffset + halfGridSize;

                    if (block) {
                        if (block instanceof MysteryBlock && !block.complete) {
                            surroundingTiles[xCoordinate][yCoordinate] = constants.mysteryBlock;
                        } else {
                            surroundingTiles[xCoordinate][yCoordinate] = block.solid ? constants.solid : constants.empty;
                        }
    
                        if (block.solid && block.height > tileHeight) {
                            // Set the full size of blocks like pipes, because the pipe image's dimensions is e.g 32x64
                            // so it would only draw one 32x32 square, but my setting the newWidth and newHeight it
                            // will draw the entire pipe

                            const newHeight = Math.ceil(block.height / tileHeight); 
                            const newWidth = Math.ceil(block.width / tileWidth);   
    
                            for (let x = 0; x < newWidth; x++) {
                                for (let y = 0; y < newHeight; y++) {
                                    const newRow = rowOffset + y; 
                                    const newCol = colOffset + x; 
    
                                    const surroundingRow = newRow + halfGridSize;
                                    const surroundingCol = newCol + halfGridSize;
    
                                    if (surroundingRow >= 0 && surroundingRow < gridSize &&
                                        surroundingCol >= 0 && surroundingCol < gridSize) {
                                        surroundingTiles[surroundingRow][surroundingCol] = constants.solid;
                                    }
                                }
                            }
                        }
                    }

                    // Set player position
                    if (playerTileRow == row && playerTileCol == col) {
                        surroundingTiles[xCoordinate][yCoordinate] = constants.player;
                    }
                }
            }
        }

        // Add enemies to surroundingTiles
        enemies.forEach((enemy, index) => {
            const enemyTileRow = Math.floor(enemy.y / tileHeight);
            const enemyTileCol = Math.floor(enemy.x / tileWidth);

            const enemyRowOffset = enemyTileRow - playerTileRow;
            const enemyColOffset = enemyTileCol - playerTileCol;

            const surroundingRow = enemyRowOffset + halfGridSize;
            const surroundingCol = enemyColOffset + halfGridSize;

            // Ensure enemy coordinates are within bounds
            if (surroundingRow >= 0 && surroundingRow < gridSize &&
                surroundingCol >= 0 && surroundingCol < gridSize) {
                surroundingTiles[surroundingRow][surroundingCol] = constants.enemy;
            }
        });
    
        return surroundingTiles;
    }
     
    
    drawVision(ctx, tiles) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
        for (let row = 0; row < tiles.length; row++) {
            for (let col = 0; col < tiles[row].length; col++) {
                const blockId = tiles[row][col];
    
                if (blockId === constants.player) {
                    ctx.fillStyle = 'blue';
                } else if (blockId === constants.mysteryBlock) {
                    ctx.fillStyle = 'gold';
                } else if (blockId === constants.solid) {
                    ctx.fillStyle = 'white';
                } else if (blockId === constants.enemy) {
                    ctx.fillStyle = 'red';
                } else if (blockId === constants.empty) {
                    ctx.fillStyle = 'black';
                } else {
                    ctx.fillStyle = 'black';
                }
    
                ctx.fillRect(
                    col * tileWidth / SCALE, 
                    row * tileHeight / SCALE, 
                    tileWidth / SCALE, 
                    tileHeight / SCALE
                );
            }
        }
    }
    
    dead() {
        this.currentAnimation = 'dead';
        this.keys.right = false;
        this.keys.left = false;
        
        this.vy = -150

        if (!this.deadTimer) {
            this.deadTimer = setTimeout(() => {
                this.isDead = true;
            }, 2000);
        }
    }
}