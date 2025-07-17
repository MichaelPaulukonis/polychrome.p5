# Changelog Management

## Automation Rules

**Before any git commit**, ask: "Should I create a changelog entry for these changes?"

For significant non-commit changes, ask: "These changes seem substantial enough to warrant a changelog entry. Create one?"

**Include in changelog:**
- API endpoint changes
- Frontend features or UI changes  
- User-facing bug fixes
- Documentation that affects end users
- Breaking changes or security fixes

**Exclude from changelog:**
- Internal refactoring, tests, build changes
- LLM instruction updates
- Code comments or internal docs

## Semantic Versioning

- **MAJOR**: Breaking changes, API incompatibilities
- **MINOR**: New features, backwards-compatible additions  
- **PATCH**: Bug fixes, backwards-compatible changes

Default to PATCH increment on commits with changelog entries. Ask user to confirm MINOR/MAJOR bumps.

## Format

Use keepachangelog.com format in `CHANGELOG.md`:

```markdown
# Changelog

## [Unreleased]

### Added
- New features

### Changed  
- Modified functionality

### Fixed
- Bug fixes

### Security
- Security improvements

## [1.0.0] - 2024-01-01
### Added
- Initial release
```

## Entry Guidelines

Write clear, user-focused entries:
- "Board archiving functionality with restore option"
- "New GET /api/boards/:id/archive endpoint"
- "Fixed card drag-and-drop position errors"

Avoid vague entries like "Updated some stuff" or "Fixed bugs".