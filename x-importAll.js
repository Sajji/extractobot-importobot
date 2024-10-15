const createConfig = require('./1-getStarted');


// Sequentially run the necessary scripts
const runScripts = async () => {
  try {

    console.log('Running createConfig from 1-getStarted.js...');
    await createConfig();  // Waits for createConfig to complete

    const importAssetTypes = require('./import-assetTypes');
    console.log('Running importAssetTypes from import-assetTypes.js...');
    await importAssetTypes();  // Waits for importAssetTypes to complete

    const importDomainTypes = require('./import-domainTypes');
    console.log('Running importDomainTypes from import-domainTypes.js...');
    await importDomainTypes();  // Waits for importDomainTypes to complete
    
    const importAttributeTypes = require('./import-attributeTypes');
    console.log('Running importAttributeTypes from import-attributeTypes.js...');
    await importAttributeTypes();  // Waits for importAttributeTypes to complete
    
    const importRelationTypes = require('./import-relationTypes');
    console.log('Running importRelationTypes from import-relationTypes.js...');
    await importRelationTypes();  // Waits for importRelationTypes to complete

    const importCommunities = require('./import-communities');
    console.log('Running createConfig from 1-getStarted.js...');
    await importCommunities();  // Waits for createConfig to complete

    const importDomains = require('./import-domains');
    console.log('Running importDomains from import-domains.js...');
    await importDomains();  // Waits for importDomains to complete

    const importAssets = require('./import-assets');
    console.log('Running importAssets from import-assets.js...');
    await importAssets();  // Waits for importAssets to complete

    const importAttributes = require('./import-attributes');
    console.log('Running importAttributes from import-attributes.js...');
    await importAttributes();  // Waits for importAttributes to complete

    const importRelations = require('./import-relations');
    console.log('Running importRelations from import-relations.js...');
    await importRelations();  // Waits for importRelations to complete
    
  } catch (error) {}
};

// Run the scripts
runScripts();
