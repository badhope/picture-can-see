"""
BlockStudio - 可视化编程积木搭建平台
提供直观的积木拖拽、代码组合、项目管理功能
"""
import os
import json
import uuid
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = 'block-studio-secret-key-2024'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['PROJECT_FOLDER'] = 'projects'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

CORS(app)

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['PROJECT_FOLDER'], exist_ok=True)
os.makedirs('static/images', exist_ok=True)

BLOCK_CATEGORIES = {
    'variables': {
        'name': '变量',
        'icon': '🔤',
        'color': '#FF6B35',
        'blocks': [
            {'id': 'var_a', 'name': '变量 a', 'description': '变量a', 'inputs': [], 'outputs': ['value'], 'varName': 'a'},
            {'id': 'var_b', 'name': '变量 b', 'description': '变量b', 'inputs': [], 'outputs': ['value'], 'varName': 'b'},
            {'id': 'var_c', 'name': '变量 c', 'description': '变量c', 'inputs': [], 'outputs': ['value'], 'varName': 'c'},
            {'id': 'var_x', 'name': '变量 x', 'description': '变量x', 'inputs': [], 'outputs': ['value'], 'varName': 'x'},
            {'id': 'var_y', 'name': '变量 y', 'description': '变量y', 'inputs': [], 'outputs': ['value'], 'varName': 'y'},
            {'id': 'var_time', 'name': '"60分钟"', 'description': '文本值', 'inputs': [], 'outputs': ['value'], 'varName': '60分钟', 'isText': True},
            {'id': 'var_hello', 'name': '"你好"', 'description': '文本值', 'inputs': [], 'outputs': ['value'], 'varName': '你好', 'isText': True},
            {'id': 'var_world', 'name': '"世界"', 'description': '文本值', 'inputs': [], 'outputs': ['value'], 'varName': '世界', 'isText': True},
            {'id': 'number_0', 'name': '数字 0', 'description': '数字0', 'inputs': [], 'outputs': ['value'], 'varName': '0', 'isNumber': True},
            {'id': 'number_1', 'name': '数字 1', 'description': '数字1', 'inputs': [], 'outputs': ['value'], 'varName': '1', 'isNumber': True},
            {'id': 'number_10', 'name': '数字 10', 'description': '数字10', 'inputs': [], 'outputs': ['value'], 'varName': '10', 'isNumber': True},
            {'id': 'number_60', 'name': '数字 60', 'description': '数字60', 'inputs': [], 'outputs': ['value'], 'varName': '60', 'isNumber': True},
            {'id': 'number_100', 'name': '数字 100', 'description': '数字100', 'inputs': [], 'outputs': ['value'], 'varName': '100', 'isNumber': True},
        ]
    },
    'operators': {
        'name': '运算符',
        'icon': '➗',
        'color': '#4ECDC4',
        'blocks': [
            {'id': 'op_add', 'name': '加法 +', 'description': '加法运算', 'inputs': ['a', 'b'], 'outputs': ['result'], 'operator': '+'},
            {'id': 'op_sub', 'name': '减法 -', 'description': '减法运算', 'inputs': ['a', 'b'], 'outputs': ['result'], 'operator': '-'},
            {'id': 'op_mul', 'name': '乘法 ×', 'description': '乘法运算', 'inputs': ['a', 'b'], 'outputs': ['result'], 'operator': '*'},
            {'id': 'op_div', 'name': '除法 ÷', 'description': '除法运算', 'inputs': ['a', 'b'], 'outputs': ['result'], 'operator': '/'},
            {'id': 'op_mod', 'name': '取余 %', 'description': '取模运算', 'inputs': ['a', 'b'], 'outputs': ['result'], 'operator': '%'},
            {'id': 'op_power', 'name': '幂运算 ^', 'description': '乘方运算', 'inputs': ['base', 'exp'], 'outputs': ['result'], 'operator': '**'},
            {'id': 'op_eq', 'name': '等于 ==', 'description': '相等判断', 'inputs': ['a', 'b'], 'outputs': ['result'], 'operator': '=='},
            {'id': 'op_neq', 'name': '不等于 !=', 'description': '不等判断', 'inputs': ['a', 'b'], 'outputs': ['result'], 'operator': '!='},
            {'id': 'op_gt', 'name': '大于 >', 'description': '大于判断', 'inputs': ['a', 'b'], 'outputs': ['result'], 'operator': '>'},
            {'id': 'op_lt', 'name': '小于 <', 'description': '小于判断', 'inputs': ['a', 'b'], 'outputs': ['result'], 'operator': '<'},
            {'id': 'op_and', 'name': '并且 AND', 'description': '逻辑与', 'inputs': ['a', 'b'], 'outputs': ['result'], 'operator': '&&'},
            {'id': 'op_or', 'name': '或者 OR', 'description': '逻辑或', 'inputs': ['a', 'b'], 'outputs': ['result'], 'operator': '||'},
        ]
    },
    'logic': {
        'name': '逻辑控制',
        'icon': '🔀',
        'color': '#5C7AEA',
        'blocks': [
            {'id': 'print', 'name': '打印', 'description': '输出信息', 'inputs': ['value'], 'outputs': []},
            {'id': 'if', 'name': '如果', 'description': '条件判断', 'inputs': ['condition'], 'outputs': ['then', 'else']},
            {'id': 'if_else', 'name': '如果...否则', 'description': '条件分支', 'inputs': ['condition'], 'outputs': ['then', 'else']},
            {'id': 'switch', 'name': '分支选择', 'description': '多条件分支', 'inputs': ['value'], 'outputs': ['case1', 'case2', 'case3', 'default']},
            {'id': 'for', 'name': '循环', 'description': '指定次数循环', 'inputs': ['times'], 'outputs': ['body']},
            {'id': 'while', 'name': '当...时', 'description': '条件循环', 'inputs': ['condition'], 'outputs': ['body']},
            {'id': 'foreach', 'name': '遍历', 'description': '遍历集合', 'inputs': ['collection'], 'outputs': ['item', 'body']},
        ]
    },
    'data': {
        'name': '数据处理',
        'icon': '📦',
        'color': '#26a69a',
        'blocks': [
            {'id': 'variable_get', 'name': '获取变量', 'description': '读取变量值', 'inputs': ['name'], 'outputs': ['value']},
            {'id': 'variable_set', 'name': '设置变量', 'description': '修改变量值', 'inputs': ['name', 'value'], 'outputs': []},
            {'id': 'list_create', 'name': '创建列表', 'description': '新建列表', 'inputs': ['name'], 'outputs': ['list']},
            {'id': 'list_add', 'name': '添加元素', 'description': '添加到列表', 'inputs': ['list', 'item'], 'outputs': []},
            {'id': 'list_get', 'name': '获取元素', 'description': '获取列表元素', 'inputs': ['list', 'index'], 'outputs': ['item']},
            {'id': 'dict_create', 'name': '创建字典', 'description': '新建字典', 'inputs': ['name'], 'outputs': ['dict']},
            {'id': 'dict_get', 'name': '获取值', 'description': '获取字典值', 'inputs': ['dict', 'key'], 'outputs': ['value']},
        ]
    },
    'function': {
        'name': '函数模块',
        'icon': '🔧',
        'color': '#ef5350',
        'blocks': [
            {'id': 'function_def', 'name': '定义函数', 'description': '创建自定义函数', 'inputs': ['name', 'params'], 'outputs': ['body']},
            {'id': 'function_call', 'name': '调用函数', 'description': '执行函数', 'inputs': ['name', 'args'], 'outputs': ['result']},
            {'id': 'return', 'name': '返回', 'description': '返回结果', 'inputs': ['value'], 'outputs': []},
        ]
    },
    'input': {
        'name': '输入输出',
        'icon': '📥',
        'color': '#ab47bc',
        'blocks': [
            {'id': 'print', 'name': '打印', 'description': '输出信息', 'inputs': ['message'], 'outputs': []},
            {'id': 'input', 'name': '输入', 'description': '获取用户输入', 'inputs': ['prompt'], 'outputs': ['value']},
            {'id': 'file_read', 'name': '读取文件', 'description': '读取文件内容', 'inputs': ['path'], 'outputs': ['content']},
            {'id': 'file_write', 'name': '写入文件', 'description': '写入文件内容', 'inputs': ['path', 'content'], 'outputs': []},
            {'id': 'console_log', 'name': '控制台日志', 'description': '输出到控制台', 'inputs': ['message'], 'outputs': []},
        ]
    },
    'math': {
        'name': '数学运算',
        'icon': '🔢',
        'color': '#42a5f5',
        'blocks': [
            {'id': 'math_number', 'name': '数字', 'description': '数字常量', 'inputs': [], 'outputs': ['value'], 'fields': [{'name': 'value', 'type': 'number', 'default': 0}]},
            {'id': 'math_add', 'name': '加法', 'description': '两数相加', 'inputs': ['a', 'b'], 'outputs': ['result']},
            {'id': 'math_sub', 'name': '减法', 'description': '两数相减', 'inputs': ['a', 'b'], 'outputs': ['result']},
            {'id': 'math_mul', 'name': '乘法', 'description': '两数相乘', 'inputs': ['a', 'b'], 'outputs': ['result']},
            {'id': 'math_div', 'name': '除法', 'description': '两数相除', 'inputs': ['a', 'b'], 'outputs': ['result']},
            {'id': 'math_mod', 'name': '取余', 'description': '取模运算', 'inputs': ['a', 'b'], 'outputs': ['result']},
            {'id': 'math_power', 'name': '幂运算', 'description': '乘方计算', 'inputs': ['base', 'exp'], 'outputs': ['result']},
            {'id': 'math_sqrt', 'name': '平方根', 'description': '开平方', 'inputs': ['value'], 'outputs': ['result']},
            {'id': 'math_round', 'name': '四舍五入', 'description': '取整', 'inputs': ['value'], 'outputs': ['result']},
            {'id': 'math_abs', 'name': '绝对值', 'description': '取绝对值', 'inputs': ['value'], 'outputs': ['result']},
        ]
    },
    'text': {
        'name': '文本处理',
        'icon': '📝',
        'color': '#66bb6a',
        'blocks': [
            {'id': 'text_create', 'name': '文本', 'description': '文本常量', 'inputs': [], 'outputs': ['value'], 'fields': [{'name': 'value', 'type': 'text', 'default': ''}]},
            {'id': 'text_join', 'name': '拼接文本', 'description': '连接多个文本', 'inputs': ['a', 'b'], 'outputs': ['result']},
            {'id': 'text_split', 'name': '分割文本', 'description': '按分隔符分割', 'inputs': ['text', 'delimiter'], 'outputs': ['parts']},
            {'id': 'text_replace', 'name': '替换文本', 'description': '替换部分内容', 'inputs': ['text', 'old', 'new'], 'outputs': ['result']},
            {'id': 'text_length', 'name': '文本长度', 'description': '获取字符数', 'inputs': ['text'], 'outputs': ['length']},
            {'id': 'text_upper', 'name': '转大写', 'description': '转换为大写', 'inputs': ['text'], 'outputs': ['result']},
            {'id': 'text_lower', 'name': '转小写', 'description': '转换为小写', 'inputs': ['text'], 'outputs': ['result']},
        ]
    },
    'api': {
        'name': 'API调用',
        'icon': '🌐',
        'color': '#ffa726',
        'blocks': [
            {'id': 'api_request', 'name': 'API请求', 'description': '发送HTTP请求', 'inputs': ['url', 'method', 'headers', 'body'], 'outputs': ['response']},
            {'id': 'api_get', 'name': 'GET请求', 'description': '发送GET请求', 'inputs': ['url', 'params'], 'outputs': ['data']},
            {'id': 'api_post', 'name': 'POST请求', 'description': '发送POST请求', 'inputs': ['url', 'data'], 'outputs': ['data']},
            {'id': 'json_parse', 'name': '解析JSON', 'description': '解析JSON字符串', 'inputs': ['json_string'], 'outputs': ['data']},
            {'id': 'json_stringify', 'name': '转为JSON', 'description': '对象转JSON', 'inputs': ['data'], 'outputs': ['json_string']},
        ]
    },
    'ui': {
        'name': '界面组件',
        'icon': '🖼️',
        'color': '#ec407a',
        'blocks': [
            {'id': 'button', 'name': '按钮', 'description': '创建按钮', 'inputs': ['label', 'onclick'], 'outputs': ['element']},
            {'id': 'input_field', 'name': '输入框', 'description': '创建输入框', 'inputs': ['placeholder', 'onchange'], 'outputs': ['element', 'value']},
            {'id': 'textarea', 'name': '文本区域', 'description': '创建多行输入', 'inputs': ['placeholder', 'onchange'], 'outputs': ['element', 'value']},
            {'id': 'dropdown', 'name': '下拉菜单', 'description': '创建下拉选择', 'inputs': ['options', 'onchange'], 'outputs': ['element', 'value']},
            {'id': 'checkbox', 'name': '复选框', 'description': '创建复选框', 'inputs': ['label', 'checked', 'onchange'], 'outputs': ['element', 'checked']},
            {'id': 'label', 'name': '标签', 'description': '显示文本', 'inputs': ['text'], 'outputs': ['element']},
            {'id': 'divider', 'name': '分隔线', 'description': '视觉分隔', 'inputs': [], 'outputs': ['element']},
            {'id': 'container', 'name': '容器', 'description': '布局容器', 'inputs': ['children'], 'outputs': ['element']},
        ]
    },
    'media': {
        'name': '媒体处理',
        'icon': '🎬',
        'color': '#7e57c2',
        'blocks': [
            {'id': 'image_upload', 'name': '图片上传', 'description': '上传图片', 'inputs': ['onchange'], 'outputs': ['file', 'dataUrl']},
            {'id': 'image_display', 'name': '显示图片', 'description': '展示图片', 'inputs': ['src', 'alt'], 'outputs': ['element']},
            {'id': 'video_player', 'name': '视频播放器', 'description': '播放视频', 'inputs': ['src', 'controls'], 'outputs': ['element']},
            {'id': 'audio_player', 'name': '音频播放器', 'description': '播放音频', 'inputs': ['src', 'controls'], 'outputs': ['element']},
        ]
    },
    'database': {
        'name': '数据存储',
        'icon': '💾',
        'color': '#26c6da',
        'blocks': [
            {'id': 'db_save', 'name': '保存数据', 'description': '存储到数据库', 'inputs': ['collection', 'data'], 'outputs': ['id']},
            {'id': 'db_load', 'name': '加载数据', 'description': '从数据库读取', 'inputs': ['collection', 'id'], 'outputs': ['data']},
            {'id': 'db_query', 'name': '查询数据', 'description': '条件查询', 'inputs': ['collection', 'query'], 'outputs': ['results']},
            {'id': 'db_delete', 'name': '删除数据', 'description': '删除记录', 'inputs': ['collection', 'id'], 'outputs': []},
        ]
    }
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/info')
def info():
    return jsonify({
        'name': 'BlockStudio',
        'version': '1.0.0',
        'description': '可视化编程积木搭建平台'
    })

@app.route('/api/block_categories')
def get_block_categories():
    return jsonify(BLOCK_CATEGORIES)

@app.route('/api/projects')
def get_projects():
    projects = []
    for pid in os.listdir(app.config['PROJECT_FOLDER']):
        project_path = os.path.join(app.config['PROJECT_FOLDER'], pid)
        if os.path.isdir(project_path):
            meta_file = os.path.join(project_path, 'project.json')
            if os.path.exists(meta_file):
                with open(meta_file, 'r', encoding='utf-8') as f:
                    projects.append(json.load(f))
            else:
                projects.append({
                    'id': pid,
                    'name': pid,
                    'created': datetime.fromtimestamp(os.path.getctime(project_path)).isoformat(),
                    'modified': datetime.fromtimestamp(os.path.getmtime(project_path)).isoformat()
                })
    return jsonify({'projects': projects})

@app.route('/api/project/<project_id>', methods=['GET'])
def get_project(project_id):
    project_path = os.path.join(app.config['PROJECT_FOLDER'], project_id)
    if not os.path.exists(project_path):
        return jsonify({'error': 'Project not found'}), 404

    meta_file = os.path.join(project_path, 'project.json')
    blocks_file = os.path.join(project_path, 'blocks.json')

    project_data = {'id': project_id}
    if os.path.exists(meta_file):
        with open(meta_file, 'r', encoding='utf-8') as f:
            project_data.update(json.load(f))

    if os.path.exists(blocks_file):
        with open(blocks_file, 'r', encoding='utf-8') as f:
            project_data['blocks'] = json.load(f)
    else:
        project_data['blocks'] = []

    return jsonify(project_data)

@app.route('/api/project', methods=['POST'])
def create_project():
    data = request.json
    project_id = data.get('id') or str(uuid.uuid4())[:8]
    project_name = data.get('name', f'项目_{project_id}')

    project_path = os.path.join(app.config['PROJECT_FOLDER'], project_id)
    os.makedirs(project_path, exist_ok=True)

    project_meta = {
        'id': project_id,
        'name': project_name,
        'created': datetime.now().isoformat(),
        'modified': datetime.now().isoformat(),
        'description': data.get('description', ''),
        'tags': data.get('tags', [])
    }

    with open(os.path.join(project_path, 'project.json'), 'w', encoding='utf-8') as f:
        json.dump(project_meta, f, ensure_ascii=False, indent=2)

    return jsonify(project_meta)

@app.route('/api/project/<project_id>', methods=['PUT'])
def update_project(project_id):
    data = request.json
    project_path = os.path.join(app.config['PROJECT_FOLDER'], project_id)

    if not os.path.exists(project_path):
        return jsonify({'error': 'Project not found'}), 404

    meta_file = os.path.join(project_path, 'project.json')
    blocks_file = os.path.join(project_path, 'blocks.json')

    if os.path.exists(meta_file):
        with open(meta_file, 'r', encoding='utf-8') as f:
            project_meta = json.load(f)
    else:
        project_meta = {'id': project_id}

    project_meta['name'] = data.get('name', project_meta.get('name', '未命名项目'))
    project_meta['description'] = data.get('description', project_meta.get('description', ''))
    project_meta['tags'] = data.get('tags', project_meta.get('tags', []))
    project_meta['modified'] = datetime.now().isoformat()

    with open(meta_file, 'w', encoding='utf-8') as f:
        json.dump(project_meta, f, ensure_ascii=False, indent=2)

    if 'blocks' in data:
        with open(blocks_file, 'w', encoding='utf-8') as f:
            json.dump(data['blocks'], f, ensure_ascii=False, indent=2)

    return jsonify(project_meta)

@app.route('/api/project/<project_id>', methods=['DELETE'])
def delete_project(project_id):
    import shutil
    project_path = os.path.join(app.config['PROJECT_FOLDER'], project_id)

    if os.path.exists(project_path):
        shutil.rmtree(project_path)
        return jsonify({'success': True})
    return jsonify({'error': 'Project not found'}), 404

@app.route('/api/blocks/save', methods=['POST'])
def save_blocks():
    data = request.json
    project_id = data.get('project_id', 'default')
    blocks = data.get('blocks', [])

    project_path = os.path.join(app.config['PROJECT_FOLDER'], project_id)
    os.makedirs(project_path, exist_ok=True)

    blocks_file = os.path.join(project_path, 'blocks.json')
    with open(blocks_file, 'w', encoding='utf-8') as f:
        json.dump(blocks, f, ensure_ascii=False, indent=2)

    autosave_file = os.path.join(project_path, 'autosave.json')
    with open(autosave_file, 'w', encoding='utf-8') as f:
        json.dump({
            'blocks': blocks,
            'timestamp': datetime.now().isoformat()
        }, f, ensure_ascii=False, indent=2)

    return jsonify({'success': True, 'timestamp': datetime.now().isoformat()})

@app.route('/api/blocks/autoload', methods=['POST'])
def autoload_blocks():
    data = request.json
    project_id = data.get('project_id', 'default')
    project_path = os.path.join(app.config['PROJECT_FOLDER'], project_id)

    autosave_file = os.path.join(project_path, 'autosave.json')
    if os.path.exists(autosave_file):
        with open(autosave_file, 'r', encoding='utf-8') as f:
            return jsonify(json.load(f))

    blocks_file = os.path.join(project_path, 'blocks.json')
    if os.path.exists(blocks_file):
        with open(blocks_file, 'r', encoding='utf-8') as f:
            return jsonify({'blocks': json.load(f), 'timestamp': datetime.now().isoformat()})

    return jsonify({'blocks': [], 'timestamp': datetime.now().isoformat()})

@app.route('/api/export/code', methods=['POST'])
def export_code():
    data = request.json
    blocks = data.get('blocks', [])
    language = data.get('language', 'javascript')

    code = generate_code(blocks, language)
    return jsonify({'code': code, 'language': language})

@app.route('/api/validate/blocks', methods=['POST'])
def validate_blocks():
    data = request.json
    blocks = data.get('blocks', [])
    language = data.get('language', 'javascript')

    errors = []
    warnings = []

    block_map = {b['id']: b for b in blocks}
    connections = find_connections(blocks)

    orphan_blocks = []
    for block in blocks:
        is_orphan = True
        for conn in connections:
            if conn['from'] == block['id'] or conn['to'] == block['id']:
                is_orphan = False
                break
        if is_orphan and block.get('type', '').startswith('var_'):
            orphan_blocks.append({
                'blockId': block['id'],
                'name': block.get('name', ''),
                'message': f'变量积木"{block.get("name", "")}"未被使用'
            })

    if orphan_blocks:
        warnings.extend(orphan_blocks)

    for i, block in enumerate(blocks):
        if block.get('type') == 'print':
            conn_val = find_input_connection(block['id'], 'value', connections, block_map)
            if not conn_val:
                errors.append({
                    'blockId': block['id'],
                    'name': block.get('name', ''),
                    'message': f'打印积木"{block.get("name", "")}"没有连接输入值'
                })

        if block.get('type', '').startswith('op_'):
            conn_a = find_input_connection(block['id'], 'a', connections, block_map)
            conn_b = find_input_connection(block['id'], 'b', connections, block_map)
            if not conn_a or not conn_b:
                warnings.append({
                    'blockId': block['id'],
                    'name': block.get('name', ''),
                    'message': f'运算积木"{block.get("name", "")}"的输入可能不完整'
                })

    code = generate_code(blocks, language)
    syntax_valid = True
    syntax_error = None

    if language == 'javascript' and not code.startswith('//'):
        if '()' in code or '{}' in code or '[]' in code:
            pass
        else:
            syntax_valid = False
            syntax_error = '代码结构可能不完整'

    if language == 'python' and not code.startswith('#'):
        if 'def ' in code or 'print(' in code or '=' in code:
            pass
        else:
            syntax_valid = False
            syntax_error = '代码结构可能不完整'

    return jsonify({
        'valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings,
        'connectionCount': len(connections),
        'blockCount': len(blocks),
        'syntaxValid': syntax_valid,
        'syntaxError': syntax_error
    })

def generate_code(blocks, language='javascript'):
    if not blocks:
        return '// 暂无积木' if language == 'javascript' else '# 暂无积木'

    block_map = {b['id']: b for b in blocks}
    connections = find_connections(blocks)

    statements = []
    processed = set()

    root_blocks = find_root_blocks(blocks, connections)
    for root in root_blocks:
        code = generate_block_code(root['id'], block_map, connections, language, processed, 0)
        if code:
            statements.append(code)

    for block in blocks:
        if block['id'] not in processed:
            code = generate_block_code(block['id'], block_map, connections, language, processed, 0)
            if code:
                statements.append(code)

    if not statements:
        return '// 暂无可生成的代码' if language == 'javascript' else '# 暂无可生成的代码'

    if language == 'javascript':
        return '// Generated by BlockStudio\n\n' + '\n'.join(statements)
    else:
        return '# Generated by BlockStudio\n\n' + '\n'.join(statements)

def find_connections(blocks):
    if not blocks:
        return []

    connections = []
    threshold = 40
    block_width = 170
    block_height = 60
    grid_size = threshold * 2

    grid = {}
    for block in blocks:
        x, y = block.get('x', 0), block.get('y', 0)
        cell_x = int(x // grid_size)
        cell_y = int(y // grid_size)
        key = (cell_x, cell_y)
        if key not in grid:
            grid[key] = []
        grid[key].append(block)

    checked = set()

    for block_a in blocks:
        ax, ay = block_a.get('x', 0), block_a.get('y', 0)
        cell_ax, cell_ay = int(ax // grid_size), int(ay // grid_size)

        for dx in range(-2, 3):
            for dy in range(-2, 3):
                cell_key = (cell_ax + dx, cell_ay + dy)
                if cell_key not in grid:
                    continue

                for block_b in grid[cell_key]:
                    if block_a['id'] == block_b['id']:
                        continue

                    pair_key = (block_a['id'], block_b['id'])
                    if pair_key in checked:
                        continue
                    checked.add(pair_key)

                    bx, by = block_b.get('x', 0), block_b.get('y', 0)

                    if abs((ax + block_width) - bx) < threshold and abs((ay + block_height // 2) - by) < threshold:
                        connections.append({'from': block_a['id'], 'to': block_b['id'], 'type': 'right-left'})
                    elif abs(ax - bx) < threshold and abs((ay + block_height // 2) - by) < threshold:
                        connections.append({'from': block_b['id'], 'to': block_a['id'], 'type': 'right-left'})
                    elif abs((ay + block_height) - by) < threshold and abs((ax + block_width // 2) - bx) < threshold:
                        connections.append({'from': block_a['id'], 'to': block_b['id'], 'type': 'bottom-top'})
                    elif abs(ay - by) < threshold and abs((ax + block_width // 2) - bx) < threshold:
                        connections.append({'from': block_b['id'], 'to': block_a['id'], 'type': 'bottom-top'})

    return connections

def find_root_blocks(blocks, connections):
    blocks_with_input = set()
    for conn in connections:
        if conn['type'] == 'bottom-top':
            blocks_with_input.add(conn['to'])

    roots = []
    for block in blocks:
        if block['id'] not in blocks_with_input:
            roots.append(block)

    return sorted(roots, key=lambda b: (b.get('y', 0), b.get('x', 0)))

def generate_block_code(block_id, block_map, connections, language, processed, depth):
    if block_id in processed:
        return None

    block = block_map.get(block_id)
    if not block:
        return None

    processed.add(block_id)
    block_type = block.get('type', '')
    var_name = block.get('varName', '')
    operator = block.get('operator', '')

    if block_type.startswith('var_') or block_type.startswith('number_'):
        if block.get('isText'):
            return f'"{var_name}"'
        elif block.get('isNumber'):
            return str(var_name)
        else:
            return var_name

    if operator:
        conn_a = find_input_connection(block_id, 'a', connections, block_map)
        conn_b = find_input_connection(block_id, 'b', connections, block_map)

        a_val = ''
        if conn_a:
            a_val = generate_block_code(conn_a, block_map, connections, language, processed, depth + 1) or '0'

        b_val = ''
        if conn_b:
            b_val = generate_block_code(conn_b, block_map, connections, language, processed, depth + 1) or '0'

        if operator == '&&':
            op = ' && ' if language == 'javascript' else ' and '
        elif operator == '||':
            op = ' || ' if language == 'javascript' else ' or '
        elif operator == '**':
            op = '**'
        else:
            op = f' {operator} '

        return f'({a_val}{op}{b_val})'

    if block_type == 'print':
        conn_val = find_input_connection(block_id, 'value', connections, block_map)
        val = ''
        if conn_val:
            val = generate_block_code(conn_val, block_map, connections, language, processed, depth + 1)
        if not val:
            val = '""'

        if language == 'javascript':
            return f'console.log({val});'
        else:
            return f'print({val})'

    if block_type == 'variable_set':
        conn_name = find_input_connection(block_id, 'name', connections, block_map)
        conn_value = find_input_connection(block_id, 'value', connections, block_map)

        name = ''
        if conn_name:
            name = generate_block_code(conn_name, block_map, connections, language, processed, depth + 1)
        if not name:
            name = 'x'

        value = ''
        if conn_value:
            value = generate_block_code(conn_value, block_map, connections, language, processed, depth + 1)
        if not value:
            value = '0'

        if language == 'javascript':
            return f'let {name} = {value};'
        else:
            return f'{name} = {value}'

    return None

def find_input_connection(block_id, input_name, connections, block_map):
    for conn in connections:
        if conn['type'] == 'right-left' and conn['to'] == block_id:
            return conn['from']
    return None

@app.route('/api/import/file', methods=['POST'])
def import_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    filename = os.path.basename(file.filename)
    ext = os.path.splitext(filename)[1].lower()

    if ext == '.json':
        content = file.read().decode('utf-8')
        if len(content) > 1024 * 1024:
            return jsonify({'error': 'File too large'}), 400
        try:
            data = json.loads(content)
            if 'blocks' in data:
                return jsonify({'success': True, 'blocks': data['blocks'], 'type': 'json'})
            return jsonify({'success': True, 'data': data, 'type': 'json'})
        except json.JSONDecodeError:
            return jsonify({'error': 'Invalid JSON file'}), 400

    elif ext in ['.txt', '.md', '.csv']:
        content = file.read().decode('utf-8')
        if len(content) > 1024 * 1024:
            return jsonify({'error': 'File too large'}), 400
        return jsonify({'success': True, 'content': content, 'type': 'text'})

    elif ext in ['.js', '.py']:
        content = file.read().decode('utf-8')
        if len(content) > 512 * 1024:
            return jsonify({'error': 'File too large'}), 400
        return jsonify({'success': True, 'content': content, 'type': 'code'})

    else:
        return jsonify({'error': f'Unsupported file type: {ext}'}), 400

@app.route('/api/templates')
def get_templates():
    templates = [
        {
            'id': 'hello_world',
            'name': 'Hello World',
            'description': '最简单的输出示例',
            'blocks': [
                {'id': 'text_1', 'type': 'text_create', 'fields': {'value': 'Hello, World!'}},
                {'id': 'print_1', 'type': 'print', 'inputs': {'message': '@text_1'}}
            ]
        },
        {
            'id': 'calculator',
            'name': '计算器',
            'description': '简单四则运算',
            'blocks': [
                {'id': 'num1', 'type': 'math_number', 'fields': {'value': 10}},
                {'id': 'num2', 'type': 'math_number', 'fields': {'value': 5}},
                {'id': 'add', 'type': 'math_add', 'inputs': {'a': '@num1', 'b': '@num2'}},
                {'id': 'print_result', 'type': 'print', 'inputs': {'message': '@add'}}
            ]
        },
        {
            'id': 'data_processing',
            'name': '数据处理流程',
            'description': '读取、处理、输出数据',
            'blocks': [
                {'id': 'input_1', 'type': 'input', 'inputs': {'prompt': '"请输入数据"'}},
                {'id': 'print_input', 'type': 'print', 'inputs': {'message': '@input_1'}}
            ]
        }
    ]
    return jsonify({'templates': templates})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)