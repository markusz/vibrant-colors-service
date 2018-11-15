const Vibrant = require('node-vibrant');
const fs = require('fs');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true
};

const paletteToJSON = (palette) => {
  const json = {};

  Object.keys(palette)
    .forEach(key => {
      const vibrant = palette[key];
      if (vibrant != null) {
        json[key] = {
          rgb: vibrant.getRgb(),
          hex: vibrant.getHex(),
          hsl: vibrant.getHsl().map(value => value.toFixed(5))
        };
      }
    });

  return json;
};

module.exports.parseBase64 = (event, context, callback) => {
  const body = JSON.parse(event.body);
  const { base64 } = body;
  console.info('Retrieved body', body);
  const buf = Buffer.from(base64, 'base64');

  Vibrant.from(buf)
    .quality(1)
    .getPalette()
    .then(palette => {
      callback(null, {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          colors: paletteToJSON(palette)
        })
      });
    })
    .catch(err => {
      console.error(err);

      callback(null, {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          message: err
        })
      });
    });
};

module.exports.serveUI = (event, context, callback) => {
  const html = fs.readFileSync('./static/index.html', 'utf8');

  callback(null, {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html'
    },
    body: html
  });
};
