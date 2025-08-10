const mongoose = require('mongoose');
const Property = require('../models/Property');
require('dotenv').config();

async function checkProperties() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cleanersms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Get all properties
    const properties = await Property.find({}).lean();
    console.log(`\nTotal properties: ${properties.length}`);

    // Count completed properties
    const completedProperties = properties.filter(p => p.completedAt);
    console.log(`Completed properties: ${completedProperties.length}`);

    // Show details of completed properties
    if (completedProperties.length > 0) {
      console.log('\nCompleted Properties:');
      completedProperties.forEach((prop, index) => {
        console.log(`\n${index + 1}. ${prop.name || 'Unnamed Property'}`);
        console.log(`   ID: ${prop._id}`);
        console.log(`   Address: ${prop.address || 'N/A'}`);
        console.log(`   Completed At: ${new Date(prop.completedAt).toISOString()}`);
        console.log(`   Room Tasks: ${prop.roomTasks?.length || 0}`);
      });
    }

    // Show properties with completed tasks but not marked as completed
    const withCompletedTasks = properties.filter(prop => {
      if (prop.completedAt) return false; // Skip already completed
      return prop.roomTasks?.some(room => 
        room.tasks?.some(task => task.isCompleted)
      );
    });

    if (withCompletedTasks.length > 0) {
      console.log('\nProperties with completed tasks but not marked as completed:');
      withCompletedTasks.forEach((prop, index) => {
        const completedTasks = prop.roomTasks.flatMap(rt => 
          rt.tasks?.filter(t => t.isCompleted) || []
        ).length;
        
        console.log(`\n${index + 1}. ${prop.name || 'Unnamed Property'}`);
        console.log(`   ID: ${prop._id}`);
        console.log(`   Completed Tasks: ${completedTasks}`);
        console.log(`   Last Updated: ${prop.updatedAt}`);
      });
    }

    // Show properties with status 'completed' but no completedAt
    const statusCompleted = properties.filter(p => 
      p.status === 'completed' && !p.completedAt
    );

    if (statusCompleted.length > 0) {
      console.log('\nProperties with status "completed" but no completedAt:');
      statusCompleted.forEach((prop, index) => {
        console.log(`\n${index + 1}. ${prop.name || 'Unnamed Property'}`);
        console.log(`   ID: ${prop._id}`);
        console.log(`   Status: ${prop.status}`);
        console.log(`   Last Updated: ${prop.updatedAt}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkProperties();
