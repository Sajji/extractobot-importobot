const createConfig = require('./1-getStarted');


// Sequentially run the necessary scripts
const runScripts = async () => {
  try {
    console.log('Running createConfig from 1-getStarted.js...');
    await createConfig();  // Waits for createConfig to complete

    const getCommunities = require('./2-getCommunities');

    console.log('Running getCommunities from 2-getCommunities.js...');
    await getCommunities();  // Waits for getCommunities to complete
    const processCommunities = require('./3-getDomains');

    console.log('Running processCommunities from 3-getDomains.js...');
    await processCommunities();  // Waits for processCommunities to complete
    const getTypes = require('./4-getTypes');

    console.log('Running getTypes from 4-getTypes.js...');
    await getTypes();  // Waits for getTypes to complete
    const getGraphQLData = require('./5-getAssets');

    console.log('Running getGraphQLData from 5-getAssets.js...');
    await getGraphQLData('extractedData');  // Waits for getGraphQLData to complete
    const fetchAllAttributes = require('./6-getAttributes');

    console.log('Running fetchAllAttributes from 6-getAttributes.js...');
    await fetchAllAttributes();  // Waits for fetchAllAttributes to complete
    const fetchAllRelations = require('./7-getRelations');

    console.log('Running fetchAllRelations from 7-getRelations.js...');
    await fetchAllRelations();  // Waits for fetchAllRelations to complete
    const fetchAllTags = require('./8-getTags');

    console.log('Running fetchAllTags from 8-getTags.js...');
    await fetchAllTags('extractedData');  // Waits for fetchAllTags to complete
    const extractUniqueTypes = require('./9-getUniqueTypes');

    console.log('Running extractUniqueTypes from 9-getUniqueTypes.js...');
    await extractUniqueTypes();  // Waits for extractUniqueTypes to complete
    const buildAssetTypesTree = require('./a-buildAssetTree');

    console.log('Running buildAssetTypesTree from a-buildAssetTree.js...');
    await buildAssetTypesTree();  // Waits for buildAssetTypesTree to complete
    const buildDomainTypesTree = require('./d-buildDomainTypeTree');

    console.log('Running buildDomainTypesTree from d-buildDomainTypeTree.js...');
    await buildDomainTypesTree();  // Waits for buildDomainTypesTree to complete
    const compareAndCreateUniqueAttributeTypes = require('./e-getUniqueAttributeTypes');

    console.log('Running compareAndCreateUniqueAttributeTypes from e-getUniqueAttributeTypes.js...');
    await compareAndCreateUniqueAttributeTypes();  // Waits for compareAndCreateUniqueAttributeTypes to complete
    const compareAndCreateUniqueRelationTypes = require('./f-getUniqueRelationTypes');

    console.log('Running compareAndCreateUniqueRelationTypes from f-getUniqueRelationTypes.js...');
    await compareAndCreateUniqueRelationTypes();  // Waits for compareAndCreateUniqueRelationTypes to complete
    const compressFiles = require('./g-compressExports');  // Import the new compression script
    console.log('Running compressFiles from g-compressExports.js...');
    await compressFiles();  // Compresses all the specified files into exports.zip

    console.log('All scripts completed successfully.');
  } catch (error) {
    console.error('Error running scripts:', error);
  }
};

// Start the script sequence
runScripts();
