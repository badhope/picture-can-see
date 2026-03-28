export class CSVParser {
    constructor(options = {}) {
        this.delimiter = options.delimiter || ',';
        this.quote = options.quote || '"';
        this.escape = options.escape || '"';
        this.encoding = options.encoding || 'utf-8';
    }

    parse(content) {
        const lines = this._splitLines(content);
        if (lines.length === 0) {
            return { headers: [], data: [], errors: [] };
        }

        const headers = this._parseLine(lines[0]);
        const data = [];
        const errors = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = this._parseLine(line);
            const row = {};

            headers.forEach((header, index) => {
                row[header] = values[index] !== undefined ? values[index] : null;
            });

            data.push(row);
        }

        return { headers, data, errors };
    }

    _splitLines(content) {
        const lines = [];
        let currentLine = '';
        let inQuotes = false;

        for (let i = 0; i < content.length; i++) {
            const char = content[i];
            const nextChar = content[i + 1];

            if (inQuotes) {
                if (char === this.quote) {
                    if (nextChar === this.quote) {
                        currentLine += this.quote;
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    currentLine += char;
                }
            } else {
                if (char === this.quote) {
                    inQuotes = true;
                } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
                    if (currentLine.trim()) {
                        lines.push(currentLine);
                    }
                    currentLine = '';
                    if (char === '\r') i++;
                } else if (char !== '\r') {
                    currentLine += char;
                }
            }
        }

        if (currentLine.trim()) {
            lines.push(currentLine);
        }

        return lines;
    }

    _parseLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (inQuotes) {
                if (char === this.quote) {
                    if (nextChar === this.quote) {
                        current += this.quote;
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    current += char;
                }
            } else {
                if (char === this.quote) {
                    inQuotes = true;
                } else if (char === this.delimiter) {
                    values.push(this._cleanValue(current));
                    current = '';
                } else {
                    current += char;
                }
            }
        }

        values.push(this._cleanValue(current));
        return values;
    }

    _cleanValue(value) {
        value = value.trim();
        if (value === '' || value === 'null' || value === 'NULL' || value === 'NA' || value === 'N/A') {
            return null;
        }
        return value;
    }

    detectDelimiter(content) {
        const firstLine = content.split('\n')[0];
        const delimiters = [',', '\t', ';', '|'];
        let maxCount = 0;
        let detectedDelimiter = ',';

        for (const delimiter of delimiters) {
            const count = (firstLine.match(new RegExp(this._escapeRegex(delimiter), 'g')) || []).length;
            if (count > maxCount) {
                maxCount = count;
                detectedDelimiter = delimiter;
            }
        }

        return detectedDelimiter;
    }

    _escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

export class JSONParser {
    parse(content) {
        try {
            const parsed = JSON.parse(content);
            let data = [];
            let headers = [];

            if (Array.isArray(parsed)) {
                data = parsed;
            } else if (typeof parsed === 'object') {
                if (parsed.data && Array.isArray(parsed.data)) {
                    data = parsed.data;
                } else {
                    data = [parsed];
                }
            }

            if (data.length > 0) {
                headers = Object.keys(data[0]);
            }

            return { headers, data, errors: [] };
        } catch (error) {
            return { headers: [], data: [], errors: [`JSON解析失败: ${error.message}`] };
        }
    }
}

export class ExcelParser {
    async parse(arrayBuffer) {
        if (typeof XLSX === 'undefined') {
            throw new Error('请先加载SheetJS库');
        }

        try {
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);
            const headers = data.length > 0 ? Object.keys(data[0]) : [];

            return { headers, data };
        } catch (error) {
            throw new Error(`Excel解析失败: ${error.message}`);
        }
    }
}

export class FileParser {
    constructor() {
        this.csvParser = new CSVParser();
        this.jsonParser = new JSONParser();
        this.excelParser = new ExcelParser();
    }

    async parse(file) {
        const extension = this._getExtension(file.name);
        const result = {
            name: file.name,
            size: file.size,
            type: extension,
            headers: [],
            data: [],
            errors: []
        };

        try {
            switch (extension) {
                case 'csv':
                case 'tsv':
                case 'txt':
                    const text = await this._readAsText(file);
                    if (extension === 'tsv' || file.name.toLowerCase().endsWith('.tsv')) {
                        this.csvParser.delimiter = '\t';
                    } else {
                        this.csvParser.delimiter = this.csvParser.detectDelimiter(text);
                    }
                    const csvResult = this.csvParser.parse(text);
                    result.headers = csvResult.headers;
                    result.data = csvResult.data;
                    break;

                case 'json':
                    const jsonText = await this._readAsText(file);
                    const jsonResult = this.jsonParser.parse(jsonText);
                    result.headers = jsonResult.headers;
                    result.data = jsonResult.data;
                    break;

                case 'xlsx':
                case 'xls':
                    const arrayBuffer = await this._readAsArrayBuffer(file);
                    const excelResult = await this.excelParser.parse(arrayBuffer);
                    result.headers = excelResult.headers;
                    result.data = excelResult.data;
                    break;

                default:
                    throw new Error(`不支持的文件格式: ${extension}`);
            }
        } catch (error) {
            result.errors.push(error.message);
        }

        return result;
    }

    parseText(text, format = 'csv') {
        switch (format) {
            case 'csv':
                this.csvParser.delimiter = this.csvParser.detectDelimiter(text);
                return this.csvParser.parse(text);
            case 'json':
                return this.jsonParser.parse(text);
            default:
                throw new Error(`不支持的格式: ${format}`);
        }
    }

    _getExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }

    _readAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsText(file, 'utf-8');
        });
    }

    _readAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsArrayBuffer(file);
        });
    }
}

export const fileParser = new FileParser();
