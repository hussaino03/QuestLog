import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-gray-900 dark:text-gray-100">
      <Link
        to="/"
        className="inline-block mb-6 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        ← Back to app
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Effective date: {new Date().toLocaleDateString()}
        </p>
      </header>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">
            1. Information Collection
          </h2>
          <div className="legal-content pl-4">
            <p className="mb-4">We collect the following information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Google OAuth data: Name and email</li>
              <li>Task data: Your tasks, deadlines, and completion status</li>
              <li>Game data: XP, levels, badges, and achievements</li>
              <li>Usage data: Task completion patterns and activity metrics</li>
              <li>
                AI Assistant Data: Task completion patterns and productivity
                metrics for personalized insights
              </li>
              <li>
                Chat History: Conversations with the AI productivity assistant
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">2. Data Storage</h2>
          <div className="legal-content pl-4">
            <p className="mb-4">Your data is:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Stored in MongoDB</li>
              <li>Available across devices</li>
              <li>Secured with Google OAuth</li>
              <li>Protected by session management</li>
              <li>Backed up regularly</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            3. How We Use Your Information
          </h2>
          <div className="legal-content pl-4">
            <p className="mb-4">We use the collected information to:</p>
            <ul className="list-decimal pl-6 space-y-2 mb-4">
              <li>Provide and maintain the QuestLog service</li>
              <li>Track your progress and achievements</li>
              <li>Improve our services</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            4. Third-Party Services
          </h2>
          <div className="legal-content pl-4">
            <p className="mb-4">We use the following third-party services:</p>
            <ul className="list-decimal pl-6 space-y-2 mb-4">
              <li>Google OAuth for authentication</li>
              <li>MongoDB for data storage</li>
              <li>Vercel for hosting</li>
              <li>Todoist API for task import integration</li>
              <li>TickTick API for task import integration</li>
            </ul>
            <p className="mb-4">When using task import features:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>We only import task names and descriptions</li>
              <li>Tasks are assigned default XP values when imported</li>
              <li>We don't store your Todoist or TickTick credentials</li>
              <li>Integration access can be revoked at any time</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            5. AI Assistant & Data Processing
          </h2>
          <div className="legal-content pl-4">
            <p className="mb-4">Our AI productivity assistant:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Uses Google's Gemini Pro LLM to process your productivity data
              </li>
              <li>Only receives anonymized task completion statistics</li>
              <li>Does not store conversation history permanently</li>
              <li>Processes data in compliance with Google's AI principles</li>
              <li>
                Cannot access personal task details or sensitive information
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">6. Contact</h2>
          <div className="legal-content pl-4">
            <p className="mb-4">
              For privacy concerns or questions, please contact us through our
              GitHub repository.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            7. Data Protection Rights
          </h2>
          <div className="legal-content pl-4">
            <p className="mb-4">
              You have the following data protection rights:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The right to access your personal data</li>
              <li>The right to rectification of your data</li>
              <li>The right to erasure of your data</li>
              <li>The right to restrict processing</li>
              <li>The right to data portability</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
