const axios = require('axios');
const config = require('./config.json');
const relationTypes = require('./extractedData/uniqueRelationTypes.json');

// Function to import relation types
async function importRelationTypes() {
  const headers = {
    Authorization: `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`,
    'Content-Type': 'application/json',
  };

  for (const relationType of relationTypes) {
    const relationTypeData = {
      id: relationType.id,
      sourceTypeId: relationType.sourceTypeId,
      targetTypeId: relationType.targetTypeId,
      role: relationType.role,
      coRole: relationType.coRole,
      ...(relationType.description && { description: relationType.description }),
    };

    try {
      const response = await axios.post(
        `${config.apiURL}/relationTypes`,
        relationTypeData,
        { headers }
      );
      if (response.status === 201) {
        console.log('Relation type added successfully:', relationType.id);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('Relation type already exists, skipping:', relationType.id);
      } else {
        console.error('Error while importing relation type:', error.message);
      }
    }
  }
}

module.exports = importRelationTypes;

if (require.main === module) {
  importRelationTypes();
}