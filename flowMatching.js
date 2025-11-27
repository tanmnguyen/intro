/**
 * Flow Matching Algorithm Implementation
 * 
 * Complete bijective N-to-N pixel matching - one-to-one correspondence
 * Each source pixel maps to exactly one unique destination pixel
 */

class FlowMatching {
    constructor(sourceImageData, destImageData) {
        this.sourceImageData = sourceImageData;
        this.destImageData = destImageData;
        this.width = sourceImageData.width;
        this.height = sourceImageData.height;
        this.totalPixels = this.width * this.height;
        
        this.pixels = [];
        this.initializePixels();
    }

    /**
     * Initialize ALL pixels with bijective (one-to-one) matching
     */
    initializePixels() {
        const sourceData = this.sourceImageData.data;
        const destData = this.destImageData.data;
        
        console.log(`Initializing bijective matching for ${this.totalPixels} pixels...`);
        
        // Create arrays of all source and destination pixels
        const sourcePixels = [];
        const destPixels = [];
        
        // Collect all source pixels
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const idx = (y * this.width + x) * 4;
                sourcePixels.push({
                    x: x,
                    y: y,
                    r: sourceData[idx],
                    g: sourceData[idx + 1],
                    b: sourceData[idx + 2],
                    a: sourceData[idx + 3]
                });
            }
        }
        
        // Collect all destination pixels
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const idx = (y * this.width + x) * 4;
                destPixels.push({
                    x: x,
                    y: y,
                    r: destData[idx],
                    g: destData[idx + 1],
                    b: destData[idx + 2],
                    used: false  // Track if this destination is already assigned
                });
            }
        }
        
        // Perform bijective matching
        console.log('Performing one-to-one pixel matching...');
        this.matchBijective(sourcePixels, destPixels);
        
        console.log(`Complete! ${this.pixels.length} pixels matched (bijective mapping).`);
        
        // Validate the matching
        this.validateMatching(sourcePixels, destPixels);
    }

    /**
     * Create bijective matching ensuring each destination is used exactly once
     * Uses greedy algorithm with backtracking prevention
     */
    matchBijective(sourcePixels, destPixels) {
        // Create a shuffled list of source pixels to avoid spatial bias
        const shuffledSources = [...sourcePixels];
        this.shuffleArray(shuffledSources);
        
        // Track available destination pixels
        const availableDest = [...destPixels];
        
        for (let i = 0; i < shuffledSources.length; i++) {
            const srcPixel = shuffledSources[i];
            
            if (availableDest.length === 0) {
                console.error('No more available destinations!');
                break;
            }
            
            // Find best matching available destination pixel
            let bestMatchIdx = 0;
            let bestScore = Infinity;
            
            // Only search through available (unused) destination pixels
            for (let j = 0; j < availableDest.length; j++) {
                const destPixel = availableDest[j];
                
                // Calculate color difference (Euclidean distance in RGB space)
                const colorDist = Math.sqrt(
                    Math.pow(srcPixel.r - destPixel.r, 2) +
                    Math.pow(srcPixel.g - destPixel.g, 2) +
                    Math.pow(srcPixel.b - destPixel.b, 2)
                );
                
                // Calculate spatial distance
                const spatialDist = Math.sqrt(
                    Math.pow(srcPixel.x - destPixel.x, 2) +
                    Math.pow(srcPixel.y - destPixel.y, 2)
                );
                
                // Combined score (prioritize color matching)
                const score = colorDist * 0.7 + spatialDist * 0.3;
                
                if (score < bestScore) {
                    bestScore = score;
                    bestMatchIdx = j;
                }
            }
            
            // Get the best match and remove it from available pool
            const bestMatch = availableDest[bestMatchIdx];
            availableDest.splice(bestMatchIdx, 1);
            
            // Store the matched pixel pair
            // Note: We keep source colors constant, only positions change
            this.pixels.push({
                sourceX: srcPixel.x,
                sourceY: srcPixel.y,
                currentX: srcPixel.x,
                currentY: srcPixel.y,
                destX: bestMatch.x,
                destY: bestMatch.y,
                // Color stays constant (source color only)
                r: srcPixel.r,
                g: srcPixel.g,
                b: srcPixel.b,
                a: srcPixel.a
            });
            
            // Progress logging
            if (i % 10000 === 0 && i > 0) {
                console.log(`Matched ${i}/${shuffledSources.length} pixels (${Math.round(i/shuffledSources.length*100)}%)`);
            }
        }
    }

    /**
     * Fisher-Yates shuffle algorithm
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Validate that matching is correct and complete
     */
    validateMatching(sourcePixels, destPixels) {
        console.log('Validating bijective matching...');
        
        // Check 1: Verify we have exactly the right number of matched pixels
        if (this.pixels.length !== this.totalPixels) {
            console.error(`❌ ERROR: Expected ${this.totalPixels} matched pixels, got ${this.pixels.length}`);
            return false;
        }
        console.log(`✓ Pixel count correct: ${this.pixels.length} pixels`);
        
        // Check 2: Verify all source positions are represented
        const sourcePositions = new Set();
        for (const pixel of this.pixels) {
            const key = `${pixel.sourceX},${pixel.sourceY}`;
            if (sourcePositions.has(key)) {
                console.error(`❌ ERROR: Duplicate source position: ${key}`);
                return false;
            }
            sourcePositions.add(key);
        }
        console.log(`✓ All source positions unique: ${sourcePositions.size} positions`);
        
        // Check 3: Verify all destination positions are unique (bijective)
        const destPositions = new Set();
        for (const pixel of this.pixels) {
            const key = `${pixel.destX},${pixel.destY}`;
            if (destPositions.has(key)) {
                console.error(`❌ ERROR: Duplicate destination position: ${key}`);
                return false;
            }
            destPositions.add(key);
        }
        console.log(`✓ All destination positions unique: ${destPositions.size} positions`);
        
        // Check 4: Verify all colors are from source image
        let colorMismatches = 0;
        for (const pixel of this.pixels) {
            // Find this source position in original source pixels
            const srcPixel = sourcePixels.find(sp => sp.x === pixel.sourceX && sp.y === pixel.sourceY);
            if (!srcPixel) {
                console.error(`❌ ERROR: Source position (${pixel.sourceX},${pixel.sourceY}) not found in original`);
                colorMismatches++;
            } else if (srcPixel.r !== pixel.r || srcPixel.g !== pixel.g || srcPixel.b !== pixel.b) {
                console.error(`❌ ERROR: Color mismatch at (${pixel.sourceX},${pixel.sourceY})`);
                colorMismatches++;
            }
        }
        if (colorMismatches === 0) {
            console.log(`✓ All colors match source image`);
        } else {
            console.error(`❌ Found ${colorMismatches} color mismatches`);
            return false;
        }
        
        // Check 5: Verify coverage - all positions in image bounds are matched
        if (sourcePositions.size === this.totalPixels && destPositions.size === this.totalPixels) {
            console.log(`✓ Complete coverage: ${this.totalPixels} source → ${this.totalPixels} destination`);
        } else {
            console.error(`❌ Coverage incomplete`);
            return false;
        }
        
        console.log('✅ Validation passed: Perfect bijective mapping confirmed!');
        return true;
    }

    /**
     * Interpolate pixel POSITIONS ONLY at time t (0 to 1)
     * Colors remain constant (source colors)
     * Uses smooth cubic interpolation for positions
     */
    interpolate(t) {
        // Use ease-in-out cubic function for smooth motion
        const smoothT = t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
        
        for (const pixel of this.pixels) {
            // Interpolate position only
            pixel.currentX = pixel.sourceX + (pixel.destX - pixel.sourceX) * smoothT;
            pixel.currentY = pixel.sourceY + (pixel.destY - pixel.sourceY) * smoothT;
            
            // Colors stay constant - no interpolation needed
        }
    }

    /**
     * Get current pixel states
     */
    getPixels() {
        return this.pixels;
    }

    /**
     * Reset pixels to source positions
     */
    reset() {
        for (const pixel of this.pixels) {
            pixel.currentX = pixel.sourceX;
            pixel.currentY = pixel.sourceY;
            // Colors remain constant, no need to reset
        }
    }
}
