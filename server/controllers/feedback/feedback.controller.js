const nodemailer = require('nodemailer');

async function sendFeedback(req, res) {
  const { ratings, feedback, role } = req.body;

  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userEmail = req.user.email;
    const userName = req.user.name;

    if (!userEmail) {
      return res.status(400).json({
        error: 'No email found in user profile'
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });

    await transporter.verify();

    const ratingsSummary = Object.entries(ratings)
      .filter(([_, value]) => value > 0)
      .map(([category, value]) => `${category}: ${value}/5`)
      .join('\n');

    const mailOptions = {
      from: userEmail,
      to: process.env.EMAIL_USER,
      subject: 'QuestLog Feedback',
      text: `From: ${userName} (${userEmail}) ${role ? `\nRole: ${role}` : ''} \n Ratings: \n ${ratingsSummary} \
      \n Feedback: ${feedback}`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Feedback sent successfully' });
  } catch (error) {
    console.error('Detailed error in sendFeedback:', error);
    res.status(500).json({
      error: `Failed to send feedback: ${error.message}`,
      details: error.stack
    });
  }
}

module.exports = {
  sendFeedback
};
