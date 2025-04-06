// Custom plugin to handle image assets
export default function imagePlugin() {
  return {
    name: 'image-plugin',
    generateBundle(options, bundle) {
      // Copy images to assets folder
      const fs = require('fs');
      const path = require('path');
      
      const imagesDir = path.resolve(__dirname, 'public/images');
      const assetsDir = path.resolve(__dirname, 'dist/assets');
      
      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }
      
      if (fs.existsSync(imagesDir)) {
        const images = fs.readdirSync(imagesDir);
        images.forEach(image => {
          const src = path.resolve(imagesDir, image);
          const dest = path.resolve(assetsDir, image);
          fs.copyFileSync(src, dest);
        });
      }
    }
  };
}