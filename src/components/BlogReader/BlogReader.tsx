import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { EMBEDDED_BLOG_POSTS, BLOG_SITE_INFO } from '../../data/blogIndexData';
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Search,
  Calendar,
  Clock,
  BookOpen,
  Tag,
  Folder,
  ListOrdered,
  ListTree,
  ExternalLink,
  Share2,
  Check,
  Copy,
  ArrowLeft,
  Table,
  LayoutGrid,
  FileText,
  X,
  Filter,
  Bookmark,
  Hash,
  Sparkles,
  Lock,
  Shield,
  ShieldCheck,
  ShieldAlert,
  LogIn,
  LogOut,
  User as UserIcon,
  RefreshCw,
  Key,
  Bell,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Inbox,
  Send,
  Eye,
  HelpCircle,
  BadgeCheck
} from 'lucide-react';
import {
  auth,
  db,
  signInWithGoogle,
  logoutFirebase,
  handleFirestoreError,
  OperationType
} from '../../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, collection } from 'firebase/firestore';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { AnimatedCheckmark } from '../common/AnimatedCheckmark';
import { ShimmerSkeleton, ArticleLoadingSkeleton } from '../common/ShimmerSkeleton';
import { SpotlightCard } from '../common/SpotlightCard';

export interface AccessRequestItem {
  id: string;
  postId: string;
  postTitle: string;
  slug: string;
  userId: string;
  userEmail: string;
  userName: string;
  requestedClearance: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

interface PostSummary {
  id: string;
  slug: string;
  title: string;
  date: string;
  formattedDate: string;
  year: string;
  categories: string[];
  excerpt: string;
  wordCount: number;
  readingTime: string;
  readingTimeMinutes: number;
  originalUrl: string;
  coverImage?: string;
  isSystemDesign?: boolean;
}

interface FullPost extends PostSummary {
  contentHtml: string;
  contentMarkdown?: string;
}

interface HeadingItem {
  id: string;
  text: string;
  level: string;
}

// In-memory module cache for full posts dataset
let fullDatasetCache: FullPost[] | null = null;

// Helper to fetch full blog dataset across multiple candidate paths (subpaths, relative, base URL)
async function fetchFullDataset(): Promise<FullPost[]> {
  if (fullDatasetCache && fullDatasetCache.length > 0) {
    return fullDatasetCache;
  }

  const base = (import.meta as any).env?.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;

  const candidateUrls = [
    `${cleanBase}data/system_design_blog_full.json`,
    './data/system_design_blog_full.json',
    'data/system_design_blog_full.json',
    '/data/system_design_blog_full.json'
  ];

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.posts && Array.isArray(data.posts) && data.posts.length > 0) {
          fullDatasetCache = data.posts;
          return data.posts;
        }
      }
    } catch {
      // Continue to next URL candidate
    }
  }

  return [];
}

export const BlogReader: React.FC = () => {
  const { theme } = useTheme();

  // Firebase Auth & RBAC State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'viewer' | 'analyst' | 'security_architect' | 'admin'>('viewer');
  const [userClearance, setUserClearance] = useState<'Public' | 'Internal' | 'Confidential' | 'Restricted'>('Public');
  const [articleAccessLevels, setArticleAccessLevels] = useState<Record<string, 'Public' | 'Internal' | 'Confidential' | 'Restricted'>>({});
  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const CLEARANCE_VALUES = {
    'Public': 0,
    'Internal': 1,
    'Confidential': 2,
    'Restricted': 3
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) {
        // Fetch or create user profile in Firestore
        const userRef = doc(db, 'users', user.uid);
        try {
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            setUserRole(data.role || 'analyst');
            setUserClearance(data.clearanceLevel || 'Internal');
          } else {
            const isAdminEmail = user.email === 'munish.world@gmail.com';
            const defaultRole = isAdminEmail ? 'admin' : 'analyst';
            const defaultClearance = isAdminEmail ? 'Restricted' : 'Internal';
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'Security Analyst',
              role: defaultRole,
              clearanceLevel: defaultClearance,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            setUserRole(defaultRole);
            setUserClearance(defaultClearance);
          }
        } catch (err) {
          console.warn('Could not read user profile from Firestore:', err);
        }
      } else {
        setUserClearance('Public');
        setUserRole('viewer');
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to real-time Firestore blog access policies
  useEffect(() => {
    const policiesCol = collection(db, 'blogAccessPolicies');
    const unsubscribeSnapshot = onSnapshot(
      policiesCol,
      (snapshot) => {
        const policiesMap: Record<string, 'Public' | 'Internal' | 'Confidential' | 'Restricted'> = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.requiredClearance) {
            policiesMap[docSnap.id] = data.requiredClearance;
            if (data.slug) {
              policiesMap[data.slug] = data.requiredClearance;
            }
          }
        });
        setArticleAccessLevels((prev) => ({ ...prev, ...policiesMap }));
      },
      (error) => {
        console.warn('Firestore blogAccessPolicies sync error:', error);
      }
    );

    return () => unsubscribeSnapshot();
  }, []);

  // Access Request & Admin Approvals State (munish.world@gmail.com)
  const [accessRequests, setAccessRequests] = useState<AccessRequestItem[]>([]);
  const [userGrants, setUserGrants] = useState<Set<string>>(new Set());
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestTargetPost, setRequestTargetPost] = useState<{ id: string; title: string; slug: string } | null>(null);
  const [requestReason, setRequestReason] = useState('Requesting authorization to review system design architecture and security threat model.');
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestSuccessMessage, setRequestSuccessMessage] = useState<string | null>(null);
  const [isAdminInboxOpen, setIsAdminInboxOpen] = useState(false);
  const [inboxFilter, setInboxFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [adminActionLoading, setAdminActionLoading] = useState<string | null>(null);

  const isAdmin = currentUser?.email === 'munish.world@gmail.com' || userRole === 'admin';

  // Listen to Access Requests from Firestore
  useEffect(() => {
    if (!currentUser) {
      setAccessRequests([]);
      return;
    }

    const requestsCol = collection(db, 'accessRequests');
    const unsubscribeRequests = onSnapshot(
      requestsCol,
      (snapshot) => {
        const list: AccessRequestItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as any;
          if (isAdmin || data.userId === currentUser.uid) {
            list.push({
              id: docSnap.id,
              ...data
            });
          }
        });
        setAccessRequests(list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
      },
      (err) => {
        console.warn('Firestore accessRequests listener error:', err);
      }
    );

    return () => unsubscribeRequests();
  }, [currentUser, isAdmin]);

  // Listen to User Article Grants from Firestore
  useEffect(() => {
    if (!currentUser) {
      setUserGrants(new Set());
      return;
    }

    const grantsCol = collection(db, 'userArticleGrants');
    const unsubscribeGrants = onSnapshot(
      grantsCol,
      (snapshot) => {
        const grantsSet = new Set<string>();
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as any;
          if (data.userId === currentUser.uid) {
            grantsSet.add(data.postId);
          }
        });
        setUserGrants(grantsSet);
      },
      (err) => {
        console.warn('Firestore userArticleGrants listener error:', err);
      }
    );

    return () => unsubscribeGrants();
  }, [currentUser]);

  const getArticleLevel = (postId: string) => {
    if (articleAccessLevels[postId]) {
      return articleAccessLevels[postId];
    }
    // Determinisitc fallback distribution so items have realistic clearance tiers initially
    const firstChar = postId.charCodeAt(0) || 0;
    const lastChar = postId.charCodeAt(postId.length - 1) || 0;
    const val = (firstChar + lastChar) % 4;
    if (val === 1) return 'Internal';
    if (val === 2) return 'Confidential';
    if (val === 3) return 'Restricted';
    return 'Public';
  };

  const handleUpdateArticleLevel = async (
    postId: string,
    level: 'Public' | 'Internal' | 'Confidential' | 'Restricted',
    slug?: string
  ) => {
    setArticleAccessLevels((prev) => ({
      ...prev,
      [postId]: level,
      ...(slug ? { [slug]: level } : {})
    }));

    setIsFirebaseSyncing(true);
    try {
      await setDoc(
        doc(db, 'blogAccessPolicies', postId),
        {
          postId,
          slug: slug || postId,
          requiredClearance: level,
          updatedBy: currentUser?.uid || 'anonymous-user',
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
    } catch (err) {
      console.error('Failed to sync blog policy with Firebase:', err);
      handleFirestoreError(err, OperationType.WRITE, `blogAccessPolicies/${postId}`);
    } finally {
      setIsFirebaseSyncing(false);
    }
  };

  const handleUpdateUserClearance = async (level: 'Public' | 'Internal' | 'Confidential' | 'Restricted') => {
    setUserClearance(level);
    if (currentUser) {
      try {
        await setDoc(
          doc(db, 'users', currentUser.uid),
          {
            clearanceLevel: level,
            updatedAt: new Date().toISOString()
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Could not update user clearance in Firestore:', err);
      }
    }
  };

  const isGated = (postId: string) => {
    if (isAdmin) return false;
    if (userGrants.has(postId)) return false;
    const required = getArticleLevel(postId);
    return CLEARANCE_VALUES[userClearance] < CLEARANCE_VALUES[required];
  };

  const handleOpenRequestModal = (post: { id: string; title: string; slug: string }) => {
    setRequestTargetPost(post);
    setRequestSuccessMessage(null);
    setIsRequestModalOpen(true);
  };

  const handleSubmitAccessRequest = async () => {
    const target = requestTargetPost || selectedPost;
    if (!target) return;

    if (!currentUser) {
      const user = await signInWithGoogle();
      if (!user) return;
    }

    const activeUser = currentUser || auth.currentUser;
    if (!activeUser) return;

    setRequestSubmitting(true);
    const requestId = `req_${activeUser.uid}_${target.id}`;
    const reqData: AccessRequestItem = {
      id: requestId,
      postId: target.id,
      postTitle: target.title,
      slug: target.slug,
      userId: activeUser.uid,
      userEmail: activeUser.email || 'analyst@enterprise.corp',
      userName: activeUser.displayName || 'Security Analyst',
      requestedClearance: getArticleLevel(target.id),
      reason: requestReason.trim() || 'Requesting authorization to review system design architecture.',
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'accessRequests', requestId), reqData);
      setRequestSuccessMessage('Access request routed to Administrator (munish.world@gmail.com). You will receive instantaneous access upon approval.');
      setTimeout(() => {
        setIsRequestModalOpen(false);
        setRequestSuccessMessage(null);
      }, 2500);
    } catch (err) {
      console.error('Error submitting access request:', err);
      handleFirestoreError(err, OperationType.WRITE, `accessRequests/${requestId}`);
    } finally {
      setRequestSubmitting(false);
    }
  };

  const handleApproveRequest = async (req: AccessRequestItem) => {
    setAdminActionLoading(req.id);
    try {
      // 1. Mark request as APPROVED
      await setDoc(
        doc(db, 'accessRequests', req.id),
        {
          status: 'APPROVED',
          reviewedBy: currentUser?.email || 'munish.world@gmail.com',
          reviewedAt: new Date().toISOString()
        },
        { merge: true }
      );

      // 2. Grant individual article access
      const grantId = `${req.userId}_${req.postId}`;
      await setDoc(doc(db, 'userArticleGrants', grantId), {
        grantId,
        userId: req.userId,
        postId: req.postId,
        grantedBy: currentUser?.email || 'munish.world@gmail.com',
        grantedAt: new Date().toISOString()
      });

      // 3. Elevate user profile clearance if needed
      const userRef = doc(db, 'users', req.userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const currentClearance = userSnap.data().clearanceLevel || 'Public';
        if (CLEARANCE_VALUES[currentClearance as keyof typeof CLEARANCE_VALUES] < CLEARANCE_VALUES[req.requestedClearance]) {
          await setDoc(
            userRef,
            {
              clearanceLevel: req.requestedClearance,
              updatedAt: new Date().toISOString()
            },
            { merge: true }
          );
        }
      }
    } catch (err) {
      console.error('Error approving request:', err);
      handleFirestoreError(err, OperationType.WRITE, `accessRequests/${req.id}`);
    } finally {
      setAdminActionLoading(null);
    }
  };

  const handleRejectRequest = async (req: AccessRequestItem) => {
    setAdminActionLoading(req.id);
    try {
      await setDoc(
        doc(db, 'accessRequests', req.id),
        {
          status: 'REJECTED',
          reviewedBy: currentUser?.email || 'munish.world@gmail.com',
          reviewedAt: new Date().toISOString()
        },
        { merge: true }
      );
    } catch (err) {
      console.error('Error rejecting request:', err);
      handleFirestoreError(err, OperationType.WRITE, `accessRequests/${req.id}`);
    } finally {
      setAdminActionLoading(null);
    }
  };

  const pendingRequestsCount = accessRequests.filter((r) => r.status === 'PENDING').length;

  // Initialize with embedded blog index so all 109 articles are instantly available in all environments
  const [posts, setPosts] = useState<PostSummary[]>(EMBEDDED_BLOG_POSTS as PostSummary[]);
  const [selectedPost, setSelectedPost] = useState<FullPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'index_table'>('cards');
  const [showIndexSidebar, setShowIndexSidebar] = useState<boolean>(true);
  const [indexTab, setIndexTab] = useState<'categories' | 'az' | 'years' | 'master_list'>('categories');
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');

  const catalogScrollRef = useRef<HTMLDivElement>(null);
  const articleScrollRef = useRef<HTMLDivElement>(null);

  // Background sync check for server API if running in fullstack mode
  useEffect(() => {
    fetch('/api/blog/posts')
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => {
        if (data?.posts && Array.isArray(data.posts) && data.posts.length > 0) {
          setPosts(data.posts);
        }
      })
      .catch(() => {
        // Embedded 109 articles are already active and functional
      });
  }, []);

  // Handle post selection and smooth scroll to top
  const handlePostClick = async (slug: string) => {
    setLoadingPost(true);

    // 1. Check in-memory dataset cache
    if (fullDatasetCache) {
      const cached = fullDatasetCache.find(p => p.slug === slug);
      if (cached) {
        setSelectedPost(cached);
        setLoadingPost(false);
        setReadingProgress(0);
        if (articleScrollRef.current) {
          articleScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
        }
        return;
      }
    }

    // 2. Try server API endpoint
    try {
      const apiRes = await fetch(`/api/blog/posts/${slug}`);
      if (apiRes.ok) {
        const postData = await apiRes.json();
        if (postData && postData.title) {
          setSelectedPost(postData);
          setLoadingPost(false);
          setReadingProgress(0);
          if (articleScrollRef.current) {
            articleScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
          }
          return;
        }
      }
    } catch {
      // Backend not present, continue to static dataset loader
    }

    // 3. Try loading from static JSON dataset across multiple path strategies
    try {
      const allPosts = await fetchFullDataset();
      const matched = allPosts.find(p => p.slug === slug);
      if (matched) {
        setSelectedPost(matched);
        setLoadingPost(false);
        setReadingProgress(0);
        if (articleScrollRef.current) {
          articleScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
        }
        return;
      }
    } catch (e) {
      console.warn('Failed to load static full post:', e);
    }

    // 4. Guaranteed Fallback: Render post from embedded summary
    const summaryPost = posts.find(p => p.slug === slug) || (EMBEDDED_BLOG_POSTS as PostSummary[]).find(p => p.slug === slug);
    if (summaryPost) {
      const fallbackPost: FullPost = {
        ...summaryPost,
        contentHtml: `
          <div class="prose max-w-none text-slate-800 dark:text-slate-100">
            <div class="p-6 my-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl">
              <h2 class="text-base font-bold text-emerald-950 dark:text-emerald-300 mb-2">Executive Overview & Key Takeaways</h2>
              <p class="text-sm text-emerald-900/90 dark:text-emerald-200/90 leading-relaxed font-normal">${summaryPost.excerpt}</p>
            </div>
            
            <div class="my-8 p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-2">Canonical Publication & Reference</h3>
              <p class="text-xs text-slate-600 dark:text-slate-400 mb-4">
                This comprehensive architectural system design analysis is published under the System Design engineering archive.
              </p>
              <a 
                href="${summaryPost.originalUrl}" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                <span>Read Full Article on System Design Blog</span>
                <span class="text-base">↗</span>
              </a>
            </div>
          </div>
        `
      };
      setSelectedPost(fallbackPost);
    }

    setLoadingPost(false);
    setReadingProgress(0);
    if (articleScrollRef.current) {
      articleScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  // Scroll to top helper
  const scrollToTop = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Helper function to decode HTML entities and standard clean-up for the mermaid code
  const decodeHtmlEntities = (str: string): string => {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#8211;/g, '--')
      .replace(/&#8212;/g, '--')
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"')
      .replace(/&#8216;/g, "'")
      .replace(/&#8217;/g, "'")
      .replace(/[\u2013\u2014]/g, '--')
      .replace(/[\u201c\u201d]/g, '"')
      .replace(/[\u2018\u2019]/g, "'");
  };

  const getMermaidImageUrl = (code: string, isDark: boolean): string => {
    const sanitized = decodeHtmlEntities(code).trim();
    const obj = {
      code: sanitized,
      mermaid: {
        theme: 'base',
        themeVariables: {
          fontSize: '12px', // Compact font size for dense diagrams
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          background: isDark ? '#1e293b' : '#ffffff',
          primaryColor: isDark ? '#334155' : '#ffffff',
          primaryTextColor: isDark ? '#f8fafc' : '#0f172a',
          primaryBorderColor: isDark ? '#475569' : '#cbd5e1',
          lineColor: isDark ? '#f8fafc' : '#0f172a', // Higher contrast lines
          arrowheadColor: isDark ? '#f8fafc' : '#0f172a', // High contrast arrows
          secondaryColor: isDark ? '#1e293b' : '#f1f5f9',
          tertiaryColor: isDark ? '#0f172a' : '#ffffff',
          nodeBorder: isDark ? '#475569' : '#cbd5e1'
        },
        flowchart: {
          htmlLabels: true,
          useMaxWidth: false,
          curve: 'linear', // Linear lines are clearer for HLD architectural flows
          nodeSpacing: 50,
          rankSpacing: 50
        }
      }
    };
    const jsonStr = JSON.stringify(obj);
    
    // UTF-8 safe base64 encoding
    let base64 = '';
    try {
      const utf8Bytes = new TextEncoder().encode(jsonStr);
      let binary = '';
      const len = utf8Bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(utf8Bytes[i]);
      }
      base64 = window.btoa(binary);
    } catch (e) {
      base64 = window.btoa(unescape(encodeURIComponent(jsonStr)));
    }
    
    // Using high-fidelity /svg/ endpoint instead of raster /img/
    return `https://mermaid.ink/svg/${base64}`;
  };

  // Parse headings, inject anchor IDs, and dynamically replace Mermaid flowcharts with static high-quality images
  const { processedHtml, headings } = useMemo(() => {
    if (!selectedPost?.contentHtml) {
      return { processedHtml: '', headings: [] as HeadingItem[] };
    }

    const headingList: HeadingItem[] = [];
    let count = 0;

    // 1. Inject IDs into headers for Table of Contents
    let modifiedHtml = selectedPost.contentHtml.replace(
      /<(h[2-4])([^>]*)>(.*?)<\/\1>/gi,
      (match, tag, attrs, innerText) => {
        const cleanText = innerText.replace(/<[^>]*>/g, '').trim();
        const id = `toc-section-${count++}`;
        headingList.push({
          id,
          text: cleanText,
          level: tag.toLowerCase()
        });
        return `<${tag} id="${id}" ${attrs}>${innerText}</${tag}>`;
      }
    );

    // 2. Replace all <div class="mermaid">...</div> blocks with static Mermaid.ink images with interactive zoom toolbars
    const isDark = theme === 'dark';
    modifiedHtml = modifiedHtml.replace(
      /<div class="mermaid">([\s\S]*?)<\/div>/gi,
      (match, content) => {
        const imageUrl = getMermaidImageUrl(content, isDark);
        return `
          <div class="mermaid-image-wrapper my-8 flex flex-col p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <!-- Inline Custom Interactive Toolbar -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 gap-2">
              <div class="flex items-center gap-2">
                <span class="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                <span class="text-xs font-semibold text-slate-600 dark:text-slate-300 tracking-wide uppercase">System Architecture Flowchart</span>
              </div>
              
              <div class="flex items-center gap-1.5 self-end sm:self-auto">
                <button 
                  onclick="const img = this.closest('.mermaid-image-wrapper').querySelector('.mermaid-img'); let scale = parseFloat(img.getAttribute('data-zoom') || '1'); scale = Math.max(0.6, scale - 0.2); img.setAttribute('data-zoom', scale); img.style.transform = 'scale(' + scale + ')'; img.style.minWidth = (scale * 100) + '%';" 
                  class="px-2 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded transition-all text-[11px] font-medium flex items-center gap-1"
                  title="Zoom Out"
                >
                  ➖ Zoom -
                </button>
                <button 
                  onclick="const img = this.closest('.mermaid-image-wrapper').querySelector('.mermaid-img'); let scale = parseFloat(img.getAttribute('data-zoom') || '1'); scale = Math.min(3.0, scale + 0.2); img.setAttribute('data-zoom', scale); img.style.transform = 'scale(' + scale + ')'; img.style.minWidth = (scale * 100) + '%';" 
                  class="px-2 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded transition-all text-[11px] font-medium flex items-center gap-1"
                  title="Zoom In"
                >
                  ➕ Zoom +
                </button>
                <button 
                  onclick="const img = this.closest('.mermaid-image-wrapper').querySelector('.mermaid-img'); img.setAttribute('data-zoom', '1'); img.style.transform = 'none'; img.style.minWidth = '100%';" 
                  class="px-2 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded transition-all text-[11px] font-medium"
                  title="Reset Scale"
                >
                  🔄 Reset
                </button>
                <a 
                  href="${imageUrl}" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 rounded transition-all text-[11px] font-medium flex items-center gap-1"
                >
                  🔍 High-Res ↗
                </a>
              </div>
            </div>

            <!-- Viewport with dynamic scrolling and infinite crisp SVG sizing -->
            <div class="w-full overflow-auto p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 rounded-lg flex justify-start items-center" style="max-height: 520px; min-height: 240px;">
              <img 
                src="${imageUrl}" 
                alt="System Architecture Diagram" 
                class="mermaid-img mx-auto transition-all duration-200 ease-out origin-center select-none" 
                style="max-width: none; width: auto; min-width: 100%; max-height: 100%; transform: none;"
                data-zoom="1"
                referrerpolicy="no-referrer"
                loading="lazy"
              />
            </div>
          </div>
        `;
      }
    );

    return { processedHtml: modifiedHtml, headings: headingList };
  }, [selectedPost?.contentHtml, theme]);

  // Handle scroll tracking in article view
  const handleArticleScroll = () => {
    if (!articleScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = articleScrollRef.current;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll > 0) {
      setReadingProgress(Math.min(100, Math.max(0, Math.round((scrollTop / maxScroll) * 100))));
    }
    setShowBackToTop(scrollTop > 280);

    // Active heading detection
    if (headings.length > 0) {
      for (let i = headings.length - 1; i >= 0; i--) {
        const el = document.getElementById(headings[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160) {
            setActiveHeadingId(headings[i].id);
            break;
          }
        }
      }
    }
  };

  // Handle scroll tracking in catalog view
  const handleCatalogScroll = () => {
    if (!catalogScrollRef.current) return;
    setShowBackToTop(catalogScrollRef.current.scrollTop > 300);
  };

  // Jump to specific heading
  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveHeadingId(id);
    }
  };

  // Categories with counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach(p => {
      if (Array.isArray(p.categories)) {
        p.categories.forEach(c => {
          counts[c] = (counts[c] || 0) + 1;
        });
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [posts]);

  // Years with counts
  const yearCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach(p => {
      const y = p.year || (p.date ? p.date.slice(0, 4) : 'Other');
      counts[y] = (counts[y] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[0].localeCompare(a[0]));
  }, [posts]);

  // Alphabet jump letters available
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    posts.forEach(p => {
      const firstChar = p.title.trim().charAt(0).toUpperCase();
      if (firstChar >= 'A' && firstChar <= 'Z') {
        letters.add(firstChar);
      }
    });
    return Array.from(letters).sort();
  }, [posts]);

  // Filtered posts list
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(q);
        const matchesExcerpt = post.excerpt.toLowerCase().includes(q);
        const matchesCategory = post.categories.some(c => c.toLowerCase().includes(q));
        if (!matchesTitle && !matchesExcerpt && !matchesCategory) return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && !post.categories.includes(selectedCategory)) {
        return false;
      }

      // Year filter
      const postYear = post.year || (post.date ? post.date.slice(0, 4) : '');
      if (selectedYear !== 'ALL' && postYear !== selectedYear) {
        return false;
      }

      // A-Z letter filter
      if (selectedLetter !== 'ALL') {
        const firstChar = post.title.trim().charAt(0).toUpperCase();
        if (firstChar !== selectedLetter) return false;
      }

      return true;
    });
  }, [posts, searchTerm, selectedCategory, selectedYear, selectedLetter]);

  // Sequential Next and Previous posts in the current index
  const { prevPost, nextPost, currentIndex } = useMemo(() => {
    if (!selectedPost) return { prevPost: null, nextPost: null, currentIndex: -1 };
    const idx = filteredPosts.findIndex(p => p.slug === selectedPost.slug);
    return {
      prevPost: idx > 0 ? filteredPosts[idx - 1] : null,
      nextPost: idx >= 0 && idx < filteredPosts.length - 1 ? filteredPosts[idx + 1] : null,
      currentIndex: idx
    };
  }, [selectedPost, filteredPosts]);

  // Copy share link
  const handleCopyLink = (url?: string) => {
    const textToCopy = url || window.location.href;
    navigator.clipboard.writeText(textToCopy);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedYear('ALL');
    setSelectedLetter('ALL');
  };

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    selectedCategory !== 'ALL' ||
    selectedYear !== 'ALL' ||
    selectedLetter !== 'ALL';

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white text-slate-700">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-semibold text-slate-800">Loading Security & System Design Archive...</p>
        <p className="text-xs text-slate-400">Indexing 109 architectural and engineering deep dives</p>
      </div>
    );
  }

  // =========================================================================
  // VIEW: ARTICLE READER VIEW (Scrollable + In-Article Table of Contents Index)
  // =========================================================================
  if (selectedPost) {
    return (
      <div className="w-full h-full flex flex-col overflow-hidden bg-slate-50 text-slate-900">
        {/* Top Reading Progress Bar */}
        <div className="w-full bg-slate-200 h-1 relative overflow-hidden z-20 shrink-0">
          <div
            className="h-full bg-emerald-600 transition-all duration-150 ease-out"
            style={{ width: `${readingProgress}%` }}
          />
        </div>

        {/* Top Header Controls Bar */}
        <header className="h-14 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shrink-0 shadow-2xs z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSelectedPost(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Index</span>
            </button>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 truncate">
              <span className="font-semibold text-emerald-700">Article Index</span>
              <span>/</span>
              <span className="truncate max-w-[280px] md:max-w-md font-medium text-slate-800">
                {selectedPost.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Reading progress badge */}
            <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{readingProgress}% read</span>
            </div>

            {/* Previous Article in Index */}
            {prevPost && (
              <button
                onClick={() => handlePostClick(prevPost.slug)}
                title={`Previous: ${prevPost.title}`}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Next Article in Index */}
            {nextPost && (
              <button
                onClick={() => handlePostClick(nextPost.slug)}
                title={`Next: ${nextPost.title}`}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Share / Copy Link */}
            <button
              onClick={() => handleCopyLink(selectedPost.originalUrl)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            >
              {copiedLink ? <AnimatedCheckmark size={14} className="text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied Link' : 'Copy Link'}</span>
            </button>

            {/* Original canonical */}
            {selectedPost.originalUrl && (
              <a
                href={selectedPost.originalUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                title="View original canonical post"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </header>

        {/* Reader Body: Two-Column Layout (Scrollable Content + Sticky Table of Contents) */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Main Article Scroll Container */}
          <main
            ref={articleScrollRef}
            onScroll={handleArticleScroll}
            className="flex-1 h-full overflow-y-auto px-4 sm:px-8 md:px-12 py-8 scroll-smooth"
          >
            {loadingPost ? (
              <ArticleLoadingSkeleton />
            ) : (
              <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-2xs">
              {/* Category badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {selectedPost.categories.map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    <Tag className="w-3 h-3" />
                    {c}
                  </span>
                ))}
                {selectedPost.isSystemDesign && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                    <Sparkles className="w-3 h-3" />
                    Architecture Design
                  </span>
                )}
                
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  getArticleLevel(selectedPost.id) === 'Public' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                  getArticleLevel(selectedPost.id) === 'Internal' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                  getArticleLevel(selectedPost.id) === 'Confidential' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                  'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  <Lock className="w-3 h-3" />
                  <span>Access Control:</span>
                  <select
                    value={getArticleLevel(selectedPost.id)}
                    onChange={(e) => handleUpdateArticleLevel(selectedPost.id, e.target.value as any)}
                    className="bg-transparent border-none p-0 focus:ring-0 font-extrabold cursor-pointer text-[11px] underline ml-1"
                    title="Change required clearance level for this article"
                  >
                    <option value="Public">Public Access</option>
                    <option value="Internal">Access Required: Internal</option>
                    <option value="Confidential">Access Required: Confidential</option>
                    <option value="Restricted">Access Required: Restricted</option>
                  </select>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black tracking-tight leading-tight mb-4">
                {selectedPost.title}
              </h1>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pb-6 mb-8 border-b border-slate-200">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  {selectedPost.formattedDate || selectedPost.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  {selectedPost.readingTime || `${selectedPost.readingTimeMinutes || 5} min read`}
                </span>
                {selectedPost.wordCount > 0 && (
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-slate-400" />
                    {selectedPost.wordCount.toLocaleString()} words
                  </span>
                )}
                <span className="text-slate-400">Published by System Design</span>
              </div>

              {/* Mobile Table of Contents Dropdown/Pill */}
              {headings.length > 0 && (
                <div className="lg:hidden mb-8 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-2">
                    <ListTree className="w-4 h-4 text-emerald-600" />
                    <span>In-Article Index & Jump Links</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {headings.map(h => (
                      <button
                        key={h.id}
                        onClick={() => scrollToHeading(h.id)}
                        className="text-xs px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 transition-colors"
                      >
                        {h.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Article Content Render or Security Gate */}
              {isGated(selectedPost.id) ? (
                (() => {
                  const currentReq = accessRequests.find((r) => r.postId === selectedPost.id && r.userId === currentUser?.uid);
                  const isPending = currentReq?.status === 'PENDING';
                  const isRejected = currentReq?.status === 'REJECTED';

                  return (
                    <div className="my-8 p-8 border-2 border-dashed border-rose-200 bg-rose-50/40 rounded-2xl text-center flex flex-col items-center shadow-xs">
                      <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                        <ShieldAlert className="w-8 h-8 animate-pulse" />
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-black uppercase tracking-wider mb-2 border border-rose-200">
                        <Lock className="w-3.5 h-3.5" /> Firebase Zero-Trust Access Control
                      </div>
                      <h2 className="text-xl font-black text-rose-950 mb-2">Security Clearance Required</h2>
                      <p className="text-xs text-rose-900 max-w-md mx-auto mb-6 leading-relaxed">
                        This deep dive analysis is protected by Firebase Firestore Security Rules. Access is restricted to authenticated identities with <span className="font-extrabold text-rose-600 font-mono px-1.5 py-0.5 bg-white rounded border border-rose-200">{getArticleLevel(selectedPost.id).toUpperCase()}</span> clearance level or explicit approval from <span className="font-bold text-rose-950 underline">munish.world@gmail.com</span>.
                      </p>
                      
                      <div className="bg-white border border-rose-100 rounded-xl p-4 mb-6 text-xs shadow-xs max-w-md w-full space-y-2">
                        <div className="flex justify-between items-center text-slate-500">
                          <span>Firebase Identity:</span>
                          <span className="font-bold text-slate-800 font-mono flex items-center gap-1">
                            {currentUser ? (
                              <>
                                <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{currentUser.email}</span>
                              </>
                            ) : (
                              <span className="text-amber-600 font-bold">Unauthenticated Guest</span>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500">
                          <span>Assigned Clearance:</span>
                          <span className="font-bold text-slate-800 font-mono px-2 py-0.5 bg-slate-100 rounded">
                            {userClearance}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500">
                          <span>Required Blog Level:</span>
                          <span className="font-bold text-rose-600 font-mono px-2 py-0.5 bg-rose-50 border border-rose-200 rounded">
                            {getArticleLevel(selectedPost.id)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500">
                          <span>Approval Authority:</span>
                          <span className="font-bold text-slate-700 font-mono text-[11px]">
                            munish.world@gmail.com
                          </span>
                        </div>
                      </div>

                      {/* Pending or Rejected Status Notice */}
                      {isPending && (
                        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 max-w-md w-full text-left flex items-start gap-3 shadow-xs animate-pulse">
                          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold text-xs">Access Request Pending Administrator Approval</div>
                            <div className="text-[11px] text-amber-800 mt-0.5">
                              Your request submitted on {currentReq?.createdAt ? new Date(currentReq.createdAt).toLocaleDateString() : 'today'} is awaiting review by munish.world@gmail.com. You will receive immediate access once approved.
                            </div>
                          </div>
                        </div>
                      )}

                      {isRejected && (
                        <div className="mb-6 p-4 rounded-xl bg-rose-100/80 border border-rose-300 text-rose-900 max-w-md w-full text-left flex items-start gap-3 shadow-xs">
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold text-xs">Previous Access Request Declined</div>
                            <div className="text-[11px] text-rose-800 mt-0.5">
                              The administrator declined this request. You can re-submit with updated business justification.
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-center gap-3">
                        {!currentUser ? (
                          <button
                            onClick={() => signInWithGoogle()}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 hover:scale-102"
                          >
                            <LogIn className="w-4 h-4" />
                            <span>Sign In with Google (Firebase)</span>
                          </button>
                        ) : isAdmin ? (
                          <button
                            onClick={() => handleUpdateUserClearance(getArticleLevel(selectedPost.id))}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 hover:scale-102"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Admin Instant Authorization (Unlock)</span>
                          </button>
                        ) : isPending ? (
                          <button
                            onClick={() => setIsAdminInboxOpen(true)}
                            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                          >
                            <Clock className="w-4 h-4" />
                            <span>View Request Status</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenRequestModal(selectedPost)}
                            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 hover:scale-102"
                          >
                            <Send className="w-4 h-4" />
                            <span>Request Access from munish.world@gmail.com</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedPost(null)}
                          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-200"
                        >
                          Return to Index
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <article
                  key={selectedPost.slug}
                  className="blog-article-content"
                  dangerouslySetInnerHTML={{ __html: processedHtml }}
                />
              )}

              {/* Bottom Next / Previous Navigator */}
              <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevPost ? (
                  <button
                    onClick={() => handlePostClick(prevPost.slug)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500/60 bg-slate-50/60 hover:bg-emerald-50/30 text-left transition-all group cursor-pointer shadow-2xs"
                  >
                    <div className="text-[11px] font-bold text-slate-400 group-hover:text-emerald-700 flex items-center gap-1 mb-1">
                      <ChevronLeft className="w-3.5 h-3.5" /> Previous in Index
                    </div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-900 line-clamp-2">
                      {prevPost.title}
                    </div>
                  </button>
                ) : (
                  <div className="hidden sm:block" />
                )}

                {nextPost && (
                  <button
                    onClick={() => handlePostClick(nextPost.slug)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500/60 bg-slate-50/60 hover:bg-emerald-50/30 text-right transition-all group cursor-pointer shadow-2xs"
                  >
                    <div className="text-[11px] font-bold text-slate-400 group-hover:text-emerald-700 flex items-center justify-end gap-1 mb-1">
                      Next in Index <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-900 line-clamp-2">
                      {nextPost.title}
                    </div>
                  </button>
                )}
              </div>

              {/* Back to Index Button */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Return to Master Blog Index
                </button>
              </div>
            </div>
            )}
          </main>

          {/* Right Sticky Table of Contents (ToC) Index */}
          {headings.length > 0 && (
            <aside className="w-80 border-l border-slate-200 bg-white p-5 overflow-y-auto shrink-0 hidden lg:flex flex-col shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <ListTree className="w-4 h-4 text-emerald-600" />
                  <span>Table of Contents</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {headings.length} sections
                </span>
              </div>

              {/* Navigation links */}
              <div className="space-y-1 overflow-y-auto flex-1 pr-1">
                {headings.map(h => {
                  const isActive = activeHeadingId === h.id;
                  return (
                    <button
                      key={h.id}
                      onClick={() => scrollToHeading(h.id)}
                      className={`w-full text-left rounded-lg text-xs transition-all cursor-pointer block ${
                        h.level === 'h3' ? 'pl-5 text-[11px]' : h.level === 'h4' ? 'pl-8 text-[11px]' : 'pl-2.5 font-semibold'
                      } py-1.5 ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-900 font-bold border-l-2 border-emerald-600'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span className="line-clamp-2">{h.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Quick actions at bottom of ToC */}
              <div className="pt-4 mt-4 border-t border-slate-200 space-y-2">
                <button
                  onClick={() => scrollToTop(articleScrollRef)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Scroll to Top</span>
                </button>
              </div>
            </aside>
          )}

          {/* Floating Back to Top Button */}
          {showBackToTop && (
            <button
              onClick={() => scrollToTop(articleScrollRef)}
              title="Back to Top"
              className="fixed bottom-6 right-8 p-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all cursor-pointer z-30"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: CATALOG & INDEX LIST VIEW (Searchable, Filterable, Scrollable, Index Modes)
  // =========================================================================
  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-slate-50 text-slate-900">
      {/* Top Header & Search Bar */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3.5 shrink-0 shadow-2xs z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Title & Stats */}
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base sm:text-lg font-black text-black flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span>Security & System Design Blog</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {posts.length} Articles
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              In-depth technical archive covering distributed systems, cloud architecture, threat models, and AI engineering
            </p>
          </div>

          {/* Controls: Search, View Mode & Toggle Index */}
          <div className="flex items-center gap-2">
            {/* Live Search */}
            <div className="relative w-full sm:w-64 md:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles, topics, keywords..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View Mode Toggle: Cards vs Index Table */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('cards')}
                title="Cards Grid View"
                className={`p-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white text-emerald-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('index_table')}
                title="Master Index Table View"
                className={`p-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'index_table'
                    ? 'bg-white text-emerald-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dynamic Security Clearance & Firebase Identity */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Clearance:
              </span>
              <select
                value={userClearance}
                onChange={(e) => handleUpdateUserClearance(e.target.value as any)}
                className="bg-transparent text-xs font-black text-slate-800 focus:outline-hidden cursor-pointer p-0 border-none select-none font-sans"
                title="Change your assigned security clearance in Firebase"
              >
                <option value="Public">Public (Lv 0)</option>
                <option value="Internal">Internal (Lv 1)</option>
                <option value="Confidential">Confidential (Lv 2)</option>
                <option value="Restricted">Restricted (Lv 3)</option>
              </select>
            </div>

            {/* Firebase User Auth Pill / Google Sign In */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-lg shadow-2xs">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden lg:flex flex-col text-left leading-none">
                  <span className="text-[10px] font-bold text-emerald-950 truncate max-w-[120px]">
                    {currentUser.email}
                  </span>
                  <span className="text-[8px] text-emerald-700 font-mono font-bold uppercase">
                    {userRole}
                  </span>
                </div>
                <button
                  onClick={() => logoutFirebase()}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Sign out of Firebase"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signInWithGoogle()}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs cursor-pointer"
                title="Sign in with Google to authenticate via Firebase"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Firebase Sign In</span>
              </button>
            )}

            {/* Firebase Sync Indicator */}
            {isFirebaseSyncing && (
              <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                <span>Firestore Syncing...</span>
              </div>
            )}

            {/* Approvals Inbox button (for Admin munish.world@gmail.com and Requesters) */}
            <button
              onClick={() => setIsAdminInboxOpen(true)}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                pendingRequestsCount > 0
                  ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 animate-pulse'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title="Access Requests & Approvals Governance Center"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{isAdmin ? 'Approvals Inbox' : 'Access Status'}</span>
              {pendingRequestsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[10px] font-black ml-0.5">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            {/* Toggle Index Sidebar */}
            <button
              onClick={() => setShowIndexSidebar(!showIndexSidebar)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                showIndexSidebar
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Index Panel</span>
            </button>
          </div>
        </div>

        {/* Quick Category Filter Bar */}
        <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Topic:
          </span>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Articles ({posts.length})
          </button>
          {categoryCounts.slice(0, 10).map(([cat, count]) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? 'ALL' : cat)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-colors border ${
                selectedCategory === cat
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-400 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat} ({count})
            </button>
          ))}
        </div>
      </header>

      {/* Main Workspace: Left Index Sidebar + Scrollable Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Index Sidebar */}
        {showIndexSidebar && (
          <aside className="w-72 md:w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-hidden shadow-2xs z-10">
            {/* Index Tabs Header */}
            <div className="p-3 border-b border-slate-200 bg-slate-50">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
                  Master Archive Index
                </span>
                <span className="font-mono text-emerald-700">{filteredPosts.length} matches</span>
              </div>

              <div className="grid grid-cols-4 gap-1 p-1 bg-white rounded-lg border border-slate-200 text-center">
                <button
                  onClick={() => setIndexTab('categories')}
                  className={`py-1 text-[11px] font-bold rounded cursor-pointer transition-all border-b-2 ${
                    indexTab === 'categories'
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-600 font-extrabold shadow-2xs'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Topics
                </button>
                <button
                  onClick={() => setIndexTab('az')}
                  className={`py-1 text-[11px] font-bold rounded cursor-pointer transition-all border-b-2 ${
                    indexTab === 'az'
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-600 font-extrabold shadow-2xs'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  A-Z
                </button>
                <button
                  onClick={() => setIndexTab('years')}
                  className={`py-1 text-[11px] font-bold rounded cursor-pointer transition-all border-b-2 ${
                    indexTab === 'years'
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-600 font-extrabold shadow-2xs'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setIndexTab('master_list')}
                  className={`py-1 text-[11px] font-bold rounded cursor-pointer transition-all border-b-2 ${
                    indexTab === 'master_list'
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-600 font-extrabold shadow-2xs'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  109 Index
                </button>
              </div>
            </div>

            {/* Index Tab Body (Scrollable Container) */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* TAB 1: CATEGORIES & TOPICS INDEX */}
              {indexTab === 'categories' && (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                    Browse by Category
                  </div>
                  {categoryCounts.map(([cat, count]) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(isSelected ? 'ALL' : cat)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <Folder className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{cat}</span>
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: A-Z ALPHABETICAL INDEX */}
              {indexTab === 'az' && (
                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                    Alphabetical Jump
                  </div>
                  {/* Letter Jump Grid */}
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => setSelectedLetter('ALL')}
                      className={`px-2 py-1 text-[11px] font-bold rounded border cursor-pointer ${
                        selectedLetter === 'ALL'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ALL
                    </button>
                    {availableLetters.map(letter => (
                      <button
                        key={letter}
                        onClick={() => setSelectedLetter(selectedLetter === letter ? 'ALL' : letter)}
                        className={`w-6 h-6 flex items-center justify-center text-[11px] font-bold rounded border cursor-pointer ${
                          selectedLetter === letter
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
                        }`}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>

                  {/* Matching posts under current letter */}
                  <div className="mt-4 pt-3 border-t border-slate-200 space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                      {selectedLetter === 'ALL' ? 'All Titles A-Z' : `Articles starting with "${selectedLetter}"`}
                    </div>
                    {filteredPosts.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handlePostClick(p.slug)}
                        className="w-full text-left p-2 rounded-lg hover:bg-emerald-50/60 transition-colors group cursor-pointer border border-transparent hover:border-emerald-200"
                      >
                        <div className="text-xs font-semibold text-slate-800 group-hover:text-emerald-900 line-clamp-2">
                          {p.title}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{p.year || p.date.slice(0, 4)}</span>
                          <span>•</span>
                          <span>{p.readingTime}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: CHRONOLOGICAL / YEAR INDEX */}
              {indexTab === 'years' && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
                    Timeline Archive
                  </div>
                  {yearCounts.map(([yr, count]) => {
                    const isSelected = selectedYear === yr;
                    return (
                      <button
                        key={yr}
                        onClick={() => setSelectedYear(isSelected ? 'ALL' : yr)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <span className="flex items-center gap-2 font-mono font-bold">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Year {yr}</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {count} articles
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* TAB 4: COMPLETE 109 MASTER INDEX LIST */}
              {indexTab === 'master_list' && (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1">
                    Complete Master Index (#1 - #109)
                  </div>
                  {posts.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => handlePostClick(p.slug)}
                      className="w-full text-left p-2 rounded-lg hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] font-mono font-bold text-emerald-700 mt-0.5">
                          #{String(idx + 1).padStart(3, '0')}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-800 group-hover:text-emerald-900 line-clamp-2 leading-tight">
                            {p.title}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {p.formattedDate || p.date} • {p.readingTime}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Filters Footer */}
            {hasActiveFilters && (
              <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Active filters applied</span>
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            )}
          </aside>
        )}

        {/* Main Content Area (Scrollable Catalog & Master Table) */}
        <main
          ref={catalogScrollRef}
          onScroll={handleCatalogScroll}
          className="flex-1 h-full overflow-y-auto px-4 sm:px-6 md:px-8 py-6 scroll-smooth"
        >
          {/* Active Filter Chips */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                <span>Showing:</span>
              </span>
              <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                <AnimatedCounter value={filteredPosts.length} /> of <AnimatedCounter value={posts.length} /> articles
              </span>

              {selectedCategory !== 'ALL' && (
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Topic: {selectedCategory}
                  <button onClick={() => setSelectedCategory('ALL')} className="hover:text-emerald-950 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedYear !== 'ALL' && (
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full">
                  Year: {selectedYear}
                  <button onClick={() => setSelectedYear('ALL')} className="hover:text-blue-950 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedLetter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-full">
                  Initial: {selectedLetter}
                  <button onClick={() => setSelectedLetter('ALL')} className="hover:text-indigo-950 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {searchTerm && (
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                  Search: "{searchTerm}"
                  <button onClick={() => setSearchTerm('')} className="hover:text-amber-950 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer underline underline-offset-2"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Empty state */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-black">No articles matched your criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Try adjusting your search terms or clear selected category/year filters to browse all 109 architectural publications.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          )}

          {/* ================================================================= */}
          {/* MODE 1: CARDS GRID VIEW                                           */}
          {/* ================================================================= */}
          {viewMode === 'cards' && filteredPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPosts.map((post, idx) => (
                <SpotlightCard
                  key={post.id}
                  className={`bg-white border border-slate-200 hover:border-emerald-400 rounded-xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group animate-fade-in-up stagger-${(idx % 8) + 1}`}
                >
                  <div>
                    {/* Top metadata & index tag */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        INDEX #{String(posts.findIndex(p => p.id === post.id) + 1).padStart(3, '0')}
                      </span>
                      <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {post.year || post.date.slice(0, 4)}
                      </span>
                    </div>

                    {/* Inline Granular Access Control Selector Badge */}
                    <div className="flex items-center mb-3" onClick={e => e.stopPropagation()}>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 cursor-pointer transition-colors ${
                        isGated(post.id) ? 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}>
                        {isGated(post.id) ? <Lock className="w-3 h-3 text-red-500" /> : <Check className="w-3 h-3 text-emerald-500" />}
                        <select
                          value={getArticleLevel(post.id)}
                          onChange={(e) => handleUpdateArticleLevel(post.id, e.target.value as any)}
                          className="bg-transparent border-none p-0 focus:ring-0 text-[10px] font-black cursor-pointer leading-tight"
                        >
                          <option value="Public">Public Access</option>
                          <option value="Internal">Access Required: Internal</option>
                          <option value="Confidential">Access Required: Confidential</option>
                          <option value="Restricted">Access Required: Restricted</option>
                        </select>
                      </span>
                    </div>

                    {/* Title */}
                    <h2
                      onClick={() => handlePostClick(post.slug)}
                      className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors cursor-pointer line-clamp-2 leading-snug mb-2.5"
                    >
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                      {post.excerpt}
                    </p>
                  </div>

                  <div>
                    {/* Category Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {post.categories.slice(0, 3).map((c, ci) => (
                        <button
                          key={ci}
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedCategory(c);
                          }}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 transition-colors"
                        >
                          #{c}
                        </button>
                      ))}
                      {post.categories.length > 3 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{post.categories.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {post.readingTime}
                      </span>

                      <button
                        onClick={() => handlePostClick(post.slug)}
                        className="font-bold text-emerald-700 group-hover:text-emerald-900 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        Read Article <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          )}

          {/* ================================================================= */}
          {/* MODE 2: MASTER INDEX TABLE VIEW                                  */}
          {/* ================================================================= */}
          {viewMode === 'index_table' && filteredPosts.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 w-20">Index #</th>
                      <th className="py-3 px-4">Article Title</th>
                      <th className="py-3 px-4 hidden md:table-cell">Categories</th>
                      <th className="py-3 px-4 hidden sm:table-cell">Date</th>
                      <th className="py-3 px-4">Est. Read</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPosts.map((post, idx) => {
                      const absoluteIndex = posts.findIndex(p => p.id === post.id) + 1;
                      return (
                        <tr
                          key={post.id}
                          className="hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                          onClick={() => handlePostClick(post.slug)}
                        >
                          <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                            #{String(absoluteIndex).padStart(3, '0')}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            <div className="line-clamp-1">{post.title}</div>
                            {/* Granular Access Control Selector Badge */}
                            <div className="mt-1 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border flex items-center gap-0.5 cursor-pointer transition-colors ${
                                isGated(post.id) ? 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}>
                                {isGated(post.id) ? <Lock className="w-2.5 h-2.5 text-red-500" /> : <Check className="w-2.5 h-2.5 text-emerald-500" />}
                                <select
                                  value={getArticleLevel(post.id)}
                                  onChange={(e) => handleUpdateArticleLevel(post.id, e.target.value as any)}
                                  className="bg-transparent border-none p-0 focus:ring-0 text-[9px] font-black cursor-pointer leading-none"
                                >
                                  <option value="Public">Public Access</option>
                                  <option value="Internal">Access Required: Internal</option>
                                  <option value="Confidential">Access Required: Confidential</option>
                                  <option value="Restricted">Access Required: Restricted</option>
                                </select>
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 hidden md:table-cell">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {post.categories.slice(0, 2).map((c, ci) => (
                                <span
                                  key={ci}
                                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700"
                                >
                                  {c}
                                </span>
                              ))}
                              {post.categories.length > 2 && (
                                <span className="text-[10px] text-slate-400">
                                  +{post.categories.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 hidden sm:table-cell text-slate-500 font-mono">
                            {post.formattedDate || post.date}
                          </td>
                          <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                            {post.readingTime}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handlePostClick(post.slug);
                              }}
                              className="px-3 py-1 rounded bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-700 font-bold transition-all cursor-pointer"
                            >
                              Read
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Floating Back to Top Button */}
          {showBackToTop && (
            <button
              onClick={() => scrollToTop(catalogScrollRef)}
              title="Back to Top"
              className="fixed bottom-6 right-8 p-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all cursor-pointer z-30"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          )}
        </main>
      </div>

      {/* ================================================================= */}
      {/* MODAL 1: REQUEST ARTICLE ACCESS MODAL                             */}
      {/* ================================================================= */}
      {isRequestModalOpen && (requestTargetPost || selectedPost) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Request Classified Access</h3>
                  <p className="text-[11px] text-slate-500">Security Clearance Approval Process</p>
                </div>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Article Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-4 text-xs space-y-1.5">
              <div className="font-bold text-slate-900 line-clamp-1">
                {(requestTargetPost || selectedPost)?.title}
              </div>
              <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200/60">
                <span>Required Clearance:</span>
                <span className="font-bold text-rose-600 font-mono px-1.5 py-0.5 bg-rose-50 rounded border border-rose-200 text-[10px]">
                  {getArticleLevel((requestTargetPost || selectedPost)!.id)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Approval Authority:</span>
                <span className="font-bold text-slate-800 font-mono text-[10px]">
                  munish.world@gmail.com
                </span>
              </div>
            </div>

            {/* Business Justification */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Business Justification & Operational Purpose <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                placeholder="Explain why your role requires access to this system design and threat model..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden text-slate-800"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Your request will be recorded immutably in Cloud Firestore and submitted for review.
              </p>
            </div>

            {/* Success feedback */}
            {requestSuccessMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{requestSuccessMessage}</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={requestSubmitting}
                onClick={handleSubmitAccessRequest}
                className="px-5 py-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {requestSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send for Approval</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 2: ACCESS APPROVALS & GOVERNANCE CENTER                     */}
      {/* ================================================================= */}
      {isAdminInboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-150 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>{isAdmin ? 'Access Approvals & Governance Inbox' : 'My Access Requests Tracker'}</span>
                    {isAdmin && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Admin: munish.world@gmail.com
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time Firestore authorization queue and clearance grants
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAdminInboxOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 shrink-0 overflow-x-auto">
              <button
                onClick={() => setInboxFilter('PENDING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  inboxFilter === 'PENDING'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Pending Review ({accessRequests.filter(r => r.status === 'PENDING').length})</span>
              </button>

              <button
                onClick={() => setInboxFilter('APPROVED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  inboxFilter === 'APPROVED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approved Grants ({accessRequests.filter(r => r.status === 'APPROVED').length})</span>
              </button>

              <button
                onClick={() => setInboxFilter('REJECTED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  inboxFilter === 'REJECTED'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Declined ({accessRequests.filter(r => r.status === 'REJECTED').length})</span>
              </button>

              <button
                onClick={() => setInboxFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  inboxFilter === 'ALL'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All History ({accessRequests.length})
              </button>
            </div>

            {/* Request List Content */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {accessRequests
                .filter(r => inboxFilter === 'ALL' || r.status === inboxFilter)
                .map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                          req.status === 'PENDING' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                          req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                          'bg-rose-50 text-rose-800 border-rose-300'
                        }`}>
                          {req.status === 'APPROVED' && <AnimatedCheckmark size={12} className="text-emerald-700" />}
                          <span>{req.status}</span>
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {req.postTitle}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          (Req. Clearance: {req.requestedClearance})
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        "{req.reason}"
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 font-mono">
                          <UserIcon className="w-3 h-3 text-slate-500" />
                          {req.userEmail} ({req.userName})
                        </span>
                        <span>•</span>
                        <span>{req.createdAt ? new Date(req.createdAt).toLocaleString() : 'Recent'}</span>
                        {req.reviewedBy && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 font-bold">
                              Decision by: {req.reviewedBy}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && req.status === 'PENDING' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          disabled={adminActionLoading === req.id}
                          onClick={() => handleApproveRequest(req)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {adminActionLoading === req.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>Approve Access</span>
                        </button>

                        <button
                          disabled={adminActionLoading === req.id}
                          onClick={() => handleRejectRequest(req)}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}

              {accessRequests.filter(r => inboxFilter === 'ALL' || r.status === inboxFilter).length === 0 && (
                <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-semibold">No {inboxFilter.toLowerCase()} access requests found.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span>All access grants and approvals synchronize live in Cloud Firestore.</span>
              <button
                onClick={() => setIsAdminInboxOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

