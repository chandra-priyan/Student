require('dotenv').config();
const readline = require('node:readline');
const bcrypt = require('bcryptjs');
const connectDatabase = require('../config/db');
const Admin = require('../models/Admin');

function prompt(question) {
  const terminal = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => terminal.question(question, (answer) => {
    terminal.close();
    resolve(answer.trim());
  }));
}

function promptPassword(question) {
  if (!process.stdin.isTTY || !process.stdin.setRawMode) {
    return Promise.reject(new Error('Run this command in an interactive terminal to enter the password securely.'));
  }
  process.stdout.write(question);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  return new Promise((resolve, reject) => {
    let password = '';
    function finish(error) {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.removeListener('data', onData);
      process.stdout.write('\n');
      if (error) reject(error);
      else resolve(password);
    }
    function onData(key) {
      if (key === '\u0003') return finish(new Error('Password entry cancelled.'));
      if (key === '\r' || key === '\n') return finish();
      if (key === '\u007f' || key === '\b') {
        password = password.slice(0, -1);
        return;
      }
      if (key >= ' ' && key <= '~') password += key;
    }
    process.stdin.on('data', onData);
  });
}

async function main() {
  await connectDatabase();
  const email = (process.argv[2] || await prompt('Administrator email: ')).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Enter a valid administrator email address.');
  }
  const password = await promptPassword('Administrator password (minimum 12 characters): ');
  if (password.length < 12 || password.length > 128) {
    throw new Error('Password must be between 12 and 128 characters.');
  }
  const existing = await Admin.findOne({ email });
  if (existing) throw new Error('An administrator with that email already exists.');

  await Admin.create({ email, passwordHash: await bcrypt.hash(password, 12) });
  console.log(`Administrator created for ${email}.`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = require('mongoose');
    await mongoose.disconnect();
  });
