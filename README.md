# Soham Portfolio

A personal portfolio website with a lightweight Node.js backend for contact form submissions.

## Features

- Interactive portfolio page in `FUTURE PORTFOLIO.html.html`
- Additional static pages in `project_1-Portfolio/`
- Contact backend with:
  - form submission storage in `data/submissions.json`
  - email delivery via Gmail SMTP when configured

## Project Structure

- `FUTURE PORTFOLIO.html.html` — main interactive portfolio page
- `server.js` — Node.js backend
- `package.json` — Node dependencies
- `project_1-Portfolio/` — older static portfolio pages
- `.env.example` — example SMTP configuration
- `.gitignore` — excludes local secrets and runtime files

## Setup

1. Install dependencies

```bash
npm install
```

2. Create a `.env` file using `.env.example` and add your Gmail SMTP values

```env
PORT=3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_TO=your-email@gmail.com
```

> Use a Gmail App Password, not your normal Gmail password.

## Run locally

```bash
node server.js
```

Then open:

```text
http://localhost:3000
```

## Contact form behavior

- Every submission is saved to `data/submissions.json`
- If SMTP is configured correctly, the backend sends the message to `EMAIL_TO`
- If SMTP is missing or invalid, the backend still saves the submission and returns a response

## GitHub

Repository:

https://github.com/digitalguru3228-ai/soham-portfolio

## Notes

- `.env` and `data/` are ignored and should not be committed
- If the server stops or fails to start, verify that `node_modules` is installed and that `.env` is valid
