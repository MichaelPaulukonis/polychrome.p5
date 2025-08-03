// Quick script to check git status
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
