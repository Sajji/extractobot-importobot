const fs = require('fs').promises;
const path = require('path');

const compareAndCreateUniqueAttributeTypes = async () => {
  try {
    const extractedDataDir = path.join(__dirname, 'extractedData');

    // Read the two JSON files
    const allAttributesFile = path.join(extractedDataDir, 'allAttributes.json');
    const attributeTypesFile = path.join(extractedDataDir, 'attributeTypes.json');
    const outputFile = path.join(extractedDataDir, 'uniqueAttributeTypes.json');

    const allAttributes = JSON.parse(await fs.readFile(allAttributesFile, 'utf8'));
    const attributeTypes = JSON.parse(await fs.readFile(attributeTypesFile, 'utf8'));

    // Extract all typeIds from allAttributes
    const attributeTypeIds = new Set(allAttributes.map(attr => attr.typeId));

    // Filter attributeTypes to match typeIds from allAttributes
    const uniqueAttributeTypes = attributeTypes.filter(attrType => attributeTypeIds.has(attrType.id));

    // Write the result to a new file
    await fs.writeFile(outputFile, JSON.stringify(uniqueAttributeTypes, null, 2));

    console.log('Matching attribute types have been saved to uniqueAttributeTypes.json');

  } catch (error) {
    console.error('An error occurred:', error.message);
  }
};

// Export the function instead of auto-executing it
module.exports = compareAndCreateUniqueAttributeTypes;
