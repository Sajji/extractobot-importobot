const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const attributesFilePath = './extractedData/allAttributes.json';
const assetUuidMappingPath = './temp/assetUuidMapping.json';

// Load UUID mappings from the generated assetUuidMapping.json file
const assetUuidMapping = JSON.parse(fs.readFileSync(assetUuidMappingPath, 'utf8'));

// Function to import attributes in bulk
async function importAttributes() {
  const headers = {
    Authorization: `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`,
    'Content-Type': 'application/json',
  };

  const attributes = JSON.parse(fs.readFileSync(attributesFilePath, 'utf8'));
  const updatedAttributes = attributes.map(attribute => ({
    ...attribute,
    assetId: assetUuidMapping[attribute.assetId] || attribute.assetId,
  }));

  // Split attributes into chunks of 1000
  const chunkSize = 1000;
  for (let i = 0; i < updatedAttributes.length; i += chunkSize) {
    const attributeChunk = updatedAttributes.slice(i, i + chunkSize);
    try {
      const response = await axios.post(
        `${config.apiURL}/attributes/bulk`,
        attributeChunk,
        { headers }
      );
      if (response.status === 201) {
        console.log(`Bulk import of attributes successful for chunk starting at index ${i}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`Some attributes already exist, skipping chunk starting at index ${i}`);
      } else {
        console.error(`Error while importing attribute chunk starting at index ${i}:`, error.message);
      }
    }
  }
}

module.exports = importAttributes;

if (require.main === module) {
  importAttributes();
}