const sharp = require("sharp");

async function compress(input, webp, grayscale, quality, originSize) {
  quality = Math.max(5, Math.min(95, parseInt(quality, 10) || 40));
	
	// Create pipeline with explicit libvips-friendly options
  let pipeline = sharp(input, {
    failOnError: false,
    limitInputPixels: 268435456,   // ~16k x 16k safety
    sequentialRead: true,          // Better for large images / streaming
  });

  if (grayscale) pipeline = pipeline.grayscale();

  const options = webp
    ? {
        quality,
        effort: 4,                 // 0-6 (higher = smaller but slower)
        smartSubsample: true,
        nearLossless: false,
      }
    : {
        quality,
        mozjpeg: true,
        progressive: true,
        optimizeScans: true,
        trellisQuantisation: true,
        overshootDeringing: true,
      };

  try {
    const { data: output, info } = await pipeline
      .toFormat(format, options)
      .toBuffer({ resolveWithObject: true });

    return {
      err: null,
      headers: {
        "content-type": `image/${format}`,
        "content-length": info.size,
        "x-original-size": originSize,
        "x-bytes-saved": originSize - info.size,
        "x-compressed-width": info.width,
        "x-compressed-height": info.height,
      },
      output,
    };
  } catch (err) {
    console.error("Sharp / libvips error:", err.message);
    return { err };
  }
}

module.exports = compress;
