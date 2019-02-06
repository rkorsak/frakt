import './index.css';
import { makeNoise } from './noise';

const imageFile = 'scream.jpg';

const noiseSettings = {
  common: {
    frequency: 0.005,
    amplitude: 1.5,
  },
  x: {
    octaves: 8,
  },
  y: {
    octaves: 8,
  },
};


const loadImage = (uri) => new Promise((resolve, reject) => {
  var img = new Image();
  img.onload = () => {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

    resolve({
      width: img.width,
      height: img.height,
      getPixel: (x, y) => canvas.getContext('2d').getImageData(Math.floor(x), Math.floor(y), 1, 1).data,
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
  return image.getPixel(noiseX(x, y), noiseY(x, y));
};


/** For visualizing a noise field - returns a greyscale value */
const noiseSampler = (noise) => (x, y) => {
  const value = noise(x, y);
  return [value, value, value];
};


/** Creates a noise function with override-able settings */
const noiseMaker = (width, height, seed, settings) => (otherSettings) => makeNoise(
  width, height,
  {
    ...otherSettings,
    seed,
    noise: {
      ...noiseSettings.common,
      ...settings,
    },
  }
);


const drawArt = (imageFile, seed) => {
  const imageUri = `images/${imageFile}`;
  const [width, height] = [300, 300];

  const imageContainer = document.getElementById('image-container');
  imageContainer.style.width = `${width}px`;
  imageContainer.style.height = `${height}px`;
  imageContainer.style.backgroundImage = `url(${imageUri})`;

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
  const artCanvas = makeCanvas('art');

  const imageLoaded = loadImage(imageUri);

  const noiseX = noiseMaker(width, height, seed, noiseSettings.x);
  const noiseY = noiseMaker(width, height, seed + 1, noiseSettings.y);

  imageLoaded.then(image => {
    drawCanvas(noiseXCanvas, noiseSampler(noiseX({ min: 0, max: 256 })));  
    drawCanvas(noiseYCanvas, noiseSampler(noiseY({ min: 0, max: 256 })));  
    drawCanvas(artCanvas, imageSampler(
      noiseX({ min: 0, max: image.width }),
      noiseY({ min: 0, max: image.height }),
      image
    ));
  });
};

document.addEventListener('DOMContentLoaded', () => {
  let seed;
  var query = window.location.search;
  const params = new URLSearchParams(query);
  const seedParam = params.get('seed');
  if (seedParam) {
    seed = parseInt(seedParam);
  }

  if (!seed) {
    seed = Date.now();
    params.set('seed', seed);
    if (history.pushState) {
      var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?seed=${seed}`;
      window.history.pushState({ path: newurl }, '' , newurl);
    }
  }

  drawArt(imageFile, seed);
});
