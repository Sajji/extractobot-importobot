const axios = require('axios');
const config = require('./config.json');
const domainTypes = require('./extractedData/uniqueDomainTypesTree.json');

// Recursive function to import domain types starting from the last object
async function importDomainTypeRecursive(domainType) {
  if (domainType.parent) {
    await importDomainTypeRecursive(domainType.parent);
  }

  const headers = {
    Authorization: `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`,
    'Content-Type': 'application/json',
  };

  const domainTypeData = {
    id: domainType.id,
    name: domainType.newName,
    description: domainType.description,
    parentId: domainType.parentId,
  };

  try {
    const response = await axios.post(
      `${config.apiURL}/domainTypes`,
      domainTypeData,
      { headers }
    );
    if (response.status === 201) {
      console.log('Domain type added successfully:', domainType.newName);
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('Domain type already exists, skipping:', domainType.newName);
    } else {
      console.error('Error while importing domain type:', error.message);
    }
  }
}

// Function to initiate the import process for all domain types
async function importDomainTypes() {
  try {
    for (const domainType of domainTypes.reverse()) {
      await importDomainTypeRecursive(domainType);
    }
  } catch (error) {
    console.error('Error during import process:', error.message);
  }
}

module.exports = importDomainTypes;

if (require.main === module) {
  importDomainTypes();
}