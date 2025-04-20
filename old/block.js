class Block {
    constructor(x, y, width, height, image, index, solid = false) {
        this.x = x;
        this.y = y;
        this.image = image;

        this.width = width;
        this.height = height;
        
        this.solid = solid;
        this.index = index;

        // Store the original position
        this.originalY = y;

        // Animation state
        this.movingUp = false;
        this.movingDown = false;
        this.moveUpAmount = 0;  
        this.maxMoveUp = 10;    
        this.moveSpeed = 1;    
    }

    setImage(image) {
        this.image = image;
    }

    // Method to draw the block on the canvas   
    draw(ctx, camera) {
        ctx.drawImage(
            this.image,
            this.x - camera.x,
            this.y,
            this.width,
            this.height
        );
    }

    // Method to get the bounding box of the block
    getBoundingBox() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height,
        };
    }

    drawBoundingBox(ctx, camera) {
        if (this.solid) {
            const { left, right, top, bottom } = this.getBoundingBox();
        
            // Adjusting the bounding box for the camera
            const adjustedLeft = left - camera.x;
            const adjustedTop = top;
            const adjustedWidth = right - left;
            const adjustedHeight = bottom - top;

            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(adjustedLeft, adjustedTop, adjustedWidth - 2, adjustedHeight - 2); // Draw the rectangle
        }
    }

    // Method to move the block upwards
    moveUp() {
        if (!this.movingUp && !this.movingDown) {
            this.movingUp = true;
            this.moveUpAmount = 0;
        }
    }

    // Method to update the block's position if it's moving
    update() {
        if (this.movingUp) {
            // Move the block up until it reaches the max height
            if (this.moveUpAmount < this.maxMoveUp) {
                this.y -= this.moveSpeed;
                this.moveUpAmount += this.moveSpeed;
            } else {
                // Start moving down when max height is reached
                this.movingUp = false;
                this.movingDown = true;
            }
        }

        if (this.movingDown) {
            // Move the block back down to its original position
            if (this.moveUpAmount > 0) {
                this.y += this.moveSpeed;
                this.moveUpAmount -= this.moveSpeed;
            } else {
                // Reset the block to its original position and stop moving
                this.y = this.originalY;
                this.movingDown = false;
            }
        }
    }
}