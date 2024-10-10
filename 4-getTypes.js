const fs = require('fs');
const axios = require('axios');
const path = require('path');

const getTypes = async () => {
  const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

  try {
    const endpoints = [
      { endpoint: 'assetTypes' },
      { endpoint: 'attributeTypes' },
      { endpoint: 'domainTypes' },
      { endpoint: 'relationTypes' }
    ];

    for (const { endpoint } of endpoints) {
      const data = await fetchData(endpoint, config);

      const endpointFileName = `./extractedData/${endpoint}.json`;
      fs.writeFileSync(endpointFileName, JSON.stringify(data, null, 2));
      console.log(`Filtered ${endpoint} saved to ${endpointFileName}`);
    }
  } catch (error) {
    console.error(`Error while fetching or comparing data: ${error.message}`);
  }
};

const fetchData = async (endpoint, config) => {
  try {
    const suffix = "imported";
    const baseREST = config.apiURL;
    const auth = {
      username: config.username,
      password: config.password
    };
    let results = [];

    if (endpoint === 'relationTypes') {
      const response = await axios.get(`${baseREST}/${endpoint}`, { auth });
      results = response.data.results.map(relationType => ({
        id: relationType.id,
        sourceTypeId: relationType.sourceType.id,
        //sourceTypeName: relationType.sourceType.name,
        targetTypeId: relationType.targetType.id,
        //targetTypeName: relationType.targetType.name,
        role: relationType.role,
        coRole: relationType.coRole,
        description: relationType?.description
        //uniqueKey: `${relationType.sourceType.id}${relationType.targetType.id}${relationType.role}${relationType.coRole}`
      }));
      console.log(`${endpoint}: Downloaded ${results.length}`);
    } else if (endpoint === 'assetTypes') {
      const response = await axios.get(`${baseREST}/${endpoint}`, { auth });
      results = response.data.results.map(assetType => ({
        id: assetType.id,
        name: assetType.name,
        newName: `${assetType.name} - ${suffix}`,
        description: assetType?.description,
        parentId: assetType.parent.id,
        parentName: assetType.parent.name
      }));
      console.log(`${endpoint}: Downloaded ${results.length}`);
    } else if (endpoint === 'domainTypes') {
      const response = await axios.get(`${baseREST}/${endpoint}`, { auth });
      results = response.data.results.map(domainType => ({
        id: domainType.id,
        name: domainType.name,
        newName: `${domainType.name} - ${suffix}`,
        description: domainType?.description,
        parentId: domainType.parent.id,
        parentName: domainType.parent.name
      }));
      console.log(`${endpoint}: Downloaded ${results.length}`);
    } else if (endpoint === 'attributeTypes') {
      const response = await axios.get(`${baseREST}/${endpoint}`, { auth });
      const resourceTypeToKind = {
        BooleanAttributeType: 'BOOLEAN',
        DateAttributeType: 'DATE',
        DateTimeAttributeType: 'DATE',
        MultiValueListAttributeType: 'MULTI_VALUE_LIST',
        NumericAttributeType: 'NUMERIC',
        ScriptAttributeType: 'SCRIPT',
        SingleValueListAttributeType: 'SINGLE_VALUE_LIST',
        StringAttributeType: 'STRING'
      };
      results = response.data.results.map(attributeType => {
        const { resourceType, ...rest } = attributeType;
        const newName = `${attributeType.name} - ${suffix}`;
        const kind = resourceTypeToKind[resourceType];
        const { id, name, description, stringType, allowedValues, isInteger, statisticsEnabled } = attributeType;
        return { id, name, newName, kind, description, stringType, allowedValues, isInteger, statisticsEnabled };
      });
      console.log(`${endpoint}: Downloaded ${results.length}`);
    }
    return results;
  } catch (error) {
    console.error(`Error while fetching ${endpoint}:`, error.message);
    throw error;
  }
};

module.exports = getTypes;
