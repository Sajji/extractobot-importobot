const importCommunities = require('./import-communities');


// Sequentially run the necessary scripts
const runScripts = async () => {
  try {
    console.log('Running createConfig from 1-getStarted.js...');
    await importCommunities();  // Waits for createConfig to complete

    const importAssetTypes = require('./import-assetTypes');
    console.log('Running importAssetTypes from import-assetTypes.js...');
    await importAssetTypes();  // Waits for importAssetTypes to complete

    const importDomainTypes = require('./import-domainTypes');
    console.log('Running importDomainTypes from import-domainTypes.js...');
    await importDomainTypes();  // Waits for importDomainTypes to complete
    
  } catch (error) {}
};

// Run the scripts
runScripts();
