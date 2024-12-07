const express = require('express');
const { google } = require('googleapis');
const router = express.Router();

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

router.get('/auth/googletasks', isAuthenticated, async (req, res) => {
  try {
    const tokens = req.session.tokens;
    const now = Date.now();
    
    if (!tokens?.access_token) {
      throw new Error('No access token found. Please re-authenticate.');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.CLIENT}/api/auth/google/callback`
    );

    oauth2Client.setCredentials(tokens);

    // Refresh token if needed
    if (now > tokens.expiry_date - 10000) { // 10 second buffer
      console.log('[Token Debug] Refreshing token...');
      const { credentials } = await oauth2Client.refreshAccessToken();
      req.session.tokens = {
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token || tokens.refresh_token,
        expiry_date: credentials.expiry_date
      };
      oauth2Client.setCredentials(req.session.tokens);
    }

    const tasks = google.tasks({ version: 'v1', auth: oauth2Client });
    
    // Get task lists
    const taskLists = await tasks.tasklists.list();
    const defaultTaskList = taskLists.data.items[0];
    
    // Get tasks from default list
    const taskResponse = await tasks.tasks.list({
      tasklist: defaultTaskList.id,
      showCompleted: false
    });

    const relevantTasks = taskResponse.data.items
      ?.filter(task => task.title && !task.completed)
      .map(task => task.title) || [];

    res.send(`
      <html>
        <head><title>Importing...</title></head>
        <body style="background: #1f2937; color: white; font-family: sans-serif; text-align: center; padding: 20px;">
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'googletasks-auth-success',
                tasks: ${JSON.stringify(relevantTasks)}
              }, '*');
              window.close();
            } else {
              document.body.innerHTML = 'Tasks imported successfully! You can close this window.';
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('[Google Tasks Error]:', error.message);
    res.send(`
      <html>
        <head><title>Error</title></head>
        <body style="background: #1f2937; color: white; font-family: sans-serif;">
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'googletasks-auth-error',
                error: ${JSON.stringify(error.message)}
              }, '*');
              window.close();
            } else {
              document.body.innerHTML = 'Failed to import tasks! You can close this window.';
            }
          </script>
        </body>
      </html>
    `);
  }
});

module.exports = router;