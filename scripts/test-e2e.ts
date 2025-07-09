import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';

// Load environment variables from .env file if it exists
dotenv.config();

// --- Print out loaded environment variables for debugging ---
console.log('--- Loaded Environment Variables ---');
const relevantEnvs = [
  'GITHUB_TOKEN',
  'AI_PROVIDER',
  'AI_API_KEY',
  'AI_MODEL',
  'INPUT_GITHUB_TOKEN',
  'INPUT_AI_PROVIDER',
  'INPUT_AI_API_KEY',
  'INPUT_AI_MODEL',
  'INPUT_REVIEW_PROJECT_CONTEXT',
  'INPUT_EXCLUDE_PATTERNS',
  'INPUT_APPROVE_REVIEWS',
  'GITHUB_EVENT_PATH',
  'GITHUB_WORKSPACE',
  'GITHUB_REPOSITORY',
  'GITHUB_CONTEXT',
  // Add any other relevant environment variables you want to inspect
];

relevantEnvs.forEach(envName => {
  // Use a check to avoid printing sensitive tokens if they are undefined
  if (process.env[envName] !== undefined && envName.includes('TOKEN')) {
    console.log(`${envName}: ***** (set)`); // Mask token values
  } else if (process.env[envName] !== undefined && envName.includes('KEY')) {
    console.log(`${envName}: ***** (set)`); // Mask API Key values
  }
  else if (process.env[envName] !== undefined) {
    console.log(`${envName}: ${process.env[envName]}`);
  } else {
    console.log(`${envName}: (not set)`);
  }
});
console.log('------------------------------------');
// ------------------------------------------------------------

// Load the PR ID (using defaults if not provided as command line arguments)
const owner = process.argv[2] || 'demandio';
const repo = process.argv[3] || 'simplycodes-extension';
const prId = process.argv[4] || 982;
// Note: process.argv[4] is used for both prId and projectContext.
// If you intend for these to be different, you'll need another argument index.
// For now, assuming projectContext should be derived or is the same argument index.
const projectContext = process.argv[5] || 'This is a browser extension for SimplyCodes'; // Moved to argv[5] to avoid conflict with prId

// Read the PR payload
const prPayload = JSON.parse(
  readFileSync(resolve(__dirname, `./pull-requests/test-pr-payload-${prId}.json`), 'utf8')
);

// Set required environment variables for the action (simulating GitHub Actions context)
process.env.GITHUB_EVENT_PATH = resolve(__dirname, `./pull-requests/test-pr-payload-${prId}.json`);
process.env.GITHUB_WORKSPACE = resolve(__dirname, '..');
process.env.GITHUB_REPOSITORY = `${owner}/${repo}`;
process.env.GITHUB_CONTEXT = JSON.stringify({
  event: prPayload,
  payload: prPayload
});

// IMPORTANT: Make sure the token is set before setting INPUT_GITHUB_TOKEN
// This logic prioritizes an existing GITHUB_TOKEN (potentially from .env or system)
// over INPUT_GITHUB_TOKEN (which is simulated here).
process.env.GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.INPUT_GITHUB_TOKEN;

// Set action inputs (these would normally come from action.yml)
// These lines now prioritize values potentially loaded from .env or other sources
// over the hardcoded defaults or previous values.
process.env.INPUT_GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Ensure INPUT_GITHUB_TOKEN is set from the determined GITHUB_TOKEN
process.env.INPUT_AI_PROVIDER = process.env.INPUT_AI_PROVIDER || process.env.AI_PROVIDER || 'openai'; // Prioritize INPUT_AI_PROVIDER, then AI_PROVIDER from .env, then default
process.env.INPUT_AI_API_KEY = process.env.INPUT_AI_API_KEY || process.env.AI_API_KEY || process.env.OPENAI_API_KEY; // Prioritize INPUT_AI_API_KEY, then AI_API_KEY/OPENAI_API_KEY from .env, then fallback
process.env.INPUT_AI_MODEL = process.env.INPUT_AI_MODEL || process.env.AI_MODEL || 'gpt-4o-mini'; // Prioritize INPUT_AI_MODEL, then AI_MODEL from .env, then default
// process.env.INPUT_REVIEW_MAX_COMMENTS = process.env.INPUT_REVIEW_MAX_COMMENTS || '10';
process.env.INPUT_EXCLUDE_PATTERNS = process.env.INPUT_EXCLUDE_PATTERNS || '**/*.lock,**/*.json,**/*.md';
process.env.INPUT_APPROVE_REVIEWS = process.env.INPUT_APPROVE_REVIEWS || 'true';
process.env.INPUT_REVIEW_PROJECT_CONTEXT = process.env.INPUT_REVIEW_PROJECT_CONTEXT || projectContext; // Prioritize INPUT_REVIEW_PROJECT_CONTEXT, then the derived projectContext

// Run the action
require('../lib/src/main');
