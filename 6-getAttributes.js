const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load the configuration
const configPath = './config.json';
const outputFilePath = './extractedData/allAttributes.json';
const assetsFilePath = './extractedData/assets.json';

// ✅ Check if assets file exists before continuing
if (!fs.existsSync(assetsFilePath)) {
  console.error("❌ No assets found.");
  process.exit(1); // Exit the script with error
}

// Load configuration and asset data
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const assets = JSON.parse(fs.readFileSync(assetsFilePath, 'utf8'));

const fetchAllAttributes = async () => {
  let allAttributes = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const url = `${config.apiURL}/attributes?offset=${offset}&limit=${limit}&countLimit=-1`;
    try {
      const response = await axios.get(url, {
        auth: {
          username: config.username,
          password: config.password,
        },
      });

      const results = response.data.results;

      const filteredResults = results.filter(result =>
        assets.some(asset => asset.id === result.asset.id)
      );

      const mappedResults = filteredResults.map(result => ({
        assetId: result.asset.id,
        typeId: result.type.id,
        value: result.value,
      }));

      allAttributes = allAttributes.concat(mappedResults);
      console.log(`📦 Retrieved: ${results.length}, Matched: ${mappedResults.length}`);

      if (results.length < limit) {
        break;
      }

      offset += limit;
    } catch (error) {
      console.error('❌ Error fetching attributes:', error.message);
      break;
    }
  }

  fs.writeFileSync(outputFilePath, JSON.stringify(allAttributes, null, 2), 'utf8');
  console.log(`✅ All attributes saved to ${outputFilePath}`);
};

module.exports = fetchAllAttributes;
