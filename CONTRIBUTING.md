# Contributing to QuestLog

Thank you for your interest in contributing to QuestLog! Here's how you can help:

## How to Contribute

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Run tests if applicable
5. Commit your changes (`git commit -am 'Add new feature'`)
6. Push to the branch (`git push origin feature/your-feature`)
7. Create a Pull Request

## Development Setup

1. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/QuestLog.git
   cd QuestLog
   ```
2. Copy and configure environment variables:
   ```bash
   cp example.env .env
   # Update .env with your values
   ```
3. Build and start with Docker:
   ```bash
   docker-compose up --build
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Pull Request Guidelines

- Keep your changes focused and atomic
- Update documentation as needed
- Follow the existing code style
- Add tests if applicable
- Describe your changes in the PR description

## Bug Reports

Create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## Questions?

Feel free to create an issue for any questions about contributing.

## Code of Conduct

- Be respectful and inclusive
- No harassment or discrimination
- Keep discussions constructive
