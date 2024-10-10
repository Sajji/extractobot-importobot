const axios = require('axios');
const config = require('./config.json');
const attributeTypes = require('./extractedData/uniqueAttributeTypes.json');

// Function to import attribute types
async function importAttributeTypes() {
  const headers = {
    Authorization: `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`,
    'Content-Type': 'application/json',
  };

  for (const attributeType of attributeTypes) {
    const attributeTypeData = {
      id: attributeType.id,
      name: attributeType.newName,
      description: attributeType.description,
      kind: attributeType.kind,
      ...(attributeType.stringType && { stringType: attributeType.stringType }),
      ...(attributeType.isInteger !== undefined && { isInteger: attributeType.isInteger }),
      ...(attributeType.statisticsEnabled !== undefined && { statisticsEnabled: attributeType.statisticsEnabled }),
      ...(attributeType.allowedValues && { allowedValues: attributeType.allowedValues }),
    };

    try {
      const response = await axios.post(
        `${config.apiURL}/attributeTypes`,
        attributeTypeData,
        { headers }
      );
      if (response.status === 201) {
        console.log('Attribute type added successfully:', attributeType.newName);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('Attribute type already exists, skipping:', attributeType.newName);
      } else {
        console.error('Error while importing attribute type:', error.message);
      }
    }
  }
}

module.exports = importAttributeTypes;

if (require.main === module) {
  importAttributeTypes();
}