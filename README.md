# Flow Matching Pixel Visualization

A modern, interactive web application that visualizes pixel transport between images using flow matching algorithms. Watch as pixels smoothly flow from a source image to a destination image using optimal transport principles.

![Flow Matching Demo](https://img.shields.io/badge/Demo-Live-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🌟 Features

- **Auto-Play Mode**: Automatically loads and continuously animates on page load
- **Modern UI**: Sleek black background with gradient accents and smooth animations
- **Random Image Loading**: Fetches random images from the internet (different pair on each refresh)
- **Session Persistence**: Same image pair stays consistent until page refresh
- **Large Display**: 256x256 pixel images for detailed visualization
- **Complete N-to-N Matching**: Every pixel in source matches to destination (65,536 pixels)
- **Pure Rearrangement**: Source pixels keep their original colors, only positions change
- **Flow Matching Algorithm**: Implements optimal transport-based pixel matching
- **RGB Histograms**: Real-time color distribution visualization for each channel
- **Continuous Loop**: Animation seamlessly loops from source to destination
- **Efficient Rendering**: Uses ImageData API for fast pixel manipulation
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Live Demo

Visit the live demo: [Your GitHub Pages URL]

## 📋 How It Works

### Flow Matching Algorithm

The application uses a flow matching algorithm based on optimal transport theory to create smooth interpolations between two images:

1. **Bijective Pixel Matching**: One-to-one correspondence - each of the 65,536 source pixels maps to a unique destination pixel location
2. **No Collisions**: Each destination location receives exactly one pixel (no overlaps or gaps)
3. **Optimal Matching**: Uses greedy algorithm to match pixels based on:
   - Color similarity (70% weight): Minimizes color distance in RGB space
   - Spatial proximity (30% weight): Maintains structural coherence
3. **Position-Only Flow**: Pixels move positions but keep their original source colors
4. **Flow Interpolation**: Uses cubic easing function (ease-in-out) for smooth position transitions
5. **Efficient Rendering**: Uses ImageData API to render all pixels in a single operation per frame

### Technical Implementation

- **Pure JavaScript**: No external dependencies required
- **Canvas API**: Hardware-accelerated rendering
- **CORS-enabled**: Uses Lorem Picsum API for random images
- **Modular Architecture**: Separated concerns (algorithm, UI, rendering)

## 🏗️ Project Structure

```
intro/
├── index.html          # Main HTML structure
├── styles.css          # Modern styling with black theme
├── flowMatching.js     # Flow matching algorithm implementation
├── script.js           # Application logic and UI handlers
└── README.md          # Documentation
```

## 🛠️ Installation & Usage

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/intro.git
cd intro
```

2. Open `index.html` in your web browser:
```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

Or use a local server (recommended):
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server
```

Then navigate to `http://localhost:8000`

### GitHub Pages Deployment

1. **Create a new repository** on GitHub

2. **Push your code**:
```bash
git init
git add .
git commit -m "Initial commit: Flow matching visualization"
git branch -M main
git remote add origin https://github.com/yourusername/intro.git
git push -u origin main
```

3. **Enable GitHub Pages**:
   - Go to your repository settings
   - Scroll to "Pages" section
   - Under "Source", select "Deploy from a branch"
   - Select branch: `main` and folder: `/ (root)`
   - Click "Save"

4. **Access your site**:
   - Your site will be available at: `https://yourusername.github.io/intro/`
   - It may take a few minutes for the first deployment

## 🎮 Usage Instructions

The animation runs automatically when you open the page:

1. **Open the page**: The animation starts immediately upon loading
2. **Watch the flow**: Particles continuously flow from source to destination and loop back
3. **Refresh for new images**: Reload the page to get a different random image pair
4. **Same session**: During a single session (without refresh), the same image pair is used

That's it! No buttons or controls needed - just sit back and enjoy the visualization.

## 🔧 Configuration

You can customize the application by modifying constants in `script.js`:

```javascript
// Change image size (affects total pixels: SIZE x SIZE)
const IMAGE_SIZE = 256; // Default: 256x256 = 65,536 pixels

// Change animation speed (higher = faster)
const ANIMATION_SPEED = 1; // Default: 1 (slower for better visualization)

// Note: All pixels are matched (N-to-N), no sampling
```

### In `flowMatching.js`:
```javascript
// Adjust color vs spatial weight in matching
const COLOR_WEIGHT = 0.7;  // Higher = prioritize color matching
const SPATIAL_WEIGHT = 0.3; // Higher = maintain spatial structure

// Change interpolation function (line 117)
// Options: linear, quadratic, cubic, etc.
```

## 🎨 Customization

### Change Color Theme

Edit `styles.css` to customize the color scheme:
```css
/* Primary gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Secondary gradient */
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
```

### Use Different Image Sources

Replace Lorem Picsum with another API in `script.js`:
```javascript
function getRandomImageUrl(size, seed) {
    // Example: Unsplash Source
    return `https://source.unsplash.com/random/${size}x${size}`;
    
    // Example: Placeholder.com
    return `https://via.placeholder.com/${size}`;
}
```

## 📊 Algorithm Details

### Optimal Transport Approximation

The flow matching algorithm approximates optimal transport using:

1. **Importance Sampling**: 
   - Samples source pixels with probability ∝ brightness
   - Ensures important features are well-represented

2. **Greedy Color Matching**:
   - For each source particle, finds best destination match
   - Combines color similarity (Euclidean distance in RGB) with spatial proximity
   - Adds randomization by selecting from top-50 candidates

3. **Smooth Interpolation**:
   - Uses cubic easing: `f(t) = 3t² - 2t³`
   - Provides smooth acceleration and deceleration
   - Interpolates both position and color simultaneously

### Computational Complexity

- **Initialization**: O(N²) where N = W×H (total pixels) for bijective matching
- **Matching**: Greedy algorithm ensures each destination used exactly once
- **Per Frame**: O(N) for interpolation and rendering using ImageData API

For 256×256 images: 65,536 pixels with bijective (one-to-one) mapping. Initial matching takes ~3-5 seconds, then smooth 60fps animation.

## 🤝 Contributing

Contributions are welcome! Here are some ideas:

- Implement true optimal transport (Sinkhorn algorithm)
- Add support for custom image uploads
- Create preset animation effects
- Implement bidirectional flow
- Add particle trails for motion blur
- Support for video/GIF export

## 📝 License

MIT License - feel free to use this project for any purpose.

## 🙏 Acknowledgments

- **Lorem Picsum** for providing free random images API
- **Flow Matching** concept inspired by continuous normalizing flows research
- **Optimal Transport** theory for the mathematical foundation

## 📧 Contact

For questions or suggestions, please open an issue on GitHub.

---

**Built with ❤️ using vanilla JavaScript and Canvas API**
