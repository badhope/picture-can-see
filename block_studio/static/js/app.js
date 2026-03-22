const state = {
    currentProject: null,
    blocks: [],
    selectedBlock: null,
    draggedBlock: null,
    dragOffset: { x: 0, y: 0 },
    zoom: 1,
    snapToGrid: true,
    autoSaveTimer: null,
    autoSaveInterval: 30000,
    blockCounter: 0,
    isModified: false,
    history: [],
    historyIndex: -1,
    maxHistorySize: 50,
    isRecordingHistory: true
};

function recordState() {
    if (!state.isRecordingHistory) return;

    const snapshot = JSON.parse(JSON.stringify(state.blocks));

    if (state.historyIndex < state.history.length - 1) {
        state.history = state.history.slice(0, state.historyIndex + 1);
    }

    state.history.push(snapshot);

    if (state.history.length > state.maxHistorySize) {
        state.history.shift();
    } else {
        state.historyIndex++;
    }
}

function undo() {
    if (state.historyIndex <= 0) {
        showToast('没有可撤销的操作', 'warning');
        return false;
    }

    state.historyIndex--;
    state.isRecordingHistory = false;
    state.blocks = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
    state.isRecordingHistory = true;

    refreshWorkspace();
    updateCodePreview();
    showToast('已撤销', 'success');
    return true;
}

function redo() {
    if (state.historyIndex >= state.history.length - 1) {
        showToast('没有可重做的操作', 'warning');
        return false;
    }

    state.historyIndex++;
    state.isRecordingHistory = false;
    state.blocks = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
    state.isRecordingHistory = true;

    refreshWorkspace();
    updateCodePreview();
    showToast('已重做', 'success');
    return true;
}

function refreshWorkspace() {
    const container = document.getElementById('blocksContainer');
    container.innerHTML = '';

    for (const block of state.blocks) {
        const el = createWorkspaceBlock(block);
        container.appendChild(el);
    }

    renderConnectionLines();
}

const blockColors = {
    'logic': '#5C7AEA',
    'logic-light': '#7B8FF0',
    'data': '#2ECC71',
    'data-light': '#58D68D',
    'function': '#E74C3C',
    'function-light': '#EC6B5E',
    'input': '#9B59B6',
    'input-light': '#B07CC6',
    'math': '#3498DB',
    'math-light': '#5DADE2',
    'text': '#F39C12',
    'text-light': '#F5B041',
    'api': '#E67E22',
    'api-light': '#EB984E',
    'ui': '#FD79A8',
    'ui-light': '#FBA7C4',
    'media': '#9B59B6',
    'media-light': '#B07CC6',
    'database': '#1ABC9C',
    'database-light': '#48C9B0'
};

let blockCategories = {};

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function setInnerHTML(element, html) {
    if (!html) {
        element.textContent = '';
        return;
    }
    const temp = document.createElement('div');
    temp.textContent = html;
    element.textContent = temp.textContent;
}

function init() {
    setupEventListeners();
    loadBlockCategories();
    loadProjects();
    setupAutoSave();
    setupKeyboardShortcuts();
    checkOnboarding();
}

function checkOnboarding() {
    const hasSeenOnboarding = localStorage.getItem('blockstudio_onboarding_seen');
    if (!hasSeenOnboarding) {
        showModal('onboardingModal');
    }
}

function closeOnboarding() {
    localStorage.setItem('blockstudio_onboarding_seen', 'true');
    closeModal('onboardingModal');
}

function setupEventListeners() {
    document.getElementById('newProjectBtn').addEventListener('click', showNewProjectModal);
    document.getElementById('saveBtn').addEventListener('click', saveProject);
    document.getElementById('importBtn').addEventListener('click', showImportModal);
    document.getElementById('exportBtn').addEventListener('click', showExportModal);
    document.getElementById('runBtn').addEventListener('click', runCode);
    document.getElementById('clearBtn').addEventListener('click', clearWorkspace);

    document.getElementById('zoomInBtn').addEventListener('click', () => zoomWorkspace(0.1));
    document.getElementById('zoomOutBtn').addEventListener('click', () => zoomWorkspace(-0.1));
    document.getElementById('zoomResetBtn').addEventListener('click', resetZoom);
    document.getElementById('snapToggle').addEventListener('click', toggleSnap);

    document.getElementById('closeNewProjectModal').addEventListener('click', () => closeModal('newProjectModal'));
    document.getElementById('cancelNewProject').addEventListener('click', () => closeModal('newProjectModal'));
    document.getElementById('confirmNewProject').addEventListener('click', createProject);

    document.getElementById('closeImportModal').addEventListener('click', () => closeModal('importModal'));
    document.getElementById('cancelImport').addEventListener('click', () => closeModal('importModal'));
    document.getElementById('confirmImport').addEventListener('click', importFile);

    document.getElementById('closeExportModal').addEventListener('click', () => closeModal('exportModal'));
    document.getElementById('cancelExport').addEventListener('click', () => closeModal('exportModal'));
    document.getElementById('confirmExport').addEventListener('click', downloadExport);

    document.getElementById('closeOnboardingModal').addEventListener('click', closeOnboarding);
    document.getElementById('startOnboarding').addEventListener('click', closeOnboarding);

    document.getElementById('copyCodeBtn').addEventListener('click', copyCode);
    document.getElementById('downloadCodeBtn').addEventListener('click', downloadCode);
    document.getElementById('codeLanguage').addEventListener('change', updateCodePreview);

    document.getElementById('toggleBlocksPanel').addEventListener('click', () => togglePanel('blocksPanel'));
    document.getElementById('togglePropertiesPanel').addEventListener('click', () => togglePanel('propertiesPanel'));

    document.getElementById('blockSearch').addEventListener('input', filterBlocks);

    document.querySelectorAll('.import-card').forEach(card => {
        card.addEventListener('click', () => selectImportType(card.dataset.type));
    });

    document.querySelectorAll('.export-option').forEach(option => {
        option.addEventListener('click', () => selectExportType(option.dataset.format));
    });

    document.getElementById('workspaceCanvas').addEventListener('click', (e) => {
        if (e.target.id === 'workspaceCanvas' || e.target.id === 'blocksContainer') {
            deselectBlock();
        }
    });
}

async function loadBlockCategories() {
    try {
        const response = await fetch('/api/block_categories');
        const data = await response.json();
        blockCategories = data;
        renderBlockCategories();
    } catch (error) {
        console.error('加载积木分类失败:', error);
        showToast('加载积木失败', 'error');
    }
}

function renderBlockCategories() {
    const container = document.getElementById('blocksCategories');
    container.innerHTML = '';

    for (const [categoryId, category] of Object.entries(blockCategories)) {
        const section = document.createElement('div');
        section.className = 'category-section';

        const color = blockColors[categoryId] || '#6366f1';
        const colorLight = blockColors[categoryId + '-light'] || color;

        const header = document.createElement('div');
        header.className = 'category-header';
        header.style.setProperty('--cat-color', color);
        header.style.setProperty('--cat-color-light', colorLight);
        header.innerHTML = `<span class="category-icon">${category.icon}</span><span>${category.name}</span>`;
        header.onclick = () => toggleCategory(categoryId);

        const blocksDiv = document.createElement('div');
        blocksDiv.className = 'category-blocks';
        blocksDiv.id = `category-${categoryId}`;

        for (const block of category.blocks) {
            const blockItem = createBlockItem(block, categoryId);
            blocksDiv.appendChild(blockItem);
        }

        section.appendChild(header);
        section.appendChild(blocksDiv);
        container.appendChild(section);
    }
}

function createBlockItem(block, categoryId) {
    const item = document.createElement('div');
    item.className = 'block-item';
    item.draggable = true;
    item.dataset.blockType = block.id;
    item.dataset.category = categoryId;
    item.textContent = block.name;

    item.onmousedown = (e) => {
        e.preventDefault();
        startDragFromPalette(item, block, categoryId, e);
    };

    return item;
}

function toggleCategory(categoryId) {
    const blocksDiv = document.getElementById(`category-${categoryId}`);
    blocksDiv.classList.toggle('expanded');
}

function filterBlocks() {
    const query = document.getElementById('blockSearch').value.toLowerCase();
    const items = document.querySelectorAll('.block-item');

    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? '' : 'none';
    });
}

async function loadProjects() {
    try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        const select = document.getElementById('projectSelect');
        select.innerHTML = '<option value="">选择项目...</option>';

        for (const project of data.projects || []) {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            select.appendChild(option);
        }

        select.onchange = () => {
            if (select.value) {
                loadProject(select.value);
            }
        };
    } catch (error) {
        console.error('加载项目失败:', error);
    }
}

async function loadProject(projectId) {
    try {
        const response = await fetch(`/api/project/${projectId}`);
        const data = await response.json();

        state.currentProject = data;
        state.blocks = data.blocks || [];
        state.blockCounter = state.blocks.length;
        state.isModified = false;

        renderWorkspaceBlocks();
        updateCodePreview();
        updateSaveStatus('saved');
        showToast('项目已加载', 'success');
    } catch (error) {
        console.error('加载项目失败:', error);
        showToast('加载项目失败', 'error');
    }
}

function renderWorkspaceBlocks() {
    const container = document.getElementById('blocksContainer');
    container.innerHTML = '';

    for (const block of state.blocks) {
        const blockEl = createWorkspaceBlock(block);
        container.appendChild(blockEl);
    }

    renderConnectionLines();
}

function createWorkspaceBlock(block) {
    const el = document.createElement('div');
    el.className = 'workspace-block';
    el.id = `block-${block.id}`;
    el.style.left = `${block.x || 100}px`;
    el.style.top = `${block.y || 100}px`;

    const color = blockColors[block.category] || '#6366f1';
    const colorLight = blockColors[block.category + '-light'] || color;
    el.style.setProperty('--block-color', color);
    el.style.setProperty('--block-color-light', colorLight);

    const isSimpleBlock = (!block.inputs || block.inputs.length === 0) &&
                          (!block.outputs || block.outputs.length === 0);

    const header = document.createElement('div');
    header.className = 'block-header';
    header.innerHTML = `
        <span class="block-title">${block.name}</span>
        <div class="block-actions">
            <button onclick="deleteBlock('${block.id}')">✕</button>
        </div>
    `;

    const body = document.createElement('div');
    body.className = 'block-body';

    if (!isSimpleBlock) {
        if (block.inputs && block.inputs.length > 0) {
            const inputsDiv = document.createElement('div');
            inputsDiv.className = 'block-inputs';
            for (const input of block.inputs) {
                const inputEl = document.createElement('div');
                inputEl.className = 'block-connector input';
                inputEl.dataset.blockId = block.id;
                inputEl.dataset.connectorType = 'input';
                inputEl.dataset.connectorName = input;
                inputEl.innerHTML = `
                    <span class="connector-dot ${getBlockCategory(block) === 'operators' ? 'round' : ''}"></span>
                    ${getBlockCategory(block) === 'operators' ? `<span class="connector-label">${input.toUpperCase()}</span>` : `<span>${input}</span>`}
                `;
                inputsDiv.appendChild(inputEl);
            }
            body.appendChild(inputsDiv);
        }

        if (block.outputs && block.outputs.length > 0) {
            const outputsDiv = document.createElement('div');
            outputsDiv.className = 'block-outputs';
            for (const output of block.outputs) {
                const outputEl = document.createElement('div');
                outputEl.className = 'block-connector output';
                outputEl.dataset.blockId = block.id;
                outputEl.dataset.connectorType = 'output';
                outputEl.dataset.connectorName = output;
                outputEl.innerHTML = `
                    ${getBlockCategory(block) === 'operators' ? `<span class="connector-label">${output.toUpperCase()}</span>` : `<span>${output}</span>`}
                    <span class="connector-dot ${getBlockCategory(block) === 'operators' ? 'round' : ''}"></span>
                `;
                outputsDiv.appendChild(outputEl);
            }
            body.appendChild(outputsDiv);
        }
    }

    el.appendChild(header);
    el.appendChild(body);

    el.onmousedown = (e) => {
        if (e.target.tagName !== 'INPUT' && !e.target.matches('.block-actions button') && !e.target.matches('.connector-dot')) {
            startBlockDrag(el, block, e);
        }
    };

    el.onclick = (e) => {
        if (!e.target.matches('.connector-dot')) {
            selectBlock(block.id);
        }
    };

    return el;
}

function getBlockCategory(block) {
    if (block.category === 'operators') return 'operators';
    if (block.category === 'variables') return 'variables';
    return 'normal';
}

function renderConnectionLines() {
    let svgContainer = document.getElementById('connectionLines');
    if (!svgContainer) {
        svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgContainer.id = 'connectionLines';
        svgContainer.style.position = 'absolute';
        svgContainer.style.top = '0';
        svgContainer.style.left = '0';
        svgContainer.style.width = '100%';
        svgContainer.style.height = '100%';
        svgContainer.style.pointerEvents = 'none';
        svgContainer.style.zIndex = '1';
        document.getElementById('blocksContainer').appendChild(svgContainer);
    }
    svgContainer.innerHTML = '';

    const threshold = 40;
    const blockWidth = 170;
    const blockHeight = 60;

    for (let i = 0; i < state.blocks.length; i++) {
        const blockA = state.blocks[i];
        for (let j = i + 1; j < state.blocks.length; j++) {
            const blockB = state.blocks[j];

            const ax = blockA.x + blockWidth;
            const ay = blockA.y + blockHeight / 2;
            const bx = blockB.x;
            const by = blockB.y + blockHeight / 2;

            if (Math.abs(ax - bx) < threshold && Math.abs(ay - by) < threshold) {
                drawConnectionLine(svgContainer, ax, ay, bx, by, 'horizontal');
            }

            const ax2 = blockA.x + blockWidth / 2;
            const ay2 = blockA.y + blockHeight;
            const bx2 = blockB.x + blockWidth / 2;
            const by2 = blockB.y;

            if (Math.abs(ax2 - bx2) < threshold && Math.abs(ay2 - by2) < threshold) {
                drawConnectionLine(svgContainer, ax2, ay2, bx2, by2, 'vertical');
            }
        }
    }
}

function drawConnectionLine(svg, x1, y1, x2, y2, type) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    let d;
    if (type === 'horizontal') {
        const midX = (x1 + x2) / 2;
        d = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
    } else {
        const midY = (y1 + y2) / 2;
        d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
    }

    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-dasharray', '8,4');
    path.classList.add('connection-line');
    if (type === 'horizontal') {
        path.classList.add('horizontal');
    } else {
        path.classList.add('vertical');
    }

    const isConnected = isBlocksConnected(blockA, blockB);
    if (isConnected) {
        path.classList.add('active');
    }

    svg.appendChild(path);
}

function isBlocksConnected(blockA, blockB) {
    if (blockA.parentId === blockB.id || blockA.childId === blockB.id ||
        blockB.parentId === blockA.id || blockB.childId === blockA.id) {
        return true;
    }
    return false;
}

function startDragFromPalette(item, blockDef, categoryId, e) {
    item.classList.add('dragging');

    const newBlock = {
        id: `block_${++state.blockCounter}`,
        type: blockDef.id,
        name: blockDef.name,
        category: categoryId,
        inputs: [...(blockDef.inputs || [])],
        outputs: [...(blockDef.outputs || [])],
        fields: {},
        x: e.clientX - 300 - 20,
        y: e.clientY - 140
    };

    state.draggedBlock = newBlock;
    state.dragOffset = { x: 0, y: 0 };

    const ghost = createGhostBlock(newBlock);
    document.body.appendChild(ghost);

    const moveHandler = (moveE) => {
        ghost.style.left = `${moveE.clientX - 100}px`;
        ghost.style.top = `${moveE.clientY - 20}px`;
    };

    const upHandler = (upE) => {
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
        item.classList.remove('dragging');

        const canvasRect = document.getElementById('workspaceCanvas').getBoundingClientRect();
        const scrollRect = document.getElementById('workspaceScroll').getBoundingClientRect();
        const x = upE.clientX - canvasRect.left + document.getElementById('workspaceScroll').scrollLeft;
        const y = upE.clientY - canvasRect.top + document.getElementById('workspaceScroll').scrollTop;

        if (x > 0 && y > 0 && upE.clientX > scrollRect.left && upE.clientX < scrollRect.right && upE.clientY > scrollRect.top && upE.clientY < scrollRect.bottom) {
            newBlock.x = state.snapToGrid ? Math.round(x / 20) * 20 : x;
            newBlock.y = state.snapToGrid ? Math.round(y / 20) * 20 : y;
            addBlockToWorkspace(newBlock);
        }

        ghost.remove();
        state.draggedBlock = null;
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
}

function createGhostBlock(block) {
    const ghost = document.createElement('div');
    ghost.className = 'workspace-block';
    ghost.style.position = 'fixed';
    ghost.style.width = '170px';
    ghost.style.setProperty('--block-color', blockColors[block.category] || '#6366f1');
    ghost.style.setProperty('--block-color-light', blockColors[block.category + '-light'] || '#6366f1');
    ghost.style.pointerEvents = 'none';
    ghost.style.opacity = '0.85';
    ghost.style.zIndex = '9999';
    ghost.innerHTML = `
        <div class="block-header">
            <span class="block-title">${block.name}</span>
        </div>
    `;
    return ghost;
}

function addBlockToWorkspace(block) {
    recordState();
    state.blocks.push(block);
    const el = createWorkspaceBlock(block);
    document.getElementById('blocksContainer').appendChild(el);
    state.isModified = true;
    updateSaveStatus('modified');
    triggerAutoSave();
    renderConnectionLines();
    updateCodePreview();
}

const SNAP_THRESHOLD = 25;
const BLOCK_WIDTH = 170;
const BLOCK_HEIGHT = 60;

function findSnapPosition(draggedBlock, allBlocks) {
    let snapX = draggedBlock.x;
    let snapY = draggedBlock.y;
    let snappedToBlock = null;
    let snapType = null;

    const draggedRight = draggedBlock.x + BLOCK_WIDTH;
    const draggedBottom = draggedBlock.y + BLOCK_HEIGHT;
    const draggedCenterX = draggedBlock.x + BLOCK_WIDTH / 2;
    const draggedCenterY = draggedBlock.y + BLOCK_HEIGHT / 2;

    for (const block of allBlocks) {
        if (block.id === draggedBlock.id) continue;

        const blockRight = block.x + BLOCK_WIDTH;
        const blockBottom = block.y + BLOCK_HEIGHT;
        const blockCenterX = block.x + BLOCK_WIDTH / 2;
        const blockCenterY = block.y + BLOCK_HEIGHT / 2;

        if (Math.abs(draggedRight - block.x) < SNAP_THRESHOLD &&
            Math.abs(draggedCenterY - blockCenterY) < SNAP_THRESHOLD) {
            snapX = block.x - BLOCK_WIDTH;
            snapY = block.y;
            snappedToBlock = block;
            snapType = 'right-left';
            break;
        }

        if (Math.abs(draggedBottom - block.y) < SNAP_THRESHOLD &&
            Math.abs(draggedCenterX - blockCenterX) < SNAP_THRESHOLD) {
            snapX = block.x;
            snapY = block.y - BLOCK_HEIGHT;
            snappedToBlock = block;
            snapType = 'bottom-top';
            break;
        }

        if (Math.abs(draggedBlock.x - blockRight) < SNAP_THRESHOLD &&
            Math.abs(draggedCenterY - blockCenterY) < SNAP_THRESHOLD) {
            snapX = blockRight;
            snapY = block.y;
            snappedToBlock = block;
            snapType = 'left-right';
            break;
        }

        if (Math.abs(draggedBlock.y - blockBottom) < SNAP_THRESHOLD &&
            Math.abs(draggedCenterX - blockCenterX) < SNAP_THRESHOLD) {
            snapX = block.x;
            snapY = blockBottom;
            snappedToBlock = block;
            snapType = 'top-bottom';
            break;
        }
    }

    return { x: snapX, y: snapY, snappedToBlock, snapType };
}

function startBlockDrag(el, block, e) {
    el.classList.add('dragging');
    selectBlock(block.id);

    const rect = el.getBoundingClientRect();
    state.dragOffset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };

    let lastMoveTime = 0;
    const moveThrottleMs = 16;
    let currentSnapInfo = null;

    const moveHandler = (moveE) => {
        const now = Date.now();
        if (now - lastMoveTime < moveThrottleMs) return;
        lastMoveTime = now;

        const canvasRect = document.getElementById('workspaceCanvas').getBoundingClientRect();
        let x = moveE.clientX - canvasRect.left - state.dragOffset.x + document.getElementById('workspaceScroll').scrollLeft;
        let y = moveE.clientY - canvasRect.top - state.dragOffset.y + document.getElementById('workspaceScroll').scrollTop;

        const tempBlock = { ...block, x, y };
        const snapInfo = findSnapPosition(tempBlock, state.blocks);

        if (snapInfo.snappedToBlock) {
            x = snapInfo.x;
            y = snapInfo.y;
            currentSnapInfo = snapInfo;
            el.classList.add('block-snapping');
        } else {
            currentSnapInfo = null;
            el.classList.remove('block-snapping');
        }

        if (state.snapToGrid) {
            x = Math.round(x / 20) * 20;
            y = Math.round(y / 20) * 20;
        }

        x = Math.max(0, x);
        y = Math.max(0, y);

        el.style.left = `${x}px`;
        el.style.top = `${y}px`;

        block.x = x;
        block.y = y;

        renderConnectionLines();
    };

    const upHandler = () => {
        el.classList.remove('dragging');
        el.classList.remove('block-snapping');
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);

        if (currentSnapInfo && currentSnapInfo.snappedToBlock) {
            block.x = currentSnapInfo.x;
            block.y = currentSnapInfo.y;
            el.style.left = `${block.x}px`;
            el.style.top = `${block.y}px`;

            createBlockConnection(block, currentSnapInfo.snappedToBlock, currentSnapInfo.snapType);

            showToast('已自动连接', 'success');
        }

        recordState();
        state.isModified = true;
        updateSaveStatus('modified');
        triggerAutoSave();
        renderConnectionLines();
        updateCodePreview();
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
}

function createBlockConnection(blockA, blockB, connectionType) {
    const existingConnection = state.blocks.find(b => {
        if (connectionType === 'bottom-top' || connectionType === 'top-bottom') {
            return (b.parentId === blockA.id && b.childId === blockB.id) ||
                   (b.parentId === blockB.id && b.childId === blockA.id);
        }
        return false;
    });

    if (existingConnection) return;

    const connection = {
        id: `conn_${Date.now()}`,
        type: 'connection',
        parentId: connectionType === 'bottom-top' ? blockA.id : blockB.id,
        childId: connectionType === 'bottom-top' ? blockB.id : blockA.id,
        connectionType: connectionType
    };

    blockA.childId = blockB.id;
    blockB.parentId = blockA.id;

    updateConnectorVisual(blockA.id, true);
    updateConnectorVisual(blockB.id, true);
}

function updateConnectorVisual(blockId, isConnected) {
    const el = document.getElementById(`block-${blockId}`);
    if (!el) return;

    const dots = el.querySelectorAll('.connector-dot');
    dots.forEach(dot => {
        if (isConnected) {
            dot.classList.add('connected');
        } else {
            dot.classList.remove('connected');
        }
    });
}

function selectBlock(blockId) {
    document.querySelectorAll('.workspace-block').forEach(el => {
        el.classList.remove('selected');
    });

    const el = document.getElementById(`block-${blockId}`);
    if (el) {
        el.classList.add('selected');
        state.selectedBlock = blockId;
        showBlockProperties(blockId);
    }
}

function deselectBlock() {
    document.querySelectorAll('.workspace-block').forEach(el => {
        el.classList.remove('selected');
    });
    state.selectedBlock = null;
    document.getElementById('propertiesEmpty').classList.remove('hidden');
    document.getElementById('propertiesForm').classList.add('hidden');
}

function deleteBlock(blockId) {
    recordState();

    const blockToDelete = state.blocks.find(b => b.id === blockId);
    if (blockToDelete) {
        state.blocks.forEach(b => {
            if (b.parentId === blockId) {
                delete b.parentId;
                updateConnectorVisual(b.id, false);
            }
            if (b.childId === blockId) {
                delete b.childId;
                updateConnectorVisual(b.id, false);
            }
        });
    }

    const index = state.blocks.findIndex(b => b.id === blockId);
    if (index > -1) {
        state.blocks.splice(index, 1);
        const el = document.getElementById(`block-${blockId}`);
        if (el) {
            el.remove();
        }
        state.isModified = true;
        updateSaveStatus('modified');
        triggerAutoSave();
        renderConnectionLines();
        updateCodePreview();
        showToast('积木已删除');
    }
}

function showBlockProperties(blockId) {
    const block = state.blocks.find(b => b.id === blockId);
    if (!block) return;

    document.getElementById('propertiesEmpty').classList.add('hidden');
    document.getElementById('propertiesForm').classList.remove('hidden');

    const form = document.getElementById('propertiesForm');
    form.innerHTML = `
        <div class="form-group">
            <label class="form-label">
                <span class="label-icon">🔖</span>
                积木ID
            </label>
            <input type="text" class="form-input" value="${block.id}" readonly>
        </div>
        <div class="form-group">
            <label class="form-label">
                <span class="label-icon">📦</span>
                类型
            </label>
            <input type="text" class="form-input" value="${block.name}" readonly>
        </div>
        <div class="form-group">
            <label class="form-label">
                <span class="label-icon">📍</span>
                X 位置
            </label>
            <input type="number" class="form-input" value="${block.x || 0}" onchange="updateBlockPosition('${blockId}', 'x', this.value)">
        </div>
        <div class="form-group">
            <label class="form-label">
                <span class="label-icon">📍</span>
                Y 位置
            </label>
            <input type="number" class="form-input" value="${block.y || 0}" onchange="updateBlockPosition('${blockId}', 'y', this.value)">
        </div>
    `;

    if (block.fields) {
        for (const [key, value] of Object.entries(block.fields)) {
            form.innerHTML += `
                <div class="form-group">
                    <label class="form-label">${key}</label>
                    <input type="text" class="form-input" value="${value}" onchange="updateBlockField('${blockId}', '${key}', this.value)">
                </div>
            `;
        }
    }
}

function updateBlockPosition(blockId, axis, value) {
    const block = state.blocks.find(b => b.id === blockId);
    if (block) {
        block[axis] = parseInt(value) || 0;
        const el = document.getElementById(`block-${blockId}`);
        if (el) {
            el.style[axis === 'x' ? 'left' : 'top'] = `${block[axis]}px`;
        }
        state.isModified = true;
        updateSaveStatus('modified');
        triggerAutoSave();
    }
}

function updateBlockField(blockId, field, value) {
    const block = state.blocks.find(b => b.id === blockId);
    if (block) {
        block.fields = block.fields || {};
        block.fields[field] = value;
        state.isModified = true;
        updateSaveStatus('modified');
        triggerAutoSave();
        updateCodePreview();
    }
}

function setupAutoSave() {
    window.addEventListener('beforeunload', (e) => {
        if (state.isModified && state.blocks.length > 0) {
            saveProjectSync();
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 's') {
                e.preventDefault();
                saveProject();
            } else if (e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
                e.preventDefault();
                redo();
            }
        }

        if (e.key === 'Delete' && state.selectedBlock) {
            deleteBlock(state.selectedBlock);
        }
    });
}

function triggerAutoSave() {
    if (state.autoSaveTimer) {
        clearTimeout(state.autoSaveTimer);
    }

    updateSaveStatus('saving');

    state.autoSaveTimer = setTimeout(() => {
        saveProjectToServer();
    }, state.autoSaveInterval);
}

async function saveProjectToServer() {
    const projectId = state.currentProject?.id || 'default';

    try {
        await fetch('/api/blocks/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                project_id: projectId,
                blocks: state.blocks
            })
        });

        state.isModified = false;
        updateSaveStatus('saved');
    } catch (error) {
        console.error('自动保存失败:', error);
        updateSaveStatus('error');
    }
}

function saveProjectSync() {
    const projectId = state.currentProject?.id || 'default';
    const data = JSON.stringify({
        project_id: projectId,
        blocks: state.blocks
    });

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/blocks/save', false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(data);
}

function updateSaveStatus(status) {
    const statusEl = document.getElementById('saveStatus');
    const dot = statusEl.querySelector('.status-dot');
    const text = statusEl.querySelector('.status-text');

    dot.className = 'status-dot';

    switch (status) {
        case 'saved':
            dot.classList.add('saved');
            text.textContent = '已保存';
            text.style.color = 'var(--green)';
            break;
        case 'saving':
            dot.classList.add('saving');
            text.textContent = '保存中...';
            text.style.color = 'var(--yellow)';
            break;
        case 'modified':
            dot.classList.add('saved');
            text.textContent = '已修改';
            text.style.color = 'var(--orange)';
            break;
        case 'error':
            text.textContent = '保存失败';
            text.style.color = '#E74C3C';
            break;
    }
}

async function saveProject() {
    if (!state.currentProject) {
        showNewProjectModal();
        return;
    }

    try {
        await fetch(`/api/project/${state.currentProject.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: state.currentProject.name,
                blocks: state.blocks
            })
        });

        state.isModified = false;
        updateSaveStatus('saved');
        showToast('项目已保存', 'success');
    } catch (error) {
        console.error('保存失败:', error);
        showToast('保存失败', 'error');
    }
}

async function updateCodePreview() {
    const language = document.getElementById('codeLanguage').value;
    const codeEl = document.getElementById('generatedCode');
    const originalContent = codeEl.textContent;

    codeEl.textContent = '// 生成中...';

    try {
        const response = await fetch('/api/export/code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                blocks: state.blocks,
                language: language
            })
        });

        if (!response.ok) {
            throw new Error('Server error');
        }

        const data = await response.json();
        codeEl.textContent = data.code || (language === 'javascript' ? '// 暂无代码' : '# 暂无代码');

        validateBlocks();
    } catch (error) {
        console.error('代码生成失败:', error);
        codeEl.textContent = originalContent;
        showToast('代码生成失败', 'error');
    }
}

async function validateBlocks() {
    const language = document.getElementById('codeLanguage').value;
    const validationEl = document.getElementById('validationResult');

    try {
        const response = await fetch('/api/validate/blocks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                blocks: state.blocks,
                language: language
            })
        });

        const result = await response.json();

        if (validationEl) {
            let html = '<div class="validation-summary">';
            html += `<span class="validation-stat">积木: ${escapeHtml(String(result.blockCount))}</span>`;
            html += `<span class="validation-stat">连接: ${escapeHtml(String(result.connectionCount))}</span>`;

            if (result.errors && result.errors.length > 0) {
                html += `<span class="validation-stat error">错误: ${escapeHtml(String(result.errors.length))}</span>`;
            }
            if (result.warnings && result.warnings.length > 0) {
                html += `<span class="validation-stat warning">警告: ${escapeHtml(String(result.warnings.length))}</span>`;
            }
            if (result.valid && (!result.warnings || result.warnings.length === 0)) {
                html += `<span class="validation-stat success">✓ 正常</span>`;
            }
            html += '</div>';

            if (result.errors && result.errors.length > 0) {
                html += '<div class="validation-errors">';
                for (const err of result.errors) {
                    html += `<div class="validation-item error">${escapeHtml(err.message || '')}</div>`;
                }
                html += '</div>';
            }

            if (result.warnings && result.warnings.length > 0) {
                html += '<div class="validation-warnings">';
                for (const warn of result.warnings) {
                    html += `<div class="validation-item warning">${escapeHtml(warn.message || '')}</div>`;
                }
                html += '</div>';
            }

            validationEl.innerHTML = html;
        }
    } catch (error) {
        console.error('验证失败:', error);
    }
}

function copyCode() {
    const code = document.getElementById('generatedCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        showToast('代码已复制到剪贴板', 'success');
    });
}

function downloadCode() {
    const code = document.getElementById('generatedCode').textContent;
    const language = document.getElementById('codeLanguage').value;
    const ext = language === 'python' ? 'py' : 'js';

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blocks_output.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
}

function runCode() {
    const code = document.getElementById('generatedCode').textContent;
    const language = document.getElementById('codeLanguage').value;

    if (language === 'javascript') {
        if (!code || code.trim().startsWith('//')) {
            showToast('没有可执行的代码', 'warning');
            return;
        }

        const dangerousPatterns = [
            /fetch\s*\(/,
            /XMLHttpRequest/,
            /import\s*\(/,
            /require\s*\(/,
            /eval\s*\(/,
            /document\s*\./,
            /window\s*\./,
            /localStorage/,
            /sessionStorage/,
            /cookies?/i,
            /\beval\b/,
            /Function\s*\(/,
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(code)) {
                showToast('代码包含禁止的模式，无法执行', 'error');
                console.error('Blocked dangerous pattern:', pattern);
                return;
            }
        }

        try {
            const safeExecute = new Function(code);
            const result = safeExecute();

            if (result !== undefined) {
                console.log('Code result:', result);
            }

            showToast('代码执行完成', 'success');
        } catch (error) {
            showToast(`执行错误: ${error.message}`, 'error');
        }
    } else {
        showToast('Python 代码需要在 Python 环境中运行', 'warning');
    }
}

function zoomWorkspace(delta) {
    state.zoom = Math.max(0.5, Math.min(2, state.zoom + delta));
    applyZoom();
}

function resetZoom() {
    state.zoom = 1;
    applyZoom();
}

function applyZoom() {
    const container = document.getElementById('blocksContainer');
    container.style.transform = `scale(${state.zoom})`;
    container.style.transformOrigin = 'top left';
    document.getElementById('zoomDisplay').textContent = `${Math.round(state.zoom * 100)}%`;
}

function toggleSnap() {
    state.snapToGrid = !state.snapToGrid;
    const btn = document.getElementById('snapToggle');
    btn.classList.toggle('active', state.snapToGrid);
    showToast(state.snapToGrid ? '已启用网格吸附' : '已禁用网格吸附');
}

function clearWorkspace() {
    if (state.blocks.length > 0 && !confirm('确定要清空画布吗？')) {
        return;
    }
    state.blocks = [];
    renderWorkspaceBlocks();
    state.isModified = true;
    updateSaveStatus('modified');
    triggerAutoSave();
    updateCodePreview();
    showToast('画布已清空');
}

function togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    panel.classList.toggle('collapsed');
}

function showNewProjectModal() {
    document.getElementById('newProjectModal').classList.remove('hidden');
    document.getElementById('projectNameInput').focus();
}

function showImportModal() {
    document.getElementById('importModal').classList.remove('hidden');
}

function showExportModal() {
    document.getElementById('exportModal').classList.remove('hidden');
    updateExportPreview();
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

async function createProject() {
    const name = document.getElementById('projectNameInput').value.trim();
    const desc = document.getElementById('projectDescInput').value.trim();
    const tags = document.getElementById('projectTagsInput').value.split(',').map(t => t.trim()).filter(t => t);

    if (!name) {
        showToast('请输入项目名称', 'warning');
        return;
    }

    try {
        const response = await fetch('/api/project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description: desc, tags })
        });

        const data = await response.json();
        state.currentProject = data;
        state.blocks = [];
        state.isModified = false;

        await loadProjects();
        document.getElementById('projectSelect').value = data.id;

        closeModal('newProjectModal');
        document.getElementById('projectNameInput').value = '';
        document.getElementById('projectDescInput').value = '';
        document.getElementById('projectTagsInput').value = '';

        showToast('项目已创建', 'success');
    } catch (error) {
        console.error('创建项目失败:', error);
        showToast('创建项目失败', 'error');
    }
}

function selectImportType(type) {
    document.querySelectorAll('.import-card').forEach(el => el.classList.remove('selected'));
    document.querySelector(`.import-card[data-type="${type}"]`).classList.add('selected');
    document.getElementById('uploadArea').classList.remove('hidden');

    const accept = type === 'json' ? '.json' : type === 'text' ? '.txt,.md,.csv' : '.js,.py';
    document.getElementById('importFileInput').accept = accept;
}

function selectExportType(format) {
    document.querySelectorAll('.export-option').forEach(el => el.classList.remove('selected'));
    document.querySelector(`.export-option[data-format="${format}"]`).classList.add('selected');
    updateExportPreview();
}

async function importFile() {
    const fileInput = document.getElementById('importFileInput');
    const file = fileInput.files[0];

    if (!file) {
        showToast('请选择文件', 'warning');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/import/file', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.blocks) {
            state.blocks = data.blocks;
            renderWorkspaceBlocks();
            updateCodePreview();
            showToast('导入成功', 'success');
        } else if (data.content) {
            showToast('文件内容: ' + data.content.substring(0, 100), 'success');
        }

        closeModal('importModal');
    } catch (error) {
        console.error('导入失败:', error);
        showToast('导入失败', 'error');
    }
}

function updateExportPreview() {
    const format = document.querySelector('.export-option.selected')?.dataset.format || 'json';
    let preview = '';

    switch (format) {
        case 'json':
            preview = JSON.stringify({
                project: state.currentProject?.name || '未命名项目',
                blocks: state.blocks,
                exported_at: new Date().toISOString()
            }, null, 2);
            break;
        case 'blocks':
            preview = JSON.stringify(state.blocks, null, 2);
            break;
        case 'code':
            preview = document.getElementById('generatedCode').textContent;
            break;
    }

    document.getElementById('exportPreviewCode').textContent = preview;
    document.querySelector('.preview-lang').textContent = format.toUpperCase();
}

function downloadExport() {
    const format = document.querySelector('.export-option.selected')?.dataset.format || 'json';
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
        case 'json':
            content = JSON.stringify({
                project: state.currentProject?.name || '未命名项目',
                blocks: state.blocks,
                exported_at: new Date().toISOString()
            }, null, 2);
            filename = `${state.currentProject?.name || 'project'}.json`;
            mimeType = 'application/json';
            break;
        case 'blocks':
            content = JSON.stringify(state.blocks, null, 2);
            filename = `${state.currentProject?.name || 'project'}_blocks.json`;
            mimeType = 'application/json';
            break;
        case 'code':
            content = document.getElementById('generatedCode').textContent;
            const lang = document.getElementById('codeLanguage').value;
            filename = `${state.currentProject?.name || 'output'}.${lang === 'python' ? 'py' : 'js'}`;
            mimeType = 'text/plain';
            break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    closeModal('exportModal');
    showToast('导出成功', 'success');
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠'
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.success}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', init);