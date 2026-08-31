import { AppSecProject } from '../types';

export const PRESET_APPSEC_PROJECTS: AppSecProject[] = [
  {
    id: 'proj-ecommerce-api',
    name: 'Enterprise Checkout & Payments Service',
    repoUrl: 'github.com/acme-corp/ecommerce-payments-api',
    branch: 'main',
    lastScanned: '2026-08-26 10:30 UTC',
    healthScore: 68,
    sastFindings: [
      {
        id: 'sast-001',
        ruleId: 'SEC-SQL-INJECTION-01',
        title: 'SQL Injection via Unsanitized Raw Database Query',
        severity: 'CRITICAL',
        cwe: 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command',
        owaspCategory: 'A03:2021-Injection',
        filePath: 'src/controllers/orderController.ts',
        lineNumber: 47,
        codeSnippet: `// Vulnerable: Direct string interpolation in SQL query\nconst { customerId, status } = req.query;\nconst query = \`SELECT * FROM orders WHERE user_id = '\${customerId}' AND status = '\${status}'\`;\nconst results = await db.raw(query);`,
        sourceSinkFlow: {
          source: "req.query.customerId (Untrusted User Input)",
          sanitizer: "None (Direct interpolation)",
          sink: "db.raw(query) (SQL Execution Context)"
        },
        description: 'User-controlled parameters from req.query are concatenated directly into a raw SQL query string without parameterized bindings, enabling attackers to bypass authentication or extract entire database tables.',
        impact: 'Full database compromise, unauthorized data extraction, and potential arbitrary database modification.',
        remediation: 'Use parameterized queries or ORM query builders (e.g., Prisma, Knex with bindings, or TypeORM parameter substitution).',
        aiFixSuggestion: 'Replace raw string interpolation with parameterized SQL query bindings using db.raw(query, [customerId, status]) or db.orders.findMany({ where: { userId: customerId, status } }).',
        fixedCodeSnippet: `// Remediated: Parameterized query binding\nconst { customerId, status } = req.query;\nconst results = await db.raw(\n  'SELECT * FROM orders WHERE user_id = ? AND status = ?',\n  [String(customerId), String(status)]\n);`,
        status: 'open'
      },
      {
        id: 'sast-002',
        ruleId: 'SEC-PATH-TRAVERSAL-02',
        title: 'Arbitrary File Read via Path Traversal',
        severity: 'HIGH',
        cwe: 'CWE-22: Improper Limitation of a Pathname to a Restricted Directory',
        owaspCategory: 'A01:2021-Broken Access Control',
        filePath: 'src/services/receiptService.ts',
        lineNumber: 89,
        codeSnippet: `// Vulnerable: Unsanitized file path construction\nexport async function getReceiptPDF(invoiceName: string) {\n  const fullPath = path.join('/var/data/invoices/', invoiceName);\n  return fs.promises.readFile(fullPath, 'utf8');\n}`,
        sourceSinkFlow: {
          source: "invoiceName parameter (User supplied filename)",
          sanitizer: "path.join (Does not prevent ../ directory traversal)",
          sink: "fs.promises.readFile(fullPath)"
        },
        description: 'The file path is created using path.join with unsanitized user input. An attacker passing `../../etc/passwd` or `../../.env` can traverse out of the restricted invoices directory.',
        impact: 'Unauthorized access to sensitive server files, configuration files, and system credentials.',
        remediation: 'Validate input against an allowlist, sanitize path components, and verify that path.resolve(fullPath).startsWith(allowedBaseDirectory).',
        aiFixSuggestion: 'Normalize and verify the resolved file path against the canonical storage root before reading from disk.',
        fixedCodeSnippet: `export async function getReceiptPDF(invoiceName: string) {\n  const baseDir = path.resolve('/var/data/invoices');\n  const safeFileName = path.basename(invoiceName);\n  const fullPath = path.resolve(baseDir, safeFileName);\n  if (!fullPath.startsWith(baseDir)) {\n    throw new Error('Access denied: Invalid file path traversal detected');\n  }\n  return fs.promises.readFile(fullPath, 'utf8');\n}`,
        status: 'open'
      },
      {
        id: 'sast-003',
        ruleId: 'SEC-SSRF-03',
        title: 'Server-Side Request Forgery (SSRF) in Webhook Dispatcher',
        severity: 'HIGH',
        cwe: 'CWE-918: Server-Side Request Forgery (SSRF)',
        owaspCategory: 'A10:2021-Server-Side Request Forgery',
        filePath: 'src/services/webhookDispatcher.ts',
        lineNumber: 34,
        codeSnippet: `// Vulnerable: Fetching arbitrary user-provided webhook endpoint\nexport async function triggerCustomerWebhook(targetUrl: string, eventData: any) {\n  const response = await fetch(targetUrl, {\n    method: 'POST',\n    body: JSON.stringify(eventData),\n    headers: { 'Content-Type': 'application/json' }\n  });\n  return response.status;\n}`,
        sourceSinkFlow: {
          source: "targetUrl (Client supplied destination URL)",
          sanitizer: "None",
          sink: "fetch(targetUrl, ...)"
        },
        description: 'The application performs outbound HTTP requests to user-provided URLs without validating if the IP points to internal metadata services (e.g. 169.254.169.254, 127.0.0.1, or private VPC ranges).',
        impact: 'Access to internal cloud metadata APIs, sensitive intranet services, and internal container cluster ports.',
        remediation: 'Implement IP range validation to block private/loopback/link-local addresses (RFC 1918, RFC 3927) and enforce allowlists.',
        aiFixSuggestion: 'Enforce an outbound proxy or DNS resolution checker that verifies non-private IPv4/IPv6 destination addresses before dispatching HTTP requests.',
        fixedCodeSnippet: `import { isPrivateIP } from '../utils/ipValidator';\n\nexport async function triggerCustomerWebhook(targetUrl: string, eventData: any) {\n  const parsed = new URL(targetUrl);\n  if (parsed.protocol !== 'https:') {\n    throw new Error('Webhooks must strictly use HTTPS');\n  }\n  if (await isPrivateIP(parsed.hostname)) {\n    throw new Error('SSRF Blocked: Private or link-local address disallowed');\n  }\n  return fetch(targetUrl, { method: 'POST', body: JSON.stringify(eventData) });\n}`,
        status: 'open'
      },
      {
        id: 'sast-004',
        ruleId: 'SEC-XSS-REACT-04',
        title: 'Dangerous HTML Injection via dangerouslySetInnerHTML',
        severity: 'MEDIUM',
        cwe: 'CWE-79: Improper Neutralization of Input During Web Page Generation (XSS)',
        owaspCategory: 'A03:2021-Injection',
        filePath: 'src/components/CustomerNoteViewer.tsx',
        lineNumber: 22,
        codeSnippet: `// Vulnerable: Unsanitized HTML rendering\nexport const CustomerNoteViewer = ({ noteHtml }: { noteHtml: string }) => {\n  return (\n    <div className="note-body" dangerouslySetInnerHTML={{ __html: noteHtml }} />\n  );\n};`,
        description: 'Rendering user-authored customer notes with dangerouslySetInnerHTML without DOMPurify allows stored cross-site scripting (XSS) payload execution in admin consoles.',
        impact: 'Session hijacking, session token exfiltration, and unauthorized action execution in the victim browser.',
        remediation: 'Sanitize HTML with DOMPurify.sanitize(noteHtml) or render plaintext markdown with standard React components.',
        aiFixSuggestion: 'Import DOMPurify and wrap the input HTML in DOMPurify.sanitize().',
        fixedCodeSnippet: `import DOMPurify from 'dompurify';\n\nexport const CustomerNoteViewer = ({ noteHtml }: { noteHtml: string }) => {\n  const cleanHtml = DOMPurify.sanitize(noteHtml);\n  return (\n    <div className="note-body" dangerouslySetInnerHTML={{ __html: cleanHtml }} />\n  );\n};`,
        status: 'resolved'
      }
    ],
    dastProbes: [
      {
        id: 'dast-001',
        name: 'Reflected SQL Injection on Search Query Endpoint',
        url: 'https://api.acme-shop.io/v1/catalog/search?q=\' UNION SELECT 1,version(),3--',
        method: 'GET',
        category: 'Injection',
        testPayload: "' OR 1=1;--",
        responseStatus: 500,
        latencyMs: 142,
        status: 'vulnerable',
        evidence: 'Database error disclosed in HTTP 500 body: "PostgreSQL syntax error near UNION SELECT at character 42".',
        requestHeaders: {
          'Accept': 'application/json',
          'User-Agent': 'Cybershield-DAST-Scanner/2.4'
        },
        responseHeaders: {
          'content-type': 'application/json; charset=utf-8',
          'server': 'nginx/1.24.0'
        },
        responseSnippet: `{\n  "error": "Database query failure",\n  "internalDetail": "PG::SyntaxError: syntax error at or near \\"UNION\\"",\n  "query": "SELECT * FROM products WHERE name LIKE '%%' UNION SELECT 1,version(),3--%%'"\n}`,
        remediation: 'Disable verbose stack traces and SQL error reflection in production. Use parameterized query mechanisms.'
      },
      {
        id: 'dast-002',
        name: 'Broken Object Level Authorization (BOLA / IDOR) on Account Wallet',
        url: 'https://api.acme-shop.io/v1/users/usr_99812/wallet-balance',
        method: 'GET',
        category: 'API Security (BOLA/BFLA)',
        testPayload: 'Header Authorization: Bearer <Victim_Token_usr_44120>',
        responseStatus: 200,
        latencyMs: 88,
        status: 'vulnerable',
        evidence: 'Token for user usr_44120 was successfully able to retrieve private account balances of user usr_99812 without 403 Forbidden.',
        requestHeaders: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          'Accept': 'application/json'
        },
        responseHeaders: {
          'content-type': 'application/json',
          'cache-control': 'no-store'
        },
        responseSnippet: `{\n  "userId": "usr_99812",\n  "availableBalance": 49500.00,\n  "currency": "USD",\n  "payoutMethod": "ACH_****9182"\n}`,
        remediation: 'Enforce server-side object ownership verification middleware: req.user.id must match target record owner before returning wallet resources.'
      },
      {
        id: 'dast-003',
        name: 'Permissive CORS Configuration (Wildcard with Credentials)',
        url: 'https://api.acme-shop.io/v1/auth/session',
        method: 'OPTIONS',
        category: 'Security Headers & CORS',
        testPayload: 'Origin: https://evil-attacker-site.com',
        responseStatus: 204,
        latencyMs: 34,
        status: 'vulnerable',
        evidence: 'Server returned Access-Control-Allow-Origin: https://evil-attacker-site.com and Access-Control-Allow-Credentials: true.',
        requestHeaders: {
          'Origin': 'https://evil-attacker-site.com',
          'Access-Control-Request-Method': 'POST'
        },
        responseHeaders: {
          'Access-Control-Allow-Origin': 'https://evil-attacker-site.com',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        responseSnippet: '(Preflight 204 No Content)',
        remediation: 'Restrict CORS Access-Control-Allow-Origin to strictly vetted trusted company domains; never reflect arbitrary origin when credentials are enabled.'
      },
      {
        id: 'dast-004',
        name: 'Missing Security Headers Audit (HSTS, CSP, X-Frame-Options)',
        url: 'https://api.acme-shop.io/v1/health',
        method: 'GET',
        category: 'Security Headers & CORS',
        testPayload: 'Standard GET probe',
        responseStatus: 200,
        latencyMs: 22,
        status: 'passed',
        evidence: 'Strict-Transport-Security, Content-Security-Policy, and X-Content-Type-Options: nosniff are properly configured.',
        remediation: 'Maintain current Helmet.js security headers.'
      }
    ],
    scaPackages: [
      {
        id: 'sca-001',
        name: 'axios',
        currentVersion: '1.6.8',
        latestVersion: '1.7.9',
        fixVersion: '1.7.7',
        ecosystem: 'npm',
        isDirect: true,
        license: 'MIT',
        licenseRisk: 'PERMISSIVE',
        vulnerabilities: [
          {
            cveId: 'CVE-2024-39338',
            ghsaId: 'GHSA-8hc4-vh64-cxmj',
            severity: 'HIGH',
            cvssScore: 7.5,
            epssScore: 0.24,
            title: 'Axios Server-Side Request Forgery via Absolute URL path bypass',
            description: 'Axios is vulnerable to SSRF when parsing relative path strings combined with attacker-controlled baseURL parameters.',
            affectedRange: '< 1.7.4',
            fixedIn: '1.7.4',
            patchCommand: 'npm install axios@^1.7.7'
          }
        ]
      },
      {
        id: 'sca-002',
        name: 'jsonwebtoken',
        currentVersion: '8.5.1',
        latestVersion: '9.0.2',
        fixVersion: '9.0.2',
        ecosystem: 'npm',
        isDirect: true,
        license: 'MIT',
        licenseRisk: 'PERMISSIVE',
        vulnerabilities: [
          {
            cveId: 'CVE-2022-23529',
            ghsaId: 'GHSA-27h2-hvpr-p74q',
            severity: 'CRITICAL',
            cvssScore: 9.8,
            epssScore: 0.78,
            title: 'Arbitrary Code Execution in jsonwebtoken verify()',
            description: 'Crafted secretOrPublicKey objects passed to jwt.verify() can trigger arbitrary method execution during key retrieval.',
            affectedRange: '< 9.0.0',
            fixedIn: '9.0.0',
            patchCommand: 'npm install jsonwebtoken@^9.0.2'
          }
        ]
      },
      {
        id: 'sca-003',
        name: 'tar',
        currentVersion: '6.1.11',
        latestVersion: '7.4.3',
        fixVersion: '6.2.1',
        ecosystem: 'npm',
        isDirect: false,
        license: 'ISC',
        licenseRisk: 'PERMISSIVE',
        vulnerabilities: [
          {
            cveId: 'CVE-2024-28863',
            ghsaId: 'GHSA-r628-82mt-2cm7',
            severity: 'MEDIUM',
            cvssScore: 6.5,
            epssScore: 0.12,
            title: 'tar Arbitrary File Overwrite via symlink creation',
            description: 'Extracting malicious tar archives can write files outside destination folder via unvalidated relative symlinks.',
            affectedRange: '< 6.2.1',
            fixedIn: '6.2.1',
            patchCommand: 'npm update tar'
          }
        ]
      },
      {
        id: 'sca-004',
        name: 'gpl-analytics-tracker',
        currentVersion: '2.1.0',
        latestVersion: '2.1.0',
        ecosystem: 'npm',
        isDirect: true,
        license: 'GPL-3.0-only',
        licenseRisk: 'VIRAL_COPYLEFT',
        vulnerabilities: []
      }
    ],
    secretFindings: [
      {
        id: 'sec-001',
        type: 'STRIPE_SECRET',
        title: 'Hardcoded Stripe Live Secret Key',
        filePath: 'config/paymentGateway.ts',
        lineNumber: 14,
        maskedSecret: 'sk_live_51Mv98****************************************************8X90',
        entropy: 4.82,
        severity: 'CRITICAL',
        status: 'active',
        remediation: 'Revoke key immediately in Stripe Dashboard. Migrate to environment variables: process.env.STRIPE_SECRET_KEY.'
      },
      {
        id: 'sec-002',
        type: 'AWS_ACCESS_KEY',
        title: 'Exposed AWS IAM Access Key ID',
        filePath: 'deploy/scripts/backup-s3.sh',
        lineNumber: 6,
        maskedSecret: 'AKIAIOSFODNN7EXAMPLE',
        entropy: 4.15,
        severity: 'HIGH',
        status: 'active',
        remediation: 'Deactivate IAM user access key. Switch to AWS IAM Roles for Service Accounts (IRSA) or instance profiles.'
      }
    ],
    iacFindings: [
      {
        id: 'iac-001',
        framework: 'Docker',
        title: 'Container Running as Root User (Missing USER Directive)',
        resourceName: 'Dockerfile:stage-2',
        severity: 'HIGH',
        filePath: 'Dockerfile',
        description: 'Container image defaults to running process as root (UID 0), increasing potential container breakout impact.',
        remediation: 'Add `RUN adduser -D appuser && USER appuser` before the ENTRYPOINT/CMD instruction.'
      },
      {
        id: 'iac-002',
        framework: 'Kubernetes',
        title: 'Pod Security Context Missing ReadOnlyRootFilesystem',
        resourceName: 'Deployment:payments-api',
        severity: 'MEDIUM',
        filePath: 'k8s/deployment.yaml',
        description: 'Container root filesystem is writable, allowing malicious processes or file modifications in runtime.',
        remediation: 'Set `securityContext.readOnlyRootFilesystem: true` and mount ephemeral volumes for temp directories.'
      }
    ]
  },
  {
    id: 'proj-ai-agent-backend',
    name: 'Autonomous Agent Orchestrator & LLM Gateway',
    repoUrl: 'github.com/acme-corp/agent-orchestrator',
    branch: 'release/v2.1',
    lastScanned: '2026-08-26 09:15 UTC',
    healthScore: 84,
    sastFindings: [
      {
        id: 'sast-ai-01',
        ruleId: 'SEC-PROMPT-INJ-01',
        title: 'Unsanitized System Prompt Template Variable Concatenation',
        severity: 'HIGH',
        cwe: 'CWE-20: Improper Input Validation',
        owaspCategory: 'A03:2021-Injection',
        filePath: 'src/agents/promptBuilder.ts',
        lineNumber: 19,
        codeSnippet: `export function buildAgentPrompt(userInput: string, userRole: string) {\n  return \`You are an enterprise AI. User role is \${userRole}. Process request: \${userInput}\`;\n}`,
        description: 'User-provided role and input are merged directly into system instructions without boundary delimiters or role validation.',
        impact: 'Prompt injection, jailbreaking, and unauthorized instruction overriding.',
        remediation: 'Use structured chat messages with distinct "system" and "user" roles and pass boundary tag delimiters.',
        aiFixSuggestion: 'Separate system instructions and user inputs using dedicated Gemini ChatMessage role objects.',
        fixedCodeSnippet: `export function buildAgentPrompt(userInput: string, userRole: string) {\n  const sanitizedRole = ['viewer', 'editor', 'admin'].includes(userRole) ? userRole : 'viewer';\n  return {\n    systemInstruction: \`You are an enterprise AI. The verified user role is: \${sanitizedRole}.\`,\n    userContent: userInput\n  };\n}`,
        status: 'open'
      }
    ],
    dastProbes: [
      {
        id: 'dast-ai-01',
        name: 'LLM Gateway Rate-Limiting & Token Exhaustion Probe',
        url: 'https://gateway.agentforge.internal/v1/completions',
        method: 'POST',
        category: 'Rate Limiting & DoS',
        testPayload: 'Concurrent burst of 250 requests in 2 seconds',
        responseStatus: 429,
        latencyMs: 15,
        status: 'passed',
        evidence: 'HTTP 429 Too Many Requests returned with Retry-After: 30 header.',
        remediation: 'Rate limit policies are actively protecting upstream LLM inference quotas.'
      }
    ],
    scaPackages: [
      {
        id: 'sca-ai-01',
        name: 'langchain',
        currentVersion: '0.1.15',
        latestVersion: '0.3.1',
        fixVersion: '0.2.14',
        ecosystem: 'npm',
        isDirect: true,
        license: 'MIT',
        licenseRisk: 'PERMISSIVE',
        vulnerabilities: []
      }
    ],
    secretFindings: [],
    iacFindings: [
      {
        id: 'iac-ai-01',
        framework: 'Terraform',
        title: 'Open Ingress Security Group to Port 0.0.0.0/0 on LLM Redis Cache',
        resourceName: 'aws_security_group.redis_cluster',
        severity: 'CRITICAL',
        filePath: 'infra/terraform/redis.tf',
        description: 'Redis caching cluster security group permits inbound traffic from 0.0.0.0/0 on port 6379 without VPC peering restriction.',
        remediation: 'Restrict `cidr_blocks` to private application VPC subnets.'
      }
    ]
  }
];

export const SAMPLE_CODE_SNIPPETS: { title: string; language: string; code: string }[] = [
  {
    title: 'Node.js Express / SQLi & Path Traversal',
    language: 'typescript',
    code: `import express from 'express';\nimport path from 'path';\nimport fs from 'fs';\nimport db from './database';\n\nconst app = express();\n\n// 1. SQL Injection finding\napp.get('/api/users', async (req, res) => {\n  const search = req.query.search;\n  const query = "SELECT * FROM users WHERE username = '" + search + "'";\n  const rows = await db.query(query);\n  res.json(rows);\n});\n\n// 2. Path Traversal finding\napp.get('/api/download', (req, res) => {\n  const file = req.query.filename as string;\n  const filePath = path.join(__dirname, 'uploads', file);\n  res.sendFile(filePath);\n});\n\n// 3. Hardcoded Secret finding\nconst JWT_SECRET = "super_secret_jwt_key_123456789";\n\nexport default app;`
  },
  {
    title: 'Python FastAPI / SSRF & Command Injection',
    language: 'python',
    code: `from fastapi import FastAPI, Request\nimport subprocess\nimport requests\nimport os\n\napp = FastAPI()\n\n# 1. Command Injection\n@app.post("/api/ping")\ndef ping_host(host: str):\n    cmd = f"ping -c 1 {host}"\n    output = subprocess.check_output(cmd, shell=True)\n    return {"output": output.decode()}\n\n# 2. SSRF vulnerability\n@app.get("/api/fetch-avatar")\ndef fetch_avatar(url: str):\n    resp = requests.get(url, timeout=5)\n    return {"data": resp.content.hex()}\n\n# 3. Insecure Deserialization\nimport pickle\n@app.post("/api/load-session")\ndef load_session(data: bytes):\n    return pickle.loads(data)`
  },
  {
    title: 'React Client / XSS & Insecure Storage',
    language: 'typescript',
    code: `import React from 'react';\n\nexport function UserProfile({ bio, token }: { bio: string; token: string }) {\n  // 1. Storing sensitive token in localStorage\n  localStorage.setItem('auth_token', token);\n\n  // 2. Dangerous innerHTML without DOMPurify\n  return (\n    <div className="profile">\n      <h2>User Biography</h2>\n      <div dangerouslySetInnerHTML={{ __html: bio }} />\n    </div>\n  );\n}`
  }
];
