const { minify } = require('terser');
const fs = require('fs');
const path = require('path');

async function minifyFile(inputPath, outputPath) {
  try {
    const code = fs.readFileSync(inputPath, 'utf8');
    const result = await minify(code, {
      compress: true,
      mangle: true,
      format: {
        comments: false,
      },
    });

    if (result.error) {
      console.error('Error minifying:', result.error);
      return;
    }

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, result.code);
    console.log(`Minified: ${inputPath} -> ${outputPath}`);
  } catch (error) {
    console.error('Error processing file:', error);
  }
}

// Minify all JS files in the out directory
const outDir = path.join(__dirname, 'out');
const jsFiles = fs.readdirSync(outDir)
  .filter(file => file.endsWith('.js'))
  .map(file => path.join(outDir, file));

jsFiles.forEach(file => {
  const outputPath = file.replace('.js', '.min.js');
  minifyFile(file, outputPath);
}); 