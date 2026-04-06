const fs = require('fs');
const pngToIco = require('png-to-ico');

const converter = pngToIco.default || pngToIco;

if (typeof converter !== 'function') {
  console.log('pngToIco export:', pngToIco);
  process.exit(1);
}

converter('nodaw.png')
  .then(buf => {
    fs.writeFileSync('nodaw.ico', buf);
    console.log('Successfully created nodaw.ico');
  })
  .catch(console.error);