/* ============================================================
   CODEL SYSTEM - Interface do Usuário (UI)
   Arquivo: js/ui.js
   ============================================================ */

/* ── Navegação entre Views ── */

/**
 * Exibe a view correspondente ao ID e atualiza o item ativo da sidebar.
 * @param {string} viewId - ID da view ('rota' | 'usuarios' | 'dados' | 'suporte' | 'ajustes')
 */
function showView(viewId) {
    /* Remover estado ativo de todos os itens do menu */
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('nav-item--active'));

    /* Ativar o botão correspondente */
    const activeButton = document.getElementById(`nav-btn-${viewId}`);
    if (activeButton) activeButton.classList.add('nav-item--active');

    /* Ocultar todas as views: remover view--active de todas */
    document.querySelectorAll('#view-container > .view').forEach(view => {
        view.classList.remove('view--active');
    });

    /* Exibir a view selecionada */
    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) targetView.classList.add('view--active');

    /* Atualizar título do cabeçalho */
    const titleMap = {
        rota:     'Rota',
        usuarios: 'Usuários',
        dados:    'Dados',
        suporte:  'Suporte',
        ajustes:  'Ajustes',
    };
    document.getElementById('page-title').textContent = titleMap[viewId] || viewId;

    /* Renderizar conteúdo dinâmico conforme a view */
    if (viewId === 'usuarios') renderDriverCards();
    if (viewId === 'dados')    renderCollectionHistoryTable();
    if (viewId === 'suporte')  renderDriverChatList();
}

/* ── Sidebar ── */

/** Abre ou fecha a sidebar. */
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('is-collapsed');
}

/* ── Painel de Notificações ── */

/** Abre ou fecha o painel lateral de alertas. */
function toggleNotificationPanel() {
    document.getElementById('notification-panel').classList.toggle('is-open');
}

/** Remove todas as notificações e fecha o painel. */
function clearAllNotifications() {
    alertNotifications = [];
    renderNotificationList();
    toggleNotificationPanel();
}

/**
 * Re-renderiza a lista de notificações no painel lateral.
 * Também controla a visibilidade do badge vermelho no sino.
 */
function renderNotificationList() {
    const list  = document.getElementById('notification-list');
    const badge = document.getElementById('notification-badge');

    if (alertNotifications.length === 0) {
        badge.classList.add('notification-badge--hidden');
    } else {
        badge.classList.remove('notification-badge--hidden');
    }

    list.innerHTML = alertNotifications.map(alert => `
        <div class="notification-card">
            <p class="notification-card__time">${alert.timestamp}</p>
            <h4 class="notification-card__title">${alert.pointName}</h4>
            <p class="notification-card__desc">Acionamento em ${alert.fillLevel}%</p>
        </div>
    `).join('');
}

/* ── View: Usuários ── */

/**
 * Renderiza os cards de motoristas na view de Usuários.
 */
function renderDriverCards() {
    const container = document.getElementById('view-usuarios');
    container.innerHTML = drivers.map(driver => `
        <div onclick="openDriverDetailModal(${driver.id})" class="driver-card">
            <div class="driver-card__avatar">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
            <h4 class="driver-card__name">${driver.fullName}</h4>
            <p class="driver-card__id">${driver.employeeId}</p>
        </div>
    `).join('');
}

/* ── Modal: Detalhe do Motorista ── */

/**
 * Abre o modal com as informações detalhadas de um motorista.
 * @param {number} driverId - ID do motorista
 */
function openDriverDetailModal(driverId) {
    const driver  = drivers.find(d => d.id === driverId);
    const modal   = document.getElementById('user-detail-modal');
    const content = document.getElementById('user-detail-modal-content');

    content.innerHTML = `
        <button onclick="closeDriverDetailModal()" class="modal__close-btn" aria-label="Fechar">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
        <div class="modal__body">
            <div class="modal__avatar">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
            <h2 class="modal__name">${driver.fullName}</h2>
            <p class="modal__id">${driver.employeeId}</p>
            <div class="modal__info-grid">
                <div class="modal__info-cell">
                    <p class="modal__info-label">Idade</p>
                    <p class="modal__info-value">${driver.age} Anos</p>
                </div>
                <div class="modal__info-cell">
                    <p class="modal__info-label">Placa</p>
                    <p class="modal__info-value">${driver.licensePlate}</p>
                </div>
                <div class="modal__info-cell modal__info-cell--full">
                    <p class="modal__info-label">E-mail</p>
                    <p class="modal__info-value">${driver.email}</p>
                </div>
                <div class="modal__info-cell modal__info-cell--full">
                    <p class="modal__info-label">Telefone / Rádio</p>
                    <p class="modal__info-value">${driver.phone}</p>
                </div>
            </div>
        </div>
    `;

    modal.classList.remove('modal--hidden');
}

/** Fecha o modal de detalhe do motorista. */
function closeDriverDetailModal() {
    document.getElementById('user-detail-modal').classList.add('modal--hidden');
}

/* ── View: Dados (Histórico de Coletas) ── */

/**
 * Re-renderiza as linhas da tabela de histórico de coletas.
 */
function renderCollectionHistoryTable() {
    const tbody = document.getElementById('collection-history-table');
    tbody.innerHTML = collectionHistory.map(record => `
        <tr>
            <td class="data-table__td td--accent">${record.driverCallSign}</td>
            <td class="data-table__td">${record.pointName}</td>
            <td class="data-table__td td--muted">${record.date}</td>
            <td class="data-table__td">${record.time}</td>
        </tr>
    `).join('');
}

/* ── View: Suporte (Chat) ── */

/**
 * Renderiza a lista de motoristas disponíveis para contato no chat.
 */
function renderDriverChatList() {
    const list = document.getElementById('driver-chat-list');
    list.innerHTML = drivers.map(driver => `
        <div onclick="openChatWithDriver(${driver.id})" class="chat-driver-item">
            <div class="chat-driver-item__avatar">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
            <span class="chat-driver-item__name">${driver.callSign}</span>
        </div>
    `).join('');
}

/**
 * Abre o painel de chat com o motorista selecionado.
 * @param {number} driverId - ID do motorista
 */
function openChatWithDriver(driverId) {
    const driver    = drivers.find(d => d.id === driverId);
    const chatPanel = document.getElementById('active-chat-panel');

    chatPanel.innerHTML = `
        <div class="chat-active-header">
            <div class="chat-active-header__user">
                <div class="chat-active-header__avatar">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
                <div>
                    <h4 class="chat-active-header__name">${driver.fullName}</h4>
                    <p class="chat-active-header__status">Operação Ativa</p>
                </div>
            </div>
        </div>

        <div class="chat-messages custom-scrollbar">
            <div class="chat-bubble--received">
                Iniciando trajeto devido ao nível de 70% atingido.
            </div>
            <div class="chat-bubble--sent">
                Ciente. Redobre a atenção na via.
            </div>
        </div>

        <div class="chat-input-area">
            <input type="text"
                placeholder="Mensagem para ${driver.callSign}..."
                class="chat-input">
        </div>
    `;
}

/* ── Tema ── */

/** Alterna entre o tema escuro (padrão) e o tema claro. */
function toggleTheme() {
    const body      = document.body;
    const themeIcon = document.getElementById('theme-toggle-icon');

    if (currentTheme === 'dark') {
        body.classList.add('light-theme');
        currentTheme = 'light';
        themeIcon.innerHTML = `
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        `;
    } else {
        body.classList.remove('light-theme');
        currentTheme = 'dark';
        themeIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
    }
}

/* ── Ajustes / Configurações ── */

/**
 * Ativa ou desativa uma configuração e atualiza o toggle visual.
 * @param {string} settingKey - Chave da configuração em appSettings
 */
function toggleSetting(settingKey) {
    appSettings[settingKey] = !appSettings[settingKey];

    const toggleButton = document.getElementById(`toggle-${settingKey}`);
    const toggleDot    = document.getElementById(`toggle-dot-${settingKey}`);

    if (appSettings[settingKey]) {
        toggleButton.classList.remove('toggle-switch--off');
        toggleButton.classList.add('toggle-switch--on');
        toggleDot.classList.remove('toggle-switch__dot--left');
        toggleDot.classList.add('toggle-switch__dot--right');
    } else {
        toggleButton.classList.remove('toggle-switch--on');
        toggleButton.classList.add('toggle-switch--off');
        toggleDot.classList.remove('toggle-switch__dot--right');
        toggleDot.classList.add('toggle-switch__dot--left');
    }
}