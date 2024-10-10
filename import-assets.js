const axios = require('axios');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { v4: uuidv4 } = require('uuid');
const config = require('./config.json');

const assetsDir = './extractedData';
const domainUuidMappingPath = './temp/domainUuidMapping.json';
const assetUuidMappingPath = './temp/assetUuidMapping.json';

// Load UUID mappings from the generated domainUuidMapping.json file
const domainUuidMapping = JSON.parse(fs.readFileSync(domainUuidMappingPath, 'utf8'));

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to prompt user for a suffix to append to asset names
function promptForSuffix() {
  return new Promise((resolve) => {
    rl.question('Enter a suffix to append to asset names: ', (suffix) => {
      resolve(suffix);
      rl.close();
    });
  });
}

// Function to replace asset UUIDs and save mapping
function replaceAssetUUIDs(assets) {
  const assetUuidMapping = {};
  const updatedAssets = assets.map((asset) => {
    const newId = uuidv4();
    assetUuidMapping[asset.id] = newId;
    return { ...asset, id: newId };
  });

  fs.writeFileSync(assetUuidMappingPath, JSON.stringify(assetUuidMapping, null, 2));
  return updatedAssets;
}

// Function to import assets in bulk
async function importAssets() {
  const headers = {
    Authorization: `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`,
    'Content-Type': 'application/json',
  };

  const suffix = await promptForSuffix();
  const assetFiles = fs.readdirSync(assetsDir).filter(file => file.startsWith('assets') && file.endsWith('.json'));

  for (const file of assetFiles) {
    const assets = JSON.parse(fs.readFileSync(path.join(assetsDir, file), 'utf8'));
    const updatedAssets = replaceAssetUUIDs(assets);
    const assetsWithSuffix = updatedAssets.map(asset => ({
      ...asset,
      name: `${asset.name} ${suffix}`,
      domainId: domainUuidMapping[asset.domainId] || asset.domainId,
    }));

    // Split assets into chunks of 1000
    const chunkSize = 1000;
    for (let i = 0; i < assetsWithSuffix.length; i += chunkSize) {
      const assetChunk = assetsWithSuffix.slice(i, i + chunkSize);
      try {
        const response = await axios.post(
          `${config.apiURL}/assets/bulk`,
          assetChunk,
          { headers }
        );
        if (response.status === 201) {
          console.log(`Bulk import of assets successful for chunk starting at index ${i}`);
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          console.log(`Some assets already exist, skipping chunk starting at index ${i}`);
        } else {
          console.error(`Error while importing asset chunk starting at index ${i}:`, error.message);
        }
      }
    }
  }
}

module.exports = importAssets;

if (require.main === module) {
  importAssets();
}