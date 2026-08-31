import { VaptFinding, VaptTargetScope, VaptTestVector, VaptAuditReport } from '../types';

export const PRESET_VAPT_SCOPES: VaptTargetScope[] = [
  {
    id: 'scope-fintech-api',
    name: 'Fintech Core Banking & Payment Gateway',
    targetUrl: 'https://api-staging.agentforge.bank/v1',
    environment: 'Staging',
    authType: 'Bearer JWT',
    authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjdXN0XzkwMjkxIiwicm9sZSI6InVzZXIifQ.sample',
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    exclusionPaths: ['/v1/auth/reset-password-force', '/v1/system/purge-all-data'],
    rateLimitReqPerSec: 15,
    stealthMode: false,
  },
  {
    id: 'scope-identity-sso',
    name: 'Customer Identity & OAuth 2.0 Auth Server',
    targetUrl: 'https://sso-auth.internal.corp',
    environment: 'Cloud Microservice',
    authType: 'OAuth2',
    authToken: 'oauth_token_sec_test_client_99410',
    allowedMethods: ['GET', 'POST'],
    exclusionPaths: ['/oauth/v2/admin/revoke-all'],
    rateLimitReqPerSec: 25,
    stealthMode: true,
  },
  {
    id: 'scope-graphql-data',
    name: 'Unified GraphQL Analytics Gateway',
    targetUrl: 'https://analytics-gql.agentforge.io/graphql',
    environment: 'Staging',
    authType: 'API Key',
    authToken: 'x-api-key: dev_analytics_sec_audit_881',
    allowedMethods: ['POST'],
    exclusionPaths: [],
    rateLimitReqPerSec: 10,
    stealthMode: false,
  },
];

export const PRESET_VAPT_TEST_VECTORS: VaptTestVector[] = [
  {
    id: 'vec-bola-idor',
    name: 'Broken Object Level Authorization (BOLA / IDOR)',
    category: 'BUSINESS_LOGIC_BOLA',
    cwe: 'CWE-639: Authorization Bypass Through User-Controlled Key',
    owaspRef: 'API1:2023 - Broken Object Level Authorization',
    mitreTechnique: 'T1552 - Unsecured Credentials / Insecure Direct Object Access',
    defaultSeverity: 'CRITICAL',
    description: 'Verifies whether user token A can access, modify, or delete tenant resources belonging to user B by altering URL or JSON identifiers.',
    testPayload: 'GET /v1/accounts/acc_9921_VICTIM/transfers HTTP/1.1\nAuthorization: Bearer <Attacker_Token_UserB>\nHost: api.agentforge.bank',
    expectedBehavior: '403 Forbidden with strict tenant ownership validation',
    vulnerableSignature: 'HTTP/1.1 200 OK with sensitive victim financial balance / history payload',
  },
  {
    id: 'vec-jwt-alg-none',
    name: 'JWT Algorithm Confusion & "None" Signing Exploit',
    category: 'CRYPTO_JWT_TAMPER',
    cwe: 'CWE-347: Improper Verification of Cryptographic Signature',
    owaspRef: 'API2:2023 - Broken Authentication',
    mitreTechnique: 'T1556 - Modify Authentication Process',
    defaultSeverity: 'CRITICAL',
    description: 'Tests if the authentication backend accepts unverified JSON Web Tokens with header {"alg": "none"} or asymmetric RS256/HS256 key confusion.',
    testPayload: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VySWQiOiJhZG1pbiIsInJvbGUiOiJzdXBlcl9hZG1pbiIsImlhdCI6MTY3MjUzNjAwMH0.',
    expectedBehavior: '401 Unauthorized - signature verification failed',
    vulnerableSignature: 'HTTP/1.1 200 OK with role: super_admin privileged capabilities granted',
  },
  {
    id: 'vec-ssrf-imds',
    name: 'Server-Side Request Forgery (SSRF) to Cloud IMDSv1',
    category: 'SSRF_CLOUD_METADATA',
    cwe: 'CWE-918: Server-Side Request Forgery (SSRF)',
    owaspRef: 'API7:2023 - Server Side Request Forgery',
    mitreTechnique: 'T1552.005 - Cloud Instance Metadata API Exfiltration',
    defaultSeverity: 'HIGH',
    description: 'Probes webhook or document ingestion parameters against link-local addresses (169.254.169.254) and internal VPC subnets (10.0.0.0/8, 127.0.0.1).',
    testPayload: 'POST /v1/webhooks/validate HTTP/1.1\nContent-Type: application/json\n\n{"callbackUrl": "http://169.254.169.254/latest/meta-data/iam/security-credentials/"}',
    expectedBehavior: '400 Bad Request with IP Whitelist filter rejecting non-public routable addresses',
    vulnerableSignature: 'Response echoes IAM role credentials or internal service banner',
  },
  {
    id: 'vec-sqli-time-blind',
    name: 'Time-Based Blind SQL Injection in Filter Parameter',
    category: 'SERVER_SIDE_INJECTION',
    cwe: 'CWE-89: SQL Injection',
    owaspRef: 'A03:2021 - Injection',
    mitreTechnique: 'T1190 - Exploit Public-Facing Application',
    defaultSeverity: 'CRITICAL',
    description: 'Tests if database queries evaluate arbitrary SQL sleep/benchmark commands when passed in sorting or search query parameters.',
    testPayload: "GET /v1/transactions?sort=created_at;SELECT+pg_sleep(5)-- HTTP/1.1\nHost: api.agentforge.bank",
    expectedBehavior: 'Query rejected with 400 Invalid Parameter or parameterized column lookup in <15ms',
    vulnerableSignature: 'Server response is delayed by 5,000ms+ indicating backend database sleep execution',
  },
  {
    id: 'vec-gql-batch-dos',
    name: 'GraphQL Query Depth & Circular Batching Amplification',
    category: 'GRAPHQL_BATCHING',
    cwe: 'CWE-400: Uncontrolled Resource Consumption',
    owaspRef: 'API4:2023 - Unrestricted Resource Consumption',
    mitreTechnique: 'T1499 - Endpoint Denial of Service',
    defaultSeverity: 'HIGH',
    description: 'Injects deeply nested circular GraphQL queries or 1,000+ batched alias queries to evaluate backend query complexity limiting.',
    testPayload: 'POST /graphql HTTP/1.1\nContent-Type: application/json\n\n{"query": "query { user { friends { friends { friends { friends { id name } } } } } }"}',
    expectedBehavior: '400 Bad Request: Query depth limit exceeded (Max allowed: 4 levels)',
    vulnerableSignature: '504 Gateway Timeout or high CPU utilization spike across database workers',
  },
  {
    id: 'vec-cors-wildcard-origin',
    name: 'Permissive CORS with Access-Control-Allow-Credentials',
    category: 'CORS_SECURITY_HEADERS',
    cwe: 'CWE-942: Permissive Cross-Domain Policy with Untrusted Domains',
    owaspRef: 'A05:2021 - Security Misconfiguration',
    mitreTechnique: 'T1557 - Adversary-in-the-Middle',
    defaultSeverity: 'MEDIUM',
    description: 'Sends request with Origin: https://evil-attacker.com and checks if server reflects arbitrary origin with Access-Control-Allow-Credentials: true.',
    testPayload: 'OPTIONS /v1/user/profile HTTP/1.1\nOrigin: https://evil-hacker.com\nAccess-Control-Request-Method: GET\nHost: api.agentforge.bank',
    expectedBehavior: 'Origin rejected or matched strictly against authorized domain whitelist',
    vulnerableSignature: 'Access-Control-Allow-Origin: https://evil-hacker.com and Access-Control-Allow-Credentials: true',
  },
];

export const PRESET_VAPT_FINDINGS: VaptFinding[] = [
  {
    id: 'vapt-fnd-01',
    title: 'BOLA / IDOR in Account Statement Retrieval',
    category: 'BUSINESS_LOGIC_BOLA',
    severity: 'CRITICAL',
    cvssScore: 9.1,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N',
    cwe: 'CWE-639',
    owaspId: 'API1:2023',
    mitreId: 'T1552',
    targetUrl: 'https://api-staging.agentforge.bank/v1/accounts/acc_9921_VICTIM/transfers',
    httpMethod: 'GET',
    testPayloadUsed: 'GET /v1/accounts/acc_9921_VICTIM/transfers HTTP/1.1\nAuthorization: Bearer <Attacker_Token_UserB>',
    proofOfConcept: `HTTP/1.1 200 OK
Content-Type: application/json
X-RateLimit-Remaining: 98

{
  "account_id": "acc_9921_VICTIM",
  "owner_name": "Alexander Hamilton",
  "current_balance_cents": 14205000,
  "recent_transfers": [
    { "id": "tx_881", "amount": 50000, "recipient_iban": "DE89370400440532013000" }
  ]
}`,
    impact: 'Unauthenticated/Cross-tenant users can query any arbitrary user statement and balance without owning the account.',
    exploitChain: [
      { step: '1. Reconnaissance', actor: 'Attacker (User B)', outcome: 'Discovered sequential account ID pattern acc_{0000..9999}' },
      { step: '2. Header Tampering', actor: 'Attacker (User B)', outcome: 'Sent GET request with own valid token but Victim account ID in path' },
      { step: '3. Data Leakage', actor: 'API Gateway', outcome: 'API retrieved victim database record without tenancy ownership check' },
    ],
    remediationGuide: 'Enforce tenant-level authorization middleware using JWT claims. Always query `WHERE account_id = :id AND user_id = :authenticated_user_id`.',
    patchCode: `// Fixed Middleware & SQL Query
export async function getAccountTransfers(req: Request, res: Response) {
  const { accountId } = req.params;
  const currentUserId = req.user.id; // Extracted from verified JWT

  const account = await db.query(
    'SELECT * FROM accounts WHERE id = $1 AND user_id = $2',
    [accountId, currentUserId]
  );

  if (!account.rows.length) {
    return res.status(403).json({ error: 'Access forbidden: unauthorized account' });
  }

  return res.json(account.rows[0]);
}`,
    status: 'VULNERABLE',
  },
  {
    id: 'vapt-fnd-02',
    title: 'Blind SQL Injection in Dynamic Transaction Filter',
    category: 'SERVER_SIDE_INJECTION',
    severity: 'CRITICAL',
    cvssScore: 9.8,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    cwe: 'CWE-89',
    owaspId: 'A03:2021',
    mitreId: 'T1190',
    targetUrl: 'https://api-staging.agentforge.bank/v1/transactions',
    httpMethod: 'GET',
    testPayloadUsed: "GET /v1/transactions?sort=created_at;SELECT+pg_sleep(5)-- HTTP/1.1",
    proofOfConcept: `HTTP/1.1 200 OK
Time-Elapsed: 5,082ms (Sleep Confirmation)
Content-Type: application/json

[
  { "id": "tx_1", "amount": 100 }
]`,
    impact: 'Attacker can extract entire database contents, user passwords, and credit card credentials via timing or boolean inference.',
    exploitChain: [
      { step: '1. Parameter Injection', actor: 'Attacker', outcome: 'Appended pg_sleep(5) to sort query parameter' },
      { step: '2. Execution', actor: 'PostgreSQL Server', outcome: 'Server delayed response by 5 seconds, confirming dynamic query concatenation' },
    ],
    remediationGuide: 'Use a strict column whitelist for ORDER BY clauses and parameterized queries for all WHERE conditions.',
    patchCode: `const ALLOWED_SORT_COLUMNS = ['created_at', 'amount', 'status'];
const sortColumn = ALLOWED_SORT_COLUMNS.includes(req.query.sort) ? req.query.sort : 'created_at';
const sortOrder = req.query.order === 'asc' ? 'ASC' : 'DESC';

const query = \`SELECT * FROM transactions WHERE user_id = $1 ORDER BY \${sortColumn} \${sortOrder}\`;
const result = await db.query(query, [req.user.id]);`,
    status: 'VULNERABLE',
  },
  {
    id: 'vapt-fnd-03',
    title: 'Server-Side Request Forgery (SSRF) in Webhook Dispatcher',
    category: 'SSRF_CLOUD_METADATA',
    severity: 'HIGH',
    cvssScore: 8.6,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:N/A:N',
    cwe: 'CWE-918',
    owaspId: 'API7:2023',
    mitreId: 'T1552.005',
    targetUrl: 'https://api-staging.agentforge.bank/v1/webhooks/test',
    httpMethod: 'POST',
    testPayloadUsed: '{"targetUrl": "http://169.254.169.254/latest/meta-data/iam/security-credentials/"}',
    proofOfConcept: `HTTP/1.1 200 OK
Content-Type: application/json

{
  "webhook_status": 200,
  "response_preview": "aws-ecs-production-worker-role"
}`,
    impact: 'Enables exfiltration of AWS IAM temporary credentials, leading to total cloud container breakout and AWS account compromise.',
    exploitChain: [
      { step: '1. Target Submission', actor: 'Attacker', outcome: 'Supplied AWS IMDS link-local IP in webhook endpoint field' },
      { step: '2. Server Fetch', actor: 'Backend Worker', outcome: 'Worker executed unvalidated HTTP request inside cloud VPC' },
      { step: '3. IAM Role Stolen', actor: 'Attacker', outcome: 'Harvested IAM security credentials from HTTP response body' },
    ],
    remediationGuide: 'Enforce private IP resolution blocking (127.0.0.1, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.169.254) and require IMDSv2.',
    patchCode: `import ipaddr from 'ipaddr.js';
import dns from 'dns/promises';

async function isSafeUrl(urlString: string): Promise<boolean> {
  const parsed = new URL(urlString);
  if (!['http:', 'https:'].includes(parsed.protocol)) return false;

  const lookup = await dns.lookup(parsed.hostname);
  const ip = ipaddr.parse(lookup.address);
  
  if (ip.range() !== 'unicast' || ip.range() === 'private' || ip.range() === 'loopback' || ip.range() === 'linkLocal') {
    return false; // Blocks 169.254.169.254 & private IPs
  }
  return true;
}`,
    status: 'VULNERABLE',
  },
];

export const PRESET_VAPT_REPORT: VaptAuditReport = {
  id: 'vapt-rep-2026-08',
  title: 'Comprehensive Web & API Penetration Testing Assessment',
  targetName: 'AgentForge Core Fintech & Banking Infrastructure',
  auditDate: 'August 2026',
  auditor: 'Autonomous VAPT Security Engine (PTES & OWASP ASVS v4.0)',
  overallRiskScore: 78,
  totalTestsRun: 142,
  findingsCount: {
    critical: 2,
    high: 1,
    medium: 3,
    low: 4,
    info: 8,
  },
  complianceSummary: {
    pciDss: 'FAILED',
    soc2: 'CONDITIONAL',
    iso27001: 'CONDITIONAL',
    owaspAsvsLevel: 'ASVS Level 2',
  },
  findings: PRESET_VAPT_FINDINGS,
};
