const nodemailer = require('nodemailer');

async function sendFeedback(req, res) {
  const { ratings, feedback } = req.body;
  
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    await transporter.verify();

    const ratingsSummary = Object.entries(ratings)
      .filter(([_, value]) => value > 0)
      .map(([category, value]) => `${category}: ${value}/5`)
      .join('\n');

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_TO,
      subject: 'QuestLog Feedback',
      text: `Ratings:\n${ratingsSummary}\n\nFeedback:\n${feedback}`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Feedback sent successfully' });
  } catch (error) {
    console.error('Error sending feedback:', error);
    res.status(500).json({ error: `Failed to send feedback: ${error.message}` });
  }
}

module.exports = {
  sendFeedback
};