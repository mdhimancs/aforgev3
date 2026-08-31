export type NodeType = 'trigger' | 'llm' | 'memory' | 'tool' | 'guardrail' | 'action' | 'output';

export interface AgentNode {
  id: string;
  type: NodeType;
  title: string;
  subtitle?: string;
  position: { x: number; y: number };
  status: 'idle' | 'running' | 'success' | 'error';
  config: {
    // For Trigger
    triggerType?: 'email' | 'webhook' | 'cron' | 'chat' | 'api';
    triggerEvent?: string;

    // For LLM
    model?: string;
    temperature?: number;
    topP?: number;
    systemPrompt?: string;
    contextSource?: string;
    maxTokens?: number;
    thinkingLevel?: 'LOW' | 'HIGH';

    // For Memory
    memoryType?: 'vector' | 'buffer' | 'redis' | 'sql';
    collectionName?: string;
    topK?: number;

    // For Tool
    toolName?: string;
    endpoint?: string;
    toolAction?: string;

    // For Guardrail
    guardrailType?: 'sentiment' | 'pii' | 'hallucination' | 'json';
    threshold?: number;

    // For Action
    actionType?: 'send_email' | 'zendesk_reply' | 'slack_notify' | 'sql_write' | 'webhook_post';
    destination?: string;
  };
}

export interface NodeConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  fromPort?: string;
  toPort?: string;
  label?: string;
  active?: boolean;
}

export interface AgentWorkflow {
  id: string;
  name: string;
  version: string;
  description: string;
  status: 'active' | 'draft' | 'paused';
  nodes: AgentNode[];
  connections: NodeConnection[];
  tokenUsage: number;
  maxTokensLimit: number;
  lastDeployed?: string;
}

export interface ComponentPaletteItem {
  id: string;
  type: NodeType;
  name: string;
  category: string;
  iconName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  defaultConfig: Partial<AgentNode['config']>;
}

export interface SimulationMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  thoughtProcess?: string;
  toolCalls?: Array<{
    tool: string;
    query: string;
    output: string;
  }>;
  executionTimeMs?: number;
  tokensUsed?: number;
}

// -------------------------------------------------------------
// Automated Red-Teaming & Repeatable Security Assessment Types
// -------------------------------------------------------------

export type AttackCategory = 
  | 'prompt_injection'
  | 'system_prompt_leakage'
  | 'excessive_agency'
  | 'sensitive_data_exfiltration'
  | 'insecure_output_handling'
  | 'hallucination_and_jailbreak';

export interface SecurityTestCase {
  id: string;
  name: string;
  category: AttackCategory;
  owaspId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  probePayload: string;
  expectedDefense: string;
  vulnerabilityPattern: string; // Regex or substring condition that constitutes a breach
  remediationAdvice: string;
}

export interface TestExecutionResult {
  testId: string;
  name: string;
  category: AttackCategory;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'passed' | 'failed' | 'running' | 'pending';
  probePayload: string;
  rawResponse: string;
  latencyMs: number;
  tokensUsed: number;
  vulnerabilityDetected: boolean;
  guardrailTriggered: boolean;
  failureReason?: string;
  defenseExplanation: string;
}

export interface SecurityTestSuite {
  id: string;
  name: string;
  standard: 'OWASP Top 10 for LLM' | 'NIST AI RMF' | 'Custom Red-Team';
  description: string;
  testCases: SecurityTestCase[];
}

export interface SecurityAuditReport {
  timestamp: string;
  workflowName: string;
  modelVersion: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  resilienceScore: number; // 0 to 100
  riskGrade: 'A+' | 'A' | 'B' | 'C' | 'CRITICAL RISK';
  results: TestExecutionResult[];
  categoryBreakdown: Record<AttackCategory, { total: number; passed: number; failed: number }>;
}

// -------------------------------------------------------------
// AppSec Unified Platform Types (SAST, DAST, SCA, Secrets, IaC)
// -------------------------------------------------------------

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type AppSecCategory = 'SAST' | 'DAST' | 'SCA' | 'SECRETS' | 'IAC';

export interface SastFinding {
  id: string;
  ruleId: string;
  title: string;
  severity: SeverityLevel;
  cwe: string;
  owaspCategory: string;
  filePath: string;
  lineNumber: number;
  codeSnippet: string;
  sourceSinkFlow?: {
    source: string;
    sanitizer?: string;
    sink: string;
  };
  description: string;
  impact: string;
  remediation: string;
  aiFixSuggestion?: string;
  fixedCodeSnippet?: string;
  status: 'open' | 'fixing' | 'resolved' | 'suppressed';
}

export interface DastProbeTarget {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
  category: 'Injection' | 'Auth & Session' | 'API Security (BOLA/BFLA)' | 'Security Headers & CORS' | 'Rate Limiting & DoS';
  testPayload: string;
  responseStatus?: number;
  latencyMs?: number;
  status: 'passed' | 'vulnerable' | 'running' | 'skipped';
  evidence?: string;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  responseSnippet?: string;
  remediation: string;
}

export interface ScaVulnerability {
  cveId: string;
  ghsaId?: string;
  severity: SeverityLevel;
  cvssScore: number;
  epssScore: number; // 0.0 - 1.0 (Exploit Prediction Scoring System)
  title: string;
  description: string;
  affectedRange: string;
  fixedIn: string;
  patchCommand?: string;
}

export interface ScaPackage {
  id: string;
  name: string;
  currentVersion: string;
  latestVersion: string;
  fixVersion?: string;
  ecosystem: 'npm' | 'pypi' | 'maven' | 'golang';
  isDirect: boolean;
  license: string;
  licenseRisk: 'PERMISSIVE' | 'RECIPROCAL' | 'VIRAL_COPYLEFT' | 'UNLICENSED';
  vulnerabilities: ScaVulnerability[];
}

export interface SecretFinding {
  id: string;
  type: 'AWS_ACCESS_KEY' | 'STRIPE_SECRET' | 'GITHUB_PAT' | 'JWT_TOKEN' | 'PRIVATE_KEY' | 'DATABASE_URI';
  title: string;
  filePath: string;
  lineNumber: number;
  maskedSecret: string;
  entropy: number;
  severity: SeverityLevel;
  status: 'active' | 'revoked' | 'false_positive';
  remediation: string;
}

export interface IacFinding {
  id: string;
  framework: 'Docker' | 'Kubernetes' | 'Terraform' | 'CloudFormation';
  title: string;
  resourceName: string;
  severity: SeverityLevel;
  filePath: string;
  description: string;
  remediation: string;
}

export interface AppSecProject {
  id: string;
  name: string;
  repoUrl: string;
  branch: string;
  lastScanned: string;
  healthScore: number; // 0 - 100
  sastFindings: SastFinding[];
  dastProbes: DastProbeTarget[];
  scaPackages: ScaPackage[];
  secretFindings: SecretFinding[];
  iacFindings: IacFinding[];
}

export interface AegisThreatEvent {
  id: string;
  timestamp: string;
  source: string;
  attackVector: 'PROMPT_INJECTION' | 'JAILBREAK' | 'PII_EXFILTRATION' | 'UNSAFE_TOOL_CALL' | 'RASP_SQLI' | 'SSRF_METADATA' | 'AGENT_POISONING';
  severity: SeverityLevel;
  payload: string;
  sanitizedPayload?: string;
  verdict: 'BLOCKED' | 'REDACTED' | 'CHALLENGED' | 'ALLOWED';
  ruleTriggered: string;
  latencyMs: number;
  confidence: number;
  ipAddress: string;
  targetEndpoint: string;
}

export interface AegisPolicyConfig {
  shieldStatus: 'ACTIVE' | 'LEARNING' | 'DISABLED';
  promptInjectionDefense: boolean;
  promptSensitivity: 'STRICT' | 'BALANCED' | 'PERMISSIVE';
  piiMasking: boolean;
  piiAction: 'AUTO_REDACT' | 'BLOCK';
  toolSandboxing: boolean;
  blockedCommands: string[];
  raspProtection: boolean;
  hallucinationCheck: boolean;
  rateLimitPerMinute: number;
}

export type VaptCategory = 
  | 'OWASP_API_SECURITY'
  | 'OWASP_TOP_10_WEB'
  | 'AUTHENTICATION_BYPASS'
  | 'BUSINESS_LOGIC_BOLA'
  | 'SERVER_SIDE_INJECTION'
  | 'SSRF_CLOUD_METADATA'
  | 'GRAPHQL_BATCHING'
  | 'CRYPTO_JWT_TAMPER'
  | 'CORS_SECURITY_HEADERS';

export interface VaptTestVector {
  id: string;
  name: string;
  category: VaptCategory;
  cwe: string;
  owaspRef: string;
  mitreTechnique: string;
  defaultSeverity: SeverityLevel;
  description: string;
  testPayload: string;
  expectedBehavior: string;
  vulnerableSignature: string;
}

export interface VaptFinding {
  id: string;
  title: string;
  category: VaptCategory;
  severity: SeverityLevel;
  cvssScore: number;
  cvssVector: string;
  cwe: string;
  owaspId: string;
  mitreId: string;
  targetUrl: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  testPayloadUsed: string;
  proofOfConcept: string;
  impact: string;
  exploitChain: Array<{ step: string; actor: string; outcome: string }>;
  remediationGuide: string;
  patchCode: string;
  status: 'VULNERABLE' | 'FIXED' | 'MITIGATED' | 'ACCEPTED_RISK';
}

export interface VaptTargetScope {
  id: string;
  name: string;
  targetUrl: string;
  environment: 'Staging' | 'Production' | 'Internal API' | 'Cloud Microservice';
  authType: 'Bearer JWT' | 'API Key' | 'OAuth2' | 'None (Public)';
  authToken?: string;
  allowedMethods: string[];
  exclusionPaths: string[];
  rateLimitReqPerSec: number;
  stealthMode: boolean;
}

export interface VaptAuditReport {
  id: string;
  title: string;
  targetName: string;
  auditDate: string;
  auditor: string;
  overallRiskScore: number; // 0-100
  totalTestsRun: number;
  findingsCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  complianceSummary: {
    pciDss: 'PASSED' | 'FAILED' | 'CONDITIONAL';
    soc2: 'PASSED' | 'FAILED' | 'CONDITIONAL';
    iso27001: 'PASSED' | 'FAILED' | 'CONDITIONAL';
    owaspAsvsLevel: 'ASVS Level 1' | 'ASVS Level 2' | 'ASVS Level 3';
  };
  findings: VaptFinding[];
}

export type ThemeMode = 'light' | 'dark';

// -------------------------------------------------------------
// AI in SIEM, SOAR, XDR & Cyber Fusion Types
// -------------------------------------------------------------

export interface SiemLogEvent {
  id: string;
  timestamp: string;
  source: 'Syslog' | 'AWS CloudTrail' | 'Okta SSO' | 'Kubernetes Audit' | 'CrowdStrike EDR' | 'Zeek NDR' | 'Palo Alto FW';
  host: string;
  user: string;
  rawMessage: string;
  anomalyScore: number; // 0 - 100
  aiClassification: string;
  isAnomalous: boolean;
  category: 'Auth' | 'Network' | 'Privilege' | 'Execution' | 'CloudAPI' | 'DataAccess';
}

export interface SiemHuntQuery {
  id: string;
  naturalQuery: string;
  generatedKql: string;
  generatedSpl: string;
  matchedCount: number;
  aiRationale: string;
  threatLikelihood: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface SoarPlaybookStep {
  id: string;
  order: number;
  title: string;
  actionType: 'REST_API' | 'FIREWALL_BLOCK' | 'EDR_ISOLATE' | 'IAM_REVOKE' | 'SLACK_ALERT' | 'HUMAN_APPROVAL';
  targetSystem: string;
  params: Record<string, any>;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED' | 'WAITING_APPROVAL';
  outputMessage?: string;
  executionDurationMs?: number;
  autoRollbackAvailable: boolean;
}

export interface SoarPlaybook {
  id: string;
  name: string;
  triggerEvent: string;
  description: string;
  category: 'Ransomware Containment' | 'Phishing Credential Triage' | 'Cloud IAM Exfiltration' | 'DDoS Scrubbing' | 'Zero-Day Patching';
  confidenceThreshold: number;
  autoExecute: boolean;
  steps: SoarPlaybookStep[];
  status: 'IDLE' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  lastRunTimestamp?: string;
}

export interface XdrTelemetryNode {
  id: string;
  label: string;
  type: 'IDENTITY' | 'ENDPOINT' | 'CLOUD_RESOURCE' | 'NETWORK_IP' | 'PROCESS' | 'THREAT_ACTOR';
  riskScore: number;
  details: string;
  iconName?: string;
}

export interface XdrAttackEdge {
  from: string;
  to: string;
  label: string;
  techniqueId: string;
  timestamp: string;
  severity: SeverityLevel;
}

export interface XdrIncidentStory {
  id: string;
  title: string;
  threatActorGroup?: string;
  severity: SeverityLevel;
  status: 'INVESTIGATING' | 'CONTAINED' | 'REMEDIATED' | 'CLOSED';
  rootCause: string;
  killChainStage: 'Initial Access' | 'Execution' | 'Privilege Escalation' | 'Defense Evasion' | 'Lateral Movement' | 'Exfiltration';
  affectedVectors: ('ENDPOINT' | 'CLOUD' | 'IDENTITY' | 'NETWORK' | 'EMAIL')[];
  nodes: XdrTelemetryNode[];
  edges: XdrAttackEdge[];
  timeline: Array<{ time: string; event: string; vector: string; severity: SeverityLevel }>;
  aiExecutiveSummary: string;
  recommendedActions: string[];
}

export interface AiPentestStep {
  stepNumber: number;
  phase: 'Recon' | 'Fuzzing & Parameter Discovery' | 'Payload Mutation' | 'Exploit Attempt' | 'Privilege Escalation' | 'Data Exfiltration Proof';
  action: string;
  targetEndpoint: string;
  payload: string;
  evasionStrategy: string;
  observedResponse: string;
  success: boolean;
  notes: string;
}

export interface AiPentestCampaign {
  id: string;
  targetName: string;
  goal: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  totalSteps: number;
  completedSteps: number;
  steps: AiPentestStep[];
  vulnerabilitiesFoundCount: number;
  aiStrategyAssessment: string;
}

export interface SecOpsChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: Array<{
    tool: string;
    status: 'success' | 'running' | 'failed';
    data?: any;
  }>;
  actionButtons?: Array<{
    label: string;
    action: string;
    payload?: any;
  }>;
}

// ---------------- CYBER KILL CHAIN TYPES ----------------
export type KillChainPhase =
  | 'RECONNAISSANCE'
  | 'WEAPONIZATION'
  | 'DELIVERY'
  | 'EXPLOITATION'
  | 'INSTALLATION'
  | 'COMMAND_AND_CONTROL'
  | 'ACTIONS_ON_OBJECTIVES';

export interface KillChainTechnique {
  mitreId: string;
  name: string;
  detectionConfidence: number; // 0-100%
  status: 'DETECTED' | 'PREVENTED' | 'ACTIVE' | 'SUSPECTED';
  d3fendCountermeasure: string;
  telemetrySource: string;
}

export interface KillChainStageInfo {
  phase: KillChainPhase;
  stageNumber: number;
  title: string;
  shortDescription: string;
  activeAttacksCount: number;
  blockedAttacksCount: number;
  riskScore: number;
  status: 'CLEAR' | 'ELEVATED' | 'CRITICAL' | 'BLOCKED';
  techniques: KillChainTechnique[];
  primaryDefenses: string[];
  observedAlerts: string[];
}

export interface KillChainCampaign {
  id: string;
  name: string;
  threatActor: string;
  targetEnvironment: string;
  status: 'INTERCEPTED' | 'ACTIVE' | 'CONTAINED';
  currentStage: KillChainPhase;
  interceptionPoint: KillChainPhase | 'NONE';
  description: string;
  stagesState: Record<KillChainPhase, {
    status: 'PASSED' | 'BLOCKED' | 'IN_PROGRESS' | 'NOT_REACHED';
    details: string;
    timestamp: string;
    iocOrArtifact: string;
  }>;
}

// ---------------- ATTACK TREE TYPES ----------------
export type AttackNodeType = 'AND' | 'OR' | 'LEAF';
export type AttackDifficulty = 'TRIVIAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
export type ThreatActorTier = 'SCRIPT_KIDDIE' | 'CYBERCRIME_SYNDICATE' | 'NATION_STATE_APT' | 'INSIDER_THREAT' | 'MALICIOUS_INSIDER';

export interface AttackTreeNode {
  id: string;
  label: string;
  nodeType: AttackNodeType;
  difficulty: AttackDifficulty;
  attackerCost: string; // e.g. "$500", "$5,000", "$50k"
  probability: number; // 0-100%
  detectionRisk: number; // 0-100%
  mitreTechnique?: string;
  cweCvss?: string;
  mitigationControl: string;
  mitigationStatus: 'ACTIVE' | 'PARTIAL' | 'DEFICIENT';
  isCriticalPath?: boolean;
  childrenIds?: string[];
  description: string;
}

export interface AttackTreeScenario {
  id: string;
  rootGoal: string;
  targetAsset: string;
  threatActorTier: ThreatActorTier;
  overallCompromiseProbability: number;
  shortestAttackPath: string[]; // List of node IDs
  totalAttackerCostMin: string;
  recommendedChokePoint: string;
  nodes: Record<string, AttackTreeNode>;
}

// ---------------- THREAT HUNTING TYPES ----------------
export interface ThreatHuntHypothesis {
  id: string;
  title: string;
  hypothesisStatement: string;
  threatActorTargeting: string;
  mitreTechniques: string[];
  dataSourcesRequired: string[];
  confidenceScore: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'HYPOTHESIS_ACTIVE' | 'HUNTING' | 'FINDINGS_CONFIRMED' | 'BENIGN';
  kqlQuery: string;
  splQuery: string;
  sigmaRuleYaml: string;
  yaraLQuery: string;
  expectedTtpBehavior: string;
  recommendedResponseAction: string;
  matchesCount: number;
}

export interface ThreatHuntFinding {
  id: string;
  hypothesisId: string;
  timestamp: string;
  entityType: 'HOST' | 'USER' | 'IP' | 'PROCESS' | 'CLOUD_ARN';
  entityValue: string;
  anomalyDescription: string;
  iocHash?: string;
  confidence: number;
  status: 'UNREVIEWED' | 'CONFIRMED_INCIDENT' | 'FALSE_POSITIVE' | 'POLICY_VIOLATION';
}

// ---------------- OSINT RECON TYPES ----------------
export type OsintRiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface OsintSubdomain {
  name: string;
  ip: string;
  cloudProvider?: string;
  httpStatus: number;
  technologies: string[];
  cveRisk?: string;
  isTakeoverVulnerable?: boolean;
}

export interface OsintDnsRecord {
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SOA' | 'SPF' | 'DMARC';
  name: string;
  value: string;
  ttl: number;
  securityAssessment?: string;
  risk?: OsintRiskLevel;
}

export interface OsintWhoisData {
  domain: string;
  registrar: string;
  creationDate: string;
  expirationDate: string;
  registrantOrg: string;
  asn: string;
  asnOrg: string;
  country: string;
  city?: string;
  abuseContact: string;
  nameServers: string[];
  dnssec: boolean;
}

export interface OsintBreachRecord {
  id: string;
  sourceBreach: string;
  breachDate: string;
  compromisedData: string[];
  recordCount: number;
  darkWebMentions: string;
  riskRating: OsintRiskLevel;
  pwnedAccountsCount?: number;
  sampleExposedEmails: string[];
}

export interface OsintCertLog {
  id: string;
  domain: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  isWildcard: boolean;
  sanCount: number;
  keyStrength: string;
  isExpired: boolean;
  loggedAt: string;
}

export interface OsintPortExposure {
  port: number;
  protocol: 'TCP' | 'UDP';
  service: string;
  product?: string;
  version?: string;
  banner: string;
  state: 'OPEN' | 'FILTERED';
  cves: string[];
  risk: OsintRiskLevel;
}

export interface OsintEmployeeFootprint {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  leakedPassCount: number;
  pwnedStatus: 'BREACHED' | 'SAFE' | 'COMPROMISED_HASH';
  githubReposExposed: number;
  riskLevel: OsintRiskLevel;
}

export interface OsintThreatActorLink {
  actor: string;
  aliases: string[];
  targetedIndustries: string[];
  motivation: string;
  observedTTPs: string[];
  relevanceScore: number;
}

export interface OsintKnowledgeNode {
  id: string;
  label: string;
  type: 'DOMAIN' | 'SUBDOMAIN' | 'IP' | 'ASN' | 'CERT' | 'BREACH' | 'SERVICE' | 'PERSON' | 'ACTOR';
  risk: OsintRiskLevel;
  details?: string;
}

export interface OsintKnowledgeLink {
  id: string;
  source: string;
  target: string;
  relationship: string;
  risk?: OsintRiskLevel;
}

export interface OsintInvestigationReport {
  id: string;
  target: string;
  targetType: 'DOMAIN' | 'IP' | 'ORGANIZATION' | 'EMAIL';
  scanTimestamp: string;
  overallThreatScore: number; // 0 - 100
  riskLevel: OsintRiskLevel;
  summary: string;
  subdomains: OsintSubdomain[];
  dnsRecords: OsintDnsRecord[];
  whois: OsintWhoisData;
  breachRecords: OsintBreachRecord[];
  certificateLogs: OsintCertLog[];
  portExposures: OsintPortExposure[];
  employeeFootprint: OsintEmployeeFootprint[];
  threatActors: OsintThreatActorLink[];
  nodes: OsintKnowledgeNode[];
  links: OsintKnowledgeLink[];
  aiExecutiveDossier: string;
}

// ---------------- SPIRE / SPIFFE WORKLOAD IDENTITY TYPES ----------------
export type SpiffeAttestationStatus = 'ISSUED_VALID' | 'RENEWING' | 'REVOKED' | 'EXPIRED' | 'ATTESTATION_FAILED';

export interface SpireWorkloadEntry {
  id: string;
  spiffeId: string;
  parentId: string; // e.g. spiffe://prod.internal/spire/agent/k8s-worker-1
  workloadName: string;
  namespace: string;
  selectors: {
    type: 'k8s' | 'docker' | 'unix' | 'aws' | 'tpm';
    key: string;
    value: string;
  }[];
  svidType: 'X509' | 'JWT';
  issuedAt: string;
  expiresAt: string;
  status: SpiffeAttestationStatus;
  dnsNames: string[];
  ttlSeconds: number;
}

export interface SpireNodeAgent {
  id: string;
  hostname: string;
  cluster: string;
  ipAddress: string;
  attestorType: 'tpm2' | 'aws_iid' | 'k8s_psat' | 'gcp_iit';
  connectedWorkloads: number;
  health: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  spiffeId: string;
  lastHeartbeat: string;
}

// ---------------- STRIPE BILLING & SUBSCRIPTION TYPES ----------------
export type StripePlanId = 'FREE_COMMUNITY' | 'PRO_THREAT_HUNTER' | 'ENTERPRISE_FUSION';

export interface StripeSubscriptionPlan {
  id: StripePlanId;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  stripePriceId: string;
  description: string;
  features: string[];
  ingestionLimitGb: number;
  maxUsers: number;
  isPopular?: boolean;
}

export interface StripeInvoiceItem {
  id: string;
  date: string;
  amount: number;
  status: 'PAID' | 'OPEN' | 'UNCOLLECTIBLE';
  pdfUrl: string;
  planName: string;
}

// -------------------------------------------------------------
// CSPM & CIEM TYPES
// -------------------------------------------------------------
export interface CspmCloudAsset {
  id: string;
  name: string;
  provider: 'AWS' | 'GCP' | 'Azure' | 'Kubernetes';
  resourceType: 'S3 Storage' | 'IAM Role' | 'K8s Cluster' | 'EC2/Compute' | 'RDS DB' | 'API Gateway';
  region: string;
  driftStatus: 'IN_SYNC' | 'DRIFTED' | 'NON_COMPLIANT';
  riskScore: number; // 0-100
  complianceFrameworks: string[];
  lastAssessed: string;
}

export interface CspmToxicCombination {
  id: string;
  title: string;
  severity: SeverityLevel;
  affectedAsset: string;
  vectorSummary: string;
  vectorChain: string[];
  remediationTerraform: string;
}

export interface CiemRoleEntitlement {
  id: string;
  identityName: string;
  identityType: 'SERVICE_ACCOUNT' | 'IAM_ROLE' | 'K8S_SERVICEACCOUNT' | 'HUMAN_USER';
  cloudProvider: 'AWS' | 'GCP' | 'Azure' | 'K8s';
  assignedPermissionsCount: number;
  usedPermissionsCount: number;
  overprivilegedScore: number; // 0-100
  unusedAdminRisk: boolean;
  linkedSpiffeId?: string;
  recommendation: string;
}

// -------------------------------------------------------------
// TPCRM & SUPPLY CHAIN RISK TYPES
// -------------------------------------------------------------
export interface TpcrmVendor {
  id: string;
  name: string;
  category: 'SaaS Tool' | 'Cloud Hosting' | 'Outsourced Dev' | 'Payment Gateway' | 'Analytics';
  riskScore: number; // 0-100
  postureTier: 'TIER_1_CRITICAL' | 'TIER_2_HIGH' | 'TIER_3_MEDIUM' | 'TIER_4_LOW';
  certifications: ('SOC2_TYPE2' | 'ISO_27001' | 'HIPAA' | 'PCI_DSS' | 'GDPR')[];
  lastAssessmentDate: string;
  questionnaireStatus: 'VERIFIED' | 'PENDING_REVIEW' | 'EXPIRED';
  exposedSubdomainsCount: number;
  dataSharedTypes: string[];
  aiSecuritySummary: string;
}

export interface TpcrmFourthPartyExposure {
  id: string;
  vendorName: string;
  subProcessorName: string;
  sharedDependency: string;
  breachStatus: 'STABLE' | 'ACTIVE_INCIDENT' | 'UNDER_INVESTIGATION';
  impactRating: SeverityLevel;
}

// -------------------------------------------------------------
// DSPM & DLP & SHADOW AI TYPES
// -------------------------------------------------------------
export interface DspmDataStore {
  id: string;
  name: string;
  type: 'Postgres DB' | 'AWS S3 Bucket' | 'BigQuery Table' | 'Snowflake Warehouse' | 'Redis Cache';
  classification: 'RESTRICTED_PII' | 'FINANCIAL_TAX' | 'HEALTH_PHI' | 'CONFIDENTIAL_IP' | 'PUBLIC';
  recordCount: number;
  encryptionStatus: 'ENCRYPTED_KMS' | 'UNENCRYPTED' | 'DEFAULT_KEY';
  publicExposure: boolean;
  riskRating: SeverityLevel;
  location: string;
}

export interface DspmShadowAiAlert {
  id: string;
  timestamp: string;
  userEmail: string;
  department: string;
  aiDestination: 'ChatGPT Free' | 'Claude Web' | 'DeepSeek' | 'Custom External Endpoint';
  dataPayloadType: 'PROPRIETARY_CODE' | 'CUSTOMER_PII' | 'API_KEYS' | 'FINANCIAL_SPREADSHEET';
  sizeBytes: number;
  verdict: 'BLOCKED_BY_DLP' | 'ALERTED_SECURITY' | 'LOGGED';
  riskLevel: SeverityLevel;
}

export interface DspmInsiderThreatEvent {
  id: string;
  employeeName: string;
  role: string;
  triggerEvent: string;
  anomalyScore: number; // 0-100
  downloadsLast24h: number;
  baselineDiff: string;
  status: 'INVESTIGATING' | 'ESCALATED_HR' | 'CLEARED';
}

// -------------------------------------------------------------
// CONTINUOUS GRC & AUDIT READINESS TYPES
// -------------------------------------------------------------
export interface GrcFrameworkControl {
  id: string;
  framework: 'SOC2_TYPE2' | 'ISO_27001_2022' | 'NIST_CSF_2_0' | 'NIST_AI_RMF' | 'NIST_SP_800_53' | 'PCI_DSS_4_0' | 'HIPAA' | 'GDPR' | 'EU_AI_ACT';
  controlId: string; // e.g., "CC6.1", "A.12.6.1", "GOVERN-1.2", "GDPR-ART-32", "EU-AI-ART-14"
  title: string;
  category: 'Access Control' | 'Encryption & Key Mgmt' | 'Vulnerability Mgmt' | 'Incident Response' | 'Logging & Monitoring' | 'AI Safety & Governance' | 'Data Privacy & Rights';
  status: 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT' | 'AUTOMATED_COLLECTION';
  automatedEvidenceSource: 'SPIRE_IDENTITY' | 'VAPT_CENTER' | 'APPSEC_SCANNER' | 'OSINT_RECON' | 'AWS_CLOUDTRAIL' | 'AEGIS_AI_SHIELD' | 'DSPM_DLP' | 'RED_TEAM_LAB';
  lastAutomatedCheck: string;
  owner: string;
  description?: string;
  riskLevel?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  regulatoryReference?: string;
  remediationAdvice?: string;
}

export interface GrcAuditEvidence {
  id: string;
  controlId: string;
  title: string;
  collectorSource: string;
  payloadSummary: string;
  verifiedTimestamp: string;
  integrityHash: string;
}

// -------------------------------------------------------------
// CTI & DARK WEB RADAR TYPES
// -------------------------------------------------------------
export interface CtiStealerLogRecord {
  id: string;
  leakedEmail: string;
  malwareFamily: 'RedLine Stealer' | 'Vidar' | 'Raccoon' | 'LumaStealer';
  exposedUrl: string;
  plainOrHash: string;
  dateDiscovered: string;
  compromisedMachineIp: string;
  riskRating: SeverityLevel;
}

export interface CtiTyposquatDomain {
  id: string;
  domainName: string;
  similarityScore: number; // 0-100
  ipAddress: string;
  mxRecordActive: boolean;
  httpStatusCode: number;
  parkedOrPhishing: 'ACTIVE_PHISHING_KIT' | 'PARKED' | 'REDIRECT' | 'SUSPICIOUS_MX';
  status: 'TAKE_DOWN_SUBMITTED' | 'MONITORING' | 'BLOCKED_AT_DNS';
}

export interface CtiCanaryTokenTrigger {
  id: string;
  tokenName: string;
  type: 'AWS_KEY_CANARY' | 'DOCUMENT_CANARY' | 'DB_RECORD_CANARY' | 'DNS_BEACON';
  locationPlaced: string;
  triggeredAt: string;
  triggerSourceIp: string;
  userAgent: string;
  status: 'ACTIVE_ALERT' | 'INVESTIGATED' | 'BENIGN_TEST';
}

// -------------------------------------------------------------
// UEBA (USER & ENTITY BEHAVIOR ANALYTICS) TYPES
// -------------------------------------------------------------
export interface UebaEntityRiskProfile {
  id: string;
  entityName: string; // User or Service Account
  entityType: 'EMPLOYEE' | 'CONTRACTOR' | 'SERVICE_ACCOUNT' | 'PRIVILEGED_ADMIN';
  department: string;
  riskScore: number; // 0 - 100
  peerGroupBaselineDiff: string; // e.g., "+480% Data Access vs Peer Devs"
  activeAlertsCount: number;
  lastAnomalyType: 'AFTER_HOURS_EXFIL' | 'GEOGRAPHIC_IMPOSSIBLE_TRAVEL' | 'BULK_API_KEY_CREATION' | 'PRIVILEGE_ESCALATION';
  status: 'MONITORING' | 'ISOLATED' | 'REQUIRE_REAUTH' | 'UNDER_SOC_REVIEW';
}

export interface UebaAnomalyEvent {
  id: string;
  timestamp: string;
  entityName: string;
  anomalyTitle: string;
  category: 'Access Pattern' | 'Data Egress' | 'Credential Misuse' | 'Privilege Escalation';
  riskScore: number;
  sourceIp: string;
  location: string;
  mitigationAction: string;
}

// -------------------------------------------------------------
// DLP (DATA LOSS PREVENTION) TYPES
// -------------------------------------------------------------
export interface DlpInspectionPolicy {
  id: string;
  policyName: string;
  ruleCategory: 'PCI_CREDIT_CARD' | 'SSN_TAX_ID' | 'AWS_SECRET_KEY' | 'SOURCE_CODE' | 'PATIENT_HEALTH_PHI';
  patternRegex: string;
  action: 'BLOCK_&_ALERT' | 'QUARANTINE' | 'MASK_IN_TRANSIT' | 'LOG_ONLY';
  inspectedChannels: ('HTTP_POST' | 'USB_STORAGE' | 'CLOUD_STORAGE' | 'AI_PROMPT_EGRESS' | 'EMAIL_ATTACHMENT')[];
  triggersLast24h: number;
  status: 'ACTIVE_ENFORCED' | 'DRY_RUN';
}

export interface DlpIncidentRecord {
  id: string;
  timestamp: string;
  sourceUser: string;
  channel: 'HTTP_POST' | 'USB_STORAGE' | 'CLOUD_STORAGE' | 'AI_PROMPT_EGRESS' | 'EMAIL_ATTACHMENT';
  destination: string;
  matchedRule: string;
  sensitiveItemCount: number;
  enforcedAction: 'BLOCKED' | 'QUARANTINED' | 'REDACTED' | 'FLAGGED';
  severity: SeverityLevel;
}







