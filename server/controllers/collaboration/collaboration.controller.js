const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('../../db');

async function shareProject(req, res) {
    try {
      const { taskId } = req.params;
      const { userId } = req.body;
  
      console.log(`[SHARE] Attempting to share project ${taskId} with user ${userId}`);
  
      if (!taskId || !userId || !ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid task or user ID' });
      }
  
      const db = await connectToDatabase();
      const usersCollection = db.collection('users');
      
      // Find the project owner and project details
      const taskOwner = await usersCollection.findOne({
        'tasks.id': taskId
      });

      const project = taskOwner.tasks.find(t => t.id === taskId);
      
      // Initialize sharedWith array with owner if it doesn't exist
      let sharedWith = project.sharedWith || [taskOwner._id.toString()];
      
      // Add new collaborator if not already in the array
      if (!sharedWith.includes(userId)) {
        sharedWith.push(userId);
      }

      console.log('[SHARE] Project sharing state:', {
        id: project.id,
        owner: taskOwner._id.toString(),
        sharedWith: sharedWith
      });

      // Create the shared project structure
      const sharedProject = {
        ...project,
        ownerId: taskOwner._id.toString(),
        isShared: true,
        sharedWith: sharedWith,
        sharedAt: new Date()
      };
  
      // Update owner's project first
      await usersCollection.updateOne(
        { _id: taskOwner._id, 'tasks.id': taskId },
        { 
          $set: {
            'tasks.$': sharedProject
          }
        }
      );
  
      // Then add to collaborator's tasks
      await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        {
          $push: {
            tasks: sharedProject,
            sharedProjects: {
              projectId: taskId,
              ownerId: taskOwner._id.toString(),
              joinedAt: new Date()
            }
          }
        }
      );

      console.log('[SHARE] Final shared with array:', sharedWith);

      res.json({ 
        message: 'Project shared successfully',
        currentCollaborators: sharedWith
      });
    } catch (error) {
      console.error('[SHARE] Error sharing project:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
}

async function getSharedProject(req, res) {
    try {
      const { taskId } = req.params;
      const userId = req.user._id.toString(); // Get current user's ID from session
      
      console.log(`[GET] Fetching shared project ${taskId} for user ${userId}`);
      
      if (!taskId) {
        return res.status(400).json({ error: 'Task ID is required' });
      }
  
      const db = await connectToDatabase();
      const usersCollection = db.collection('users');
      
      // Find the original project owner
      const taskOwner = await usersCollection.findOne({
        'tasks.id': taskId
      });
  
      if (!taskOwner) {
        return res.status(404).json({ error: 'Project not found' });
      }
  
      const project = taskOwner.tasks.find(t => t.id === taskId);
      
      let sharedWith = project.sharedWith || [taskOwner._id.toString()];
      if (!sharedWith.includes(userId)) {
        sharedWith.push(userId);
        
        // Update the project with new collaborator
        await usersCollection.updateMany(
          { 'tasks.id': taskId },
          {
            $set: {
              'tasks.$.sharedWith': sharedWith
            }
          }
        );
      }

      console.log('[GET] Updated project sharing state:', {
        id: project.id,
        owner: taskOwner._id.toString(),
        sharedWith: sharedWith
      });
  
      res.json({
        ...project,
        ownerId: taskOwner._id.toString(),
        isShared: true,
        sharedWith: sharedWith
      });
    } catch (error) {
      console.error('[GET] Error getting shared project:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
}
  
async function updateSharedProject(req, res) {
    try {
      const { taskId } = req.params;
      const { subtaskIndex, completed } = req.body;
  
      console.log(`[UPDATE] Updating task ${taskId}, subtask ${subtaskIndex} to ${completed}`);
  
      if (!taskId) {
        return res.status(400).json({ error: 'Task ID is required' });
      }
  
      const db = await connectToDatabase();
      const usersCollection = db.collection('users');
  
      // Find both owner and collaborators who have this task
      const usersWithTask = await usersCollection.find({
        $or: [
          { 'tasks.id': taskId },
          { 'sharedProjects.projectId': taskId }
        ]
      }).toArray();
      
      console.log(`[UPDATE] Found ${usersWithTask.length} users with this task`);
      
      for (const user of usersWithTask) {
        console.log(`[UPDATE] Updating task for user ${user.name} (${user._id})`);
        
        // Find the task in user's tasks array
        const taskIndex = user.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
          console.log(`[UPDATE] Task not found in user's tasks array`);
          continue;
        }
  
        // Update the specific user's task
        const updateResult = await usersCollection.updateOne(
          { _id: user._id, 'tasks.id': taskId },
          {
            $set: {
              [`tasks.$.subtasks.${subtaskIndex}.completed`]: completed
            }
          }
        );
  
        console.log(`[UPDATE] Update result for user ${user.name}:`, {
          matched: updateResult.matchedCount,
          modified: updateResult.modifiedCount
        });
      }
  
      res.json({ 
        message: 'Project updated successfully',
        updatedUsers: usersWithTask.length
      });
    } catch (error) {
      console.error('[ERROR] Error updating shared project:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
}
  
async function updateSharedProjectDetails(req, res) {
    try {
      const { taskId } = req.params;
      const updatedDetails = req.body;  
  
      console.log(`[UPDATE-DETAILS] Updating project ${taskId} details:`, updatedDetails);
  
      if (!taskId) {
        return res.status(400).json({ error: 'Task ID is required' });
      }
  
      const db = await connectToDatabase();
      const usersCollection = db.collection('users');
  
      // Find all users who have this task
      const usersWithTask = await usersCollection.find({ 'tasks.id': taskId }).toArray();
      console.log(`[UPDATE-DETAILS] Found ${usersWithTask.length} users with this project`);
      
      for (const user of usersWithTask) {
        console.log(`[UPDATE-DETAILS] Updating project for user ${user.name} (${user._id})`);
  
        // Preserve shared properties
        const currentTask = user.tasks.find(t => t.id === taskId);
        const updatedTask = {
          ...updatedDetails,
          isShared: true,
          ownerId: currentTask.ownerId || user._id.toString(),
          sharedWith: currentTask.sharedWith || [],
          sharedAt: currentTask.sharedAt || new Date()
        };
  
        const updateResult = await usersCollection.updateOne(
          { _id: user._id, 'tasks.id': taskId },
          {
            $set: {
              'tasks.$': updatedTask
            }
          }
        );
  
        console.log(`[UPDATE-DETAILS] Update result for user ${user.name}:`, {
          matched: updateResult.matchedCount,
          modified: updateResult.modifiedCount
        });
      }
  
      res.json({
        message: 'Project details updated successfully',
        updatedUsers: usersWithTask.length
      });
    } catch (error) {
      console.error('[ERROR] Error updating project details:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    shareProject,
    getSharedProject,
    updateSharedProject,
    updateSharedProjectDetails
};