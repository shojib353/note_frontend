/**
 * AegisNotes Frontend Application Logic
 * Integrates with the Secure Note-Taking API:
 * - Auth (/api/auth)
 * - Notes (/api/notes)
 * - Users (/api/users)
 * - Posts (/api/posts)
 * - Aggregations (/api/aggregations)
 * - Health & Swagger (/api/health, /api/docs)
 */

(() => {
  'use strict';

  // =========================================================================
  // APPLICATION STATE
  // =========================================================================
  const state = {
    apiUrl: localStorage.getItem('aegis_api_url') || 'https://note-backend-db31.onrender.com',
    token: localStorage.getItem('aegis_token') || null,
    user: null,
    activeTab: 'notesTab',
    healthStatus: 'checking',

    // Notes state
    notes: {
      items: [],
      page: 1,
      limit: 6,
      totalCount: 0,
      totalPages: 1,
      search: '',
      authorFilter: '',
    },

    // Posts state
    posts: {
      items: [],
      page: 1,
      limit: 6,
      totalCount: 0,
      totalPages: 1,
      userFilterId: null,
      userFilterName: null,
    },

    // Users state (Admin)
    users: {
      items: [],
      page: 1,
      limit: 10,
      totalCount: 0,
      totalPages: 1,
    },

    // Aggregations state
    aggregations: {
      activeScenario: 'scenario1',
      scenario1Data: [],
      scenario2User: null,
      scenario2Data: null,
    },
  };

  // Demo Credentials for Instant Login
  const DEMO_USERS = {
    admin: { email: 'admin@example.com', password: 'password123', label: 'Admin' },
    alice: { email: 'alice@example.com', password: 'password123', label: 'Alice' },
    bob: { email: 'bob@example.com', password: 'password123', label: 'Bob' },
    charlie: { email: 'charlie@example.com', password: 'password123', label: 'Charlie' },
  };

  // =========================================================================
  // DOM ELEMENT REFERENCES
  // =========================================================================
  const els = {
    // Header & Health
    apiHealthBadge: document.getElementById('apiHealthBadge'),
    healthStatusText: document.getElementById('healthStatusText'),
    healthLatency: document.getElementById('healthLatency'),
    swaggerDocsLink: document.getElementById('swaggerDocsLink'),
    userProfileHeader: document.getElementById('userProfileHeader'),
    apiBaseUrlInput: document.getElementById('apiBaseUrlInput'),
    saveApiUrlBtn: document.getElementById('saveApiUrlBtn'),

    // Demo buttons
    demoAdminBtn: document.getElementById('demoAdminBtn'),
    demoAliceBtn: document.getElementById('demoAliceBtn'),
    demoBobBtn: document.getElementById('demoBobBtn'),
    demoCharlieBtn: document.getElementById('demoCharlieBtn'),

    // Navigation Tabs
    navTabs: document.querySelectorAll('.nav-tab'),
    tabPanels: document.querySelectorAll('.tab-panel'),
    notesCountBadge: document.getElementById('notesCountBadge'),
    postsCountBadge: document.getElementById('postsCountBadge'),
    adminLockBadge: document.getElementById('adminLockBadge'),

    // Notes Tab Elements
    notesGrid: document.getElementById('notesGrid'),
    refreshNotesBtn: document.getElementById('refreshNotesBtn'),
    openCreateNoteModalBtn: document.getElementById('openCreateNoteModalBtn'),
    notesSearchInput: document.getElementById('notesSearchInput'),
    notesLimitSelect: document.getElementById('notesLimitSelect'),
    adminAuthorFilterWrap: document.getElementById('adminAuthorFilterWrap'),
    adminAuthorFilterSelect: document.getElementById('adminAuthorFilterSelect'),
    rbacBanner: document.getElementById('rbacBanner'),
    rbacBannerTitle: document.getElementById('rbacBannerTitle'),
    rbacBannerDesc: document.getElementById('rbacBannerDesc'),
    notesPaginationInfo: document.getElementById('notesPaginationInfo'),
    notesPrevPageBtn: document.getElementById('notesPrevPageBtn'),
    notesNextPageBtn: document.getElementById('notesNextPageBtn'),
    notesCurrentPageIndicator: document.getElementById('notesCurrentPageIndicator'),

    // Posts Tab Elements
    refreshPostsBtn: document.getElementById('refreshPostsBtn'),
    postsList: document.getElementById('postsList'),
    createPostForm: document.getElementById('createPostForm'),
    postTitleInput: document.getElementById('postTitleInput'),
    postContentInput: document.getElementById('postContentInput'),
    postAuthGuardNotice: document.getElementById('postAuthGuardNotice'),
    postQuickLoginBtn: document.getElementById('postQuickLoginBtn'),
    postsActiveFilterBar: document.getElementById('postsActiveFilterBar'),
    filterAuthorName: document.getElementById('filterAuthorName'),
    clearPostsFilterBtn: document.getElementById('clearPostsFilterBtn'),
    postsPaginationInfo: document.getElementById('postsPaginationInfo'),
    postsPrevPageBtn: document.getElementById('postsPrevPageBtn'),
    postsNextPageBtn: document.getElementById('postsNextPageBtn'),
    postsCurrentPageIndicator: document.getElementById('postsCurrentPageIndicator'),

    // Aggregations Tab Elements
    refreshAggregationsBtn: document.getElementById('refreshAggregationsBtn'),
    subnavScenario1Btn: document.getElementById('subnavScenario1Btn'),
    subnavScenario2Btn: document.getElementById('subnavScenario2Btn'),
    scenario1View: document.getElementById('scenario1View'),
    scenario2View: document.getElementById('scenario2View'),
    interestsGrid: document.getElementById('interestsGrid'),
    scenario2UserSelect: document.getElementById('scenario2UserSelect'),
    scenario2ExecuteBtn: document.getElementById('scenario2ExecuteBtn'),
    scenario2Result: document.getElementById('scenario2Result'),

    // User Management Tab Elements
    refreshUsersBtn: document.getElementById('refreshUsersBtn'),
    openCreateUserModalBtn: document.getElementById('openCreateUserModalBtn'),
    usersAdminGuard: document.getElementById('usersAdminGuard'),
    switchAdminQuickBtn: document.getElementById('switchAdminQuickBtn'),
    usersTableWrap: document.getElementById('usersTableWrap'),
    usersTableBody: document.getElementById('usersTableBody'),
    usersPaginationInfo: document.getElementById('usersPaginationInfo'),
    usersPrevPageBtn: document.getElementById('usersPrevPageBtn'),
    usersNextPageBtn: document.getElementById('usersNextPageBtn'),
    usersCurrentPageIndicator: document.getElementById('usersCurrentPageIndicator'),

    // Auth & Profile Tab Elements
    authTabLoginBtn: document.getElementById('authTabLoginBtn'),
    authTabRegisterBtn: document.getElementById('authTabRegisterBtn'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    loginEmailInput: document.getElementById('loginEmailInput'),
    loginPasswordInput: document.getElementById('loginPasswordInput'),
    registerNameInput: document.getElementById('registerNameInput'),
    registerEmailInput: document.getElementById('registerEmailInput'),
    registerPasswordInput: document.getElementById('registerPasswordInput'),
    registerRoleSelect: document.getElementById('registerRoleSelect'),
    registerInterestsInput: document.getElementById('registerInterestsInput'),
    profileDetailsArea: document.getElementById('profileDetailsArea'),
    profileUpdateSection: document.getElementById('profileUpdateSection'),
    updateProfileForm: document.getElementById('updateProfileForm'),
    updateProfileNameInput: document.getElementById('updateProfileNameInput'),
    updateProfileInterestsInput: document.getElementById('updateProfileInterestsInput'),
    jwtTokenDisplay: document.getElementById('jwtTokenDisplay'),
    copyTokenBtn: document.getElementById('copyTokenBtn'),
    quickFillAdmin: document.getElementById('quickFillAdmin'),
    quickFillAlice: document.getElementById('quickFillAlice'),
    quickFillBob: document.getElementById('quickFillBob'),
    quickFillCharlie: document.getElementById('quickFillCharlie'),

    // Diagnostics Tab Elements
    runAllHealthChecksBtn: document.getElementById('runAllHealthChecksBtn'),
    healthJsonOutput: document.getElementById('healthJsonOutput'),

    // Modals
    noteModal: document.getElementById('noteModal'),
    noteModalTitle: document.getElementById('noteModalTitle'),
    noteForm: document.getElementById('noteForm'),
    noteIdInput: document.getElementById('noteIdInput'),
    noteTitleInput: document.getElementById('noteTitleInput'),
    noteContentInput: document.getElementById('noteContentInput'),
    closeNoteModalBtn: document.getElementById('closeNoteModalBtn'),
    cancelNoteModalBtn: document.getElementById('cancelNoteModalBtn'),

    viewNoteModal: document.getElementById('viewNoteModal'),
    viewNoteModalTitle: document.getElementById('viewNoteModalTitle'),
    viewNoteAuthorBadge: document.getElementById('viewNoteAuthorBadge'),
    viewNoteDate: document.getElementById('viewNoteDate'),
    viewNoteContent: document.getElementById('viewNoteContent'),
    closeViewNoteModalBtn: document.getElementById('closeViewNoteModalBtn'),
    closeViewNoteBtn: document.getElementById('closeViewNoteBtn'),
    editFromViewNoteBtn: document.getElementById('editFromViewNoteBtn'),

    userModal: document.getElementById('userModal'),
    userModalTitle: document.getElementById('userModalTitle'),
    userForm: document.getElementById('userForm'),
    userEditIdInput: document.getElementById('userEditIdInput'),
    userModalNameInput: document.getElementById('userModalNameInput'),
    userModalEmailInput: document.getElementById('userModalEmailInput'),
    userModalPasswordInput: document.getElementById('userModalPasswordInput'),
    userModalPasswordHint: document.getElementById('userModalPasswordHint'),
    userModalRoleSelect: document.getElementById('userModalRoleSelect'),
    userModalInterestsInput: document.getElementById('userModalInterestsInput'),
    closeUserModalBtn: document.getElementById('closeUserModalBtn'),
    cancelUserModalBtn: document.getElementById('cancelUserModalBtn'),

    confirmModal: document.getElementById('confirmModal'),
    confirmModalTitle: document.getElementById('confirmModalTitle'),
    confirmModalMessage: document.getElementById('confirmModalMessage'),
    closeConfirmModalBtn: document.getElementById('closeConfirmModalBtn'),
    cancelConfirmBtn: document.getElementById('cancelConfirmBtn'),
    executeConfirmBtn: document.getElementById('executeConfirmBtn'),

    toastContainer: document.getElementById('toastContainer'),
  };

  // Callback holder for confirmation modal
  let onConfirmAction = null;
  let currentlyViewedNote = null;

  // =========================================================================
  // TOAST NOTIFICATIONS
  // =========================================================================
  const showToast = (message, type = 'info', duration = 3500) => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
    els.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // Helper: Escape HTML
  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Helper: Format Relative Time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // =========================================================================
  // HTTP CLIENT WRAPPER
  // =========================================================================
  const apiRequest = async (endpoint, options = {}) => {
    const url = `${state.apiUrl.replace(/\/+$/, '')}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (state.token) {
      headers['Authorization'] = `Bearer ${state.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: Request failed`);
      }

      return data;
    } catch (err) {
      console.error(`[API Error] ${endpoint}:`, err);
      throw err;
    }
  };

  // =========================================================================
  // HEALTH CHECK PROBE
  // =========================================================================
  const checkHealth = async () => {
    const start = performance.now();
    try {
      els.apiHealthBadge.className = 'health-badge status-checking';
      els.healthStatusText.textContent = 'Checking...';

      const res = await apiRequest('/api/health');
      const latency = Math.round(performance.now() - start);

      els.apiHealthBadge.className = 'health-badge status-online';
      els.healthStatusText.textContent = 'API Online';
      els.healthLatency.textContent = `${latency}ms`;

      // Update Diagnostics JSON if system tab is open
      if (els.healthJsonOutput) {
        els.healthJsonOutput.innerHTML = `<code>${escapeHtml(JSON.stringify(res, null, 2))}</code>`;
      }
    } catch (err) {
      els.apiHealthBadge.className = 'health-badge status-offline';
      els.healthStatusText.textContent = 'API Offline';
      els.healthLatency.textContent = 'fail';

      if (els.healthJsonOutput) {
        els.healthJsonOutput.innerHTML = `<code style="color: #f87171;">Failed to connect to backend at ${escapeHtml(state.apiUrl)}: ${escapeHtml(err.message)}</code>`;
      }
    }
  };

  // =========================================================================
  // AUTHENTICATION & SESSION MANAGEMENT
  // =========================================================================
  const setToken = (token) => {
    state.token = token;
    if (token) {
      localStorage.setItem('aegis_token', token);
      if (els.jwtTokenDisplay) els.jwtTokenDisplay.value = token;
    } else {
      localStorage.removeItem('aegis_token');
      if (els.jwtTokenDisplay) els.jwtTokenDisplay.value = '';
    }
  };

  const loginUser = async (email, password) => {
    try {
      showToast(`Authenticating ${email}...`, 'info', 1500);
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setToken(res.token);
      state.user = res.user;
      showToast(`Welcome back, ${res.user.name}!`, 'success');

      updateAuthUI();
      loadNotes();
      loadPosts();
      loadUsers();
      loadAggregations();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const logoutUser = () => {
    setToken(null);
    state.user = null;
    showToast('Signed out of session', 'info');
    updateAuthUI();
    loadNotes();
    loadPosts();
    loadUsers();
  };

  const fetchCurrentUser = async () => {
    if (!state.token) {
      state.user = null;
      updateAuthUI();
      return;
    }

    try {
      const res = await apiRequest('/api/auth/me');
      state.user = res.user;
      updateAuthUI();
    } catch (err) {
      console.warn('Session expired or invalid token:', err.message);
      logoutUser();
    }
  };

  const updateAuthUI = () => {
    const isLoggedIn = !!state.user;
    const isAdmin = state.user && state.user.role === 'admin';

    // 1. Update Header User Profile Area
    if (isLoggedIn) {
      const initials = state.user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      els.userProfileHeader.innerHTML = `
        <div class="user-avatar-pill">
          <div class="avatar-initials">${escapeHtml(initials)}</div>
          <span class="user-meta-name">${escapeHtml(state.user.name)}</span>
          <span class="role-badge ${isAdmin ? 'admin' : 'user'}">${escapeHtml(state.user.role)}</span>
        </div>
        <button id="headerLogoutBtn" class="btn btn-secondary btn-sm" title="Log out">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      `;

      document.getElementById('headerLogoutBtn')?.addEventListener('click', logoutUser);
    } else {
      els.userProfileHeader.innerHTML = `
        <button id="headerSignInBtn" class="btn btn-primary btn-sm">Sign In</button>
      `;
      document.getElementById('headerSignInBtn')?.addEventListener('click', () => switchTab('authTab'));
    }

    // 2. Admin Badges and Guards
    if (isAdmin) {
      els.adminLockBadge.className = 'badge badge-emerald';
      els.adminLockBadge.textContent = 'Admin Unlocked';
      els.adminAuthorFilterWrap.classList.remove('hide');
      els.usersAdminGuard.classList.add('hide');
      els.usersTableWrap.classList.remove('hide');

      // RBAC Banner in Notes
      els.rbacBannerTitle.textContent = 'RBAC Status: System Administrator';
      els.rbacBannerDesc.innerHTML = 'You have unrestricted access to all notes across all accounts. MongoDB index <code>{ createdAt: -1 }</code> optimizes global listings.';
    } else {
      els.adminLockBadge.className = 'badge badge-admin-only';
      els.adminLockBadge.textContent = 'Admin Only';
      els.adminAuthorFilterWrap.classList.add('hide');
      els.usersAdminGuard.classList.remove('hide');
      els.usersTableWrap.classList.add('hide');

      // RBAC Banner in Notes
      if (isLoggedIn) {
        els.rbacBannerTitle.textContent = `RBAC Status: User Isolation (${state.user.name})`;
        els.rbacBannerDesc.innerHTML = 'You can only view, edit, or delete notes created by your account. MongoDB compound index <code>{ author: 1, createdAt: -1 }</code> enforces secure isolation.';
      } else {
        els.rbacBannerTitle.textContent = 'RBAC Status: Guest (Please Sign In)';
        els.rbacBannerDesc.textContent = 'Notes are protected by JWT authentication. Please choose a demo user above to explore.';
      }
    }

    // 3. Post Feed Auth Guard
    if (isLoggedIn) {
      els.postAuthGuardNotice.classList.add('hide');
      els.createPostForm.classList.remove('hide');
    } else {
      els.postAuthGuardNotice.classList.remove('hide');
      els.createPostForm.classList.add('hide');
    }

    // 4. Profile Tab Details
    if (isLoggedIn) {
      els.profileDetailsArea.innerHTML = `
        <div class="profile-item-row">
          <span class="label">Name:</span>
          <span class="val">${escapeHtml(state.user.name)}</span>
        </div>
        <div class="profile-item-row">
          <span class="label">Email:</span>
          <span class="val">${escapeHtml(state.user.email)}</span>
        </div>
        <div class="profile-item-row">
          <span class="label">Role:</span>
          <span class="role-badge ${isAdmin ? 'admin' : 'user'}">${escapeHtml(state.user.role)}</span>
        </div>
        <div class="profile-item-row">
          <span class="label">Interests:</span>
          <div class="tag-cloud">
            ${(state.user.interests || []).map((i) => `<span class="tag-chip">${escapeHtml(i)}</span>`).join('') || '<span class="text-muted">None specified</span>'}
          </div>
        </div>
      `;

      els.profileUpdateSection.classList.remove('hide');
      els.updateProfileNameInput.value = state.user.name || '';
      els.updateProfileInterestsInput.value = (state.user.interests || []).join(', ');
    } else {
      els.profileDetailsArea.innerHTML = `
        <div class="empty-state">
          <p>No active user session. Please sign in or use a demo login button.</p>
        </div>
      `;
      els.profileUpdateSection.classList.add('hide');
    }

    if (state.token && els.jwtTokenDisplay) {
      els.jwtTokenDisplay.value = state.token;
    }
  };

  // =========================================================================
  // TAB NAVIGATION
  // =========================================================================
  const switchTab = (targetTabId) => {
    state.activeTab = targetTabId;

    els.navTabs.forEach((tab) => {
      const isTarget = tab.dataset.tab === targetTabId;
      tab.classList.toggle('active', isTarget);
    });

    els.tabPanels.forEach((panel) => {
      const isTarget = panel.id === targetTabId;
      panel.classList.toggle('active', isTarget);
    });

    // Refresh data corresponding to tab
    if (targetTabId === 'notesTab') loadNotes();
    if (targetTabId === 'postsTab') loadPosts();
    if (targetTabId === 'aggregationsTab') loadAggregations();
    if (targetTabId === 'usersTab') loadUsers();
    if (targetTabId === 'systemTab') checkHealth();
  };

  // =========================================================================
  // NOTES MANAGEMENT (RBAC)
  // =========================================================================
  const loadNotes = async () => {
    if (!state.token) {
      els.notesGrid.innerHTML = `
        <div class="empty-state">
          <p>🔒 Please sign in to access your secure note vault.</p>
          <button id="notesSignInPromptBtn" class="btn btn-primary btn-sm">Sign In Now</button>
        </div>
      `;
      document.getElementById('notesSignInPromptBtn')?.addEventListener('click', () => switchTab('authTab'));
      els.notesCountBadge.textContent = '0';
      els.notesPaginationInfo.textContent = 'Sign in to view notes';
      els.notesPrevPageBtn.disabled = true;
      els.notesNextPageBtn.disabled = true;
      return;
    }

    try {
      els.notesGrid.innerHTML = `
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Fetching notes from database...</p>
        </div>
      `;

      let query = `?page=${state.notes.page}&limit=${state.notes.limit}`;
      if (state.user?.role === 'admin' && state.notes.authorFilter) {
        query += `&author=${encodeURIComponent(state.notes.authorFilter)}`;
      }

      const res = await apiRequest(`/api/notes${query}`);
      state.notes.items = res.data || [];
      state.notes.totalCount = res.pagination?.totalCount ?? res.totalCount ?? state.notes.items.length;
      state.notes.totalPages = res.pagination?.totalPages ?? res.totalPages ?? 1;

      els.notesCountBadge.textContent = state.notes.totalCount;

      renderNotesList();
      renderNotesPagination();
    } catch (err) {
      els.notesGrid.innerHTML = `
        <div class="empty-state">
          <p style="color: #f87171;">Failed to load notes: ${escapeHtml(err.message)}</p>
        </div>
      `;
      showToast(err.message, 'error');
    }
  };

  const renderNotesList = () => {
    const filterText = state.notes.search.toLowerCase().trim();
    const filtered = state.notes.items.filter((note) => {
      if (!filterText) return true;
      return (
        note.title?.toLowerCase().includes(filterText) ||
        note.content?.toLowerCase().includes(filterText)
      );
    });

    if (filtered.length === 0) {
      els.notesGrid.innerHTML = `
        <div class="empty-state">
          <p>No notes found in this vault.</p>
          <button id="emptyCreateNoteBtn" class="btn btn-primary btn-sm">Create First Note</button>
        </div>
      `;
      document.getElementById('emptyCreateNoteBtn')?.addEventListener('click', openCreateNoteModal);
      return;
    }

    els.notesGrid.innerHTML = filtered.map((note) => {
      const authorName = note.author?.name || 'Unknown Author';
      const isOwn = state.user && (note.author?._id === state.user._id || note.author === state.user._id);
      const canEdit = isOwn || state.user?.role === 'admin';

      return `
        <div class="note-card" data-id="${note._id}">
          <div class="note-card-top">
            <div class="note-meta-row">
              <span class="author-chip ${isOwn ? 'own-note' : ''}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                ${escapeHtml(authorName)} ${isOwn ? '(You)' : ''}
              </span>
              <span class="time-ago">${formatTime(note.createdAt)}</span>
            </div>
            <h4 class="note-title">${escapeHtml(note.title)}</h4>
            <p class="note-snippet">${escapeHtml(note.content)}</p>
          </div>

          <div class="note-card-bottom">
            <button class="btn btn-xs btn-outline view-note-btn" data-id="${note._id}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              View
            </button>

            <div class="note-actions">
              ${canEdit ? `
                <button class="btn btn-xs btn-secondary edit-note-btn" data-id="${note._id}" title="Edit Note">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                  </svg>
                  Edit
                </button>
                <button class="btn btn-xs btn-outline delete-note-btn" data-id="${note._id}" title="Delete Note">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach listeners
    document.querySelectorAll('.view-note-btn').forEach((btn) => {
      btn.addEventListener('click', () => viewNoteDetails(btn.dataset.id));
    });
    document.querySelectorAll('.edit-note-btn').forEach((btn) => {
      btn.addEventListener('click', () => openEditNoteModal(btn.dataset.id));
    });
    document.querySelectorAll('.delete-note-btn').forEach((btn) => {
      btn.addEventListener('click', () => confirmDeleteNote(btn.dataset.id));
    });
  };

  const renderNotesPagination = () => {
    const { page, totalCount, totalPages, limit } = state.notes;
    const start = totalCount === 0 ? 0 : (page - 1) * limit + 1;
    const end = Math.min(page * limit, totalCount);

    els.notesPaginationInfo.textContent = `Showing ${start} to ${end} of ${totalCount} notes`;
    els.notesCurrentPageIndicator.textContent = `Page ${page} of ${Math.max(totalPages, 1)}`;
    els.notesPrevPageBtn.disabled = page <= 1;
    els.notesNextPageBtn.disabled = page >= totalPages;
  };

  const openCreateNoteModal = () => {
    if (!state.token) {
      showToast('Please sign in to create notes', 'info');
      switchTab('authTab');
      return;
    }
    els.noteModalTitle.textContent = 'Create Secure Note';
    els.noteIdInput.value = '';
    els.noteTitleInput.value = '';
    els.noteContentInput.value = '';
    els.noteModal.classList.remove('hide');
    els.noteTitleInput.focus();
  };

  const openEditNoteModal = async (noteId) => {
    try {
      const res = await apiRequest(`/api/notes/${noteId}`);
      const note = res.data;
      els.noteModalTitle.textContent = 'Edit Secure Note';
      els.noteIdInput.value = note._id;
      els.noteTitleInput.value = note.title;
      els.noteContentInput.value = note.content;
      els.noteModal.classList.remove('hide');
      els.noteTitleInput.focus();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const viewNoteDetails = async (noteId) => {
    try {
      const res = await apiRequest(`/api/notes/${noteId}`);
      const note = res.data;
      currentlyViewedNote = note;

      els.viewNoteModalTitle.textContent = note.title;
      els.viewNoteAuthorBadge.textContent = note.author?.name || 'Author';
      els.viewNoteDate.textContent = `Created ${new Date(note.createdAt).toLocaleString()}`;
      els.viewNoteContent.textContent = note.content;

      const canEdit = state.user?.role === 'admin' || (state.user && note.author?._id === state.user._id);
      els.editFromViewNoteBtn.style.display = canEdit ? 'inline-flex' : 'none';

      els.viewNoteModal.classList.remove('hide');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const saveNote = async (e) => {
    e.preventDefault();
    const id = els.noteIdInput.value;
    const title = els.noteTitleInput.value.trim();
    const content = els.noteContentInput.value.trim();

    if (!title || !content) {
      showToast('Please fill in both title and content', 'error');
      return;
    }

    try {
      if (id) {
        // Update Note
        await apiRequest(`/api/notes/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ title, content }),
        });
        showToast('Note updated successfully!', 'success');
      } else {
        // Create Note
        await apiRequest('/api/notes', {
          method: 'POST',
          body: JSON.stringify({ title, content }),
        });
        showToast('Note created in secure vault!', 'success');
      }

      els.noteModal.classList.add('hide');
      loadNotes();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const confirmDeleteNote = (noteId) => {
    els.confirmModalTitle.textContent = 'Delete Secure Note';
    els.confirmModalMessage.textContent = 'Are you sure you want to permanently delete this note? This action cannot be undone.';
    els.confirmModal.classList.remove('hide');

    onConfirmAction = async () => {
      try {
        await apiRequest(`/api/notes/${noteId}`, { method: 'DELETE' });
        showToast('Note deleted successfully', 'success');
        els.confirmModal.classList.add('hide');
        loadNotes();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  };

  // =========================================================================
  // COMMUNITY POSTS FEED
  // =========================================================================
  const loadPosts = async () => {
    try {
      els.postsList.innerHTML = `
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Fetching community posts...</p>
        </div>
      `;

      let endpoint = `/api/posts?page=${state.posts.page}&limit=${state.posts.limit}`;

      // If user filter is active, retrieve posts via $lookup endpoint
      if (state.posts.userFilterId) {
        endpoint = `/api/posts/user/${state.posts.userFilterId}`;
        els.postsActiveFilterBar.classList.remove('hide');
        els.filterAuthorName.textContent = state.posts.userFilterName || 'User';
      } else {
        els.postsActiveFilterBar.classList.add('hide');
      }

      const res = await apiRequest(endpoint);

      if (state.posts.userFilterId) {
        // $lookup returns an array
        state.posts.items = res.data || [];
        state.posts.totalCount = state.posts.items.length;
        state.posts.totalPages = 1;
      } else {
        state.posts.items = res.data || [];
        state.posts.totalCount = res.pagination?.totalCount ?? res.totalCount ?? state.posts.items.length;
        state.posts.totalPages = res.pagination?.totalPages ?? res.totalPages ?? 1;
      }

      els.postsCountBadge.textContent = state.posts.totalCount;

      renderPostsList();
      renderPostsPagination();
    } catch (err) {
      els.postsList.innerHTML = `
        <div class="empty-state">
          <p style="color: #f87171;">Failed to load posts: ${escapeHtml(err.message)}</p>
        </div>
      `;
      showToast(err.message, 'error');
    }
  };

  const renderPostsList = () => {
    if (state.posts.items.length === 0) {
      els.postsList.innerHTML = `
        <div class="empty-state">
          <p>No posts published yet. Be the first to share!</p>
        </div>
      `;
      return;
    }

    els.postsList.innerHTML = state.posts.items.map((post) => {
      const authorName = post.author?.name || 'Anonymous';
      const authorEmail = post.author?.email || '';
      const authorId = post.author?._id || post.author;

      return `
        <div class="post-card">
          <div class="post-header">
            <div class="post-author-box">
              <div class="avatar-initials">${escapeHtml(authorName.charAt(0).toUpperCase())}</div>
              <div>
                <span class="post-author-name">${escapeHtml(authorName)}</span>
                <span class="post-author-email">${escapeHtml(authorEmail)}</span>
              </div>
            </div>
            <span class="time-ago">${formatTime(post.createdAt)}</span>
          </div>

          <div class="post-body">
            <h4>${escapeHtml(post.title)}</h4>
            <p>${escapeHtml(post.content)}</p>
          </div>

          <div class="post-footer">
            <span class="badge badge-spark">MongoDB Indexed</span>
            <button class="btn btn-xs btn-outline filter-author-posts-btn" data-author-id="${authorId}" data-author-name="${escapeHtml(authorName)}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              View via $lookup
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach listeners
    document.querySelectorAll('.filter-author-posts-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const authorId = btn.dataset.authorId;
        const authorName = btn.dataset.authorName;
        // Jump to Scenario 2 Aggregations to demonstrate the interview requirement
        switchTab('aggregationsTab');
        switchAggregationScenario('scenario2');
        if (els.scenario2UserSelect) {
          els.scenario2UserSelect.value = authorId;
          runScenario2Lookup(authorId);
        }
      });
    });
  };

  const renderPostsPagination = () => {
    const { page, totalCount, totalPages, limit, userFilterId } = state.posts;

    if (userFilterId) {
      els.postsPaginationInfo.textContent = `Showing all ${totalCount} posts retrieved via $lookup`;
      els.postsCurrentPageIndicator.textContent = 'Filtered View';
      els.postsPrevPageBtn.disabled = true;
      els.postsNextPageBtn.disabled = true;
      return;
    }

    const start = totalCount === 0 ? 0 : (page - 1) * limit + 1;
    const end = Math.min(page * limit, totalCount);

    els.postsPaginationInfo.textContent = `Showing ${start} to ${end} of ${totalCount} posts`;
    els.postsCurrentPageIndicator.textContent = `Page ${page} of ${Math.max(totalPages, 1)}`;
    els.postsPrevPageBtn.disabled = page <= 1;
    els.postsNextPageBtn.disabled = page >= totalPages;
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!state.token) {
      showToast('Please sign in to publish a post', 'info');
      switchTab('authTab');
      return;
    }

    const title = els.postTitleInput.value.trim();
    const content = els.postContentInput.value.trim();

    if (!title || !content) {
      showToast('Please provide both title and content for your post', 'error');
      return;
    }

    try {
      await apiRequest('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ title, content }),
      });

      showToast('Public post published successfully!', 'success');
      els.postTitleInput.value = '';
      els.postContentInput.value = '';
      loadPosts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // =========================================================================
  // LIVE MONGODB AGGREGATIONS
  // =========================================================================
  const loadAggregations = () => {
    if (state.aggregations.activeScenario === 'scenario1') {
      runScenario1Interests();
    } else {
      populateScenario2UserSelect();
    }
  };

  const switchAggregationScenario = (scenario) => {
    state.aggregations.activeScenario = scenario;
    els.subnavScenario1Btn.classList.toggle('active', scenario === 'scenario1');
    els.subnavScenario2Btn.classList.toggle('active', scenario === 'scenario2');

    els.scenario1View.classList.toggle('hide', scenario !== 'scenario1');
    els.scenario2View.classList.toggle('hide', scenario !== 'scenario2');

    loadAggregations();
  };

  // Scenario 1: Group by Interests (Single collection.aggregate() call)
  const runScenario1Interests = async () => {
    try {
      els.interestsGrid.innerHTML = `
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Running single-pipeline $unwind &rarr; $group aggregation...</p>
        </div>
      `;

      const res = await apiRequest('/api/aggregations/group-by-interests');
      state.aggregations.scenario1Data = res.data || [];

      if (state.aggregations.scenario1Data.length === 0) {
        els.interestsGrid.innerHTML = `
          <div class="empty-state">
            <p>No user interests recorded in the database.</p>
          </div>
        `;
        return;
      }

      els.interestsGrid.innerHTML = state.aggregations.scenario1Data.map((group) => {
        return `
          <div class="interest-card">
            <div class="interest-header">
              <span class="interest-name">
                <span>🏷️</span> ${escapeHtml(group.interest)}
              </span>
              <span class="interest-count-badge">${group.userCount} ${group.userCount === 1 ? 'user' : 'users'}</span>
            </div>

            <div class="interest-users-list">
              ${group.users.map((u) => `
                <div class="interest-user-item">
                  <div class="user-left">
                    <div class="avatar-initials" style="width: 22px; height: 22px; font-size: 0.65rem;">
                      ${escapeHtml(u.name.charAt(0).toUpperCase())}
                    </div>
                    <span>${escapeHtml(u.name)}</span>
                  </div>
                  <span class="role-badge ${u.role === 'admin' ? 'admin' : 'user'}" style="font-size: 0.65rem; padding: 0.1rem 0.4rem;">
                    ${escapeHtml(u.role)}
                  </span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('');
    } catch (err) {
      els.interestsGrid.innerHTML = `
        <div class="empty-state">
          <p style="color: #f87171;">Failed to run aggregation: ${escapeHtml(err.message)}</p>
        </div>
      `;
      showToast(err.message, 'error');
    }
  };

  // Scenario 2: User Posts ($lookup)
  const populateScenario2UserSelect = async () => {
    try {
      let users = [];
      if (state.user?.role === 'admin') {
        const res = await apiRequest('/api/users?limit=50');
        users = res.data || [];
      } else {
        // Fallback: extract distinct users from Scenario 1 data or provide demo options
        if (state.aggregations.scenario1Data.length === 0) {
          const res = await apiRequest('/api/aggregations/group-by-interests');
          state.aggregations.scenario1Data = res.data || [];
        }
        const seen = new Set();
        state.aggregations.scenario1Data.forEach((g) => {
          g.users?.forEach((u) => {
            if (!seen.has(u._id)) {
              seen.add(u._id);
              users.push(u);
            }
          });
        });
      }

      els.scenario2UserSelect.innerHTML = users.map((u) => `
        <option value="${u._id}">${escapeHtml(u.name)} (${escapeHtml(u.email || u.role)})</option>
      `).join('');

      if (users.length > 0 && !els.scenario2UserSelect.value) {
        els.scenario2UserSelect.value = users[0]._id;
      }
    } catch (err) {
      console.warn('Could not populate users dropdown:', err.message);
    }
  };

  const runScenario2Lookup = async (userId) => {
    const targetId = userId || els.scenario2UserSelect.value;
    if (!targetId) {
      showToast('Please select a user to inspect', 'info');
      return;
    }

    try {
      els.scenario2Result.innerHTML = `
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Executing $match &rarr; $lookup aggregation pipeline...</p>
        </div>
      `;

      const res = await apiRequest(`/api/aggregations/user-posts/${targetId}`);
      const data = res.data;

      els.scenario2Result.innerHTML = `
        <div class="user-lookup-card">
          <div class="user-lookup-header">
            <div>
              <h3>${escapeHtml(data.name)}</h3>
              <p class="text-muted">${escapeHtml(data.email)} &bull; Role: <strong>${escapeHtml(data.role)}</strong></p>
              <div class="tag-cloud" style="margin-top: 0.5rem;">
                ${(data.interests || []).map((i) => `<span class="tag-chip">${escapeHtml(i)}</span>`).join('')}
              </div>
            </div>
            <div style="text-align: right;">
              <span class="badge badge-emerald">$lookup Joined Posts</span>
              <div style="font-size: 1.8rem; font-weight: 800; color: #fff;">${data.totalPosts || 0}</div>
            </div>
          </div>

          <div class="lookup-posts-list">
            ${data.posts && data.posts.length > 0 ? data.posts.map((p) => `
              <div class="lookup-post-item">
                <h5>${escapeHtml(p.title)}</h5>
                <p>${escapeHtml(p.content)}</p>
                <small class="text-muted" style="display: block; margin-top: 0.4rem;">
                  Published: ${new Date(p.createdAt).toLocaleString()}
                </small>
              </div>
            `).join('') : `
              <p class="text-muted">This user has not authored any public community posts yet.</p>
            `}
          </div>
        </div>
      `;
    } catch (err) {
      els.scenario2Result.innerHTML = `
        <div class="empty-state">
          <p style="color: #f87171;">Aggregation lookup failed: ${escapeHtml(err.message)}</p>
        </div>
      `;
      showToast(err.message, 'error');
    }
  };

  // =========================================================================
  // USER MANAGEMENT (ADMIN ONLY)
  // =========================================================================
  const loadUsers = async () => {
    if (!state.token || state.user?.role !== 'admin') {
      return;
    }

    try {
      els.usersTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem;">
            <div class="spinner" style="margin: 0 auto 0.5rem;"></div>
            <span>Loading system users...</span>
          </td>
        </tr>
      `;

      const res = await apiRequest(`/api/users?page=${state.users.page}&limit=${state.users.limit}`);
      state.users.items = res.data || [];
      state.users.totalCount = res.pagination?.totalCount ?? res.totalCount ?? state.users.items.length;
      state.users.totalPages = res.pagination?.totalPages ?? res.totalPages ?? 1;

      renderUsersTable();
      renderUsersPagination();
      populateAdminAuthorFilter();
    } catch (err) {
      els.usersTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: #f87171; padding: 2rem;">
            Failed to load users: ${escapeHtml(err.message)}
          </td>
        </tr>
      `;
    }
  };

  const renderUsersTable = () => {
    if (state.users.items.length === 0) {
      els.usersTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem;" class="text-muted">
            No users registered in the database.
          </td>
        </tr>
      `;
      return;
    }

    els.usersTableBody.innerHTML = state.users.items.map((u) => {
      const isSelf = state.user && state.user._id === u._id;
      return `
        <tr>
          <td>
            <div class="user-cell">
              <div class="avatar-initials">${escapeHtml(u.name.charAt(0).toUpperCase())}</div>
              <div class="user-cell-meta">
                <strong>${escapeHtml(u.name)} ${isSelf ? '(You)' : ''}</strong>
                <small>${escapeHtml(u.email)}</small>
              </div>
            </div>
          </td>
          <td>
            <span class="role-badge ${u.role === 'admin' ? 'admin' : 'user'}">${escapeHtml(u.role)}</span>
          </td>
          <td>
            <div class="tag-cloud">
              ${(u.interests || []).map((i) => `<span class="tag-chip">${escapeHtml(i)}</span>`).join('') || '<span class="text-muted">None</span>'}
            </div>
          </td>
          <td>
            <span class="time-ago">${new Date(u.createdAt).toLocaleDateString()}</span>
          </td>
          <td class="text-right">
            <button class="btn btn-xs btn-secondary edit-user-btn" data-id="${u._id}">Edit</button>
            ${!isSelf ? `
              <button class="btn btn-xs btn-outline delete-user-btn" data-id="${u._id}">Delete</button>
            ` : ''}
          </td>
        </tr>
      `;
    }).join('');

    // Attach listeners
    document.querySelectorAll('.edit-user-btn').forEach((btn) => {
      btn.addEventListener('click', () => openEditUserModal(btn.dataset.id));
    });
    document.querySelectorAll('.delete-user-btn').forEach((btn) => {
      btn.addEventListener('click', () => confirmDeleteUser(btn.dataset.id));
    });
  };

  const renderUsersPagination = () => {
    const { page, totalCount, totalPages, limit } = state.users;
    const start = totalCount === 0 ? 0 : (page - 1) * limit + 1;
    const end = Math.min(page * limit, totalCount);

    els.usersPaginationInfo.textContent = `Showing ${start} to ${end} of ${totalCount} users`;
    els.usersCurrentPageIndicator.textContent = `Page ${page} of ${Math.max(totalPages, 1)}`;
    els.usersPrevPageBtn.disabled = page <= 1;
    els.usersNextPageBtn.disabled = page >= totalPages;
  };

  const populateAdminAuthorFilter = () => {
    if (!els.adminAuthorFilterSelect) return;
    const currentVal = els.adminAuthorFilterSelect.value;
    els.adminAuthorFilterSelect.innerHTML = '<option value="">All Authors</option>' +
      state.users.items.map((u) => `
        <option value="${u._id}">${escapeHtml(u.name)} (${escapeHtml(u.email)})</option>
      `).join('');
    els.adminAuthorFilterSelect.value = currentVal;
  };

  const openCreateUserModal = () => {
    els.userModalTitle.textContent = 'Add New System User';
    els.userEditIdInput.value = '';
    els.userModalNameInput.value = '';
    els.userModalEmailInput.value = '';
    els.userModalPasswordInput.value = '';
    els.userModalPasswordInput.required = true;
    els.userModalPasswordHint.textContent = 'Minimum 6 characters';
    els.userModalRoleSelect.value = 'user';
    els.userModalInterestsInput.value = '';
    els.userModal.classList.remove('hide');
    els.userModalNameInput.focus();
  };

  const openEditUserModal = async (userId) => {
    try {
      const res = await apiRequest(`/api/users/${userId}`);
      const user = res.data;

      els.userModalTitle.textContent = 'Edit System User';
      els.userEditIdInput.value = user._id;
      els.userModalNameInput.value = user.name;
      els.userModalEmailInput.value = user.email;
      els.userModalPasswordInput.value = '';
      els.userModalPasswordInput.required = false;
      els.userModalPasswordHint.textContent = 'Leave blank to keep existing password';
      els.userModalRoleSelect.value = user.role;
      els.userModalInterestsInput.value = (user.interests || []).join(', ');
      els.userModal.classList.remove('hide');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const id = els.userEditIdInput.value;
    const name = els.userModalNameInput.value.trim();
    const email = els.userModalEmailInput.value.trim();
    const password = els.userModalPasswordInput.value;
    const role = els.userModalRoleSelect.value;
    const interests = els.userModalInterestsInput.value
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);

    const payload = { name, email, role, interests };
    if (password) payload.password = password;

    try {
      if (id) {
        await apiRequest(`/api/users/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        showToast('User record updated successfully!', 'success');
      } else {
        if (!password) {
          showToast('Password is required for new users', 'error');
          return;
        }
        await apiRequest('/api/users', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showToast('New user registered successfully!', 'success');
      }

      els.userModal.classList.add('hide');
      loadUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const confirmDeleteUser = (userId) => {
    els.confirmModalTitle.textContent = 'Delete User';
    els.confirmModalMessage.textContent = 'Are you sure you want to remove this user? Their associated access will be revoked.';
    els.confirmModal.classList.remove('hide');

    onConfirmAction = async () => {
      try {
        await apiRequest(`/api/users/${userId}`, { method: 'DELETE' });
        showToast('User deleted successfully', 'success');
        els.confirmModal.classList.add('hide');
        loadUsers();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  };

  // =========================================================================
  // EVENT LISTENERS INITIALIZATION
  // =========================================================================
  const initEventListeners = () => {
    // 1. Navigation Tabs
    els.navTabs.forEach((tab) => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // 2. Demo User Quick Login Buttons
    els.demoAdminBtn.addEventListener('click', () => loginUser(DEMO_USERS.admin.email, DEMO_USERS.admin.password));
    els.demoAliceBtn.addEventListener('click', () => loginUser(DEMO_USERS.alice.email, DEMO_USERS.alice.password));
    els.demoBobBtn.addEventListener('click', () => loginUser(DEMO_USERS.bob.email, DEMO_USERS.bob.password));
    els.demoCharlieBtn.addEventListener('click', () => loginUser(DEMO_USERS.charlie.email, DEMO_USERS.charlie.password));

    // Admin guard switch button
    els.switchAdminQuickBtn?.addEventListener('click', () => loginUser(DEMO_USERS.admin.email, DEMO_USERS.admin.password));

    // 3. API Base URL configuration
    els.apiBaseUrlInput.value = state.apiUrl;
    els.saveApiUrlBtn.addEventListener('click', () => {
      const newUrl = els.apiBaseUrlInput.value.trim();
      if (newUrl) {
        state.apiUrl = newUrl;
        localStorage.setItem('aegis_api_url', newUrl);
        showToast(`Backend API target set to: ${newUrl}`, 'info');
        checkHealth();
      }
    });

    // 4. Notes tab actions
    els.refreshNotesBtn.addEventListener('click', loadNotes);
    els.openCreateNoteModalBtn.addEventListener('click', openCreateNoteModal);
    els.notesSearchInput.addEventListener('input', (e) => {
      state.notes.search = e.target.value;
      renderNotesList();
    });
    els.notesLimitSelect.addEventListener('change', (e) => {
      state.notes.limit = parseInt(e.target.value, 10);
      state.notes.page = 1;
      loadNotes();
    });
    els.adminAuthorFilterSelect?.addEventListener('change', (e) => {
      state.notes.authorFilter = e.target.value;
      state.notes.page = 1;
      loadNotes();
    });
    els.notesPrevPageBtn.addEventListener('click', () => {
      if (state.notes.page > 1) {
        state.notes.page--;
        loadNotes();
      }
    });
    els.notesNextPageBtn.addEventListener('click', () => {
      if (state.notes.page < state.notes.totalPages) {
        state.notes.page++;
        loadNotes();
      }
    });

    // Note Modal
    els.noteForm.addEventListener('submit', saveNote);
    els.closeNoteModalBtn.addEventListener('click', () => els.noteModal.classList.add('hide'));
    els.cancelNoteModalBtn.addEventListener('click', () => els.noteModal.classList.add('hide'));

    // View Note Modal
    els.closeViewNoteModalBtn.addEventListener('click', () => els.viewNoteModal.classList.add('hide'));
    els.closeViewNoteBtn.addEventListener('click', () => els.viewNoteModal.classList.add('hide'));
    els.editFromViewNoteBtn.addEventListener('click', () => {
      els.viewNoteModal.classList.add('hide');
      if (currentlyViewedNote) openEditNoteModal(currentlyViewedNote._id);
    });

    // 5. Posts Tab Actions
    els.refreshPostsBtn.addEventListener('click', loadPosts);
    els.createPostForm.addEventListener('submit', handleCreatePost);
    els.postQuickLoginBtn?.addEventListener('click', () => switchTab('authTab'));
    els.clearPostsFilterBtn?.addEventListener('click', () => {
      state.posts.userFilterId = null;
      state.posts.userFilterName = null;
      state.posts.page = 1;
      loadPosts();
    });
    els.postsPrevPageBtn.addEventListener('click', () => {
      if (state.posts.page > 1) {
        state.posts.page--;
        loadPosts();
      }
    });
    els.postsNextPageBtn.addEventListener('click', () => {
      if (state.posts.page < state.posts.totalPages) {
        state.posts.page++;
        loadPosts();
      }
    });

    // 6. Aggregations Tab Actions
    els.refreshAggregationsBtn.addEventListener('click', loadAggregations);
    els.subnavScenario1Btn.addEventListener('click', () => switchAggregationScenario('scenario1'));
    els.subnavScenario2Btn.addEventListener('click', () => switchAggregationScenario('scenario2'));
    els.scenario2ExecuteBtn.addEventListener('click', () => runScenario2Lookup());

    // 7. Users Management Tab Actions
    els.refreshUsersBtn.addEventListener('click', loadUsers);
    els.openCreateUserModalBtn.addEventListener('click', openCreateUserModal);
    els.userForm.addEventListener('submit', handleSaveUser);
    els.closeUserModalBtn.addEventListener('click', () => els.userModal.classList.add('hide'));
    els.cancelUserModalBtn.addEventListener('click', () => els.userModal.classList.add('hide'));
    els.usersPrevPageBtn.addEventListener('click', () => {
      if (state.users.page > 1) {
        state.users.page--;
        loadUsers();
      }
    });
    els.usersNextPageBtn.addEventListener('click', () => {
      if (state.users.page < state.users.totalPages) {
        state.users.page++;
        loadUsers();
      }
    });

    // 8. Auth Hub Forms
    els.authTabLoginBtn.addEventListener('click', () => {
      els.authTabLoginBtn.classList.add('active');
      els.authTabRegisterBtn.classList.remove('active');
      els.loginForm.classList.remove('hide');
      els.registerForm.classList.add('hide');
    });
    els.authTabRegisterBtn.addEventListener('click', () => {
      els.authTabRegisterBtn.classList.add('active');
      els.authTabLoginBtn.classList.remove('active');
      els.registerForm.classList.remove('hide');
      els.loginForm.classList.add('hide');
    });

    els.loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      loginUser(els.loginEmailInput.value.trim(), els.loginPasswordInput.value);
    });

    els.registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = els.registerNameInput.value.trim();
      const email = els.registerEmailInput.value.trim();
      const password = els.registerPasswordInput.value;
      const role = els.registerRoleSelect.value;
      const interests = els.registerInterestsInput.value
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);

      try {
        showToast('Creating account...', 'info');
        const res = await apiRequest('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password, role, interests }),
        });

        setToken(res.token);
        state.user = res.user;
        showToast('Account registered successfully!', 'success');
        updateAuthUI();
        loadNotes();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    // Quick fill credentials inside auth box
    els.quickFillAdmin.addEventListener('click', () => {
      els.loginEmailInput.value = DEMO_USERS.admin.email;
      els.loginPasswordInput.value = DEMO_USERS.admin.password;
    });
    els.quickFillAlice.addEventListener('click', () => {
      els.loginEmailInput.value = DEMO_USERS.alice.email;
      els.loginPasswordInput.value = DEMO_USERS.alice.password;
    });
    els.quickFillBob.addEventListener('click', () => {
      els.loginEmailInput.value = DEMO_USERS.bob.email;
      els.loginPasswordInput.value = DEMO_USERS.bob.password;
    });
    els.quickFillCharlie.addEventListener('click', () => {
      els.loginEmailInput.value = DEMO_USERS.charlie.email;
      els.loginPasswordInput.value = DEMO_USERS.charlie.password;
    });

    // Update Profile form
    els.updateProfileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = els.updateProfileNameInput.value.trim();
      const interests = els.updateProfileInterestsInput.value
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);

      try {
        const res = await apiRequest('/api/auth/me', {
          method: 'PUT',
          body: JSON.stringify({ name, interests }),
        });
        state.user = res.user;
        showToast('Profile updated!', 'success');
        updateAuthUI();
        loadAggregations();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    // Copy Token Button
    els.copyTokenBtn.addEventListener('click', () => {
      if (state.token) {
        navigator.clipboard.writeText(state.token);
        showToast('JWT copied to clipboard!', 'info');
      } else {
        showToast('No active token to copy', 'error');
      }
    });

    // Diagnostics
    els.runAllHealthChecksBtn.addEventListener('click', checkHealth);

    // Confirmation Modal
    els.closeConfirmModalBtn.addEventListener('click', () => els.confirmModal.classList.add('hide'));
    els.cancelConfirmBtn.addEventListener('click', () => els.confirmModal.classList.add('hide'));
    els.executeConfirmBtn.addEventListener('click', () => {
      if (typeof onConfirmAction === 'function') {
        onConfirmAction();
      }
    });
  };

  // =========================================================================
  // BOOTSTRAP INITIALIZATION
  // =========================================================================
  const init = async () => {
    initEventListeners();
    await checkHealth();

    // Check if token exists in storage
    if (state.token) {
      await fetchCurrentUser();
    } else {
      // Auto sign-in as Admin by default for an instant interactive experience!
      await loginUser(DEMO_USERS.admin.email, DEMO_USERS.admin.password);
    }

    loadNotes();
    loadPosts();
    loadAggregations();

    // Periodic health probe
    setInterval(checkHealth, 15000);
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
