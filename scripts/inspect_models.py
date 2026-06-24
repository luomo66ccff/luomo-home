import json
from pathlib import Path

base = Path('/opt/luomo-home/public/live2d')
models = {
    'atri': base / 'atri/atri_8.model3.json',
    'murasame': base / 'companions/murasame/Murasame.model3.json',
    'allium': base / 'companions/allium/ariu/ariu.model3.json',
}

output_lines = ['# Live2D Model Capabilities\n']

for name, path in models.items():
    output_lines.append('\n## ' + name.upper() + '\n')
    output_lines.append('Path: ' + str(path) + '\n\n')
    if not path.exists():
        output_lines.append('**MISSING**\n\n')
        continue
    data = json.loads(path.read_text(encoding='utf-8'))
    refs = data.get('FileReferences', {})
    
    # Expressions
    exprs = refs.get('Expressions', [])
    output_lines.append('### Expressions (' + str(len(exprs)) + ')\n')
    if exprs:
        for e in exprs:
            n = e.get('Name') or e.get('File') or 'unnamed'
            output_lines.append('- ' + n + '\n')
    else:
        output_lines.append('- (none)\n')
    output_lines.append('\n')
    
    # Motions
    motions = refs.get('Motions', {})
    mot_count = 0
    output_lines.append('### Motions\n')
    for gname, mlist in motions.items():
        for m in mlist:
            f = m.get('File', '')
            output_lines.append('- group=' + gname + ' file=' + f.replace('.motion3.json', '') + '\n')
            mot_count += 1
    if mot_count == 0:
        output_lines.append('- (none)\n')
    output_lines.append('\n')
    
    # Parameters from CDI
    cdi_file = refs.get('DisplayInfo')
    if cdi_file:
        cdi_path = path.parent / cdi_file
        if cdi_path.exists():
            cdi = json.loads(cdi_path.read_text(encoding='utf-8'))
            params = cdi.get('Parameters', [])
            output_lines.append('### Parameters (' + str(len(params)) + ')\n')
            for p in params:
                pid = p.get('Id', '?')
                pname = p.get('Name', '')
                if pname:
                    output_lines.append('- ' + pid + ' = ' + pname + '\n')
            output_lines.append('\n')
    
    # Summary
    exp_names = [e.get('Name') or 'unnamed' for e in exprs]
    mot_groups = list(motions.keys())
    output_lines.append('### Summary\n')
    output_lines.append('- Expression names: ' + ', '.join(exp_names) + '\n')
    output_lines.append('- Motion groups: ' + ', '.join(mot_groups) + '\n')
    output_lines.append('- Motion count: ' + str(mot_count) + '\n\n')

md_path = Path('/opt/luomo-home/docs/live2d-model-capabilities.md')
md_path.parent.mkdir(parents=True, exist_ok=True)
md_path.write_text(''.join(output_lines), encoding='utf-8')
print('Written to ' + str(md_path))
print('Output length: ' + str(len(''.join(output_lines))))

# Also print key data for reference
for name, path in models.items():
    if not path.exists(): continue
    data = json.loads(path.read_text(encoding='utf-8'))
    refs = data.get('FileReferences', {})
    print('\n=== ' + name.upper() + ' ===')
    exprs = refs.get('Expressions', [])
    print('Expressions: ' + ', '.join([e.get('Name') or 'unnamed' for e in exprs]))
    motions = refs.get('Motions', {})
    print('Motion groups: ' + ', '.join(list(motions.keys())))
    mot_files = []
    for gname, mlist in motions.items():
        for m in mlist:
            f = m.get('File', '')
            mot_files.append(gname + ' (' + f.replace('.motion3.json', '') + ')')
    print('Motions (' + str(len(mot_files)) + '): ' + ' | '.join(mot_files[:6]))