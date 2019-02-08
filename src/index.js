import { makeNoise } from './noise';
import { mutateNoise } from './mutators';
import * as presets from './presets';

const settings = presets.blobs;
const outputDimensions = [1024, 768];

const imageFiles = [
  'jelly.jpeg',
  'jelly-2.jpeg',
  'hallway.jpeg',
  'glass.jpeg',
  'range.jpeg',
  'leaf.jpeg',
  'bali.jpeg',
  'architecture.jpeg',
  // 'scream.jpg',
  // 'starry.jpg',
  // 'puppy.jpg',
  // 'cat.jpeg',
  // 'meat.jpeg',
  // 'mountains.jpg'
];


const clamp = (min, max, val) => {
  if (val < min) return min;
  if (val > max) return max;
  return val;
};


const loadImage = (uri) => new Promise(resolve => {
  var img = new Image();
  img.onload = () => {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    resolve({
      width: img.width,
      height: img.height,
      getPixel: (x, y) => {
        // The noise function can produce values outside of the 0-1 range if you give it higher amplitudes.
        // Clamping the pixel sampling here to prevent sudden black pixels.
        // An alternative is to return a transparent pixel if the value is out of range.
        const cleanX = clamp(0, img.width - 1, x);
        const cleanY = clamp(0, img.height - 1, y);
        const i = (Math.floor(cleanX) + Math.floor(cleanY) * canvas.width) * 4;
        return [
          imageData[i],
          imageData[i + 1],
          imageData[i + 2],
          imageData[i + 3],
        ];
      },
    });
  };
  img.src = uri;
});


/** Draw to every pixel on a canvas using the provided function to determine the pixel */
const drawCanvas = (canvas, getPixel) => {
  const { width, height } = canvas;
  const ctx = canvas.getContext('2d');
  const outputImage = ctx.createImageData(width, height);

  const setPixel = ([x, y], [r, g, b, a = 255]) => {
    const index = (x + y * outputImage.width) * 4;
    outputImage.data[index] = r;
    outputImage.data[index + 1] = g;
    outputImage.data[index + 2] = b;
    outputImage.data[index + 3] = a;
  };

  for (var x = 0; x < width; x++) {
    for (var y = 0; y < height; y++) {
      const pixel = getPixel(x, y);
      setPixel([x, y], pixel);
    }
  }

  ctx.putImageData(outputImage, 0, 0);
};


/** Retrieve a specific pixel from a source image using the provided noise functions */
const imageSampler = (noiseX, noiseY, image) => (x, y) => {
  return image.getPixel(noiseX(x, y) * image.width, noiseY(x, y) * image.height);
};


/** For visualizing a noise field - returns a greyscale value */
const noiseSampler = (noise) => (x, y) => {
  const value = noise(x, y) * 256;
  return [value, value, value];
};


/** Creates a noise function */
const noiseMaker = (width, height, seed, settings) => {
  const noise = makeNoise(
    width, height,
    {
      seed,
      noise: settings.noise,
    }
  );

  return mutateNoise(noise, settings.mutators);
};


const drawArt = (imageFiles, seed) => {
  const [width, height] = outputDimensions;

  const makeCanvas = (id) => {
    const container = document.getElementById(id);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    container.appendChild(canvas);

    return canvas;
  };

  const noiseXCanvas = makeCanvas('noise-x');
  const noiseYCanvas = makeCanvas('noise-y');

  const imagesLoaded = Promise.all(imageFiles.map(imageFile => loadImage(`images/${imageFile}`)));

  const noiseX = noiseMaker(width, height, seed, settings.x);
  const noiseY = noiseMaker(width, height, seed + 1, settings.y);
  drawCanvas(noiseXCanvas, noiseSampler(noiseX));
  drawCanvas(noiseYCanvas, noiseSampler(noiseY));

  const drawImage = image => {
    const artCanvas = makeCanvas('art');
    drawCanvas(artCanvas, imageSampler(noiseX, noiseY, image));
  };

  imagesLoaded.then(images => {
    images.forEach(drawImage);
  });
};

const hrefForSeed = seed => {
  return window.location.protocol + "//" + window.location.host + window.location.pathname + `?seed=${seed}`;
}

const newSeed = () => Date.now();

document.addEventListener('DOMContentLoaded', () => {
  let seed;
  var query = window.location.search;
  const params = new URLSearchParams(query);
  const seedParam = params.get('seed');
  if (seedParam) {
    seed = parseInt(seedParam);
  }

  if (!seed) {
    seed = newSeed();
    if (history.pushState) {
      var newurl = hrefForSeed(seed);
      window.history.pushState({ path: newurl }, '' , newurl);
    }
  }

  drawArt(imageFiles, seed);

  document.getElementById('refresh').addEventListener('click', () => {
    window.location.href = hrefForSeed(newSeed());
  });
});
