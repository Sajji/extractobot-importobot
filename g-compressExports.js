const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const compressFiles = async () => {
  try {
    const extractedDataDir = path.join(__dirname, 'extractedData');
    const outputFilePath = path.join(__dirname, 'exports.zip');

    // Create a file to stream the archive data
    const output = fs.createWriteStream(outputFilePath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level
    });

    // Listen for the 'close' event, indicating the zip has been finalized
    output.on('close', function () {
      console.log(`exports.zip has been created. Total size: ${archive.pointer()} bytes`);
    });

    // Listen for any errors while archiving
    archive.on('error', function (err) {
      throw err;
    });

    // Pipe the archive data to the file
    archive.pipe(output);

    // Define the files to include (specific files and all starting with 'unique')
    const filesToCompress = [
      'allAttributes.json',
      'allRelations.json',
      'assets.json',
      'communities.json',
      'domains.json',
      'tags.json'
    ];

    // Add the specific files to the archive
    for (const file of filesToCompress) {
      const filePath = path.join(extractedDataDir, file);
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: file });
      }
    }

    // Add all files that start with "unique"
    const uniqueFiles = fs.readdirSync(extractedDataDir).filter(file => file.startsWith('unique'));
    for (const uniqueFile of uniqueFiles) {
      const uniqueFilePath = path.join(extractedDataDir, uniqueFile);
      archive.file(uniqueFilePath, { name: uniqueFile });
    }

    // Finalize the archive (this closes the stream and writes the zip)
    await archive.finalize();

  } catch (error) {
    console.error('An error occurred during compression:', error.message);
  }
};

// Export the function for reuse or to be triggered
module.exports = compressFiles;
