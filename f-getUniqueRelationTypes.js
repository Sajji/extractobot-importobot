const fs = require('fs').promises;
const path = require('path');

const compareAndCreateUniqueRelationTypes = async () => {
  try {
    const extractedDataDir = path.join(__dirname, 'extractedData');

    // Read the two JSON files
    const allRelationsFile = path.join(extractedDataDir, 'allRelations.json');
    const relationTypesFile = path.join(extractedDataDir, 'relationTypes.json');
    const outputFile = path.join(extractedDataDir, 'uniqueRelationTypes.json');

    const allRelations = JSON.parse(await fs.readFile(allRelationsFile, 'utf8'));
    const relationTypes = JSON.parse(await fs.readFile(relationTypesFile, 'utf8'));

    // Extract all typeIds from allRelations
    const relationTypeIds = new Set(allRelations.map(relation => relation.typeId));

    // Filter relationTypes to match typeIds from allRelations
    const uniqueRelationTypes = relationTypes.filter(relType => relationTypeIds.has(relType.id));

    // Write the result to a new file
    await fs.writeFile(outputFile, JSON.stringify(uniqueRelationTypes, null, 2));

    console.log('Matching relation types have been saved to uniqueRelationTypes.json');

  } catch (error) {
    console.error('An error occurred:', error.message);
  }
};

// Export the function instead of auto-executing it
module.exports = compareAndCreateUniqueRelationTypes;
