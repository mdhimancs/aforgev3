import {
  CspmCloudAsset,
  CspmToxicCombination,
  CiemRoleEntitlement,
  TpcrmVendor,
  TpcrmFourthPartyExposure,
  DspmDataStore,
  DspmShadowAiAlert,
  DspmInsiderThreatEvent,
  GrcFrameworkControl,
  GrcAuditEvidence,
  CtiStealerLogRecord,
  CtiTyposquatDomain,
  CtiCanaryTokenTrigger,
  UebaEntityRiskProfile,
  UebaAnomalyEvent,
  DlpInspectionPolicy,
  DlpIncidentRecord
} from '../types';

// -------------------------------------------------------------
// 1. CSPM & CIEM PRESET DATA
// -------------------------------------------------------------
export const PRESET_CSPM_ASSETS: CspmCloudAsset[] = [
  {
    id: 'asset-1',
    name: 'agentforge-prod-customer-data-s3',
    provider: 'AWS',
    resourceType: 'S3 Storage',
    region: 'us-east-1',
    driftStatus: 'NON_COMPLIANT',
    riskScore: 92,
    complianceFrameworks: ['SOC 2', 'PCI-DSS', 'HIPAA'],
    lastAssessed: '10 mins ago'
  },
  {
    id: 'asset-2',
    name: 'eks-production-cluster-us-west2',
    provider: 'Kubernetes',
    resourceType: 'K8s Cluster',
    region: 'us-west-2',
    driftStatus: 'DRIFTED',
    riskScore: 78,
    complianceFrameworks: ['NIST CSF', 'ISO 27001'],
    lastAssessed: '25 mins ago'
  },
  {
    id: 'asset-3',
    name: 'gcp-spire-identity-agent-pool',
    provider: 'GCP',
    resourceType: 'IAM Role',
    region: 'global',
    driftStatus: 'IN_SYNC',
    riskScore: 12,
    complianceFrameworks: ['SPIFFE Spec', 'SOC 2'],
    lastAssessed: '2 mins ago'
  },
  {
    id: 'asset-4',
    name: 'prod-rds-postgresql-primary',
    provider: 'AWS',
    resourceType: 'RDS DB',
    region: 'us-east-1',
    driftStatus: 'IN_SYNC',
    riskScore: 24,
    complianceFrameworks: ['PCI-DSS', 'SOC 2'],
    lastAssessed: '1 hour ago'
  }
];

export const PRESET_TOXIC_COMBINATIONS: CspmToxicCombination[] = [
  {
    id: 'toxic-1',
    title: 'Public S3 Bucket + Overprivileged Role + Unencrypted PII',
    severity: 'CRITICAL',
    affectedAsset: 'agentforge-prod-customer-data-s3',
    vectorSummary: 'S3 Bucket has ACL wildcard readable permissions, attached to IAM Role with AdministratorAccess policy and unencrypted Customer PII.',
    vectorChain: [
      'Public Internet Gateway (0.0.0.0/0)',
      'S3 Bucket ACL: PublicReadWrite',
      'EC2 Instance Metadata v1 (IMDSv1 active)',
      'Attached IAM Role: SystemAdministratorAccess'
    ],
    remediationTerraform: `resource "aws_s3_bucket_public_access_block" "block_public" {
  bucket                  = aws_s3_bucket.customer_data.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}`
  },
  {
    id: 'toxic-2',
    title: 'Unauthenticated Kubernetes API Endpoint + Host Path Volume Mount',
    severity: 'HIGH',
    affectedAsset: 'eks-production-cluster-us-west2',
    vectorSummary: 'Worker pod mounts node /etc/shadow with privileged container flag active on anonymous RBAC binding.',
    vectorChain: [
      'API Gateway Public Subnet',
      'K8s Anonymous User -> cluster-admin',
      'Container HostPath: /var/run/docker.sock'
    ],
    remediationTerraform: `apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: anonymous-admin-block
subjects: [] # Revoked anonymous binding`
  }
];

export const PRESET_CIEM_ENTITLEMENTS: CiemRoleEntitlement[] = [
  {
    id: 'ciem-1',
    identityName: 'arn:aws:iam::536756604880:role/AgentForgeDevOpsDeployer',
    identityType: 'IAM_ROLE',
    cloudProvider: 'AWS',
    assignedPermissionsCount: 342,
    usedPermissionsCount: 18,
    overprivilegedScore: 94,
    unusedAdminRisk: true,
    linkedSpiffeId: 'spiffe://prod.internal/ns/spire/sa/aws-deployer',
    recommendation: 'Strip wildcard Action: "*", scope down to s3:GetObject and rds:Describe DB resources.'
  },
  {
    id: 'ciem-2',
    identityName: 'spire-workload-attestor-serviceaccount',
    identityType: 'K8S_SERVICEACCOUNT',
    cloudProvider: 'K8s',
    assignedPermissionsCount: 45,
    usedPermissionsCount: 38,
    overprivilegedScore: 15,
    unusedAdminRisk: false,
    linkedSpiffeId: 'spiffe://prod.internal/ns/default/sa/spire-agent',
    recommendation: 'Least privilege posture verified. Compliant with Zero Trust Identity matrix.'
  }
];

// -------------------------------------------------------------
// 2. TPCRM & SUPPLY CHAIN PRESET DATA
// -------------------------------------------------------------
export const PRESET_TPCRM_VENDORS: TpcrmVendor[] = [
  {
    id: 'vendor-1',
    name: 'Stripe Payments Infrastructure',
    category: 'Payment Gateway',
    riskScore: 14,
    postureTier: 'TIER_1_CRITICAL',
    certifications: ['SOC2_TYPE2', 'ISO_27001', 'PCI_DSS', 'GDPR'],
    lastAssessmentDate: '2026-08-01',
    questionnaireStatus: 'VERIFIED',
    exposedSubdomainsCount: 0,
    dataSharedTypes: ['Payment Tokens', 'Billing Addresses', 'Subscription Telemetry'],
    aiSecuritySummary: 'Tier-1 Trusted Payment Gateway. PCI-DSS v4.0 Level 1 certified with hardware security modules (HSM).'
  },
  {
    id: 'vendor-2',
    name: 'CloudMetrics Telemetry SaaS',
    category: 'Analytics',
    riskScore: 68,
    postureTier: 'TIER_2_HIGH',
    certifications: ['SOC2_TYPE2'],
    lastAssessmentDate: '2026-05-15',
    questionnaireStatus: 'EXPIRED',
    exposedSubdomainsCount: 4,
    dataSharedTypes: ['System Logs', 'Internal IP Addresses', 'User Activity Metrics'],
    aiSecuritySummary: 'Elevated Risk: Vendor SOC 2 audit expired 90 days ago. OSINT discovered 4 open Elasticsearch ports on vendor subdomains.'
  },
  {
    id: 'vendor-3',
    name: 'CodeSync Outsourced Engineering Ltd',
    category: 'Outsourced Dev',
    riskScore: 82,
    postureTier: 'TIER_1_CRITICAL',
    certifications: ['ISO_27001'],
    lastAssessmentDate: '2026-07-20',
    questionnaireStatus: 'PENDING_REVIEW',
    exposedSubdomainsCount: 12,
    dataSharedTypes: ['Source Code Repository Access', 'CI/CD Pipeline Tokens'],
    aiSecuritySummary: 'CRITICAL: Contractor accounts lack enforced Hardware Security Keys (FIDO2). Stealer logs detected 2 leaked contractor credentials.'
  }
];

export const PRESET_FOURTH_PARTY_EXPOSURES: TpcrmFourthPartyExposure[] = [
  {
    id: 'fp-1',
    vendorName: 'CloudMetrics Telemetry SaaS',
    subProcessorName: 'Snowflake Cloud Warehouse',
    sharedDependency: 'Centralized Log Aggregation',
    breachStatus: 'STABLE',
    impactRating: 'MEDIUM'
  },
  {
    id: 'fp-2',
    vendorName: 'CodeSync Outsourced Engineering Ltd',
    subProcessorName: 'NPM Dependency Registry (Malicious Package)',
    sharedDependency: 'Build-Time Pipeline Scripting',
    breachStatus: 'UNDER_INVESTIGATION',
    impactRating: 'CRITICAL'
  }
];

// -------------------------------------------------------------
// 3. DSPM & DLP & SHADOW AI PRESET DATA
// -------------------------------------------------------------
export const PRESET_DSPM_STORES: DspmDataStore[] = [
  {
    id: 'ds-1',
    name: 'prod_customer_master_db (PostgreSQL)',
    type: 'Postgres DB',
    classification: 'RESTRICTED_PII',
    recordCount: 2450000,
    encryptionStatus: 'ENCRYPTED_KMS',
    publicExposure: false,
    riskRating: 'LOW',
    location: 'us-east-1 (VPC Private Subnet)'
  },
  {
    id: 'ds-2',
    name: 'agentforge-financial-audit-logs',
    type: 'AWS S3 Bucket',
    classification: 'FINANCIAL_TAX',
    recordCount: 890000,
    encryptionStatus: 'DEFAULT_KEY',
    publicExposure: true,
    riskRating: 'CRITICAL',
    location: 'us-east-1 (Public S3 ACL)'
  },
  {
    id: 'ds-3',
    name: 'ai_model_training_cache (Snowflake)',
    type: 'Snowflake Warehouse',
    classification: 'CONFIDENTIAL_IP',
    recordCount: 15400000,
    encryptionStatus: 'ENCRYPTED_KMS',
    publicExposure: false,
    riskRating: 'MEDIUM',
    location: 'gcp-us-central1'
  }
];

export const PRESET_SHADOW_AI_ALERTS: DspmShadowAiAlert[] = [
  {
    id: 'sai-1',
    timestamp: '12:44:12',
    userEmail: 'dev.lead@agentforge.corp',
    department: 'Engineering',
    aiDestination: 'ChatGPT Free',
    dataPayloadType: 'PROPRIETARY_CODE',
    sizeBytes: 45200,
    verdict: 'BLOCKED_BY_DLP',
    riskLevel: 'HIGH'
  },
  {
    id: 'sai-2',
    timestamp: '11:15:30',
    userEmail: 'finance.analyst@agentforge.corp',
    department: 'Finance',
    aiDestination: 'DeepSeek',
    dataPayloadType: 'FINANCIAL_SPREADSHEET',
    sizeBytes: 128000,
    verdict: 'ALERTED_SECURITY',
    riskLevel: 'CRITICAL'
  }
];

export const PRESET_INSIDER_THREATS: DspmInsiderThreatEvent[] = [
  {
    id: 'insider-1',
    employeeName: 'Sarah Jenkins (Contractor)',
    role: 'Senior Backend Engineer',
    triggerEvent: 'Bulk S3 download (4,500 zip archives in 15 minutes)',
    anomalyScore: 94,
    downloadsLast24h: 4500,
    baselineDiff: '+1,800% above 30-day baseline',
    status: 'INVESTIGATING'
  }
];

// -------------------------------------------------------------
// 4. GRC & AUDIT READINESS PRESET DATA
// -------------------------------------------------------------
export const PRESET_GRC_CONTROLS: GrcFrameworkControl[] = [
  // --- EU AI ACT (REGULATION EU 2024/1689) ---
  {
    id: 'ctrl-eu-ai-1',
    framework: 'EU_AI_ACT',
    controlId: 'EU-AI-ART-9',
    title: 'High-Risk AI Risk Management System & Continuous Mitigation',
    category: 'AI Safety & Governance',
    status: 'COMPLIANT',
    automatedEvidenceSource: 'AEGIS_AI_SHIELD',
    lastAutomatedCheck: '2 mins ago',
    owner: 'AI Governance Board & CISO',
    description: 'Establishes a continuous, iterative risk management system for high-risk AI models throughout their entire lifecycle, inspecting prompt injection, jailbreaks, and system prompt leakage.',
    riskLevel: 'CRITICAL',
    regulatoryReference: 'EU AI Act (2024/1689) Article 9 (1)-(4)',
    remediationAdvice: 'Maintain active AEGIS AI Shield guardrails with real-time payload interception.'
  },
  {
    id: 'ctrl-eu-ai-2',
    framework: 'EU_AI_ACT',
    controlId: 'EU-AI-ART-10',
    title: 'Data Governance, Bias Mitigation & Training/Testing Integrity',
    category: 'AI Safety & Governance',
    status: 'COMPLIANT',
    automatedEvidenceSource: 'DSPM_DLP',
    lastAutomatedCheck: '8 mins ago',
    owner: 'Data Protection Officer (DPO)',
    description: 'Requires training, validation, and testing dataset quality checks, bias screening, and data provenance verification.',
    riskLevel: 'HIGH',
    regulatoryReference: 'EU AI Act (2024/1689) Article 10 (2)-(5)',
    remediationAdvice: 'Enforce DLP inspection and PII redaction on all training data feeds.'
  },
  {
    id: 'ctrl-eu-ai-3',
    framework: 'EU_AI_ACT',
    controlId: 'EU-AI-ART-14',
    title: 'Human Oversight & Emergency Kill-Switch Mechanisms',
    category: 'AI Safety & Governance',
    status: 'COMPLIANT',
    automatedEvidenceSource: 'AEGIS_AI_SHIELD',
    lastAutomatedCheck: '12 mins ago',
    owner: 'SecOps Incident Response Team',
    description: 'Ensures high-risk AI systems can be overseen by natural persons, featuring automated kill-switch capabilities and step-up manual intervention triggers.',
    riskLevel: 'HIGH',
    regulatoryReference: 'EU AI Act (2024/1689) Article 14 (1)-(4)',
    remediationAdvice: 'Maintain single-click emergency kill-switch in AEGIS Policy Tuning.'
  },
  {
    id: 'ctrl-eu-ai-4',
    framework: 'EU_AI_ACT',
    controlId: 'EU-AI-ART-15',
    title: 'Accuracy, Cybersecurity & Adversarial Attack Resistance',
    category: 'Vulnerability Mgmt',
    status: 'COMPLIANT',
    automatedEvidenceSource: 'RED_TEAM_LAB',
    lastAutomatedCheck: '15 mins ago',
    owner: 'Red Team Lead',
    description: 'Mandates technical resilience against adversarial prompt injection, model poisoning, and unauthorized automated payload execution.',
    riskLevel: 'CRITICAL',
    regulatoryReference: 'EU AI Act (2024/1689) Article 15 (1)',
    remediationAdvice: 'Execute daily automated red-teaming security suites across all active model endpoints.'
  },
  {
    id: 'ctrl-eu-ai-5',
    framework: 'EU_AI_ACT',
    controlId: 'EU-AI-ART-50',
    title: 'Transparency & Watermarking of Synthetic AI Output',
    category: 'AI Safety & Governance',
    status: 'PARTIAL',
    automatedEvidenceSource: 'APPSEC_SCANNER',
    lastAutomatedCheck: '45 mins ago',
    owner: 'Product Engineering Lead',
    description: 'Requires synthetic content generated by AI systems to be labeled in a machine-readable format and detectably watermarked.',
    riskLevel: 'MEDIUM',
    regulatoryReference: 'EU AI Act (2024/1689) Article 50 (2)',
    remediationAdvice: 'Inject C2PA or cryptographic metadata header into LLM streaming responses.'
  },

  // --- EU GDPR (GENERAL DATA PROTECTION REGULATION) ---
  {
    id: 'ctrl-gdpr-1',
    framework: 'GDPR',
    controlId: 'GDPR-ART-25',
    title: 'Data Protection by Design & Default (Pseudonymization)',
    category: 'Data Privacy & Rights',
    status: 'COMPLIANT',
    automatedEvidenceSource: 'DSPM_DLP',
    lastAutomatedCheck: '5 mins ago',
    owner: 'Data Privacy Lead',
    description: 'Enforces automated data minimization, pseudonymization, and encryption of personal data before reaching persistent databases or third-party AI models.',
    riskLevel: 'HIGH',
    regulatoryReference: 'EU GDPR Regulation 2016/679 Article 25',
    remediationAdvice: 'Verify DLP regex filters for automatic PII/SSN masking.'
  },
  {
    id: 'ctrl-gdpr-2',
    framework: 'GDPR',
    controlId: 'GDPR-ART-32',
    title: 'Security of Processing & Cryptographic Data Encryption',
    category: 'Encryption & Key Mgmt',
    status: 'COMPLIANT',
    automatedEvidenceSource: 'SPIRE_IDENTITY',
    lastAutomatedCheck: '10 mins ago',
    owner: 'Infrastructure Engineering',
    description: 'Ensures confidentiality, integrity, availability, and resilience of processing systems via hardware-level encryption and workload attestation.',
    riskLevel: 'CRITICAL',
    regulatoryReference: 'EU GDPR Regulation 2016/679 Article 32 (1)',
    remediationAdvice: 'Audit TLS 1.3 in-transit and KMS AES-256 at-rest configurations.'
  },
  {
    id: 'ctrl-gdpr-3',
    framework: 'GDPR',
    controlId: 'GDPR-ART-33',
    title: 'Automated Breach Detection & 72h Notification Telemetry',
    category: 'Incident Response',
    status: 'COMPLIANT',
    automatedEvidenceSource: 'AWS_CLOUDTRAIL',
    lastAutomatedCheck: '1 minute ago',
    owner: 'SOC Manager',
    description: 'Automated monitoring of unauthorized access attempts and immediate escalation playbooks to comply with 72-hour supervisory authority notification rules.',
    riskLevel: 'CRITICAL',
    regulatoryReference: 'EU GDPR Regulation 2016/679 Article 33',
    remediationAdvice: 'Keep SOAR breach notification playbooks active with automated evidence logging.'
  },
  {
    id: 'ctrl-gdpr-4',
    framework: 'GDPR',
    controlId: 'GDPR-ART-44',
    title: 'Cross-Border Data Transfer Safeguards & Egress Filtering',
    category: 'Data Privacy & Rights',
    status: 'PARTIAL',
    automatedEvidenceSource: 'OSINT_RECON',
    lastAutomatedCheck: '30 mins ago',
    owner: 'Legal & Compliance Counsel',
    description: 'Ensures personal data transfers outside the EEA satisfy Standard Contractual Clauses (SCCs) and adequacy decisions.',
    riskLevel: 'MEDIUM',
    regulatoryReference: 'EU GDPR Regulation 2016/679 Article 44-49',
    remediationAdvice: 'Restrict external API destination IPs to EEA-compliant regions.'
  },

  // --- NIST AI RMF 1.0 (NIST AI RISK MANAGEMENT FRAMEWORK) ---
  {
    id: 'ctrl-nist-airmf-1',
    framework: 'NIST_AI_RMF',
    controlId: 'GOVERN-1.2',
    title: 'Trustworthy AI System Governance & Organizational Alignment',
    category: 'AI Safety & Governance',
    status: 'COMPLIANT',
    automatedEvidenceSource: 'AEGIS_AI_SHIELD',
    lastAutomatedCheck: '3 mins ago',
    owner: 'AI Safety Director',
    description: 'Establishes clear roles, responsibilities, and risk management policies for trustworthy AI deployment across system components.',
    riskLevel: 'HIGH',
    regulatoryReference: 'NIST AI RMF 1.0 GOVERN 1.2',
    remediationAdvice: 'Review and approve AEGIS AI Guardrail strictness thresholds.'
  },
  {
    id: 'ctrl-nist-airmf-2',
    framework: 'NIST_AI_RMF',
    controlId: 'MAP-2.2',
    title: 'Adversarial Threat Mapping & Impact Assessment',
    category: 'Vulnerability Mgmt',
    status: 'COMPLIANT',
    automatedEvidenceSource: 'VAPT_CENTER',
    lastAutomatedCheck: '14 mins ago',
    owner: 'Penetration Testing Lead',
    description: 'Categorizes potential vulnerabilities, unintended capabilities, and malicious abuse scenarios for language models and agent tools.',
    riskLevel: 'CRITICAL',
    regulatoryReference: 'NIST AI RMF 1.0 MAP 2.2',
    remediationAdvice: 'Run Attack Tree simulations to evaluate multi-stage exploit chains.'
  },
  {
    id: 'ctrl-nist-airmf-3',
    framework: 'NIST_AI_RMF',
    controlId: 'MEASURE-2.3',
    title: 'AI System Safety, Model Drift & Hallucination Testing',
    category: 'AI Safety & Governance',
    status: 'COMPLIANT',
    automatedEvidenceSource: 'RED_TEAM_LAB',
    lastAutomatedCheck: '20 mins ago',
    owner: 'MLOps & SecOps Team',
    description: 'Quantifies system accuracy, toxicity thresholds, hallucination rates, and unexpected output drift under continuous operation.',
    riskLevel: 'MEDIUM',
    regulatoryReference: 'NIST AI RMF 1.0 MEASURE 2.3',
    remediationAdvice: 'Maintain RAG hallucination checks and grounded verification.'
  },

  // --- NIST CSF 2.0 (CYBERSECURITY FRAMEWORK) ---
  {
    id: 'ctrl-nist-csf-1',
    framework: 'NIST_CSF_2_0',
    controlId: 'GV.OC-01',
    title: 'Organizational Cybersecurity Risk Strategy & Policy',
    category: 'Logging & Monitoring',
    status: 'COMPLIANT',
    automatedEvidenceSource: 'AWS_CLOUDTRAIL',
    lastAutomatedCheck: '6 mins ago',
    owner: 'Chief Information Security Officer',
    description: 'Organizational cybersecurity risk management strategy is established, communicated, and continuously monitored.',
    riskLevel: 'HIGH',
    regulatoryReference: 'NIST CSF 2.0 Governance (GV.OC-01)',
    remediationAdvice: 'Automate evidence streaming to GRC dashboard.'
  },
  {
    id: 'ctrl-nist-csf-2',
    framework: 'NIST_CSF_2_0',
    controlId: 'PR.AA-01',
    title: 'Identities & Credentials Managed via Cryptographic Attestation',
    category: 'Access Control',
    status: 'COMPLIANT',
    automatedEvidenceSource: 'SPIRE_IDENTITY',
    lastAutomatedCheck: '4 mins ago',
    owner: 'IAM Lead',
    description: 'Identities and credentials for authorized devices, workloads, and users are managed through cryptographically verified SPIFFE/SPIRE SVID certificates.',
    riskLevel: 'CRITICAL',
    regulatoryReference: 'NIST CSF 2.0 Protect (PR.AA-01)',
    remediationAdvice: 'Ensure short TTL on X.509 workload certificates.'
  },
  {
    id: 'ctrl-nist-csf-3',
    framework: 'NIST_CSF_2_0',
    controlId: 'DE.CM-01',
    title: 'Continuous Security Monitoring & Anomaly Detection',
    category: 'Logging & Monitoring',
    status: 'COMPLIANT',
    automatedEvidenceSource: 'AWS_CLOUDTRAIL',
    lastAutomatedCheck: '1 minute ago',
    owner: 'SOC Lead',
    description: 'Networks and physical environments are monitored continuously to detect potential cybersecurity events and anomalous agent execution.',
    riskLevel: 'HIGH',
    regulatoryReference: 'NIST CSF 2.0 Detect (DE.CM-01)',
    remediationAdvice: 'Keep SIEM anomaly detection thresholds aligned with UEBA baselines.'
  },

  // --- NIST SP 800-53 REV. 5 ---
  {
    id: 'ctrl-nist-80053-1',
    framework: 'NIST_SP_800_53',
    controlId: 'NIST-AC-2',
    title: 'Account Management & Zero-Trust Workload Identity',
    category: 'Access Control',
    status: 'COMPLIANT',
    automatedEvidenceSource: 'SPIRE_IDENTITY',
    lastAutomatedCheck: '7 mins ago',
    owner: 'Cloud Security Architect',
    description: 'Automates account management, lifecycle revocation, and workload attestation across cloud clusters.',
    riskLevel: 'CRITICAL',
    regulatoryReference: 'NIST SP 800-53 Rev. 5 AC-2',
    remediationAdvice: 'Revoke uncredentialed service accounts automatically.'
  },
  {
    id: 'ctrl-nist-80053-2',
    framework: 'NIST_SP_800_53',
    controlId: 'NIST-SI-10',
    title: 'Information Input Validation & RASP Web Protection',
    category: 'Vulnerability Mgmt',
    status: 'COMPLIANT',
    automatedEvidenceSource: 'APPSEC_SCANNER',
    lastAutomatedCheck: '18 mins ago',
    owner: 'AppSec Engineer',
    description: 'Validates input for syntactical correctness and prevents server-side injections or command execution.',
    riskLevel: 'HIGH',
    regulatoryReference: 'NIST SP 800-53 Rev. 5 SI-10',
    remediationAdvice: 'Enforce parameterized queries and strict input sanitizers.'
  },

  // --- SOC 2 TYPE II ---
  {
    id: 'ctrl-1',
    framework: 'SOC2_TYPE2',
    controlId: 'CC6.1',
    title: 'Logical Access Control & Zero Trust Workload Attestation',
    category: 'Access Control',
    status: 'COMPLIANT',
    automatedEvidenceSource: 'SPIRE_IDENTITY',
    lastAutomatedCheck: '5 mins ago',
    owner: 'InfraSec Team',
    description: 'Restricts logical access to infrastructure and data resources using strong cryptographic identity.',
    riskLevel: 'HIGH',
    regulatoryReference: 'SOC 2 CC6.1 Logical Access',
    remediationAdvice: 'Maintain active SPIFFE SVID enforcement.'
  },
  {
    id: 'ctrl-2',
    framework: 'SOC2_TYPE2',
    controlId: 'CC7.1',
    title: 'Vulnerability Scanning & Penetration Testing Program',
    category: 'Vulnerability Mgmt',
    status: 'COMPLIANT',
    automatedEvidenceSource: 'VAPT_CENTER',
    lastAutomatedCheck: '12 mins ago',
    owner: 'AppSec Lead',
    description: 'Conducts regular automated vulnerability scanning and simulated adversary attacks across staging and production.',
    riskLevel: 'HIGH',
    regulatoryReference: 'SOC 2 CC7.1 Vulnerability Management',
    remediationAdvice: 'Review VAPT Workbench finding remediation timelines.'
  },

  // --- ISO 27001:2022 ---
  {
    id: 'ctrl-3',
    framework: 'ISO_27001_2022',
    controlId: 'A.8.28',
    title: 'Secure Coding & SAST/DAST Pipeline Checks',
    category: 'Vulnerability Mgmt',
    status: 'COMPLIANT',
    automatedEvidenceSource: 'APPSEC_SCANNER',
    lastAutomatedCheck: '1 hour ago',
    owner: 'DevSecOps Team',
    description: 'Ensures software development guidelines are applied to prevent vulnerabilities from reaching production repositories.',
    riskLevel: 'HIGH',
    regulatoryReference: 'ISO/IEC 27001:2022 Annex A.8.28',
    remediationAdvice: 'Enforce CI/CD quality gate stopping critical SAST findings.'
  },

  // --- PCI-DSS 4.0 ---
  {
    id: 'ctrl-4',
    framework: 'PCI_DSS_4_0',
    controlId: 'Req 1.2',
    title: 'External Attack Surface & Perimeter Port Exposure Control',
    category: 'Logging & Monitoring',
    status: 'PARTIAL',
    automatedEvidenceSource: 'OSINT_RECON',
    lastAutomatedCheck: '30 mins ago',
    owner: 'Perimeter SecOps',
    description: 'Restricts inbound and outbound traffic to that which is necessary for the cardholder data environment.',
    riskLevel: 'HIGH',
    regulatoryReference: 'PCI-DSS v4.0 Requirement 1.2',
    remediationAdvice: 'Close open test ports identified during OSINT perimeter scans.'
  }
];

export const PRESET_AUDIT_EVIDENCE: GrcAuditEvidence[] = [
  {
    id: 'ev-eu-ai-1',
    controlId: 'EU-AI-ART-9',
    title: 'EU AI Act High-Risk System Conformity Assessment Log',
    collectorSource: 'AEGIS AI Defense Shield (Article 9 Module)',
    payloadSummary: 'Intercepted 1,420 prompt injection & jailbreak probes. Risk mitigation verified active for EU AI Act compliance.',
    verifiedTimestamp: '2026-08-26 14:10:00 UTC',
    integrityHash: 'sha256:d8a5f39b12c4e902187f56193ab21e902891d4e77281045982ef2981bc32910a'
  },
  {
    id: 'ev-eu-ai-2',
    controlId: 'EU-AI-ART-14',
    title: 'EU AI Act Article 14 Human Oversight & Kill-Switch Telemetry',
    collectorSource: 'SecOps SOAR Playbook Engine',
    payloadSummary: 'Verified human override controls and instant model suspension API response in under 250ms.',
    verifiedTimestamp: '2026-08-26 13:55:00 UTC',
    integrityHash: 'sha256:c29a8f43198bb67e510a29381c6189ab00192e445199621b88a91c7823e198aa'
  },
  {
    id: 'ev-gdpr-1',
    controlId: 'GDPR-ART-25',
    title: 'GDPR Article 25 Automated PII Pseudonymization Record',
    collectorSource: 'DSPM & DLP Real-Time Engine',
    payloadSummary: 'Processed 2.45M database fields. Zero unencrypted PII exported to public LLM endpoints.',
    verifiedTimestamp: '2026-08-26 13:40:00 UTC',
    integrityHash: 'sha256:f71b92019c43e0192418ba620194e1b82794a021948ba20149e81b29402194aa'
  },
  {
    id: 'ev-nist-1',
    controlId: 'GOVERN-1.2',
    title: 'NIST AI RMF 1.0 Trustworthy Governance Attestation Report',
    collectorSource: 'Continuous GRC Collector (NIST AI RMF Suite)',
    payloadSummary: 'Mapped 100% of LLM agent nodes to risk thresholds with automated guardrail policy enforcement.',
    verifiedTimestamp: '2026-08-26 13:30:00 UTC',
    integrityHash: 'sha256:a1098ef31948aa0214b7890123e41b892147ba019842e019284ba019248bb019'
  },
  {
    id: 'ev-1',
    controlId: 'CC6.1',
    title: 'SPIRE Cryptographic SVID Attestation Log',
    collectorSource: 'SPIRE Server (spiffe://prod.internal)',
    payloadSummary: '142 workloads verified via X.509 SVID, 0 unauthenticated nodes permitted.',
    verifiedTimestamp: '2026-08-26 12:40:00 UTC',
    integrityHash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    id: 'ev-2',
    controlId: 'CC7.1',
    title: 'Automated VAPT Penetration Test Execution Evidence',
    collectorSource: 'VAPT Workbench (OWASP ASVS v4.0)',
    payloadSummary: 'Ran 48 attack vectors across Staging API. 0 critical unmitigated vulnerabilities found.',
    verifiedTimestamp: '2026-08-26 12:35:00 UTC',
    integrityHash: 'sha256:8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4'
  }
];

// -------------------------------------------------------------
// 5. CTI & DARK WEB PRESET DATA
// -------------------------------------------------------------
export const PRESET_STEALER_LOGS: CtiStealerLogRecord[] = [
  {
    id: 'stl-1',
    leakedEmail: 'alex.developer@agentforge.corp',
    malwareFamily: 'RedLine Stealer',
    exposedUrl: 'https://github.agentforge.corp/login',
    plainOrHash: 'SuperSecretPass2026! (Plaintext)',
    dateDiscovered: '2026-08-24',
    compromisedMachineIp: '185.220.101.5',
    riskRating: 'CRITICAL'
  },
  {
    id: 'stl-2',
    leakedEmail: 'support@agentforge.corp',
    malwareFamily: 'LumaStealer',
    exposedUrl: 'https://mail.agentforge.corp',
    plainOrHash: '$2a$12$eImiTXuWVxfM37uY4JANJ...',
    dateDiscovered: '2026-08-20',
    compromisedMachineIp: '91.240.118.42',
    riskRating: 'HIGH'
  }
];

export const PRESET_TYPOSQUAT_DOMAINS: CtiTyposquatDomain[] = [
  {
    id: 'typo-1',
    domainName: 'agentforg-login.com',
    similarityScore: 96,
    ipAddress: '194.165.16.88',
    mxRecordActive: true,
    httpStatusCode: 200,
    parkedOrPhishing: 'ACTIVE_PHISHING_KIT',
    status: 'TAKE_DOWN_SUBMITTED'
  },
  {
    id: 'typo-2',
    domainName: 'agentforge-billing.net',
    similarityScore: 92,
    ipAddress: '45.142.214.12',
    mxRecordActive: false,
    httpStatusCode: 404,
    parkedOrPhishing: 'SUSPICIOUS_MX',
    status: 'BLOCKED_AT_DNS'
  }
];

export const PRESET_CANARY_TOKENS: CtiCanaryTokenTrigger[] = [
  {
    id: 'canary-1',
    tokenName: 'AWS-Decoy-Staging-AccessKey',
    type: 'AWS_KEY_CANARY',
    locationPlaced: 'public-git-repo/fake_config.json',
    triggeredAt: '2026-08-26 11:14:02',
    triggerSourceIp: '198.51.100.42 (Tor Exit Node)',
    userAgent: 'aws-cli/2.15.0 Python/3.11.2 Linux/x86_64',
    status: 'ACTIVE_ALERT'
  }
];

// -------------------------------------------------------------
// 6. UEBA (USER & ENTITY BEHAVIOR ANALYTICS) PRESETS
// -------------------------------------------------------------
export const PRESET_UEBA_PROFILES: UebaEntityRiskProfile[] = [
  {
    id: 'ueba-p1',
    entityName: 'vladimir.contractor@agentforge.corp',
    entityType: 'CONTRACTOR',
    department: 'DevOps / Offshore',
    riskScore: 94,
    peerGroupBaselineDiff: '+520% S3 Downloads vs Engineering Peer Group',
    activeAlertsCount: 3,
    lastAnomalyType: 'AFTER_HOURS_EXFIL',
    status: 'ISOLATED'
  },
  {
    id: 'ueba-p2',
    entityName: 'svc-github-actions-deployer',
    entityType: 'SERVICE_ACCOUNT',
    department: 'CI/CD Pipeline',
    riskScore: 78,
    peerGroupBaselineDiff: 'First-time Production IAM Role AssumeFrom Unknown IP',
    activeAlertsCount: 2,
    lastAnomalyType: 'PRIVILEGE_ESCALATION',
    status: 'REQUIRE_REAUTH'
  },
  {
    id: 'ueba-p3',
    entityName: 'sarah.ciso@agentforge.corp',
    entityType: 'PRIVILEGED_ADMIN',
    department: 'Executive Security',
    riskScore: 64,
    peerGroupBaselineDiff: 'Impossible Travel: Signed in from Tokyo 12 min after New York',
    activeAlertsCount: 1,
    lastAnomalyType: 'GEOGRAPHIC_IMPOSSIBLE_TRAVEL',
    status: 'UNDER_SOC_REVIEW'
  },
  {
    id: 'ueba-p4',
    entityName: 'david.frontend@agentforge.corp',
    entityType: 'EMPLOYEE',
    department: 'Product Engineering',
    riskScore: 12,
    peerGroupBaselineDiff: 'Within standard 7-day behavior baseline',
    activeAlertsCount: 0,
    lastAnomalyType: 'AFTER_HOURS_EXFIL',
    status: 'MONITORING'
  }
];

export const PRESET_UEBA_ANOMALIES: UebaAnomalyEvent[] = [
  {
    id: 'anom-1',
    timestamp: '2026-08-26 03:14:22 UTC',
    entityName: 'vladimir.contractor@agentforge.corp',
    anomalyTitle: 'Unusual Bulk S3 Customer Database Download (45 GB)',
    category: 'Data Egress',
    riskScore: 94,
    sourceIp: '185.220.101.5',
    location: 'Bucharest, Romania (VPN Endpoint)',
    mitigationAction: 'Workstation Network Isolated via CrowdStrike API'
  },
  {
    id: 'anom-2',
    timestamp: '2026-08-26 02:40:11 UTC',
    entityName: 'svc-github-actions-deployer',
    anomalyTitle: 'SPIFFE SVID Token Minting Spike (250 SVIDs/sec)',
    category: 'Credential Misuse',
    riskScore: 82,
    sourceIp: '34.201.44.12',
    location: 'AWS us-east-1 EKS Cluster',
    mitigationAction: 'Rate-limited SPIRE agent via SPIFFE Workload Attestation'
  },
  {
    id: 'anom-3',
    timestamp: '2026-08-25 21:05:00 UTC',
    entityName: 'sarah.ciso@agentforge.corp',
    anomalyTitle: 'Geographic Impossible Travel Detection',
    category: 'Access Pattern',
    riskScore: 68,
    sourceIp: '103.22.18.9',
    location: 'Tokyo, Japan (Previous: NY, USA)',
    mitigationAction: 'Step-up MFA Prompt Triggered & Session Revoked'
  }
];

// -------------------------------------------------------------
// 7. DLP (DATA LOSS PREVENTION) PRESETS
// -------------------------------------------------------------
export const PRESET_DLP_POLICIES: DlpInspectionPolicy[] = [
  {
    id: 'dlp-pol-1',
    policyName: 'PCI-DSS Credit Card Number Inspection',
    ruleCategory: 'PCI_CREDIT_CARD',
    patternRegex: '\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})\\b',
    action: 'BLOCK_&_ALERT',
    inspectedChannels: ['HTTP_POST', 'AI_PROMPT_EGRESS', 'EMAIL_ATTACHMENT'],
    triggersLast24h: 14,
    status: 'ACTIVE_ENFORCED'
  },
  {
    id: 'dlp-pol-2',
    policyName: 'AWS KMS & Secret Key Leak Guard',
    ruleCategory: 'AWS_SECRET_KEY',
    patternRegex: '(?i)aws_(?:secret_access_key|session_token)\\s*=\\s*["\'][A-Za-z0-9/+=]{40}["\']',
    action: 'BLOCK_&_ALERT',
    inspectedChannels: ['HTTP_POST', 'CLOUD_STORAGE', 'AI_PROMPT_EGRESS'],
    triggersLast24h: 6,
    status: 'ACTIVE_ENFORCED'
  },
  {
    id: 'dlp-pol-3',
    policyName: 'Source Code & Internal Prop Key Protection',
    ruleCategory: 'SOURCE_CODE',
    patternRegex: 'export\\s+(const|class|function|type)\\s+[A-Za-z0-9_]+',
    action: 'MASK_IN_TRANSIT',
    inspectedChannels: ['AI_PROMPT_EGRESS', 'CLOUD_STORAGE'],
    triggersLast24h: 42,
    status: 'ACTIVE_ENFORCED'
  },
  {
    id: 'dlp-pol-4',
    policyName: 'US SSN & Tax ID Exfiltration Filter',
    ruleCategory: 'SSN_TAX_ID',
    patternRegex: '\\b\\d{3}-\\d{2}-\\d{4}\\b',
    action: 'QUARANTINE',
    inspectedChannels: ['EMAIL_ATTACHMENT', 'USB_STORAGE'],
    triggersLast24h: 2,
    status: 'ACTIVE_ENFORCED'
  }
];

export const PRESET_DLP_INCIDENTS: DlpIncidentRecord[] = [
  {
    id: 'inc-dlp-101',
    timestamp: '2026-08-26 12:15:44',
    sourceUser: 'mark.marketing@agentforge.corp',
    channel: 'AI_PROMPT_EGRESS',
    destination: 'ChatGPT Free (External Web API)',
    matchedRule: 'Source Code & Internal Prop Key Protection',
    sensitiveItemCount: 120,
    enforcedAction: 'BLOCKED',
    severity: 'HIGH'
  },
  {
    id: 'inc-dlp-102',
    timestamp: '2026-08-26 11:30:10',
    sourceUser: 'alex.developer@agentforge.corp',
    channel: 'HTTP_POST',
    destination: 'pastebin.com',
    matchedRule: 'AWS KMS & Secret Key Leak Guard',
    sensitiveItemCount: 1,
    enforcedAction: 'BLOCKED',
    severity: 'CRITICAL'
  },
  {
    id: 'inc-dlp-103',
    timestamp: '2026-08-26 09:12:05',
    sourceUser: 'hr.payroll@agentforge.corp',
    channel: 'EMAIL_ATTACHMENT',
    destination: 'external-auditor@taxfirm.com',
    matchedRule: 'US SSN & Tax ID Exfiltration Filter',
    sensitiveItemCount: 450,
    enforcedAction: 'QUARANTINED',
    severity: 'HIGH'
  }
];

