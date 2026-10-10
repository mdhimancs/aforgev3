import { useState, useEffect, useCallback } from 'react';

export type MainViewType =
  | 'secops'
  | 'appsec_scanner'
  | 'security_lab'
  | 'vapt'
  | 'grc_compliance'
  | 'builder'
  | 'blog';

export type SecOpsSubTabType =
  | 'siem'
  | 'ueba'
  | 'soar'
  | 'ids_ips_waf'
  | 'darkweb'
  | 'osint'
  | 'malware_campaigns'
  | 'attacktree'
  | 'killchain'
  | 'threathunt'
  | 'xdr'
  | 'aipentest'
  | 'tpcrm'
  | 'cspm'
  | 'dspm'
  | 'dlp'
  | 'grc'
  | 'spire_stripe';

export type AppSecSubTabType =
  | 'overview'
  | 'aegis'
  | 'sast'
  | 'dast'
  | 'sca'
  | 'secrets_iac'
  | 'ai_copilot'
  | 'reports';

export type VaptSubTabType =
  | 'workbench'
  | 'findings'
  | 'cvss_calc'
  | 'scope_roe'
  | 'compliance_report';

export type GrcFrameworkFilterType =
  | 'ALL'
  | 'EU_AI_ACT'
  | 'GDPR'
  | 'NIST_AI_RMF'
  | 'NIST_CSF_2_0'
  | 'NIST_SP_800_53'
  | 'SOC2_TYPE2'
  | 'ISO_27001_2022'
  | 'PCI_DSS_4_0';

// Main top-level tab URL segments
export const MAIN_VIEW_TO_PATH: Record<MainViewType, string> = {
  secops: '/secops',
  appsec_scanner: '/appsec-scanner',
  security_lab: '/red-team-lab',
  vapt: '/pentest-vapt',
  grc_compliance: '/grc-compliance',
  builder: '/canvas',
  blog: '/security-blog',
};

export const PATH_TO_MAIN_VIEW: Record<string, MainViewType> = {
  secops: 'secops',
  'ai-secops-nexus': 'secops',
  'appsec-scanner': 'appsec_scanner',
  appsec_scanner: 'appsec_scanner',
  appsec: 'appsec_scanner',
  'red-team-lab': 'security_lab',
  security_lab: 'security_lab',
  redteam: 'security_lab',
  'pentest-vapt': 'vapt',
  vapt: 'vapt',
  pentest: 'vapt',
  'grc-compliance': 'grc_compliance',
  grc_compliance: 'grc_compliance',
  grc: 'grc_compliance',
  canvas: 'builder',
  builder: 'builder',
  'security-blog': 'blog',
  blog: 'blog',
};

// SecOps sub-tab URL segments
export const SECOPS_TAB_TO_SLUG: Record<SecOpsSubTabType, string> = {
  siem: 'siem',
  ueba: 'ueba',
  soar: 'soar',
  ids_ips_waf: 'ids-ips-waf',
  darkweb: 'darkweb',
  osint: 'osint',
  malware_campaigns: 'malware-campaigns',
  attacktree: 'attacktree',
  killchain: 'killchain',
  threathunt: 'threathunt',
  xdr: 'xdr',
  aipentest: 'aipentest',
  tpcrm: 'tpcrm',
  cspm: 'cspm',
  dspm: 'dspm',
  dlp: 'dlp',
  grc: 'grc',
  spire_stripe: 'spire-stripe',
};

export const SLUG_TO_SECOPS_TAB: Record<string, SecOpsSubTabType> = Object.entries(
  SECOPS_TAB_TO_SLUG
).reduce((acc, [key, slug]) => {
  acc[slug] = key as SecOpsSubTabType;
  acc[key] = key as SecOpsSubTabType;
  return acc;
}, {} as Record<string, SecOpsSubTabType>);

// AppSec sub-tab URL segments
export const APPSEC_TAB_TO_SLUG: Record<AppSecSubTabType, string> = {
  overview: 'overview',
  aegis: 'aegis',
  sast: 'sast',
  dast: 'dast',
  sca: 'sca',
  secrets_iac: 'secrets-iac',
  ai_copilot: 'ai-copilot',
  reports: 'reports',
};

export const SLUG_TO_APPSEC_TAB: Record<string, AppSecSubTabType> = Object.entries(
  APPSEC_TAB_TO_SLUG
).reduce((acc, [key, slug]) => {
  acc[slug] = key as AppSecSubTabType;
  acc[key] = key as AppSecSubTabType;
  return acc;
}, {} as Record<string, AppSecSubTabType>);

// VAPT sub-tab URL segments
export const VAPT_TAB_TO_SLUG: Record<VaptSubTabType, string> = {
  workbench: 'workbench',
  findings: 'findings',
  cvss_calc: 'cvss-calc',
  scope_roe: 'scope-roe',
  compliance_report: 'compliance-report',
};

export const SLUG_TO_VAPT_TAB: Record<string, VaptSubTabType> = Object.entries(
  VAPT_TAB_TO_SLUG
).reduce((acc, [key, slug]) => {
  acc[slug] = key as VaptSubTabType;
  acc[key] = key as VaptSubTabType;
  return acc;
}, {} as Record<string, VaptSubTabType>);

// GRC framework filter URL segments
export const GRC_FILTER_TO_SLUG: Record<GrcFrameworkFilterType, string> = {
  ALL: 'all',
  EU_AI_ACT: 'eu-ai-act',
  GDPR: 'gdpr',
  NIST_AI_RMF: 'nist-ai-rmf',
  NIST_CSF_2_0: 'nist-csf-2-0',
  NIST_SP_800_53: 'nist-sp-800-53',
  SOC2_TYPE2: 'soc2-type2',
  ISO_27001_2022: 'iso-27001-2022',
  PCI_DSS_4_0: 'pci-dss-4-0',
};

export const SLUG_TO_GRC_FILTER: Record<string, GrcFrameworkFilterType> = Object.entries(
  GRC_FILTER_TO_SLUG
).reduce((acc, [key, slug]) => {
  acc[slug] = key as GrcFrameworkFilterType;
  acc[key.toLowerCase()] = key as GrcFrameworkFilterType;
  return acc;
}, {} as Record<string, GrcFrameworkFilterType>);

export interface ParsedRoute {
  mainView: MainViewType;
  subSegment: string | null;
  pathname: string;
}

export function parsePathname(pathname: string = window.location.pathname): ParsedRoute {
  const clean = pathname.replace(/^\/+|\/+$/g, '');
  if (!clean) {
    return {
      mainView: 'secops',
      subSegment: 'siem',
      pathname: '/secops/siem',
    };
  }

  const parts = clean.split('/');
  const first = parts[0].toLowerCase();
  const second = parts.slice(1).join('/') || null;

  const mainView = PATH_TO_MAIN_VIEW[first] || 'secops';
  return {
    mainView,
    subSegment: second,
    pathname: `/${clean}`,
  };
}

export function getMainViewDefaultUrl(view: MainViewType): string {
  switch (view) {
    case 'secops':
      return '/secops/siem';
    case 'appsec_scanner':
      return '/appsec-scanner/overview';
    case 'security_lab':
      return '/red-team-lab';
    case 'vapt':
      return '/pentest-vapt/workbench';
    case 'grc_compliance':
      return '/grc-compliance';
    case 'builder':
      return '/canvas';
    case 'blog':
      return '/security-blog';
    default:
      return '/secops/siem';
  }
}

export function navigateToUrl(path: string, replace = false) {
  if (typeof window === 'undefined') return;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (window.location.pathname !== normalized) {
    if (replace) {
      window.history.replaceState({}, '', normalized);
    } else {
      window.history.pushState({}, '', normalized);
    }
  }
  window.dispatchEvent(new CustomEvent('app-location-change', { detail: { pathname: normalized } }));
}

export function useUrlRoute() {
  const [route, setRoute] = useState<ParsedRoute>(() => parsePathname());

  useEffect(() => {
    // Normalize bare root '/' to default tab URL on initial mount
    if (window.location.pathname === '/' || window.location.pathname === '') {
      const defaultPath = '/secops/siem';
      window.history.replaceState({}, '', defaultPath);
      setRoute(parsePathname(defaultPath));
    }

    const handleRouteChange = () => {
      setRoute(parsePathname(window.location.pathname));
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('app-location-change', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('app-location-change', handleRouteChange);
    };
  }, []);

  const navigate = useCallback((path: string, replace = false) => {
    navigateToUrl(path, replace);
  }, []);

  return {
    ...route,
    navigate,
  };
}
