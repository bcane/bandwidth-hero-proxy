const MIN_COMPRESS_LENGTH = 1024;
const MIN_TRANSPARENT_COMPRESS_LENGTH = MIN_COMPRESS_LENGTH * 100;

function shouldCompress(originType, originSize, webp) {
  // Not an image or zero size → never compress
  if (!originType?.startsWith('image') || originSize <= 0) {
    return false;
  }

  // Small images: only compress if we're converting to WebP
  if (originSize < MIN_COMPRESS_LENGTH) {
    return !!webp;
  }

  // PNG/GIF transparency protection (very large threshold)
  if (!webp && (originType.endsWith('png') || originType.endsWith('gif'))) {
    return originSize >= MIN_TRANSPARENT_COMPRESS_LENGTH;
  }

  return true;
}

module.exports = shouldCompress;
