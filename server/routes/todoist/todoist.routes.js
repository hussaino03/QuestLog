const express = require('express');
const axios = require('axios');
const router = express.Router();

// Add authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

const TODOIST_CLIENT_ID = process.env.TODOIST_CLIENT_ID;
const TODOIST_CLIENT_SECRET = process.env.TODOIST_CLIENT_SECRET;
const TODOIST_REDIRECT_URI = process.env.TODOIST_REDIRECT_URI || 'http://localhost:3001/api/auth/todoist/callback';

// Add auth check to routes
router.get('/auth/todoist', isAuthenticated, (req, res) => {
  const authUrl = `https://todoist.com/oauth/authorize?` + 
    `client_id=${TODOIST_CLIENT_ID}&` +
    `scope=data:read_write&` +
    `state=${req.sessionID}&` +
    `redirect_uri=${TODOIST_REDIRECT_URI}`;
  
  res.redirect(authUrl);
});

// Add auth check to routes
router.get('/auth/todoist/callback', isAuthenticated, async (req, res) => {
  try {
    const response = await axios.post('https://todoist.com/oauth/access_token', {
      client_id: TODOIST_CLIENT_ID,
      client_secret: TODOIST_CLIENT_SECRET,
      code: req.query.code
    });

    // Store token with user session
    req.session.todoistToken = response.data.access_token;
    req.user.todoistToken = response.data.access_token; // Save to user if needed

    // Fetch tasks immediately after getting token
    const tasksResponse = await axios.get('https://api.todoist.com/rest/v2/tasks', {
      headers: {
        Authorization: `Bearer ${response.data.access_token}`
      }
    });

    const tasks = tasksResponse.data;
    const relevantTasks = [];

    // Iterate over tasks in reverse order until we hit an onboarding task
    for (let i = tasks.length - 1; i >= 0; i--) {
      if (tasks[i].content.toLowerCase().includes('onboarding')) {
        break;  // Stop if we encounter an onboarding task
      }
      relevantTasks.unshift(tasks[i].content);  // Add to start of array to maintain order
    }

    console.log('Filtered tasks:', relevantTasks);

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'todoist-auth-success',
                tasks: ${JSON.stringify(relevantTasks)}
              }, '*');
              window.close();
            }
          </script>
          <p>Authentication successful! You can close this window.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Todoist OAuth error:', error);
    res.status(500).send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'todoist-auth-error' }, '*');
              window.close();
            }
          </script>
          <p>Authentication failed. You can close this window.</p>
        </body>
      </html>
    `);
  }
});

module.exports = router;
