const axios = require('axios');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config.json');
const communitiesPath = path.join(__dirname, 'extractedData', 'communities.json');
const domainsPath = path.join(__dirname, 'extractedData', 'domains.json');
const domainTypesPath = path.join(__dirname, 'extractedData', 'uniqueDomainTypes.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const communities = JSON.parse(fs.readFileSync(communitiesPath, 'utf8'));

const uniqueDomainTypes = new Set();

const fetchDomains = async (id) => {
  const query = {
    query: `
    query Domains {
      domains(
          where: {
              parent: { id: { eq: "${id}" } }
              type: { id: { ne: "00000000-0000-0000-0000-000000030005" } }
          }
      ) {
          id
          name
          description
          type {
              id
          }
          parent {
              communityId: id
          }
      }
  }
  
    `
  };

  const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');

  try {
    const response = await axios({
      url: config.graphURL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      data: JSON.stringify(query),
    });

    response.data.data.domains.forEach(domain => {
      uniqueDomainTypes.add(domain.type.id);  // Extract typeId and add it to the set
    });

    return response.data.data.domains.map(domain => ({
      id: domain.id,
      name: domain.name,
      typeId: domain.type.id,
      description: domain.description,
      communityId: domain.parent.communityId
    }));
  } catch (error) {
    console.error(`Error fetching domains for community ${id}:`, error.message);
    return [];
  }
};

const processCommunities = async () => {
  let allDomains = [];

  for (const community of communities) {
    const domains = await fetchDomains(community.id);
    allDomains = allDomains.concat(domains);
  }

  fs.writeFileSync(domainsPath, JSON.stringify(allDomains, null, 2), 'utf8');
  
  const uniqueDomainTypesArray = Array.from(uniqueDomainTypes).map(typeId => ({ typeId }));
  fs.writeFileSync(domainTypesPath, JSON.stringify(uniqueDomainTypesArray, null, 2), 'utf8');
  console.log(`Domains data saved to ${domainsPath}`);
  console.log(`Unique domain types saved to ${domainTypesPath}`);
};

// Export the function instead of auto-executing it
module.exports = processCommunities;
