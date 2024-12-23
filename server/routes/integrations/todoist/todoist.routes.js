const express = require('express');
const axios = require('axios');
const router = express.Router();
const { authenticateToken } = require('../../../middleware/auth');

const TODOIST_CLIENT_ID = process.env.TODOIST_CLIENT_ID;
const TODOIST_CLIENT_SECRET = process.env.TODOIST_CLIENT_SECRET;
const TODOIST_REDIRECT_URI =
  process.env.TODOIST_REDIRECT_URI ||
  'http://localhost:3001/api/auth/todoist/callback';

router.get('/auth/todoist', authenticateToken, (req, res) => {
  const authUrl =
    `https://todoist.com/oauth/authorize?` +
    `client_id=${TODOIST_CLIENT_ID}&` +
    `scope=data:read_write&` +
    `state=${req.sessionID}&` +
    `redirect_uri=${TODOIST_REDIRECT_URI}`;

  res.redirect(authUrl);
});

router.get('/auth/todoist/callback', authenticateToken, async (req, res) => {
  try {
    const response = await axios.post(
      'https://todoist.com/oauth/access_token',
      {
        client_id: TODOIST_CLIENT_ID,
        client_secret: TODOIST_CLIENT_SECRET,
        code: req.query.code
      }
    );

    // Store token with user session
    req.session.todoistToken = response.data.access_token;
    req.user.todoistToken = response.data.access_token; // Save to user if needed

    // Fetch tasks immediately after getting token
    const tasksResponse = await axios.get(
      'https://api.todoist.com/rest/v2/tasks',
      {
        headers: {
          Authorization: `Bearer ${response.data.access_token}`
        }
      }
    );

    const tasks = tasksResponse.data;
    const relevantTasks = [];

    // Iterate over tasks in reverse order until we hit an onboarding task
    for (let i = tasks.length - 1; i >= 0; i--) {
      if (tasks[i].content.toLowerCase().includes('onboarding')) {
        break; // Stop if we encounter an onboarding task
      }
      relevantTasks.unshift(tasks[i].content); // Add to start of array to maintain order
    }

    console.log('Filtered tasks:', relevantTasks);

    res.send(`
      <html>
        <head><title>Importing...</title></head>
        <body style="background: #1f2937; color: white; font-family: sans-serif; text-align: center; padding: 20px;">
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'todoist-auth-success',
                tasks: ${JSON.stringify(relevantTasks)}
              }, '*');
              window.close();
            } else {
              document.body.innerHTML = 'Authentication successful! Please close this window and click the Todoist import button again to see your tasks.';
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Todoist OAuth error:', error);
    res.send(`
      <html>
        <head><title>Error</title></head>
        <body style="background: #1f2937; color: white; font-family: sans-serif;">
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'todoist-auth-error',
                error: ${JSON.stringify(error.message)}
              }, '*');
              window.close();
            } else {
              document.body.innerHTML = 'Authentication failed! You can close this window.';
            }
          </script>
        </body>
      </html>
    `);
  }
});

module.exports = router;
