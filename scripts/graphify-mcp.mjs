#!/usr/bin/env node
// Launch Graphify's local MCP server for the target project.
//
// GUI hosts often start an MCP server from a directory other than the project,
// so this wrapper resolves the project and graph itself, finds the Graphify MCP
// entry point, and passes control to it. Diagnostics go to stderr so stdout
// stays a clean MCP stream.

import { existsSync, readdirSync, writeSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { homedir } from 'node:os';
import path from 'node:path';
import process from 'node:process';

const IS_WIN = process.platform === 'win32';
const ROOT = resolveRoot();
const GRAPH = path.join(ROOT, 'graphify-out', 'graph.json');

function fail(message) {
  writeSync(2, `[harness-graph] ${message}\n`);
  process.exit(1);
}

function resolveRoot() {
  const explicit = process.env.HARNESS_PROJECT;
  if (explicit) return path.resolve(explicit);

  for (const key of [
    'CLAUDE_PROJECT_DIR',
    'CODEX_PROJECT_DIR',
    'ANTIGRAVITY_PROJECT_DIR',
    'AGY_PROJECT_DIR',
    'INIT_CWD',
  ]) {
    const value = process.env[key];
    if (value && existsSync(value)) return path.resolve(value);
  }

  let dir = process.cwd();
  for (;;) {
    if (
      existsSync(path.join(dir, '.git')) ||
      existsSync(path.join(dir, '.harness')) ||
      existsSync(path.join(dir, 'graphify-out'))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return process.cwd();
    dir = parent;
  }
}

function executableExtensions(name) {
  if (!IS_WIN || path.extname(name)) return [''];
  return ['', '.exe', '.cmd', '.bat'];
}

function findOnPath(name) {
  const dirs = (process.env.PATH || '').split(path.delimiter).filter(Boolean);
  for (const dir of dirs) {
    for (const ext of executableExtensions(name)) {
      const candidate = path.join(dir, name + ext);
      if (existsSync(candidate)) return candidate;
    }
  }
  return null;
}

function findPython() {
  if (process.env.GRAPHIFY_PYTHON) {
    return { command: process.env.GRAPHIFY_PYTHON, args: [] };
  }
  for (const name of IS_WIN ? ['python.exe', 'python3.exe', 'python'] : ['python3', 'python']) {
    const found = findOnPath(name);
    if (found) return { command: found, args: [] };
  }
  if (IS_WIN) {
    const launcher = findOnPath('py.exe') || findOnPath('py');
    if (launcher) return { command: launcher, args: ['-3'] };
  }
  return null;
}

function findMcp() {
  if (process.env.GRAPHIFY_MCP) {
    return { command: process.env.GRAPHIFY_MCP, args: [GRAPH] };
  }

  const direct = findOnPath('graphify-mcp');
  if (direct) return { command: direct, args: [GRAPH] };

  const dirs = [
    path.join(homedir(), '.local', 'bin'),
    path.join(homedir(), '.cargo', 'bin'),
    path.join(homedir(), '.local', 'pipx', 'venvs', 'graphifyy', IS_WIN ? 'Scripts' : 'bin'),
    path.join(homedir(), '.local', 'share', 'uv', 'tools', 'graphifyy', IS_WIN ? 'Scripts' : 'bin'),
  ];
  if (process.env.APPDATA) {
    dirs.push(path.join(process.env.APPDATA, 'uv', 'tools', 'graphifyy', 'Scripts'));
    const pythonRoot = path.join(process.env.APPDATA, 'Python');
    if (existsSync(pythonRoot)) {
      try {
        for (const entry of readdirSync(pythonRoot)) {
          dirs.push(path.join(pythonRoot, entry, 'Scripts'));
        }
      } catch {
        // Ignore an unreadable Python directory and keep looking.
      }
    }
  }
  if (process.env.LOCALAPPDATA) {
    dirs.push(path.join(process.env.LOCALAPPDATA, 'uv', 'tools', 'graphifyy', 'Scripts'));
  }

  for (const dir of dirs) {
    for (const ext of executableExtensions('graphify-mcp')) {
      const candidate = path.join(dir, 'graphify-mcp' + ext);
      if (existsSync(candidate)) return { command: candidate, args: [GRAPH] };
    }
  }

  const python = findPython();
  if (python) {
    return {
      command: python.command,
      args: [...python.args, '-m', 'graphify.serve', GRAPH],
    };
  }
  return null;
}

function quoteWin(value) {
  return /[\s"&|<>^]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

if (!existsSync(GRAPH)) {
  fail(
    `no graph at ${GRAPH}. Run a Harness stage or \`harness-graph.mjs update\` in the target project, then reload MCP servers. If the host started this server outside your project, set HARNESS_PROJECT to the project root.`,
  );
}

const target = findMcp();
if (!target) {
  fail(
    'could not find graphify-mcp or Python. Install the MCP extra: uv tool install --python 3.12 "graphifyy[mcp]".',
  );
}

let child;
if (IS_WIN && /\.(cmd|bat)$/i.test(target.command)) {
  const line = [target.command, ...target.args].map(quoteWin).join(' ');
  child = spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', line], {
    stdio: 'inherit',
    cwd: ROOT,
    windowsHide: true,
  });
} else {
  child = spawn(target.command, target.args, {
    stdio: 'inherit',
    cwd: ROOT,
    windowsHide: true,
  });
}

child.on('error', (error) => {
  fail(`failed to start the Graphify MCP server: ${error.message}`);
});

child.on('exit', (code, signal) => {
  if (signal) {
    try {
      process.kill(process.pid, signal);
    } catch {
      process.exit(1);
    }
    return;
  }
  process.exit(code ?? 1);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    try {
      child.kill(signal);
    } catch {
      // The child is already gone.
    }
  });
}
