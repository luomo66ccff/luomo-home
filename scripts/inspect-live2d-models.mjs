import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const base = join(__dirname, 'public/live2d');

const models = {
  atri: join(base, 'atri/atri_8.model3.json'),
  murasame: join(base, 'companions/murasame/Murasame.model3.json'),
  allium: join(base, 'companions/allium/ariu/ariu.model3.json'),
};

var output = '# Live2D Model Capabilities\n\n',

for (const [name, path] of Object.entries(models)) {
  output += '## ' + name.toUpperCase() + '\n';
  output += '**Path:** ' + path + '\n\n';
  if (!existsSync(path)) {
    output += '**MISSING**\n\n';
    continue;
  }
  var data = JSON.parse(readFileSync(path, 'utf-8'));
  var refs = data.FileReferences || {};

  output += '### Expressions (' + (refs.Expressions?.length || 0) + ')\n';
  if (refs.Expressions?.length) {
    for (var exp of refs.Expressions) {
      output += '- ' + (exp.Name || exp.File) + '\n';
    }
  } else {
    output += '- (none)\n';
  }
  output += '\n';

  output += '### Motions\n';
  var motCount = 0;
  if (refs.Motions) {
    for (var [group, motions] of Object.entries(refs.Motions)) {
      for (var m of motions) {
        var f = m.File || '';
        output += '- ' + group + ' -> ' + f.replace('.motion3.json', '') + '\n';
        motCount++;
      }
    }
  }
  if (motCount === 0) {
    output += '- (none)\n';
  }
  output += '\n';

  var cdiFile = refs.DisplayInfo;
  if (cdiFile) {
    var cdiPath = join(dirname(path), cdiFile);
    if (existsSync(cdiPath)) {
      var cdi = JSON.parse(readFileSync(cdiPath, 'utf-8'));
      var params = cdi.Parameters || [];
      output += '### Parameters (' + params.length + ')\n';
      for (var p of params) {
        if (p.Name && p.Name.length > 0) {
          output += '- ' + p.Id + ' = ' + p.Name + '\n';
        }
      }
      output += '\n';

      // Check for form-like parameters
      var formParams = params.filter(function(p) {
        return p.Name && (p.Name.indexOf('衣') >= 0 || p.Name.indexOf('服') >= 0 ||
          p.Name.indexOf('着') >= 0 || p.Name.indexOf('装') >= 0 ||
          p.Name.indexOf('鞋') >= 0 || p.Name.indexOf('靴') >= 0 ||
          p.Name.indexOf('アクセ') >= 0 || p.Name.indexOf('小物') >= 0);
      });
      if (formParams.length > 0) {
        output += '### Potential Forms (' + formParams.length + ')\n';
        for (var fp of formParams) {
          output += '- ' + fp.Id + ' = ' + fp.Name + '\n';
        }
      } else {
        output += '### Potential Forms\n- **None detected** (no clothing/accessory parameters)\n';
      }
      output += '\n';
    }
  }

  // Summary
  var expList = (refs.Expressions || []).map(function(e) { return e.Name || 'unnamed'; });
  var motGroups = Object.keys(refs.Motions || {}).join(', ');
  output += '### Summary\n';
  output += '- Expression names: ' + expList.join(', ') + '\n';
  output += '- Motion groups: ' + motGroups + '\n';
  output += '- Motion count: ' + motCount + '\n\n';
}

var docsDir = join(__dirname, 'docs');
if (!existsSync(docsDir)) mkdirSync(docsDir, { recursive: true });
var mdPath = join(docsDir, 'live2d-model-capabilities.md');
writeFileSync(mdPath, output, 'utf-8');
console.log('Written to ' + mdPath);
console.log('Output length: ' + output.length);