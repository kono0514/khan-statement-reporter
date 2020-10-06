const fs = require('fs');
const path = require('path');

exports.default = function (buildResult) {
  const exeFilePath = buildResult.artifactPaths.find(e => e.endsWith('.exe'));

  if (exeFilePath) {
    const newPath = path.join(buildResult.outDir, `${buildResult.configuration.productName} Setup Latest.exe`.replace(/ /g, '-'));
    fs.copyFileSync(exeFilePath, newPath)
    return [newPath];
  }

  return [];
}
