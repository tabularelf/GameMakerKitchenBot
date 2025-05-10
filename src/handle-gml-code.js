const { execFile } = require('node:child_process');
const { join } = require('node:path');
const { writeFile, readFile, unlink } = require('node:fs/promises');

const goboDirectory = join(join(__dirname, "../"), 'tools/gobo');
var goboExecutable = '';
var fileIndex = 0;

switch (process.platform) {
  case 'win32':
    goboExecutable = join(goboDirectory, 'gobo.exe');
    break;
  case 'linux':
    goboExecutable = join(goboDirectory, 'gobo-ubuntu');
    break;
  case 'darwin':
    goboExecutable = join(goboDirectory, 'gobo-mac');
    break;
  default:
    console.warn('Warning: Gobo is not supported on this platform');
    break;
}

if (goboExecutable != '') {
    console.log(`Selected gobo executable "${goboExecutable}"`);
}

module.exports = async function(message, forceParse = false) {
    var codes = [];
    if (forceParse) {
        codes.push({
            code: message.content,
            lang: 'gml'
        });
    } else {
        for(let code of parseCodeBlocks(message.content, 'gml')) {
            codes.push(code)
        };
    }
    
    const results = await Promise.all(codes.map(code => new Promise(async resolve => {
        if (++fileIndex > 1000) fileIndex = 0;

        const filePath = join(goboDirectory, `code-${message.id}-${fileIndex}.gml`);
        const cleanup = async () => {
          await unlink(filePath).catch(() => null);
        };
        
        const writeResult = await writeFile(filePath, code.code).catch(() => null);
        if (writeResult === null) {
          resolve({ success: false, message: 'Failed to write file' });
          return;
        }

        const execResult = await (new Promise(resolve => {
            execFile(goboExecutable, [filePath], (error, stdout, stderr) => {
                if (error) {
                    resolve({ success: false, message: error.message, exec: { stdout, stderr } });
                    return;
                }
        
                resolve({ success: true, message: stdout,  exec: { stdout, stderr }  });
            });
        }));

        if (!execResult.success) {
            await cleanup();
            resolve(execResult);
            return;
        }

        const { exec } = execResult;

        if (exec.stderr.startsWith('[')) {
            resolve({ success: false, message: `❌ [Error]\n\`\`\`\n${exec.stderr.split('\n').splice(1).join('\n')}\n\`\`\``, formattingError: true })
            } else {
                const readResult = await readFile(filePath, 'utf-8').catch(() => null);
            if (readResult === null) {
                resolve({ success: false, message: 'Failed to read file', exec });
                return;
            }
            
            await cleanup();
            resolve({ success: true, message: readResult, exec });
        }
    })));

    const outputCodes = results.filter(result => result.success).map(({ message }) => message);
    
    if (outputCodes.length > 0) {
        const codeConcats = outputCodes.map(outputCode => `\`\`\`gml\n${outputCode}\`\`\``);
        const outputMessage = codeConcats.join('\n');
        if (outputMessage.length < 2000) {
          await message.reply({content: outputMessage, allowedMentions: {repliedUser: false}});
        } else {
          for (const codeConcat of codeConcats) {
            if (codeConcat.length < 2000) {
                await message.reply({content: codeConcat, allowedMentions: {repliedUser: false}});
            } else {
                await message.reply({content: `Code block was too long. Got ${codeConcat.length}, expected 2000 or less.`, allowedMentions: {repliedUser: false}})
            }
          }
        }
      }
}

const codeBlockRegExp = '```([a-z0-9\\._\\-+]*)(?:\\n|\\r)([\\s\\S]*?)\\n```';

function parseCodeBlocks(str, langFilter) {
  const regExp = new RegExp(codeBlockRegExp, 'g');
  const results = [];
  
  let match;
  while (match = regExp.exec(str)) {
    results.push({
      lang: match[1],
      code: match[2]
    });
  }

  if (langFilter) return results.filter(result => result.lang === langFilter);
  return results;
}