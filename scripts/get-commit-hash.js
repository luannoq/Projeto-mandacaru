/**
 * Gera constants/commit.json com o hash do commit atual do Git.
 *
 * A tela "Sobre o App" lê esse arquivo para exibir o commit de referência,
 * atendendo ao requisito de publicação da disciplina (a versão publicada deve
 * corresponder exatamente ao código-fonte enviado).
 *
 * Rode antes de cada build/publicação:
 *   npm run commit-hash
 */
const { execSync } = require('node:child_process');
const { writeFileSync } = require('node:fs');
const { join } = require('node:path');

function git(args, fallback) {
  try {
    return execSync(`git ${args}`, { encoding: 'utf8' }).trim();
  } catch {
    return fallback;
  }
}

const hash = git('rev-parse --short HEAD', 'dev');
const fullHash = git('rev-parse HEAD', 'dev');
const date = git('log -1 --format=%cI', '');

const destino = join(__dirname, '..', 'constants', 'commit.json');
const conteudo = JSON.stringify({ hash, fullHash, date }, null, 2) + '\n';

writeFileSync(destino, conteudo, 'utf8');
console.log(`✓ constants/commit.json atualizado → #${hash} (${date || 'sem data'})`);
