class MysteryBlock extends Block {
    constructor(x, y, width, height, image, index, solid = true) {
        super(x, y, width, height, image, index, solid);
        
        this.image = image;
        this.currentFrame = 0;
        this.frameDuration = 250; // Duration for block animation
        this.frameTime = 0;
        this.empty = false;
        this.points = 200;

        this.animations = {
            'cycle': this.loadFrames('Sprites/MysteryBlock', 3),
            'empty': this.loadFrames('Sprites/EmptyBlock', 1),
        };

        this.imgCoin = new Image();
        this.imgCoin.src = 'Sprites/Coin.png';

        this.coinAnimations = {
            'cycle': this.loadFrames('Sprites/Coin', 4), // Assuming these are coin frames
        };

        this.coinY = 0;
        this.coinAnimationTime = 0;
        this.coinAnimationDuration = 500; // Duration for going up and down
        this.isAnimatingCoin = false;
        this.complete = false;
        
        this.coinFrameTime = 0; // Time tracker for coin frame animation
        this.coinFrameDuration = 100; // Faster frame change for the coin (can be adjusted)
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

        // Handle the block's main animation
        const animation = this.animations['cycle'];
        if (animation.length > 1 && this.frameTime >= this.frameDuration) { 
            this.currentFrame = (this.currentFrame + 1) % animation.length; 
            this.frameTime = 0; 
        }

        // Handle the coin animation if it is triggered
        if (this.isAnimatingCoin) {
            this.coinAnimationTime += deltaTime;

            // Calculate the progress of the animation (0 to 1)
            const progress = Math.min(this.coinAnimationTime / this.coinAnimationDuration, 1);
            const heightOffset = Math.sin(progress * Math.PI) * 100; // Adjust height as needed

            // Update coin's vertical position
            this.coinY = -heightOffset;

            // Reset the animation when complete
            if (progress >= 1) {
                this.isAnimatingCoin = false; // Stop animating
                this.coinY = 0; // Reset position
                this.complete = true;
            } else {
                // Update coin frame for spinning effect
                this.coinFrameTime += deltaTime;
                if (this.coinFrameTime >= this.coinFrameDuration) {
                    this.currentFrame = (this.currentFrame + 1) % this.coinAnimations['cycle'].length; // Change to the next coin frame
                    this.coinFrameTime = 0; // Reset frame timer
                }
            }
        }
    }

    draw(ctx, camera) {
        // Draw the block
        if (this.empty) {
            super.setImage(this.animations['empty'][0]);
            if (!this.isAnimatingCoin) {
                this.isAnimatingCoin = true; // Start the coin animation
            }
        } else {
            super.setImage(this.animations['cycle'][this.currentFrame]);
        }

        super.draw(ctx, camera);

        // Draw the coin if it's empty and animating
        if (this.empty && this.isAnimatingCoin && !this.complete) {
            const coinX = this.x + (this.width - this.imgCoin.naturalWidth * SCALE) / 2 - camera.x; // Center the coin horizontally
            const coinY = this.y + this.coinY; // Use the animated Y position
            ctx.drawImage(this.coinAnimations['cycle'][this.currentFrame], coinX, coinY, this.imgCoin.naturalWidth * SCALE, this.imgCoin.naturalHeight * SCALE);
        }
    }
}
