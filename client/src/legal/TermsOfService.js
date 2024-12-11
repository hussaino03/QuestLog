import { Github } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService = () => (
  <div className="max-w-4xl mx-auto px-4 py-8 text-gray-900 dark:text-gray-100">
    <Link 
      to="/" 
      className="inline-block mb-6 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
    >
      ← Back to app
    </Link>
    
    <header className="mb-8">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
    </header>

    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold mb-4">1. Service Description</h2>
        <div className="legal-content pl-4">
          <p className="mb-4">QuestLog provides:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Task and project management</li>
            <li>Experience points (XP) and leveling system</li>
            <li>Achievement badges</li>
            <li>Optional leaderboard participation</li>
            <li>Cloud synchronization for authenticated users</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">2. Service Features</h2>
        <div className="legal-content pl-4">
          <p className="mb-4">QuestLog provides:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Task and project management</li>
            <li>Experience points (XP) and leveling system</li>
            <li>Achievement badges</li>
            <li>Optional leaderboard participation</li>
            <li>Cloud synchronization for authenticated users</li>
            <li>Task imports from Todoist and TickTick</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">3. Third-Party Integrations</h2>
        <div className="legal-content pl-4">
          <p className="mb-4">When using our task import features:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You must comply with Todoist and TickTick's terms of service</li>
            <li>Imported tasks are subject to our XP system rules</li>
            <li>We are not responsible for changes in third-party API availability</li>
            <li>Integration access is provided on an as-is basis</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">4. Open Source License</h2>
        <div className="legal-content pl-4">
          <p className="mb-4">QuestLog is open source software licensed under the MIT License. You can view, fork, and contribute to the code on GitHub.</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">5. User Responsibilities</h2>
        <div className="legal-content pl-4">
          <ul className="list-disc pl-6 space-y-2">
            <li>Maintain the security of your account</li>
            <li>Provide accurate information</li>
            <li>Use the service lawfully and responsibly</li>
            <li>Respect other users' privacy and rights</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">6. Intellectual Property</h2>
        <div className="legal-content pl-4">
          <p className="mb-4">The service and its original content, features, and functionality are owned by QuestLog and are protected by international copyright, trademark, and other intellectual property laws.</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">7. Termination</h2>
        <div className="legal-content pl-4">
          <p className="mb-4">We reserve the right to terminate or suspend access to our service immediately, without prior notice, for any conduct that we believe violates these Terms of Service or is harmful to other users or us.</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">8. Limitation of Liability</h2>
        <div className="legal-content pl-4">
          <p className="mb-4">QuestLog is provided "as is" without any warranty. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">9. Changes to Terms</h2>
        <div className="legal-content pl-4">
          <p className="mb-4">QuestLog reserves the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised Terms.</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">10. Contact Information</h2>
        <div className="legal-content pl-4">
          <p className="mb-4">If you have any questions about these Terms, please contact us:</p>
          <ul className="list-none space-y-2">
            <li className="flex items-center gap-2">
              <Github size={16} />
              <a 
                href="https://github.com/hussaino03/QuestLog" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-500 transition-colors"
              >
                hussaino03/QuestLog
              </a>
            </li>
          </ul>
        </div>
      </section>
    </div>
  </div>
);

export default TermsOfService;