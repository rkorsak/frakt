import { makeNoise } from './noise';

const imageFiles = ['scream.jpg', 'starry.jpg', 'puppy.jpg', 'beach.jpg', 'cat.jpeg'];

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
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    resolve({
      width: img.width,
      height: img.height,
      getPixel: (x, y) => {
        const i = (Math.floor(x) + Math.floor(y) * canvas.width) * 4;
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


/** Creates a noise function with override-able settings */
const noiseMaker = (width, height, seed, settings) => makeNoise(
  width, height,
  {
    seed,
    noise: {
      ...noiseSettings.common,
      ...settings,
    },
  }
);


const drawArt = (imageFiles, seed) => {
  // const imageUri = `images/${imageFile}`;
  const [width, height] = [600, 600];

  // const imageContainer = document.getElementById('image-container');
  // imageContainer.style.width = `${width}px`;
  // imageContainer.style.height = `${height}px`;
  // imageContainer.style.backgroundImage = `url(${imageUri})`;

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

  const noiseX = noiseMaker(width, height, seed, noiseSettings.x);
  const noiseY = noiseMaker(width, height, seed + 1, noiseSettings.y);
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
