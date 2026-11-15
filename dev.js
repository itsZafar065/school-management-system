import { spawn } from 'child_process';
import path from 'path';

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('--- Starting School Management System (Backend + Frontend) ---');

const backend = spawn('node', ['src/index.js'], {
  cwd: path.resolve('express-backend'),
  stdio: 'inherit',
  shell: true,
});

const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.resolve('frontend'),
  stdio: 'inherit',
  shell: true,
});

const cleanup = () => {
  backend.kill();
  frontend.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
