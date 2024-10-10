const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const relationsFilePath = './extractedData/allRelations.json';
const assetUuidMappingPath = './temp/assetUuidMapping.json';

// Load UUID mappings from the generated assetUuidMapping.json file
const assetUuidMapping = JSON.parse(fs.readFileSync(assetUuidMappingPath, 'utf8'));

// Function to import relations in bulk
async function importRelations() {
  const headers = {
    Authorization: `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`,
    'Content-Type': 'application/json',
  };

  const relations = JSON.parse(fs.readFileSync(relationsFilePath, 'utf8'));
  const updatedRelations = relations.map(relation => ({
    ...relation,
    sourceId: assetUuidMapping[relation.sourceId] || relation.sourceId,
    targetId: assetUuidMapping[relation.targetId] || relation.targetId,
  }));

  // Split relations into chunks of 1000
  const chunkSize = 1000;
  for (let i = 0; i < updatedRelations.length; i += chunkSize) {
    const relationChunk = updatedRelations.slice(i, i + chunkSize);
    try {
      const response = await axios.post(
        `${config.apiURL}/relations/bulk`,
        relationChunk,
        { headers }
      );
      if (response.status === 201) {
        console.log(`Bulk import of relations successful for chunk starting at index ${i}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`Some relations already exist, skipping chunk starting at index ${i}`);
      } else {
        console.error(`Error while importing relation chunk starting at index ${i}:`, error.message);
      }
    }
  }
}

module.exports = importRelations;

if (require.main === module) {
  importRelations();
}