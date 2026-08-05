import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const [html,css,js]=await Promise.all([
  readFile(new URL('index.html',root),'utf8'),
  readFile(new URL('app.css',root),'utf8'),
  readFile(new URL('app.js',root),'utf8')
]);

test('shell HTML tem idioma, viewport, CSP e scripts externos',()=>{
  assert.match(html,/^<!doctype html>/i);
  assert.match(html,/<html lang="pt-BR">/);
  assert.match(html,/name="viewport"/);
  assert.match(html,/Content-Security-Policy/);
  assert.match(html,/script-src 'self'/);
  assert.match(html,/<link rel="stylesheet" href="app\.css">/);
  assert.match(html,/<script src="app\.js" defer><\/script>/);
  assert.doesNotMatch(html,/<script(?![^>]*src=)[^>]*>/i);
});

test('shell expõe navegação semântica, salto e diálogo acessível',()=>{
  assert.match(html,/class="skip-link" href="#main"/);
  assert.match(html,/<nav id="nav" aria-label=/);
  assert.match(html,/<main id="main" tabindex="-1">/);
  assert.match(html,/id="docview" role="dialog" aria-modal="true"/);
  assert.match(html,/id="app-status" role="status" aria-live="polite"/);
});

test('CSS preserva alvos táteis, foco, movimento reduzido e mobile sem overflow global',()=>{
  assert.match(css,/nav button[^}]*min-height:44px/s);
  assert.match(css,/\.x[^}]*min-width:44px[^}]*min-height:44px/s);
  assert.match(css,/outline:3px solid var\(--accent\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/nav\{flex-direction:row;flex-wrap:nowrap[^}]*overflow-x:auto/s);
});

test('JavaScript compila e mantém a versão de dados atual',()=>{
  assert.doesNotThrow(()=>new Function(js));
  assert.match(js,/const DB_VERSION=4;/);
});

test('OS operacional tem navegação, abas e fluxo de acompanhamento completo',()=>{
  assert.match(js,/\['ordens','Ordens de serviço','op'\]/);
  assert.match(js,/id="f-os-operacional"/);
  assert.match(js,/role="tablist" aria-label="Filtrar ordens por situação"/);
  assert.match(js,/id="f-os-apontamento"/);
  assert.match(js,/id="f-os-check"/);
  assert.match(js,/planejada:\['em_execucao','cancelada'\]/);
  assert.match(js,/em_execucao:\['pausada','concluida','cancelada'\]/);
  assert.match(js,/F\(db\.os\)\.filter\(o=>o\.talhaoId===t\.id\)/);
  assert.match(js,/F\(db\.os\)\.filter\(o=>o\.talhaoId===t\.id&&o\.status==='concluida'\)/);
});

test('migração converte OS antigas sem perder descrição, máquina e custos',()=>{
  const start=js.indexOf('const OS_STATUS=');
  const end=js.indexOf('function validateDatabaseIntegrity',start);
  const context={result:null};vm.createContext(context);
  vm.runInContext(`const uid=()=>Math.random().toString(36).slice(2);${js.slice(start,end)};
    const next={os:[{id:'old',data:'2026-07-02',maqId:'m1',tipo:'Corretiva',desc:'Trocar correia',pecas:400,mo:150,status:'aberta'}]};
    normalizeOperationalOrders(next,{strict:true});result=next.os[0];`,context);
  assert.equal(context.result.status,'planejada');
  assert.equal(context.result.titulo,'Trocar correia');
  assert.equal(context.result.maqId,'m1');
  assert.equal(context.result.pecas,400);
  assert.equal(context.result.mo,150);
  assert.match(context.result.codigo,/^OS-2026-\d{3}$/);
});

test('cálculo de carga nunca produz peso ou receita negativos',()=>{
  const start=js.indexOf('function cargaCalc');
  const end=js.indexOf('/* ano-safra',start);
  const context={result:null};vm.createContext(context);
  vm.runInContext(`${js.slice(start,end)};result=[
    cargaCalc({bruto:1000,tara:1500,umidade:80,preco:100}),
    cargaCalc({bruto:42000,tara:15000,umidade:15,preco:60}),
    cargaErrors({bruto:1000,tara:1500,umidade:80,preco:0})
  ];`,context);
  assert.equal(context.result[0].liq,0);
  assert.equal(context.result[0].valor,0);
  assert.ok(context.result[1].sacas>0);
  assert.ok(context.result[2].length>=3);
});

test('saldo de café respeita vendas vinculadas e total beneficiado',()=>{
  const start=js.indexOf('const sacasDisponiveis=');
  const end=js.indexOf('/* ============ gráficos',start);
  const context={db:{lotes:[{id:'l1',sacas:46},{id:'l2',sacas:10}],vendasCafe:[{loteId:'l1',sacas:30},{sacas:5}]},result:null};
  vm.createContext(context);
  vm.runInContext(`${js.slice(start,end)};result=[sacasDisponiveis('l1'),estoqueCafeDisponivel()];`,context);
  assert.deepEqual(Array.from(context.result),[16,21]);
});

test('mutações críticas mantêm confirmação, recuperação e vínculos',()=>{
  assert.match(js,/await beginUndo\('Exclusão de registro'/);
  assert.match(js,/confirm\(`Excluir permanentemente/);
  assert.match(js,/Gerenciado pela origem/);
  assert.match(js,/restoreRecovery\(\{preserveUndo:true\}\)/);
  assert.match(js,/format:'gefaz360-backup'/);
  assert.match(js,/missingFileIds/);
  assert.match(js,/validateDatabaseIntegrity/);
});
