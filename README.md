An exploration of the technique used by Kjetil Golid [here](https://twitter.com/kGolid/status/1091113662352379905).

Given a two fractal noise fields (A and B) and a source image, generate a new image by mapping A(x, y) against the x axis of the image and B(x, y) against the y axis of the image.  Or, roughly... `art[x][y] = image[A[x][y]][B[x][y]]`.

## Try it out

`npm install`

`npm start`
