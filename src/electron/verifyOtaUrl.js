const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const crypto = require('crypto');
const { file, setGracefulCleanup } = require('tmp-promise');

module.exports = async (url, firmwareDir) => {
    const hash = crypto.createHash('sha256');
    const response = await fetch(url);
    const stream = response.body;
    let size = 0;
    if (response.status < 200 || response.status > 300) {
        const error = new Error(`Received non-success status code "${response.status}" while fetching file.`);
        error.response = response;
        throw error;
    }

    fs.mkdirSync(firmwareDir, { recursive: true });
    setGracefulCleanup();
    const { fd, path: tmpPath, cleanup } = await file({ dir: firmwareDir, postfix: '.bin' });

    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(tmpPath, { fd });
        stream.on('error', error => {
            cleanup();
            reject(error);
        });
        stream.on('data', chunk => {
            writer.write(chunk);
            size += chunk.length;
            hash.update(chunk);
        });
        stream.on('end', () => {
            writer.end();
            resolve({
                size: size,
                sha256sum: hash.digest('hex'),
                filename: path.basename(tmpPath),
            });
        });
    });
}
