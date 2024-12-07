const express = require('express');
const axios = require('axios');
const router = express.Router();

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

const TICKTICK_CLIENT_ID = process.env.TICKTICK_CLIENT_ID;
const TICKTICK_CLIENT_SECRET = process.env.TICKTICK_CLIENT_SECRET;
const TICKTICK_REDIRECT_URI = process.env.TICKTICK_REDIRECT_URL;

router.get('/auth/ticktick', isAuthenticated, (req, res) => {
  const authUrl = `https://ticktick.com/oauth/authorize?` +
    `client_id=${TICKTICK_CLIENT_ID}&` +
    `scope=tasks:read tasks:write&` + 
    `state=${req.sessionID}&` +
    `redirect_uri=${TICKTICK_REDIRECT_URI}&` +
    `response_type=code`;  // Required parameter
  
  res.redirect(authUrl);
});

router.get('/auth/ticktick/callback', isAuthenticated, async (req, res) => {
  try {
    const auth = Buffer.from(`${TICKTICK_CLIENT_ID}:${TICKTICK_CLIENT_SECRET}`).toString('base64');
    
    const tokenResponse = await axios.post('https://ticktick.com/oauth/token', 
      new URLSearchParams({
        code: req.query.code,
        grant_type: 'authorization_code',
        scope: 'tasks:read tasks:write',
        redirect_uri: TICKTICK_REDIRECT_URI
      }).toString(),
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;
    req.session.ticktickToken = accessToken;
    req.user.ticktickToken = accessToken;

    // Get user's projects first
    const projectsResponse = await axios.get('https://api.ticktick.com/open/v1/project', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    // Get tasks from each project
    const allTasks = [];
    for (const project of projectsResponse.data) {
      const tasksResponse = await axios.get(`https://api.ticktick.com/open/v1/project/${project.id}/data`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (tasksResponse.data.tasks) {
        allTasks.push(...tasksResponse.data.tasks);
      }
    }

    const relevantTasks = allTasks
      .filter(task => !task.status) // Only include non-completed tasks for now
      .map(task => task.title);

    res.send(`
      <html>
        <head><title>Importing...</title></head>
        <body style="background: #1f2937; color: white; font-family: sans-serif; text-align: center; padding: 20px;">
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'ticktick-auth-success',
                tasks: ${JSON.stringify(relevantTasks)}
              }, '*');
              window.close();
            } else {
              document.body.innerHTML = 'Authentication successful! Please close this window and click the TickTick import button again to see your tasks.';
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('TickTick OAuth error details:', error.response?.data || error.message);
    res.send(`
      <html>
        <head><title>Error</title></head>
        <body style="background: #1f2937; color: white; font-family: sans-serif;">
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'ticktick-auth-error',
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