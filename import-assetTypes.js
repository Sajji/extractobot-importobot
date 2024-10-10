const axios = require('axios');
const config = require('./config.json');
const assetTypes = require('./extractedData/uniqueAssetTypesTree.json');

// Recursive function to import asset types starting from the last object
async function importAssetTypeRecursive(assetType) {
  if (assetType.parent) {
    await importAssetTypeRecursive(assetType.parent);
  }

  const headers = {
    Authorization: `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`,
    'Content-Type': 'application/json',
  };

  const assetTypeData = {
    id: assetType.id,
    name: assetType.newName,
    description: assetType.description,
    parentId: assetType.parentId,
  };

  try {
    const response = await axios.post(
      `${config.apiURL}/assetTypes`,
      assetTypeData,
      { headers }
    );
    if (response.status === 201) {
      console.log('Asset type added successfully:', assetType.newName);
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('Asset type already exists, skipping:', assetType.newName);
    } else {
      console.error('Error while importing asset type:', error.message);
    }
  }
}

// Function to initiate the import process for all asset types
async function importAssetTypes() {
  try {
    for (const assetType of assetTypes.reverse()) {
      await importAssetTypeRecursive(assetType);
    }
  } catch (error) {
    console.error('Error during import process:', error.message);
  }
}

module.exports = importAssetTypes;

if (require.main === module) {
  importAssetTypes();
}