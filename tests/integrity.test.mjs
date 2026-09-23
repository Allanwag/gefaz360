import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

const source=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
// Executa os handlers reais; somente APIs do navegador e renderização são simuladas.
function setup(initial=null){
  const events={},storage=new Map(initial===null?[]:[['pvgest-erp-v1',initial]]),files=new Map();
  const elements=new Map(),intervals=[];
  const window={addEventListener(){},scrollY:0,scrollTo(){}};window.top=window;window.self=window;
  const context=vm.createContext({window,document:{getElementById(id){
    if(!elements.has(id))elements.set(id,{addEventListener:(type,fn)=>events[id+':'+type]=fn,style:{}});
    return elements.get(id);
  },addEventListener(){}},location:{hash:'#dash'},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},
  Blob,atob,Uint8Array,setTimeout,clearTimeout,confirm:()=>true,files,navigator:{},
  // intervalos ficam registrados sem rodar: os testes os disparam à mão (e o processo não fica preso)
  setInterval:fn=>intervals.push(fn)});
  // O render() de nível superior é o único no início de linha; código depois dele (ex.: registro do
  // service worker) não pode impedir a troca pelos stubs.
  const boot=/^render\(\);\r?$/m;assert.match(source,boot,'app.js precisa terminar a inicialização com render(); em linha própria');
  vm.runInContext(source.replace(boot,
    'globalThis.realRender=render;render=()=>{};showStatus=()=>{};clearFormError=()=>{};showFormError=(f,e)=>{globalThis.errors=e};filePut=async(id,blob)=>files.set(id,blob);fileGet=async id=>files.get(id);fileDel=async id=>files.delete(id);'),context);
  const run=s=>vm.runInContext(s,context);
  // extra: propriedades do botão clicado (ex.: closest() até a linha da tabela)
  const click=async(action,col,id,extra={})=>events['main:click']({target:{closest:()=>({dataset:{action,col,id},...extra})}});
  const submit=async(id,values,editId)=>{
    const elements=Object.entries(values).map(([name,value])=>({name,value:String(value),tagName:'INPUT',type:'text',labels:[]}));
    for(const el of elements)elements[el.name]=el;
    return events['main:submit']({preventDefault(){},target:{id,elements,dataset:editId?{editId}:{},hasAttribute:()=>false}});
  };
  return {run,click,submit,storage,files,elements,intervals};
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

const osCampo={id:'o1',codigo:'OS-2026-101',data:'2026-09-01',prazo:'2026-09-05',titulo:'Reparo da cerca',desc:'Trocar mourões',
  modulo:'Campo',categoria:'Manutenção',talhaoId:'m1',maqId:'mq',meta:2.5,unidade:'km',tipo:'Serviço',prioridade:'normal',
  responsavelId:'',pecas:0,mo:0,status:'planejada',progresso:0,realizado:0,iniciadoEm:'',concluidoEm:'',checklist:[],apontamentos:[]};
const formOficina=o=>({data:o.data,prazo:o.prazo,maqId:o.maqId,tipo:o.tipo,desc:o.desc,prioridade:o.prioridade,responsavelId:'',pecas:o.pecas,mo:o.mo});

test('editar OS pela oficina altera só os campos do formulário',async()=>{
  const a=setup();a.run(`db.maquinas=[{id:'mq',nome:'Trator',horimetro:0,proxRev:0}];db.os=[${JSON.stringify(osCampo)}]`);
  await a.submit('f-os',{...formOficina(osCampo),pecas:800},'o1');
  const o=a.run('db.os[0]');
  assert.equal(o.pecas,800);assert.equal(o.titulo,'Reparo da cerca');assert.equal(o.desc,'Trocar mourões');
  assert.equal(o.modulo,'Campo');assert.equal(o.talhaoId,'m1');assert.equal(o.meta,2.5);assert.equal(o.unidade,'km');
  assert.equal(o.tipo,'Serviço');assert.equal(o.codigo,'OS-2026-101');
});

test('OS da oficina com título igual à descrição mantém os dois em sincronia',async()=>{
  const a=setup();const os={...osCampo,titulo:'Trocar correia',desc:'Trocar correia',modulo:'Oficina',talhaoId:'',meta:1,unidade:'serviço'};
  a.run(`db.maquinas=[{id:'mq',nome:'Trator',horimetro:0,proxRev:0}];db.os=[${JSON.stringify(os)}]`);
  await a.submit('f-os',{...formOficina(os),desc:'Trocar correia e tensor'},'o1');
  assert.equal(a.run('db.os[0].titulo'),'Trocar correia e tensor');
});

test('abastecimento antigo pode ser corrigido, respeitando os vizinhos da mesma máquina',async()=>{
  const a=setup();a.run(`db.maquinas=[{id:'mq',nome:'Trator',horimetro:4210,proxRev:4400}];db.abastecimentos=[
    {id:'a1',data:'2026-06-20',maqId:'mq',litros:180,horimetro:4150,obs:''},
    {id:'a2',data:'2026-07-08',maqId:'mq',litros:190,horimetro:4195,obs:''},
    {id:'a3',data:'2026-07-15',maqId:'mq',litros:175,horimetro:4210,obs:''}];globalThis.errors=null;`);
  await a.submit('f-abast',{data:'2026-06-20',maqId:'mq',litros:185,horimetro:4150,obs:''},'a1');
  assert.equal(a.run('db.abastecimentos.find(x=>x.id==="a1").litros'),185);assert.equal(a.run('errors'),null);
  await a.submit('f-abast',{data:'2026-06-20',maqId:'mq',litros:185,horimetro:4200,obs:''},'a1');
  assert.match(a.run('errors[0].message'),/4\.195 h/);assert.equal(a.run('db.abastecimentos.find(x=>x.id==="a1").horimetro'),4150);
  a.run('globalThis.errors=null');await a.submit('f-abast',{data:'2026-07-20',maqId:'mq',litros:100,horimetro:4100,obs:''});
  assert.match(a.run('errors[0].message'),/menor que o atual/);assert.equal(a.run('db.abastecimentos.length'),3);
});

test('lançar por texto lê números no padrão brasileiro e não confunde máquinas',()=>{
  const a=setup();const p=s=>a.run(`parseLinha(${JSON.stringify(s)})`);
  const maq=nome=>a.run(`db.maquinas.find(m=>m.nome.includes(${JSON.stringify(nome)})).id`);
  assert.equal(p('Abasteci o trator com 30 litros, horímetro 4230').campos.maqId,'');
  assert.equal(p('Abasteci com 100 litros, horímetro 2000').campos.maqId,'');
  assert.equal(p('Abasteci o Valtra A950 com 180 litros, horímetro 6150').campos.maqId,maq('Valtra'));
  assert.equal(p('Abasteci o caminhão com 250 litros horímetro 8800').campos.maqId,maq('Caminhão'));
  assert.equal(p('Abasteci o JD 6110 com 90 litros, horímetro 4.300.').campos.horimetro,4300);
  assert.equal(p('Colhi 2.5 carretas no Santa Rita').campos.carretas,2.5);
  assert.equal(p('Colhi 2,5 carretas no Santa Rita').campos.carretas,2.5);
  assert.equal(p('Choveu 12.5 mm').campos.mm,12.5);
  const d=p('Comprei 3.000 litros de diesel por R$ 17.400,50').campos;assert.equal(d.litros,3000);assert.equal(d.valor,17400.5);
});

test('migração de vínculos roda só em banco antigo e casa a NF como termo inteiro',()=>{
  const a=setup();
  assert.ok(a.run("db.fin.filter(f=>f.categoria==='Venda de grãos').every(f=>f.cargaId)"),'exemplo já nasce vinculado');
  a.run(`db.cargas.push({id:'k207',cultura:'soja',data:'2026-09-01',talhaoId:'s1',nf:'207',bruto:40000,tara:15000,umidade:13,preco:120,pago:false});
    db.fin.push({id:'manual',data:'2026-09-01',tipo:'entrada',categoria:'Venda de grãos',centro:'Soja',desc:'Contrato 2070/26 — adiantamento',valor:50000,status:'realizado'},
      {id:'citada',data:'2026-09-02',tipo:'entrada',categoria:'Venda de grãos',centro:'Soja',desc:'Soja NF 207 recebida',valor:50000,status:'realizado'});save();`);
  const atual=setup(a.storage.get('pvgest-erp-v1'));
  assert.equal(atual.run("db.fin.find(f=>f.id==='manual').desc"),'Contrato 2070/26 — adiantamento');
  assert.equal(atual.run("db.fin.find(f=>f.id==='citada').cargaId"),undefined,'banco v4 não é migrado de novo');
  const antigo=JSON.parse(a.storage.get('pvgest-erp-v1'));delete antigo.version;
  const legado=setup(JSON.stringify(antigo));
  assert.equal(legado.run("db.fin.find(f=>f.id==='manual').cargaId"),undefined,'"207" não casa com "2070"');
  assert.equal(legado.run("db.fin.find(f=>f.id==='citada').cargaId"),'k207');
});

test('cadastros não quebram com talhão sem cultura e escapam a cultura',()=>{
  const a=setup();a.run("db.talhoes.push({id:'tx',nome:'Sem cultura',area:1},{id:'ty',nome:'Estranho',cultura:'<b>x</b>',area:1})");
  const html=a.run('pgConfig()');assert.match(html,/Sem cultura<\/td><td>—/);assert.match(html,/&lt;b&gt;x&lt;\/b&gt;/);
  assert.match(a.run('BRL(1234.5)'),/1\.235$/);
});

// Simula a tela aberta desde 01/01/2020: o relógio real já está em outro dia.
const ontem="hoje='2020-01-01';mesAtual='2020-01';";

test('virada do dia atualiza hoje, mês e safra corrente e redesenha a tela',()=>{
  const a=setup();const real=a.run('isoLocal(new Date())');assert.equal(a.intervals.length,1);
  a.run(ontem+"anoFiltro=safraDe(hoje);globalThis.renders=0;render=()=>{renders++};formularioEmUso=()=>false;");
  a.intervals[0]();
  assert.equal(a.run('hoje'),real);assert.equal(a.run('mesAtual'),real.slice(0,7));
  assert.equal(a.run('anoFiltro'),a.run('safraDe(hoje)'));assert.equal(a.run('renders'),1);
  a.intervals[0]();assert.equal(a.run('renders'),1,'sem virada de dia, sem redesenho');
});

test('virada do dia preserva safra escolhida, digitação e registro em edição',()=>{
  const a=setup();const real=a.run('isoLocal(new Date())');
  a.run(ontem+`anoFiltro='2018/19';globalThis.renders=0;render=()=>{renders++};formularioEmUso=()=>true;
    globalThis.campos=[{value:'2020-01-01',defaultValue:'2020-01-01',form:{dataset:{}}},
      {value:'2019-12-31',defaultValue:'2020-01-01',form:{dataset:{}}},
      {value:'2020-01-01',defaultValue:'2020-01-01',form:{dataset:{editId:'x'}}}];$main.querySelectorAll=()=>campos;`);
  a.intervals[0]();
  assert.equal(a.run('renders'),0,'não redesenha por cima do formulário');assert.equal(a.run('anoFiltro'),'2018/19');
  assert.equal(a.run('campos[0].value'),real,'data ainda no padrão avança');
  assert.equal(a.run('campos[1].value'),'2019-12-31','data digitada fica');
  assert.equal(a.run('campos[2].value'),'2020-01-01','registro em edição fica');
});

test('ações usam a data real mesmo com a tela aberta desde ontem',async()=>{
  const a=setup();const real=a.run('isoLocal(new Date())');
  a.run(ontem+'db.chuvas=[];');await a.submit('f-chuva',{data:real,mm:5,obs:''});
  assert.equal(a.run('db.chuvas.length'),1,'a chuva de hoje não é recusada como "data futura"');
  a.run(ontem+"db.cargas=[{id:'k1',cultura:'soja',data:'2026-09-01',talhaoId:'s1',nf:'1',bruto:40000,tara:15000,umidade:13,preco:120,pago:false}];db.fin=[];");
  await a.click('pago',null,'k1');assert.equal(a.run('db.fin[0].data'),real);
});

// Revisão de 23/09/2026 — cada teste reproduz um defeito encontrado no app publicado.
// Botão "Concluir aplicação" com o campo de data da mesma linha preenchido.
const linhaComData=data=>({closest:()=>({querySelector:()=>({value:data})})});

test('carência conta do dia da aplicação, não da data planejada da ordem',async()=>{
  const a=setup();const hoje=a.run('hoje');
  const id=a.run("db.pulvOS.find(o=>o.status==='aberta'&&o.talhaoId==='c2').id");
  assert.equal(a.run(`db.pulvOS.find(o=>o.id==='${id}').data`),'2026-07-18','ordem de exemplo planejada no passado');
  await a.click('concluir-pos',null,id,linhaComData(a.run('addDias(hoje,1)')));
  assert.equal(a.run(`db.pulvOS.find(o=>o.id==='${id}').status`),'aberta','dia futuro é recusado');
  await a.click('concluir-pos',null,id,linhaComData(hoje));
  const o=a.run(`db.pulvOS.find(o=>o.id==='${id}')`);assert.equal(o.status,'concluida');assert.equal(o.dataAplicacao,hoje);
  assert.equal(a.run("statusCarencia('c2')?.libera"),a.run('addDias(hoje,30)'),'fungicida de 30 dias bloqueia a colheita a partir de hoje');
  assert.equal(a.run(`db.fin.find(f=>f.pulvOSId==='${id}').data`),hoje);
  a.run("imprimir=h=>{globalThis.impresso=h};cadernoCampo('c2')");
  assert.ok(a.run('impresso').includes(`${a.run('dBRy(hoje)')}</td><td>Aplicação`),'o caderno de campo registra o dia da aplicação');
});

test('ordem concluída antes do campo de aplicação usa o dia em que foi concluída no sistema',()=>{
  const a=setup();
  a.run(`const o=db.pulvOS.find(o=>o.talhaoId==='c2');o.status='concluida';
    db.fin.push({id:'custo',data:'2026-09-20',tipo:'saida',categoria:'Defensivos',centro:'Cafe',desc:'Aplicação',valor:1,status:'realizado',pulvOSId:o.id});save();`);
  const b=setup(a.storage.get('pvgest-erp-v1'));
  assert.equal(b.run("db.pulvOS.find(o=>o.talhaoId==='c2').dataAplicacao"),'2026-09-20');
  assert.equal(b.run("db.pulvOS.find(o=>o.talhaoId==='c1').dataAplicacao"),'2026-06-20','sem custo vinculado, vale a data da ordem');
});

test('carência em branco fica "não informada" e é avisada ao concluir a aplicação',async()=>{
  const a=setup();
  await a.submit('f-def',{nome:'Produto novo',classe:'Fungicida',unidade:'L',preco:10,qtd:100,min:0,carencia:'',reentrada:0});
  assert.equal(a.run('db.defensivos.at(-1).carencia'),null);assert.match(a.run('pgPvgest()'),/não informada/);
  a.run(`globalThis.perguntas=[];confirm=m=>{perguntas.push(m);return true};const p=db.defensivos.at(-1);
    db.receitas.push({id:'r-novo',nome:'Nova',itens:[{prodId:p.id,dose:1}]});
    db.pulvOS.push({id:'o-novo',data:hoje,talhaoId:'c3',receitaId:'r-novo',area:1,status:'aberta'});`);
  await a.click('concluir-pos',null,'o-novo');
  assert.match(a.run('perguntas.at(-1)'),/Produto novo sem carência cadastrada/);
});

test('o que os formulários aceitam passa na validação estrita: Desfazer e backup continuam funcionando',async()=>{
  const a=setup();a.run('showStatus=m=>{globalThis.ultimoStatus=m}');
  await a.submit('f-regap',{data:'2026-09-20',maquinaId:'',velocidade:6,rpm:540,bico:'ATR',numBicos:36,vazaoHa:400,vazaoBico:2,obs:''});
  await a.submit('f-regcol',{data:'2026-09-20',ano:2026,talhaoId:'',variedade:'',tipo:'Árvore',maquinaId:'',vibracao:800,velocidade:1,freio:0,obs:''});
  await a.submit('f-mip',{data:'2026-09-20',talhaoId:'',tipo:'Ferrugem',nivel:2,lat:'',lon:'',obs:''});
  assert.deepEqual([a.run('db.regAplicacao.length'),a.run('db.regColheita.length'),a.run('db.mip.length')],[2,3,1]);
  assert.doesNotThrow(()=>a.run('normalizeDatabase(JSON.parse(JSON.stringify(db)),{strict:true})'));
  await a.submit('f-chuva',{data:'2026-09-20',mm:10,obs:''});const chuvas=a.run('db.chuvas.length');
  await a.run('undoLast()');assert.equal(a.run('db.chuvas.length'),chuvas-1,a.run('globalThis.ultimoStatus'));
  await a.run(`importBackupPayload(${a.run("JSON.stringify({format:'gefaz360-backup',version:4,db,files:[]})")})`);
  assert.equal(a.run('db.regAplicacao.length'),2,'o próprio backup volta a importar');
});

test('formulário recusa referência obrigatória vazia ou apagada e coordenada MIP pela metade',async()=>{
  const a=setup();const antes=a.run('db.cafe.length');
  const cafe=talhaoId=>({data:'2026-09-20',talhaoId,tipo:'Manual (pano)',qtd:100,unidade:'litro',colhedores:0,horas:0,valorMedida:9});
  a.run('globalThis.errors=null');await a.submit('f-cafe',cafe(''));assert.match(a.run('errors[0].message'),/talhaoId é obrigatório/);
  a.run('globalThis.errors=null');await a.submit('f-cafe',cafe('apagado'));assert.match(a.run('errors[0].message'),/não existe mais/);
  assert.equal(a.run('db.cafe.length'),antes);
  a.run('globalThis.errors=null');await a.submit('f-mip',{data:'2026-09-20',talhaoId:'c1',tipo:'Ferrugem',nivel:2,lat:'-19.1',lon:'',obs:''});
  assert.equal(a.run('db.mip.length'),0);assert.match(a.run('errors[0].message'),/latitude e longitude juntas/);
});

test('banco com MIP pela metade é consertado ao carregar e passa na validação estrita',()=>{
  const a=setup();a.run("db.mip=[{id:'m1',data:'2026-09-20',talhaoId:'c1',tipo:'Ferrugem',nivel:2,lat:-19.1,lon:null,obs:'saia'}];save()");
  const b=setup(a.storage.get('pvgest-erp-v1'));
  assert.equal(b.run('db.mip[0].lat'),null);assert.equal(b.run('db.mip[0].obs'),'saia · latitude -19.1 sem longitude');
  assert.doesNotThrow(()=>b.run('normalizeDatabase(JSON.parse(JSON.stringify(db)),{strict:true})'));
});

test('mapa em UTM é recusado na importação em vez de travar o backup depois',async()=>{
  const a=setup();
  const utm={type:'Feature',properties:{name:'Santa Rita'},geometry:{type:'Polygon',coordinates:[[[500000,7800000],[500100,7800000],[500100,7800100],[500000,7800000]]]}};
  await a.run(`lerArquivoMapa({size:100,name:'talhoes.geojson',text:async()=>${JSON.stringify(JSON.stringify(utm))}})`);
  assert.equal(a.run('mapaPreview'),null);assert.match(a.run('mapaErro'),/WGS 84/);
});

test('dar baixa num título de carga recebe a carga e não conta o valor duas vezes',async()=>{
  const a=setup();
  assert.equal(a.run('db.cargas.filter(c=>c.pago).length'),a.run('seed().cargas.filter(c=>c.pago).length'),'o conserto não mexe no exemplo');
  const id=a.run("db.fin.find(f=>f.cargaId&&f.status==='previsto').id"),cargaId=a.run(`db.fin.find(f=>f.id==='${id}').cargaId`);
  await a.click('baixa',null,id);
  assert.equal(a.run(`db.cargas.find(c=>c.id==='${cargaId}').pago`),true);
  assert.equal(a.run(`db.fin.filter(f=>f.cargaId==='${cargaId}').map(f=>f.status).join()`),'realizado');
});

test('banco com título de carga baixado e carga pendente é consertado ao carregar',()=>{
  const a=setup();a.run("const f=db.fin.find(f=>f.cargaId&&f.status==='previsto');f.status='realizado';globalThis.alvo=f.cargaId;save()");
  const b=setup(a.storage.get('pvgest-erp-v1'));
  assert.equal(b.run(`db.cargas.find(c=>c.id===${JSON.stringify(a.run('alvo'))}).pago`),true);
});

test('textos importados saem escapados em todas as páginas, no caderno e no KML',async()=>{
  const a=setup();const P='"\'><i/id=inj>';
  a.run(`const P=${JSON.stringify(P)};anoFiltro='';
    db.talhoes.push({id:'tx',nome:'X',cultura:P,area:P,variedade:P});
    db.lotes.push({id:'lx',codigo:P,data:'2026-09-01',talhaoId:'c1',origem:P,status:P,carretas:P},
      {id:'lx2',codigo:P,data:'2026-09-01',talhaoId:'c1',origem:'Árvore',status:'terreiro'});
    db.func.push({id:'fx',nome:'F',funcao:'f',tipo:P,valor:P});
    db.estoque.push({id:'ex',nome:'E',cat:'Peça',qtd:0,min:1,local:'',resp:P});
    db.coberturas.push({id:'cx',data:'2026-09-01',talhaoId:'c1',especie:P,operacao:P,area:1,obs:''});
    db.defensivos.push({id:'dx',nome:P,classe:'Fungicida',unidade:'L',preco:1,qtd:0,min:1,carencia:30,reentrada:24});
    db.adubacoes.push({id:'ax',data:'2026-09-01',talhaoId:'c1',operacao:P,produto:'x',dose:1,unidade:'kg/ha',area:1,obs:''});
    db.arruacoes.push({id:'rx',data:'2026-09-01',talhaoId:'c1',tipo:P,area:1,obs:''});
    db.bienal.push({id:'bx',talhaoId:'c1',safra:safraDe(hoje),carga:P,obs:''});
    db.mip.push({id:'mx',data:P,talhaoId:'c1',tipo:'t',nivel:P,lat:-19,lon:-45,obs:''});
    db.geoTalhoes.push({id:'gx',talhaoId:'tx',nome:'g',cultura:'',coords:[[-45,-19],[-45.1,-19],[-45.1,-19.1]],areaHa:1});
    db.documentos.push({id:'docx',data:'2026-09-01',nome:'n',categoria:P,mime:'image/png',size:1});
    db.cafe.push({id:'kx',data:'2026-09-01',talhaoId:'c1',tipo:'Manual (pano)',litros:100,colhedores:P,valorMedida:9});
    db.regColheita.push({id:'gx2',data:'2026-09-01',ano:P,talhaoId:'c1',tipo:'Árvore',maquinaId:'',vibracao:1,velocidade:1,obs:''});
    imprimir=h=>{globalThis.impresso=h};downloadBlob=b=>{globalThis.kml=b};`);
  for(const pg of a.run('Object.keys(PAGES)'))for(const t of pg==='talhao'?['c1','tx']:['']){
    if(t)a.run(`talhaoSel='${t}'`);
    assert.ok(!a.run(`PAGES['${pg}']()`).includes('<i/id=inj>'),`página ${pg}${t?' ('+t+')':''} deixou texto cru`);
  }
  for(const t of ['c1','tx']){a.run(`cadernoCampo('${t}')`);assert.ok(!a.run('impresso').includes('<i/id=inj>'),`caderno ${t}`);}
  a.run('exportarKML()');assert.ok(!(await a.run('kml.text()')).includes('<i/id=inj>'),'KML exportado');
});
