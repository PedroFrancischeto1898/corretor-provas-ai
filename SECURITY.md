# Security

## API credentials

This project does not include or distribute an OpenAI API key.

Each installation requires the user to provide their own API key.

In the desktop application, the credential is stored locally using Electron's `safeStorage` API and is not committed to the repository.

Environment files containing credentials are excluded through `.gitignore`.

## Sensitive data

Real student exams, names, registration numbers, grades, reports, and other personal data are not included in this repository.

The public portfolio repository was created from a sanitized snapshot of the original private development repository.

## AI and academic evaluation

The application is designed as an assisted grading tool.

AI-generated classifications should not be treated as a substitute for human academic judgment, particularly in high-impact assessment contexts.

The workflow includes human review mechanisms for uncertain identification and grading cases.

## Reporting security issues

If you identify a security issue in this project, please avoid publishing credentials, personal data, or exploit details in a public issue.