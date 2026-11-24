import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

const source=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
// Executa os handlers reais; somente APIs do navegador e renderização são simuladas.
function setup(initial=null,hash='#dash'){
  const events={},storage=new Map(initial===null?[]:[['pvgest-erp-v1',initial]]),files=new Map();
  const elements=new Map(),intervals=[];
  const window={addEventListener(){},scrollY:0,scrollTo(){}};window.top=window;window.self=window;
  const context=vm.createContext({window,document:{getElementById(id){
    if(!elements.has(id))elements.set(id,{addEventListener:(type,fn)=>events[id+':'+type]=fn,style:{}});
    return elements.get(id);
  },addEventListener(){}},location:{hash},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},
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
  const change=async target=>events['main:change']({target});
  const nav=async rota=>events['nav:click']({target:{closest:()=>({dataset:{rota}})}});
  return {run,click,submit,change,nav,storage,files,elements,intervals};
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
  assert.match(a.run('errors[0].message'),/menor que 4\.210 h, registrado num abastecimento anterior/);assert.equal(a.run('db.abastecimentos.length'),3);
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
test('carência real não é escondida por aplicação recente só com reentrada',()=>{
  const a=setup();
  a.run(`db.defensivos=[{id:'h',nome:'Herb',carencia:0,reentrada:24,qtd:9,preco:1},{id:'f',nome:'Fung',carencia:30,reentrada:24,qtd:9,preco:1}];
    db.receitas=[{id:'rh',nome:'H',itens:[{prodId:'h',dose:1}]},{id:'rf',nome:'F',itens:[{prodId:'f',dose:1}]}];
    db.pulvOS=[{id:'o1',talhaoId:'c1',receitaId:'rh',area:1,status:'concluida',data:hoje,dataAplicacao:hoje},
      {id:'o2',talhaoId:'c1',receitaId:'rf',area:1,status:'concluida',data:addDias(hoje,-10),dataAplicacao:addDias(hoje,-10)}];`);
  assert.equal(a.run('statusCarencia("c1").libera'),a.run('addDias(hoje,20)'));
  assert.equal(a.run('statusCarencia("c1").prod'),'Fung');
  a.run('db.pulvOS.reverse()');
  assert.equal(a.run('statusCarencia("c1").libera'),a.run('addDias(hoje,20)'));
  a.run('db.pulvOS=db.pulvOS.filter(o=>o.id==="o1")');
  assert.equal(a.run('statusCarencia("c1").libera'),null);
  assert.equal(a.run('statusCarencia("c1").liberaRe'),a.run('addDias(hoje,1)'));
  assert.doesNotMatch(a.run('pgDash()'),/não colher até/);
  assert.match(a.run('pgDash()'),/entrada no talhão liberada em/);
});
test('só reentrada não vira carência no mapa nem na ficha; entre reentradas vale a mais tardia em qualquer ordem',()=>{
  const a=setup();
  a.run(`db.defensivos=[{id:'h',nome:'Herb',carencia:0,reentrada:24,qtd:9,preco:1},{id:'g',nome:'Glifo',carencia:0,reentrada:72,qtd:9,preco:1},{id:'f',nome:'Fung',carencia:30,reentrada:24,qtd:9,preco:1}];
    db.receitas=[{id:'rh',nome:'H',itens:[{prodId:'h',dose:1}]},{id:'rg',nome:'G',itens:[{prodId:'g',dose:1}]},{id:'rf',nome:'F',itens:[{prodId:'f',dose:1}]}];
    db.pulvOS=[{id:'o1',talhaoId:'c1',receitaId:'rg',area:1,status:'concluida',data:hoje,dataAplicacao:hoje},
      {id:'o2',talhaoId:'c1',receitaId:'rh',area:1,status:'concluida',data:hoje,dataAplicacao:hoje}];
    db.mip=[];db.geoTalhoes=[{id:'g1',talhaoId:'c1',nome:'X',cultura:'cafe',coords:[[-45,-19],[-45.01,-19],[-45,-19.01]],areaHa:1}];talhaoSel='c1';`);
  assert.equal(a.run('statusCarencia("c1").liberaRe'),a.run('addDias(hoje,3)'));
  a.run('db.pulvOS.reverse()');
  assert.equal(a.run('statusCarencia("c1").liberaRe'),a.run('addDias(hoje,3)'));
  assert.equal(a.run('statusCarencia("c1").receita'),'G');
  const mapa=a.run('mapaSVG("carencia")');
  assert.doesNotMatch(mapa,/var\(--crit\)|em carência/);assert.match(mapa,/var\(--good\)/);
  const ficha=a.run('pgTalhao()');
  assert.match(ficha,/⏳ Intervalo de reentrada/);assert.match(ficha,/Entrada no talhão liberada em <b>/);assert.doesNotMatch(ficha,/Talhão em carência/);
  a.run(`db.pulvOS.push({id:'o3',talhaoId:'c1',receitaId:'rf',area:1,status:'concluida',data:hoje,dataAplicacao:hoje})`);
  assert.match(a.run('mapaSVG("carencia")'),/var\(--crit\)[\s\S]*em carência/);
  const fichaCar=a.run('pgTalhao()');
  assert.match(fichaCar,/⚠️ Talhão em carência/);assert.doesNotMatch(fichaCar,/Intervalo de reentrada/);
});
test('financeiro mostra títulos em aberto de safras anteriores',()=>{
  const a=setup();a.run("anoFiltro='2030/31'");
  const previstos=a.run("db.fin.filter(f=>f.status==='previsto').length");assert.ok(previstos>0);
  const html=a.run('pgFin()');
  assert.equal((html.match(/data-action="baixa"/g)||[]).length,previstos);
  const pagar=a.run("BRL(db.fin.filter(f=>f.status==='previsto'&&f.tipo==='saida').reduce((s,f)=>s+f.valor,0))");
  assert.ok(html.includes(pagar));
  const receber=a.run("BRL(db.fin.filter(f=>f.status==='previsto'&&f.tipo==='entrada'&&!f.cargaId).reduce((s,f)=>s+f.valor,0)+db.cargas.filter(c=>!c.pago).reduce((s,c)=>s+cargaCalc(c).valor,0))");
  assert.ok(html.includes(receber));
  assert.match(html,/pill warn">safra \d{4}\/\d{2}</);
});
test('financeiro sem filtro de safra não repete títulos',()=>{
  const a=setup();a.run("anoFiltro=''");
  assert.equal((a.run('pgFin()').match(/<tr>\s*<td>\d{2}\/\d{2}\/\d{2}<\/td>/g)||[]).length,a.run('db.fin.length'));
});
test('grãos e painel dizem o que está fora do filtro de safra',()=>{
  const a=setup();
  const aberto=a.run("BRL(db.cargas.filter(c=>c.cultura==='milho'&&!c.pago).reduce((s,c)=>s+cargaCalc(c).valor,0))");
  assert.notEqual(aberto,'R$ 0');
  a.run("anoFiltro='2030/31'");
  assert.ok(a.run("pgGrao('milho')").includes('+ '+aberto+' de outras safras'));
  assert.match(a.run('pgDash()'),/realizado na safra 2030\/31/);
  assert.match(a.run('pgFin()'),/entradas − saídas na safra 2030\/31/);
  a.run("anoFiltro=''");
  assert.doesNotMatch(a.run("pgGrao('milho')"),/de outras safras/);
  assert.match(a.run('pgDash()'),/realizado · todas as safras/);
  assert.match(a.run('pgFin()'),/entradas − saídas · todas as safras/);
});
test('aplicação concluída pode ser excluída: devolve estoque e remove o custo',async()=>{
  const a=setup();const id=a.run('db.pulvOS.find(o=>o.status==="aberta").id');
  // arredonda: 12-0.85+0.85 não volta exatamente a 12 em ponto flutuante
  a.run('globalThis.estoque=()=>JSON.stringify(db.defensivos.map(d=>[d.id,+Number(d.qtd).toFixed(6)]))');
  const antes=a.run('estoque()'),nFin=a.run('db.fin.length');
  await a.click('concluir-pos',null,id);
  assert.equal(a.run(`db.pulvOS.find(o=>o.id==='${id}').status`),'concluida');
  assert.ok(a.run(`db.pulvOS.find(o=>o.id==='${id}').baixas.length`)>0);
  assert.equal(a.run(`deleteBlock('pulvOS','${id}')`),'');
  await a.click('del','pulvOS',id);
  assert.equal(a.run(`db.pulvOS.some(o=>o.id==='${id}')`),false);
  assert.equal(a.run('db.fin.length'),nFin);
  assert.equal(a.run('estoque()'),antes);
  a.run("normalizeDatabase(JSON.parse(JSON.stringify(db)),{strict:true})");
});
test('aplicação antiga sem baixas e com produto excluído ainda pode ser excluída',async()=>{
  const a=setup();
  a.run(`db.defensivos=[{id:'p1',nome:'A',qtd:5,preco:1}];db.receitas=[{id:'r1',nome:'R',itens:[{prodId:'p1',dose:2},{prodId:'sumiu',dose:1}]}];
    db.pulvOS=[{id:'o1',talhaoId:'c1',receitaId:'r1',area:3,status:'concluida',data:'2026-06-01',dataAplicacao:'2026-06-01'}];
    db.fin=[{id:'f1',data:'2026-06-01',tipo:'saida',valor:6,status:'realizado',pulvOSId:'o1'}];`);
  await a.click('del','pulvOS','o1');
  assert.equal(a.run('db.pulvOS.length'),0);assert.equal(a.run('db.fin.length'),0);
  assert.equal(a.run('db.defensivos[0].qtd'),11);
});
test('excluir aplicação concluída pode ser desfeito e restaura estoque, custo e carência',async()=>{
  const a=setup();const id=a.run('db.pulvOS.find(o=>o.status==="aberta").id');
  a.run('globalThis.estoque=()=>JSON.stringify(db.defensivos.map(d=>[d.id,+Number(d.qtd).toFixed(6)]))');
  await a.click('concluir-pos',null,id);
  const concluido=a.run('estoque()'),nFin=a.run('db.fin.length');
  await a.click('del','pulvOS',id);
  await a.run('undoLast()');
  assert.equal(a.run(`db.pulvOS.find(o=>o.id==='${id}').status`),'concluida');
  assert.equal(a.run('estoque()'),concluido);assert.equal(a.run('db.fin.length'),nFin);
  assert.equal(a.run(`db.fin.some(f=>f.pulvOSId==='${id}')`),true);
});
test('salvar parte da qualidade preserva os campos deixados em branco',async()=>{
  const a=setup();const id=a.run('db.lotes[0].id');
  await a.submit('f-qual',{loteId:id,cobTipo:'',cobBebida:'',scaa:'',peneira:'16',peneiraPct:'',aroma:'',sabor:'9',acidez:'',corpo:'',fin:'',descritores:''});
  assert.deepEqual(JSON.parse(a.run('JSON.stringify(db.lotes[0])')),{...JSON.parse(a.run('JSON.stringify(db.lotes[0])')),
    scaa:82.5,cobTipo:4,cobBebida:'Dura',peneira:'16',peneiraPct:82,descritores:'Chocolate, caramelo, nozes',
    sens:{aroma:8,sabor:9,acidez:7.5,corpo:8,fin:7.5}});
});
test('zero digitado na qualidade é gravado',async()=>{
  const a=setup();const id=a.run('db.lotes[0].id');
  await a.submit('f-qual',{loteId:id,scaa:'0'});
  assert.equal(a.run('db.lotes[0].scaa'),0);assert.equal(a.run('db.lotes[0].cobTipo'),4);
});
test('qualidade de lote sem perfil sensorial cria sens completo só se algo foi preenchido',async()=>{
  const a=setup();const id=a.run('db.lotes[1].id');
  await a.submit('f-qual',{loteId:id,scaa:'80',descritores:'cítrico'});
  assert.equal(a.run('db.lotes[1].sens'),undefined);assert.equal(a.run('db.lotes[1].scaa'),80);
  await a.submit('f-qual',{loteId:id,sabor:'8'});
  assert.deepEqual(JSON.parse(a.run('JSON.stringify(db.lotes[1].sens)')),{aroma:0,sabor:8,acidez:0,corpo:0,fin:0});
  assert.equal(a.run('db.lotes[1].descritores'),'cítrico');
  a.run("normalizeDatabase(JSON.parse(JSON.stringify(db)),{strict:true})");
});
test('trocar o lote no formulário de qualidade preenche os campos com o que já está gravado',async()=>{
  const a=setup();const id0=a.run('db.lotes[0].id'),id1=a.run('db.lotes[1].id');
  a.run(`globalThis.fq={elements:{}};for(const n of ['loteId','cobTipo','cobBebida','scaa','peneira','peneiraPct','aroma','sabor','acidez','corpo','fin','descritores'])fq.elements[n]={name:n,value:'sobra'};`);
  const alvo=id=>({name:'loteId',value:id,closest:sel=>sel==='#f-qual'?a.run('fq'):null});
  await a.change(alvo(id0));
  assert.equal(a.run('fq.elements.scaa.value'),'82.5');assert.equal(a.run('fq.elements.cobBebida.value'),'Dura');
  assert.equal(a.run('fq.elements.sabor.value'),'7.75');assert.equal(a.run('fq.elements.descritores.value'),'Chocolate, caramelo, nozes');
  assert.equal(a.run('fq.elements.loteId.value'),'sobra');
  await a.change(alvo(id1));
  for(const n of ['cobTipo','cobBebida','scaa','peneira','peneiraPct','aroma','sabor','acidez','corpo','fin','descritores'])assert.equal(a.run(`fq.elements.${n}.value`),'',n);
});
test('lote não pode ser excluído se as vendas sem lote dependem das sacas dele',async()=>{
  const a=setup();
  a.run(`db.lotes=[{id:'l1',codigo:'L1',talhaoId:'c1',sacas:46,status:'beneficiado',data:'2026-07-08'}];db.secagens=[];
    db.vendasCafe=[{id:'v1',data:'2026-07-14',loteId:'',sacas:30,preco:1}];db.fin=[];`);
  assert.match(a.run("deleteBlock('lotes','l1')"),/vendas de café sem lote/);
  await a.click('del','lotes','l1');assert.equal(a.run('db.lotes.length'),1);
  a.run('db.vendasCafe=[]');
  assert.equal(a.run("deleteBlock('lotes','l1')"),'');
});
test('lote pode ser excluído se os outros lotes ainda cobrem as vendas sem lote',async()=>{
  const a=setup();
  a.run(`db.lotes=[{id:'l1',codigo:'L1',talhaoId:'c1',sacas:46,status:'beneficiado',data:'2026-07-08'},
      {id:'l2',codigo:'L2',talhaoId:'c1',sacas:30,status:'beneficiado',data:'2026-07-09'}];db.secagens=[];
    db.vendasCafe=[{id:'v1',data:'2026-07-14',loteId:'',sacas:30,preco:1}];db.fin=[];`);
  assert.equal(a.run("deleteBlock('lotes','l1')"),'');
  await a.click('del','lotes','l1');assert.equal(a.run('db.lotes.length'),1);
  assert.match(a.run("deleteBlock('lotes','l2')"),/vendas de café sem lote/);
  a.run("normalizeDatabase(JSON.parse(JSON.stringify(db)),{strict:true})");
});
test('abastecimento esquecido entra se o horímetro é coerente com os vizinhos',async()=>{
  const a=setup();const m=a.run('db.maquinas[0].id'),n=a.run('db.abastecimentos.length');
  await a.submit('f-abast',{data:'2026-07-01',maqId:m,litros:100,horimetro:4170,obs:''});
  assert.equal(a.run('db.abastecimentos.length'),n+1);assert.equal(a.run('db.maquinas[0].horimetro'),4210);
  await a.submit('f-abast',{data:'2026-07-02',maqId:m,litros:100,horimetro:4100,obs:''});
  assert.equal(a.run('db.abastecimentos.length'),n+1);
});
test('corrigir ou excluir abastecimento corrige o horímetro da máquina',async()=>{
  const a=setup();const m=a.run('db.maquinas[0].id'),m2=a.run('db.maquinas[1].id');
  await a.submit('f-abast',{data:'2026-07-20',maqId:m,litros:100,horimetro:42300,obs:''});
  const rid=a.run('db.abastecimentos.at(-1).id');assert.equal(a.run('db.maquinas[0].horimetro'),42300);
  await a.submit('f-abast',{data:'2026-07-20',maqId:m,litros:100,horimetro:4230,obs:''},rid);
  assert.equal(a.run('db.maquinas[0].horimetro'),4230);
  await a.submit('f-abast',{data:'2026-07-20',maqId:m2,litros:100,horimetro:1190,obs:''},rid);
  assert.equal(a.run('db.maquinas[0].horimetro'),4210);assert.equal(a.run('db.maquinas[1].horimetro'),1190);
  await a.click('del','abastecimentos',rid);
  assert.equal(a.run('db.maquinas[1].horimetro'),1185);
});
test('recalcHorimetro só mexe quando o horímetro da máquina veio do registro removido',()=>{
  const a=setup();
  a.run(`db.maquinas=[{id:'mq',nome:'T',horimetro:5000,proxRev:0}];db.abastecimentos=[{id:'a1',data:'2026-07-01',maqId:'mq',litros:1,horimetro:4100,obs:''}]`);
  a.run("recalcHorimetro('mq',4300)");assert.equal(a.run('db.maquinas[0].horimetro'),5000);
  a.run("recalcHorimetro('mq',5000)");assert.equal(a.run('db.maquinas[0].horimetro'),4100);
  a.run("db.abastecimentos=[];db.maquinas[0].horimetro=4100;recalcHorimetro('mq',4100)");assert.equal(a.run('db.maquinas[0].horimetro'),4100);
  a.run("recalcHorimetro('nao-existe',1)");
});
test('ação na mesma tela mantém a rolagem; trocar de tela volta ao topo',()=>{
  const a=setup();
  assert.equal(a.run("rolagemAposRender('oficina','oficina',3939)"),3939);
  assert.equal(a.run("rolagemAposRender('oficina','fin',3939)"),0);
});
test('registro sem data não derruba as telas e continua válido',()=>{
  const a=setup();
  a.run(`const cru=JSON.parse(JSON.stringify(db));
    cru.fin.push({id:'x1',tipo:'saida',valor:1,status:'realizado',categoria:'a',centro:'Adm',desc:'sem data'});
    cru.cafe.push({id:'x2',talhaoId:'c1',litros:1,tipo:'Varrição'});
    cru.pulvOS.push({id:'x3',talhaoId:'c1',receitaId:cru.receitas[0].id,area:1,status:'concluida'});
    db=normalizeDatabase(cru,{strict:true});anoFiltro='';`);
  assert.equal(a.run("db.fin.find(f=>f.id==='x1').data"),'');
  for(const p of ['pgDash()','pgCafe()','pgFin()','pgPvgest()','statusCarencia("c1")'])a.run(p);
});
test('erro numa página vira aviso com exportação de backup, não tela congelada',()=>{
  const a=setup();a.run("PAGES.dash=()=>{throw new Error('falha de teste')}");
  const html=a.run("paginaHTML('dash')");
  assert.match(html,/Esta tela encontrou um erro/);assert.match(html,/falha de teste/);assert.match(html,/data-action="export"/);
});
test('hash malformado abre a visão geral',()=>{
  const a=setup(null,'#%');assert.equal(a.run('rota'),'dash');
});
test('data e dataInicio ausentes viram texto vazio nos dois modos, sem mexer no que existe',()=>{
  const a=setup();
  a.run(`const cru=JSON.parse(JSON.stringify(db));
    cru.chuvas.push({id:'x9',mm:5});
    cru.secagens.push({id:'x8',loteId:cru.lotes[0].id,umidadeEntrada:30,status:'andamento',leituras:[{h:0,u:30}]});
    globalThis.lax=normalizeDatabase(JSON.parse(JSON.stringify(cru)));
    globalThis.estrito=normalizeDatabase(JSON.parse(JSON.stringify(cru)),{strict:true});`);
  for(const v of ['lax','estrito']){
    assert.equal(a.run(`${v}.chuvas.find(x=>x.id==='x9').data`),'');
    assert.equal(a.run(`${v}.secagens.find(x=>x.id==='x8').dataInicio`),'');
    assert.equal(a.run(`${v}.fin[0].data`),a.run('db.fin[0].data'));
    assert.equal(a.run(`'data' in ${v}.talhoes[0]`),false);
  }
});
test('máquina sem plano de revisão não gera alerta',async()=>{
  const a=setup();await a.submit('f-maq',{nome:'Maquina Nova',tipo:'Trator',horimetro:10,proxRev:0});
  assert.doesNotMatch(a.run('pgDash()'),/revisão<\/span> Maquina Nova/);
  assert.match(a.run('pgOficina()'),/Maquina Nova[\s\S]{0,400}sem plano/);
});
test('máquina com plano de revisão continua gerando alerta e selo',()=>{
  const a=setup();
  a.run("db.maquinas.push({id:'mq9',nome:'Maquina Plano',tipo:'Trator',horimetro:1180,proxRev:1200},{id:'mq8',nome:'Maquina Vencida',tipo:'Trator',horimetro:1300,proxRev:1200})");
  assert.match(a.run('pgDash()'),/revisão<\/span> Maquina Plano/);
  assert.match(a.run('pgDash()'),/revisão<\/span> Maquina Vencida/);
  assert.match(a.run('pgOficina()'),/Maquina Plano[\s\S]{0,400}faltam 20 h/);
  assert.match(a.run('pgOficina()'),/Maquina Vencida[\s\S]{0,400}revisão vencida/);
});
test('talhão com área zero não mostra infinito',()=>{
  const a=setup();a.run("db.talhoes.find(t=>t.id==='c3').area=0;anoFiltro='';talhaoSel='c3'");
  for(const p of ['pgCafe()','pgDash()','pgTalhao()'])assert.doesNotMatch(a.run(p),/Infinity|∞|NaN/);
});
test('sem nenhum talhão de café com área, produtividade e telas não mostram infinito',()=>{
  const a=setup();a.run("db.talhoes.filter(t=>t.cultura==='cafe').forEach(t=>t.area=0);anoFiltro=''");
  for(const p of ['pgCafe()','pgDash()'])assert.doesNotMatch(a.run(p),/Infinity|∞|NaN/);
  assert.equal(a.run('porHa(10,0)'),0);assert.equal(a.run('porHa(10,4)'),2.5);assert.equal(a.run('porHa(10,undefined)'),0);
});
test('salvar parâmetros mantém o filtro na safra corrente',async()=>{
  const a=setup();
  await a.submit('f-param',{litrosPorCarreta:5000,litrosPorSaca:480,litrosPorMedida:60,minDiesel:1000,diariaMinima:100,mesInicioSafra:10});
  assert.equal(a.run('anoFiltro'),a.run('safraDe(hoje)'));
});
test('centro Cobertura aparece nas saídas por centro',()=>{
  const a=setup();assert.match(a.run('pgFin()'),/<span>Cobertura<\/span>/);
});
test('colheita por texto só casa talhão de café e prefere o nome mais longo',()=>{
  const a=setup();
  assert.equal(a.run('parseLinha("Colhi 2 carretas no Pivô 1").campos.talhaoId'),'');
  assert.match(a.run('vozCard(parseLinha("Colhi 2 carretas no Pivô 1"),0)'),/— selecione —/);
  assert.equal(a.run('parseLinha("Colhi 2 carretas no Santa Rita").campos.talhaoId'),'c1');
  a.run("db.talhoes.push({id:'c9',nome:'Serra Nova',cultura:'cafe',area:3})");
  assert.equal(a.run('parseLinha("Colhi 1 carreta na Serra Nova").campos.talhaoId'),'c9');
});
test('acharTalhao sem cultura continua achando qualquer talhão e ignora nome vazio',()=>{
  const a=setup();
  assert.equal(a.run('acharTalhao("aplicação no Pivô 1").id'),'m1');
  assert.equal(a.run('acharTalhao("aplicação no Pivô 1","cafe")'),undefined);
  assert.equal(a.run('acharTalhao("aplicação no Pivô 1","milho").id'),'m1');
  a.run("db.talhoes.push({id:'z0',nome:'',cultura:'cafe',area:1})");
  assert.equal(a.run('acharTalhao("texto qualquer","cafe")'),undefined);
});
test('receita sem produto não é salva',async()=>{
  const a=setup();const n=a.run('db.receitas.length');
  await a.submit('f-rec',{nome:'Vazia',cultura:'',alvo:'',volumeHa:200});
  assert.equal(a.run('db.receitas.length'),n);
  assert.equal(a.run('globalThis.errors[0].field'),'nome');
  assert.equal(a.run('globalThis.errors[0].message'),'Adicione ao menos um produto à calda antes de salvar a receita.');
  a.run('recItens=[{prodId:db.defensivos[0].id,dose:1}]');
  await a.submit('f-rec',{nome:'Com produto',cultura:'',alvo:'',volumeHa:200});
  assert.equal(a.run('db.receitas.length'),n+1);
});
test('importação do PVgest mapeia culturas e não deixa resto em caso de erro',()=>{
  const a=setup();
  a.run("globalThis.r=importaPvgest({talhoes:[{nome:'T Trigo',cultura:'Trigo',area:5},{nome:'T Sorgo',cultura:'sorgo',area:2},{nome:'T Feijão',cultura:'Feijão',area:1}]},db)");
  assert.deepEqual(JSON.parse(a.run("JSON.stringify(r.db.talhoes.slice(-3).map(t=>t.cultura))")),['trigo','sorgo','cobertura']);
  assert.equal(a.run('r.talhoes'),3);
  const antes=a.run('JSON.stringify(db)');
  assert.throws(()=>a.run("importaPvgest({produtos:[{id:1,nome:'P'},null]},db)"));
  assert.equal(a.run('JSON.stringify(db)'),antes);
});
test('importação do PVgest trabalha numa cópia, liga receita aos produtos novos e não repete talhão',()=>{
  const a=setup();const antes=a.run('JSON.stringify(db)');
  a.run(`globalThis.r=importaPvgest({
    produtos:[{id:7,nome:'Calda X',unidade:'L',estoque_atual:3}],
    receitas:[{nome:'Rec PV',itens:[{produto:7,dose:2},{produto:99,dose:1}]}],
    talhoes:[{nome:'santa rita',cultura:'Café',area:12},{nome:'Nova Gleba',cultura:'Soja Safrinha',area:4},{nome:'Chapa',cultura:'',area:1}]},db)`);
  assert.equal(a.run('JSON.stringify(db)'),antes);
  assert.notEqual(a.run('r.db===db'),true);
  assert.equal(a.run('r.produtos'),1);assert.equal(a.run('r.receitas'),1);assert.equal(a.run('r.talhoes'),2);
  assert.equal(a.run('r.db.receitas.at(-1).itens.length'),1);
  assert.equal(a.run('r.db.receitas.at(-1).itens[0].prodId===r.db.defensivos.at(-1).id'),true);
  assert.deepEqual(JSON.parse(a.run("JSON.stringify(r.db.talhoes.slice(-2).map(t=>[t.nome,t.cultura]))")),[['Nova Gleba','soja'],['Chapa','cobertura']]);
  assert.equal(a.run('r.db.talhoes.length'),a.run('db.talhoes.length')+2);
});
test('importação do PVgest ignora receita sem nenhum produto aproveitável e conta as ignoradas',()=>{
  const a=setup();const n=a.run('db.receitas.length');
  a.run(`globalThis.r=importaPvgest({produtos:[{id:7,nome:'Calda X'}],receitas:[
    {nome:'Boa',itens:[{produto:7,dose:2}]},{nome:'Só inexistente',itens:[{produto:99,dose:1}]},{nome:'Vazia',itens:[]},{nome:'Sem lista'}]},db)`);
  assert.equal(a.run('r.receitas'),1);assert.equal(a.run('r.semProduto'),3);
  assert.equal(a.run('r.db.receitas.length'),n+1);assert.equal(a.run('r.db.receitas.at(-1).nome'),'Boa');
  assert.equal(a.run('r.db.receitas.every(x=>x.itens.length>0)'),true);
  assert.equal(a.run('importaPvgest({talhoes:[]},db).semProduto'),0);
});
test('o banco resultante da importação do PVgest passa na validação estrita',()=>{
  const a=setup();
  a.run(`globalThis.r=importaPvgest({
    produtos:[{id:7,nome:'Calda X',unidade:'L',estoque_atual:3,preco:10}],
    receitas:[{nome:'Rec PV',cultura:'Café',itens:[{produto:7,dose:2}]},{nome:'Rec sem itens',itens:[{produto:99,dose:1}]}],
    talhoes:[{nome:'Nova Gleba',cultura:'Trigo',area:4},{nome:'Outra',cultura:'Feijão',area:2}]},db)`);
  assert.doesNotThrow(()=>a.run('normalizeDatabase(JSON.parse(JSON.stringify(r.db)),{strict:true})'));
});
test('polígono do mapa pode ser excluído e libera o talhão',async()=>{
  const a=setup();
  a.run("db.geoTalhoes=[{id:'g1',talhaoId:'c1',nome:'X',cultura:'cafe',coords:[[-45,-19],[-45.01,-19],[-45,-19.01]],areaHa:1}]");
  assert.match(a.run('pgMapa()'),/data-action="del" data-col="geoTalhoes" data-id="g1"/);
  await a.click('del','geoTalhoes','g1');
  assert.equal(a.run('db.geoTalhoes.length'),0);
  assert.equal(a.run("referencesFor('talhoes','c1').some(x=>x[0]==='geoTalhoes')"),false);
});
test('polígono não vinculado também tem botão de excluir, sem o botão da ficha',()=>{
  const a=setup();
  a.run("db.geoTalhoes=[{id:'g2',talhaoId:'',nome:'Solto',cultura:'',coords:[[-45,-19],[-45.01,-19],[-45,-19.01]],areaHa:1}]");
  const html=a.run('pgMapa()');
  assert.match(html,/data-action="del" data-col="geoTalhoes" data-id="g2"/);
  assert.doesNotMatch(html,/Abrir ficha/);
  a.run("db.geoTalhoes[0].talhaoId='c1'");
  assert.match(a.run('pgMapa()'),/Abrir ficha<\/button> <button class="x" data-action="del" data-col="geoTalhoes" data-id="g2"/);
});
test('sacas beneficiadas podem ser corrigidas, nunca abaixo do vendido',async()=>{
  const a=setup();const id=a.run('db.lotes[0].id');
  assert.match(a.run('pgPos()'),/id="f-benef"[\s\S]*?L-2026-014 · 46 sc/);
  await a.submit('f-benef',{loteId:id,sacas:20});assert.equal(a.run('db.lotes[0].sacas'),46);
  await a.submit('f-benef',{loteId:id,sacas:40});assert.equal(a.run('db.lotes[0].sacas'),40);
  assert.equal(a.run('db.lotes[0].status'),'beneficiado');
});
test('correção de sacas abaixo do vendido do lote explica quantas já foram vendidas',async()=>{
  const a=setup();const id=a.run('db.lotes[0].id');
  await a.submit('f-benef',{loteId:id,sacas:29});
  assert.equal(a.run('globalThis.errors[0].field'),'sacas');
  assert.equal(a.run('globalThis.errors[0].message'),'Este lote já tem 30 saca(s) vendidas.');
  await a.submit('f-benef',{loteId:id,sacas:30});assert.equal(a.run('db.lotes[0].sacas'),30);
});
test('correção de sacas não deixa o total beneficiado abaixo do total vendido',async()=>{
  const a=setup();const id=a.run('db.lotes[0].id');
  a.run("db.vendasCafe.push({id:'vx',data:'2026-07-20',loteId:'',sacas:10,preco:2000,comprador:'Avulso',nf:'1',obs:''})");
  await a.submit('f-benef',{loteId:id,sacas:35});
  assert.equal(a.run('globalThis.errors[0].field'),'sacas');
  assert.equal(a.run('globalThis.errors[0].message'),'As vendas de café já registradas excedem esse total.');
  assert.equal(a.run('db.lotes[0].sacas'),46);
  await a.submit('f-benef',{loteId:id,sacas:40});assert.equal(a.run('db.lotes[0].sacas'),40);
});
test('f-benef lista o lote seco antes dos já beneficiados e pede confirmação ao corrigir sacas',async()=>{
  const a=setup();
  a.run("db.lotes.push({id:'ls',codigo:'L-2026-099',data:'2026-08-01',talhaoId:'c1',origem:'Árvore',chuva:false,carretas:1,obs:'',status:'seco'})");
  assert.match(a.run('pgPos()'),/id="f-benef"[\s\S]*?<select name="loteId"><option value="ls">L-2026-099<\/option><option value="[^"]*">L-2026-014 · 46 sc<\/option>/);
  a.run("globalThis.perguntas=[];confirm=m=>{perguntas.push(m);return false}");
  const id=a.run('db.lotes[0].id');
  await a.submit('f-benef',{loteId:id,sacas:40});
  assert.equal(a.run('db.lotes[0].sacas'),46);
  assert.deepEqual(JSON.parse(a.run('JSON.stringify(perguntas)')),['Corrigir as sacas de L-2026-014 de 46 para 40 sc?']);
  await a.submit('f-benef',{loteId:'ls',sacas:20});
  assert.equal(a.run('perguntas.length'),1);
  assert.equal(a.run("db.lotes.find(l=>l.id==='ls').status"),'beneficiado');
  a.run('confirm=()=>true');
  await a.submit('f-benef',{loteId:id,sacas:40});assert.equal(a.run('db.lotes[0].sacas'),40);
});
test('excluir o único abastecimento avisa que o horímetro da máquina continua alto',async()=>{
  const a=setup();a.run("db.abastecimentos=[];showStatus=m=>{globalThis.status=m}");
  const m=a.run('db.maquinas[0].id');
  await a.submit('f-abast',{data:'2026-07-20',maqId:m,litros:100,horimetro:42300,obs:''});
  const rid=a.run('db.abastecimentos.at(-1).id');
  await a.click('del','abastecimentos',rid);
  assert.equal(a.run('db.maquinas[0].horimetro'),42300);
  assert.equal(a.run('status'),'Registro excluído. Confira o horímetro de Trator John Deere 6110J em Oficina: ele ainda mostra 42.300 h.');
  /* com outros abastecimentos a máquina é recalculada e não há aviso; horímetro ajustado à mão também não avisa */
  await a.submit('f-abast',{data:'2026-07-21',maqId:m,litros:100,horimetro:4300,obs:''});
  await a.submit('f-abast',{data:'2026-07-22',maqId:m,litros:100,horimetro:4310,obs:''});
  await a.click('del','abastecimentos',a.run('db.abastecimentos.at(-1).id'));
  assert.equal(a.run('status'),'Registro excluído.');
  a.run("db.maquinas[0].horimetro=5000");
  await a.click('del','abastecimentos',a.run('db.abastecimentos.at(-1).id'));
  assert.equal(a.run('status'),'Registro excluído.');
});
test('abastecimentos da mesma máquina no mesmo dia respeitam a ordem de lançamento',async()=>{
  const a=setup();
  a.run("db.maquinas=[{id:'mq',nome:'T',horimetro:4400,proxRev:0}];db.abastecimentos=[{id:'a1',data:'2026-07-20',maqId:'mq',litros:1,horimetro:4300,obs:''},{id:'a2',data:'2026-07-20',maqId:'mq',litros:1,horimetro:4400,obs:''}]");
  const dados=h=>({data:'2026-07-20',maqId:'mq',litros:50,horimetro:h,obs:''});
  /* inclusão: entra depois dos que já estão no dia */
  await a.submit('f-abast',dados(4350));
  assert.equal(a.run('db.abastecimentos.length'),2);
  assert.match(a.run('globalThis.errors[0].message'),/menor que 4\.400 h, registrado num abastecimento anterior/);
  await a.submit('f-abast',dados(4400));assert.equal(a.run('db.abastecimentos.length'),3);
  /* edição: o a1 não passa dos que vêm depois dele no dia, o a2 não fica abaixo do a1 */
  await a.submit('f-abast',dados(4500),'a1');
  assert.match(a.run('globalThis.errors[0].message'),/não pode passar de 4\.400 h, registrado num abastecimento posterior/);
  assert.equal(a.run("db.abastecimentos.find(x=>x.id==='a1').horimetro"),4300);
  await a.submit('f-abast',dados(4200),'a2');
  assert.match(a.run('globalThis.errors[0].message'),/menor que 4\.300 h, registrado num abastecimento anterior/);
  assert.equal(a.run("db.abastecimentos.find(x=>x.id==='a2').horimetro"),4400);
  await a.submit('f-abast',dados(4350),'a1');
  assert.equal(a.run("db.abastecimentos.find(x=>x.id==='a1').horimetro"),4350);
  /* outra máquina e outro dia não entram na conta */
  a.run("db.maquinas.push({id:'mq2',nome:'U',horimetro:100,proxRev:0})");
  await a.submit('f-abast',{data:'2026-07-20',maqId:'mq2',litros:5,horimetro:90,obs:''});
  assert.equal(a.run("db.abastecimentos.filter(x=>x.maqId==='mq2').length"),1);
});
test('clicar no item de menu da tela atual volta ao topo, e as ações na tela continuam mantendo a rolagem',async()=>{
  const a=setup(null,'#cafe');a.elements.get('main').focus=()=>{};
  a.run("rotaDesenhada='cafe'");
  assert.equal(a.run('rolagemAposRender(rotaDesenhada,rota,500)'),500);
  await a.nav('cafe');
  assert.equal(a.run('rolagemAposRender(rotaDesenhada,rota,500)'),0);
  assert.equal(a.run('rota'),'cafe');
});
test('Beneficiar preenche as sacas atuais do lote selecionado e recusa lote que não está seco nem beneficiado',async()=>{
  const a=setup();
  /* só há o lote beneficiado: o campo já abre com as sacas dele */
  assert.match(a.run('pgPos()'),/id="f-benef"[\s\S]*?name="sacas" value="46"/);
  a.run("db.lotes.push({id:'ls',codigo:'L-2026-099',data:'2026-08-01',talhaoId:'c1',origem:'Árvore',chuva:false,carretas:1,obs:'',status:'seco'})");
  /* o seco vem primeiro: campo vazio */
  assert.match(a.run('pgPos()'),/id="f-benef"[\s\S]*?name="sacas" value=""/);
  a.run("globalThis.fb={elements:{sacas:{value:'x'},loteId:{value:''}}}");
  const alvo=id=>({name:'loteId',value:id,closest:sel=>sel==='#f-benef'?a.run('fb'):null});
  await a.change(alvo(a.run('db.lotes[0].id')));assert.equal(a.run('fb.elements.sacas.value'),'46');
  await a.change(alvo('ls'));assert.equal(a.run('fb.elements.sacas.value'),'');
  /* lote que não está seco nem beneficiado é recusado, com o lote intacto */
  a.run("db.lotes.find(l=>l.id==='ls').status='terreiro'");
  await a.submit('f-benef',{loteId:'ls',sacas:20});
  assert.equal(a.run("db.lotes.find(l=>l.id==='ls').status"),'terreiro');
  assert.equal(a.run('globalThis.errors[0].field'),'loteId');
  assert.equal(a.run('globalThis.errors[0].message'),'Este lote ainda não está seco. Conclua a secagem antes de beneficiar.');
});
test('mensagens de saldo de sacas mostram a fração em vez de arredondar',async()=>{
  const a=setup();const id=a.run('db.lotes[0].id');
  a.run("db.vendasCafe[0].sacas=30.4");
  await a.submit('f-benef',{loteId:id,sacas:30});
  assert.equal(a.run('globalThis.errors[0].message'),'Este lote já tem 30,4 saca(s) vendidas.');
  await a.submit('f-vcafe',{data:'2026-09-07',loteId:id,sacas:16,preco:1000});
  assert.equal(a.run('globalThis.errors[0].message'),'Este lote tem apenas 15,6 saca(s) disponíveis.');
  /* inteiros continuam sem casas decimais */
  a.run("db.vendasCafe[0].sacas=30");
  await a.submit('f-benef',{loteId:id,sacas:29});
  assert.equal(a.run('globalThis.errors[0].message'),'Este lote já tem 30 saca(s) vendidas.');
});
test('lote seco continua sendo beneficiado e aparece sem contagem de sacas no seletor',async()=>{
  const a=setup();a.run("db.lotes[1].status='seco'");const id=a.run('db.lotes[1].id');
  const html=a.run('pgPos()');
  assert.match(html,/<option value="[^"]*">L-2026-015<\/option>/);
  assert.match(html,/Beneficiar lote seco \/ corrigir sacas/);
  await a.submit('f-benef',{loteId:id,sacas:20});
  assert.equal(a.run('db.lotes[1].sacas'),20);assert.equal(a.run('db.lotes[1].status'),'beneficiado');
});
