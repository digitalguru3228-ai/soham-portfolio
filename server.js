require('dotenv').config();

const http = require('http');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const HTML_FILE = path.join(ROOT_DIR, 'index.html');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_TO = process.env.EMAIL_TO || SMTP_USER;

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(SUBMISSIONS_FILE)) {
    fs.writeFileSync(SUBMISSIONS_FILE, '[]', 'utf8');
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON payload.'));
      }
    });

    req.on('error', reject);
  });
}

function serveHtml(res) {
  fs.readFile(HTML_FILE, (error, data) => {
    if (error) {
      sendJson(res, 500, { error: 'Unable to load the portfolio page.' });
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8'
    });
    res.end(data);
  });
}

function isEmailConfigured() {
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && EMAIL_TO);
}

async function sendContactEmail(submission) {
  if (!isEmailConfigured()) {
    return { sent: false, reason: 'SMTP is not configured.' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: `Future Portfolio <${SMTP_USER}>`,
      to: EMAIL_TO,
      replyTo: submission.email,
      subject: `New portfolio contact: ${submission.subject}`,
      text: `Name: ${submission.name}\nEmail: ${submission.email}\nSubject: ${submission.subject}\n\nMessage:\n${submission.message}`
    });

    return { sent: true };
  } catch (error) {
    console.error('Email delivery failed:', error.message);
    return { sent: false, reason: error.message };
  }
}

async function handleContact(req, res) {
  try {
    const payload = await readBody(req);
    const { name, email, subject, message } = payload || {};

    if (!name || !email || !subject || !message) {
      sendJson(res, 400, { error: 'All fields are required.' });
      return;
    }

    const submission = {
      name: String(name).trim(),
      email: String(email).trim(),
      subject: String(subject).trim(),
      message: String(message).trim(),
      createdAt: new Date().toISOString()
    };

    const submissions = JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, 'utf8'));
    submissions.push(submission);
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2), 'utf8');

    const emailStatus = await sendContactEmail(submission);

    sendJson(res, 201, {
      success: true,
      message: emailStatus.sent
        ? 'Message saved successfully and email sent.'
        : `Message saved successfully. Email delivery failed: ${emailStatus.reason}`
    });
  } catch (error) {
    sendJson(res, 400, { error: error.message || 'Unable to process your message.' });
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if (req.method === 'GET' && (pathname === '/' || pathname.endsWith('/index.html'))) {
    serveHtml(res);
    return;
  }

  if (req.method === 'POST' && pathname === '/api/contact') {
    handleContact(req, res);
    return;
  }

  sendJson(res, 404, { error: 'Not found.' });
});

ensureDataFile();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
