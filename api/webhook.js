// api/webhook.js

// Assuming you have the necessary modules imported to access the Edge Config Store
const { EdgeConfig } = require('@vercel/edge-config');

// Function to update the Edge Config Store
async function updateEdgeConfigStore(edgeConfigStoreData) {
  try {
    // Fetch the existing edge config store data
    const existingConfig = await EdgeConfig.fetch();

    // Update the relevant properties with the received data
    existingConfig.set('inMeetingData', edgeConfigStoreData.inMeetingData);
    existingConfig.set('waitingListData', edgeConfigStoreData.waitingListData);

    // Save the updated edge config store data
    await existingConfig.save();
    
    console.log('Edge Config Store updated successfully');
  } catch (error) {
    console.error('Error updating Edge Config Store:', error);
  }
}

const express = require('express');
const app = express();

app.use(express.json()); // Add middleware to parse JSON requests

app.post('/webhook', (req, res) => {
  // Handle incoming webhook request here
  // Extract relevant data from the request payload
  const { inMeetingData, waitingListData } = req.body;

  // Perform necessary actions based on the received data
  // For example, replace the contents of the Edge Config Store with the received data
  const edgeConfigStoreData = {
    inMeetingData,
    waitingListData
  };
  
  // Assuming you have a function to update the Edge Config Store
  updateEdgeConfigStore(edgeConfigStoreData);

  res.status(200).end(); // Send a response to the webhook provider
});

module.exports = app;
