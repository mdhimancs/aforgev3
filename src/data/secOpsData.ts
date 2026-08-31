import {
  SiemLogEvent,
  SiemHuntQuery,
  SoarPlaybook,
  XdrIncidentStory,
  AiPentestCampaign,
  KillChainStageInfo,
  KillChainCampaign,
  AttackTreeScenario,
  ThreatHuntHypothesis,
  ThreatHuntFinding,
  OsintInvestigationReport,
  SpireWorkloadEntry,
  SpireNodeAgent,
  StripeSubscriptionPlan,
  StripeInvoiceItem
} from '../types';

export const SAMPLE_SIEM_LOGS: SiemLogEvent[] = [
  {
    id: 'log-001',
    timestamp: '2026-08-26T11:20:14Z',
    source: 'Okta SSO',
    host: 'sso.agentforge.corp',
    user: 'j.doe@agentforge.corp',
    rawMessage: 'UserLoginFailure: consecutive 14 failed attempts from IP 185.220.101.44 (Tor Exit Node) followed by single successful MFA approval via Push.',
    anomalyScore: 94,
    aiClassification: 'MFA Fatigue Attack / Credential Stuffing',
    isAnomalous: true,
    category: 'Auth',
  },
  {
    id: 'log-002',
    timestamp: '2026-08-26T11:21:05Z',
    source: 'CrowdStrike EDR',
    host: 'prod-fintech-node-04.us-east.corp',
    user: 'SYSTEM',
    rawMessage: 'ProcessExecution: powershell.exe -NoP -NonI -W Hidden -Exec Bypass -Enc JABjAGwAaQBlAG4AdAA... spawning vssadmin.exe delete shadows /all /quiet',
    anomalyScore: 99,
    aiClassification: 'Ransomware Shadow Copy Deletion (T1490)',
    isAnomalous: true,
    category: 'Execution',
  },
  {
    id: 'log-003',
    timestamp: '2026-08-26T11:21:48Z',
    source: 'AWS CloudTrail',
    host: 'aws:iam::884920194820',
    user: 'dev-deployer-role',
    rawMessage: 'AttachUserPolicy: user "contractor-temp" granted AdministratorAccess from novel geolocation IP 45.142.193.18',
    anomalyScore: 89,
    aiClassification: 'Cloud Privilege Escalation (T1078.004)',
    isAnomalous: true,
    category: 'CloudAPI',
  },
  {
    id: 'log-004',
    timestamp: '2026-08-26T11:22:30Z',
    source: 'Zeek NDR',
    host: 'core-edge-gw-01',
    user: 'svc_analytics',
    rawMessage: 'DNS_Tunneling_Alert: High entropy domain query spike: 3,420 TXT requests to *.c2-command-nexus.xyz within 60s, byte volume: 4.8MB',
    anomalyScore: 92,
    aiClassification: 'DNS Exfiltration / C2 Beaconing (T1071.004)',
    isAnomalous: true,
    category: 'Network',
  },
  {
    id: 'log-005',
    timestamp: '2026-08-26T11:23:12Z',
    source: 'Kubernetes Audit',
    host: 'k8s-prod-cluster-apac',
    user: 'system:serviceaccount:default:vault-agent',
    rawMessage: 'PodExec: Container exec into pod "payment-service-7f89d" with command ["/bin/sh", "-c", "cat /var/run/secrets/kubernetes.io/serviceaccount/token"]',
    anomalyScore: 85,
    aiClassification: 'Container Service Account Credential Dumping',
    isAnomalous: true,
    category: 'Privilege',
  },
  {
    id: 'log-006',
    timestamp: '2026-08-26T11:24:02Z',
    source: 'Palo Alto FW',
    host: 'fw-perimeter-sg-01',
    user: 'anonymous',
    rawMessage: 'ThreatDetection: Outbound TCP connect to Known Malicious IP 194.26.29.112 on port 4444. Session dropped by inline App-ID.',
    anomalyScore: 78,
    aiClassification: 'Reverse Shell C2 Callback Blocked',
    isAnomalous: true,
    category: 'Network',
  },
  {
    id: 'log-007',
    timestamp: '2026-08-26T11:24:45Z',
    source: 'Syslog',
    host: 'db-aurora-postgres-01',
    user: 'pg_admin',
    rawMessage: 'QueryExecution: SELECT pg_read_file("/etc/shadow", 0, 1000) executed from unauthorized internal microservice 10.0.4.18',
    anomalyScore: 96,
    aiClassification: 'SQL Database File Disclosure Injection',
    isAnomalous: true,
    category: 'DataAccess',
  },
];

export const PRESET_SIEM_HUNT_QUERIES: SiemHuntQuery[] = [
  {
    id: 'hunt-1',
    naturalQuery: 'Find all impossible travel logins followed by privilege escalation or shadow copy deletions',
    generatedKql: `SigninLogs
| where ResultType == 0
| extend City = tostring(LocationDetails.city), Country = tostring(LocationDetails.countryOrRegion)
| serialize
| extend PrevTime = prev(TimeGenerated), PrevCountry = prev(Country), PrevUser = prev(UserPrincipalName)
| where UserPrincipalName == PrevUser and Country != PrevCountry and (TimeGenerated - PrevTime) < 1h
| join kind=inner (
    DeviceProcessEvents
    | where ProcessCommandLine has_any ("vssadmin", "delete shadows", "wmic shadowcopy delete", "AdministratorAccess")
) on $left.UserPrincipalName == $right.AccountName`,
    generatedSpl: `index=sec_auth sourcetype=okta:json eventType=user.authentication.verify
| transaction userId maxspan=1h
| eval country_count=distinct_count(src_country)
| where country_count > 1
| join type=inner userId [search index=sec_edr CommandLine IN ("*vssadmin*", "*delete shadows*", "*AttachUserPolicy*")]`,
    matchedCount: 3,
    aiRationale: 'Correlates geographically disparate MFA logins with subsequent administrative process invocations to detect compromised session hijackings.',
    threatLikelihood: 'CRITICAL',
  },
  {
    id: 'hunt-2',
    naturalQuery: 'Detect high-volume DNS tunneling or encrypted staging to unsanctioned external cloud endpoints',
    generatedKql: `DnsEvents
| where QueryType == "TXT" or QueryType == "NULL"
| extend Subdomain = extract("([^.]+\\.[^.]+)$", 1, Name)
| summarize QueryCount = count(), TotalBytes = sum(AnswerLength) by Subdomain, ClientIP, bin(TimeGenerated, 5m)
| where QueryCount > 500 or TotalBytes > 2000000
| extend EntropyScore = entropy(Subdomain)
| where EntropyScore > 4.2`,
    generatedSpl: `index=network sourcetype=zeek:dns (qtype_name="TXT" OR qtype_name="NULL")
| stats count as total_queries sum(response_len) as bytes by query, src_ip
| eval query_len=len(query)
| where total_queries > 500 OR query_len > 60
| sort - total_queries`,
    matchedCount: 5,
    aiRationale: 'Analyzes Shannon entropy and burst frequencies in DNS payload length to flag covert data staging channels bypassing standard firewall proxies.',
    threatLikelihood: 'HIGH',
  },
  {
    id: 'hunt-3',
    naturalQuery: 'Identify anomalous AWS IAM role assumption from non-corporate VPN IP ranges executing destructive API actions',
    generatedKql: `AWSCloudTrail
| where EventName in ("DeleteBucket", "DeleteTrail", "StopLogging", "PutBucketPolicy", "AttachUserPolicy")
| extend SourceIP = tostring(parse_json(SourceIPAddress))
| where not(ipv4_is_in_range(SourceIP, "10.0.0.0/8")) and not(ipv4_is_in_range(SourceIP, "192.168.0.0/16"))
| summarize EventCount=count(), Actions=make_set(EventName) by UserIdentityArn, SourceIP, bin(TimeGenerated, 15m)
| where EventCount > 1`,
    generatedSpl: `index=aws_cloudtrail eventName IN ("DeleteBucket", "DeleteTrail", "StopLogging", "AttachUserPolicy")
| search NOT src_ip IN ("10.0.0.0/8", "172.16.0.0/12")
| stats count values(eventName) as actions by userIdentity.arn, src_ip
| where count > 1`,
    matchedCount: 2,
    aiRationale: 'Identifies unauthorized administrative persistence operations originating from unmanaged public IP addresses.',
    threatLikelihood: 'HIGH',
  },
];

export const SAMPLE_SOAR_PLAYBOOKS: SoarPlaybook[] = [
  {
    id: 'soar-pb-1',
    name: 'Autonomous Ransomware Blast Radius Containment',
    triggerEvent: 'EDR Alert: Shadow Copy Deletion + Rapid File Encryption Detected (T1490)',
    description: 'Instant multi-plane isolation protocol that isolates infected hosts, dumps volatility memory for forensics, kills active C2 network flows, and freezes user AD credentials.',
    category: 'Ransomware Containment',
    confidenceThreshold: 90,
    autoExecute: true,
    status: 'IDLE',
    steps: [
      {
        id: 'step-1',
        order: 1,
        title: 'EDR Endpoint Network Isolation',
        actionType: 'EDR_ISOLATE',
        targetSystem: 'CrowdStrike Falcon API',
        params: { hostId: 'prod-fintech-node-04', isolationLevel: 'RESTRICTIVE_FULL' },
        status: 'PENDING',
        autoRollbackAvailable: true,
      },
      {
        id: 'step-2',
        order: 2,
        title: 'Acquire Live Volatility Memory Dump & Process Tree',
        actionType: 'REST_API',
        targetSystem: 'Velociraptor IR Server',
        params: { hostId: 'prod-fintech-node-04', dumpPath: 's3://secops-forensics-vault-prod/' },
        status: 'PENDING',
        autoRollbackAvailable: false,
      },
      {
        id: 'step-3',
        order: 3,
        title: 'Perimeter Firewall Dynamic IP Blacklist Push',
        actionType: 'FIREWALL_BLOCK',
        targetSystem: 'Palo Alto Panorama API',
        params: { maliciousIps: ['194.26.29.112', '185.220.101.44'], blockDurationHours: 72 },
        status: 'PENDING',
        autoRollbackAvailable: true,
      },
      {
        id: 'step-4',
        order: 4,
        title: 'Revoke Active Okta SSO & Active Directory Kerberos Tickets',
        actionType: 'IAM_REVOKE',
        targetSystem: 'Okta / Azure Entra ID',
        params: { userPrincipal: 'j.doe@agentforge.corp', forcePasswordReset: true },
        status: 'PENDING',
        autoRollbackAvailable: false,
      },
      {
        id: 'step-5',
        order: 5,
        title: 'Emergency SecOps Command Slack Channel Broadcast',
        actionType: 'SLACK_ALERT',
        targetSystem: 'Slack SecOps Webhook',
        params: { channel: '#incident-p1-ransomware-war-room', severity: 'P1-CRITICAL' },
        status: 'PENDING',
        autoRollbackAvailable: false,
      },
    ],
  },
  {
    id: 'soar-pb-2',
    name: 'Cloud IAM Privilege Escalation & Rogue VM Neutralizer',
    triggerEvent: 'CloudTrail Alert: Unauthorized Admin Role Binding from Untrusted ASN (T1078)',
    description: 'Autonomous AWS containment that strips excessive IAM policies, revokes STS session tokens, and terminates rogue compute nodes.',
    category: 'Cloud IAM Exfiltration',
    confidenceThreshold: 85,
    autoExecute: false,
    status: 'IDLE',
    steps: [
      {
        id: 'step-1',
        order: 1,
        title: 'Detach AdministratorAccess Policy & Attach Inline DenyAll',
        actionType: 'IAM_REVOKE',
        targetSystem: 'AWS IAM Management API',
        params: { roleArn: 'arn:aws:iam::884920194820:user/contractor-temp', policy: 'AWS_DENY_ALL_INLINE' },
        status: 'PENDING',
        autoRollbackAvailable: true,
      },
      {
        id: 'step-2',
        order: 2,
        title: 'Invalidate All Active STS AssumeRole Sessions',
        actionType: 'IAM_REVOKE',
        targetSystem: 'AWS STS Service',
        params: { maxSessionAgeMinutes: 0 },
        status: 'PENDING',
        autoRollbackAvailable: false,
      },
      {
        id: 'step-3',
        order: 3,
        title: 'Identify and Terminate Unauthorized Crypto-Mining EC2 Instances',
        actionType: 'REST_API',
        targetSystem: 'AWS EC2 API',
        params: { tags: { CreatedBy: 'contractor-temp' }, dryRun: false },
        status: 'PENDING',
        autoRollbackAvailable: false,
      },
      {
        id: 'step-4',
        order: 4,
        title: 'Security Lead Approval Gate for Permanent Account Suspension',
        actionType: 'HUMAN_APPROVAL',
        targetSystem: 'Jira Service Management / SOC Portal',
        params: { requiredRole: 'Lead Security Incident Commander' },
        status: 'PENDING',
        autoRollbackAvailable: false,
      },
    ],
  },
];

export const SAMPLE_XDR_INCIDENTS: XdrIncidentStory[] = [
  {
    id: 'xdr-inc-902',
    title: 'Cross-Vector APT Intrusion: Phishing to Cloud S3 Exfiltration & EDR Bypass',
    threatActorGroup: 'UNC4899 (Lazarus Sub-Cluster / Cloud Hopper)',
    severity: 'CRITICAL',
    status: 'INVESTIGATING',
    rootCause: 'Targeted spear-phishing email containing weaponized OAuth consent grant granting mail.read followed by API session theft.',
    killChainStage: 'Exfiltration',
    affectedVectors: ['EMAIL', 'IDENTITY', 'ENDPOINT', 'CLOUD', 'NETWORK'],
    nodes: [
      { id: 'node-threat-actor', label: 'Threat Actor (UNC4899)', type: 'THREAT_ACTOR', iconName: 'Skull', riskScore: 100, details: 'IP: 194.26.29.112, ASN 49505' },
      { id: 'node-email', label: 'Spear Phishing Email', type: 'IDENTITY', iconName: 'Mail', riskScore: 85, details: 'Subject: Urgent: Executive Equity Grant DocuSign' },
      { id: 'node-victim-user', label: 'j.doe@agentforge.corp', type: 'IDENTITY', iconName: 'User', riskScore: 92, details: 'Senior Cloud Platform Architect' },
      { id: 'node-endpoint', label: 'prod-fintech-node-04', type: 'ENDPOINT', iconName: 'Laptop', riskScore: 98, details: 'Windows Server 2022, CrowdStrike Falcon Sensor' },
      { id: 'node-process', label: 'powershell.exe (PID 4912)', type: 'PROCESS', iconName: 'Terminal', riskScore: 99, details: 'Memory Injected Cobalt Strike Beacon' },
      { id: 'node-cloud', label: 'AWS S3: agentforge-core-vault', type: 'CLOUD_RESOURCE', iconName: 'Cloud', riskScore: 95, details: 'Contains customer PII & tokenized ledger' },
      { id: 'node-c2', label: 'C2 Server (*.c2-command-nexus.xyz)', type: 'NETWORK_IP', iconName: 'Radio', riskScore: 97, details: 'DNS Fast-Flux C2 Tunnel' },
    ],
    edges: [
      { from: 'node-threat-actor', to: 'node-email', label: 'Sends weaponized DocuSign lure', techniqueId: 'T1566.002', timestamp: '11:15:00Z', severity: 'HIGH' },
      { from: 'node-email', to: 'node-victim-user', label: 'OAuth Token Consent Grant Exploited', techniqueId: 'T1528', timestamp: '11:18:22Z', severity: 'HIGH' },
      { from: 'node-victim-user', to: 'node-endpoint', label: 'RDP Session Established via Compromised SSO', techniqueId: 'T1078.004', timestamp: '11:20:14Z', severity: 'CRITICAL' },
      { from: 'node-endpoint', to: 'node-process', label: 'Spawns Obfuscated PowerShell In-Memory', techniqueId: 'T1059.001', timestamp: '11:21:05Z', severity: 'CRITICAL' },
      { from: 'node-process', to: 'node-cloud', label: 'Enumerates S3 Bucket Keys via Stolen STS Token', techniqueId: 'T1530', timestamp: '11:22:00Z', severity: 'CRITICAL' },
      { from: 'node-process', to: 'node-c2', label: 'Exfiltrates 4.8MB Customer Data over DNS Tunnel', techniqueId: 'T1071.004', timestamp: '11:22:30Z', severity: 'CRITICAL' },
    ],
    timeline: [
      { time: '11:15:00Z', event: 'Inbound malicious email bypassed initial spam filter with novel DMARC alignment bypass.', vector: 'EMAIL', severity: 'MEDIUM' },
      { time: '11:18:22Z', event: 'User j.doe authorized malicious OAuth application "DocuSign Secure Reviewer".', vector: 'IDENTITY', severity: 'HIGH' },
      { time: '11:20:14Z', event: 'Adversary leveraged Okta session cookies to initiate remote management session.', vector: 'IDENTITY', severity: 'CRITICAL' },
      { time: '11:21:05Z', event: 'Cobalt Strike payload executed in-memory, attempting shadow copy erasure.', vector: 'ENDPOINT', severity: 'CRITICAL' },
      { time: '11:22:00Z', event: 'AWS IAM STS AssumeRole call performed to access production S3 bucket.', vector: 'CLOUD', severity: 'CRITICAL' },
      { time: '11:22:30Z', event: 'DNS Tunneling beacon observed transmitting base64 encoded chunks to external domain.', vector: 'NETWORK', severity: 'CRITICAL' },
    ],
    aiExecutiveSummary: 'An end-to-end multi-stage intrusion was detected fusing email, identity provider, host endpoint, and cloud telemetry. The attacker pivoted from an initial phishing OAuth consent bypass into endpoint memory execution, and then utilized stolen cloud credentials to stage and exfiltrate proprietary data over DNS tunnels. Immediate automated containment is highly recommended.',
    recommendedActions: [
      'Trigger SOAR Playbook: Autonomous Ransomware Blast Radius Containment',
      'Revoke the rogue OAuth app ID "docusign-secure-app-991" across the entire tenant',
      'Deploy DNS sinkhole policy for *.c2-command-nexus.xyz across all internal resolvers',
      'Rotate AWS IAM master KMS customer keys and regenerate all active instance credentials',
    ],
  },
];

export const SAMPLE_AI_PENTEST_CAMPAIGNS: AiPentestCampaign[] = [
  {
    id: 'campaign-ai-01',
    targetName: 'AgentForge Core Fintech & Agent Execution Engine (v2.4-prod)',
    goal: 'Autonomously identify chained zero-day and business logic vulnerabilities (BOLA, SSRF, Token Tampering) capable of reaching payment ledger database.',
    status: 'IN_PROGRESS',
    totalSteps: 6,
    completedSteps: 4,
    vulnerabilitiesFoundCount: 3,
    aiStrategyAssessment: 'AI PenTesting agent has mapped 42 API endpoints. It successfully executed parameter fuzzing on /api/v1/workspaces, bypassed JWT verification via algorithm confusion, and weaponized an internal SSRF to query AWS IMDS metadata.',
    steps: [
      {
        stepNumber: 1,
        phase: 'Recon',
        action: 'Autonomous OpenAPI Schema Ingestion & Hidden Route Fuzzing',
        targetEndpoint: '/api/v1/schema.json',
        payload: 'N/A (Dictionary mutation + OpenAPI spec extraction)',
        evasionStrategy: 'Distributed rate limiting (1.2 req/sec) to stay below Cloudflare WAF trigger threshold',
        observedResponse: 'Discovered 14 unauthenticated debugging endpoints under /api/v1/internal/*',
        success: true,
        notes: 'Target failed to enforce authentication header checks on internal namespace routes.',
      },
      {
        stepNumber: 2,
        phase: 'Payload Mutation',
        action: 'JWT Algorithm Confusion Injection ("none" & RS256 -> HS256 Public Key As Secret)',
        targetEndpoint: '/api/v1/internal/admin/impersonate',
        payload: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImlzc19hZG1pbiI6dHJ1ZX0.SIGNATURE_MUTATED',
        evasionStrategy: 'Header case randomization (aLg: "hs256") and signature length padding',
        observedResponse: 'HTTP 200 OK: Admin token issued for tenant master administrator',
        success: true,
        notes: 'API library accepted HMAC signature verified using the server public RSA key as the HMAC secret.',
      },
      {
        stepNumber: 3,
        phase: 'Exploit Attempt',
        action: 'Broken Object Level Authorization (BOLA / IDOR) Parameter Scraping',
        targetEndpoint: '/api/v1/workspaces/ws_org_8849/financial_ledgers',
        payload: 'GET /api/v1/workspaces/ws_org_0001_CORP_BANK/financial_ledgers HTTP/1.1',
        evasionStrategy: 'UUID format transposition and URL-encoded double slash path bypass (%2f%2f)',
        observedResponse: 'HTTP 200 OK: Full JSON disclosure of target company balance sheet ($42.8M)',
        success: true,
        notes: 'Direct object reference authorization missing object-ownership predicate validation.',
      },
      {
        stepNumber: 4,
        phase: 'Exploit Attempt',
        action: 'SSRF Cloud IMDSv1 Credential Exfiltration Probe',
        targetEndpoint: '/api/v1/tools/fetch_webhook_preview',
        payload: '{"webhook_url": "http://169.254.169.254/latest/meta-data/iam/security-credentials/"}',
        evasionStrategy: 'Decimal IP notation bypass (http://2852039166/) to evade regex IP filter',
        observedResponse: 'HTTP 200 OK: Disclosed IAM role name "AgentForge-Prod-Worker-EC2-Role"',
        success: true,
        notes: 'Internal worker proxy forwarded HTTP request without checking RFC 1918 / 3927 link-local addresses.',
      },
      {
        stepNumber: 5,
        phase: 'Privilege Escalation',
        action: 'AWS STS Temporary Credential Acquisition & Role Assume',
        targetEndpoint: '/latest/meta-data/iam/security-credentials/AgentForge-Prod-Worker-EC2-Role',
        payload: 'AccessKeyId, SecretAccessKey, Token extraction via SSRF pivot',
        evasionStrategy: 'Chained with step 4 response parsing',
        observedResponse: 'PENDING_EXECUTION',
        success: false,
        notes: 'Scheduled next in autonomous penetration chain.',
      },
      {
        stepNumber: 6,
        phase: 'Data Exfiltration Proof',
        action: 'Safe Read-Only Non-Destructive Proof-of-Concept Database Query',
        targetEndpoint: 'Internal PostgreSQL Cluster (10.0.12.4)',
        payload: 'SELECT version(), current_database(), current_user;',
        evasionStrategy: 'Non-destructive synthetic canary flag generation',
        observedResponse: 'WAITING_PRECEDING_STEPS',
        success: false,
        notes: 'Final validation step to complete executive attestation report.',
      },
    ],
  },
];

// ==========================================
// 1. CYBER KILL CHAIN DATASETS
// ==========================================
export const SAMPLE_KILL_CHAIN_STAGES: KillChainStageInfo[] = [
  {
    phase: 'RECONNAISSANCE',
    stageNumber: 1,
    title: '1. Reconnaissance',
    shortDescription: 'Adversary probes public perimeter, DNS, employee OSINT, and exposed API gateways.',
    activeAttacksCount: 14,
    blockedAttacksCount: 89,
    riskScore: 28,
    status: 'ELEVATED',
    techniques: [
      { mitreId: 'T1595.002', name: 'Vulnerability Scanning (Acunetix/Nuclei)', detectionConfidence: 96, status: 'PREVENTED', d3fendCountermeasure: 'Dynamic Rate Limiting & Geo-IP Fencing', telemetrySource: 'Cloudflare WAF' },
      { mitreId: 'T1596.005', name: 'DNS Record Enumeration & Zone Transfer', detectionConfidence: 91, status: 'DETECTED', d3fendCountermeasure: 'DNS Sinkholing & Negative Response Caching', telemetrySource: 'Route53 Resolver' },
      { mitreId: 'T1589.001', name: 'Credential Spill Gathering (HaveIBeenPwned)', detectionConfidence: 84, status: 'ACTIVE', d3fendCountermeasure: 'Automated Dark Web Breached Credential Alerting', telemetrySource: 'HaveIBeenPwned API' },
    ],
    primaryDefenses: ['External Attack Surface Management (EASM)', 'WAF Bot Protection', 'Domain Privacy & DNSSEC'],
    observedAlerts: ['High-frequency subdomain scan from ASN 14061 (DigitalOcean)', 'Shodan scan indexing Swagger JSON endpoint']
  },
  {
    phase: 'WEAPONIZATION',
    stageNumber: 2,
    title: '2. Weaponization',
    shortDescription: 'Adversary pairs zero-day exploits or obfuscated payloads with delivery vehicles off-network.',
    activeAttacksCount: 3,
    blockedAttacksCount: 12,
    riskScore: 42,
    status: 'ELEVATED',
    techniques: [
      { mitreId: 'T1587.001', name: 'Polymorphic Malware Compilation', detectionConfidence: 88, status: 'SUSPECTED', d3fendCountermeasure: 'Threat Intel YARA Signature Feed Sync', telemetrySource: 'VirusTotal Intelligence' },
      { mitreId: 'T1588.005', name: 'Exploit Kit Assembly (CVE-2024-3400 PAN-OS)', detectionConfidence: 94, status: 'DETECTED', d3fendCountermeasure: 'Virtual Patching & Exploit Mitigation Engine', telemetrySource: 'Threat Intel Feed' },
    ],
    primaryDefenses: ['Adversary Threat Intelligence Sync', 'Sandboxing Test Beds', 'Zero-Day Early Warning Feeds'],
    observedAlerts: ['New hash variant of Cobalt Strike beacon detected on VirusTotal matching org signature']
  },
  {
    phase: 'DELIVERY',
    stageNumber: 3,
    title: '3. Delivery',
    shortDescription: 'Transmission of malicious weapon to target environment via Email, Web, USB, or Supply Chain.',
    activeAttacksCount: 6,
    blockedAttacksCount: 142,
    riskScore: 68,
    status: 'ELEVATED',
    techniques: [
      { mitreId: 'T1566.001', name: 'Spearphishing Attachment (.html Smuggling)', detectionConfidence: 99, status: 'PREVENTED', d3fendCountermeasure: 'AI Email Attachment Deep Optical Inspection', telemetrySource: 'Proofpoint SEG' },
      { mitreId: 'T1195.001', name: 'Compromised NPM Dependency Injection', detectionConfidence: 89, status: 'DETECTED', d3fendCountermeasure: 'Software Supply Chain Lockfile Verification (SCA)', telemetrySource: 'AppSec SCA Engine' },
      { mitreId: 'T1189', name: 'Drive-by Watering Hole Compromise', detectionConfidence: 92, status: 'PREVENTED', d3fendCountermeasure: 'Secure Web Gateway (SWG) Sandbox Isolation', telemetrySource: 'Zscaler SWG' },
    ],
    primaryDefenses: ['Email Security Gateway (SEG)', 'Supply Chain SCA Gateways', 'EDR Web Content Filtering'],
    observedAlerts: ['HTML Smuggling phishing email targeted at 8 Finance executives intercepted by AI SEG']
  },
  {
    phase: 'EXPLOITATION',
    stageNumber: 4,
    title: '4. Exploitation',
    shortDescription: 'Triggering exploit code to compromise application, host, or identity session.',
    activeAttacksCount: 2,
    blockedAttacksCount: 38,
    riskScore: 84,
    status: 'CRITICAL',
    techniques: [
      { mitreId: 'T1203', name: 'Client Execution of Malicious Macro/LNK', detectionConfidence: 98, status: 'PREVENTED', d3fendCountermeasure: 'Endpoint Script Execution Control (AppLocker)', telemetrySource: 'CrowdStrike Falcon' },
      { mitreId: 'T1190', name: 'Exploit Public-Facing App (SQLi / RCE / SSRF)', detectionConfidence: 95, status: 'DETECTED', d3fendCountermeasure: 'RASP Runtime Self-Protection & WAF Rules', telemetrySource: 'AWS WAF + App RASP' },
      { mitreId: 'T1078.004', name: 'Cloud IAM Token Abuse via Leaked Key', detectionConfidence: 91, status: 'ACTIVE', d3fendCountermeasure: 'Automated IAM Session Revocation & Quorum Lock', telemetrySource: 'AWS GuardDuty' },
    ],
    primaryDefenses: ['EDR Behavioral Prevention', 'RASP Runtime Application Self-Protection', 'IAM MFA Enforcement'],
    observedAlerts: ['GuardDuty: Instance IAM role credentials used from external anomalous IP 45.142.193.18']
  },
  {
    phase: 'INSTALLATION',
    stageNumber: 5,
    title: '5. Installation',
    shortDescription: 'Adversary installs backdoor, persistence mechanisms, scheduled tasks, or web shells.',
    activeAttacksCount: 1,
    blockedAttacksCount: 19,
    riskScore: 78,
    status: 'CRITICAL',
    techniques: [
      { mitreId: 'T1053.005', name: 'Scheduled Task / Cron Job Persistence', detectionConfidence: 97, status: 'DETECTED', d3fendCountermeasure: 'Process Lineage Integrity Verification', telemetrySource: 'Sysmon / Sentinel' },
      { mitreId: 'T1505.003', name: 'Web Shell Injection in /var/www/uploads', detectionConfidence: 99, status: 'PREVENTED', d3fendCountermeasure: 'Read-Only Container Filesystems & File Integrity Monitoring', telemetrySource: 'Falco Cloud Workload' },
      { mitreId: 'T1547.001', name: 'Registry Run Key Auto-Start Modification', detectionConfidence: 96, status: 'PREVENTED', d3fendCountermeasure: 'EDR Anti-Tamper & Registry Guard', telemetrySource: 'Defender for Endpoint' },
    ],
    primaryDefenses: ['File Integrity Monitoring (FIM)', 'Immutable Containers', 'EDR Registry Hardening'],
    observedAlerts: ['Scheduled task created with base64 encoded powershell payload on prod-fintech-node-04']
  },
  {
    phase: 'COMMAND_AND_CONTROL',
    stageNumber: 6,
    title: '6. Command & Control (C2)',
    shortDescription: 'Establishing two-way encrypted channel to remotely control compromised internal assets.',
    activeAttacksCount: 1,
    blockedAttacksCount: 24,
    riskScore: 92,
    status: 'CRITICAL',
    techniques: [
      { mitreId: 'T1071.004', name: 'DNS Tunneling & High Entropy Queries', detectionConfidence: 94, status: 'ACTIVE', d3fendCountermeasure: 'DNS Anomaly Machine Learning & RPZ Filtering', telemetrySource: 'Zeek NDR Sensor' },
      { mitreId: 'T1090.003', name: 'Multi-hop Tor / Proxy Chaining', detectionConfidence: 89, status: 'DETECTED', d3fendCountermeasure: 'Strict Egress Proxy & Tor Exit Node Blocking', telemetrySource: 'Palo Alto NGFW' },
      { mitreId: 'T1573.002', name: 'TLS Encrypted Asymmetric Beaconing', detectionConfidence: 91, status: 'DETECTED', d3fendCountermeasure: 'JA3 / JA4 TLS Fingerprint Behavioral Inspection', telemetrySource: 'Suricata IDS' },
    ],
    primaryDefenses: ['Next-Gen Firewall Egress Filtering', 'Network Detection & Response (NDR)', 'DNS Anomaly Profiling'],
    observedAlerts: ['Zeek NDR detected 3,420 TXT DNS queries to *.c2-command-nexus.xyz within 60s']
  },
  {
    phase: 'ACTIONS_ON_OBJECTIVES',
    stageNumber: 7,
    title: '7. Actions on Objectives',
    shortDescription: 'Final endgame: Data exfiltration, ransomware volume encryption, or operational sabotage.',
    activeAttacksCount: 1,
    blockedAttacksCount: 7,
    riskScore: 98,
    status: 'CRITICAL',
    techniques: [
      { mitreId: 'T1486', name: 'Data Encrypted for Impact (Ransomware)', detectionConfidence: 99, status: 'PREVENTED', d3fendCountermeasure: 'Honeypot Decoy Files & Instant Volume Snapshot Lock', telemetrySource: 'CrowdStrike Falcon' },
      { mitreId: 'T1048.003', name: 'Exfiltration Over Cloud Storage S3 / Mega', detectionConfidence: 93, status: 'DETECTED', d3fendCountermeasure: 'Data Loss Prevention (DLP) & Cloud CASB Enforcement', telemetrySource: 'Netskope CASB' },
      { mitreId: 'T1490', name: 'Inhibit System Recovery (vssadmin shadow deletion)', detectionConfidence: 99, status: 'PREVENTED', d3fendCountermeasure: 'Kernel Protected Process Light (PPL) Shield', telemetrySource: 'Windows Defender ATP' },
    ],
    primaryDefenses: ['Data Loss Prevention (DLP)', 'Immutable Backups & WORM Storage', 'Automated Isolation SOAR'],
    observedAlerts: ['Ransomware shadow copy deletion command intercepted on host prod-fintech-node-04!']
  }
];

export const SAMPLE_KILL_CHAIN_CAMPAIGNS: KillChainCampaign[] = [
  {
    id: 'campaign-apt29',
    name: 'Operation CozyCloud Exfiltration',
    threatActor: 'APT29 (Midnight Blizzard / Nobelium)',
    targetEnvironment: 'Multi-Cloud AWS & Microsoft Entra ID',
    status: 'INTERCEPTED',
    currentStage: 'COMMAND_AND_CONTROL',
    interceptionPoint: 'COMMAND_AND_CONTROL',
    description: 'Targeted spearphishing campaign using OAuth app consent grant abuse and DNS-over-HTTPS C2 beaconing to steal production PostgreSQL backups.',
    stagesState: {
      RECONNAISSANCE: { status: 'PASSED', details: 'Enumerated Azure tenant applications and executive LinkedIn profiles.', timestamp: '10:14:00Z', iocOrArtifact: 'Scan from 185.220.101.44' },
      WEAPONIZATION: { status: 'PASSED', details: 'Built fake "DocuSign Security Add-on" OAuth application with Mail.ReadWrite scope.', timestamp: '10:30:00Z', iocOrArtifact: 'OAuth AppID: 99281a-f3b1-42ec' },
      DELIVERY: { status: 'PASSED', details: 'Spearphishing email sent to VP of Finance asking for approval.', timestamp: '10:45:00Z', iocOrArtifact: 'Phishing sender: verify@docu-sign-auth.net' },
      EXPLOITATION: { status: 'PASSED', details: 'User approved malicious OAuth consent grant; access token generated.', timestamp: '11:02:00Z', iocOrArtifact: 'Delegated Token: eyJhbGci...' },
      INSTALLATION: { status: 'PASSED', details: 'Registered service principal backdoor with ApplicationImpersonation role.', timestamp: '11:15:00Z', iocOrArtifact: 'Graph API Role Assignment' },
      COMMAND_AND_CONTROL: { status: 'BLOCKED', details: 'AI XDR correlated abnormal token graph activity and severed active Azure sessions. Zeek NDR sinkholed C2 domain.', timestamp: '11:22:30Z', iocOrArtifact: 'C2 Domain: *.c2-command-nexus.xyz (Sinkholed)' },
      ACTIONS_ON_OBJECTIVES: { status: 'NOT_REACHED', details: 'Halted prior to exfiltration stage. Database assets remained untampered.', timestamp: '11:23:00Z', iocOrArtifact: 'DLP Trigger: 0 bytes leaked' },
    }
  },
  {
    id: 'campaign-lockbit',
    name: 'LockBit 3.0 Double Extortion Incursion',
    threatActor: 'LockBit Supporter Group / FIN7',
    targetEnvironment: 'Corporate Windows Active Directory & VMWare ESXi',
    status: 'CONTAINED',
    currentStage: 'ACTIONS_ON_OBJECTIVES',
    interceptionPoint: 'ACTIONS_ON_OBJECTIVES',
    description: 'Initial access via leaked VPN credentials, followed by BloodHound AD reconnaissance, PsExec lateral movement, and attempt to delete Volume Shadow Copies.',
    stagesState: {
      RECONNAISSANCE: { status: 'PASSED', details: 'VPN credential testing via Tor exit nodes.', timestamp: '09:12:00Z', iocOrArtifact: 'IP: 185.220.101.44' },
      WEAPONIZATION: { status: 'PASSED', details: 'LockBit Black payload packed with custom VMProtect wrapper.', timestamp: '09:40:00Z', iocOrArtifact: 'SHA256: 4f8b9e...01c8' },
      DELIVERY: { status: 'PASSED', details: 'Dropped onto workstation via compromised Fortinet SSL-VPN session.', timestamp: '10:05:00Z', iocOrArtifact: 'VPN Session ID: vpn_99182' },
      EXPLOITATION: { status: 'PASSED', details: 'Memory injection into lsass.exe to dump local administrator credentials.', timestamp: '10:35:00Z', iocOrArtifact: 'Mimikatz sekurlsa::logonpasswords' },
      INSTALLATION: { status: 'PASSED', details: 'Created service "WindowsHealthService" pointing to payload.', timestamp: '11:00:00Z', iocOrArtifact: 'sc create WindowsHealthService' },
      COMMAND_AND_CONTROL: { status: 'PASSED', details: 'C2 communication established over Tor hidden service.', timestamp: '11:10:00Z', iocOrArtifact: 'Tor Onion Proxy' },
      ACTIONS_ON_OBJECTIVES: { status: 'BLOCKED', details: 'EDR Anti-Ransomware heuristic killed vssadmin process instantly and isolated host NIC within 400ms.', timestamp: '11:21:05Z', iocOrArtifact: 'vssadmin delete shadows /all (BLOCKED)' },
    }
  }
];

// ==========================================
// 2. ATTACK TREE SCENARIOS & DATASETS
// ==========================================
export const SAMPLE_ATTACK_TREES: AttackTreeScenario[] = [
  {
    id: 'tree-cloud-db-exfil',
    rootGoal: 'Exfiltrate Production Customer PII & Financial Ledger from Cloud DB',
    targetAsset: 'AWS Aurora PostgreSQL (Cluster: prod-customer-core-db)',
    threatActorTier: 'CYBERCRIME_SYNDICATE',
    overallCompromiseProbability: 74,
    shortestAttackPath: ['root', 'or-cloud-api', 'leaf-ssrf-meta', 'leaf-sts-assume', 'leaf-db-connect'],
    totalAttackerCostMin: '$1,200',
    recommendedChokePoint: 'Enforce AWS IMDSv2 Hop-Limit=1 & Restrict RDS Security Group to Dedicated VPC Bastion',
    nodes: {
      'root': {
        id: 'root',
        label: 'GOAL: Exfiltrate High-Value Customer Financial Records',
        nodeType: 'OR',
        difficulty: 'HIGH',
        attackerCost: '$1,200',
        probability: 74,
        detectionRisk: 88,
        mitigationControl: 'End-to-end Envelope Encryption & Database Activity Monitoring (DAM)',
        mitigationStatus: 'PARTIAL',
        isCriticalPath: true,
        childrenIds: ['or-cloud-api', 'or-db-direct', 'or-insider-supply'],
        description: 'Adversary successfully queries and downloads unencrypted tables containing SSNs, balance ledgers, and credit cards.'
      },
      'or-cloud-api': {
        id: 'or-cloud-api',
        label: 'PATH A: Compromise Cloud IAM via App SSRF to IMDS',
        nodeType: 'AND',
        difficulty: 'MEDIUM',
        attackerCost: '$800',
        probability: 82,
        detectionRisk: 65,
        mitreTechnique: 'T1552.005 / T1078.004',
        cweCvss: 'CWE-918 (CVSS 8.6)',
        mitigationControl: 'Migrate to IMDSv2 (Session Token Required) & Block 169.254.169.254 in egress firewall',
        mitigationStatus: 'DEFICIENT',
        isCriticalPath: true,
        childrenIds: ['leaf-ssrf-meta', 'leaf-sts-assume', 'leaf-db-connect'],
        description: 'Leverage web vulnerability to reach instance metadata and acquire IAM role session tokens.'
      },
      'leaf-ssrf-meta': {
        id: 'leaf-ssrf-meta',
        label: '1. Discover SSRF on Webhook Preview Endpoint',
        nodeType: 'LEAF',
        difficulty: 'LOW',
        attackerCost: '$200',
        probability: 90,
        detectionRisk: 45,
        mitreTechnique: 'T1190',
        cweCvss: 'CWE-918 (CVSS 7.5)',
        mitigationControl: 'URL Scheme & Private RFC1918 Hostname Whitelisting in API handler',
        mitigationStatus: 'DEFICIENT',
        isCriticalPath: true,
        description: 'Pass 169.254.169.254 into webhook preview query parameter.'
      },
      'leaf-sts-assume': {
        id: 'leaf-sts-assume',
        label: '2. Acquire Temporary STS Role Credentials',
        nodeType: 'LEAF',
        difficulty: 'TRIVIAL',
        attackerCost: '$0',
        probability: 95,
        detectionRisk: 60,
        mitreTechnique: 'T1552.005',
        cweCvss: 'CWE-522',
        mitigationControl: 'Attach least-privilege IAM policies to instance profiles (exclude rds-db:connect)',
        mitigationStatus: 'PARTIAL',
        isCriticalPath: true,
        description: 'Read AccessKeyId, SecretAccessKey, and SessionToken from metadata response.'
      },
      'leaf-db-connect': {
        id: 'leaf-db-connect',
        label: '3. IAM Database Authentication Connect & Dump',
        nodeType: 'LEAF',
        difficulty: 'LOW',
        attackerCost: '$100',
        probability: 88,
        detectionRisk: 82,
        mitreTechnique: 'T1530',
        cweCvss: 'CWE-284',
        mitigationControl: 'Aurora RDS Security Group restriction + Strict DB Query Logging',
        mitigationStatus: 'PARTIAL',
        isCriticalPath: true,
        description: 'Generate IAM auth token and execute pg_dump over internal network pivot.'
      },
      'or-db-direct': {
        id: 'or-db-direct',
        label: 'PATH B: Direct SQL Injection in Legacy Reporting View',
        nodeType: 'AND',
        difficulty: 'HIGH',
        attackerCost: '$3,500',
        probability: 35,
        detectionRisk: 92,
        mitreTechnique: 'T1190',
        cweCvss: 'CWE-89 (CVSS 9.8)',
        mitigationControl: 'Parameterized Queries with ORM & WAF SQLi Inspection Engine',
        mitigationStatus: 'ACTIVE',
        isCriticalPath: false,
        childrenIds: ['leaf-sqli-probe', 'leaf-data-extract'],
        description: 'Find union-based or error-based SQLi to extract schema and table records directly.'
      },
      'leaf-sqli-probe': {
        id: 'leaf-sqli-probe',
        label: '1. Bypass WAF with Character Encoding Payloads',
        nodeType: 'LEAF',
        difficulty: 'HIGH',
        attackerCost: '$2,000',
        probability: 40,
        detectionRisk: 90,
        mitreTechnique: 'T1190',
        cweCvss: 'CWE-89',
        mitigationControl: 'Strict AST-based SQL Parser at WAF layer',
        mitigationStatus: 'ACTIVE',
        isCriticalPath: false,
        description: 'Use hex-encoded payload concatenation to bypass regular expression filters.'
      },
      'leaf-data-extract': {
        id: 'leaf-data-extract',
        label: '2. Bulk Query Exfiltration via Out-of-Band DNS (OOB)',
        nodeType: 'LEAF',
        difficulty: 'MEDIUM',
        attackerCost: '$1,500',
        probability: 50,
        detectionRisk: 85,
        mitreTechnique: 'T1048.003',
        cweCvss: 'CWE-200',
        mitigationControl: 'Database Egress Network Lockdown',
        mitigationStatus: 'ACTIVE',
        isCriticalPath: false,
        description: 'Send extracted table records through hex-encoded DNS queries to collaborator server.'
      },
      'or-insider-supply': {
        id: 'or-insider-supply',
        label: 'PATH C: Malicious NPM Package in Frontend Build Pipeline',
        nodeType: 'AND',
        difficulty: 'EXTREME',
        attackerCost: '$15,000',
        probability: 22,
        detectionRisk: 80,
        mitreTechnique: 'T1195.001',
        cweCvss: 'CWE-1357',
        mitigationControl: 'Dependency Pinning, Software Bill of Materials (SBOM) & Isolated Build Runners',
        mitigationStatus: 'ACTIVE',
        isCriticalPath: false,
        childrenIds: ['leaf-npm-typo', 'leaf-session-steal'],
        description: 'Introduce typosquatted package to harvest DB credentials or admin sessions from developer machines.'
      },
      'leaf-npm-typo': {
        id: 'leaf-npm-typo',
        label: '1. Publish Typosquatted Package (e.g., pg-connection-pool-v2)',
        nodeType: 'LEAF',
        difficulty: 'MEDIUM',
        attackerCost: '$5,000',
        probability: 30,
        detectionRisk: 75,
        mitreTechnique: 'T1195.001',
        mitigationControl: 'Private NPM Proxy with Package Namespace Whitelisting',
        mitigationStatus: 'ACTIVE',
        isCriticalPath: false,
        description: 'Wait for developer to inadvertently install dependency during local development.'
      },
      'leaf-session-steal': {
        id: 'leaf-session-steal',
        label: '2. Hook Post-Install Script to Steal ~/.aws/credentials',
        nodeType: 'LEAF',
        difficulty: 'LOW',
        attackerCost: '$1,000',
        probability: 65,
        detectionRisk: 85,
        mitreTechnique: 'T1552.001',
        mitigationControl: 'EDR Developer Workstation Protection & npm ignore-scripts setting',
        mitigationStatus: 'ACTIVE',
        isCriticalPath: false,
        description: 'Exfiltrate local developer AWS CLI token cache to external command server.'
      }
    }
  },
  {
    id: 'tree-ad-golden-ticket',
    rootGoal: 'Achieve Persistent Domain Admin & Golden Ticket Forgery in Active Directory',
    targetAsset: 'Domain Controller (AD-DC-PRIMARY.corp.agentforge.local)',
    threatActorTier: 'NATION_STATE_APT',
    overallCompromiseProbability: 61,
    shortestAttackPath: ['root', 'or-kerberoast', 'leaf-tgs-request', 'leaf-offline-crack', 'leaf-krbtgt-forge'],
    totalAttackerCostMin: '$3,400',
    recommendedChokePoint: 'Rotate KRBTGT Password Twice Annually & Enforce AES-256 for all SPN Service Accounts',
    nodes: {
      'root': {
        id: 'root',
        label: 'GOAL: Active Directory Golden Ticket Domain Dominance',
        nodeType: 'OR',
        difficulty: 'EXTREME',
        attackerCost: '$3,400',
        probability: 61,
        detectionRisk: 90,
        mitigationControl: 'Microsoft Defender for Identity (MDI) + Tier 0 Privileged Access Workstations (PAW)',
        mitigationStatus: 'PARTIAL',
        isCriticalPath: true,
        childrenIds: ['or-kerberoast', 'or-zerologon'],
        description: 'Attacker forges Kerberos Ticket Granting Tickets (TGT) to access any enterprise asset indefinitely.'
      },
      'or-kerberoast': {
        id: 'or-kerberoast',
        label: 'PATH A: Kerberoasting Weak SPN Service Accounts',
        nodeType: 'AND',
        difficulty: 'MEDIUM',
        attackerCost: '$1,400',
        probability: 78,
        detectionRisk: 70,
        mitreTechnique: 'T1558.003',
        cweCvss: 'CWE-521',
        mitigationControl: 'Group Managed Service Accounts (gMSA) with 128-char auto-rotated passwords',
        mitigationStatus: 'PARTIAL',
        isCriticalPath: true,
        childrenIds: ['leaf-tgs-request', 'leaf-offline-crack', 'leaf-krbtgt-forge'],
        description: 'Request RC4-encrypted service tickets for accounts with ServicePrincipalNames and crack offline.'
      },
      'leaf-tgs-request': {
        id: 'leaf-tgs-request',
        label: '1. Request TGS Ticket with RC4-HMAC Encryption Downgrade',
        nodeType: 'LEAF',
        difficulty: 'TRIVIAL',
        attackerCost: '$0',
        probability: 95,
        detectionRisk: 65,
        mitreTechnique: 'T1558.003',
        mitigationControl: 'Enforce AES Kerberos encryption & Disable RC4 enterprise-wide',
        mitigationStatus: 'PARTIAL',
        isCriticalPath: true,
        description: 'Query Active Directory for all user accounts with SPNs registered.'
      },
      'leaf-offline-crack': {
        id: 'leaf-offline-crack',
        label: '2. Offline Hashcat GPU Brute-Force Password Cracking',
        nodeType: 'LEAF',
        difficulty: 'MEDIUM',
        attackerCost: '$800',
        probability: 80,
        detectionRisk: 20,
        mitreTechnique: 'T1110.002',
        mitigationControl: 'Minimum 25-character complex passwords on legacy service accounts',
        mitigationStatus: 'DEFICIENT',
        isCriticalPath: true,
        description: 'Run hashcat mode 13100 across 8x RTX 4090 GPU cluster.'
      },
      'leaf-krbtgt-forge': {
        id: 'leaf-krbtgt-forge',
        label: '3. Dump KRBTGT NTLM Hash & Forge Golden Ticket',
        nodeType: 'LEAF',
        difficulty: 'HIGH',
        attackerCost: '$600',
        probability: 82,
        detectionRisk: 88,
        mitreTechnique: 'T1558.001',
        mitigationControl: 'MDI Honeypot Accounts & Active Golden Ticket Ticket-Granting Detection Rules',
        mitigationStatus: 'PARTIAL',
        isCriticalPath: true,
        description: 'Use Mimikatz kerberos::golden /domain:... /sid:... /krbtgt:... /user:Administrator.'
      },
      'or-zerologon': {
        id: 'or-zerologon',
        label: 'PATH B: Netlogon Privilege Escalation (CVE-2020-1472 Zerologon)',
        nodeType: 'AND',
        difficulty: 'HIGH',
        attackerCost: '$5,000',
        probability: 25,
        detectionRisk: 98,
        mitreTechnique: 'T1068',
        cweCvss: 'CVE-2020-1472 (CVSS 10.0)',
        mitigationControl: 'Enforce Secure RPC Netlogon Channel on all Domain Controllers',
        mitigationStatus: 'ACTIVE',
        isCriticalPath: false,
        childrenIds: ['leaf-netlogon-zero'],
        description: 'Exploit flawed cryptography in Netlogon authentication protocol to reset DC machine password.'
      },
      'leaf-netlogon-zero': {
        id: 'leaf-netlogon-zero',
        label: '1. Send Netlogon Auth with All-Zero AES-CFB8 Challenge',
        nodeType: 'LEAF',
        difficulty: 'HIGH',
        attackerCost: '$5,000',
        probability: 25,
        detectionRisk: 98,
        mitreTechnique: 'T1068',
        mitigationControl: 'OS Security Patching & Strict RPC filtering',
        mitigationStatus: 'ACTIVE',
        isCriticalPath: false,
        description: 'Trigger 256 attempts to match zero-initialization vector.'
      }
    }
  }
];

// ==========================================
// 3. THREAT HUNTING HYPOTHESES & FINDINGS
// ==========================================
export const SAMPLE_THREAT_HUNT_HYPOTHESES: ThreatHuntHypothesis[] = [
  {
    id: 'hunt-hypo-1',
    title: 'Adversary Abuse of Living off the Land Binaries (Certutil / MSBuild)',
    hypothesisStatement: 'Adversaries who have achieved initial foothold are executing certutil.exe with -urlcache parameter or msbuild.exe to download obfuscated secondary payloads without dropping traditional compiler executables.',
    threatActorTargeting: 'Wizard Spider / LockBit / APT29',
    mitreTechniques: ['T1105 (Ingress Tool Transfer)', 'T1127.001 (MSBuild)', 'T1140 (Deobfuscate/Decode Files)'],
    dataSourcesRequired: ['Endpoint Process Lineage (Sysmon Event ID 1)', 'EDR Command-Line Telemetry', 'DNS Egress Logs'],
    confidenceScore: 92,
    priority: 'CRITICAL',
    status: 'FINDINGS_CONFIRMED',
    kqlQuery: `// Microsoft Sentinel / Defender XDR KQL
DeviceProcessEvents
| where Timestamp > ago(7d)
| where ProcessCommandLine has_any ("-urlcache", "-split", "decode", "msbuild.exe", "regsvr32.exe /s /u /i")
| where InitiatingProcessFileName in~ ("cmd.exe", "powershell.exe", "wscript.exe", "cscript.exe")
| project Timestamp, DeviceName, AccountName, FileName, ProcessCommandLine, InitiatingProcessCommandLine
| summarize Count=count(), DistinctHosts=dcount(DeviceName) by FileName, ProcessCommandLine
| order by Count desc`,
    splQuery: `// Splunk Enterprise Security SPL
index=edr_telemetry sourcetype="crowdstrike:process" earliest=-7d
(process_name="certutil.exe" AND (command_line="*-urlcache*" OR command_line="*-split*" OR command_line="*decode*"))
OR (process_name="msbuild.exe" AND parent_process_name IN ("cmd.exe", "powershell.exe"))
| stats count distinct_count(host) as host_count values(user) as users by process_name, command_line
| sort - count`,
    sigmaRuleYaml: `title: Suspicious Certutil.exe Download or Decode Operation
id: 4a9f412e-8a03-4b92-801e-c2f819129841
status: experimental
description: Detects living off the land abuse of certutil.exe to download remote C2 payload or decode base64 payloads
tags:
  - attack.ingress_tool_transfer
  - attack.t1105
  - attack.t1140
logsource:
  category: process_creation
  product: windows
detection:
  selection_certutil:
    Image|endswith: '\\certutil.exe'
    CommandLine|contains:
      - '-urlcache'
      - '-split'
      - '-decode'
      - '-f'
  condition: selection_certutil
falsepositives:
  - Legitimate PKI certificate verification scripts in IT deployment
level: high`,
    yaraLQuery: `// Google Chronicle YARA-L Rule
rule suspicious_certutil_payload_retrieval {
  meta:
    author = "AI Threat Hunt Engine"
    description = "Hunt for certutil downloading external payloads"
    severity = "HIGH"
  events:
    $e.metadata.event_type = "PROCESS_LAUNCH"
    $e.target.process.command_line = /.*certutil.*(-urlcache|-split|-decode).*/ nocase
    $e.principal.hostname = $host
  match:
    $host over 10m
  condition:
    $e
}`,
    expectedTtpBehavior: 'Certutil spawns outbound HTTP/HTTPS connections directly to external non-Microsoft domains.',
    recommendedResponseAction: 'Isolate affected endpoint via CrowdStrike SOAR; dump memory and inspect temporary %TEMP% directories for decoded staging scripts.',
    matchesCount: 4
  },
  {
    id: 'hunt-hypo-2',
    title: 'Cloud IMDSv1 SSRF Token Theft from Kubernetes / Serverless Pods',
    hypothesisStatement: 'Adversaries exploiting application vulnerabilities (IDOR / SSRF) in microservices are retrieving AWS IAM instance role credentials by querying the unauthenticated metadata service (169.254.169.254) and replaying them externally.',
    threatActorTargeting: 'Scattered Spider / FIN11 / Cloud Cryptominers',
    mitreTechniques: ['T1552.005 (Cloud Instance Metadata)', 'T1078.004 (Cloud Accounts)', 'T1530 (Data from Cloud Storage)'],
    dataSourcesRequired: ['AWS CloudTrail Management Events', 'VPC Flow Logs', 'WAF / Ingress Access Logs'],
    confidenceScore: 88,
    priority: 'HIGH',
    status: 'HUNTING',
    kqlQuery: `// AWS CloudTrail Sentinel KQL
AWSCloudTrail
| where TimeGenerated > ago(3d)
| where EventName in~ ("AssumeRole", "GetCallerIdentity", "ListBuckets", "GetSecretValue")
| extend UserAgent = tostring(parse_json(RequestParameters).userAgent)
| extend SourceIP = tostring(SourceIPAddress)
| where UserAgent !has "aws-sdk" and UserAgent !has "Boto3" and UserAgent !has "Terraform"
| summarize EventCount=count(), DistinctAPIs=dcount(EventName) by SourceIP, UserIdentityArn, UserAgent
| where DistinctAPIs > 3
| order by EventCount desc`,
    splQuery: `// Splunk CloudTrail Threat Hunt
index=aws_cloudtrail sourcetype="aws:cloudtrail" earliest=-3d
eventName IN ("GetCallerIdentity", "ListObjects", "GetSecretValue", "CreateAccessKey")
| eval is_external_ip=if(cidrmatch("10.0.0.0/8", sourceIPAddress) OR cidrmatch("172.16.0.0/12", sourceIPAddress), 0, 1)
| where is_external_ip=1
| stats count values(eventName) as apis by sourceIPAddress, userIdentity.arn, userAgent
| sort - count`,
    sigmaRuleYaml: `title: AWS IAM Role Credential Used from External IP
id: d7e8910a-2819-481b-a19b-c4029194819a
status: stable
description: Identifies AWS EC2 or Lambda IAM temporary credentials used from an IP address outside corporate IP ranges
tags:
  - attack.credential_access
  - attack.t1552.005
logsource:
  service: cloudtrail
detection:
  selection:
    userIdentity.type: 'AssumedRole'
    sourceIPAddress|startswith:
      - '45.'
      - '185.'
      - '194.'
  condition: selection
level: critical`,
    yaraLQuery: `// Google Chronicle YARA-L Rule
rule cloud_imds_external_credential_usage {
  meta:
    description = "AWS temporary instance credentials used from novel geo ASN"
  events:
    $e.metadata.product_name = "AWS CloudTrail"
    $e.security_result.action = "ALLOW"
    $e.principal.ip_geo_artifact.autonomous_system_number = $asn
    $e.principal.user.user_display_name = $role_arn
  match:
    $role_arn over 1h
  condition:
    $e and #asn > 2
}`,
    expectedTtpBehavior: 'Sudden burst of IAM Describe/List calls from a consumer VPN or cloud VPS provider ASN.',
    recommendedResponseAction: 'Attach explicit DenySession policy to IAM role, revoke active temporary STS sessions, and enforce IMDSv2 hop limit=1.',
    matchesCount: 2
  },
  {
    id: 'hunt-hypo-3',
    title: 'Anomalous Kerberos Ticket Request (Pass-the-Ticket / Overpass-the-Hash)',
    hypothesisStatement: 'Threat actors who have extracted NTLM hashes or Kerberos tickets are authenticating without standard preceding NTLM negotiation or with non-standard cipher suites (0x17 RC4).',
    threatActorTargeting: 'APT28 (Fancy Bear) / Black Basta / Conti',
    mitreTechniques: ['T1558.001 (Golden Ticket)', 'T1558.003 (Kerberoasting)', 'T1550.002 (Pass the Hash)'],
    dataSourcesRequired: ['Active Directory Security Logs (Event ID 4768, 4769, 4771)', 'Kerberos Network Telemetry'],
    confidenceScore: 94,
    priority: 'CRITICAL',
    status: 'FINDINGS_CONFIRMED',
    kqlQuery: `// Microsoft Sentinel AD Hunt
SecurityEvent
| where TimeGenerated > ago(24h)
| where EventID == 4769 // A Kerberos service ticket was requested
| extend TicketOptions = tostring(TicketOptions)
| extend EncryptionType = tostring(TicketEncryptionType)
| where EncryptionType == "0x17" // RC4-HMAC weak encryption downgrade
| where ServiceName !has "$" // Target is user account, not machine
| summarize RequestCount=count() by TargetUserName, IpAddress, ServiceName
| where RequestCount > 5
| order by RequestCount desc`,
    splQuery: `// Splunk Active Directory Kerberos Hunt
index=wineventlog EventCode=4769 Ticket_Encryption_Type="0x17"
NOT Service_Name="*$*"
| stats count by Target_User_Name, IpAddress, Service_Name
| where count > 5
| sort - count`,
    sigmaRuleYaml: `title: Kerberos Service Ticket Request with RC4 Encryption Downgrade
id: 9a201948-281b-419b-c402-919481919842
status: stable
description: Detects TGS request utilizing weak RC4 encryption (0x17), indicative of Kerberoasting attempt
tags:
  - attack.credential_access
  - attack.t1558.003
logsource:
  product: windows
  service: security
detection:
  selection:
    EventID: 4769
    TicketEncryptionType: '0x17'
  filter:
    ServiceName|endswith: '$'
  condition: selection and not filter
level: high`,
    yaraLQuery: `rule kerberos_rc4_downgrade_roasting {
  meta:
    description = "Multiple RC4 TGS requests against distinct service accounts"
  events:
    $e.metadata.event_type = "USER_LOGIN"
    $e.security_result.description = /.*0x17.*/
    $e.principal.hostname = $dc
  condition:
    #e > 10
}`,
    expectedTtpBehavior: 'Rapid sequence of 4769 events with 0x17 encryption targeting high-privilege service accounts within seconds.',
    recommendedResponseAction: 'Enforce AES-256 Kerberos group policies, reset compromised SPN account passwords, and deploy honeypot SPN trap accounts.',
    matchesCount: 7
  }
];

export const SAMPLE_THREAT_HUNT_FINDINGS: ThreatHuntFinding[] = [
  {
    id: 'find-001',
    hypothesisId: 'hunt-hypo-1',
    timestamp: '2026-08-26T11:21:05Z',
    entityType: 'HOST',
    entityValue: 'prod-fintech-node-04.us-east.corp',
    anomalyDescription: 'certutil.exe invoked with -urlcache -split flags by hidden powershell process attempting to pull payload from 185.220.101.44.',
    iocHash: 'a89c1048bf291840192840182401824018240182401824018240182401824018',
    confidence: 96,
    status: 'CONFIRMED_INCIDENT'
  },
  {
    id: 'find-002',
    hypothesisId: 'hunt-hypo-1',
    timestamp: '2026-08-26T11:18:22Z',
    entityType: 'PROCESS',
    entityValue: 'msbuild.exe PID 4920',
    anomalyDescription: 'msbuild.exe spawned from cmd.exe compiling inline C# XML task located in C:\\Users\\Public\\staging.xml',
    iocHash: '7f91048201948102948102948102948102948102948102948102948102948102',
    confidence: 91,
    status: 'CONFIRMED_INCIDENT'
  },
  {
    id: 'find-003',
    hypothesisId: 'hunt-hypo-2',
    timestamp: '2026-08-26T11:21:48Z',
    entityType: 'CLOUD_ARN',
    entityValue: 'arn:aws:iam::884920194820:role/AgentForge-Prod-Worker-EC2-Role',
    anomalyDescription: 'Temporary STS access key acquired via IMDSv1 SSRF and used from external IP 45.142.193.18 to list S3 buckets.',
    confidence: 94,
    status: 'CONFIRMED_INCIDENT'
  },
  {
    id: 'find-004',
    hypothesisId: 'hunt-hypo-3',
    timestamp: '2026-08-26T10:45:10Z',
    entityType: 'USER',
    entityValue: 'svc_mssql_prod',
    anomalyDescription: '12 TGS requests with RC4-HMAC (0x17) encryption requested by non-domain-controller host 10.0.14.88.',
    confidence: 89,
    status: 'CONFIRMED_INCIDENT'
  }
];

// ---------------- OSINT RECON MOCK DATA ----------------
export const SAMPLE_OSINT_REPORT: OsintInvestigationReport = {
  id: 'osint-rep-001',
  target: 'agentforge.corp',
  targetType: 'DOMAIN',
  scanTimestamp: '2026-08-26T11:35:00Z',
  overallThreatScore: 78,
  riskLevel: 'HIGH',
  summary: 'External attack surface audit revealed 14 subdomains, 3 unencrypted staging endpoints exposed to Shodan, 2 employee accounts in dark web breach pastes, and 1 vulnerable VPN gateway running legacy Fortinet firmware (CVE-2023-27997).',
  subdomains: [
    { name: 'vpn.agentforge.corp', ip: '198.51.100.22', cloudProvider: 'AWS us-east-1', httpStatus: 200, technologies: ['FortiOS 7.0.5', 'OpenSSL 1.1.1f'], cveRisk: 'CVE-2023-27997 (Critical RCE)', isTakeoverVulnerable: false },
    { name: 'staging-api.agentforge.corp', ip: '198.51.100.89', cloudProvider: 'DigitalOcean', httpStatus: 200, technologies: ['Swagger UI 3.25', 'Node.js Express', 'MongoDB 4.2'], cveRisk: 'Unauthenticated API Docs exposed', isTakeoverVulnerable: true },
    { name: 'jira-dev.agentforge.corp', ip: '198.51.100.104', cloudProvider: 'AWS us-west-2', httpStatus: 403, technologies: ['Atlassian Jira 8.20.10'], cveRisk: 'CVE-2022-26134 Path Traversal', isTakeoverVulnerable: false },
    { name: 'mail.agentforge.corp', ip: '198.51.100.5', cloudProvider: 'On-Premises', httpStatus: 200, technologies: ['Microsoft Exchange 2019 CU12', 'OWA'], cveRisk: 'Missing DMARC Reject policy', isTakeoverVulnerable: false },
    { name: 'cdn.agentforge.corp', ip: '104.16.24.11', cloudProvider: 'Cloudflare Edge', httpStatus: 200, technologies: ['Cloudflare WAF', 'HTTP/3'], isTakeoverVulnerable: false }
  ],
  dnsRecords: [
    { type: 'A', name: 'agentforge.corp', value: '198.51.100.10', ttl: 300, risk: 'LOW', securityAssessment: 'Valid primary IP address pointing to Cloudflare reverse proxy.' },
    { type: 'MX', name: 'agentforge.corp', value: '10 mail.agentforge.corp', ttl: 3600, risk: 'MEDIUM', securityAssessment: 'On-premise exchange host exposed directly without cloud scrubbing.' },
    { type: 'TXT', name: 'agentforge.corp', value: 'v=spf1 include:_spf.google.com include:sendgrid.net ~all', ttl: 3600, risk: 'MEDIUM', securityAssessment: 'Softfail (~all) configured instead of hardfail (-all). Spoofing risk present.' },
    { type: 'TXT', name: '_dmarc.agentforge.corp', value: 'v=DMARC1; p=none; rua=mailto:dmarc-reports@agentforge.corp', ttl: 3600, risk: 'HIGH', securityAssessment: 'Policy set to p=none. Phishing emails spoofing domain will not be rejected by receivers.' }
  ],
  whois: {
    domain: 'agentforge.corp',
    registrar: 'MarkMonitor Inc.',
    creationDate: '2021-03-15T00:00:00Z',
    expirationDate: '2028-03-15T00:00:00Z',
    registrantOrg: 'AgentForge Security Global LLC',
    asn: 'AS16509',
    asnOrg: 'AMAZON-02 - Amazon.com, Inc.',
    country: 'United States',
    city: 'San Francisco',
    abuseContact: 'abuse@markmonitor.com',
    nameServers: ['ns1.cloudflare.com', 'ns2.cloudflare.com'],
    dnssec: true
  },
  breachRecords: [
    { id: 'br-1', sourceBreach: 'ComboList-DarkWeb-Paste-2025', breachDate: '2025-11-12', compromisedData: ['Email', 'SHA-256 Hashed Password', 'Job Title'], recordCount: 1420000, darkWebMentions: 'Found in Telegram CyberCrime Channel #ExposedSecOps', riskRating: 'CRITICAL', sampleExposedEmails: ['a.smith@agentforge.corp', 'devops-admin@agentforge.corp'] },
    { id: 'br-2', sourceBreach: 'StealerLog-RedLine-Botnet-Q1', breachDate: '2026-02-04', compromisedData: ['Browser Session Cookies', 'Saved Passwords', 'OS Version', 'IP History'], recordCount: 84000, darkWebMentions: 'Marketplace listing on BreachForums v3', riskRating: 'HIGH', sampleExposedEmails: ['m.jones@agentforge.corp'] }
  ],
  certificateLogs: [
    { id: 'cert-1', domain: '*.agentforge.corp', issuer: "Let's Encrypt Authority X3", validFrom: '2026-06-01', validTo: '2026-08-30', isWildcard: true, sanCount: 12, keyStrength: 'RSA 2048-bit', isExpired: false, loggedAt: '2026-06-01T12:00:00Z' },
    { id: 'cert-2', domain: 'staging-api.agentforge.corp', issuer: 'ZeroSSL RSA Domain Secure Site CA', validFrom: '2025-01-10', validTo: '2026-01-10', isWildcard: false, sanCount: 1, keyStrength: 'RSA 2048-bit', isExpired: true, loggedAt: '2025-01-10T09:15:00Z' }
  ],
  portExposures: [
    { port: 443, protocol: 'TCP', service: 'HTTPS', product: 'nginx', version: '1.24.0', banner: 'HTTP/1.1 200 OK Server: nginx', state: 'OPEN', cves: [], risk: 'LOW' },
    { port: 8443, protocol: 'TCP', service: 'VPN Gateway', product: 'FortiOS SSL-VPN', version: '7.0.5', banner: 'FortiToken SSO Portal', state: 'OPEN', cves: ['CVE-2023-27997'], risk: 'CRITICAL' },
    { port: 22, protocol: 'TCP', service: 'SSH', product: 'OpenSSH', version: '8.9p1 Ubuntu', banner: 'SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.1', state: 'OPEN', cves: ['CVE-2024-6387 (regreSSHion candidate)'], risk: 'HIGH' },
    { port: 3389, protocol: 'TCP', service: 'RDP', product: 'Microsoft Terminal Services', version: '10.0.19041', banner: 'CredSSP supported', state: 'OPEN', cves: ['BlueKeep Vulnerable Check Pending'], risk: 'CRITICAL' }
  ],
  employeeFootprint: [
    { id: 'emp-1', name: 'Alexander Smith', email: 'a.smith@agentforge.corp', role: 'Lead DevOps Engineer', department: 'Infrastructure', leakedPassCount: 3, pwnedStatus: 'BREACHED', githubReposExposed: 2, riskLevel: 'CRITICAL' },
    { id: 'emp-2', name: 'Maria Jones', email: 'm.jones@agentforge.corp', role: 'Senior SecOps Analyst', department: 'Cyber Security', leakedPassCount: 1, pwnedStatus: 'COMPROMISED_HASH', githubReposExposed: 0, riskLevel: 'MEDIUM' },
    { id: 'emp-3', name: 'David Chen', email: 'd.chen@agentforge.corp', role: 'VP of Product Architecture', department: 'Executive Management', leakedPassCount: 0, pwnedStatus: 'SAFE', githubReposExposed: 1, riskLevel: 'LOW' }
  ],
  threatActors: [
    { actor: 'APT29 (Midnight Blizzard / Nobelium)', aliases: ['Cozy Bear', 'The Dukes'], targetedIndustries: ['Government', 'IT Services', 'Cybersecurity'], motivation: 'Cyber Espionage & Supply Chain Compromise', observedTTPs: ['T1566 Phishing', 'T1556 Password Spray', 'T1505 Exchange Backdoor'], relevanceScore: 92 },
    { actor: 'FIN7 (Carbanak)', aliases: ['ELFIN', 'Gold Niagara'], targetedIndustries: ['Finance', 'SaaS', 'Retail'], motivation: 'Financial Extortion & Ransomware Deployment', observedTTPs: ['T1059 PowerShell Exec', 'T1055 Process Injection'], relevanceScore: 74 }
  ],
  nodes: [
    { id: 'n-domain', label: 'agentforge.corp', type: 'DOMAIN', risk: 'HIGH', details: 'Target Root Domain' },
    { id: 'n-vpn', label: 'vpn.agentforge.corp', type: 'SUBDOMAIN', risk: 'CRITICAL', details: 'FortiOS SSL-VPN CVE-2023-27997' },
    { id: 'n-ip1', label: '198.51.100.22', type: 'IP', risk: 'CRITICAL', details: 'AWS us-east-1 Public Endpoint' },
    { id: 'n-breach', label: 'ComboList DarkWeb Paste', type: 'BREACH', risk: 'HIGH', details: '1.42M Records Leaked' },
    { id: 'n-user', label: 'a.smith@agentforge.corp', type: 'PERSON', risk: 'CRITICAL', details: 'Lead DevOps / 3 Leaked Passwords' },
    { id: 'n-apt', label: 'APT29 (Midnight Blizzard)', type: 'ACTOR', risk: 'CRITICAL', details: 'Targeting SecOps & DevOps Creds' }
  ],
  links: [
    { id: 'l-1', source: 'n-domain', target: 'n-vpn', relationship: 'HAS_SUBDOMAIN', risk: 'CRITICAL' },
    { id: 'l-2', source: 'n-vpn', target: 'n-ip1', relationship: 'RESOLVES_TO', risk: 'CRITICAL' },
    { id: 'l-3', source: 'n-domain', target: 'n-user', relationship: 'EMPLOYEE_OF', risk: 'HIGH' },
    { id: 'l-4', source: 'n-user', target: 'n-breach', relationship: 'EXPOSED_IN', risk: 'CRITICAL' },
    { id: 'l-5', source: 'n-apt', target: 'n-user', relationship: 'TARGETING_CREDENTIALS', risk: 'CRITICAL' }
  ],
  aiExecutiveDossier: 'EXECUTIVE RECON DOSSIER: Target domain agentforge.corp exhibits high attack surface exposure. Critical vulnerabilities include CVE-2023-27997 on the primary VPN gateway (198.51.100.22) and open RDP port 3389. Lead DevOps engineer Alexander Smith credentials have been observed in 3 dark web password dumps. Immediate actions recommended: 1) Patch FortiOS firmware to >=7.0.12, 2) Enforce strict DMARC p=reject policy, 3) Rotate AWS IAM credentials for a.smith.'
};

// ---------------- SPIRE / SPIFFE WORKLOAD MOCK DATA ----------------
export const SAMPLE_SPIRE_WORKLOADS: SpireWorkloadEntry[] = [
  {
    id: 'spire-wl-001',
    spiffeId: 'spiffe://agentforge.corp/ns/secops/sa/siem-collector-agent',
    parentId: 'spiffe://agentforge.corp/spire/agent/k8s-node-us-east-1a',
    workloadName: 'siem-collector-daemon',
    namespace: 'secops-fusion',
    selectors: [
      { type: 'k8s', key: 'ns', value: 'secops-fusion' },
      { type: 'k8s', key: 'sa', value: 'siem-collector-agent' },
      { type: 'docker', key: 'image_id', value: 'sha256:8f91048291048102948' },
      { type: 'tpm', key: 'quote_status', value: 'VERIFIED_TPM20' }
    ],
    svidType: 'X509',
    issuedAt: '2026-08-26T11:00:00Z',
    expiresAt: '2026-08-26T15:00:00Z',
    status: 'ISSUED_VALID',
    dnsNames: ['siem-collector.internal', 'siem-collector.secops-fusion.svc.cluster.local'],
    ttlSeconds: 14400
  },
  {
    id: 'spire-wl-002',
    spiffeId: 'spiffe://agentforge.corp/ns/soar/sa/autonomous-playbook-runner',
    parentId: 'spiffe://agentforge.corp/spire/agent/k8s-node-us-east-1b',
    workloadName: 'soar-executor-worker',
    namespace: 'soar-engine',
    selectors: [
      { type: 'k8s', key: 'ns', value: 'soar-engine' },
      { type: 'k8s', key: 'pod-label:app', value: 'soar-runner' },
      { type: 'aws', key: 'iam-role', value: 'arn:aws:iam::884920194820:role/SoarRunnerRole' }
    ],
    svidType: 'X509',
    issuedAt: '2026-08-26T10:30:00Z',
    expiresAt: '2026-08-26T14:30:00Z',
    status: 'ISSUED_VALID',
    dnsNames: ['soar-runner.internal'],
    ttlSeconds: 14400
  },
  {
    id: 'spire-wl-003',
    spiffeId: 'spiffe://agentforge.corp/ns/threat-hunt/sa/kql-query-engine',
    parentId: 'spiffe://agentforge.corp/spire/agent/baremetal-host-04',
    workloadName: 'threat-hunt-scanner',
    namespace: 'threat-hunting',
    selectors: [
      { type: 'unix', key: 'uid', value: '1004' },
      { type: 'unix', key: 'gid', value: '1004' },
      { type: 'tpm', key: 'pcr0', value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' }
    ],
    svidType: 'JWT',
    issuedAt: '2026-08-26T08:00:00Z',
    expiresAt: '2026-08-26T12:00:00Z',
    status: 'RENEWING',
    dnsNames: ['threat-scanner.internal'],
    ttlSeconds: 14400
  }
];

export const SAMPLE_SPIRE_NODES: SpireNodeAgent[] = [
  {
    id: 'spire-node-01',
    hostname: 'k8s-node-us-east-1a.corp',
    cluster: 'prod-us-east-1-k8s',
    ipAddress: '10.0.4.12',
    attestorType: 'tpm2',
    connectedWorkloads: 14,
    health: 'HEALTHY',
    spiffeId: 'spiffe://agentforge.corp/spire/agent/k8s-node-us-east-1a',
    lastHeartbeat: '2026-08-26T11:44:10Z'
  },
  {
    id: 'spire-node-02',
    hostname: 'k8s-node-us-east-1b.corp',
    cluster: 'prod-us-east-1-k8s',
    ipAddress: '10.0.4.13',
    attestorType: 'aws_iid',
    connectedWorkloads: 11,
    health: 'HEALTHY',
    spiffeId: 'spiffe://agentforge.corp/spire/agent/k8s-node-us-east-1b',
    lastHeartbeat: '2026-08-26T11:44:02Z'
  },
  {
    id: 'spire-node-03',
    hostname: 'baremetal-host-04.corp',
    cluster: 'onprem-datacenter-dc1',
    ipAddress: '192.168.10.4',
    attestorType: 'tpm2',
    connectedWorkloads: 6,
    health: 'DEGRADED',
    spiffeId: 'spiffe://agentforge.corp/spire/agent/baremetal-host-04',
    lastHeartbeat: '2026-08-26T11:41:20Z'
  }
];

// ---------------- STRIPE BILLING & LICENSING MOCK DATA ----------------
export const SAMPLE_STRIPE_PLANS: StripeSubscriptionPlan[] = [
  {
    id: 'FREE_COMMUNITY',
    name: 'Community Open SecOps',
    priceMonthly: 0,
    priceYearly: 0,
    stripePriceId: 'price_free_community_000',
    description: 'Free tier for personal security labs, learning, and basic SIEM parsing.',
    features: [
      'Up to 10 GB/day Telemetry Ingestion',
      'Basic SIEM NLP Query Engine',
      'Single User Workspace',
      'Community Threat Intelligence Feeds',
      'Standard Attack Tree Visualization'
    ],
    ingestionLimitGb: 10,
    maxUsers: 1
  },
  {
    id: 'PRO_THREAT_HUNTER',
    name: 'Pro Threat Hunter & OSINT',
    priceMonthly: 199,
    priceYearly: 1990,
    stripePriceId: 'price_pro_threat_hunter_199',
    description: 'Advanced Threat Hunting, OSINT Recon, multi-dialect KQL/SPL/Sigma generators, and SPIRE identity attestation.',
    features: [
      '500 GB/day Telemetry Ingestion',
      'Full OSINT Reconnaissance Hub & Breach Intel',
      'SPIRE Zero-Trust Identity Attestation Enforcer',
      'Multi-Dialect Detections (KQL, SPL, Sigma, YARA-L)',
      'Autonomous SOAR Playbooks (1,000 runs/mo)',
      '5 SOC Analyst Seats'
    ],
    ingestionLimitGb: 500,
    maxUsers: 5,
    isPopular: true
  },
  {
    id: 'ENTERPRISE_FUSION',
    name: 'Enterprise Fusion Center',
    priceMonthly: 899,
    priceYearly: 8990,
    stripePriceId: 'price_enterprise_fusion_899',
    description: 'Full Autonomous AI Red-Team PenTesting, unlimited telemetry ingestion, dedicated SPIRE mesh agent, and custom SLAs.',
    features: [
      'Unlimited Telemetry Ingestion',
      'Autonomous AI Red-Team PenTesting Agent',
      'Lockheed Cyber Kill Chain 7-Phase Interceptor',
      'Unlimited SPIRE Node Attestation Agents',
      'Dedicated Gemini AI SecOps Copilot Agent',
      'Unlimited Team Seats & 24/7 Priority Support'
    ],
    ingestionLimitGb: 99999,
    maxUsers: 999
  }
];

export const SAMPLE_STRIPE_INVOICES: StripeInvoiceItem[] = [
  { id: 'inv_1QZ98104', date: '2026-08-01', amount: 199, status: 'PAID', pdfUrl: '#', planName: 'Pro Threat Hunter & OSINT (Monthly)' },
  { id: 'inv_1QY82019', date: '2026-07-01', amount: 199, status: 'PAID', pdfUrl: '#', planName: 'Pro Threat Hunter & OSINT (Monthly)' },
  { id: 'inv_1QX71028', date: '2026-06-01', amount: 199, status: 'PAID', pdfUrl: '#', planName: 'Pro Threat Hunter & OSINT (Monthly)' }
];

