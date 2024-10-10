const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const config = require('./config.json');
const fsSync = require('fs');

let totalAssets = 0;
const uniqueTags = new Set();

const fetchGraphQLData = async (domainId, limit, offset) => {
  const endpoint = config.graphURL;
  const username = config.username;
  const password = config.password;

  const query = `
  query {
    assets(
      where: { domain: { id: { eq: "${domainId}" } } }
      limit: ${limit},
      offset: ${offset}
      ) {
        tags(limit: 50) {
          id
          name
      }
  }
}

  `;

  try {
    const response = await axios.post(endpoint, { query }, {
      auth: {
        username,
        password
      }
    });

    return response.data.data.assets;
  } catch (error) {
    console.error('GraphQL request failed:', error);
    return null;
  }
};

const getGraphQLData = async (baseDirectory) => {
  console.log(baseDirectory);

  try {
    const domainFilePath = path.join(baseDirectory, 'domains.json');
    console.log("Attempting to load JSON from:", domainFilePath);
    const rawData = await fs.readFile(domainFilePath, 'utf8');
    const domainList = JSON.parse(rawData);

    for (const domain of domainList) {
      const allData = [];

      console.log("Fetching tags for domain:", domain.name);

      let isLastPage = false;
      const limit = 1000; // Set the limit of items per page
      let offset = 0; // Start at the beginning

      while (!isLastPage) {
        const responseData = await fetchGraphQLData(domain.id, limit, offset);

        if (!responseData || responseData.length < limit) {
          isLastPage = true;
        } else {
          offset += limit;
          console.log(`Fetched ${offset} assets`);
        }

        if (!responseData) {
          continue;
        }

        responseData.forEach(asset => {
          totalAssets++;

          allData.push({
            tags: asset.tags
          });

          asset.tags.forEach(tag => uniqueTags.add(JSON.stringify(tag)));
        });
      }
    }

    if (uniqueTags.size > 0) {
      const tagsDomainPath = path.join(baseDirectory, `tags.json`);
      const allTagsOutput = JSON.stringify([...uniqueTags].map(JSON.parse), null, 2);
      fsSync.writeFileSync(tagsDomainPath, allTagsOutput);
      console.log(`Data saved to ${tagsDomainPath}. Total tags: ${uniqueTags.size}`);
    } else {
      console.log(`No tags found for any of the domains`);
    }

  } catch (error) {
    console.error(error);
  }
  console.log(`Total assets: ${totalAssets}`);
};

// Export the function instead of auto-executing it
module.exports = getGraphQLData;
