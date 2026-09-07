import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

const source=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
// Executa os handlers reais; somente APIs do navegador e renderização são simuladas.
function setup(initial=null){
  const events={},storage=new Map(initial===null?[]:[['pvgest-erp-v1',initial]]),files=new Map();
  const elements=new Map();
  const window={addEventListener(){}};window.top=window;window.self=window;
  const context=vm.createContext({window,document:{getElementById(id){
    if(!elements.has(id))elements.set(id,{addEventListener:(type,fn)=>events[id+':'+type]=fn,style:{}});
    return elements.get(id);
  },addEventListener(){}},location:{hash:'#dash'},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},
  Blob,atob,Uint8Array,setTimeout,clearTimeout,confirm:()=>true,files});
  vm.runInContext(source.replace(/render\(\);\s*$/,
    'globalThis.realRender=render;render=()=>{};showStatus=()=>{};clearFormError=()=>{};showFormError=(f,e)=>{globalThis.errors=e};filePut=async(id,blob)=>files.set(id,blob);fileGet=async id=>files.get(id);fileDel=async id=>files.delete(id);'),context);
  const run=s=>vm.runInContext(s,context);
  const click=async(action,col,id)=>events['main:click']({target:{closest:()=>({dataset:{action,col,id}})}});
  const submit=async(id,values,editId)=>{
    const elements=Object.entries(values).map(([name,value])=>({name,value:String(value),tagName:'INPUT',type:'text',labels:[]}));
    for(const el of elements)elements[el.name]=el;
    return events['main:submit']({preventDefault(){},target:{id,elements,dataset:editId?{editId}:{},hasAttribute:()=>false}});
  };
  return {run,click,submit,storage,files,elements};
}
function importFixture(){
  const a=setup();
  a.run("db=normalizeDatabase(seed());db.documentos=[{id:'d1',mime:'image/png'}];globalThis.candidate=JSON.parse(JSON.stringify(db));");
  a.files.set('d1',new Blob(['ORIGINAL'],{type:'image/png'}));
  return a;
}
const importValid="importBackupPayload({format:'gefaz360-backup',version:4,db:candidate,files:[{id:'d1',data:'data:image/png;base64,Tk9WTw=='}]})";

test('vendas vinculadas respeitam o saldo global e aceitam o limite disponível',async()=>{
  const a=setup();a.run("db.lotes=[{id:'l1',sacas:100}];db.vendasCafe=[{id:'v1',sacas:80,loteId:''}];db.fin=[];");
  await a.submit('f-vcafe',{data:'2026-09-07',loteId:'l1',sacas:50,preco:1000});
  assert.equal(a.run('db.vendasCafe.length'),1);assert.equal(a.run('db.fin.length'),0);
  await a.submit('f-vcafe',{data:'2026-09-07',loteId:'l1',sacas:20,preco:1000});
  assert.equal(a.run('db.vendasCafe.reduce((s,v)=>s+v.sacas,0)'),100);
  assert.equal(a.run('db.fin[0].valor'),20000);
});

test('venda também respeita saldo individual quando há saldo global',async()=>{
  const a=setup();a.run("db.lotes=[{id:'l1',sacas:10},{id:'l2',sacas:100}];db.vendasCafe=[];db.fin=[];");
  await a.submit('f-vcafe',{data:'2026-09-07',loteId:'l1',sacas:20,preco:1000});
  assert.equal(a.run('db.vendasCafe.length'),0);
});

test('receita agrega produto repetido antes de verificar e baixar estoque',async()=>{
  const a=setup();a.run("db.defensivos=[{id:'p1',nome:'Teste',qtd:10,preco:2}];db.receitas=[{id:'r1',nome:'Teste',itens:[{prodId:'p1',dose:6},{prodId:'p1',dose:6}]}];db.pulvOS=[{id:'o1',receitaId:'r1',talhaoId:'t1',area:1,status:'aberta'}];db.fin=[];");
  await a.click('concluir-pos',null,'o1');assert.equal(a.run('db.defensivos[0].qtd'),10);
  assert.equal(a.run('db.pulvOS[0].status'),'aberta');assert.equal(a.run('db.fin.length'),0);
  a.run('db.defensivos[0].qtd=12');await a.click('concluir-pos',null,'o1');
  assert.equal(a.run('db.defensivos[0].qtd'),0);assert.equal(a.run('db.fin[0].valor'),24);
});

test('backup inválido não escreve anexos nem substitui banco',async()=>{
  const a=importFixture();const before=a.run('JSON.stringify(db)');
  await assert.rejects(a.run("importBackupPayload({format:'gefaz360-backup',version:4,db:candidate,files:[{id:'d1',data:'data:image/png;base64,Tk9WTw=='},{id:'inexistente',data:'data:image/png;base64,WA=='}]})"),/sem metadados/);
  assert.equal(await a.files.get('d1').text(),'ORIGINAL');assert.equal(a.files.size,1);
  assert.equal(a.run('JSON.stringify(db)'),before);
});

test('importação válida preserva anexos do ponto de recuperação após recarregar',async()=>{
  const a=importFixture();await a.run(importValid);
  const id=a.run('db.documentos[0].id');assert.notEqual(id,'d1');assert.equal(await a.files.get(id).text(),'NOVO');
  const fresh=setup(a.storage.get('pvgest-erp-v1'));
  fresh.storage.set('pvgest-erp-v1-recovery',a.storage.get('pvgest-erp-v1-recovery'));
  for(const [key,value] of a.files)fresh.files.set(key,value);
  fresh.run('restoreRecovery()');assert.equal(fresh.run('db.documentos[0].id'),'d1');
  assert.equal(await fresh.files.get('d1').text(),'ORIGINAL');
});

test('falha ao gravar banco importado remove temporários e mantém original',async()=>{
  const a=importFixture();const before=a.run('JSON.stringify(db)');
  a.run("const putStorage=localStorage.setItem;localStorage.setItem=(k,v)=>{if(k===LS)throw new Error('quota');putStorage(k,v)}");
  await assert.rejects(a.run(importValid),/gravar/);
  assert.equal(await a.files.get('d1').text(),'ORIGINAL');assert.equal(a.files.size,1);
  assert.equal(a.run('JSON.stringify(db)'),before);
});

test('falha no segundo anexo limpa o primeiro arquivo preparado',async()=>{
  const a=importFixture();a.run("candidate.documentos.push({id:'d2',mime:'image/png'});let writes=0;filePut=async(id,blob)=>{if(++writes===2)throw new Error('disk full');files.set(id,blob)}");
  await assert.rejects(a.run("importBackupPayload({format:'gefaz360-backup',version:4,db:candidate,files:[{id:'d1',data:'data:image/png;base64,Tk9WTw=='},{id:'d2',data:'data:image/png;base64,WA=='}]})"),/disk full/);
  assert.equal(a.files.size,1);assert.equal(await a.files.get('d1').text(),'ORIGINAL');
});

test('exclusão de documento é recuperável em uma nova sessão',async()=>{
  const a=importFixture();await a.click('del','documentos','d1');assert.equal(a.run('db.documentos.length'),0);
  const fresh=setup(a.storage.get('pvgest-erp-v1'));
  fresh.storage.set('pvgest-erp-v1-recovery',a.storage.get('pvgest-erp-v1-recovery'));
  for(const [id,blob] of a.files)fresh.files.set(id,blob);
  fresh.run('restoreRecovery()');assert.equal(fresh.run('db.documentos.length'),1);
  assert.equal(await fresh.files.get('d1').text(),'ORIGINAL');
});

test('documento não é excluído se não for possível criar recuperação',async()=>{
  const a=importFixture();a.run("localStorage.setItem=()=>{throw new Error('quota')}");
  await a.click('del','documentos','d1');assert.equal(a.run('db.documentos.length'),1);
  assert.equal(await a.files.get('d1').text(),'ORIGINAL');
});

test('medições processadas não podem ser editadas nem excluídas',async()=>{
  for(const flag of ['acertada','consolidada']){
    const a=setup();a.run(`db.medicoes=[{id:'m1',data:'2026-09-07',medidas:10,valorMedida:10,${flag}:true}]`);
    await a.submit('f-med',{medidas:20},'m1');await a.click('del','medicoes','m1');
    assert.equal(a.run('db.medicoes.length'),1);assert.equal(a.run('db.medicoes[0].medidas'),10);
  }
});

test('medições ainda abertas continuam editáveis e removíveis',async()=>{
  const a=setup();a.run("db.medicoes=[{id:'m1',data:'2026-09-07',medidas:10,valorMedida:10,acertada:false,consolidada:false}]");
  await a.submit('f-med',{medidas:20,valorMedida:10},'m1');assert.equal(a.run('db.medicoes[0].medidas'),20);
  await a.click('del','medicoes','m1');assert.equal(a.run('db.medicoes.length'),0);
});

test('documentos bloqueiam exclusão de talhão e preservam banco reimportável',async()=>{
  const a=setup();a.run("db=normalizeDatabase(seed());db.talhoes.push({id:'t-isolado',nome:'Teste',cultura:'cafe',area:1});db.documentos=[{id:'d1',mime:'image/png',talhaoId:'t-isolado'}]");
  await a.click('del','talhoes','t-isolado');assert.equal(a.run("db.talhoes.some(t=>t.id==='t-isolado')"),true);
  assert.doesNotThrow(()=>a.run('normalizeDatabase(db,{strict:true})'));
});

test('erro de leitura bloqueia gravações e mostra recuperação sem dados demonstrativos',async()=>{
  for(const initial of ['{invalid',JSON.stringify({params:{},talhoes:[{id:'real',nome:'Real'}],os:[{id:'os1',checklist:{}}]})]){
    const a=setup(initial);assert.equal(a.run('save()'),false);
    await a.submit('f-chuva',{data:'2026-09-07',mm:10});await a.click('reset');
    assert.equal(a.storage.get('pvgest-erp-v1'),initial);assert.equal(a.run('db.talhoes.length'),0);
    a.run('realRender()');assert.match(a.elements.get('main').innerHTML,/Recuperar dados/);
  }
});

test('recuperação explícita preserva bytes ilegíveis antes de substituir banco',async()=>{
  const a=setup('{invalid');a.run('globalThis.candidate=normalizeDatabase(seed())');
  await a.run('importBackupPayload(candidate)');assert.equal(a.storage.get('pvgest-erp-v1-unread'),'{invalid');
  assert.equal(a.run('loadError'),'');assert.ok(a.run('db.talhoes.length')>0);
});

test('recuperação é abortada se a cópia do original não puder ser preservada',async()=>{
  const a=setup('{invalid');a.run("globalThis.candidate=normalizeDatabase(seed());localStorage.setItem=()=>{throw new Error('quota')}");
  await assert.rejects(a.run('importBackupPayload(candidate)'),/gravar/);
  assert.equal(a.storage.get('pvgest-erp-v1'),'{invalid');assert.ok(a.run('loadError'));
});
