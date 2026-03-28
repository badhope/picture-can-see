# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Picture Can See seriously. If you have discovered a security vulnerability, we appreciate your help in disclosing it to us in a responsible manner.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **GitHub Security Advisory** (Preferred)
   - Go to the [Security tab](https://github.com/badhope/picture-can-see/security) of our repository
   - Click "Report a vulnerability"
   - Fill out the form with details about the vulnerability

2. **Email**
   - Send an email to the maintainers
   - Include "SECURITY: Picture Can See" in the subject line
   - Provide a detailed description of the vulnerability

### What to Include

When reporting a vulnerability, please include:

- **Description**: A clear description of the vulnerability
- **Impact**: What could an attacker achieve?
- **Reproduction**: Step-by-step instructions to reproduce the issue
- **Proof of Concept**: Code or screenshots demonstrating the vulnerability (if applicable)
- **Suggested Fix**: If you have ideas for how to fix the issue
- **Your Details**: Your name/handle for credit (optional)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Triage**: Within 7 days
- **Fix Development**: Depends on severity and complexity
- **Disclosure**: After fix is released

### Disclosure Policy

- We will acknowledge your report within 48 hours
- We will provide a detailed response within 7 days
- We will keep you informed about the progress of the fix
- We will credit you in the security advisory (unless you prefer to remain anonymous)

## Security Best Practices

When using Picture Can See:

### Data Privacy

- **Local Processing**: All data processing happens locally on your device
- **No Data Upload**: Your data is never sent to external servers
- **Offline Capable**: The application works without internet connection

### Desktop Application

- **Download from Official Sources**: Only download from our official GitHub releases
- **Verify Checksums**: Verify file checksums when available
- **Keep Updated**: Always use the latest version

### Web Version

- **HTTPS Only**: Always access via HTTPS
- **Clear Browser Data**: Clear sensitive data from browser after use
- **Private Browsing**: Consider using private/incognito mode for sensitive data

## Known Security Considerations

### File Handling

- The application parses various file formats (CSV, Excel, JSON)
- Maliciously crafted files could potentially cause issues
- We implement input validation and sanitization
- Always verify the source of data files

### Electron Security

- Context isolation is enabled
- Node integration is disabled in renderer
- Remote modules are disabled
- Content Security Policy is implemented

## Security Features

### Application Security

- **Sandboxed Renderer**: The web content runs in a sandboxed environment
- **No Remote Code**: No remote code execution capabilities
- **Secure IPC**: Inter-process communication is secured via preload scripts
- **Input Validation**: All user inputs are validated and sanitized

### Data Security

- **Local Storage Only**: Data is stored locally and never transmitted
- **No Telemetry**: No usage data is collected or transmitted
- **No Analytics**: No tracking or analytics are implemented

## Security Updates

Security updates are released as patch versions (e.g., 1.0.1, 1.0.2).

To stay informed about security updates:

- Watch the repository on GitHub
- Subscribe to GitHub releases
- Check the [Security Advisories](https://github.com/badhope/picture-can-see/security/advisories) page

## Contact

For any security-related questions or concerns:

- GitHub Security: [Security Tab](https://github.com/badhope/picture-can-see/security)
- Issues: For non-sensitive security questions, use [GitHub Issues](https://github.com/badhope/picture-can-see/issues)

---

Thank you for helping keep Picture Can See and its users safe!
