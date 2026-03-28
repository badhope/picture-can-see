import { Events } from '../core/events.js';

export class DropZone {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            accept: options.accept || ['.csv', '.json', '.xlsx', '.xls', '.tsv', '.txt'],
            multiple: options.multiple !== false,
            clickToSelect: options.clickToSelect || false,
            onDrop: options.onDrop || (() => {}),
            onDragEnter: options.onDragEnter || (() => {}),
            onDragLeave: options.onDragLeave || (() => {}),
            onDragOver: options.onDragOver || (() => {})
        };
        
        this.isActive = false;
        this._init();
    }

    _init() {
        this.container.addEventListener('dragenter', this._handleDragEnter.bind(this));
        this.container.addEventListener('dragover', this._handleDragOver.bind(this));
        this.container.addEventListener('dragleave', this._handleDragLeave.bind(this));
        this.container.addEventListener('drop', this._handleDrop.bind(this));
        
        if (this.options.clickToSelect) {
            this.container.addEventListener('click', this._handleClick.bind(this));
        }
        
        this._createHiddenInput();
    }

    _createHiddenInput() {
        this.input = document.createElement('input');
        this.input.type = 'file';
        this.input.multiple = this.options.multiple;
        this.input.accept = this.options.accept.join(',');
        this.input.style.display = 'none';
        
        this.input.addEventListener('change', this._handleInputChange.bind(this));
        this.container.appendChild(this.input);
    }

    _handleDragEnter(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (!this.isActive) {
            this.isActive = true;
            this.container.classList.add('drop-zone-active');
            this.options.onDragEnter(e);
        }
    }

    _handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'copy';
        }
        
        this.options.onDragOver(e);
    }

    _handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const rect = this.container.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            this.isActive = false;
            this.container.classList.remove('drop-zone-active');
            this.options.onDragLeave(e);
        }
    }

    _handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        this.isActive = false;
        this.container.classList.remove('drop-zone-active');
        
        const files = this._extractFiles(e.dataTransfer);
        if (files.length > 0) {
            this.options.onDrop(files);
        }
    }

    _handleClick() {
        this.input.click();
    }

    _handleInputChange(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            this.options.onDrop(files);
        }
        this.input.value = '';
    }

    _extractFiles(dataTransfer) {
        const files = [];
        
        if (dataTransfer.items) {
            for (const item of dataTransfer.items) {
                if (item.kind === 'file') {
                    const file = item.getAsFile();
                    if (this._isValidFile(file)) {
                        files.push(file);
                    }
                }
            }
        } else {
            for (const file of dataTransfer.files) {
                if (this._isValidFile(file)) {
                    files.push(file);
                }
            }
        }
        
        return files;
    }

    _isValidFile(file) {
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        return this.options.accept.includes(ext);
    }

    destroy() {
        this.container.removeEventListener('dragenter', this._handleDragEnter);
        this.container.removeEventListener('dragover', this._handleDragOver);
        this.container.removeEventListener('dragleave', this._handleDragLeave);
        this.container.removeEventListener('drop', this._handleDrop);
        this.container.removeEventListener('click', this._handleClick);
        
        if (this.input && this.input.parentNode) {
            this.input.parentNode.removeChild(this.input);
        }
    }
}

export class PasteHandler {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            onPaste: options.onPaste || (() => {}),
            format: options.format || 'auto'
        };
        
        this._init();
    }

    _init() {
        this.container.addEventListener('paste', this._handlePaste.bind(this));
    }

    _handlePaste(e) {
        e.preventDefault();
        
        const clipboardData = e.clipboardData || window.clipboardData;
        const text = clipboardData.getData('text/plain');
        
        if (!text) return;
        
        const format = this._detectFormat(text);
        this.options.onPaste(text, format);
    }

    _detectFormat(text) {
        const trimmed = text.trim();
        
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try {
                JSON.parse(trimmed);
                return 'json';
            } catch (e) {
                // Not valid JSON
            }
        }
        
        if (trimmed.includes('\t') || trimmed.includes(',')) {
            return 'csv';
        }
        
        return 'csv';
    }

    destroy() {
        this.container.removeEventListener('paste', this._handlePaste);
    }
}

export class ManualInput {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            rows: options.rows || 5,
            columns: options.columns || 3,
            onChange: options.onChange || (() => {})
        };
        
        this.data = [];
        this._init();
    }

    _init() {
        this.table = document.createElement('table');
        this.table.className = 'manual-input-table';
        
        const headerRow = document.createElement('tr');
        for (let j = 0; j < this.options.columns; j++) {
            const th = document.createElement('th');
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `列${j + 1}`;
            input.dataset.col = j;
            input.dataset.row = -1;
            input.addEventListener('input', this._handleInput.bind(this));
            th.appendChild(input);
            headerRow.appendChild(th);
        }
        this.table.appendChild(headerRow);
        
        for (let i = 0; i < this.options.rows; i++) {
            const row = document.createElement('tr');
            for (let j = 0; j < this.options.columns; j++) {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'text';
                input.dataset.row = i;
                input.dataset.col = j;
                input.addEventListener('input', this._handleInput.bind(this));
                td.appendChild(input);
                row.appendChild(td);
            }
            this.table.appendChild(row);
        }
        
        this.container.appendChild(this.table);
    }

    _handleInput(e) {
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        const value = e.target.value;
        
        if (row === -1) {
            // Header
            if (!this.data.headers) {
                this.data.headers = [];
            }
            this.data.headers[col] = value;
        } else {
            if (!this.data.rows) {
                this.data.rows = [];
            }
            if (!this.data.rows[row]) {
                this.data.rows[row] = [];
            }
            this.data.rows[row][col] = value;
        }
        
        this.options.onChange(this.getData());
    }

    getData() {
        const headers = this.data.headers || [];
        const rows = this.data.rows || [];
        
        return rows.map(row => {
            const obj = {};
            headers.forEach((header, i) => {
                obj[header || `列${i + 1}`] = row[i] || null;
            });
            return obj;
        });
    }

    setData(data, headers) {
        this.clear();
        
        if (headers) {
            const headerInputs = this.table.querySelectorAll('th input');
            headers.forEach((header, i) => {
                if (headerInputs[i]) {
                    headerInputs[i].value = header;
                }
            });
            this.data.headers = headers;
        }
        
        if (data && data.length > 0) {
            const rowInputs = this.table.querySelectorAll('td input');
            data.forEach((row, i) => {
                const values = Object.values(row);
                values.forEach((value, j) => {
                    const index = i * this.options.columns + j;
                    if (rowInputs[index]) {
                        rowInputs[index].value = value;
                    }
                });
            });
            this.data.rows = data.map(row => Object.values(row));
        }
    }

    clear() {
        const inputs = this.table.querySelectorAll('input');
        inputs.forEach(input => input.value = '');
        this.data = [];
    }

    addRow() {
        const rowCount = this.table.querySelectorAll('tr').length - 1;
        const row = document.createElement('tr');
        
        for (let j = 0; j < this.options.columns; j++) {
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'text';
            input.dataset.row = rowCount;
            input.dataset.col = j;
            input.addEventListener('input', this._handleInput.bind(this));
            td.appendChild(input);
            row.appendChild(td);
        }
        
        this.table.appendChild(row);
        this.options.rows++;
    }

    destroy() {
        if (this.table && this.table.parentNode) {
            this.table.parentNode.removeChild(this.table);
        }
    }
}
