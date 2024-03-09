const path = require('path');
const fs = require('fs');

exports.saveImage = (file) => {
    if( file ) return path.join('/', 'images', file );
}


exports.removeImage = ( filePath) => {
    fs.unlink( path.join('public', filePath), (err) => {
        if (err) {
          console.error(err)
          return
        }
    });
}