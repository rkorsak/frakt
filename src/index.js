import './index.css';
import { makeNoise } from './noise';


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
      getPixel: (x, y) => canvas.getContext('2d').getImageData(x, y, 1, 1).data,
    });
  };
  img.src = uri;
});


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


const noiseSettings = {
  common: {
    frequency: 0.005,
    amplitude: 2,
    octaves: 2,
  },
  x: {},
  y: {},
};


const imageSampler = (noiseX, noiseY, image) => (x, y) => {
  return image.getPixel(noiseX(x, y), noiseY(x, y));
};


const noiseSampler = (noise) => (x, y) => {
  const value = noise(x, y);
  return [value, value, value];
};


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
  const noiseXCanvas = document.getElementById('noise-x');
  const noiseYCanvas = document.getElementById('noise-y');  
  const artCanvas = document.getElementById('art');

  const imageLoaded = loadImage(`images/${imageFile}`);

  const noiseX = noiseMaker(noiseXCanvas.width, noiseXCanvas.height, seed, noiseSettings.x);
  const noiseY = noiseMaker(noiseYCanvas.width, noiseYCanvas.height, seed + 1, noiseSettings.y);

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

document.addEventListener('DOMContentLoaded', () => drawArt('puppy.jpg', Date.now()));
