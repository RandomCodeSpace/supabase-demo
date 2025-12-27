import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = path.join(__dirname, '../public/app-icon.png');
const destDir = path.join(__dirname, '../src/assets');
const publicDir = path.join(__dirname, '../public');

// Ensure destination exists
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

const sizes = {
    'logo-xs.png': 16,
    'logo-sm.png': 32,
    'logo-md.png': 64,
    'logo-lg.png': 128,
    'logo-xl.png': 256,
    'logo-xxl.png': 512
};

async function resize() {
    console.log('Using source:', source);

    // Generate src/assets logos
    for (const [filename, width] of Object.entries(sizes)) {
        await sharp(source)
            .resize(width, width)
            .toFile(path.join(destDir, filename));
        console.log(`Generated ${filename} (${width}x${width})`);
    }

    // Generate valid favicon.ico (multi-size)
    // Note: plain png to ico requires specific settings or just use a small png
    await sharp(source)
        .resize(32, 32)
        .toFile(path.join(publicDir, 'favicon.ico'));
    console.log('Generated public/favicon.ico');

    // Update favicon.svg (optional, simplified raster embedding or just keep it)
    // For now we just ensure favicon.ico is fresh.
}

resize().catch(err => console.error(err));
