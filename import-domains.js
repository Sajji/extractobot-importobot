const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('./config.json');

const domains = require('./extractedData/domains.json');
const uuidMappingPath = './temp/uuidMapping.json';
const domainUuidMappingPath = './temp/domainUuidMapping.json';

// Load UUID mappings from the generated uuidMapping.json file
const uuidMapping = JSON.parse(fs.readFileSync(uuidMappingPath, 'utf8'));

// Function to replace UUIDs in domains and save mapping
function replaceDomainUUIDs(domains) {
  const domainUuidMapping = {};
  const updatedDomains = domains.map((domain) => {
    const newId = uuidv4();
    domainUuidMapping[domain.id] = newId;
    return {
      ...domain,
      id: newId,
      communityId: uuidMapping[domain.communityId] || domain.communityId,
    };
  });

  fs.writeFileSync(domainUuidMappingPath, JSON.stringify(domainUuidMapping, null, 2));
  return updatedDomains;
}

// Function to import domains
async function importDomains() {
  const headers = {
    Authorization: `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`,
    'Content-Type': 'application/json',
  };

  // Replace UUIDs in the domains
  const updatedDomains = replaceDomainUUIDs(domains);

  for (const domain of updatedDomains) {
    const domainData = {
      id: domain.id,
      name: domain.name,
      typeId: domain.typeId,
      communityId: domain.communityId,
      ...(domain.description && { description: domain.description }),
    };

    try {
      const response = await axios.post(`${config.apiURL}/domains`, domainData, { headers });
      if (response.status === 201) {
        console.log('Domain added successfully:', domain.name);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('Domain already exists, skipping:', domain.name);
      } else {
        console.error('Error while importing domain:', error.message);
      }
    }
  }
}

if (require.main === module) {
  importDomains();
}

module.exports = importDomains;