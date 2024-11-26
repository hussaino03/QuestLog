const nodemailer = require('nodemailer');

async function sendFeedback(req, res) {
  const { ratings, feedback } = req.body;
  
  try {
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
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
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