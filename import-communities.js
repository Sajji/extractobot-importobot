const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const readline = require('readline');
const config = require('./config.json');

const communities = require('./extractedData/communities.json');
const tempDir = './temp';

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to prompt user to create a new root community
function promptForRootCommunity() {
  return new Promise((resolve) => {
    rl.question('Enter the name of the new root community: ', (name) => {
      rl.question('Enter a description for the new root community: ', (description) => {
        rl.question('Enter a suffix to append to community names: ', (suffix) => {
          resolve({ name, description, suffix });
          rl.close();
        });
      });
    });
  });
}

// Function to replace UUIDs and save mapping
function replaceUUIDs(communities, suffix) {
  const uuidMapping = {};
  const updatedCommunities = communities.map((community) => {
    const newId = uuidv4();
    uuidMapping[community.id] = newId;
    return { ...community, name: community.name + ' ' + suffix, id: newId };
  });

  fs.writeFileSync(path.join(tempDir, 'uuidMapping.json'), JSON.stringify(uuidMapping, null, 2));
  return { updatedCommunities, uuidMapping };
}

// Function to import community data (POST without parentId)
async function postCommunities(updatedCommunities, headers) {
  for (const community of updatedCommunities) {
    const communityData = { ...community };
    delete communityData.parentId;

    try {
      const response = await axios.post(`${config.apiURL}/communities`, communityData, { headers });
      if (response.status === 201) {
        console.log('Community added successfully (POST):', community.name);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('Community already exists, skipping (POST):', community.name);
      } else {
        console.error('Error while importing community (POST):', error.message);
      }
    }
  }
}

// Function to update community data (PATCH with parentId)
async function patchCommunities(updatedCommunities, headers) {
  for (const community of updatedCommunities) {
    if (community.parentId) {
      try {
        const response = await axios.patch(`${config.apiURL}/communities/${community.id}`, { parentId: community.parentId }, { headers });
        if (response.status === 200) {
          console.log('Community updated successfully (PATCH):', community.name);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log('Community not found, skipping (PATCH):', community.name);
        } else {
          console.error('Error while updating community (PATCH):', error.message);
        }
      }
    }
  }
}

// Function to import community data
async function importCommunities() {
  const headers = {
    Authorization: `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`,
    'Content-Type': 'application/json',
  };

  const rootCommunity = await promptForRootCommunity();
  const rootCommunityId = uuidv4();

  // Create the root community
  const rootCommunityData = {
    id: rootCommunityId,
    name: rootCommunity.name,
    description: rootCommunity.description,
  };

  try {
    const response = await axios.post(`${config.apiURL}/communities`, rootCommunityData, { headers });
    if (response.status === 201) {
      console.log('Root community added successfully:', rootCommunity.name);
    }
  } catch (error) {
    console.error('Error while importing root community:', error.message);
    return;
  }

  // Replace UUIDs in the communities
  const { updatedCommunities, uuidMapping } = replaceUUIDs(communities, rootCommunity.suffix);

  // Perform POST without parentId
  await postCommunities(updatedCommunities, headers);

  // Perform PATCH with parentId to replicate parent/child relationships
  for (const community of updatedCommunities) {
    if (community.parentId) {
      community.parentId = uuidMapping[community.parentId] || rootCommunityId;
    } else {
      community.parentId = rootCommunityId;
    }
  }

  await patchCommunities(updatedCommunities, headers);
}

if (require.main === module) {
  importCommunities();
}

module.exports = importCommunities;