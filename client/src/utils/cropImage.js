const OUTPUT_SIZE = 512;
const OUTPUT_TYPE = "image/jpeg";
const OUTPUT_QUALITY = 0.9;

/**
 * Creates a cropped square image blob from the selected crop area.
 *
 * @param {string} imageSrc - Source URL or data URL of the image.
 * @param {{ x: number, y: number, width: number, height: number }} croppedAreaPixels
 * @returns {Promise<Blob>}
 */
export default async function getCroppedImg(
  imageSrc,
  croppedAreaPixels
) {
  if (!imageSrc) {
    throw new Error("Image source is required.");
  }

  if (
    !croppedAreaPixels ||
    croppedAreaPixels.width <= 0 ||
    croppedAreaPixels.height <= 0
  ) {
    throw new Error("Invalid crop area.");
  }

  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to create canvas context.");
  }

  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  context.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE
  );

  return canvasToBlob(
    canvas,
    OUTPUT_TYPE,
    OUTPUT_QUALITY
  );
}

/**
 * Loads an image from a URL or data URL.
 *
 * @param {string} source
 * @returns {Promise<HTMLImageElement>}
 */
function createImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.crossOrigin = "anonymous";
    image.decoding = "async";

    image.onload = () => resolve(image);

    image.onerror = () => {
      reject(
        new Error("Failed to load image.")
      );
    };

    image.src = source;
  });
}

/**
 * Converts a canvas into an image blob.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {string} type
 * @param {number} quality
 * @returns {Promise<Blob>}
 */
function canvasToBlob(
  canvas,
  type,
  quality
) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(
            new Error(
              "Failed to generate cropped image."
            )
          );

          return;
        }

        resolve(blob);
      },
      type,
      quality
    );
  });
}