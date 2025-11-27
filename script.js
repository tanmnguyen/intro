/**
 * Main Application Script - Auto-play Flow Matching Animation
 * Automatically loads images and continuously loops the animation
 */

// Canvas elements
const sourceCanvas = document.getElementById('sourceCanvas');
const destCanvas = document.getElementById('destCanvas');
const animationCanvas = document.getElementById('animationCanvas');

const sourceCtx = sourceCanvas.getContext('2d');
const destCtx = destCanvas.getContext('2d');
const animationCtx = animationCanvas.getContext('2d');

// Histogram canvas elements
const sourceHistogram = document.getElementById('sourceHistogram');
const destHistogram = document.getElementById('destHistogram');
const animationHistogram = document.getElementById('animationHistogram');

const sourceHistCtx = sourceHistogram.getContext('2d');
const destHistCtx = destHistogram.getContext('2d');
const animationHistCtx = animationHistogram.getContext('2d');

// UI elements
const loadingIndicator = document.getElementById('loadingIndicator');
const mainElement = document.querySelector('main');

// Configuration
const IMAGE_SIZE = 256; // Image size (256x256 = 65,536 pixels)
const ANIMATION_SPEED = 1; // Speed multiplier (lower = slower, default was 3)

// State
let sourceImageData = null;
let destImageData = null;
let flowMatching = null;
let animationFrameId = null;
let isAnimating = false;
let currentTime = 0;

// Generate consistent random seeds for this session
const sessionSeed1 = Math.floor(Math.random() * 10000);
const sessionSeed2 = Math.floor(Math.random() * 10000);

/**
 * Get image URL with session-specific seed
 * Using Picsum with cache-busting to ensure CORS works properly
 */
function getImageUrl(size, seed) {
    // Add timestamp to prevent caching issues and ensure fresh images
    return `https://picsum.photos/${size}/${size}?random=${seed}&t=${Date.now()}`;
}

/**
 * Load and resize an image to NxN square
 */
async function loadAndResizeImage(url, size) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        // Set crossOrigin before src to ensure CORS is properly handled
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            console.log('Image loaded successfully:', url);
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = size;
            tempCanvas.height = size;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Draw and resize image
            tempCtx.drawImage(img, 0, 0, size, size);
            
            // Get image data
            const imageData = tempCtx.getImageData(0, 0, size, size);
            resolve(imageData);
        };
        
        img.onerror = (error) => {
            console.error('Image load error:', url, error);
            reject(new Error(`Failed to load image: ${url}`));
        };
        
        // Set src after crossOrigin to trigger load
        img.src = url;
    });
}

/**
 * Draw image data to canvas
 */
function drawImageData(ctx, imageData, canvasElement) {
    canvasElement.width = imageData.width;
    canvasElement.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);
}

/**
 * Load images automatically on startup
 */
async function loadImages() {
    try {
        // Show loading, hide main content
        loadingIndicator.style.display = 'flex';
        mainElement.style.display = 'none';
        
        console.log('Loading images...');
        
        const url1 = getImageUrl(IMAGE_SIZE, sessionSeed1);
        const url2 = getImageUrl(IMAGE_SIZE, sessionSeed2);
        
        // Load both images
        [sourceImageData, destImageData] = await Promise.all([
            loadAndResizeImage(url1, IMAGE_SIZE),
            loadAndResizeImage(url2, IMAGE_SIZE)
        ]);
        
        // Draw images to canvases
        drawImageData(sourceCtx, sourceImageData, sourceCanvas);
        drawImageData(destCtx, destImageData, destCanvas);
        
        // Setup animation canvas
        animationCanvas.width = IMAGE_SIZE;
        animationCanvas.height = IMAGE_SIZE;
        animationCtx.fillStyle = '#000000';
        animationCtx.fillRect(0, 0, IMAGE_SIZE, IMAGE_SIZE);
        
        // Update histograms for source and destination
        updateHistogram(sourceImageData, sourceHistogram, sourceHistCtx);
        updateHistogram(destImageData, destHistogram, destHistCtx);
        
        console.log('Images loaded successfully');
        
        // Initialize flow matching and start animation
        initializeFlowMatching();
        
        // Hide loading, show main content
        loadingIndicator.style.display = 'none';
        mainElement.style.display = 'flex';
        
        startAnimation();
        
    } catch (error) {
        console.error('Error loading images:', error);
        // Update loading message
        loadingIndicator.querySelector('p').textContent = 'Error loading images. Retrying...';
        // Retry after 2 seconds
        setTimeout(loadImages, 2000);
    }
}

/**
 * Initialize flow matching with current images
 * Matches ALL pixels (N-to-N complete matching)
 */
function initializeFlowMatching() {
    console.log('Initializing complete N-to-N pixel matching...');
    flowMatching = new FlowMatching(sourceImageData, destImageData);
    console.log('Flow matching initialized - all pixels matched!');
}

/**
 * Render current animation frame
 * Efficiently renders ALL pixels using ImageData for performance
 * Handles collisions by averaging/blending overlapping pixels
 */
function renderFrame() {
    const size = sourceImageData.width;
    
    // Create new ImageData for efficient pixel manipulation
    const imageData = animationCtx.createImageData(size, size);
    const data = imageData.data;
    
    // Initialize to black
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 0;     // R
        data[i + 1] = 0; // G
        data[i + 2] = 0; // B
        data[i + 3] = 255; // A
    }
    
    // Track pixel counts for averaging when multiple pixels land on same position
    const pixelCounts = new Uint32Array(size * size);
    
    // Get all pixels from flow matching
    const pixels = flowMatching.getPixels();
    
    // Draw each pixel at its current position with original source color
    // Use Math.round instead of Math.floor for better distribution
    let outOfBoundsCount = 0;
    for (const pixel of pixels) {
        const x = Math.round(pixel.currentX);
        const y = Math.round(pixel.currentY);
        
        // Bounds check
        if (x >= 0 && x < size && y >= 0 && y < size) {
            const idx = (y * size + x) * 4;
            const countIdx = y * size + x;
            
            // Add to existing color (for averaging multiple pixels at same position)
            data[idx] += pixel.r;
            data[idx + 1] += pixel.g;
            data[idx + 2] += pixel.b;
            pixelCounts[countIdx]++;
        } else {
            outOfBoundsCount++;
        }
    }
    
    // Average colors where multiple pixels collided
    for (let i = 0; i < size * size; i++) {
        if (pixelCounts[i] > 1) {
            const idx = i * 4;
            data[idx] = Math.round(data[idx] / pixelCounts[i]);
            data[idx + 1] = Math.round(data[idx + 1] / pixelCounts[i]);
            data[idx + 2] = Math.round(data[idx + 2] / pixelCounts[i]);
        }
    }
    
    // Draw the complete image data to canvas (much faster than individual fillRect calls)
    animationCtx.putImageData(imageData, 0, 0);
    
    // Update animation histogram
    updateHistogram(imageData, animationHistogram, animationHistCtx);
    
    // Verify rendering (only log on first frame and at completion)
    if (currentTime === 0 || currentTime >= 1.0) {
        verifyRendering(pixels, pixelCounts, size, outOfBoundsCount);
    }
}

/**
 * Verify that all pixels are being rendered correctly
 */
function verifyRendering(pixels, pixelCounts, size, outOfBoundsCount) {
    const totalPixels = size * size;
    
    // Count how many pixels were rendered
    let renderedPositions = 0;
    let emptyPositions = 0;
    let collisionCount = 0;
    
    for (let i = 0; i < totalPixels; i++) {
        if (pixelCounts[i] > 0) {
            renderedPositions++;
            if (pixelCounts[i] > 1) {
                collisionCount++;
            }
        } else {
            emptyPositions++;
        }
    }
    
    console.log(`\n📊 Rendering Statistics (t=${currentTime.toFixed(2)}):`);
    console.log(`  Total pixels: ${totalPixels}`);
    console.log(`  Rendered positions: ${renderedPositions} (${(renderedPositions/totalPixels*100).toFixed(1)}%)`);
    console.log(`  Empty positions: ${emptyPositions} (${(emptyPositions/totalPixels*100).toFixed(1)}%)`);
    console.log(`  Collision positions: ${collisionCount} (${(collisionCount/totalPixels*100).toFixed(1)}%)`);
    console.log(`  Out of bounds: ${outOfBoundsCount}`);
    
    if (emptyPositions > 0) {
        console.warn(`⚠️  ${emptyPositions} empty positions (black pixels) due to rounding during animation`);
    }
    
    if (currentTime === 0 || Math.abs(currentTime - 1.0) < 0.01) {
        if (emptyPositions === 0 && outOfBoundsCount === 0 && collisionCount === 0) {
            console.log(`✅ Perfect rendering: All ${totalPixels} pixels accounted for with no gaps!`);
        } else if (emptyPositions === 0 && outOfBoundsCount === 0) {
            console.log(`✅ All pixels within bounds, ${collisionCount} collisions (expected at endpoints)`);
        }
    }
}

/**
 * Animation loop - continuously repeats
 */
function animate() {
    if (!isAnimating) return;
    
    // Update time based on speed
    const deltaTime = ANIMATION_SPEED / 1000;
    currentTime += deltaTime;
    
    // Loop animation when it reaches the end
    if (currentTime >= 1.0) {
        currentTime = 0; // Reset to beginning
        flowMatching.reset(); // Reset particles to source
    }
    
    // Interpolate particle positions
    flowMatching.interpolate(currentTime);
    
    // Render frame
    renderFrame();
    
    // Continue animation
    animationFrameId = requestAnimationFrame(animate);
}

/**
 * Start the flow animation
 */
function startAnimation() {
    if (isAnimating) return;
    
    isAnimating = true;
    currentTime = 0;
    animate();
    
    console.log('Animation started');
}

/**
 * Calculate RGB histogram from image data
 * Returns object with r, g, b arrays of 256 bins each
 */
function calculateHistogram(imageData) {
    const histogram = {
        r: new Array(256).fill(0),
        g: new Array(256).fill(0),
        b: new Array(256).fill(0)
    };
    
    const data = imageData.data;
    const totalPixels = imageData.width * imageData.height;
    
    // Count occurrences of each color value
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        histogram.r[r]++;
        histogram.g[g]++;
        histogram.b[b]++;
    }
    
    // Normalize to percentages
    for (let i = 0; i < 256; i++) {
        histogram.r[i] = histogram.r[i] / totalPixels;
        histogram.g[i] = histogram.g[i] / totalPixels;
        histogram.b[i] = histogram.b[i] / totalPixels;
    }
    
    return histogram;
}

/**
 * Render RGB histogram on a canvas
 * Each channel (R, G, B) is rendered in its respective color
 */
function renderHistogram(ctx, canvas, histogram) {
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas with pure black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    // Find max value for scaling
    let maxValue = 0;
    for (let i = 0; i < 256; i++) {
        maxValue = Math.max(maxValue, histogram.r[i], histogram.g[i], histogram.b[i]);
    }
    
    // Avoid division by zero
    if (maxValue === 0) maxValue = 1;
    
    const binWidth = width / 256;
    
    // Draw histograms with transparency so overlaps are visible
    // Draw in order: blue, green, red (so red is on top)
    
    // Blue channel
    ctx.fillStyle = 'rgba(0, 100, 255, 0.6)';
    for (let i = 0; i < 256; i++) {
        const barHeight = (histogram.b[i] / maxValue) * height;
        const x = i * binWidth;
        const y = height - barHeight;
        ctx.fillRect(x, y, binWidth, barHeight);
    }
    
    // Green channel
    ctx.fillStyle = 'rgba(0, 255, 0, 0.6)';
    for (let i = 0; i < 256; i++) {
        const barHeight = (histogram.g[i] / maxValue) * height;
        const x = i * binWidth;
        const y = height - barHeight;
        ctx.fillRect(x, y, binWidth, barHeight);
    }
    
    // Red channel
    ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
    for (let i = 0; i < 256; i++) {
        const barHeight = (histogram.r[i] / maxValue) * height;
        const x = i * binWidth;
        const y = height - barHeight;
        ctx.fillRect(x, y, binWidth, barHeight);
    }
}

/**
 * Update histogram for a given image data and canvas
 */
function updateHistogram(imageData, histogramCanvas, histogramCtx) {
    // Set histogram canvas size
    histogramCanvas.width = imageData.width * 2; // Make it wider for better visualization
    histogramCanvas.height = 100;
    
    // Calculate and render histogram
    const histogram = calculateHistogram(imageData);
    renderHistogram(histogramCtx, histogramCanvas, histogram);
}

/**
 * Toggle proof visibility
 */
function setupProofToggle() {
    const toggleButton = document.getElementById('toggleProof');
    const proofContent = document.getElementById('proofContent');
    
    if (toggleButton && proofContent) {
        toggleButton.addEventListener('click', () => {
            const isHidden = proofContent.classList.contains('hidden');
            
            if (isHidden) {
                proofContent.classList.remove('hidden');
                toggleButton.textContent = '📐 Hide Mathematical Proof';
            } else {
                proofContent.classList.add('hidden');
                toggleButton.textContent = '📐 Show Mathematical Proof';
                // Scroll to button smoothly
                toggleButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }
}

/**
 * Initialize application on page load
 */
window.addEventListener('load', () => {
    console.log('Flow Matching Visualization - Auto Mode');
    console.log('Loading images and starting animation...');
    loadImages();
    setupProofToggle();
});
