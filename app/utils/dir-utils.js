const fs = require("fs");
const path = require("path");

exports.countFilesInDirectory = (directory) => {
  return new Promise((resolve, reject) => {
    fs.readdir(directory, (err, items) => {
      if (err) {
        return reject(err);
      }

      let count = 0;
      let pending = items.length;

      if (!pending) {
        return resolve(0);
      }

      items.forEach((item) => {
        const itemPath = path.join(directory, item);
        fs.stat(itemPath, (err, stats) => {
          if (err) {
            return reject(err);
          }

          if (stats.isDirectory()) {
            // If it's a directory, recurse
            exports
              .countFilesInDirectory(itemPath) // Use exports here
              .then((subDirCount) => {
                count += subDirCount;
                if (!--pending) resolve(count);
              })
              .catch(reject);
          } else {
            // If it's a file, count it
            count++;
            if (!--pending) resolve(count);
          }
        });
      });
    });
  });
};
