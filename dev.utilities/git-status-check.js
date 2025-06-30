/**
 * Git Status Check Utility
 *
 * A development utility to check git repository status when terminal output
 * is not working properly (e.g., during Playwright/Jest conflicts).
 *
 * Usage: node dev.utilities/git-status-check.js
 */
const { execSync } = require('child_process')

try {
  console.log('=== Git Status ===')
  const status = execSync('git status --porcelain', { encoding: 'utf8' })
  console.log(status || 'Working directory clean')

  console.log('\n=== Recent Commits ===')
  const log = execSync('git log --oneline -n 5', { encoding: 'utf8' })
  console.log(log)

  console.log('\n=== Staged Files ===')
  const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' })
  console.log(staged || 'No files staged')

} catch (error) {
  console.error('Error:', error.message)
}
