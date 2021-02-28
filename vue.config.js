const fs = require("fs");
function writeManifestJson() {
  fs.readFile("./src/manifest.json", function (err, data) {
    if (err) {
      return console.error(err);
    }
    const strData = data.toString();
    const manifest = JSON.parse(strData);

    console.log('process.env.DIR_ENV', process.env.DIR_ENV)
    manifest.h5.publicPath = process.env.DIR_ENV ? "/md/": "/";
    const result = JSON.stringify(manifest, null, 4);

    fs.writeFile("./src/manifest.json", result, function (err) {
      if (err) {
        console.error(err);
      }
    });
  });
}
writeManifestJson();
