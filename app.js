'use strict';
/* ============ estado ============ */
const LS='pvgest-erp-v1';
const LS_RECOVERY='pvgest-erp-v1-recovery';
const DB_VERSION=4;
const DB_ARRAYS=['talhoes','cafe','cargas','fin','func','apont','maquinas','os','estoque','medicoes',
  'defensivos','receitas','pulvOS','regColheita','regAplicacao','lotes','secagens','coberturas',
  'combCompras','abastecimentos','lembretes','vendasCafe','chuvas','leiturasDT','solos','adubacoes',
  'podas','arruacoes','capinas','documentos','geoTalhoes','mip','bienal'];
const CORE_ARRAYS=['talhoes','cafe','cargas','fin','func','apont','maquinas','os','estoque'];
const uid=()=>globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2)+Date.now().toString(36);

/* GitHub Pages não permite X-Frame-Options customizado. Este bloqueio complementa a CSP e
   impede o uso normal do app dentro de iframes de terceiros. */
try{if(window.top!==window.self)window.top.location=window.self.location.href;}catch(e){document.documentElement.innerHTML='';}
function seed(){
  const T=(id,nome,cultura,area,variedade)=>({id,nome,cultura,area,variedade:variedade||''});
  const talhoes=[
    T('c1','Santa Rita','cafe',12,'Catuaí Vermelho'),T('c2','Boa Vista','cafe',8.5,'Arara'),
    T('c3','Serra','cafe',6,'Mundo Novo'),
    T('m1','Pivô 1','milho',35,'DKB 390'),T('m2','Sequeiro Norte','milho',28,'AG 8088'),
    T('s1','Baixada','soja',40,'Intacta RR2'),T('s2','Chapada','soja',32,'58I60 RSF'),
    T('g1','Pivô 2','sorgo',22,'Enforcer'),T('t1','Sequeiro Sul','trigo',18,'TBIO Toruk')];
  const cafe=[
    /* histórico: 2023/24 de carga alta, 2024/25 de carga baixa — a bienalidade do cafeeiro */
    ['2024-05-20','c1','Manual (pano)',52000,15],['2024-06-14','c1','Manual (pano)',68000,16],
    ['2024-07-08','c1','Varrição',44000,8],
    ['2024-05-24','c2','Manual (pano)',24000,9],['2024-06-18','c2','Manual (pano)',31000,10],
    ['2024-07-12','c2','Varrição',16000,6],
    ['2024-06-02','c3','Manual (pano)',12500,7],['2024-06-26','c3','Manual (pano)',13000,7],
    ['2024-07-16','c3','Varrição',6000,4],
    ['2025-05-22','c1','Manual (pano)',34000,12],['2025-06-16','c1','Manual (pano)',41000,13],
    ['2025-07-10','c1','Varrição',23000,6],
    ['2025-05-28','c2','Manual (pano)',12000,7],['2025-06-20','c2','Manual (pano)',14500,8],
    ['2025-07-14','c2','Varrição',7500,4],
    ['2025-06-05','c3','Manual (pano)',8000,5],['2025-06-28','c3','Manual (pano)',8500,5],
    ['2025-07-18','c3','Varrição',4500,3],
    ['2026-05-05','c1','Manual (pano)',18500,12],['2026-05-08','c2','Manual (pano)',9200,8],
    ['2026-05-12','c1','Manual (pano)',21000,14],['2026-05-15','c3','Manual (pano)',7600,6],
    ['2026-05-19','c1','Manual (pano)',24500,15],['2026-05-22','c2','Manual (pano)',13000,9],
    ['2026-05-26','c1','Manual (pano)',27000,16],['2026-05-29','c3','Manual (pano)',9800,7],
    ['2026-06-02','c2','Manual (pano)',16500,10],['2026-06-05','c1','Mecanizada',32000,3,11],
    ['2026-06-09','c1','Manual (pano)',23500,15],['2026-06-12','c3','Manual (pano)',10500,8],
    ['2026-06-16','c2','Manual (pano)',14000,9],['2026-06-19','c1','Manual (pano)',19800,13],
    ['2026-06-23','c3','Varrição',4200,5],['2026-06-26','c2','Manual (pano)',11500,8],
    ['2026-06-30','c1','Varrição',6500,7],['2026-07-03','c2','Varrição',3800,5],
    ['2026-07-07','c3','Varrição',3000,4],['2026-07-10','c1','Varrição',5400,6]
  ].map(r=>({id:uid(),data:r[0],talhaoId:r[1],tipo:r[2],litros:r[3],colhedores:r[4],valorMedida:9,horas:r[5]||0}));
  const cg=(cult,r)=>({id:uid(),cultura:cult,data:r[0],talhaoId:r[1],motorista:r[2],placa:r[3],
    bruto:r[4],tara:r[5],umidade:r[6],nf:r[7],destino:r[8],preco:r[9],pago:r[10]});
  const cargas=[
    ...[['2026-06-15','m1','Carlos Souza','QNP-4D21',41200,15300,15.8,'12451','Cooperativa Regional',60,true],
    ['2026-06-17','m1','Pedro Alves','RTA-7B90',40850,15100,15.2,'12452','Cooperativa Regional',60,true],
    ['2026-06-19','m2','Carlos Souza','QNP-4D21',39900,15300,16.4,'12458','Cerealista São João',58.5,true],
    ['2026-06-23','m1','José Ramos','PXK-2C55',42100,15600,14.9,'12463','Cooperativa Regional',61,true],
    ['2026-06-26','m2','Pedro Alves','RTA-7B90',40200,15100,15.9,'12470','Cerealista São João',59,false],
    ['2026-06-30','m1','Carlos Souza','QNP-4D21',41750,15300,14.6,'12477','Cooperativa Regional',62,false],
    ['2026-07-03','m2','José Ramos','PXK-2C55',39600,15600,16.1,'12481','Cerealista São João',60,false],
    ['2026-07-08','m1','Pedro Alves','RTA-7B90',42300,15100,14.4,'12490','Cooperativa Regional',63,false],
    ['2026-07-13','m2','Carlos Souza','QNP-4D21',40900,15300,15.5,'12497','Cooperativa Regional',62.5,false]]
      .map(r=>cg('milho',r)),
    ...[['2026-02-18','s1','Carlos Souza','QNP-4D21',42600,15300,13.2,'11902','Trading Alfa',126,true],
    ['2026-02-21','s1','Pedro Alves','RTA-7B90',41900,15100,12.8,'11910','Trading Alfa',126,true],
    ['2026-02-25','s2','José Ramos','PXK-2C55',42200,15600,13.6,'11921','Cooperativa Regional',124,true],
    ['2026-03-02','s1','Carlos Souza','QNP-4D21',43100,15300,12.9,'11934','Trading Alfa',128,true],
    ['2026-03-05','s2','Pedro Alves','RTA-7B90',41500,15100,13.9,'11940','Cooperativa Regional',125,true],
    ['2026-03-10','s2','José Ramos','PXK-2C55',42800,15600,13.1,'11951','Trading Alfa',127,true],
    ['2026-03-14','s1','Carlos Souza','QNP-4D21',42000,15300,12.7,'11963','Trading Alfa',129,false]]
      .map(r=>cg('soja',r)),
    cg('sorgo',['2026-07-12','g1','José Ramos','PXK-2C55',39800,15600,14.2,'12495','Cerealista São João',42,false])];
  const fn=(r)=>({id:uid(),data:r[0],tipo:r[1],categoria:r[2],centro:r[3],desc:r[4],valor:r[5],status:r[6]});
  const fin=[
    ['2026-02-28','entrada','Venda de grãos','Soja','Soja — NFs 11902/11910/11921',158400,'realizado'],
    ['2026-03-20','entrada','Venda de grãos','Soja','Soja — NFs 11934/11940/11951',162300,'realizado'],
    ['2026-03-05','saida','Insumos','Cafe','Adubação pós-colheita (compra antecipada)',48200,'realizado'],
    ['2026-03-31','saida','Folha de pagamento','Adm','Folha março',26400,'realizado'],
    ['2026-04-14','saida','Combustível','Oficina','Diesel S10 — 4.000 L',23800,'realizado'],
    ['2026-04-30','saida','Folha de pagamento','Adm','Folha abril',26900,'realizado'],
    ['2026-05-12','saida','Insumos','Milho','Defensivos milho safrinha',31500,'realizado'],
    ['2026-05-31','saida','Folha de pagamento','Adm','Folha maio + turma de colheita',44200,'realizado'],
    ['2026-06-10','entrada','Venda de grãos','Milho','Milho — NFs 12451/12452/12458/12463',101600,'realizado'],
    ['2026-06-18','saida','Manutenção','Oficina','Peças colhedora + revisão trator',12750,'realizado'],
    ['2026-06-30','saida','Folha de pagamento','Adm','Folha junho + turma de colheita',51800,'realizado'],
    ['2026-07-04','saida','Combustível','Oficina','Diesel S10 — 3.500 L',20300,'realizado'],
    ['2026-07-10','entrada','Adiantamento cooperativa','Cafe','Adiantamento sobre café depositado',80000,'realizado'],
    ['2026-07-14','entrada','Venda de café','Cafe','Café — NF 12501 (30 sc × R$ 2.450)',73500,'realizado'],
    ['2026-07-20','saida','Impostos','Adm','FUNRURAL + ITR parcela',9800,'previsto'],
    ['2026-07-25','entrada','Venda de grãos','Milho','Milho — NFs 12470/12477 (prazo)',49400,'previsto'],
    ['2026-07-31','saida','Folha de pagamento','Adm','Folha julho + turma de colheita',53000,'previsto'],
    ['2026-08-05','saida','Energia elétrica','Adm','CEMIG — pivô + sede',7400,'previsto'],
    ['2026-08-12','saida','Manutenção','Oficina','Filtros e óleo — plano preventivo',4300,'previsto']
  ].map(fn);
  const func=[
    {id:uid(),nome:'Ana Lima',funcao:'Gerente administrativa',tipo:'fixo',valor:4800},
    {id:uid(),nome:'João Pereira',funcao:'Tratorista',tipo:'fixo',valor:3200},
    {id:uid(),nome:'Marcos Silva',funcao:'Mecânico',tipo:'fixo',valor:3600},
    {id:uid(),nome:'Rita Gomes',funcao:'Colhedora (turma café)',tipo:'safrista',valor:120},
    {id:uid(),nome:'Sebastião Cruz',funcao:'Colhedor (turma café)',tipo:'safrista',valor:120},
    {id:uid(),nome:'Luzia Andrade',funcao:'Colhedora (turma café)',tipo:'safrista',valor:120}];
  const apont=[
    {id:uid(),data:'2026-07-04',funcId:func[3].id,atividade:'Colheita café — Santa Rita',dias:6,valor:720},
    {id:uid(),data:'2026-07-04',funcId:func[4].id,atividade:'Colheita café — Santa Rita',dias:6,valor:720},
    {id:uid(),data:'2026-07-11',funcId:func[3].id,atividade:'Varrição — Boa Vista',dias:5,valor:600},
    {id:uid(),data:'2026-07-11',funcId:func[5].id,atividade:'Varrição — Serra',dias:5,valor:600}];
  const maquinas=[
    {id:uid(),nome:'Trator John Deere 6110J',tipo:'Trator',horimetro:4210,proxRev:4400},
    {id:uid(),nome:'Colhedora de café K3',tipo:'Colhedora',horimetro:1185,proxRev:1200},
    {id:uid(),nome:'Pulverizador Uniport 2000',tipo:'Pulverizador',horimetro:2310,proxRev:2500},
    {id:uid(),nome:'Caminhão MB 1620',tipo:'Caminhão',horimetro:8740,proxRev:9000},
    {id:uid(),nome:'Trator Valtra A950',tipo:'Trator',horimetro:6120,proxRev:6100}];
  const os=[
    {id:uid(),codigo:'OS-2026-001',data:'2026-06-14',prazo:'2026-06-16',categoria:'Manutenção',modulo:'Oficina',
      maqId:maquinas[1].id,responsavelId:func[2].id,tipo:'Corretiva',titulo:'Troca de varetas e correia do cilindro',
      desc:'Troca de varetas e correia do cilindro',prioridade:'alta',pecas:3850,mo:900,status:'concluida',progresso:100,
      meta:1,realizado:1,unidade:'serviço',iniciadoEm:'2026-06-14T08:00:00',concluidoEm:'2026-06-16T16:30:00',
      checklist:[{id:uid(),texto:'Testar cilindro após a troca',feito:true}],
      apontamentos:[{id:uid(),data:'2026-06-16',criadoEm:'2026-06-16T16:30:00',texto:'Serviço concluído e máquina liberada.',progresso:100,realizado:1,status:'concluida'}]},
    {id:uid(),codigo:'OS-2026-002',data:'2026-06-16',prazo:'2026-06-17',categoria:'Manutenção',modulo:'Oficina',
      maqId:maquinas[0].id,responsavelId:func[2].id,tipo:'Preventiva',titulo:'Revisão de 4.200 horas',
      desc:'Óleo, filtros e lubrificação geral',prioridade:'normal',pecas:1620,mo:400,status:'concluida',progresso:100,
      meta:1,realizado:1,unidade:'serviço',iniciadoEm:'2026-06-16T07:30:00',concluidoEm:'2026-06-17T11:00:00',
      checklist:[],apontamentos:[]},
    {id:uid(),codigo:'OS-2026-003',data:'2026-07-02',prazo:'2026-08-08',categoria:'Manutenção',modulo:'Oficina',
      maqId:maquinas[3].id,responsavelId:func[2].id,tipo:'Corretiva',titulo:'Reparo da embreagem',
      desc:'Embreagem patinando — orçamento aprovado',prioridade:'alta',pecas:5200,mo:1500,status:'em_execucao',progresso:35,
      meta:1,realizado:0,unidade:'serviço',iniciadoEm:'2026-08-03T08:15:00',concluidoEm:'',
      checklist:[{id:uid(),texto:'Desmontar conjunto da embreagem',feito:true},{id:uid(),texto:'Substituir platô e disco',feito:false}],
      apontamentos:[{id:uid(),data:'2026-08-03',criadoEm:'2026-08-03T11:40:00',texto:'Conjunto desmontado; aguardando chegada do platô.',progresso:35,realizado:0,status:'em_execucao'}]},
    {id:uid(),codigo:'OS-2026-004',data:'2026-07-12',prazo:'2026-08-05',categoria:'Manutenção',modulo:'Oficina',
      maqId:maquinas[4].id,responsavelId:func[2].id,tipo:'Preventiva',titulo:'Revisão de 6.100 horas',
      desc:'Revisão vencida — agendar parada da máquina',prioridade:'critica',pecas:0,mo:0,status:'planejada',progresso:0,
      meta:1,realizado:0,unidade:'serviço',iniciadoEm:'',concluidoEm:'',checklist:[],apontamentos:[]},
    {id:uid(),codigo:'OS-2026-005',data:'2026-08-01',prazo:'2026-08-06',categoria:'Operação',modulo:'Campo',
      talhaoId:'c2',maqId:maquinas[4].id,responsavelId:func[1].id,tipo:'Tratos culturais',titulo:'Roçada das entrelinhas',
      desc:'Roçar as entrelinhas do talhão Boa Vista antes da adubação.',prioridade:'alta',pecas:0,mo:0,status:'em_execucao',progresso:45,
      meta:8.5,realizado:3.8,unidade:'ha',iniciadoEm:'2026-08-03T07:00:00',concluidoEm:'',
      checklist:[{id:uid(),texto:'Inspecionar trincha e proteções',feito:true},{id:uid(),texto:'Sinalizar carreadores',feito:true}],
      apontamentos:[{id:uid(),data:'2026-08-03',criadoEm:'2026-08-03T17:10:00',texto:'Concluídos 3,8 ha no setor norte.',progresso:45,realizado:3.8,status:'em_execucao'}]},
    {id:uid(),codigo:'OS-2026-006',data:'2026-08-05',prazo:'2026-08-10',categoria:'Operação',modulo:'Grãos',
      talhaoId:'m2',maqId:maquinas[0].id,responsavelId:func[1].id,tipo:'Adubação',titulo:'Adubação de cobertura do milho',
      desc:'Aplicar ureia conforme recomendação agronômica.',prioridade:'normal',pecas:0,mo:0,status:'planejada',progresso:0,
      meta:28,realizado:0,unidade:'ha',iniciadoEm:'',concluidoEm:'',checklist:[],apontamentos:[]}];
  const estoque=[
    {id:uid(),nome:'Óleo motor 15W40 (L)',cat:'Consumível',qtd:38,min:40,local:'Prateleira A1',resp:''},
    {id:uid(),nome:'Filtro de óleo JD (RE504836)',cat:'Peça',qtd:6,min:4,local:'A2',resp:''},
    {id:uid(),nome:'Filtro de ar Valtra',cat:'Peça',qtd:1,min:2,local:'A2',resp:''},
    {id:uid(),nome:'Graxa MP2 (kg)',cat:'Consumível',qtd:22,min:10,local:'A3',resp:''},
    {id:uid(),nome:'Parafuso 5/16" x 1" (un)',cat:'Suprimento',qtd:480,min:200,local:'Gaveteiro B',resp:''},
    {id:uid(),nome:'Porca 5/16" (un)',cat:'Suprimento',qtd:150,min:200,local:'Gaveteiro B',resp:''},
    {id:uid(),nome:'Arruela lisa 5/16" (un)',cat:'Suprimento',qtd:600,min:200,local:'Gaveteiro B',resp:''},
    {id:uid(),nome:'Correia A-42',cat:'Peça',qtd:3,min:2,local:'A4',resp:''},
    {id:uid(),nome:'Jogo chaves combinadas 6–32 mm',cat:'Ferramenta',qtd:2,min:2,local:'Painel',resp:'Marcos Silva'},
    {id:uid(),nome:'Macaco hidráulico 12 t',cat:'Ferramenta',qtd:1,min:1,local:'Piso',resp:''},
    {id:uid(),nome:'Esmerilhadeira 4.1/2"',cat:'Ferramenta',qtd:1,min:1,local:'Painel',resp:'João Pereira'},
    {id:uid(),nome:'Luva vaqueta (par)',cat:'Suprimento',qtd:9,min:12,local:'Armário EPI',resp:''}];
  const medicoes=[
    ['2026-07-13','c2',func[3].id,'Varrição',7],['2026-07-13','c2',func[4].id,'Varrição',6],
    ['2026-07-13','c2',func[5].id,'Varrição',8],['2026-07-14','c2',func[3].id,'Varrição',6],
    ['2026-07-14','c2',func[4].id,'Varrição',7],['2026-07-14','c2',func[5].id,'Varrição',7],
    ['2026-07-15','c3',func[3].id,'Varrição',8],['2026-07-15','c3',func[4].id,'Varrição',5],
    ['2026-07-15','c3',func[5].id,'Varrição',6]
  ].map(r=>({id:uid(),data:r[0],talhaoId:r[1],funcId:r[2],tipo:r[3],medidas:r[4],valorMedida:9,acertada:false,consolidada:false}));
  const defensivos=[
    {id:uid(),nome:'Glifosato 480 SL',classe:'Herbicida',unidade:'L',preco:28,qtd:120,min:50,carencia:0,reentrada:24},
    {id:uid(),nome:'Azoxistrobina + Ciproconazol',classe:'Fungicida',unidade:'L',preco:185,qtd:24,min:10,carencia:30,reentrada:24},
    {id:uid(),nome:'Bifentrina 100 EC',classe:'Inseticida',unidade:'L',preco:95,qtd:8,min:10,carencia:21,reentrada:24},
    {id:uid(),nome:'Óleo mineral',classe:'Adjuvante',unidade:'L',preco:14,qtd:60,min:30,carencia:0,reentrada:0},
    {id:uid(),nome:'Espalhante adesivo',classe:'Adjuvante',unidade:'L',preco:22,qtd:12,min:5,carencia:0,reentrada:0},
    {id:uid(),nome:'Tiametoxam 250 WG',classe:'Inseticida',unidade:'kg',preco:320,qtd:15,min:5,carencia:45,reentrada:48}];
  const receitas=[
    {id:uid(),nome:'Ferrugem do cafeeiro — calda padrão',cultura:'Café',alvo:'Hemileia vastatrix',volumeHa:400,
     itens:[{prodId:defensivos[1].id,dose:0.5},{prodId:defensivos[3].id,dose:1},{prodId:defensivos[4].id,dose:0.1}]},
    {id:uid(),nome:'Dessecação pré-plantio',cultura:'Soja',alvo:'Plantas daninhas',volumeHa:150,
     itens:[{prodId:defensivos[0].id,dose:3},{prodId:defensivos[3].id,dose:0.5}]},
    {id:uid(),nome:'Drench sistêmico — via solo',cultura:'Café',alvo:'Bicho-mineiro / cigarras',volumeHa:400,
     itens:[{prodId:defensivos[5].id,dose:1}]}];
  const pulvOS=[
    {id:uid(),data:'2026-06-20',talhaoId:'c1',receitaId:receitas[0].id,area:12,obs:'Pós-colheita',status:'concluida',via:'Foliar'},
    {id:uid(),data:'2026-07-18',talhaoId:'c2',receitaId:receitas[0].id,area:8.5,obs:'',status:'aberta',via:'Foliar'},
    {id:uid(),data:'2026-07-22',talhaoId:'c3',receitaId:receitas[2].id,area:6,
     obs:'Esguicho na projeção da saia',status:'aberta',via:'Via solo (drench)'}];
  const regColheita=[
    {id:uid(),data:'2026-06-05',ano:2026,talhaoId:'c1',variedade:'Catuaí Vermelho',tipo:'Árvore',
     maquinaId:maquinas[1].id,vibracao:850,velocidade:1.2,obs:'Lavoura adensada — desfolha dentro do aceitável'},
    {id:uid(),data:'2026-06-28',ano:2026,talhaoId:'c3',variedade:'Mundo Novo',tipo:'Chão',
     maquinaId:'',vibracao:450,velocidade:0.8,obs:'Recolhedora rebocada — peneira 2, ventilador em 70%'}];
  const regAplicacao=[
    {id:uid(),data:'2026-06-19',maquinaId:maquinas[2].id,velocidade:6,rpm:1800,bico:'Cone vazio ATR 2.0 (amarelo)',
     numBicos:36,vazaoHa:400,vazaoBico:2,obs:'Pressão 6 bar — calda da ferrugem'}];
  const lotes=[
    {id:uid(),codigo:'L-2026-014',data:'2026-07-08',talhaoId:'c1',origem:'Árvore',chuva:false,carretas:4.6,
     obs:'Cereja predominante',status:'beneficiado',sacas:46,cobTipo:4,cobBebida:'Dura',scaa:82.5,
     sens:{aroma:8,sabor:7.75,acidez:7.5,corpo:8,fin:7.5},descritores:'Chocolate, caramelo, nozes',
     peneira:'17',peneiraPct:82},
    {id:uid(),codigo:'L-2026-015',data:'2026-07-12',talhaoId:'c2',origem:'Chão',chuva:true,carretas:3.8,
     obs:'Pegou chuva na 2ª noite de terreiro',status:'secando'},
    {id:uid(),codigo:'L-2026-016',data:'2026-07-15',talhaoId:'c3',origem:'Chão',chuva:false,carretas:2.4,obs:'',status:'terreiro'}];
  const vendasCafe=[
    {id:uid(),data:'2026-07-14',loteId:lotes[0].id,sacas:30,preco:2450,comprador:'Cooperativa Regional',nf:'12501',obs:'Bebida dura — lote L-2026-014'}];
  const chuvas=[
    {id:uid(),data:'2026-02-10',mm:45,obs:''},{id:uid(),data:'2026-02-22',mm:38,obs:''},
    {id:uid(),data:'2026-03-05',mm:52,obs:''},{id:uid(),data:'2026-03-18',mm:30,obs:''},
    {id:uid(),data:'2026-04-08',mm:22,obs:''},{id:uid(),data:'2026-05-02',mm:12,obs:''},
    {id:uid(),data:'2026-06-15',mm:4,obs:''},
    {id:uid(),data:'2026-07-12',mm:8,obs:'Fora de época — atingiu lotes de terreiro'}];
  const leiturasDT=[
    {id:uid(),data:'2026-07-15',temp:24,rh:62,vento:7,dt:4.9},
    {id:uid(),data:'2026-07-16',temp:27,rh:48,vento:11,dt:7.6}];
  const capinas=[
    {id:uid(),data:'2026-02-10',talhaoId:'c2',tipo:'Roçada mecânica',area:8.5,obs:'Entrelinhas — trincha no Valtra'},
    {id:uid(),data:'2026-05-30',talhaoId:'c3',tipo:'Capina química',area:6,obs:'Glifosato na linha — 2 L/ha'}];
  const arruacoes=[
    {id:uid(),data:'2026-04-25',talhaoId:'c1',tipo:'Arruação',area:12,obs:'Pré-colheita — ruas limpas para o pano'},
    {id:uid(),data:'2026-07-14',talhaoId:'c1',tipo:'Esparramação',area:12,obs:'Pós-colheita — cisco de volta à projeção da saia'}];
  const podas=[
    {id:uid(),data:'2025-08-20',talhaoId:'c3',tipo:'Esqueletamento',area:6,
     obs:'Pós-colheita — renovação da saia; safra 2026 será baixa neste talhão'},
    {id:uid(),data:'2026-07-05',talhaoId:'c1',tipo:'Desbrota',area:12,obs:''}];
  const adubacoes=[
    {id:uid(),data:'2025-10-15',talhaoId:'c2',operacao:'Calagem',produto:'Calcário dolomítico PRNT 85%',
     dose:2,unidade:'t/ha',area:8.5,obs:'Conforme análise de solo de 09/2025 (V% 45)'},
    {id:uid(),data:'2026-03-05',talhaoId:'c1',operacao:'Adubação',produto:'Formulado 20-05-20',
     dose:450,unidade:'kg/ha',area:12,obs:'Parcela 1/3 — pós-colheita'},
    {id:uid(),data:'2026-05-20',talhaoId:'m1',operacao:'Adubação',produto:'Ureia 45%',
     dose:200,unidade:'kg/ha',area:35,obs:'Cobertura do milho safrinha'}];
  const solos=[
    {id:uid(),data:'2025-09-12',talhaoId:'c1',prof:'0–20 cm',ph:5.4,mo:3.1,p:12.5,k:110,ca:2.8,mg:0.9,v:52,
     s:8,al:0.2,hal:4.2,ctc:8.8,m:4,b:0.4,cu:1.8,fe:38,mn:12,zn:2.1,argila:52,silte:18,areia:30,
     obs:'Recomendado 2 t/ha de calcário dolomítico'},
    {id:uid(),data:'2025-09-12',talhaoId:'c2',prof:'0–20 cm',ph:5.1,mo:2.8,p:8.2,k:95,ca:2.2,mg:0.7,v:45,
     s:6,al:0.5,hal:5.0,ctc:8.1,m:12,b:0.3,cu:1.2,fe:45,mn:9,zn:1.4,argila:48,silte:20,areia:32,
     obs:'V% baixo — corrigir antes das águas'},
    {id:uid(),data:'2024-08-30',talhaoId:'s1',prof:'0–20 cm',ph:5.8,mo:2.4,p:15.1,k:88,ca:3.1,mg:1.1,v:58,
     s:10,al:0.1,hal:3.6,ctc:8.5,m:2,b:0.5,cu:2,fe:30,mn:15,zn:2.8,argila:40,silte:15,areia:45,obs:''}];
  const secagens=[
    {id:uid(),loteId:lotes[0].id,dataInicio:'2026-07-10',umidadeEntrada:30,tempAr:60,tempMassa:38,
     umidadeSaida:11.8,horas:36,status:'concluida',
     leituras:[{h:0,u:30},{h:4,u:27.5},{h:8,u:25.1},{h:12,u:22.8},{h:16,u:20.5},{h:20,u:18.4},
       {h:24,u:16.2},{h:28,u:14.1},{h:32,u:12.6},{h:36,u:11.8}]},
    {id:uid(),loteId:lotes[1].id,dataInicio:'2026-07-15',umidadeEntrada:33,tempAr:58,tempMassa:36,
     status:'andamento',leituras:[{h:0,u:33},{h:4,u:30.8},{h:8,u:28.9}]}];
  const coberturas=[
    {id:uid(),data:'2026-03-20',talhaoId:'s1',especie:'Milheto ADR-300',operacao:'Plantio',area:40,obs:'Pós-soja'},
    {id:uid(),data:'2026-06-10',talhaoId:'m2',especie:'Braquiária ruziziensis',operacao:'Plantio',area:28,
     obs:'Consórcio com o milho safrinha'}];
  const combCompras=[
    {id:uid(),data:'2026-04-14',litros:4000,valor:23800,obs:'Diesel S10 — NF 8812'},
    {id:uid(),data:'2026-07-04',litros:3500,valor:20300,obs:'Diesel S10 — NF 9078'}];
  const abastecimentos=[
    {id:uid(),data:'2026-06-20',maqId:maquinas[0].id,litros:180,horimetro:4150,obs:''},
    {id:uid(),data:'2026-06-25',maqId:maquinas[1].id,litros:220,horimetro:1150,obs:'Colheita Santa Rita'},
    {id:uid(),data:'2026-07-05',maqId:maquinas[3].id,litros:300,horimetro:8700,obs:'Frete milho'},
    {id:uid(),data:'2026-07-08',maqId:maquinas[0].id,litros:190,horimetro:4195,obs:''},
    {id:uid(),data:'2026-07-10',maqId:maquinas[1].id,litros:210,horimetro:1185,obs:''},
    {id:uid(),data:'2026-07-15',maqId:maquinas[0].id,litros:175,horimetro:4210,obs:''}];
  const lembretes=[
    {id:uid(),maqId:maquinas[0].id,desc:'Troca de óleo motor + filtros',horimetroAlvo:4400,dataAlvo:'',
     obs:'Óleo 15W40 — 15 L; filtro RE504836',feito:false},
    {id:uid(),maqId:maquinas[4].id,desc:'Troca de óleo da transmissão',horimetroAlvo:6150,dataAlvo:'',obs:'',feito:false},
    {id:uid(),maqId:maquinas[3].id,desc:'Revisão do sistema de freios',horimetroAlvo:0,dataAlvo:'2026-07-25',
     obs:'Reclamação do motorista na descida da serra',feito:false}];
  return {version:DB_VERSION,params:{litrosPorSaca:480,litrosPorMedida:60,litrosPorCarreta:5000,minDiesel:1000,diariaMinima:100,mesInicioSafra:10},talhoes,cafe,cargas,fin,func,apont,maquinas,os,estoque,medicoes,defensivos,receitas,pulvOS,regColheita,regAplicacao,lotes,secagens,coberturas,combCompras,abastecimentos,lembretes,vendasCafe,chuvas,leiturasDT,solos,adubacoes,podas,arruacoes,capinas,documentos:[],geoTalhoes:[],mip:[],
    bienal:[].concat(...[['2023/24','alta'],['2024/25','baixa'],['2025/26','alta']].map(([s,c])=>
      ['c1','c2','c3'].map(t=>({id:uid(),talhaoId:t,safra:s,carga:c,obs:''}))))};
}

function migrateLegacyLinks(next){
  /* Versões antigas lançavam recebimentos agregados sem vínculo com as cargas. A migração
     divide o valor efetivamente recebido proporcionalmente entre as NFs citadas, preservando
     o total financeiro e tornando cada carga reversível sem duplicar receitas. */
  const alreadyLinked=new Set(next.fin.filter(f=>f.cargaId).map(f=>f.cargaId));
  next.fin=next.fin.flatMap(f=>{
    if(f.cargaId||f.vendaId||f.categoria!=='Venda de grãos')return [f];
    const matches=next.cargas.filter(c=>!alreadyLinked.has(c.id)&&c.nf&&String(f.desc||'').includes(String(c.nf)));
    if(!matches.length)return [f];
    const weights=matches.map(c=>cargaCalc(c).valor),total=weights.reduce((s,v)=>s+v,0)||matches.length;
    return matches.map((c,i)=>{
      alreadyLinked.add(c.id);const share=(Number(f.valor)||0)*(total===matches.length?1/matches.length:weights[i]/total);
      return {...f,id:i?uid():f.id,cargaId:c.id,valor:share,
        desc:`${String(c.cultura||'Grãos').replace(/^./,x=>x.toUpperCase())} — NF ${c.nf} (${Math.round(cargaCalc(c).sacas).toLocaleString('pt-BR')} sc)`};
    });
  });
  next.vendasCafe.forEach(v=>{
    if(!v.loteId){const l=next.lotes.find(x=>x.codigo&&String(v.obs||'').includes(x.codigo));if(l)v.loteId=l.id;}
    if(!next.fin.some(f=>f.vendaId===v.id)){
      const expected=(Number(v.sacas)||0)*(Number(v.preco)||0);
      const f=next.fin.find(x=>!x.cargaId&&!x.vendaId&&x.categoria==='Venda de café'&&
        ((v.nf&&String(x.desc||'').includes(v.nf))||(x.data===v.data&&Math.abs((Number(x.valor)||0)-expected)<0.01)));
      if(f)f.vendaId=v.id;
    }
  });
}
const OS_STATUS=['planejada','em_execucao','pausada','concluida','cancelada'];
const OS_PRIORIDADES=['baixa','normal','alta','critica'];
const OS_ATIVAS=new Set(['planejada','em_execucao','pausada']);
function normalizeOperationalOrders(next,{strict=false}={}){
  const usedCodes=new Set();
  next.os.forEach((o,i)=>{
    const legacyStatus=o.status==='aberta'?'planejada':o.status;
    if(strict&&legacyStatus&&!OS_STATUS.includes(legacyStatus))throw new Error(`Status inválido na ordem de serviço ${i+1}.`);
    if(o.checklist!==undefined&&!Array.isArray(o.checklist))throw new Error(`Checklist inválido na ordem de serviço ${i+1}.`);
    if(o.apontamentos!==undefined&&!Array.isArray(o.apontamentos))throw new Error(`Histórico inválido na ordem de serviço ${i+1}.`);
    const year=String(o.data||'').slice(0,4)||String(new Date().getFullYear());
    let codigo=String(o.codigo||'').trim();
    if(!codigo||usedCodes.has(codigo)){
      let seq=i+1;do{codigo=`OS-${year}-${String(seq++).padStart(3,'0')}`;}while(usedCodes.has(codigo));
    }
    usedCodes.add(codigo);o.codigo=codigo;
    o.status=OS_STATUS.includes(legacyStatus)?legacyStatus:'planejada';
    o.categoria=String(o.categoria||'Manutenção');o.modulo=String(o.modulo||'Oficina');
    o.titulo=String(o.titulo||o.desc||o.tipo||'Ordem de serviço');o.desc=String(o.desc||o.titulo||'');
    o.tipo=String(o.tipo||'Serviço');o.prioridade=OS_PRIORIDADES.includes(o.prioridade)?o.prioridade:'normal';
    o.data=String(o.data||'');o.prazo=String(o.prazo||o.data||'');
    o.talhaoId=String(o.talhaoId||'');o.maqId=String(o.maqId||'');o.responsavelId=String(o.responsavelId||'');
    o.pecas=Math.max(0,Number(o.pecas)||0);o.mo=Math.max(0,Number(o.mo)||0);
    o.progresso=o.status==='concluida'?100:Math.min(100,Math.max(0,Number(o.progresso)||0));
    o.meta=Math.max(0,Number(o.meta)||0);o.realizado=Math.max(0,Number(o.realizado)||0);o.unidade=String(o.unidade||'');
    o.iniciadoEm=String(o.iniciadoEm||'');o.concluidoEm=String(o.concluidoEm||'');
    o.checklist=(o.checklist||[]).map((item,j)=>({id:String(item?.id||uid()),texto:String(item?.texto||`Item ${j+1}`),feito:!!item?.feito}));
    o.apontamentos=(o.apontamentos||[]).map(item=>({id:String(item?.id||uid()),data:String(item?.data||o.data||''),
      criadoEm:String(item?.criadoEm||''),texto:String(item?.texto||''),progresso:Math.min(100,Math.max(0,Number(item?.progresso)||0)),
      realizado:Math.max(0,Number(item?.realizado)||0),status:OS_STATUS.includes(item?.status)?item.status:o.status}));
  });
}
function validateDatabaseIntegrity(data){
  const ids={};
  DB_ARRAYS.forEach(k=>{
    ids[k]=new Set();data[k].forEach((item,i)=>{
      if(typeof item.id!=='string'||!item.id.trim())throw new Error(`Registro sem identificador em ${k}, posição ${i+1}.`);
      if(!/^[A-Za-z0-9._:-]{1,128}$/.test(item.id))throw new Error(`Identificador inseguro em ${k}, posição ${i+1}.`);
      if(ids[k].has(item.id))throw new Error(`Identificador duplicado em ${k}: ${item.id}.`);ids[k].add(item.id);
    });
  });
  const refs=[
    ['cafe','talhaoId','talhoes',false],['cargas','talhaoId','talhoes',false],['apont','funcId','func',false],
    ['os','maqId','maquinas',true],['os','talhaoId','talhoes',true],['os','responsavelId','func',true],
    ['medicoes','talhaoId','talhoes',false],['medicoes','funcId','func',false],
    ['pulvOS','talhaoId','talhoes',false],['pulvOS','receitaId','receitas',false],['regColheita','talhaoId','talhoes',false],
    ['regColheita','maquinaId','maquinas',true],['regAplicacao','maquinaId','maquinas',false],['lotes','talhaoId','talhoes',false],
    ['secagens','loteId','lotes',false],['coberturas','talhaoId','talhoes',false],['abastecimentos','maqId','maquinas',false],
    ['lembretes','maqId','maquinas',false],['vendasCafe','loteId','lotes',true],['solos','talhaoId','talhoes',false],
    ['adubacoes','talhaoId','talhoes',false],['podas','talhaoId','talhoes',false],['arruacoes','talhaoId','talhoes',false],
    ['capinas','talhaoId','talhoes',false],['documentos','talhaoId','talhoes',true],['geoTalhoes','talhaoId','talhoes',true],
    ['mip','talhaoId','talhoes',false],['bienal','talhaoId','talhoes',false],['fin','cargaId','cargas',true],
    ['fin','vendaId','vendasCafe',true],['fin','pulvOSId','pulvOS',true]
  ];
  refs.forEach(([collection,field,target,optional])=>data[collection].forEach((item,i)=>{
    const value=item[field];if((value===undefined||value===null||value==='')&&optional)return;
    if(!ids[target].has(value))throw new Error(`Referência inválida em ${collection}, posição ${i+1}: ${field}.`);
  }));
  data.receitas.forEach((r,i)=>(r.itens||[]).forEach(item=>{if(!ids.defensivos.has(item.prodId))throw new Error(`Produto inválido na receita ${i+1}.`);}));
  const osCodes=new Set();
  data.os.forEach((o,i)=>{
    if(!o.codigo||osCodes.has(o.codigo))throw new Error(`Código ausente ou duplicado na ordem de serviço ${i+1}.`);osCodes.add(o.codigo);
    if(!OS_STATUS.includes(o.status)||!OS_PRIORIDADES.includes(o.prioridade))throw new Error(`Fluxo inválido na ordem de serviço ${o.codigo}.`);
    if(!o.titulo.trim()||!o.data||!o.prazo||o.prazo<o.data)throw new Error(`Planejamento inválido na ordem de serviço ${o.codigo}.`);
    if(!Number.isFinite(o.progresso)||o.progresso<0||o.progresso>100||o.status==='concluida'&&o.progresso!==100)
      throw new Error(`Progresso inválido na ordem de serviço ${o.codigo}.`);
    const nested=new Set();[...(o.checklist||[]),...(o.apontamentos||[])].forEach(item=>{
      if(!item.id||nested.has(item.id))throw new Error(`Item de acompanhamento inválido na ordem de serviço ${o.codigo}.`);nested.add(item.id);
    });
  });
  data.cargas.forEach((c,i)=>{const errors=cargaErrors(c);if(errors.length)throw new Error(`Carga inválida na posição ${i+1}: ${errors.join(' ')}`);});
  data.documentos.forEach((d,i)=>{if(!(/^image\//.test(d.mime)||d.mime==='application/pdf'))throw new Error(`Tipo de documento inválido na posição ${i+1}.`);});
  data.geoTalhoes.forEach((g,i)=>{
    if(!Array.isArray(g.coords)||g.coords.length<3||g.coords.some(c=>!Array.isArray(c)||c.length<2||
      !Number.isFinite(Number(c[0]))||!Number.isFinite(Number(c[1]))||Number(c[0])< -180||Number(c[0])>180||Number(c[1])< -90||Number(c[1])>90))
      throw new Error(`Geometria inválida no polígono ${i+1}.`);
  });
  data.mip.forEach((m,i)=>{const hasLat=m.lat!==null&&m.lat!==undefined&&m.lat!=='',hasLon=m.lon!==null&&m.lon!==undefined&&m.lon!=='';
    if(hasLat!==hasLon||(hasLat&&(!Number.isFinite(Number(m.lat))||!Number.isFinite(Number(m.lon))||Number(m.lat)< -90||Number(m.lat)>90||Number(m.lon)< -180||Number(m.lon)>180)))
      throw new Error(`Coordenadas MIP inválidas na posição ${i+1}.`);});
  const totalBeneficiado=data.lotes.reduce((s,l)=>s+(Number(l.sacas)||0),0),totalVendido=data.vendasCafe.reduce((s,v)=>s+(Number(v.sacas)||0),0);
  if(totalVendido>totalBeneficiado+0.001)throw new Error('As vendas de café excedem o total beneficiado.');
  data.lotes.forEach(l=>{const vendido=data.vendasCafe.filter(v=>v.loteId===l.id).reduce((s,v)=>s+(Number(v.sacas)||0),0);
    if(vendido>(Number(l.sacas)||0)+0.001)throw new Error(`As vendas excedem o saldo do lote ${l.codigo||l.id}.`);});
}
function normalizeDatabase(raw,{strict=false}={}){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('O backup não contém um banco de dados válido.');
  if(strict){
    if(!raw.params||typeof raw.params!=='object'||Array.isArray(raw.params))throw new Error('Parâmetros ausentes ou inválidos.');
    CORE_ARRAYS.forEach(k=>{if(!Array.isArray(raw[k]))throw new Error(`Coleção obrigatória ausente: ${k}.`);});
  }
  const defaults=seed(),next={version:DB_VERSION,params:{...defaults.params,...(raw.params||{})}};
  DB_ARRAYS.forEach(k=>{
    const value=raw[k];
    if(value!==undefined&&!Array.isArray(value))throw new Error(`A coleção ${k} precisa ser uma lista.`);
    next[k]=(value||[]).map((item,i)=>{
      if(!item||typeof item!=='object'||Array.isArray(item))throw new Error(`Registro inválido em ${k}, posição ${i+1}.`);
      return {...item};
    });
  });
  const positiveParams=['litrosPorSaca','litrosPorMedida','litrosPorCarreta','minDiesel','diariaMinima'];
  positiveParams.forEach(k=>{const v=Number(next.params[k]);next.params[k]=Number.isFinite(v)&&v>0?v:defaults.params[k];});
  const mi=Number(next.params.mesInicioSafra);next.params.mesInicioSafra=Number.isInteger(mi)&&mi>=1&&mi<=12?mi:10;
  next.cafe.forEach(r=>{if(r.tipo==='Derriça (árvore)')r.tipo='Manual (pano)';});
  next.medicoes.forEach(r=>{if(r.tipo==='Derriça (árvore)')r.tipo='Manual (pano)';});
  normalizeOperationalOrders(next,{strict});migrateLegacyLinks(next);if(strict)validateDatabaseIntegrity(next);
  return next;
}

let db;
try{db=normalizeDatabase(JSON.parse(localStorage.getItem(LS))||seed());}
catch(e){db=seed();}
/* gravação falhou (cota cheia, armazenamento bloqueado): sinaliza em vez de engolir —
   sem isto o usuário seguiria lançando dados que não estão sendo salvos */
let saveErro=false;
const save=(value=db)=>{try{localStorage.setItem(LS,JSON.stringify(value));saveErro=false;return true;}catch(e){saveErro=true;return false;}};

/* ============ util ============ */
const BRL=v=>(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});
const BRL2=v=>(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const N=(v,d=0)=>(v||0).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});
const dBR=s=>{const[y,m,d]=String(s||'').split('-');return y&&m&&d?d+'/'+m:'—';};
const dBRy=s=>{const[y,m,d]=String(s||'').split('-');return y&&m&&d?d+'/'+m+'/'+y.slice(2):'—';};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tal=id=>db.talhoes.find(t=>t.id===id)||{nome:'—',area:0};
const hasCoords=m=>m&&m.lat!==null&&m.lat!==undefined&&m.lat!==''&&m.lon!==null&&m.lon!==undefined&&m.lon!==''&&
  Number.isFinite(Number(m.lat))&&Number.isFinite(Number(m.lon));
/* data real do computador, em fuso local (toISOString devolveria UTC e viraria o dia à noite) */
const isoLocal=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const hoje=isoLocal(new Date());
const mesAtual=hoje.slice(0,7);
const mesNome=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
/* cargas: peso líquido corrigido por umidade (base 14%) e sacas de 60 kg */
function cargaCalc(c){
  const bruto=Math.max(0,Number(c.bruto)||0),tara=Math.max(0,Number(c.tara)||0);
  const umidade=Math.min(60,Math.max(0,Number(c.umidade)||0));
  const preco=Math.max(0,Number(c.preco)||0);
  const liq=Math.max(0,bruto-tara);
  const desc=Math.min(1,Math.max(0,(umidade-14))*1.5/100);
  const liqCor=Math.max(0,liq*(1-desc));
  const sacas=liqCor/60;
  return {liq,desc,liqCor,sacas,valor:sacas*preco};
}
function cargaErrors(c){
  const errors=[];
  if(!(Number(c.bruto)>0))errors.push('O peso bruto deve ser maior que zero.');
  if(!(Number(c.tara)>=0))errors.push('A tara não pode ser negativa.');
  if(Number(c.tara)>=Number(c.bruto))errors.push('A tara precisa ser menor que o peso bruto.');
  if(!(Number(c.umidade)>=0&&Number(c.umidade)<=60))errors.push('A umidade precisa estar entre 0% e 60%.');
  if(!(Number(c.preco)>0))errors.push('O preço por saca deve ser maior que zero.');
  return errors;
}
/* ano-safra bienal: a safra vai de mesInicioSafra até o mesmo mês do ano seguinte e é
   identificada pelos dois anos civis que atravessa (ex.: 'out/2025 → set/2026' = "2025/26").
   Com o início em outubro (padrão), soja, milho safrinha, café e trigo desta fazenda
   cabem inteiros na mesma safra, sem partir a colheita ao meio no réveillon. */
const safraDe=iso=>{
  const y=+String(iso||'').slice(0,4),m=+String(iso||'').slice(5,7);
  if(!y||!m)return '';
  const mi=db.params.mesInicioSafra||10;
  if(mi===1)return String(y);              /* início em janeiro: a safra é o próprio ano civil */
  const fim=m>=mi?y+1:y;
  return (fim-1)+'/'+String(fim).slice(2);
};
const safraAnterior=s=>{const ini=+String(s).slice(0,4);
  return (db.params.mesInicioSafra||10)===1?String(ini-1):(ini-1)+'/'+String(ini).slice(2);};
const safraSeguinte=s=>{const ini=+String(s).slice(0,4);
  return (db.params.mesInicioSafra||10)===1?String(ini+1):(ini+1)+'/'+String(ini+2).slice(2);};
/* período civil que a safra cobre, para exibir embaixo do seletor: "out/25 – set/26" */
const safraPeriodo=s=>{const mi=db.params.mesInicioSafra||10,ini=+String(s).slice(0,4);
  const fim=mi===1?ini:ini+1;
  return mesNome[mi-1]+'/'+String(ini).slice(2)+' – '+mesNome[(mi+10)%12]+'/'+String(fim).slice(2);};
/* filtro de safra global: '' = todas; 'AAAA/AA' filtra pela safra do campo de data.
   Abre na safra corrente: com histórico de várias safras, somar todas daria sc/ha sem sentido. */
let anoFiltro=safraDe(hoje);
const F=(arr,k='data')=>anoFiltro?arr.filter(x=>safraDe(x[k])===anoFiltro):arr;
const somaCargas=cult=>F(db.cargas).filter(c=>c.cultura===cult)
  .reduce((a,c)=>{const x=cargaCalc(c);a.sacas+=x.sacas;a.valor+=x.valor;if(!c.pago)a.aberto+=x.valor;return a;},{sacas:0,valor:0,aberto:0});
const areaCult=cult=>db.talhoes.filter(t=>t.cultura===cult).reduce((a,t)=>a+t.area,0);
const sacasDisponiveis=loteId=>{
  const l=db.lotes.find(x=>x.id===loteId);if(!l)return 0;
  return Math.max(0,(Number(l.sacas)||0)-db.vendasCafe.filter(v=>v.loteId===loteId).reduce((s,v)=>s+(Number(v.sacas)||0),0));
};
const estoqueCafeDisponivel=()=>Math.max(0,db.lotes.reduce((s,l)=>s+(Number(l.sacas)||0),0)-
  db.vendasCafe.reduce((s,v)=>s+(Number(v.sacas)||0),0));

/* ============ gráficos SVG ============ */
function roundTop(x,y,w,h,r){r=Math.min(r,w/2,h);
  return `M${x},${y+h} L${x},${y+r} Q${x},${y} ${x+r},${y} L${x+w-r},${y} Q${x+w},${y} ${x+w},${y+r} L${x+w},${y+h} Z`;}
function barChart({labels,series,fmt=N,h=210,ariaLabel=''}){
  const w=720,padL=44,padB=24,padT=14,cw=w-padL-8,ch=h-padT-padB;
  const max=Math.max(1,...series.flatMap(s=>s.values))*1.12;
  const n=labels.length,slot=cw/n,gw=Math.min(slot*.62,46),bw=(gw-2*(series.length-1))/series.length;
  let g='';
  for(let i=0;i<=3;i++){const y=padT+ch-ch*i/3;
    g+=`<line x1="${padL}" y1="${y}" x2="${w-8}" y2="${y}" stroke="var(--grid)"/>`+
       `<text x="${padL-6}" y="${y+4}" text-anchor="end">${fmt(max*i/3)}</text>`;}
  let bars='';
  labels.forEach((lb,i)=>{
    const x0=padL+slot*i+(slot-gw)/2;
    series.forEach((s,j)=>{
      const v=s.values[i],bh=Math.max(v>0?2:0,ch*v/max),x=x0+j*(bw+2),y=padT+ch-bh;
      if(bh>0)bars+=`<path d="${roundTop(x,y,bw,bh,4)}" fill="${s.color}" data-tip="${esc(lb)} — ${esc(s.name)}: ${esc(s.tipfmt?s.tipfmt(v):fmt(v))}"/>`;
    });
    const step=Math.ceil(n/12);
    if(i%step===0)bars+=`<text x="${x0+gw/2}" y="${h-6}" text-anchor="middle">${esc(lb)}</text>`;
  });
  const leg=series.length>1?`<div class="legend">${series.map(s=>`<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>`:'';
  const chartName=ariaLabel||`Gráfico de ${series.map(s=>s.name).join(' e ')}`;
  const chartDesc=labels.length?`${labels.length} períodos, de ${labels[0]} a ${labels[labels.length-1]}.`:'Sem dados no período.';
  return leg+`<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="${esc(chartName)}" style="display:block">`+
    `<title>${esc(chartName)}</title><desc>${esc(chartDesc)}</desc>`+
    g+`<line x1="${padL}" y1="${padT+ch}" x2="${w-8}" y2="${padT+ch}" stroke="var(--axis)"/>`+bars+'</svg>';
}
const kfmt=v=>v>=1000?N(v/1000,v>=10000?0:1)+' mil':N(v);

/* ============ páginas ============ */
const ROTAS=[
  ['dash','Visão geral','op'],['ordens','Ordens de serviço','op'],['cafe','Café','op'],['pos','Café · Pós-colheita','op'],
  ['milho','Milho','op'],['soja','Soja','op'],['sorgo','Sorgo','op'],['trigo','Trigo','op'],
  ['cobertura','Cobertura','op'],['intel','Café · Inteligência','op'],
  ['voz','Lançar por texto','op'],
  ['talhao','Ficha do talhão','op'],['mapa','Mapa · Talhões','op'],['pvgest','PVgest · Pulverização','op'],
  ['fin','Financeiro','adm'],['rh','RH & Turmas','adm'],['oficina','Oficina & Estoque','adm'],
  ['docs','Documentos','adm'],
  ['config','Cadastros & Dados','sys']];
const NOMES_CULT={cafe:'Café',milho:'Milho',soja:'Soja',sorgo:'Sorgo',trigo:'Trigo',cobertura:'Cobertura'};
const CORES_CULT={milho:'var(--milho)',soja:'var(--soja)',sorgo:'var(--sorgo)',trigo:'var(--trigo)'};
const rotaValida=id=>ROTAS.some(r=>r[0]===id);
const rotaHash=()=>{const id=decodeURIComponent(location.hash.slice(1));return rotaValida(id)?id:'dash';};
let rota=rotaHash();
let osFiltro='ativas',osSelecionada='';

function kpi(k,v,d){return `<div class="card"><div class="k">${k}</div><div class="v">${v}</div>${d?`<div class="d">${d}</div>`:''}</div>`;}

const OS_STATUS_INFO={
  planejada:{label:'Planejada',className:'warn'},em_execucao:{label:'Em execução',className:'good'},
  pausada:{label:'Pausada',className:'warn'},concluida:{label:'Concluída',className:'good'},
  cancelada:{label:'Cancelada',className:'crit'}
};
const OS_PRIORIDADE_INFO={
  baixa:{label:'Baixa',className:'good'},normal:{label:'Normal',className:'neutral'},
  alta:{label:'Alta',className:'warn'},critica:{label:'Crítica',className:'crit'}
};
const osStatusPill=o=>{const x=OS_STATUS_INFO[o.status]||OS_STATUS_INFO.planejada;return `<span class="pill ${x.className}">${x.label}</span>`;};
const osPrioridadePill=o=>{const x=OS_PRIORIDADE_INFO[o.prioridade]||OS_PRIORIDADE_INFO.normal;return `<span class="pill ${x.className}">${x.label}</span>`;};
const osAtrasada=o=>OS_ATIVAS.has(o.status)&&!!o.prazo&&o.prazo<hoje;
const osResponsavel=o=>db.func.find(f=>f.id===o.responsavelId)?.nome||'Não atribuído';
const osLocal=o=>[o.talhaoId?tal(o.talhaoId).nome:'',db.maquinas.find(m=>m.id===o.maqId)?.nome||''].filter(Boolean).join(' · ')||'Geral';
function nextOsCode(data=hoje){
  const year=String(data||hoje).slice(0,4),prefix=`OS-${year}-`;
  let n=Math.max(0,...db.os.map(o=>String(o.codigo||'').startsWith(prefix)?Number(String(o.codigo).slice(prefix.length))||0:0))+1;
  let code;do{code=prefix+String(n++).padStart(3,'0');}while(db.os.some(o=>o.codigo===code));return code;
}
function osProgressHTML(o){
  const p=Math.min(100,Math.max(0,Number(o.progresso)||0));
  return `<div class="os-progress"><progress max="100" value="${p}" aria-label="Progresso da ${esc(o.codigo)}: ${N(p)}%"></progress><span>${N(p)}%</span></div>`;
}
function osTransitionButtons(o){
  const actions={
    planejada:[['em_execucao','Iniciar execução',''],['cancelada','Cancelar','ghost']],
    em_execucao:[['pausada','Pausar','ghost'],['concluida','Concluir',''],['cancelada','Cancelar','ghost']],
    pausada:[['em_execucao','Retomar',''],['cancelada','Cancelar','ghost']]
  }[o.status]||[];
  return actions.map(([next,label,cl])=>`<button class="btn mini ${cl}" data-action="os-transicao" data-id="${o.id}" data-next="${next}">${label}</button>`).join('');
}
function pgOsDetalhe(o){
  const ativo=OS_ATIVAS.has(o.status),meta=Number(o.meta)||0,realizado=Number(o.realizado)||0;
  const logs=(o.apontamentos||[]).slice().sort((a,b)=>String(a.criadoEm||a.data)<String(b.criadoEm||b.data)?1:-1);
  return `<section class="panel os-detail" aria-labelledby="os-detail-title">
    <div class="os-detail-head"><div><div class="os-code">${esc(o.codigo)}</div><h2 id="os-detail-title">${esc(o.titulo)}</h2>
      <p class="sub">${esc(o.modulo)} · ${esc(o.categoria)} · ${esc(osLocal(o))}</p></div>
      <div class="os-actions">${osTransitionButtons(o)}<button class="btn mini ghost" data-action="os-edit" data-id="${o.id}">Editar planejamento</button></div></div>
    <div class="os-summary">
      <div><span>Status</span>${osStatusPill(o)}</div><div><span>Prioridade</span>${osPrioridadePill(o)}</div>
      <div><span>Responsável</span><b>${esc(osResponsavel(o))}</b></div><div><span>Prazo</span><b class="${osAtrasada(o)?'crit-text':''}">${dBRy(o.prazo)}${osAtrasada(o)?' · atrasada':''}</b></div>
      <div><span>Execução</span>${osProgressHTML(o)}</div><div><span>Meta</span><b>${meta?`${N(realizado,1)} de ${N(meta,1)} ${esc(o.unidade)}`:'Não informada'}</b></div>
    </div>
    ${o.desc?`<p class="note">${esc(o.desc)}</p>`:''}
    <div class="row2 os-workspace">
      <div><h2>Checklist</h2>
        ${ativo?`<form class="f os-inline-form" id="f-os-check"><input type="hidden" name="osId" value="${o.id}"><label>Novo item<input name="texto" required maxlength="160" placeholder="Ex.: inspecionar EPI"></label><button class="btn ghost">Adicionar</button></form>`:''}
        <ul class="os-checklist">${(o.checklist||[]).length?(o.checklist||[]).map(item=>`<li class="${item.feito?'done':''}"><button class="check-btn" data-action="os-check-toggle" data-id="${o.id}" data-check-id="${item.id}" aria-pressed="${item.feito}">${item.feito?'✓':'○'}</button><span>${esc(item.texto)}</span>${ativo?`<button class="x" data-action="os-check-del" data-id="${o.id}" data-check-id="${item.id}" aria-label="Excluir item ${esc(item.texto)}">✕</button>`:''}</li>`).join(''):'<li class="os-empty">Nenhum item cadastrado.</li>'}</ul>
      </div>
      <div><h2>Apontamento de execução</h2>
        ${ativo?`<form class="f os-log-form" id="f-os-apontamento"><input type="hidden" name="osId" value="${o.id}">
          <label>Data<input type="date" name="data" value="${hoje}" required></label>
          <label>Progresso (%)<input type="number" name="progresso" value="${Number(o.progresso)||0}" min="0" max="100" required></label>
          ${meta?`<label>Realizado (${esc(o.unidade)})<input type="number" step="0.01" name="realizado" value="${realizado}" min="0" max="${meta}"></label>`:''}
          <label class="os-log-text">O que foi executado<textarea name="texto" required maxlength="600" rows="2" placeholder="Registre avanço, impedimentos ou ocorrências"></textarea></label>
          <button class="btn">Registrar avanço</button></form>`:'<p class="note">Esta ordem está encerrada. O histórico permanece disponível para consulta.</p>'}
      </div>
    </div>
    <h2>Histórico da execução</h2>
    <ol class="os-timeline">${logs.length?logs.map(l=>`<li><div><b>${dBRy(l.data)}</b> · ${esc(OS_STATUS_INFO[l.status]?.label||'Atualização')} · ${N(l.progresso)}%${meta?` · ${N(l.realizado,1)} ${esc(o.unidade)}`:''}</div><p>${esc(l.texto)||'Atualização de status.'}</p></li>`).join(''):'<li class="os-empty">A execução ainda não possui apontamentos.</li>'}</ol>
  </section>`;
}
function pgOrdens(){
  const ativas=db.os.filter(o=>OS_ATIVAS.has(o.status)),exec=db.os.filter(o=>o.status==='em_execucao');
  const atrasadas=db.os.filter(osAtrasada),concluidas=db.os.filter(o=>o.status==='concluida');
  const encerradas=db.os.filter(o=>o.status==='concluida'||o.status==='cancelada').length;
  const taxa=encerradas?Math.round(concluidas.length/encerradas*100):0;
  const tabs=[['ativas','Ativas'],['todas','Todas'],['planejada','Planejadas'],['em_execucao','Em execução'],['pausada','Pausadas'],['concluida','Concluídas'],['cancelada','Canceladas']];
  const count=k=>k==='ativas'?ativas.length:k==='todas'?db.os.length:db.os.filter(o=>o.status===k).length;
  const rows=(osFiltro==='ativas'?ativas:osFiltro==='todas'?db.os:db.os.filter(o=>o.status===osFiltro)).slice().sort((a,b)=>
    Number(osAtrasada(b))-Number(osAtrasada(a))||String(a.prazo).localeCompare(String(b.prazo))||String(a.codigo).localeCompare(String(b.codigo)));
  const selected=db.os.find(o=>o.id===osSelecionada);
  return `<h1>Ordens de serviço</h1><p class="sub">Planeje, atribua e acompanhe a execução operacional da abertura à conclusão, com progresso, checklist e histórico.</p>
  <div class="cards">${kpi('OS ativas',ativas.length,exec.length+' em execução')}${kpi('Atrasadas',atrasadas.length,atrasadas.length?'exigem replanejamento':'prazos em dia')}${kpi('Execução média',exec.length?N(exec.reduce((s,o)=>s+o.progresso,0)/exec.length)+'%':'—','das ordens em campo')}${kpi('Conclusão',taxa+'%','entre ordens encerradas')}</div>
  <section class="panel" aria-labelledby="os-new-title"><h2 id="os-new-title">Abrir ordem de serviço</h2>
    <form class="f os-form" id="f-os-operacional">
      <label>Início planejado<input type="date" name="data" value="${hoje}" required></label>
      <label>Prazo<input type="date" name="prazo" value="${hoje}" required></label>
      <label class="os-title-field">Título<input name="titulo" required maxlength="140" placeholder="Serviço a executar"></label>
      <label>Módulo<select name="modulo"><option>Campo</option><option>Café</option><option>Grãos</option><option>Pós-colheita</option><option>Pulverização</option><option>Oficina</option><option>Logística</option><option>Administrativo</option></select></label>
      <label>Categoria<select name="categoria"><option>Operação</option><option>Manutenção</option><option>Inspeção</option><option>Logística</option><option>Administrativo</option></select></label>
      <label>Tipo<input name="tipo" value="Serviço" maxlength="80"></label>
      <label>Prioridade<select name="prioridade"><option value="normal">Normal</option><option value="baixa">Baixa</option><option value="alta">Alta</option><option value="critica">Crítica</option></select></label>
      <label>Responsável<select name="responsavelId"><option value="">— atribuir depois —</option>${db.func.map(f=>`<option value="${f.id}">${esc(f.nome)}</option>`).join('')}</select></label>
      <label>Talhão<select name="talhaoId"><option value="">— geral —</option>${db.talhoes.map(t=>`<option value="${t.id}">${esc(t.nome)}</option>`).join('')}</select></label>
      <label>Máquina<select name="maqId"><option value="">— sem máquina —</option>${db.maquinas.map(m=>`<option value="${m.id}">${esc(m.nome)}</option>`).join('')}</select></label>
      <label>Meta<input type="number" step="0.01" name="meta" value="0"></label>
      <label>Unidade<input name="unidade" maxlength="20" placeholder="ha, t, km, serviço"></label>
      <label class="os-desc-field">Descrição<textarea name="desc" maxlength="800" rows="2" placeholder="Escopo, orientação técnica e critério de conclusão"></textarea></label>
      <button class="btn" id="os-save-button">Abrir OS</button><button class="btn ghost" data-action="os-edit-cancel" hidden id="os-edit-cancel">Cancelar edição</button>
    </form></section>
  <div class="os-tabs" role="tablist" aria-label="Filtrar ordens por situação">${tabs.map(([key,label])=>`<button role="tab" aria-selected="${osFiltro===key}" class="${osFiltro===key?'on':''}" data-action="os-tab" data-status="${key}">${label} <span>${count(key)}</span></button>`).join('')}</div>
  <div class="tblwrap"><table><thead><tr><th>OS / Serviço</th><th>Status</th><th>Prioridade</th><th>Responsável</th><th>Local / Máquina</th><th>Prazo</th><th>Progresso</th><th></th></tr></thead><tbody>
    ${rows.length?rows.map(o=>`<tr class="${osAtrasada(o)?'os-overdue':''}"><td><b>${esc(o.codigo)}</b><div class="linked-record">${esc(o.titulo)} · ${esc(o.modulo)}</div></td><td>${osStatusPill(o)}</td><td>${osPrioridadePill(o)}</td><td>${esc(osResponsavel(o))}</td><td>${esc(osLocal(o))}</td><td class="${osAtrasada(o)?'crit-text':''}">${dBRy(o.prazo)}</td><td>${osProgressHTML(o)}</td><td><div class="os-actions"><button class="btn mini ghost" data-action="os-open" data-id="${o.id}">Acompanhar</button><button class="x" data-action="del" data-col="os" data-id="${o.id}" title="Excluir">✕</button></div></td></tr>`).join(''):`<tr><td colspan="8" class="os-empty">Nenhuma ordem nesta aba.</td></tr>`}
  </tbody></table></div>${selected?pgOsDetalhe(selected):''}`;
}

function semanasCafe(){
  const m=new Map();
  F(db.cafe).forEach(r=>{
    const dt=new Date(r.data+'T12:00:00');
    const mon=new Date(dt);mon.setDate(dt.getDate()-((dt.getDay()+6)%7));
    const k=mon.toISOString().slice(0,10);
    m.set(k,(m.get(k)||0)+r.litros);
  });
  return [...m.entries()].sort((a,b)=>a[0]<b[0]?-1:1);
}

function pgDash(){
  const p=db.params;
  const litros=F(db.cafe).reduce((a,r)=>a+r.litros,0);
  const sacasCafe=litros/p.litrosPorSaca;
  const mi=somaCargas('milho'),so=somaCargas('soja');
  const saldo=F(db.fin).filter(f=>f.status==='realizado').reduce((a,f)=>a+(f.tipo==='entrada'?f.valor:-f.valor),0);
  const lim30=addDias(hoje,30),lim15=addDias(hoje,15);
  const prox30=db.fin.filter(f=>f.status==='previsto'&&f.tipo==='saida'&&f.data<=lim30).reduce((a,f)=>a+f.valor,0);
  const saldoDiesel=db.combCompras.reduce((a,c)=>a+c.litros,0)-db.abastecimentos.reduce((a,x)=>a+x.litros,0);
  const baixo=db.estoque.filter(i=>i.qtd<i.min);
  const osAb=db.os.filter(o=>OS_ATIVAS.has(o.status)),osAtr=osAb.filter(osAtrasada);
  const revProx=db.maquinas.filter(m=>m.proxRev-m.horimetro<=50);
  const sem=semanasCafe();
  /* últimos 6 meses terminando no mês corrente */
  const meses=[];for(let i=5;i>=0;i--){const d=new Date(+hoje.slice(0,4),+hoje.slice(5,7)-1-i,1);
    meses.push(d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'));}
  const ent=meses.map(m=>db.fin.filter(f=>f.status==='realizado'&&f.tipo==='entrada'&&f.data.startsWith(m)).reduce((a,f)=>a+f.valor,0));
  const sai=meses.map(m=>db.fin.filter(f=>f.status==='realizado'&&f.tipo==='saida'&&f.data.startsWith(m)).reduce((a,f)=>a+f.valor,0));
  const mmMes=meses.map(m=>db.chuvas.filter(c=>c.data.startsWith(m)).reduce((a,c)=>a+c.mm,0));
  const alertas=[
    ...(saldoDiesel<p.minDiesel?[`<div class="alert"><span class="pill crit">diesel</span> Tanque com ${N(saldoDiesel)} L — abaixo do mínimo de ${N(p.minDiesel)} L, programar compra</div>`]:[]),
    ...baixo.map(i=>`<div class="alert"><span class="pill crit">estoque</span> ${esc(i.nome)} — ${N(i.qtd)} un (mín. ${N(i.min)})</div>`),
    ...db.defensivos.filter(d=>d.qtd<d.min).map(d=>`<div class="alert"><span class="pill crit">defensivo</span> ${esc(d.nome)} — ${N(d.qtd,1)} ${esc(d.unidade)} (mín. ${N(d.min,1)})</div>`),
    ...db.pulvOS.filter(o=>o.status==='aberta').map(o=>{const r=db.receitas.find(x=>x.id===o.receitaId)||{nome:'—'};
      return `<div class="alert"><span class="pill warn">pulverização</span> ${dBR(o.data)} — ${esc(r.nome)} em ${esc(tal(o.talhaoId).nome)}</div>`;}),
    ...db.talhoes.map(t=>{const c=statusCarencia(t.id);
      if(!c)return '';
      return `<div class="alert"><span class="pill crit">carência</span> <b>${esc(t.nome)}</b> — não colher até ${dBRy(c.libera||c.liberaRe)}${c.prod?' ('+esc(c.prod)+', '+N(c.dias)+' dias)':''}</div>`;}).filter(x=>x),
    ...osAb.map(o=>`<div class="alert"><span class="pill ${osAtrasada(o)?'crit':'warn'}">${osAtrasada(o)?'OS atrasada':'OS ativa'}</span> <b>${esc(o.codigo)}</b> — ${esc(o.titulo)} · ${esc(osResponsavel(o))}</div>`),
    ...revProx.map(m=>`<div class="alert"><span class="pill warn">revisão</span> ${esc(m.nome)} — ${N(m.horimetro)} h (plano: ${N(m.proxRev)} h)</div>`),
    ...db.lembretes.filter(l=>!l.feito).map(l=>{const m=db.maquinas.find(x=>x.id===l.maqId)||{nome:'—',horimetro:0};
      const venc=(l.horimetroAlvo&&m.horimetro>=l.horimetroAlvo)||(l.dataAlvo&&l.dataAlvo<=hoje);
      const prox=l.horimetroAlvo&&m.horimetro>=l.horimetroAlvo-50;
      return venc||prox?`<div class="alert"><span class="pill ${venc?'crit':'warn'}">manutenção</span> ${esc(m.nome)} — ${esc(l.desc)}</div>`:'';}).filter(x=>x),
    ...db.fin.filter(f=>f.status==='previsto'&&f.data<=lim15).map(f=>`<div class="alert"><span class="pill ${f.tipo==='saida'?'warn':'good'}">${f.tipo==='saida'?'a pagar':'a receber'}</span> ${dBR(f.data)} — ${esc(f.desc)} · ${BRL(f.valor)}</div>`)
  ];
  return `<h1>Visão geral da safra</h1><p class="sub">Consolidado operacional e financeiro · atualizado em ${dBRy(hoje)}</p>
  <div class="cards">
    ${kpi('Café colhido',N(sacasCafe,0)+' sc',N(litros/p.litrosPorCarreta,1)+' carretas · '+N(sacasCafe/areaCult('cafe'),1)+' sc/ha')}
    ${kpi('Milho entregue',N(mi.sacas,0)+' sc',BRL(mi.valor)+' · '+BRL(mi.aberto)+' a receber')}
    ${kpi('Soja entregue',N(so.sacas,0)+' sc',BRL(so.valor)+' · '+BRL(so.aberto)+' a receber')}
    ${kpi('Saldo de caixa',BRL(saldo),'realizado no ano')}
    ${kpi('A pagar até '+dBR(lim30),BRL(prox30),db.fin.filter(f=>f.status==='previsto'&&f.tipo==='saida').length+' títulos previstos')}
    ${kpi('OS operacionais',osAb.length,osAtr.length?osAtr.length+' atrasada(s)':'execução dentro do prazo')}
  </div>
  <div class="row2">
    <div class="panel"><h3>Evolução da colheita de café (carretas/semana)</h3>
      ${barChart({labels:sem.map(s=>dBR(s[0])),series:[{name:'Carretas',color:'var(--cafe)',values:sem.map(s=>+(s[1]/p.litrosPorCarreta).toFixed(1)),tipfmt:v=>N(v,1)+' carretas'}],fmt:v=>N(v,1)})}</div>
    <div class="panel"><h3>Fluxo de caixa realizado (R$/mês)</h3>
      ${barChart({labels:meses.map(m=>mesNome[+m.slice(5)-1]),series:[
        {name:'Entradas',color:'var(--entrada)',values:ent,tipfmt:BRL},
        {name:'Saídas',color:'var(--saida)',values:sai,tipfmt:BRL}],fmt:kfmt})}</div>
  </div>
  <div class="row2">
    <div class="panel"><h3>Pluviômetro (mm/mês)</h3>
      ${barChart({labels:meses.map(m=>mesNome[+m.slice(5)-1]),series:[{name:'Chuva',color:'var(--trigo)',values:mmMes,tipfmt:v=>N(v)+' mm'}],fmt:v=>N(v),h:170})}
      <form class="f" id="f-chuva" style="margin-top:8px">
        <label>Data<input type="date" name="data" value="${hoje}" required></label>
        <label>mm<input type="number" step="0.5" name="mm" required style="width:75px"></label>
        <label>Obs.<input name="obs" style="width:150px"></label>
        <button class="btn mini">Registrar chuva</button>
      </form></div>
    <div class="panel"><h3>Últimas chuvas</h3>
      ${db.chuvas.slice().sort((a,b)=>a.data<b.data?1:-1).slice(0,8).map(c=>`<div class="alert">
        <span class="pill good">${N(c.mm,1)} mm</span> ${dBRy(c.data)}${c.obs?' — '+esc(c.obs):''}
        <button class="x" data-action="del" data-col="chuvas" data-id="${c.id}" title="Excluir">✕</button></div>`).join('')||'<span class="sub">Nenhum registro.</span>'}</div>
  </div>
  <div class="panel"><h3>Alertas e pendências (${alertas.length})</h3>${alertas.join('')||'<span class="sub">Nada pendente.</span>'}</div>`;
}

function pgCafe(){
  const p=db.params,LC=p.litrosPorCarreta,cafeF=F(db.cafe);
  const litros=cafeF.reduce((a,r)=>a+r.litros,0);
  const custo=cafeF.reduce((a,r)=>a+r.litros/p.litrosPorMedida*r.valorMedida,0);
  const sacas=litros/p.litrosPorSaca,carretas=litros/LC;
  const mec=cafeF.filter(r=>r.tipo==='Mecanizada');
  const horasMec=mec.reduce((a,r)=>a+(r.horas||0),0);
  const litrosMec=mec.reduce((a,r)=>a+r.litros,0);
  const maqNome=id=>{const m=db.maquinas.find(x=>x.id===id);return m?m.nome:'—';};
  const porTipo={};cafeF.forEach(r=>porTipo[r.tipo]=(porTipo[r.tipo]||0)+r.litros);
  const maxT=Math.max(...Object.values(porTipo),1);
  const sem=semanasCafe();
  const talhoes=db.talhoes.filter(t=>t.cultura==='cafe');
  return `<h1>Colheita de café</h1><p class="sub">Carreta de ${N(LC)} L · medida de ${p.litrosPorMedida} L · rendimento estimado de ${p.litrosPorSaca} L por saca beneficiada (ajuste em Cadastros & Dados)</p>
  <div class="cards">
    ${kpi('Total colhido',N(carretas,1)+' carretas',N(litros)+' L · '+N(litros/p.litrosPorMedida,0)+' medidas')}
    ${kpi('Sacas estimadas',N(sacas,0)+' sc','beneficiadas (60 kg)')}
    ${kpi('Produtividade',N(sacas/areaCult('cafe'),1)+' sc/ha',N(areaCult('cafe'),1)+' ha em produção')}
    ${kpi('Custo de colheita',BRL(custo),BRL(custo/(carretas||1))+' / carreta')}
    ${kpi('Mecanizada',horasMec?N(horasMec,1)+' h':'—',horasMec?N(litrosMec/LC/horasMec,2)+' carretas/h · '+N(litrosMec/horasMec,0)+' L/h':'sem horas apontadas')}
  </div>
  <div class="row2">
    <div class="panel"><h3>Evolução semanal (carretas)</h3>
      ${barChart({labels:sem.map(s=>dBR(s[0])),series:[{name:'Carretas',color:'var(--cafe)',values:sem.map(s=>+(s[1]/LC).toFixed(1)),tipfmt:v=>N(v,1)+' carretas ('+N(v*LC)+' L)'}],fmt:v=>N(v,1)})}</div>
    <div class="panel"><h3>Por tipo de colheita</h3>
      ${Object.entries(porTipo).map(([t,v])=>`<div class="hbar"><span>${esc(t)}</span>
        <span class="bar" style="width:${Math.max(2,v/maxT*100)}%;background:var(--cafe)"></span>
        <span class="n">${N(v/LC,1)} car · ${N(v/litros*100,0)}%</span></div>`).join('')}
      <h3 style="margin-top:18px">Rendimento por talhão</h3>
      ${talhoes.map(t=>{const l=cafeF.filter(r=>r.talhaoId===t.id).reduce((a,r)=>a+r.litros,0);
        const sc=l/p.litrosPorSaca;
        return `<div class="hbar"><span ${t.variedade?`data-tip="${esc(t.variedade)}"`:''}>${esc(t.nome)} · ${N(t.area,1)} ha</span>
        <span class="bar" style="width:${Math.max(2,(sc/t.area)/45*100)}%;background:var(--cafe);opacity:.75"></span>
        <span class="n">${N(sc,0)} sc · ${N(sc/t.area,1)} sc/ha</span></div>`;}).join('')}
    </div>
  </div>
  ${(()=>{const bl=talhoes.map(t=>({t,c:statusCarencia(t.id)})).filter(x=>x.c&&x.c.libera);
    return bl.length?`<div class="panel" style="border-color:var(--crit)"><h3 style="color:var(--crit)">⚠️ Talhões em carência — não colher</h3>
      ${bl.map(x=>`<div class="alert"><span class="pill crit">até ${dBRy(x.c.libera)}</span>
        <b>${esc(x.t.nome)}</b> — ${esc(x.c.prod)} aplicado em ${dBRy(x.c.data)} (carência ${N(x.c.dias)} dias)</div>`).join('')}</div>`:'';})()}
  <div class="panel"><h3>Lançar colheita</h3>
    <form class="f" id="f-cafe">
      <label>Data<input type="date" name="data" value="${hoje}" required></label>
      <label>Talhão<select name="talhaoId">${talhoes.map(t=>`<option value="${t.id}">${esc(t.nome)}</option>`).join('')}</select></label>
      <label>Tipo<select name="tipo"><option>Manual (pano)</option><option>Varrição</option><option>Mecanizada</option></select></label>
      <label>Quantidade<input type="number" name="qtd" min="0.1" step="0.1" required style="width:90px"></label>
      <label>Unidade<select name="unidade"><option value="litro">Litros</option><option value="carreta">Carretas (${N(LC)} L)</option></select></label>
      <label>Colhedores<input type="number" name="colhedores" min="0" value="0" style="width:80px"></label>
      <label id="lbl-horas" style="display:none">Horas (mecanizada)<input type="number" name="horas" min="0" step="0.5" value="0" style="width:95px"></label>
      <label>R$/medida<input type="number" name="valorMedida" min="0" step="0.5" value="9" style="width:80px"></label>
      <button class="btn">Lançar</button>
    </form></div>
  <div class="tblwrap"><table><thead><tr><th>Data</th><th>Talhão</th><th>Tipo</th><th class="num">Carretas</th><th class="num">Litros</th><th class="num">Colhedores</th><th class="num">L/colhedor</th><th class="num">Horas</th><th class="num">Custo</th><th></th></tr></thead><tbody>
    ${cafeF.slice().sort((a,b)=>a.data<b.data?1:-1).map(r=>`<tr>
      <td>${dBRy(r.data)}</td><td>${esc(tal(r.talhaoId).nome)}</td><td>${esc(r.tipo)}</td>
      <td class="num">${N(r.litros/LC,1)}</td><td class="num">${N(r.litros)}</td>
      <td class="num">${r.colhedores||'—'}</td><td class="num">${r.colhedores?N(r.litros/r.colhedores,0):'—'}</td>
      <td class="num" ${r.horas?`data-tip="${N(r.litros/LC/r.horas,2)} carretas/h"`:''}>${r.horas?N(r.horas,1)+' h':'—'}</td>
      <td class="num">${BRL(r.litros/p.litrosPorMedida*r.valorMedida)}</td>
      <td><button class="x" data-action="del" data-col="cafe" data-id="${r.id}" title="Excluir">✕</button></td></tr>`).join('')}
  </tbody></table></div>
  <h2>Regulagens de colheita (árvore e chão)</h2>
  <div class="panel"><h3>Nova regulagem</h3>
    <form class="f" id="f-regcol">
      <label>Data<input type="date" name="data" value="${hoje}" required></label>
      <label>Ano da regulagem<input type="number" name="ano" value="${hoje.slice(0,4)}" min="2000" max="2100" style="width:110px"></label>
      <label>Talhão<select name="talhaoId"><option value="">—</option>${talhoes.map(t=>`<option value="${t.id}">${esc(t.nome)}</option>`).join('')}</select></label>
      <label>Variedade<input name="variedade" style="width:140px" placeholder="Catuaí, Mundo Novo…"></label>
      <label>Tipo<select name="tipo"><option>Árvore</option><option>Chão</option></select></label>
      <label>Máquina<select name="maquinaId"><option value="">—</option>${db.maquinas.map(m=>`<option value="${m.id}">${esc(m.nome)}</option>`).join('')}</select></label>
      <label>Vibração/RPM<input type="number" name="vibracao" min="0" style="width:95px"></label>
      <label>Velocidade km/h<input type="number" step="0.1" name="velocidade" min="0" style="width:105px"></label>
      <label>Freio (kg)<input type="number" step="0.1" name="freio" min="0" style="width:85px"></label>
      <label>Obs. (peneira, ventilador…)<input name="obs" style="width:230px"></label>
      <button class="btn">Salvar regulagem</button>
    </form>
    <p class="note">Registre a regulagem que funcionou em cada talhão/condição — vira histórico consultável na próxima safra (vibração da derriçadora na colheita de árvore; escova, peneira e ventilador na recolhedora de chão).</p></div>
  <div class="tblwrap"><table><thead><tr><th>Data</th><th class="num">Ano</th><th>Talhão</th><th>Variedade</th><th>Tipo</th><th>Máquina</th><th class="num">Vibração/RPM</th><th class="num">Veloc.</th><th class="num">Freio</th><th>Observações</th><th></th></tr></thead><tbody>
    ${db.regColheita.slice().sort((a,b)=>a.data<b.data?1:-1).map(g=>`<tr>
      <td>${dBRy(g.data)}</td><td class="num">${g.ano||g.data.slice(0,4)}</td>
      <td>${g.talhaoId?esc(tal(g.talhaoId).nome):'—'}</td><td>${esc(g.variedade)||'—'}</td>
      <td><span class="pill ${g.tipo==='Árvore'?'good':'warn'}">${esc(g.tipo)}</span></td>
      <td>${esc(maqNome(g.maquinaId))}</td><td class="num">${g.vibracao?N(g.vibracao):'—'}</td>
      <td class="num">${g.velocidade?N(g.velocidade,1)+' km/h':'—'}</td>
      <td class="num">${g.freio?N(g.freio,1)+' kg':'—'}</td><td style="white-space:normal">${esc(g.obs)||'—'}</td>
      <td><button class="x" data-action="del" data-col="regColheita" data-id="${g.id}" title="Excluir">✕</button></td></tr>`).join('')}
  </tbody></table></div>
  ${medicaoHTML()}`;
}

function pgGrao(cult){
  const nome=NOMES_CULT[cult]||cult,cor=CORES_CULT[cult]||'var(--milho)';
  const rows=F(db.cargas).filter(c=>c.cultura===cult).sort((a,b)=>a.data<b.data?1:-1);
  const tot=somaCargas(cult),area=areaCult(cult);
  const talhoes=db.talhoes.filter(t=>t.cultura===cult);
  const porTal=talhoes.map(t=>({t,sc:rows.filter(c=>c.talhaoId===t.id).reduce((a,c)=>a+cargaCalc(c).sacas,0)}));
  return `<h1>Colheita de ${nome.toLowerCase()} — saídas de caminhão</h1>
  <p class="sub">Romaneio por carga: pesagem, desconto de umidade (base 14%), NF-e e situação do pagamento</p>
  <div class="cards">
    ${kpi('Cargas',rows.length,rows.filter(c=>!c.pago).length+' com pagamento pendente')}
    ${kpi('Sacas entregues',N(tot.sacas,0)+' sc',N(tot.sacas/(area||1),1)+' sc/ha · '+N(area)+' ha')}
    ${kpi('Valor bruto',BRL(tot.valor),'preço médio '+BRL2(tot.valor/(tot.sacas||1))+'/sc')}
    ${kpi('A receber',BRL(tot.aberto),tot.aberto?'confira os prazos das NFs':'tudo recebido')}
  </div>
  <div class="row2">
    <div class="panel"><h3>Sacas por talhão</h3>
      ${barChart({labels:porTal.map(x=>x.t.nome),series:[{name:'Sacas',color:cor,values:porTal.map(x=>Math.round(x.sc))}],fmt:kfmt,h:180})}</div>
    <div class="panel"><h3>Nova carga</h3>
      <form class="f" id="f-carga" data-cult="${cult}">
        <label>Data<input type="date" name="data" value="${hoje}" required></label>
        <label>Talhão<select name="talhaoId">${talhoes.map(t=>`<option value="${t.id}">${esc(t.nome)}</option>`).join('')}</select></label>
        <label>Motorista<input name="motorista" required style="width:130px"></label>
        <label>Placa<input name="placa" style="width:90px"></label>
        <label>Bruto (kg)<input type="number" name="bruto" required style="width:95px"></label>
        <label>Tara (kg)<input type="number" name="tara" required style="width:90px"></label>
        <label>Umidade %<input type="number" step="0.1" name="umidade" value="14" style="width:80px"></label>
        <label>NF-e nº<input name="nf" style="width:80px"></label>
        <label>Destino<input name="destino" style="width:150px"></label>
        <label>R$/saca<input type="number" step="0.01" name="preco" required style="width:85px"></label>
        <button class="btn">Registrar</button>
      </form></div>
  </div>
  <div class="tblwrap"><table><thead><tr><th>Data</th><th>NF-e</th><th>Talhão</th><th>Motorista / placa</th><th>Destino</th><th class="num">Líquido kg</th><th class="num">Umid.</th><th class="num">Sacas</th><th class="num">R$/sc</th><th class="num">Valor</th><th>Pagamento</th><th></th></tr></thead><tbody>
    ${rows.map(c=>{const x=cargaCalc(c);return `<tr>
      <td>${dBRy(c.data)}</td><td>${esc(c.nf)||'—'}</td><td>${esc(tal(c.talhaoId).nome)}</td>
      <td>${esc(c.motorista)} · ${esc(c.placa)}</td><td>${esc(c.destino)}</td>
      <td class="num" data-tip="Bruto ${N(c.bruto)} − tara ${N(c.tara)}; desconto umidade ${N(x.desc*100,1)}%">${N(x.liqCor,0)}</td>
      <td class="num">${N(c.umidade,1)}%</td><td class="num">${N(x.sacas,1)}</td>
      <td class="num">${N(c.preco,2)}</td><td class="num">${BRL(x.valor)}</td>
      <td><button class="btn mini ${c.pago?'ghost':''}" data-action="pago" data-id="${c.id}">${c.pago?'✓ Pago':'Pendente'}</button></td>
      <td><button class="x" data-action="del" data-col="cargas" data-id="${c.id}" title="Excluir">✕</button></td></tr>`;}).join('')}
  </tbody></table></div>`;
}

function pgFin(){
  const finF=F(db.fin);
  const rel=finF.filter(f=>f.status==='realizado');
  const saldo=rel.reduce((a,f)=>a+(f.tipo==='entrada'?f.valor:-f.valor),0);
  const pagar=finF.filter(f=>f.status==='previsto'&&f.tipo==='saida').reduce((a,f)=>a+f.valor,0);
  const cargasAbertas=F(db.cargas).filter(c=>!c.pago).reduce((a,c)=>a+cargaCalc(c).valor,0);
  const receber=finF.filter(f=>f.status==='previsto'&&f.tipo==='entrada'&&!f.cargaId).reduce((a,f)=>a+f.valor,0)
    +cargasAbertas;
  const centros=['Cafe','Milho','Soja','Sorgo','Trigo','Oficina','Adm'];
  const gastoC=centros.map(c=>rel.filter(f=>f.tipo==='saida'&&f.centro===c).reduce((a,f)=>a+f.valor,0));
  const maxG=Math.max(...gastoC,1);
  return `<h1>Administração & financeiro</h1><p class="sub">Contas a pagar/receber, fluxo de caixa e custos por centro (cultura, oficina, administração)</p>
  <div class="cards">
    ${kpi('Saldo realizado',BRL(saldo),'entradas − saídas no ano')}
    ${kpi('A pagar (previsto)',BRL(pagar),'títulos lançados')}
    ${kpi('A receber',BRL(receber),'inclui cargas de grãos pendentes')}
    ${kpi('Posição projetada',BRL(saldo+receber-pagar),'saldo + a receber − a pagar')}
  </div>
  <div class="row2">
    <div class="panel"><h3>Saídas por centro de custo (realizado)</h3>
      ${centros.map((c,i)=>`<div class="hbar"><span>${c==='Cafe'?'Café':c==='Adm'?'Administração':c}</span>
        <span class="bar" style="width:${Math.max(2,gastoC[i]/maxG*100)}%;background:var(--saida)"></span>
        <span class="n">${BRL(gastoC[i])}</span></div>`).join('')}
      <p class="note">Rateie insumos e diesel por talhão para chegar ao <b>custo por saca</b> de cada cultura — hoje o rateio é por centro.</p></div>
    <div class="panel"><h3>Novo lançamento</h3>
      <form class="f" id="f-fin">
        <label>Data<input type="date" name="data" value="${hoje}" required></label>
        <label>Tipo<select name="tipo"><option value="saida">Saída</option><option value="entrada">Entrada</option></select></label>
        <label>Categoria<input name="categoria" required style="width:140px" placeholder="Insumos, Folha…"></label>
        <label>Centro<select name="centro">${centros.map(c=>`<option value="${c}">${c==='Cafe'?'Café':c==='Adm'?'Administração':c}</option>`).join('')}</select></label>
        <label>Descrição<input name="desc" required style="width:190px"></label>
        <label>Valor R$<input type="number" step="0.01" name="valor" required style="width:100px"></label>
        <label>Situação<select name="status"><option value="previsto">Previsto</option><option value="realizado">Realizado</option></select></label>
        <button class="btn">Lançar</button>
      </form></div>
  </div>
  <div class="tblwrap"><table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Centro</th><th class="num">Valor</th><th>Situação</th><th></th></tr></thead><tbody>
    ${finF.slice().sort((a,b)=>a.data<b.data?1:-1).map(f=>{const linked=!!(f.cargaId||f.vendaId||f.pulvOSId);return `<tr>
      <td>${dBRy(f.data)}</td><td>${esc(f.desc)}</td><td>${esc(f.categoria)}</td><td>${f.centro==='Cafe'?'Café':esc(f.centro)}</td>
      <td class="num" style="color:${f.tipo==='entrada'?'var(--good)':'inherit'}">${f.tipo==='entrada'?'+':'−'} ${BRL(f.valor)}</td>
      <td>${f.status==='realizado'?'<span class="pill good">realizado</span>':`<button class="btn mini" data-action="baixa" data-id="${f.id}">Dar baixa</button>`}</td>
      <td>${linked?'<span class="linked-record" title="Altere ou exclua pelo módulo de origem">Gerenciado pela origem</span>':`<button class="x" data-action="del" data-col="fin" data-id="${f.id}" title="Excluir">✕</button>`}</td></tr>`;}).join('')}
  </tbody></table></div>`;
}

function pgRH(){
  const fixos=db.func.filter(f=>f.tipo==='fixo');
  const folhaFixa=fixos.reduce((a,f)=>a+f.valor,0);
  const apJul=db.apont.filter(a=>a.data.startsWith(mesAtual));
  const turma=apJul.reduce((a,x)=>a+x.valor,0);
  const mLbl=mesNome[+mesAtual.slice(5)-1];
  return `<h1>RH & turmas de colheita</h1><p class="sub">Quadro fixo, safristas e apontamento de diárias — base para a folha e para o custo de colheita</p>
  <div class="cards">
    ${kpi('Quadro',db.func.length+' pessoas',fixos.length+' fixos · '+(db.func.length-fixos.length)+' safristas')}
    ${kpi('Folha fixa/mês',BRL(folhaFixa),'salários contratuais')}
    ${kpi('Diárias em '+mLbl,BRL(turma),apJul.reduce((a,x)=>a+x.dias,0)+' diárias apontadas')}
    ${kpi('Custo RH '+mLbl+' (est.)',BRL(folhaFixa+turma),'fixos + turma')}
  </div>
  <div class="row2">
    <div class="panel"><h3>Novo funcionário</h3>
      <form class="f" id="f-func">
        <label>Nome<input name="nome" required style="width:160px"></label>
        <label>Função<input name="funcao" required style="width:150px"></label>
        <label>Vínculo<select name="tipo"><option value="fixo">Fixo (salário)</option><option value="safrista">Safrista (diária)</option></select></label>
        <label>R$ salário/diária<input type="number" step="0.01" name="valor" required style="width:110px"></label>
        <button class="btn">Cadastrar</button>
      </form></div>
    <div class="panel"><h3>Apontar diárias</h3>
      <form class="f" id="f-apont">
        <label>Data (semana)<input type="date" name="data" value="${hoje}" required></label>
        <label>Funcionário<select name="funcId">${db.func.map(f=>`<option value="${f.id}">${esc(f.nome)}</option>`).join('')}</select></label>
        <label>Atividade<input name="atividade" required style="width:180px" placeholder="Colheita café — talhão…"></label>
        <label>Dias<input type="number" step="0.5" name="dias" required style="width:70px"></label>
        <button class="btn">Apontar</button>
      </form>
      <p class="note">Para safrista, o valor é calculado por <b>dias × diária</b> cadastrada. Colheita por medida entra pelo lançamento do café (R$/medida).</p></div>
  </div>
  <div class="tblwrap"><table><thead><tr><th>Nome</th><th>Função</th><th>Vínculo</th><th class="num">R$ base</th><th></th></tr></thead><tbody>
    ${db.func.map(f=>`<tr><td>${esc(f.nome)}</td><td>${esc(f.funcao)}</td>
      <td><span class="pill ${f.tipo==='fixo'?'good':'warn'}">${f.tipo}</span></td>
      <td class="num">${BRL2(f.valor)}${f.tipo==='safrista'?'/dia':'/mês'}</td>
      <td><button class="x" data-action="del" data-col="func" data-id="${f.id}" title="Excluir">✕</button></td></tr>`).join('')}
  </tbody></table></div>
  <div class="tblwrap"><table><thead><tr><th>Data</th><th>Funcionário</th><th>Atividade</th><th class="num">Dias</th><th class="num">Valor</th><th></th></tr></thead><tbody>
    ${db.apont.slice().sort((a,b)=>a.data<b.data?1:-1).map(a=>{const f=db.func.find(x=>x.id===a.funcId)||{nome:'—'};
      return `<tr><td>${dBRy(a.data)}</td><td>${esc(f.nome)}</td><td>${esc(a.atividade)}</td>
      <td class="num">${N(a.dias,1)}</td><td class="num">${BRL2(a.valor)}</td>
      <td><button class="x" data-action="del" data-col="apont" data-id="${a.id}" title="Excluir">✕</button></td></tr>`;}).join('')}
  </tbody></table></div>`;
}

function pgOficina(){
  const manutencoes=db.os.filter(o=>o.categoria==='Manutenção'||o.modulo==='Oficina');
  const abertas=manutencoes.filter(o=>OS_ATIVAS.has(o.status));
  const custoJul=manutencoes.filter(o=>o.data.startsWith(mesAtual)).reduce((a,o)=>a+(Number(o.pecas)||0)+(Number(o.mo)||0),0);
  const baixo=db.estoque.filter(i=>i.qtd<i.min);
  const emprest=db.estoque.filter(i=>i.resp);
  return `<h1>Oficina, máquinas & estoque</h1><p class="sub">Frota com horímetro e plano de revisão, ordens de serviço e almoxarifado (ferramentas, consumíveis e suprimentos)</p>
  <div class="cards">
    ${kpi('OS abertas',abertas.length,abertas.length?'priorize antes do pico da colheita':'nenhuma pendência')}
    ${kpi('Custo manutenção '+mesNome[+mesAtual.slice(5)-1]+'.',BRL(custoJul),'peças + mão de obra')}
    ${kpi('Itens abaixo do mínimo',baixo.length,baixo.length?'gerar pedido de compra':'estoque ok')}
    ${kpi('Ferramentas emprestadas',emprest.length,emprest.map(i=>i.resp).filter((v,i2,a)=>a.indexOf(v)===i2).join(', ')||'—')}
  </div>
  <h2>Frota</h2>
  <div class="tblwrap"><table><thead><tr><th>Máquina</th><th>Tipo</th><th class="num">Horímetro</th><th class="num">Próx. revisão</th><th>Status</th><th></th></tr></thead><tbody>
    ${db.maquinas.map(m=>{const falta=m.proxRev-m.horimetro;
      return `<tr><td>${esc(m.nome)}</td><td>${esc(m.tipo)}</td>
      <td class="num">${N(m.horimetro)} h</td><td class="num">${N(m.proxRev)} h</td>
      <td>${falta<=0?'<span class="pill crit">revisão vencida</span>':falta<=50?'<span class="pill warn">faltam '+N(falta)+' h</span>':'<span class="pill good">em dia</span>'}</td>
      <td><button class="x" data-action="del" data-col="maquinas" data-id="${m.id}" title="Excluir">✕</button></td></tr>`;}).join('')}
  </tbody></table></div>
  <div class="panel"><h3>Nova máquina / OS de manutenção</h3>
    <form class="f" id="f-maq">
      <label>Máquina<input name="nome" required style="width:170px"></label>
      <label>Tipo<input name="tipo" style="width:110px"></label>
      <label>Horímetro<input type="number" name="horimetro" value="0" style="width:90px"></label>
      <label>Próx. revisão (h)<input type="number" name="proxRev" value="0" style="width:110px"></label>
      <button class="btn ghost">+ Máquina</button>
    </form>
    <form class="f" id="f-os" style="margin-top:10px">
      <label>Data<input type="date" name="data" value="${hoje}" required></label>
      <label>Prazo<input type="date" name="prazo" value="${hoje}" required></label>
      <label>Máquina<select name="maqId" required><option value="">— selecione —</option>${db.maquinas.map(m=>`<option value="${m.id}">${esc(m.nome)}</option>`).join('')}</select></label>
      <label>Tipo<select name="tipo"><option>Preventiva</option><option>Corretiva</option></select></label>
      <label>Descrição<input name="desc" required maxlength="140" style="width:220px"></label>
      <label>Prioridade<select name="prioridade"><option value="normal">Normal</option><option value="alta">Alta</option><option value="critica">Crítica</option><option value="baixa">Baixa</option></select></label>
      <label>Responsável<select name="responsavelId"><option value="">— atribuir depois —</option>${db.func.map(f=>`<option value="${f.id}">${esc(f.nome)}</option>`).join('')}</select></label>
      <label>Peças R$<input type="number" step="0.01" name="pecas" value="0" style="width:90px"></label>
      <label>M.O. R$<input type="number" step="0.01" name="mo" value="0" style="width:85px"></label>
      <button class="btn">Abrir OS</button>
    </form></div>
  <div class="tblwrap"><table><thead><tr><th>OS / Data</th><th>Máquina</th><th>Tipo</th><th>Descrição</th><th class="num">Custo</th><th>Status</th><th>Progresso</th><th></th></tr></thead><tbody>
    ${manutencoes.slice().sort((a,b)=>a.data<b.data?1:-1).map(o=>{const m=db.maquinas.find(x=>x.id===o.maqId)||{nome:'—'};
      return `<tr><td><b>${esc(o.codigo)}</b><div class="linked-record">${dBRy(o.data)}</div></td><td>${esc(m.nome)}</td><td>${esc(o.tipo)}</td><td style="white-space:normal">${esc(o.titulo||o.desc)}</td>
      <td class="num">${BRL((Number(o.pecas)||0)+(Number(o.mo)||0))}</td><td>${osStatusPill(o)}</td><td>${osProgressHTML(o)}</td>
      <td><div class="os-actions"><button class="btn mini ghost" data-action="os-open-route" data-id="${o.id}">Acompanhar</button><button class="x" data-action="del" data-col="os" data-id="${o.id}" title="Excluir">✕</button></div></td></tr>`;}).join('')}
  </tbody></table></div>
  <h2>Combustível</h2>
  ${(()=>{
    const comprado=db.combCompras.reduce((a,c)=>a+c.litros,0);
    const gasto=db.combCompras.reduce((a,c)=>a+c.valor,0);
    const abastecido=db.abastecimentos.reduce((a,x)=>a+x.litros,0);
    const saldo=comprado-abastecido;
    const consumo=m=>{const xs=db.abastecimentos.filter(x=>x.maqId===m.id).sort((a,b)=>a.horimetro-b.horimetro);
      if(xs.length<2)return null;
      const dh=xs[xs.length-1].horimetro-xs[0].horimetro;if(dh<=0)return null;
      return (xs.reduce((a,x)=>a+x.litros,0)-xs[0].litros)/dh;};
    return `<div class="cards">
      ${kpi('Saldo do tanque',N(saldo)+' L',N(comprado)+' L comprados − '+N(abastecido)+' L abastecidos')}
      ${kpi('Custo médio',BRL2(gasto/(comprado||1))+'/L',BRL(gasto)+' em compras')}
      ${kpi('Abastecimentos',db.abastecimentos.length,'registrados na safra')}
    </div>
    <div class="row2">
      <div class="panel"><h3>Compra de diesel</h3>
        <form class="f" id="f-comb-compra">
          <label>Data<input type="date" name="data" value="${hoje}" required></label>
          <label>Litros<input type="number" step="1" name="litros" required style="width:85px"></label>
          <label>Valor total R$<input type="number" step="0.01" name="valor" required style="width:100px"></label>
          <label>Obs./NF<input name="obs" style="width:150px"></label>
          <button class="btn ghost">+ Compra</button>
        </form></div>
      <div class="panel"><h3>Abastecimento de máquina</h3>
        <form class="f" id="f-abast">
          <label>Data<input type="date" name="data" value="${hoje}" required></label>
          <label>Máquina<select name="maqId">${db.maquinas.map(m=>`<option value="${m.id}">${esc(m.nome)}</option>`).join('')}</select></label>
          <label>Litros<input type="number" step="1" name="litros" required style="width:85px"></label>
          <label>Horímetro<input type="number" step="1" name="horimetro" required style="width:95px"></label>
          <label>Obs.<input name="obs" style="width:130px"></label>
          <button class="btn">Abastecer</button>
        </form>
        <p class="note">O horímetro informado atualiza a máquina automaticamente — o consumo (L/h) sai da diferença entre abastecimentos.</p></div>
    </div>
    <div class="tblwrap"><table><thead><tr><th>Data</th><th>Máquina</th><th class="num">Litros</th><th class="num">Horímetro</th><th class="num">Consumo médio</th><th>Obs.</th><th></th></tr></thead><tbody>
      ${db.abastecimentos.slice().sort((a,b)=>a.data<b.data?1:-1).map(x=>{const m=db.maquinas.find(q=>q.id===x.maqId)||{nome:'—'};
        const c=m.id?consumo(m):null;
        return `<tr><td>${dBRy(x.data)}</td><td>${esc(m.nome)}</td><td class="num">${N(x.litros)} L</td>
        <td class="num">${N(x.horimetro)} h</td><td class="num">${c?N(c,1)+' L/h':'—'}</td><td>${esc(x.obs)||'—'}</td>
        <td><button class="x" data-action="del" data-col="abastecimentos" data-id="${x.id}" title="Excluir">✕</button></td></tr>`;}).join('')}
    </tbody></table></div>
    <div class="tblwrap"><table style="min-width:0"><thead><tr><th>Compra</th><th class="num">Litros</th><th class="num">Valor</th><th class="num">R$/L</th><th></th></tr></thead><tbody>
      ${db.combCompras.slice().sort((a,b)=>a.data<b.data?1:-1).map(c=>`<tr><td>${dBRy(c.data)} — ${esc(c.obs)||'diesel'}</td>
        <td class="num">${N(c.litros)} L</td><td class="num">${BRL(c.valor)}</td><td class="num">${N(c.valor/(c.litros||1),2)}</td>
        <td><button class="x" data-action="del" data-col="combCompras" data-id="${c.id}" title="Excluir">✕</button></td></tr>`).join('')}
    </tbody></table></div>`;})()}
  <h2>Lembretes de manutenção</h2>
  <div class="panel"><h3>Novo lembrete (troca de óleo, filtros, graxa…)</h3>
    <form class="f" id="f-lembrete">
      <label>Máquina<select name="maqId">${db.maquinas.map(m=>`<option value="${m.id}">${esc(m.nome)}</option>`).join('')}</select></label>
      <label>O que fazer<input name="desc" required style="width:210px" placeholder="Troca de óleo motor + filtros"></label>
      <label>No horímetro (h)<input type="number" step="1" name="horimetroAlvo" min="0" style="width:110px"></label>
      <label>Ou na data<input type="date" name="dataAlvo"></label>
      <label>Anotações<input name="obs" style="width:190px" placeholder="óleo, litros, código do filtro…"></label>
      <button class="btn">Criar lembrete</button>
    </form></div>
  ${db.lembretes.map(l=>{const m=db.maquinas.find(x=>x.id===l.maqId)||{nome:'—',horimetro:0};
    const st=l.feito?['good','feito']:
      (l.horimetroAlvo&&m.horimetro>=l.horimetroAlvo)||(l.dataAlvo&&l.dataAlvo<=hoje)?['crit','vencido']:
      (l.horimetroAlvo&&m.horimetro>=l.horimetroAlvo-50)?['warn','faltam '+N(l.horimetroAlvo-m.horimetro)+' h']:['good','em dia'];
    return `<div class="alert"><span class="pill ${st[0]}">${st[1]}</span>
      <span><b>${esc(m.nome)}</b> — ${esc(l.desc)}${l.horimetroAlvo?' às '+N(l.horimetroAlvo)+' h (atual '+N(m.horimetro)+' h)':''}${l.dataAlvo?' até '+dBRy(l.dataAlvo):''}${l.obs?' · '+esc(l.obs):''}</span>
      ${l.feito?'':`<button class="btn mini" data-action="lembrete-ok" data-id="${l.id}">Feito</button>`}
      <button class="x" data-action="del" data-col="lembretes" data-id="${l.id}" title="Excluir">✕</button></div>`;}).join('')||'<p class="sub">Nenhum lembrete cadastrado.</p>'}
  <h2>Almoxarifado</h2>
  <div class="panel"><h3>Novo item</h3>
    <form class="f" id="f-item">
      <label>Item<input name="nome" required style="width:200px"></label>
      <label>Categoria<select name="cat"><option>Consumível</option><option>Suprimento</option><option>Peça</option><option>Ferramenta</option></select></label>
      <label>Qtd<input type="number" name="qtd" value="0" style="width:70px"></label>
      <label>Mínimo<input type="number" name="min" value="0" style="width:70px"></label>
      <label>Local<input name="local" style="width:100px"></label>
      <button class="btn">Cadastrar</button>
    </form>
    <h3 style="margin-top:16px">Emprestar ferramenta</h3>
    <form class="f" id="f-emprestimo">
      <label>Item<select name="itemId">${db.estoque.filter(i=>!i.resp).map(i=>`<option value="${i.id}">${esc(i.nome)}</option>`).join('')}</select></label>
      <label>Emprestada para<input name="resp" required style="width:170px" placeholder="quem levou"></label>
      <button class="btn ghost" ${db.estoque.some(i=>!i.resp)?'':'disabled'}>Emprestar</button>
    </form>
    <p class="note">O item fica marcado com quem levou até você clicar em <b>Devolver</b> na tabela — é o que alimenta o painel "Ferramentas emprestadas" lá em cima.</p></div>
  <div class="tblwrap"><table><thead><tr><th>Item</th><th>Categoria</th><th>Local</th><th class="num">Qtd</th><th class="num">Mín.</th><th>Situação</th><th>Movimentar</th><th></th></tr></thead><tbody>
    ${db.estoque.map(i=>`<tr><td>${esc(i.nome)}</td><td>${esc(i.cat)}</td><td>${esc(i.local)}</td>
      <td class="num">${N(i.qtd)}</td><td class="num">${N(i.min)}</td>
      <td>${i.resp?`<span class="pill warn" data-tip="Emprestada para ${esc(i.resp)}">c/ ${esc(i.resp)}</span>`:i.qtd<i.min?'<span class="pill crit">comprar</span>':'<span class="pill good">ok</span>'}</td>
      <td><button class="btn mini ghost" data-action="mov" data-id="${i.id}" data-d="-1">− saída</button>
          <button class="btn mini ghost" data-action="mov" data-id="${i.id}" data-d="1">+ entrada</button>
          ${i.resp?`<button class="btn mini" data-action="devolver" data-id="${i.id}">Devolver</button>`:''}</td>
      <td><button class="x" data-action="del" data-col="estoque" data-id="${i.id}" title="Excluir">✕</button></td></tr>`).join('')}
  </tbody></table></div>`;
}

/* acerto da turma com piso da diária: por dia trabalhado, paga-se o maior entre produção e diária mínima */
function calcAcerto(){
  const piso=db.params.diariaMinima||0,porC={};
  db.medicoes.filter(m=>!m.acertada).forEach(m=>{
    const c=porC[m.funcId]=porC[m.funcId]||{med:0,prod:0,dias:{},compl:0,total:0};
    const v=m.medidas*m.valorMedida;
    c.med+=m.medidas;c.prod+=v;
    c.dias[m.data]=(c.dias[m.data]||0)+v;
  });
  Object.values(porC).forEach(c=>{
    c.nDias=Object.keys(c.dias).length;
    c.compl=Object.values(c.dias).reduce((s,v)=>s+Math.max(0,piso-v),0);
    c.total=c.prod+c.compl;
  });
  return porC;
}
function medicaoHTML(){
  const p=db.params;
  const fnome=id=>(db.func.find(f=>f.id===id)||{nome:'—'}).nome;
  const pendA=db.medicoes.filter(m=>!m.acertada);
  const pendC=db.medicoes.filter(m=>!m.consolidada);
  const porC=calcAcerto();
  const totAcerto=Object.values(porC).reduce((a,x)=>a+x.total,0);
  const totCompl=Object.values(porC).reduce((a,x)=>a+x.compl,0);
  const rank={};db.medicoes.forEach(m=>rank[m.funcId]=(rank[m.funcId]||0)+m.medidas);
  const maxR=Math.max(...Object.values(rank),1);
  const talCafe=db.talhoes.filter(t=>t.cultura==='cafe');
  const medPanel=`
  <h2>Medição da colheita por colhedor</h2>
  <div class="panel"><h3>Nova medição</h3>
    <form class="f" id="f-med">
      <label>Data<input type="date" name="data" value="${hoje}" required></label>
      <label>Talhão<select name="talhaoId">${talCafe.map(t=>`<option value="${t.id}">${esc(t.nome)}</option>`).join('')}</select></label>
      <label>Colhedor<select name="funcId">${db.func.map(f=>`<option value="${f.id}">${esc(f.nome)}</option>`).join('')}</select></label>
      <label>Tipo<select name="tipo"><option>Manual (pano)</option><option>Varrição</option></select></label>
      <label>Medidas (${p.litrosPorMedida} L)<input type="number" step="0.5" name="medidas" min="0.5" required style="width:95px"></label>
      <label>R$/medida<input type="number" step="0.5" name="valorMedida" value="9" style="width:80px"></label>
      <button class="btn">Registrar</button>
    </form>
    <p class="note">A medição individual é o registro fino da turma. <b>Consolidar no Café</b> agrupa as medições por dia/talhão e cria o lançamento de colheita (sem contagem dupla); <b>Fechar acerto</b> soma o que cada colhedor tem a receber e gera o título no Financeiro.</p></div>
  <div class="row2">
    <div class="panel"><h3>Acerto em aberto — ${BRL2(totAcerto)}</h3>
      ${Object.keys(porC).length?`<div class="tblwrap" style="margin-top:0"><table style="min-width:0"><thead><tr>
        <th>Colhedor</th><th class="num">Medidas</th><th class="num">Dias</th><th class="num">Produção</th><th class="num">Compl. piso</th><th class="num">A receber</th><th>Recibo</th></tr></thead><tbody>
        ${Object.entries(porC).map(([id,x])=>`<tr><td>${esc(fnome(id))}</td>
          <td class="num">${N(x.med,1)}</td><td class="num">${N(x.nDias)}</td>
          <td class="num">${BRL2(x.prod)}</td>
          <td class="num">${x.compl?`<span class="pill warn">${BRL2(x.compl)}</span>`:'—'}</td>
          <td class="num"><b>${BRL2(x.total)}</b></td>
          <td><button class="btn mini ghost" data-action="recibo" data-id="${id}">Imprimir</button></td></tr>`).join('')}
      </tbody></table></div>
      <p class="note">Piso de ${BRL2(p.diariaMinima)} por dia trabalhado (ajuste em Cadastros & Dados). ${totCompl?`Nesta turma, <b>${BRL2(totCompl)}</b> em complementos garantem a diária mínima de quem rendeu menos.`:'Nenhum complemento necessário — todos renderam acima do piso.'}</p>`
      :'<p class="sub">Nenhuma medição em aberto.</p>'}
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
        <button class="btn" data-action="acerto" ${pendA.length?'':'disabled'}>Fechar acerto → Financeiro</button>
        <button class="btn ghost" data-action="consolida" ${pendC.length?'':'disabled'}>Consolidar no Café (${pendC.length})</button>
      </div></div>
    <div class="panel"><h3>Ranking de colhedores (medidas na safra)</h3>
      ${Object.entries(rank).sort((a,b)=>b[1]-a[1]).map(([id,v])=>`<div class="hbar"><span>${esc(fnome(id))}</span>
        <span class="bar" style="width:${Math.max(2,v/maxR*100)}%;background:var(--cafe);opacity:.75"></span>
        <span class="n">${N(v,1)} medidas</span></div>`).join('')||'<p class="sub">Sem medições registradas.</p>'}</div>
  </div>
  <div class="tblwrap"><table><thead><tr><th>Data</th><th>Talhão</th><th>Colhedor</th><th>Tipo</th><th class="num">Medidas</th><th class="num">Litros</th><th class="num">Valor</th><th>Situação</th><th></th></tr></thead><tbody>
    ${db.medicoes.slice().sort((a,b)=>a.data<b.data?1:-1).map(m=>`<tr>
      <td>${dBRy(m.data)}</td><td>${esc(tal(m.talhaoId).nome)}</td><td>${esc(fnome(m.funcId))}</td><td>${esc(m.tipo)}</td>
      <td class="num">${N(m.medidas,1)}</td><td class="num">${N(m.medidas*p.litrosPorMedida)}</td>
      <td class="num">${BRL2(m.medidas*m.valorMedida)}</td>
      <td><span class="pill ${m.acertada?'good':'warn'}">${m.acertada?'acertada':'a pagar'}</span>
          <span class="pill ${m.consolidada?'good':'warn'}">${m.consolidada?'no café':'não consolidada'}</span></td>
      <td><button class="x" data-action="del" data-col="medicoes" data-id="${m.id}" title="Excluir">✕</button></td></tr>`).join('')}
  </tbody></table></div>`;
  return medPanel;
}

/* ===== PVgest · Pulverização (portado de allanwag.github.io/pvgest) ===== */
/* fórmula de bulbo úmido (Stull) portada do app.js do PVgest original */
function calcWetBulb(T,rh){
  return T*Math.atan(0.151977*Math.sqrt(rh+8.313659))+Math.atan(T+rh)-Math.atan(rh-1.676331)
    +0.00391838*Math.pow(rh,1.5)*Math.atan(0.023101*rh)-4.686035;
}
function updDT(){
  const g=id=>{const el=document.getElementById(id);return el?parseFloat(el.value)||0:0;};
  const T=g('dt-t'),rh=g('dt-rh'),w=g('dt-w');
  const wb=calcWetBulb(T,rh),dt=T-wb;
  const st=dt<2?['warn','UR muito alta — risco de inversão térmica; não pulverize']:
    dt<=8?['good','Janela ideal (ΔT 2–8): boa evaporação, mínima deriva']:
    dt<=10?['warn','Limiar (ΔT 8–10): use gotas maiores e horários mais frescos']:
    ['crit','Crítico (ΔT >10): evaporação extrema — suspenda a aplicação'];
  const ws=w<3?['warn','Vento calmo (<3 km/h): risco de inversão térmica']:
    w<=15?['good','Vento ideal (3–15 km/h): boa dispersão']:
    w<=20?['warn','Vento no limite (15–20 km/h): risco de deriva']:
    ['crit','Vento excessivo (>20 km/h): suspenda imediatamente'];
  const el=document.getElementById('dt-out');
  if(el)el.innerHTML=`<div style="font-size:34px;font-weight:800;letter-spacing:-.02em">ΔT ${dt.toFixed(1)}</div>
    <div style="margin:6px 0"><span class="pill ${st[0]}">${st[1]}</span></div>
    <div style="font-size:13px;color:var(--ink2)">Bulbo úmido ${wb.toFixed(1)} °C</div>
    <div style="margin-top:6px"><span class="pill ${ws[0]}">${ws[1]}</span></div>`;
}
let recItens=[];
function recListHTML(){
  return recItens.map((it,ix)=>{const p=db.defensivos.find(d=>d.id===it.prodId)||{nome:'—',unidade:''};
    return `<div class="alert"><span>${esc(p.nome)} — ${N(it.dose,2)} ${esc(p.unidade)}/ha</span>
      <button class="x" data-action="del-rec-item" data-idx="${ix}" type="button">✕</button></div>`;}).join('')
    ||'<span class="sub">Nenhum produto na calda ainda.</span>';
}
const custoReceitaHa=r=>(r.itens||[]).reduce((s,i)=>{const p=db.defensivos.find(d=>d.id===i.prodId);return s+i.dose*(p?p.preco:0);},0);
/* título financeiro de uma carga paga — derivado da própria carga, para que lançar,
   editar e excluir a carga usem exatamente a mesma regra */
function finCarga(c){const x=cargaCalc(c);
  return {tipo:'entrada',categoria:'Venda de grãos',centro:NOMES_CULT[c.cultura]||c.cultura,
    desc:(NOMES_CULT[c.cultura]||c.cultura)+' — NF '+(c.nf||'s/nº')+' ('+N(x.sacas,0)+' sc)',
    valor:x.valor,status:'realizado',cargaId:c.id};}
/* soma dias a uma data ISO (AAAA-MM-DD) */
function addDias(iso,d){const dt=new Date(iso+'T12:00:00');dt.setDate(dt.getDate()+d);
  return dt.toISOString().slice(0,10);}
const diasEntre=(a,b)=>Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000);
/* carência/reentrada vigentes de um talhão: olha as aplicações concluídas e a maior carência da calda */
function statusCarencia(talhaoId,ref){
  ref=ref||hoje;let pior=null;
  db.pulvOS.filter(o=>o.talhaoId===talhaoId&&o.status==='concluida').forEach(o=>{
    const r=db.receitas.find(x=>x.id===o.receitaId);if(!r)return;
    let dias=0,horas=0,prod='';
    (r.itens||[]).forEach(i=>{const p=db.defensivos.find(d=>d.id===i.prodId);if(!p)return;
      if((p.carencia||0)>dias){dias=p.carencia||0;prod=p.nome;}
      if((p.reentrada||0)>horas)horas=p.reentrada||0;});
    const libera=addDias(o.data,dias),liberaRe=addDias(o.data,Math.ceil(horas/24));
    if(dias&&libera>ref&&(!pior||libera>pior.libera))pior={libera,liberaRe,prod,receita:r.nome,data:o.data,dias,horas};
    else if(!dias&&horas&&liberaRe>ref&&!pior)pior={libera:null,liberaRe,prod,receita:r.nome,data:o.data,dias,horas};
  });
  return pior;
}
function pgPvgest(){
  const abertas=db.pulvOS.filter(o=>o.status==='aberta');
  const baixoD=db.defensivos.filter(d=>d.qtd<d.min);
  const osCusto=o=>{const r=db.receitas.find(x=>x.id===o.receitaId);return r?custoReceitaHa(r)*o.area:0;};
  const custoAplicado=db.pulvOS.filter(o=>o.status==='concluida').reduce((s,o)=>s+osCusto(o),0);
  return `<h1>PVgest · Pulverização</h1>
  <p class="sub">O PVgest (<a href="https://allanwag.github.io/pvgest/" target="_blank" rel="noopener" style="color:var(--accent)">app original</a>) dentro do Gefaz360: janela de aplicação (Delta T), receitas de calda, estoque de defensivos e ordens de aplicação — com baixa de estoque e custo lançado direto no Financeiro.</p>
  <div class="cards">
    ${kpi('Ordens abertas',abertas.length,abertas.length?'aguardando janela de aplicação':'nada agendado')}
    ${kpi('Custo aplicado na safra',BRL(custoAplicado),'defensivos das OS concluídas')}
    ${kpi('Defensivos p/ comprar',baixoD.length,baixoD.map(d=>d.nome.split(' ')[0]).join(', ')||'estoque ok')}
    ${kpi('Receitas de calda',db.receitas.length,'cadastradas')}
  </div>
  <div class="row2">
    <div class="panel" id="dt-calc"><h3>Janela de aplicação — Delta T</h3>
      <form class="f" data-passive-form>
        <label>Temperatura °C<input type="number" id="dt-t" value="26" step="0.5" min="0" max="45" style="width:90px"></label>
        <label>Umidade %UR<input type="number" id="dt-rh" value="60" step="1" min="10" max="100" style="width:90px"></label>
        <label>Vento km/h<input type="number" id="dt-w" value="8" step="0.5" min="0" max="40" style="width:90px"></label>
      </form>
      <div id="dt-out" style="margin-top:10px"></div>
      <div style="margin-top:10px"><button class="btn ghost mini" data-action="save-dt">Salvar leitura no histórico</button></div>
      <div style="margin-top:6px">${db.leiturasDT.slice(-6).reverse().map(x=>`<div class="alert">
        <span class="pill ${x.dt>=2&&x.dt<=8?'good':'warn'}">ΔT ${N(x.dt,1)}</span>
        ${dBRy(x.data)} — ${N(x.temp,1)} °C · ${N(x.rh)}% UR · ${N(x.vento,1)} km/h
        <button class="x" data-action="del" data-col="leiturasDT" data-id="${x.id}" title="Excluir">✕</button></div>`).join('')}</div></div>
    <div class="panel"><h3>Nova ordem de aplicação</h3>
      <form class="f" id="f-pos">
        <label>Data<input type="date" name="data" value="${hoje}" required></label>
        <label>Talhão<select name="talhaoId">${db.talhoes.map(t=>`<option value="${t.id}">${esc(t.nome)} (${t.cultura==='cafe'?'café':t.cultura})</option>`).join('')}</select></label>
        <label>Receita<select name="receitaId">${db.receitas.map(r=>`<option value="${r.id}">${esc(r.nome)}</option>`).join('')}</select></label>
        <label>Via<select name="via"><option>Foliar</option><option>Via solo (drench)</option><option>Tronco</option></select></label>
        <label>Área (ha)<input type="number" step="0.1" name="area" required style="width:85px"></label>
        <label>Obs.<input name="obs" style="width:150px"></label>
        <button class="btn">Abrir ordem</button>
      </form>
      <div id="pulv-msg" style="margin-top:8px"></div>
      <p class="note">Ao <b>concluir</b> uma ordem, o Gefaz360 valida e baixa o estoque de defensivos (dose × área) e lança o custo no Financeiro, no centro de custo da cultura do talhão.</p></div>
  </div>
  <div class="tblwrap"><table><thead><tr><th>Data</th><th>Talhão</th><th>Receita</th><th>Via</th><th class="num">Área</th><th class="num">Calda (L)</th><th class="num">Custo est.</th><th>Status</th><th></th></tr></thead><tbody>
    ${db.pulvOS.slice().sort((a,b)=>a.data<b.data?1:-1).map(o=>{const r=db.receitas.find(x=>x.id===o.receitaId)||{nome:'—',volumeHa:0};
      return `<tr><td>${dBRy(o.data)}</td><td>${esc(tal(o.talhaoId).nome)}</td><td>${esc(r.nome)}${o.obs?` <span class="sub">· ${esc(o.obs)}</span>`:''}</td>
      <td>${(o.via||'Foliar')==='Foliar'?'Foliar':`<span class="pill warn">${esc(o.via)}</span>`}</td>
      <td class="num">${N(o.area,1)} ha</td><td class="num">${N(r.volumeHa*o.area)}</td><td class="num">${BRL(osCusto(o))}</td>
      <td>${o.status==='concluida'?'<span class="pill good">concluída</span>':`<button class="btn mini" data-action="concluir-pos" data-id="${o.id}">Concluir aplicação</button>`}</td>
      <td><button class="x" data-action="del" data-col="pulvOS" data-id="${o.id}" title="Excluir">✕</button></td></tr>`;}).join('')}
  </tbody></table></div>
  <h2>Regulagens de aplicação</h2>
  <div class="panel"><h3>Nova regulagem</h3>
    <form class="f" id="f-regap">
      <label>Data<input type="date" name="data" value="${hoje}" required></label>
      <label>Máquina<select name="maquinaId"><option value="">—</option>${db.maquinas.map(m=>`<option value="${m.id}">${esc(m.nome)}</option>`).join('')}</select></label>
      <label>Velocidade km/h<input type="number" step="0.1" name="velocidade" min="0" style="width:105px"></label>
      <label>RPM<input type="number" name="rpm" min="0" style="width:80px"></label>
      <label>Tipo de bico<input name="bico" style="width:170px" placeholder="Cone vazio ATR 2.0"></label>
      <label>Qtd. bicos<input type="number" name="numBicos" min="0" style="width:80px"></label>
      <label>Vazão L/ha<input type="number" step="1" name="vazaoHa" min="0" style="width:90px"></label>
      <label>Vazão/bico L/min<input type="number" step="0.01" name="vazaoBico" min="0" style="width:110px"></label>
      <label>Obs. (pressão, calda…)<input name="obs" style="width:180px"></label>
      <button class="btn">Salvar regulagem</button>
    </form>
    <p class="note">Guarde a regulagem que fechou a vazão certa — o histórico evita recalibrar do zero a cada aplicação. A tabela mostra a <b>vazão total</b> (bicos × vazão/bico) para conferência rápida.</p></div>
  <div class="tblwrap"><table><thead><tr><th>Data</th><th>Máquina</th><th class="num">Veloc.</th><th class="num">RPM</th><th>Bico</th><th class="num">Qtd.</th><th class="num">L/ha</th><th class="num">L/min·bico</th><th class="num">Vazão total</th><th>Obs.</th><th></th></tr></thead><tbody>
    ${db.regAplicacao.slice().sort((a,b)=>a.data<b.data?1:-1).map(g=>{const m=db.maquinas.find(x=>x.id===g.maquinaId);
      return `<tr><td>${dBRy(g.data)}</td><td>${esc(m?m.nome:'—')}</td>
      <td class="num">${g.velocidade?N(g.velocidade,1):'—'}</td><td class="num">${g.rpm?N(g.rpm):'—'}</td>
      <td>${esc(g.bico)||'—'}</td><td class="num">${g.numBicos?N(g.numBicos):'—'}</td>
      <td class="num">${g.vazaoHa?N(g.vazaoHa):'—'}</td><td class="num">${g.vazaoBico?N(g.vazaoBico,2):'—'}</td>
      <td class="num">${(g.numBicos&&g.vazaoBico)?N(g.numBicos*g.vazaoBico,1)+' L/min':'—'}</td>
      <td style="white-space:normal">${esc(g.obs)||'—'}</td>
      <td><button class="x" data-action="del" data-col="regAplicacao" data-id="${g.id}" title="Excluir">✕</button></td></tr>`;}).join('')}
  </tbody></table></div>
  <h2>Receitas de calda</h2>
  <div class="panel"><h3>Nova receita</h3>
    <form class="f" id="f-rec">
      <label>Nome<input name="nome" required style="width:200px" placeholder="Ferrugem — calda padrão"></label>
      <label>Cultura<input name="cultura" style="width:90px" placeholder="Café"></label>
      <label>Alvo<input name="alvo" style="width:150px" placeholder="Hemileia vastatrix"></label>
      <label>Calda (L/ha)<input type="number" name="volumeHa" value="400" style="width:90px"></label>
      <button class="btn">Salvar receita</button>
    </form>
    <div class="f" style="display:flex;gap:10px;align-items:flex-end;margin-top:10px;flex-wrap:wrap">
      <label style="display:flex;flex-direction:column;gap:3px;font-size:11.5px;font-weight:600;color:var(--ink2)">Produto
        <select id="rec-prod">${db.defensivos.map(d=>`<option value="${d.id}">${esc(d.nome)} (${esc(d.unidade)})</option>`).join('')}</select></label>
      <label style="display:flex;flex-direction:column;gap:3px;font-size:11.5px;font-weight:600;color:var(--ink2)">Dose (un/ha)
        <input type="number" step="0.01" id="rec-dose" style="width:90px"></label>
      <button class="btn ghost" data-action="add-rec-item" type="button">+ Adicionar à calda</button>
    </div>
    <div id="rec-list" style="margin-top:8px">${recListHTML()}</div></div>
  <div class="tblwrap"><table><thead><tr><th>Receita</th><th>Cultura</th><th>Alvo</th><th class="num">Calda L/ha</th><th class="num">Produtos</th><th class="num">Custo/ha</th><th></th></tr></thead><tbody>
    ${db.receitas.map(r=>`<tr><td>${esc(r.nome)}</td><td>${esc(r.cultura||'—')}</td><td>${esc(r.alvo||'—')}</td>
      <td class="num">${N(r.volumeHa)}</td><td class="num">${(r.itens||[]).length}</td><td class="num">${BRL2(custoReceitaHa(r))}</td>
      <td><button class="x" data-action="del" data-col="receitas" data-id="${r.id}" title="Excluir">✕</button></td></tr>`).join('')}
  </tbody></table></div>
  <h2>Estoque de defensivos</h2>
  <div class="panel"><h3>Novo produto</h3>
    <form class="f" id="f-def">
      <label>Produto<input name="nome" required style="width:200px"></label>
      <label>Classe<select name="classe"><option>Herbicida</option><option>Fungicida</option><option>Inseticida</option><option>Adjuvante</option><option>Foliar</option></select></label>
      <label>Unidade<select name="unidade"><option>L</option><option>kg</option><option>un</option></select></label>
      <label>Preço R$/un<input type="number" step="0.01" name="preco" value="0" style="width:90px"></label>
      <label>Qtd<input type="number" step="0.1" name="qtd" value="0" style="width:75px"></label>
      <label>Mínimo<input type="number" step="0.1" name="min" value="0" style="width:75px"></label>
      <label>Carência (dias)<input type="number" step="1" name="carencia" value="0" style="width:105px"></label>
      <label>Reentrada (h)<input type="number" step="1" name="reentrada" value="0" style="width:100px"></label>
      <button class="btn">Cadastrar</button>
    </form></div>
  <div class="tblwrap"><table><thead><tr><th>Produto</th><th>Classe</th><th class="num">Qtd</th><th class="num">Mín.</th><th class="num">R$/un</th><th class="num">Carência</th><th class="num">Reentrada</th><th>Situação</th><th>Movimentar</th><th></th></tr></thead><tbody>
    ${db.defensivos.map(d=>`<tr><td>${esc(d.nome)}</td><td>${esc(d.classe)}</td>
      <td class="num">${N(d.qtd,1)} ${esc(d.unidade)}</td><td class="num">${N(d.min,1)}</td><td class="num">${N(d.preco,2)}</td>
      <td class="num">${d.carencia?N(d.carencia)+' d':'—'}</td><td class="num">${d.reentrada?N(d.reentrada)+' h':'—'}</td>
      <td>${d.qtd<d.min?'<span class="pill crit">comprar</span>':'<span class="pill good">ok</span>'}</td>
      <td><button class="btn mini ghost" data-action="mov-def" data-id="${d.id}" data-d="-1">− saída</button>
          <button class="btn mini ghost" data-action="mov-def" data-id="${d.id}" data-d="1">+ entrada</button></td>
      <td><button class="x" data-action="del" data-col="defensivos" data-id="${d.id}" title="Excluir">✕</button></td></tr>`).join('')}
  </tbody></table></div>
  <div class="panel"><h3>Importar dados do PVgest original</h3>
    <p class="note">O PVgest guarda os dados no navegador (chave <b>pvgest_v1</b>) e ainda não tem botão de backup. Para trazer seus dados reais: abra o PVgest, pressione F12 → Console, digite <b>copy(localStorage.getItem('pvgest_v1'))</b>, cole num arquivo .json e importe aqui. Trago talhões, produtos e receitas.</p>
    <label class="btn ghost" style="display:inline-block;cursor:pointer;margin-top:8px">Importar JSON do PVgest<input type="file" id="imp-pv" accept=".json,.txt" style="display:none"></label>
    <span id="imp-pv-msg" class="sub" style="margin-left:10px"></span></div>`;
}

function pgConfig(){
  const p=db.params;
  return `<h1>Cadastros & dados</h1>
  <p class="sub">Talhões, parâmetros da safra e backup completo do Gefaz360.</p>
  <div class="row2">
    <div class="panel"><h3>Parâmetros da safra</h3>
      <form class="f" id="f-param">
        <label>Litros por carreta<input type="number" name="litrosPorCarreta" value="${p.litrosPorCarreta}" style="width:100px"></label>
        <label>Litros por saca beneficiada<input type="number" name="litrosPorSaca" value="${p.litrosPorSaca}" style="width:110px"></label>
        <label>Litros por medida<input type="number" name="litrosPorMedida" value="${p.litrosPorMedida}" style="width:100px"></label>
        <label>Diesel mínimo no tanque (L)<input type="number" name="minDiesel" value="${p.minDiesel}" style="width:140px"></label>
        <label>Diária mínima da turma (R$)<input type="number" step="0.01" name="diariaMinima" value="${p.diariaMinima}" style="width:150px"></label>
        <label>Mês de início do ano-safra<select name="mesInicioSafra">${mesNome.map((m,i)=>`<option value="${i+1}" ${i+1===(p.mesInicioSafra||10)?'selected':''}>${m}</option>`).join('')}</select></label>
        <button class="btn">Salvar</button>
      </form>
      <p class="note">O <b>ano-safra</b> é bienal: começa no mês escolhido e termina no mês anterior do ano seguinte — com início em <b>${mesNome[(p.mesInicioSafra||10)-1]}</b>, a safra <b>${safraDe(hoje)}</b> cobre ${safraPeriodo(safraDe(hoje))}. Outubro mantém soja, milho safrinha, café e trigo inteiros dentro da mesma safra, em vez de partir a colheita na virada do ano civil. <b>Atenção:</b> mudar o mês reagrupa todos os lançamentos, e as marcações de bienalidade do café (que guardam o nome da safra) podem precisar de revisão.</p>
      <p class="note">A <b>carreta</b> é a unidade operacional da colheita de café — informe aqui quantos litros cabem na carreta da fazenda. O rendimento (L → saca) varia por talhão e por ano (típico: 380–500 L/sc); registre o rendimento real pós-benefício para calibrar.</p>
      <h3 style="margin-top:18px">Dados</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
        <button class="btn ghost" data-action="export">Exportar backup completo</button>
        <label class="btn ghost" style="display:inline-block;cursor:pointer">Importar JSON<input type="file" id="imp" accept=".json" style="display:none"></label>
        <button class="btn ghost" data-action="restore-backup" ${localStorage.getItem(LS_RECOVERY)?'':'disabled'}>Restaurar último ponto de recuperação</button>
        <button class="btn ghost" data-action="reset">Restaurar dados de exemplo</button>
      </div>
      <div id="imp-msg" class="sub" role="status" aria-live="polite" style="margin-top:8px"></div>
      <p class="note">O backup completo inclui os registros, fotos e PDFs disponíveis neste navegador. Antes de importar, restaurar ou excluir, o sistema cria automaticamente um ponto de recuperação local.</p></div>
    <div class="panel"><h3>Novo talhão</h3>
      <form class="f" id="f-talhao">
        <label>Nome<input name="nome" required style="width:150px"></label>
        <label>Cultura<select name="cultura"><option value="cafe">Café</option><option value="milho">Milho</option><option value="soja">Soja</option><option value="sorgo">Sorgo</option><option value="trigo">Trigo</option><option value="cobertura">Cobertura</option></select></label>
        <label>Variedade/cultivar<input name="variedade" style="width:140px" placeholder="Catuaí, DKB 390…"></label>
        <label>Área (ha)<input type="number" step="0.1" name="area" required style="width:85px"></label>
        <button class="btn">Cadastrar</button>
      </form>
      <div class="tblwrap"><table style="min-width:0"><thead><tr><th>Talhão</th><th>Cultura</th><th>Variedade</th><th class="num">Área</th><th></th></tr></thead><tbody>
        ${db.talhoes.map(t=>`<tr><td>${esc(t.nome)}</td><td>${t.cultura==='cafe'?'Café':t.cultura[0].toUpperCase()+t.cultura.slice(1)}</td>
          <td>${esc(t.variedade)||'—'}</td><td class="num">${N(t.area,1)} ha</td>
          <td><button class="x" data-action="del" data-col="talhoes" data-id="${t.id}" title="Excluir">✕</button></td></tr>`).join('')}
      </tbody></table></div></div>
  </div>
  <h2>Análises de solo (histórico por talhão)</h2>
  <div class="panel"><h3>Nova análise</h3>
    <form class="f" id="f-solo">
      <label>Data<input type="date" name="data" value="${hoje}" required></label>
      <label>Talhão<select name="talhaoId">${db.talhoes.map(t=>`<option value="${t.id}">${esc(t.nome)}</option>`).join('')}</select></label>
      <label>Profundidade<select name="prof"><option>0–20 cm</option><option>20–40 cm</option></select></label>
      <label>pH<input type="number" step="0.1" name="ph" style="width:70px"></label>
      <label>M.O. %<input type="number" step="0.1" name="mo" style="width:75px"></label>
      <label>P mg/dm³<input type="number" step="0.1" name="p" style="width:85px"></label>
      <label>K mg/dm³<input type="number" step="1" name="k" style="width:85px"></label>
      <label>Ca cmolc<input type="number" step="0.1" name="ca" style="width:80px"></label>
      <label>Mg cmolc<input type="number" step="0.1" name="mg" style="width:80px"></label>
      <label>V %<input type="number" step="1" name="v" style="width:70px"></label>
      <label>S mg/dm³<input type="number" step="0.1" name="s" style="width:80px"></label>
      <label>Al cmolc<input type="number" step="0.1" name="al" style="width:75px"></label>
      <label>H+Al cmolc<input type="number" step="0.1" name="hal" style="width:90px"></label>
      <label>CTC cmolc<input type="number" step="0.1" name="ctc" style="width:85px"></label>
      <label>m % (sat. Al)<input type="number" step="1" name="m" style="width:90px"></label>
      <label>B mg/dm³<input type="number" step="0.01" name="b" style="width:80px"></label>
      <label>Cu<input type="number" step="0.1" name="cu" style="width:65px"></label>
      <label>Fe<input type="number" step="1" name="fe" style="width:65px"></label>
      <label>Mn<input type="number" step="0.1" name="mn" style="width:65px"></label>
      <label>Zn<input type="number" step="0.1" name="zn" style="width:65px"></label>
      <label>Argila %<input type="number" step="1" name="argila" style="width:80px"></label>
      <label>Silte %<input type="number" step="1" name="silte" style="width:75px"></label>
      <label>Areia %<input type="number" step="1" name="areia" style="width:75px"></label>
      <label>Obs./recomendação<input name="obs" style="width:220px"></label>
      <button class="btn">Registrar análise</button>
    </form>
    <p class="note">Registre também as análises de anos anteriores (o seletor de safra da barra lateral aceita anos passados). O histórico por talhão mostra a evolução da fertilidade e embasa calagem e adubação.</p></div>
  <div class="tblwrap"><table><thead><tr><th>Data</th><th>Talhão</th><th>Prof.</th><th class="num">pH</th><th class="num">M.O.%</th><th class="num">P</th><th class="num">K</th><th class="num">Ca</th><th class="num">Mg</th><th class="num">CTC</th><th class="num">V%</th><th class="num">Argila%</th><th>Obs.</th><th></th></tr></thead><tbody>
    ${db.solos.slice().sort((a,b)=>a.data<b.data?1:-1).map(s=>`<tr data-tip="${esc(['S '+(s.s?N(s.s,1):'—'),'Al '+(s.al!==undefined&&s.al!==''?N(s.al,1):'—'),'H+Al '+(s.hal?N(s.hal,1):'—'),'m% '+(s.m!==undefined&&s.m!==''?N(s.m):'—'),'B '+(s.b?N(s.b,2):'—'),'Cu '+(s.cu?N(s.cu,1):'—'),'Fe '+(s.fe?N(s.fe):'—'),'Mn '+(s.mn?N(s.mn,1):'—'),'Zn '+(s.zn?N(s.zn,1):'—'),'Silte '+(s.silte?N(s.silte)+'%':'—'),'Areia '+(s.areia?N(s.areia)+'%':'—')].join(' · '))}">
      <td>${dBRy(s.data)}</td><td>${esc(tal(s.talhaoId).nome)}</td><td>${esc(s.prof)}</td>
      <td class="num">${s.ph?N(s.ph,1):'—'}</td><td class="num">${s.mo?N(s.mo,1):'—'}</td>
      <td class="num">${s.p?N(s.p,1):'—'}</td><td class="num">${s.k?N(s.k):'—'}</td>
      <td class="num">${s.ca?N(s.ca,1):'—'}</td><td class="num">${s.mg?N(s.mg,1):'—'}</td>
      <td class="num">${s.ctc?N(s.ctc,1):'—'}</td>
      <td class="num">${s.v?`<span class="pill ${s.v>=55?'good':s.v>=45?'warn':'crit'}">${N(s.v)}</span>`:'—'}</td>
      <td class="num">${s.argila?N(s.argila):'—'}</td>
      <td style="white-space:normal">${esc(s.obs)||'—'}</td>
      <td><button class="x" data-action="del" data-col="solos" data-id="${s.id}" title="Excluir">✕</button></td></tr>`).join('')}
  </tbody></table></div>
  <h2>Adubações e calagem por talhão</h2>
  <div class="panel"><h3>Novo registro</h3>
    <form class="f" id="f-adub">
      <label>Data<input type="date" name="data" value="${hoje}" required></label>
      <label>Talhão<select name="talhaoId">${db.talhoes.map(t=>`<option value="${t.id}">${esc(t.nome)}</option>`).join('')}</select></label>
      <label>Operação<select name="operacao"><option>Adubação</option><option>Calagem</option><option>Gessagem</option><option>Adubação foliar</option><option>Orgânica</option></select></label>
      <label>Produto<input name="produto" required style="width:190px" placeholder="20-05-20, calcário, ureia…"></label>
      <label>Dose<input type="number" step="0.1" name="dose" required style="width:80px"></label>
      <label>Unidade<select name="unidade"><option>kg/ha</option><option>t/ha</option><option>L/ha</option><option>g/planta</option></select></label>
      <label>Área (ha)<input type="number" step="0.1" name="area" required style="width:85px"></label>
      <label>Obs.<input name="obs" style="width:200px"></label>
      <button class="btn">Registrar</button>
    </form>
    <p class="note">Amarre a calagem à análise de solo que a recomendou (cite a data na observação). O histórico por talhão — análise → correção → adubação → produtividade — é o que fecha a conta da fertilidade.</p></div>
  <div class="tblwrap"><table><thead><tr><th>Data</th><th>Talhão</th><th>Operação</th><th>Produto</th><th class="num">Dose</th><th class="num">Área</th><th class="num">Total aplicado</th><th>Obs.</th><th></th></tr></thead><tbody>
    ${F(db.adubacoes).slice().sort((a,b)=>a.data<b.data?1:-1).map(ad=>{
      const porHa=ad.unidade.endsWith('/ha');
      return `<tr><td>${dBRy(ad.data)}</td><td>${esc(tal(ad.talhaoId).nome)}</td>
      <td><span class="pill ${ad.operacao==='Calagem'||ad.operacao==='Gessagem'?'warn':'good'}">${esc(ad.operacao)}</span></td>
      <td>${esc(ad.produto)}</td><td class="num">${N(ad.dose,1)} ${esc(ad.unidade)}</td>
      <td class="num">${N(ad.area,1)} ha</td>
      <td class="num">${porHa?N(ad.dose*ad.area,1)+' '+esc(ad.unidade.replace('/ha','')):'—'}</td>
      <td style="white-space:normal">${esc(ad.obs)||'—'}</td>
      <td><button class="x" data-action="del" data-col="adubacoes" data-id="${ad.id}" title="Excluir">✕</button></td></tr>`;}).join('')}
  </tbody></table></div>
  <h2>Podas por talhão (café)</h2>
  <div class="panel"><h3>Nova poda</h3>
    <form class="f" id="f-poda">
      <label>Data<input type="date" name="data" value="${hoje}" required></label>
      <label>Talhão<select name="talhaoId">${db.talhoes.filter(t=>t.cultura==='cafe').map(t=>`<option value="${t.id}">${esc(t.nome)}</option>`).join('')}</select></label>
      <label>Tipo<select name="tipo"><option>Desbrota</option><option>Esqueletamento</option><option>Decote</option><option>Recepa</option><option>Poda de limpeza</option></select></label>
      <label>Área (ha)<input type="number" step="0.1" name="area" required style="width:85px"></label>
      <label>Obs.<input name="obs" style="width:240px" placeholder="motivo, altura de corte, expectativa de safra…"></label>
      <button class="btn">Registrar poda</button>
    </form>
    <p class="note">Esqueletamento e recepa derrubam a safra seguinte do talhão — o registro aqui explica a produtividade baixa daquele ano na Ficha do talhão, em vez de parecer problema de manejo.</p></div>
  <div class="tblwrap"><table><thead><tr><th>Data</th><th>Talhão</th><th>Tipo</th><th class="num">Área</th><th>Obs.</th><th></th></tr></thead><tbody>
    ${F(db.podas).slice().sort((a,b)=>a.data<b.data?1:-1).map(pd=>`<tr>
      <td>${dBRy(pd.data)}</td><td>${esc(tal(pd.talhaoId).nome)}</td>
      <td><span class="pill ${pd.tipo==='Recepa'||pd.tipo==='Esqueletamento'?'crit':pd.tipo==='Decote'?'warn':'good'}">${esc(pd.tipo)}</span></td>
      <td class="num">${N(pd.area,1)} ha</td><td style="white-space:normal">${esc(pd.obs)||'—'}</td>
      <td><button class="x" data-action="del" data-col="podas" data-id="${pd.id}" title="Excluir">✕</button></td></tr>`).join('')}
  </tbody></table></div>
  <h2>Arruação & esparramação por talhão (café)</h2>
  <div class="panel"><h3>Novo registro</h3>
    <form class="f" id="f-arr">
      <label>Data<input type="date" name="data" value="${hoje}" required></label>
      <label>Talhão<select name="talhaoId">${db.talhoes.filter(t=>t.cultura==='cafe').map(t=>`<option value="${t.id}">${esc(t.nome)}</option>`).join('')}</select></label>
      <label>Operação<select name="tipo"><option>Arruação</option><option>Esparramação</option></select></label>
      <label>Área (ha)<input type="number" step="0.1" name="area" required style="width:85px"></label>
      <label>Obs.<input name="obs" style="width:240px" placeholder="implemento, condição do cisco…"></label>
      <button class="btn">Registrar</button>
    </form>
    <p class="note">A <b>arruação</b> limpa as ruas antes da colheita (prepara pano e varrição); a <b>esparramação</b> devolve o cisco à projeção da saia depois. O par arruação → colheita → esparramação de cada talhão fica visível na Ficha do talhão.</p></div>
  <div class="tblwrap"><table><thead><tr><th>Data</th><th>Talhão</th><th>Operação</th><th class="num">Área</th><th>Obs.</th><th></th></tr></thead><tbody>
    ${F(db.arruacoes).slice().sort((a,b)=>a.data<b.data?1:-1).map(ar=>`<tr>
      <td>${dBRy(ar.data)}</td><td>${esc(tal(ar.talhaoId).nome)}</td>
      <td><span class="pill ${ar.tipo==='Arruação'?'warn':'good'}">${esc(ar.tipo)}</span></td>
      <td class="num">${N(ar.area,1)} ha</td><td style="white-space:normal">${esc(ar.obs)||'—'}</td>
      <td><button class="x" data-action="del" data-col="arruacoes" data-id="${ar.id}" title="Excluir">✕</button></td></tr>`).join('')}
  </tbody></table></div>
  <h2>Capina & roçada por talhão</h2>
  <div class="panel"><h3>Novo registro</h3>
    <form class="f" id="f-cap">
      <label>Data<input type="date" name="data" value="${hoje}" required></label>
      <label>Talhão<select name="talhaoId">${db.talhoes.map(t=>`<option value="${t.id}">${esc(t.nome)}</option>`).join('')}</select></label>
      <label>Tipo<select name="tipo"><option>Roçada mecânica</option><option>Roçada manual</option><option>Capina química</option><option>Capina manual</option><option>Trincha</option></select></label>
      <label>Área (ha)<input type="number" step="0.1" name="area" required style="width:85px"></label>
      <label>Obs.<input name="obs" style="width:240px" placeholder="implemento, produto e dose, linha/entrelinha…"></label>
      <button class="btn">Registrar</button>
    </form>
    <p class="note">Vale para as ruas do café e para a entressafra dos grãos. Capina química com herbicida também pode ser lançada como ordem no PVgest · Pulverização quando você quiser baixa de estoque e custo automático — aqui é o registro operacional simples.</p></div>
  <div class="tblwrap"><table><thead><tr><th>Data</th><th>Talhão</th><th>Tipo</th><th class="num">Área</th><th>Obs.</th><th></th></tr></thead><tbody>
    ${F(db.capinas).slice().sort((a,b)=>a.data<b.data?1:-1).map(cp=>`<tr>
      <td>${dBRy(cp.data)}</td><td>${esc(tal(cp.talhaoId).nome)}</td>
      <td><span class="pill ${cp.tipo.startsWith('Capina química')?'warn':'good'}">${esc(cp.tipo)}</span></td>
      <td class="num">${N(cp.area,1)} ha</td><td style="white-space:normal">${esc(cp.obs)||'—'}</td>
      <td><button class="x" data-action="del" data-col="capinas" data-id="${cp.id}" title="Excluir">✕</button></td></tr>`).join('')}
  </tbody></table></div>
  <div class="panel"><h3>Roteiro de evolução (PVgest → Gefaz360)</h3>
    <ul class="road">
      <li><b>Fase 1 — unificar cadastros: ✅ concluída.</b> O PVgest foi portado como módulo de Pulverização, com importação dos dados originais (chave pvgest_v1).</li>
      <li><b>Fase 2 — integrar romaneio ↔ financeiro: ✅ concluída.</b> Marcar uma carga como paga (e vender café) lança a receita automaticamente no Financeiro.</li>
      <li><b>Fase 3 — custo por saca:</b> ratear insumos, diesel, manutenção e folha por talhão/cultura para fechar o custo de produção por saca.</li>
      <li><b>Fase 4 — campo offline:</b> apontamento de colheita e OS pelo celular, sem sinal, sincronizando ao chegar na sede (benchmark: Aegro, Perfarm).</li>
      <li><b>Fase 5 — fiscal:</b> emissão/validação de NF-e de produtor, LCDPR e Funrural direto do módulo financeiro.</li>
    </ul></div>`;
}

const taxaSec=s=>{const l=s.leituras||[];if(l.length<2)return 0;
  const a=l[0],b=l[l.length-1];return (a.u-b.u)/((b.h-a.h)||1);};
function pgPos(){
  const terreiro=db.lotes.filter(l=>l.status==='terreiro'),secando=db.lotes.filter(l=>l.status==='secando');
  const concl=db.secagens.filter(s=>s.status==='concluida');
  const taxaMedia=concl.length?concl.reduce((a,s)=>a+taxaSec(s),0)/concl.length:0;
  const tempoMedio=concl.length?concl.reduce((a,s)=>a+(s.horas||0),0)/concl.length:0;
  const lote=id=>db.lotes.find(l=>l.id===id)||{codigo:'—'},estoqueCafe=estoqueCafeDisponivel();
  const grafSec=db.secagens.filter(s=>(s.leituras||[]).length>1).sort((a,b)=>a.dataInicio<b.dataInicio?1:-1)[0];
  const pillOrigem=o=>`<span class="pill ${o==='Árvore'?'good':'warn'}">${esc(o)}</span>`;
  return `<h1>Café · Pós-colheita</h1>
  <p class="sub">Lotes no terreiro (identificação e observações) e secador com curva de perda de umidade por hora — a base dos indicadores de melhoria do processo.</p>
  <div class="cards">
    ${kpi('Lotes no terreiro',terreiro.length,terreiro.map(l=>l.codigo).join(', ')||'nenhum')}
    ${kpi('No secador',secando.length,secando.map(l=>l.codigo).join(', ')||'nenhum')}
    ${kpi('Perda de umidade média',concl.length?N(taxaMedia,2)+' %/h':'—','secagens concluídas')}
    ${kpi('Tempo médio de secagem',concl.length?N(tempoMedio,0)+' h':'—','entrada → ponto de tulha')}
    ${(()=>{const ben=db.lotes.reduce((a,l)=>a+(l.sacas||0),0);const vnd=db.vendasCafe.reduce((a,v)=>a+v.sacas,0);
      return kpi('Café em estoque',N(ben-vnd,0)+' sc',N(ben,0)+' sc beneficiadas − '+N(vnd,0)+' vendidas');})()}
    ${(()=>{const q=db.lotes.filter(l=>l.scaa);const md=q.length?q.reduce((a,l)=>a+l.scaa,0)/q.length:0;
      return kpi('SCAA médio',q.length?N(md,1)+' pts':'—',q.length?q.filter(l=>l.scaa>=80).length+' de '+q.length+' lotes especiais (≥80)':'sem provas registradas');})()}
    ${(()=>{const s=db.vendasCafe.reduce((a,v)=>a+v.sacas,0),vl=db.vendasCafe.reduce((a,v)=>a+v.sacas*v.preco,0);
      return kpi('Preço médio de venda',s?BRL2(vl/s)+'/sc':'—',s?N(s,0)+' sc vendidas · '+BRL(vl):'nenhuma venda ainda');})()}
  </div>
  <h2>Lotes de terreiro</h2>
  <div class="panel"><h3>Novo lote</h3>
    <form class="f" id="f-lote">
      <label>Identificação<input name="codigo" required style="width:110px" placeholder="L-2026-017"></label>
      <label>Data<input type="date" name="data" value="${hoje}" required></label>
      <label>Talhão<select name="talhaoId">${db.talhoes.filter(t=>t.cultura==='cafe').map(t=>`<option value="${t.id}">${esc(t.nome)}</option>`).join('')}</select></label>
      <label>Origem<select name="origem"><option>Árvore</option><option>Chão</option><option>Mistura</option></select></label>
      <label>Carretas<input type="number" step="0.1" name="carretas" min="0" style="width:85px"></label>
      <label style="flex-direction:row;align-items:center;gap:6px">Tomou chuva? <input type="checkbox" name="chuva" style="width:auto"></label>
      <label>Observações<input name="obs" style="width:230px" placeholder="chuva, cereja/verde, esparramação…"></label>
      <button class="btn">Criar lote</button>
    </form></div>
  <div class="tblwrap"><table><thead><tr><th>Lote</th><th>Data</th><th>Talhão</th><th>Origem</th><th>Chuva</th><th class="num">Carretas</th><th class="num">Sacas benef.</th><th>COB</th><th>Peneira</th><th class="num">SCAA</th><th>Status</th><th>Observações</th><th></th></tr></thead><tbody>
    ${F(db.lotes).slice().sort((a,b)=>a.data<b.data?1:-1).map(l=>`<tr>
      <td><b>${esc(l.codigo)}</b></td><td>${dBRy(l.data)}</td><td>${esc(tal(l.talhaoId).nome)}</td>
      <td>${pillOrigem(l.origem)}</td>
      <td>${l.chuva?'<span class="pill crit">tomou chuva</span>':'<span class="pill good">não</span>'}</td>
      <td class="num">${l.carretas?N(l.carretas,1):'—'}</td>
      <td class="num" ${l.sacas&&l.carretas?`data-tip="Rendimento real: ${N(l.carretas*db.params.litrosPorCarreta/l.sacas,0)} L/saca"`:''}>${l.sacas?N(l.sacas,0):'—'}</td>
      <td>${l.cobTipo?'Tipo '+N(l.cobTipo,1)+(l.cobBebida?' · '+esc(l.cobBebida):''):(l.cobBebida?esc(l.cobBebida):'—')}</td>
      <td>${l.peneira?esc(l.peneira)+(l.peneiraPct?' · '+N(l.peneiraPct,0)+'%':''):'—'}</td>
      <td class="num" ${l.sens?`data-tip="Aroma ${N(l.sens.aroma,2)} · Sabor ${N(l.sens.sabor,2)} · Acidez ${N(l.sens.acidez,2)} · Corpo ${N(l.sens.corpo,2)} · Final. ${N(l.sens.fin,2)}${l.descritores?' — '+esc(l.descritores):''}"`:''}>${l.scaa?`<span class="pill ${l.scaa>=80?'good':l.scaa>=70?'warn':'crit'}">${N(l.scaa,1)}</span>`:'—'}</td>
      <td><span class="pill ${l.status==='seco'||l.status==='beneficiado'?'good':l.status==='secando'?'warn':'crit'}">${l.status==='terreiro'?'no terreiro':l.status}</span></td>
      <td style="white-space:normal">${esc(l.obs)||'—'}</td>
      <td><button class="x" data-action="del" data-col="lotes" data-id="${l.id}" title="Excluir">✕</button></td></tr>`).join('')}
  </tbody></table></div>
  <h2>Secador</h2>
  <div class="row2">
    <div class="panel"><h3>Iniciar secagem</h3>
      <form class="f" id="f-sec">
        <label>Lote<select name="loteId">${terreiro.map(l=>`<option value="${l.id}">${esc(l.codigo)}</option>`).join('')}</select></label>
        <label>Umidade entrada %<input type="number" step="0.1" name="umidadeEntrada" required style="width:110px"></label>
        <label>Temp. do ar °C<input type="number" step="1" name="tempAr" style="width:95px"></label>
        <label>Temp. da massa °C<input type="number" step="1" name="tempMassa" style="width:110px"></label>
        <button class="btn" ${terreiro.length?'':'disabled'}>Mandar ao secador</button>
      </form>
      <h3 style="margin-top:16px">Leitura horária de umidade</h3>
      <form class="f" id="f-leitura">
        <label>Secagem<select name="secagemId">${db.secagens.filter(s=>s.status==='andamento').map(s=>`<option value="${s.id}">${esc(lote(s.loteId).codigo)}</option>`).join('')}</select></label>
        <label>Horas desde o início<input type="number" step="1" name="h" required style="width:120px"></label>
        <label>Umidade %<input type="number" step="0.1" name="u" required style="width:90px"></label>
        <button class="btn" ${db.secagens.some(s=>s.status==='andamento')?'':'disabled'}>Registrar leitura</button>
      </form></div>
    <div class="panel"><h3>Perda de umidade por hora${grafSec?` — lote ${esc(lote(grafSec.loteId).codigo)}`:''}</h3>
      ${grafSec?barChart({labels:grafSec.leituras.map(x=>x.h+'h'),
        series:[{name:'Umidade',color:'var(--cafe)',values:grafSec.leituras.map(x=>x.u),tipfmt:v=>N(v,1)+'% de umidade'}],
        fmt:v=>N(v,0)+'%',h:190})+
        `<p class="note">Taxa média deste lote: <b>${N(taxaSec(grafSec),2)} %/h</b>${grafSec.tempAr?` · ar ${N(grafSec.tempAr)} °C · massa ${N(grafSec.tempMassa)} °C`:''}. Compare lotes de árvore × chão e com/sem chuva para calibrar temperatura e tempo.</p>`
        :'<p class="sub">Registre ao menos duas leituras para ver a curva.</p>'}</div>
  </div>
  <div class="tblwrap"><table><thead><tr><th>Lote</th><th>Início</th><th class="num">Umid. entrada</th><th class="num">Umid. saída</th><th class="num">Ar</th><th class="num">Massa</th><th class="num">Tempo</th><th class="num">Perda %/h</th><th>Status</th><th></th></tr></thead><tbody>
    ${F(db.secagens,'dataInicio').slice().sort((a,b)=>a.dataInicio<b.dataInicio?1:-1).map(s=>{const lt=s.leituras||[];const ult=lt[lt.length-1];
      return `<tr><td><b>${esc(lote(s.loteId).codigo)}</b></td><td>${dBRy(s.dataInicio)}</td>
      <td class="num">${N(s.umidadeEntrada,1)}%</td>
      <td class="num">${s.status==='concluida'?N(s.umidadeSaida,1)+'%':ult?N(ult.u,1)+'% (atual)':'—'}</td>
      <td class="num">${s.tempAr?N(s.tempAr)+'°':'—'}</td><td class="num">${s.tempMassa?N(s.tempMassa)+'°':'—'}</td>
      <td class="num">${s.status==='concluida'?N(s.horas,0)+' h':ult?N(ult.h,0)+' h (parcial)':'—'}</td>
      <td class="num">${lt.length>1?N(taxaSec(s),2):'—'}</td>
      <td>${s.status==='concluida'?'<span class="pill good">concluída</span>':`<button class="btn mini" data-action="fim-sec" data-id="${s.id}">Finalizar</button>`}</td>
      <td><button class="x" data-action="del" data-col="secagens" data-id="${s.id}" title="Excluir">✕</button></td></tr>`;}).join('')}
  </tbody></table></div>
  <h2>Qualidade do café (COB / SCAA / perfil sensorial)</h2>
  <div class="row2">
    <div class="panel"><h3>Registrar classificação e prova de xícara</h3>
      <form class="f" id="f-qual">
        <label>Lote<select name="loteId">${db.lotes.filter(l=>l.status==='seco'||l.status==='beneficiado').map(l=>`<option value="${l.id}">${esc(l.codigo)}</option>`).join('')}</select></label>
        <label>COB — Tipo (2–8)<input type="number" step="0.5" min="2" max="8" name="cobTipo" style="width:105px"></label>
        <label>Bebida (COB)<select name="cobBebida"><option value="">—</option><option>Estritamente mole</option><option>Mole</option><option>Apenas mole</option><option>Dura</option><option>Riada</option><option>Rio</option></select></label>
        <label>SCAA (0–100)<input type="number" step="0.25" min="0" max="100" name="scaa" style="width:95px"></label>
        <label>Peneira<select name="peneira"><option value="">—</option><option>19</option><option>18</option><option>17</option><option>16</option><option>15</option><option>14</option><option>13</option><option>Moca graúda</option><option>Moca miúda</option></select></label>
        <label>% retido acima<input type="number" step="1" min="0" max="100" name="peneiraPct" style="width:100px"></label>
        <label>Aroma (0–10)<input type="number" step="0.25" min="0" max="10" name="aroma" style="width:85px"></label>
        <label>Sabor<input type="number" step="0.25" min="0" max="10" name="sabor" style="width:75px"></label>
        <label>Acidez<input type="number" step="0.25" min="0" max="10" name="acidez" style="width:75px"></label>
        <label>Corpo<input type="number" step="0.25" min="0" max="10" name="corpo" style="width:75px"></label>
        <label>Finalização<input type="number" step="0.25" min="0" max="10" name="fin" style="width:85px"></label>
        <label>Descritores<input name="descritores" style="width:210px" placeholder="chocolate, caramelo, cítrico…"></label>
        <button class="btn" ${db.lotes.some(l=>l.status==='seco'||l.status==='beneficiado')?'':'disabled'}>Salvar qualidade</button>
      </form>
      <p class="note">COB é a classificação oficial brasileira (tipo por defeitos + bebida); SCAA é a pontuação de prova — <b>≥ 80 pontos é café especial</b>. Os atributos sensoriais (0–10) e os descritores compõem o perfil de xícara do lote.</p></div>
    <div class="panel">${(()=>{
      const sl=db.lotes.filter(l=>l.sens).sort((a,b)=>a.data<b.data?1:-1)[0];
      if(!sl)return '<h3>Perfil sensorial</h3><p class="sub">Registre os atributos de um lote para ver o perfil.</p>';
      const attrs=[['Fragrância/Aroma','aroma'],['Sabor','sabor'],['Acidez','acidez'],['Corpo','corpo'],['Finalização','fin']];
      return `<h3>Perfil sensorial — lote ${esc(sl.codigo)}</h3>
      ${attrs.map(([nome,k])=>{const v=sl.sens[k]||0;
        return `<div class="hbar"><span>${nome}</span>
        <span class="bar" style="width:${Math.max(2,v/10*100)}%;background:var(--cafe)"></span>
        <span class="n">${N(v,2)}</span></div>`;}).join('')}
      ${sl.descritores?`<p class="note" style="margin-top:12px"><b>Descritores:</b> ${esc(sl.descritores)}${sl.scaa?' · <b>SCAA '+N(sl.scaa,1)+'</b>':''}</p>`:''}`;})()}</div>
  </div>
  <h2>Beneficiamento & venda</h2>
  <div class="row2">
    <div class="panel"><h3>Beneficiar lote seco</h3>
      <form class="f" id="f-benef">
        <label>Lote<select name="loteId">${db.lotes.filter(l=>l.status==='seco').map(l=>`<option value="${l.id}">${esc(l.codigo)}</option>`).join('')}</select></label>
        <label>Sacas beneficiadas (60 kg)<input type="number" step="1" name="sacas" required style="width:150px"></label>
        <button class="btn" ${db.lotes.some(l=>l.status==='seco')?'':'disabled'}>Registrar</button>
      </form>
      <p class="note">Com as carretas do lote e as sacas beneficiadas, o Gefaz360 calcula o <b>rendimento real L/saca</b> (passe o mouse na coluna "Sacas benef.") — use-o para calibrar o parâmetro de ${N(db.params.litrosPorSaca)} L/sc em Cadastros & Dados.</p></div>
    <div class="panel"><h3>Venda de café</h3>
      <form class="f" id="f-vcafe">
        <label>Data<input type="date" name="data" value="${hoje}" required></label>
        <label>Lote (opcional)<select name="loteId"><option value="">—</option>${db.lotes.filter(l=>sacasDisponiveis(l.id)>0).map(l=>`<option value="${l.id}">${esc(l.codigo)} · ${N(sacasDisponiveis(l.id),0)} sc disponíveis${l.scaa?' · SCAA '+N(l.scaa,1):''}</option>`).join('')}</select></label>
        <label>Sacas<input type="number" step="1" name="sacas" required style="width:80px"></label>
        <label>R$/saca<input type="number" step="0.01" name="preco" required style="width:95px"></label>
        <label>Comprador<input name="comprador" style="width:150px"></label>
        <label>NF-e nº<input name="nf" style="width:80px"></label>
        <label>Obs.<input name="obs" style="width:140px"></label>
        <button class="btn" ${estoqueCafe>0?'':'disabled'}>Vender</button>
      </form>
      <p class="note">Saldo disponível: <b>${N(estoqueCafe,0)} sc</b>. Vincular a venda a um lote controla o saldo daquele lote e alimenta a aba <b>Café · Inteligência</b> com o cruzamento preço × qualidade (SCAA, COB, perfil sensorial).</p>
      <p class="note">A venda lança a receita automaticamente no Financeiro (centro Café) — excluir a venda remove o lançamento junto.</p></div>
  </div>
  <div class="tblwrap"><table><thead><tr><th>Data</th><th>Lote</th><th>Comprador</th><th>NF-e</th><th class="num">Sacas</th><th class="num">R$/sc</th><th class="num">Valor</th><th>Obs.</th><th></th></tr></thead><tbody>
    ${F(db.vendasCafe).slice().sort((a,b)=>a.data<b.data?1:-1).map(v=>{const lt=db.lotes.find(l=>l.id===v.loteId);
      return `<tr>
      <td>${dBRy(v.data)}</td><td>${lt?esc(lt.codigo):'—'}</td><td>${esc(v.comprador)||'—'}</td><td>${esc(v.nf)||'—'}</td>
      <td class="num">${N(v.sacas,0)}</td><td class="num">${N(v.preco,2)}</td><td class="num">${BRL(v.sacas*v.preco)}</td>
      <td style="white-space:normal">${esc(v.obs)||'—'}</td>
      <td><button class="x" data-action="del" data-col="vendasCafe" data-id="${v.id}" title="Excluir">✕</button></td></tr>`;}).join('')}
  </tbody></table></div>`;
}
/* ===== Bienalidade do café =====
   O cafeeiro alterna safra de carga ALTA e de carga BAIXA: a alta esgota as reservas da planta
   e derruba a seguinte. Por isso comparar 2025/26 com 2024/25 não diz nada sobre o talhão —
   a comparação que informa é alta contra alta e baixa contra baixa. */
function prodSafra(talhaoId,safra){
  const t=tal(talhaoId);
  const litros=db.cafe.filter(r=>r.talhaoId===talhaoId&&safraDe(r.data)===safra).reduce((a,r)=>a+r.litros,0);
  const sc=litros/db.params.litrosPorSaca;
  return {litros,sc,scha:t.area?sc/t.area:0};
}
const safrasCafe=()=>[...new Set(db.cafe.map(r=>safraDe(r.data)).filter(x=>x))].sort();
/* sugestão automática: compara a safra com a média do próprio talhão (precisa de 2+ safras) */
function sugereCarga(talhaoId,safra){
  const ss=safrasCafe().filter(s=>prodSafra(talhaoId,s).litros>0);
  if(ss.length<2)return null;
  const v=prodSafra(talhaoId,safra).scha;if(!v)return null;
  const media=ss.reduce((a,s)=>a+prodSafra(talhaoId,s).scha,0)/ss.length;
  return v>=media?'alta':'baixa';
}
/* a marcação manual sempre manda; sem ela, cai na sugestão */
function cargaBienal(talhaoId,safra){
  const m=db.bienal.find(b=>b.talhaoId===talhaoId&&b.safra===safra);
  if(m)return {carga:m.carga,origem:'marcada',obs:m.obs||''};
  const s=sugereCarga(talhaoId,safra);
  return s?{carga:s,origem:'sugerida',obs:''}:null;
}
/* recepa e esqueletamento zeram a safra seguinte — não é bienalidade, é poda */
const podouPesado=(talhaoId,safra)=>db.podas.some(p=>p.talhaoId===talhaoId
  &&(p.tipo==='Recepa'||p.tipo==='Esqueletamento')&&safraDe(p.data)===safraAnterior(safra));
/* última safra de cada carga contra a anterior de MESMA carga */
function comparaBienal(talhaoId){
  const ss=safrasCafe().filter(s=>prodSafra(talhaoId,s).litros>0);
  const porCarga={alta:[],baixa:[]};
  ss.forEach(s=>{const c=cargaBienal(talhaoId,s);if(c)porCarga[c.carga].push(s);});
  const out={};
  ['alta','baixa'].forEach(k=>{
    const l=porCarga[k];
    if(l.length<2){out[k]=null;return;}
    const ult=l[l.length-1],ant=l[l.length-2];
    const a=prodSafra(talhaoId,ult).scha,b=prodSafra(talhaoId,ant).scha;
    out[k]={ult,ant,atual:a,anterior:b,varPct:b?(a-b)/b*100:null};
  });
  return out;
}
function pgIntel(){
  /* todas as coleções-base passam pelo filtro de safra — a página promete isso no subtítulo.
     Os .find() adiante são junções (lote de uma venda, lote de uma secagem) e ficam sem filtro
     de propósito, senão a linha perderia o nome do lote ao trocar de safra. */
  const lotesF=F(db.lotes),vendasF=F(db.vendasCafe);
  const lotesComScaa=lotesF.filter(l=>l.scaa);
  function grupo(pred,label){
    const arr=lotesComScaa.filter(pred);if(!arr.length)return null;
    const avgScaa=arr.reduce((a,l)=>a+l.scaa,0)/arr.length;
    const cobs=arr.filter(l=>l.cobTipo);
    return {label,n:arr.length,avgScaa,avgCob:cobs.length?cobs.reduce((a,l)=>a+l.cobTipo,0)/cobs.length:null};
  }
  const porOrigem=['Árvore','Chão','Mistura'].map(o=>grupo(l=>l.origem===o,o)).filter(x=>x);
  const comChuva=grupo(l=>l.chuva===true,'Tomou chuva');
  const semChuva=grupo(l=>!l.chuva,'Sem chuva');
  const secConcl=F(db.secagens,'dataInicio').filter(s=>s.status==='concluida');
  const talhoesCafe=db.talhoes.filter(t=>t.cultura==='cafe');
  const ranking=talhoesCafe.map(t=>{
    const litros=F(db.cafe).filter(r=>r.talhaoId===t.id).reduce((a,r)=>a+r.litros,0);
    const sc=litros/db.params.litrosPorSaca;
    const lotesT=lotesComScaa.filter(l=>l.talhaoId===t.id);
    return {t,sc,prodha:t.area?sc/t.area:0,nLotes:lotesT.length,
      avgScaaT:lotesT.length?lotesT.reduce((a,l)=>a+l.scaa,0)/lotesT.length:null};
  }).filter(x=>x.sc>0).sort((a,b)=>b.prodha-a.prodha);
  const vendasComLote=vendasF.filter(v=>v.loteId).map(v=>({v,lt:db.lotes.find(l=>l.id===v.loteId)}))
    .filter(x=>x.lt).sort((a,b)=>(b.lt.scaa||0)-(a.lt.scaa||0));
  const vazio=n=>`<tr><td colspan="${n}" style="text-align:center;color:var(--ink2);padding:16px">Ainda sem dados suficientes para este cruzamento.</td></tr>`;
  return `<h1>Café · Inteligência</h1>
  <p class="sub">Cruzamentos automáticos entre solo, manejo, colheita, secagem e qualidade — os fatores que explicam nota e preço, calculados sobre os seus próprios dados. Respeita o filtro de safra da barra lateral.</p>
  <div class="cards">
    ${kpi('Lotes provados',lotesComScaa.length,lotesComScaa.length?N(lotesComScaa.reduce((a,l)=>a+l.scaa,0)/lotesComScaa.length,1)+' pts SCAA médio':'aguardando provas')}
    ${kpi('Lotes que tomaram chuva',lotesF.filter(l=>l.chuva).length,lotesF.length+' lotes no total')}
    ${kpi('Secagens concluídas',secConcl.length,secConcl.length?N(secConcl.reduce((a,s)=>a+taxaSec(s),0)/secConcl.length,2)+' %/h taxa média':'—')}
    ${kpi('Vendas ligadas a lote',vendasComLote.length,vendasF.length+' vendas no total')}
  </div>

  ${(()=>{
    const tc=db.talhoes.filter(t=>t.cultura==='cafe');
    const ss=safrasCafe();
    const sAtual=anoFiltro||safraDe(hoje),sProx=safraSeguinte(sAtual);
    const pillC=c=>`<span class="pill ${c.carga==='alta'?'good':'warn'}"${c.origem==='sugerida'?' data-tip="Sugerida pelo histórico — marque para confirmar"':''}>${c.carga}${c.origem==='sugerida'?'?':''}</span>`;
    const opcS=[...new Set([...ss,sAtual,sProx])].sort().reverse();
    /* projeção: a próxima safra tende a ser o oposto da atual, no patamar da última safra igual */
    const proj=tc.map(t=>{
      const c=cargaBienal(t.id,sAtual);if(!c)return null;
      const alvo=c.carga==='alta'?'baixa':'alta';
      const iguais=ss.filter(s=>{const x=cargaBienal(t.id,s);return x&&x.carga===alvo&&prodSafra(t.id,s).litros>0;});
      if(!iguais.length)return {t,alvo,ref:null};
      const ref=iguais[iguais.length-1];
      return {t,alvo,ref,sc:prodSafra(t.id,ref).sc,scha:prodSafra(t.id,ref).scha};
    }).filter(x=>x);
    const totProj=proj.reduce((a,p)=>a+(p.sc||0),0);
    return `<h2>Bienalidade do café</h2>
  <p class="sub" style="margin-bottom:10px">O cafeeiro alterna safra de carga <b>alta</b> e <b>baixa</b>: a alta esgota a planta e derruba a seguinte. Comparar uma safra alta com uma baixa não diz nada sobre o talhão — por isso aqui a comparação é <b>alta contra alta</b> e <b>baixa contra baixa</b>.</p>
  <div class="tblwrap"><table><thead><tr><th>Talhão</th>${ss.map(s=>`<th class="num">${s}</th>`).join('')}</tr></thead><tbody>
    ${ss.length?tc.map(t=>`<tr><td><b>${esc(t.nome)}</b>${t.variedade?` <span class="sub">· ${esc(t.variedade)}</span>`:''}</td>
      ${ss.map(s=>{const p=prodSafra(t.id,s),c=cargaBienal(t.id,s);
        if(!p.litros)return '<td class="num">—</td>';
        return `<td class="num">${N(p.scha,1)} sc/ha${c?'<br>'+pillC(c):''}${podouPesado(t.id,s)?'<br><span class="pill crit" data-tip="Recepa ou esqueletamento na safra anterior — a queda é da poda, não da bienalidade">pós-poda</span>':''}</td>`;}).join('')}
    </tr>`).join(''):'<tr><td>Nenhuma colheita de café registrada ainda.</td></tr>'}
  </tbody></table></div>
  <div class="row2">
    <div class="panel"><h3>Comparação na mesma carga</h3>
      ${(()=>{const linhas=tc.map(t=>({t,c:comparaBienal(t.id)})).filter(x=>x.c.alta||x.c.baixa);
        if(!linhas.length)return '<p class="sub">Ainda não há duas safras de mesma carga para comparar. Registre o histórico de colheita e marque a carga de cada safra abaixo — a partir daí esta é a leitura que mostra se o talhão está ganhando ou perdendo terreno.</p>';
        return linhas.map(({t,c})=>['alta','baixa'].filter(k=>c[k]).map(k=>{
          const x=c[k],sobe=x.varPct>=0;
          return `<div class="hbar" style="grid-template-columns:1fr 120px 120px">
            <span><b>${esc(t.nome)}</b> · carga ${k}<br><span class="sub">${x.ant} → ${x.ult}</span></span>
            <span style="text-align:right">${N(x.anterior,1)} → ${N(x.atual,1)} sc/ha</span>
            <span style="text-align:right"><span class="pill ${sobe?'good':'crit'}">${sobe?'+':''}${N(x.varPct,1)}%</span></span></div>`;}).join('')).join('');})()}
    </div>
    <div class="panel"><h3>Projeção para ${esc(sProx)}</h3>
      ${proj.length?`${proj.map(p=>`<div class="hbar" style="grid-template-columns:1fr 90px 130px">
          <span>${esc(p.t.nome)}</span>
          <span style="text-align:right"><span class="pill ${p.alvo==='alta'?'good':'warn'}">${p.alvo}</span></span>
          <span style="text-align:right">${p.ref?N(p.sc,0)+' sc ('+N(p.scha,1)+' sc/ha)':'sem safra igual ainda'}</span></div>`).join('')}
        ${totProj?`<p class="note">Se a alternância se mantiver, ${esc(sProx)} deve ficar perto de <b>${N(totProj,0)} sacas</b> — o patamar da última safra de mesma carga. Serve para dimensionar turma, terreiro e caixa com antecedência, não como garantia: chuva na florada, poda e adubação mudam o resultado.</p>`:''}`
        :'<p class="sub">Marque a carga da safra atual para projetar a próxima.</p>'}
    </div>
  </div>
  <div class="panel"><h3>Marcar a carga de um talhão</h3>
    <form class="f" id="f-bienal">
      <label>Talhão<select name="talhaoId">${tc.map(t=>`<option value="${t.id}">${esc(t.nome)}</option>`).join('')}</select></label>
      <label>Safra<select name="safra">${opcS.map(s=>`<option value="${s}" ${s===sAtual?'selected':''}>${s}</option>`).join('')}</select></label>
      <label>Carga<select name="carga"><option value="alta">Alta</option><option value="baixa">Baixa</option></select></label>
      <label>Obs.<input name="obs" style="width:220px" placeholder="florada, poda, geada…"></label>
      <button class="btn" ${tc.length?'':'disabled'}>Marcar</button>
    </form>
    <p class="note">A marcação vale mais que a sugestão automática: quando não há marcação, o sistema deduz a carga comparando a safra com a média do próprio talhão e mostra a etiqueta com <b>?</b>. Marcar de novo o mesmo talhão e safra <b>substitui</b> a marcação anterior.</p>
    ${db.bienal.length?`<div class="tblwrap"><table style="min-width:0"><thead><tr><th>Talhão</th><th>Safra</th><th>Carga</th><th>Obs.</th><th></th></tr></thead><tbody>
      ${db.bienal.slice().sort((a,b)=>a.safra<b.safra?1:-1).map(b=>`<tr>
        <td>${esc(tal(b.talhaoId).nome)}</td><td>${esc(b.safra)}</td>
        <td><span class="pill ${b.carga==='alta'?'good':'warn'}">${esc(b.carga)}</span></td>
        <td style="white-space:normal">${esc(b.obs)||'—'}</td>
        <td><button class="x" data-action="del" data-col="bienal" data-id="${b.id}" title="Excluir">✕</button></td></tr>`).join('')}
    </tbody></table></div>`:''}
  </div>`;})()}

  <h2>Qualidade por origem da colheita</h2>
  <div class="panel">
    ${porOrigem.length?porOrigem.map(g=>`<div class="hbar"><span>${esc(g.label)} (${g.n} lote${g.n>1?'s':''})</span>
      <span class="bar" style="width:${Math.max(2,g.avgScaa)}%;background:var(--cafe)"></span>
      <span class="n">${N(g.avgScaa,1)} pts${g.avgCob?' · Tipo '+N(g.avgCob,1):''}</span></div>`).join('')
      :'<p class="sub">Ainda não há lotes com SCAA registrado para comparar origem. Registre a prova em Café · Pós-colheita.</p>'}
  </div>

  <h2>Impacto da chuva no terreiro</h2>
  <div class="panel">
    ${comChuva||semChuva?`
    <div class="hbar"><span>☔ Tomou chuva${comChuva?' ('+comChuva.n+' lote'+(comChuva.n>1?'s':'')+')':' (sem dados)'}</span>
      <span class="bar" style="width:${comChuva?Math.max(2,comChuva.avgScaa):2}%;background:var(--crit)"></span>
      <span class="n">${comChuva?N(comChuva.avgScaa,1)+' pts':'—'}</span></div>
    <div class="hbar"><span>☀ Sem chuva${semChuva?' ('+semChuva.n+' lote'+(semChuva.n>1?'s':'')+')':' (sem dados)'}</span>
      <span class="bar" style="width:${semChuva?Math.max(2,semChuva.avgScaa):2}%;background:var(--good)"></span>
      <span class="n">${semChuva?N(semChuva.avgScaa,1)+' pts':'—'}</span></div>
    ${comChuva&&semChuva?`<p class="note">${comChuva.avgScaa<semChuva.avgScaa?'Nos seus dados, chuva no terreiro custou em média <b>'+N(semChuva.avgScaa-comChuva.avgScaa,1)+' pontos</b> de SCAA — reforça o valor de cobrir a carreta ou antecipar a entrada no secador quando o tempo virar.':'Nos seus dados, os lotes que tomaram chuva não ficaram com nota pior — vale olhar caso a caso (tempo de exposição, cobertura) antes de generalizar com poucos lotes.'}</p>`:''}
    `:'<p class="sub">Ainda não há lotes suficientes com chuva registrada e SCAA para comparar.</p>'}
  </div>

  <h2>Secagem: umidade de entrada × desempenho</h2>
  <div class="tblwrap"><table><thead><tr><th>Lote</th><th>Origem</th><th>Chuva</th><th class="num">Umid. entrada</th><th class="num">Umid. saída</th><th class="num">Horas</th><th class="num">Taxa %/h</th><th class="num">SCAA</th></tr></thead><tbody>
    ${secConcl.length?secConcl.map(s=>{const lt=db.lotes.find(l=>l.id===s.loteId)||{codigo:'—'};
      return `<tr><td><b>${esc(lt.codigo)}</b></td><td>${esc(lt.origem)||'—'}</td>
      <td>${lt.chuva?'<span class="pill crit">sim</span>':'<span class="pill good">não</span>'}</td>
      <td class="num">${N(s.umidadeEntrada,1)}%</td><td class="num">${N(s.umidadeSaida,1)}%</td>
      <td class="num">${N(s.horas,0)} h</td><td class="num">${N(taxaSec(s),2)}</td>
      <td class="num">${lt.scaa?N(lt.scaa,1):'—'}</td></tr>`;}).join(''):vazio(8)}
  </tbody></table></div>

  <h2>Ranking de talhões — produtividade e qualidade</h2>
  <div class="tblwrap"><table><thead><tr><th>Talhão</th><th class="num">Sacas</th><th class="num">sc/ha</th><th class="num">Lotes provados</th><th class="num">SCAA médio</th></tr></thead><tbody>
    ${ranking.length?ranking.map(r=>`<tr><td><b>${esc(r.t.nome)}</b>${r.t.variedade?` <span class="sub">· ${esc(r.t.variedade)}</span>`:''}</td>
      <td class="num">${N(r.sc,0)}</td><td class="num">${N(r.prodha,1)}</td>
      <td class="num">${r.nLotes||'—'}</td>
      <td class="num">${r.avgScaaT?`<span class="pill ${r.avgScaaT>=80?'good':r.avgScaaT>=70?'warn':'crit'}">${N(r.avgScaaT,1)}</span>`:'—'}</td></tr>`).join(''):vazio(5)}
  </tbody></table></div>

  <h2>Preço × qualidade</h2>
  <div class="tblwrap"><table><thead><tr><th>Lote</th><th class="num">SCAA</th><th>COB</th><th class="num">R$/saca</th><th class="num">Sacas</th><th class="num">Valor</th></tr></thead><tbody>
    ${vendasComLote.length?vendasComLote.map(({v,lt})=>`<tr><td><b>${esc(lt.codigo)}</b></td>
      <td class="num">${lt.scaa?`<span class="pill ${lt.scaa>=80?'good':lt.scaa>=70?'warn':'crit'}">${N(lt.scaa,1)}</span>`:'—'}</td>
      <td>${lt.cobTipo?'Tipo '+N(lt.cobTipo,1)+(lt.cobBebida?' · '+esc(lt.cobBebida):''):'—'}</td>
      <td class="num">${N(v.preco,2)}</td><td class="num">${N(v.sacas,0)}</td><td class="num">${BRL(v.sacas*v.preco)}</td></tr>`).join('')
      :`<tr><td colspan="6" style="text-align:center;color:var(--ink2);padding:16px">Nenhuma venda vinculada a um lote ainda. Em Café · Pós-colheita, escolha o lote ao registrar a venda para ver aqui se pontos de SCAA renderam preço melhor.</td></tr>`}
  </tbody></table></div>`;
}
function pgCobertura(){
  const cobF=F(db.coberturas);
  const plantios=cobF.filter(c=>c.operacao==='Plantio');
  const areaC=plantios.reduce((a,c)=>a+c.area,0);
  const especies=[...new Set(cobF.map(c=>c.especie))];
  return `<h1>Culturas de cobertura</h1>
  <p class="sub">Plantio e manejo de cobertura para os cereais — palhada, ciclagem e proteção do solo entre safras.</p>
  <div class="cards">
    ${kpi('Área com cobertura',N(areaC)+' ha',plantios.length+' plantios registrados')}
    ${kpi('Espécies em uso',especies.length,especies.join(', ')||'—')}
    ${kpi('Registros',cobF.length,'plantio, dessecação e manejo')}
  </div>
  <div class="panel"><h3>Novo registro</h3>
    <form class="f" id="f-cob">
      <label>Data<input type="date" name="data" value="${hoje}" required></label>
      <label>Talhão<select name="talhaoId">${db.talhoes.map(t=>`<option value="${t.id}">${esc(t.nome)}</option>`).join('')}</select></label>
      <label>Espécie<input name="especie" required style="width:180px" placeholder="Braquiária, milheto, crotalária…"></label>
      <label>Operação<select name="operacao"><option>Plantio</option><option>Dessecação</option><option>Roçada</option><option>Manejo</option></select></label>
      <label>Área (ha)<input type="number" step="0.1" name="area" required style="width:85px"></label>
      <label>Obs.<input name="obs" style="width:180px"></label>
      <button class="btn">Registrar</button>
    </form></div>
  <div class="tblwrap"><table><thead><tr><th>Data</th><th>Talhão</th><th>Espécie</th><th>Operação</th><th class="num">Área</th><th>Obs.</th><th></th></tr></thead><tbody>
    ${cobF.slice().sort((a,b)=>a.data<b.data?1:-1).map(c=>`<tr>
      <td>${dBRy(c.data)}</td><td>${esc(tal(c.talhaoId).nome)}</td><td>${esc(c.especie)}</td>
      <td><span class="pill ${c.operacao==='Plantio'?'good':'warn'}">${esc(c.operacao)}</span></td>
      <td class="num">${N(c.area,1)} ha</td><td style="white-space:normal">${esc(c.obs)||'—'}</td>
      <td><button class="x" data-action="del" data-col="coberturas" data-id="${c.id}" title="Excluir">✕</button></td></tr>`).join('')}
  </tbody></table></div>`;
}

let talhaoSel='';
/* ===== Lançar por texto: protótipo local do padrão que a integração WhatsApp usará ===== */
/* interpreta frases simples e SEMPRE exige confirmação antes de gravar — nunca salva direto */
const NUM_PALAVRA={um:1,uma:1,dois:2,duas:2,tres:3,'três':3,quatro:4,cinco:5,seis:6,sete:7,oito:8,nove:9,dez:10,meia:0.5,meio:0.5};
function parseNumero(s){
  if(!s)return null;s=s.trim().toLowerCase();
  if(NUM_PALAVRA[s]!==undefined)return NUM_PALAVRA[s];
  const n=parseFloat(s.replace(/\./g,'').replace(',','.'));
  return isNaN(n)?null:n;
}
function acharTalhao(txt){const low=txt.toLowerCase();return db.talhoes.find(t=>low.includes(t.nome.toLowerCase()));}
function acharMaquina(txt){const low=txt.toLowerCase();
  return db.maquinas.find(m=>low.includes(m.nome.toLowerCase()))||
    db.maquinas.find(m=>(m.nome.match(/\d+/g)||[]).some(n=>low.includes(n)));
}
const NUMPAL_ALT='[\\d.,]+|um|uma|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|meia';
function parseLinha(linha){
  const l=linha.trim();if(!l)return null;
  const low=l.toLowerCase();
  let m=low.match(new RegExp('abasteci\\w*.*?com\\s+('+NUMPAL_ALT+')\\s*litros?.*?hor[ií]metro\\s+([\\d.,]+)'));
  if(m){const litros=parseNumero(m[1]),horimetro=parseNumero(m[2]),maq=acharMaquina(l);
    return {tipo:'abastecimento',original:l,status:'pendente',rotulo:'Abastecimento',
      campos:{maqId:maq?maq.id:'',litros:litros||0,horimetro:horimetro||0},
      resumo:(maq?maq.nome:'máquina não identificada')+' — '+N(litros||0)+' L, horímetro '+N(horimetro||0)};}
  m=low.match(/(?:choveu|caiu)\D*?([\d.,]+)\s*mm/);
  if(m){const mm=parseNumero(m[1]);
    return {tipo:'chuva',original:l,status:'pendente',rotulo:'Chuva',campos:{mm:mm||0},resumo:N(mm||0,1)+' mm'};}
  m=low.match(new RegExp('(colhi|entrei|entraram|lancei|lan[cç]ar)\\w*\\s+('+NUMPAL_ALT+')\\s*carretas?'));
  if(m){const qtd=parseNumero(m[2]),tal=acharTalhao(l);
    let tipoColheita='Manual (pano)';
    if(low.includes('mecanizad'))tipoColheita='Mecanizada';else if(low.includes('varri'))tipoColheita='Varrição';
    return {tipo:'colheita',original:l,status:'pendente',rotulo:'Colheita (carretas)',
      campos:{talhaoId:tal?tal.id:'',tipoColheita,carretas:qtd||0},
      resumo:N(qtd||0,1)+' carretas · '+tipoColheita+' · '+(tal?tal.nome:'talhão não identificado')};}
  m=low.match(/(?:comprei|recebi)\D*?([\d.,]+)\s*litros?\s*(?:de\s*)?(?:diesel|combust[ií]vel).*?(?:por|r\$)\s*([\d.,]+)/);
  if(m){const litros=parseNumero(m[1]),valor=parseNumero(m[2]);
    return {tipo:'diesel',original:l,status:'pendente',rotulo:'Compra de diesel',
      campos:{litros:litros||0,valor:valor||0},resumo:N(litros||0)+' L por '+BRL(valor||0)};}
  return {tipo:null,original:l,status:'pendente',rotulo:'Não reconhecido',campos:{},resumo:''};
}
let vozItens=[];
function vozCard(it,ix){
  if(it.status==='salvo')return `<div class="panel" style="border-color:var(--good)"><div class="alert">
    <span class="pill good">salvo</span><span>${esc(it.original)}</span></div></div>`;
  if(!it.tipo)return `<div class="panel" style="border-color:var(--crit)"><div class="alert">
    <span class="pill crit">não reconhecido</span><span>"${esc(it.original)}"</span></div></div>`;
  let campos='';
  if(it.tipo==='abastecimento')campos=`
    <label>Máquina<select data-vf="maqId">${!it.campos.maqId?'<option value="">— selecione —</option>':''}${db.maquinas.map(m=>`<option value="${m.id}" ${m.id===it.campos.maqId?'selected':''}>${esc(m.nome)}</option>`).join('')}</select></label>
    <label>Litros<input type="number" step="1" data-vf="litros" value="${it.campos.litros}" style="width:90px"></label>
    <label>Horímetro<input type="number" step="1" data-vf="horimetro" value="${it.campos.horimetro}" style="width:100px"></label>`;
  else if(it.tipo==='chuva')campos=`<label>mm<input type="number" step="0.5" data-vf="mm" value="${it.campos.mm}" style="width:90px"></label>`;
  else if(it.tipo==='colheita')campos=`
    <label>Talhão<select data-vf="talhaoId">${!it.campos.talhaoId?'<option value="">— selecione —</option>':''}${db.talhoes.filter(t=>t.cultura==='cafe').map(t=>`<option value="${t.id}" ${t.id===it.campos.talhaoId?'selected':''}>${esc(t.nome)}</option>`).join('')}</select></label>
    <label>Tipo<select data-vf="tipoColheita"><option ${it.campos.tipoColheita==='Manual (pano)'?'selected':''}>Manual (pano)</option><option ${it.campos.tipoColheita==='Varrição'?'selected':''}>Varrição</option><option ${it.campos.tipoColheita==='Mecanizada'?'selected':''}>Mecanizada</option></select></label>
    <label>Carretas<input type="number" step="0.1" data-vf="carretas" value="${it.campos.carretas}" style="width:90px"></label>`;
  else if(it.tipo==='diesel')campos=`
    <label>Litros<input type="number" step="1" data-vf="litros" value="${it.campos.litros}" style="width:90px"></label>
    <label>Valor R$<input type="number" step="0.01" data-vf="valor" value="${it.campos.valor}" style="width:100px"></label>`;
  return `<div class="panel">
    <p class="sub" style="margin-bottom:8px">"${esc(it.original)}"</p>
    <form class="f" data-voz-form="${ix}" data-passive-form>${campos}</form>
    <div style="display:flex;gap:8px;margin-top:10px;align-items:center">
      <span class="pill warn">${esc(it.rotulo)}</span>
      <button class="btn mini" data-action="confirmar-voz" data-idx="${ix}">Confirmar e salvar</button>
    </div></div>`;
}
function pgVoz(){
  return `<h1>Lançar por texto</h1>
  <p class="sub">Protótipo do padrão que a integração com WhatsApp vai usar: você escreve (ou cola o que ditou), o sistema tenta entender e <b>mostra o lançamento para conferir — só grava depois de confirmar</b>. Nada é salvo automaticamente.</p>
  <div class="panel">
    <label style="display:block;font-size:11.5px;font-weight:600;color:var(--ink2);text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px">Cole ou digite (uma frase por linha)</label>
    <textarea id="voz-txt" rows="4" style="width:100%;font:inherit;font-size:14px;padding:10px;border:1px solid var(--axis);border-radius:8px;background:var(--page);color:var(--ink);resize:vertical" placeholder="Abasteci o Valtra A950 com 180 litros, horímetro 6150.
Choveu 12 mm.
Colhi 2 carretas mecanizada no Santa Rita."></textarea>
    <div style="display:flex;gap:8px;margin-top:8px">
      <button class="btn" data-action="interpretar-texto">Interpretar</button>
      <button class="btn ghost" data-action="limpar-texto">Limpar</button>
    </div>
    <p class="note" style="margin-top:10px"><b>Reconhece hoje:</b> abastecimento ("abasteci a/o [máquina] com N litros, horímetro N"), chuva ("choveu N mm"), colheita em carretas ("colhi/entrei N carretas [mecanizada/varrição] no [talhão]") e compra de diesel ("comprei N litros de diesel por R$ N"). Este é o parser local do protótipo — a versão com WhatsApp usaria IA para entender qualquer jeito de falar, mais áudio e foto, com esta mesma tela de confirmação antes de gravar.</p>
  </div>
  ${vozItens.length?`<h2>Conferir antes de salvar</h2>${vozItens.map((it,ix)=>vozCard(it,ix)).join('')}`:''}`;
}

/* ===== Mapa: importação KML/KMZ/GeoJSON (sem bibliotecas externas), área, MIP, exportação ===== */
let mapaPreview=null,mapaErro='',mapaModo='cultura';
const CORES_MAPA={cafe:'var(--cafe)',milho:'var(--milho)',soja:'var(--soja)',sorgo:'var(--sorgo)',trigo:'var(--trigo)',cobertura:'var(--muted)'};
/* área de um polígono lon/lat via shoelace, com correção cos(lat) para achatamento da Terra */
function areaHectares(coords){
  if(!coords||coords.length<3)return 0;
  const lat0=coords.reduce((s,c)=>s+c[1],0)/coords.length;
  const R=6371000,k=Math.cos(lat0*Math.PI/180);
  const pts=coords.map(c=>[c[0]*Math.PI/180*R*k,c[1]*Math.PI/180*R]);
  let a=0;
  for(let i=0;i<pts.length;i++){const p1=pts[i],p2=pts[(i+1)%pts.length];a+=p1[0]*p2[1]-p2[0]*p1[1];}
  return Math.abs(a)/2/10000;
}
function parseKmlText(text){
  const doc=new DOMParser().parseFromString(text,'text/xml');
  if(doc.querySelector('parsererror'))throw new Error('KML inválido ou corrompido');
  const out=[];
  doc.querySelectorAll('Placemark').forEach(pm=>{
    const nomeEl=pm.querySelector('name'),nome=nomeEl?nomeEl.textContent.trim():'';
    const polyEl=pm.querySelector('Polygon');
    if(polyEl){
      const coordsEl=polyEl.querySelector('coordinates');
      if(coordsEl){
        const coords=coordsEl.textContent.trim().split(/\s+/).map(s=>{
          const p=s.split(',');return [parseFloat(p[0]),parseFloat(p[1])];
        }).filter(c=>isFinite(c[0])&&isFinite(c[1]));
        if(coords.length>=3){out.push({tipo:'poligono',nome,coords});return;}
      }
    }
    const ptEl=pm.querySelector('Point');
    if(ptEl){
      const coordsEl=ptEl.querySelector('coordinates');
      if(coordsEl){
        const p=coordsEl.textContent.trim().split(',');
        const lon=parseFloat(p[0]),lat=parseFloat(p[1]);
        if(isFinite(lon)&&isFinite(lat))out.push({tipo:'ponto',nome,coords:[[lon,lat]]});
      }
    }
  });
  return out;
}
function parseGeoJSON(obj){
  const feats=obj.type==='FeatureCollection'?(obj.features||[]):(obj.type==='Feature'?[obj]:[]);
  const out=[];
  feats.forEach(f=>{
    const g=f.geometry;if(!g)return;
    const nome=(f.properties&&(f.properties.nome||f.properties.name))||'';
    if(g.type==='Polygon'){
      const ring=(g.coordinates||[])[0]||[];
      if(ring.length>=3)out.push({tipo:'poligono',nome,coords:ring.map(c=>[c[0],c[1]])});
    }else if(g.type==='MultiPolygon'){
      (g.coordinates||[]).forEach((poly,i)=>{
        const ring=(poly||[])[0]||[];
        if(ring.length>=3)out.push({tipo:'poligono',nome:nome+(g.coordinates.length>1?' '+(i+1):''),coords:ring.map(c=>[c[0],c[1]])});
      });
    }else if(g.type==='Point'&&g.coordinates){
      out.push({tipo:'ponto',nome,coords:[[g.coordinates[0],g.coordinates[1]]]});
    }
  });
  return out;
}
/* lê o .kml de dentro de um .kmz (ZIP): acha o fim do diretório central, localiza a 1ª entrada .kml,
   e descompacta com DecompressionStream nativo (deflate-raw) — sem biblioteca de ZIP */
async function kmzParaTexto(buf){
  const dv=new DataView(buf);
  let eocd=-1;
  for(let i=dv.byteLength-22;i>=Math.max(0,dv.byteLength-65558);i--){
    if(dv.getUint32(i,true)===0x06054b50){eocd=i;break;}
  }
  if(eocd<0)throw new Error('KMZ inválido (fim de diretório central do ZIP não encontrado)');
  const total=dv.getUint16(eocd+10,true);
  let cdOff=dv.getUint32(eocd+16,true),kmlEntry=null;
  for(let i=0;i<total;i++){
    if(dv.getUint32(cdOff,true)!==0x02014b50)break;
    const method=dv.getUint16(cdOff+10,true);
    const compSize=dv.getUint32(cdOff+20,true);
    const uncompSize=dv.getUint32(cdOff+24,true);
    const nameLen=dv.getUint16(cdOff+28,true),extraLen=dv.getUint16(cdOff+30,true),commentLen=dv.getUint16(cdOff+32,true);
    const lho=dv.getUint32(cdOff+42,true);
    const name=new TextDecoder().decode(new Uint8Array(buf,cdOff+46,nameLen));
    if(/\.kml$/i.test(name)&&!kmlEntry)kmlEntry={name,method,compSize,uncompSize,lho};
    cdOff+=46+nameLen+extraLen+commentLen;
  }
  if(!kmlEntry)throw new Error('Nenhum arquivo .kml encontrado dentro do KMZ');
  if(kmlEntry.uncompSize>50*1048576)throw new Error('O KML descompactado excede o limite de 50 MB');
  const lh=kmlEntry.lho;
  if(dv.getUint32(lh,true)!==0x04034b50)throw new Error('Cabeçalho local do ZIP inválido');
  const lNameLen=dv.getUint16(lh+26,true),lExtraLen=dv.getUint16(lh+28,true);
  const dataStart=lh+30+lNameLen+lExtraLen;
  const raw=new Uint8Array(buf,dataStart,kmlEntry.compSize);
  let bytes;
  if(kmlEntry.method===0)bytes=raw;
  else if(kmlEntry.method===8){
    const ds=new DecompressionStream('deflate-raw');
    const w=ds.writable.getWriter();w.write(raw);w.close();
    const chunks=[];const reader=ds.readable.getReader();let totalLen=0;
    while(true){const r=await reader.read();if(r.done)break;totalLen+=r.value.length;
      if(totalLen>50*1048576){await reader.cancel();throw new Error('O KML descompactado excede o limite de 50 MB');}chunks.push(r.value);}
    bytes=new Uint8Array(totalLen);let off=0;
    chunks.forEach(c=>{bytes.set(c,off);off+=c.length;});
  }else throw new Error('Método de compactação do ZIP não suportado (esperado deflate)');
  return new TextDecoder('utf-8').decode(bytes);
}
async function lerArquivoMapa(file){
  mapaErro='';mapaPreview=null;
  try{
    if(file.size>20*1048576)throw new Error('O arquivo de mapa excede o limite de 20 MB');
    const nome=file.name.toLowerCase();
    let feats;
    if(nome.endsWith('.kmz'))feats=parseKmlText(await kmzParaTexto(await file.arrayBuffer()));
    else if(nome.endsWith('.kml'))feats=parseKmlText(await file.text());
    else if(nome.endsWith('.geojson')||nome.endsWith('.json'))feats=parseGeoJSON(JSON.parse(await file.text()));
    else throw new Error('Formato não reconhecido — use .kml, .kmz ou .geojson');
    const polys=feats.filter(f=>f.tipo==='poligono');
    if(!polys.length)throw new Error('Nenhum polígono de talhão encontrado no arquivo');
    if(polys.length>5000||polys.reduce((s,p)=>s+(p.coords?.length||0),0)>500000)
      throw new Error('O mapa excede o limite de 5.000 polígonos ou 500.000 coordenadas');
    mapaPreview=polys.map(f=>{
      const areaHa=areaHectares(f.coords);
      const match=db.talhoes.find(t=>t.nome.toLowerCase()===f.nome.toLowerCase())
        ||db.talhoes.find(t=>f.nome&&f.nome.toLowerCase().includes(t.nome.toLowerCase()));
      return {nome:f.nome||'(sem nome)',coords:f.coords,areaHa,talhaoId:match?match.id:'',
        divergeArea:match&&match.area?Math.abs(match.area-areaHa)/match.area>0.15:false,areaCadastro:match?match.area:null};
    });
  }catch(e){mapaErro=e.message||String(e);}
  render();
}
function exportarKML(){
  const placemarks=db.geoTalhoes.map(g=>{
    const t=tal(g.talhaoId),coordsStr=g.coords.map(c=>c[0]+','+c[1]+',0').join(' ');
    return `<Placemark><name>${esc(g.nome||t.nome)}</name><ExtendedData>
      <Data name="cultura"><value>${esc(NOMES_CULT[g.cultura]||g.cultura||'')}</value></Data>
      <Data name="area_ha"><value>${N(g.areaHa,2)}</value></Data></ExtendedData>
      <Polygon><outerBoundaryIs><LinearRing><coordinates>${coordsStr}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>`;
  }).join('');
  const pontos=db.mip.filter(hasCoords).map(m=>
    `<Placemark><name>${esc(m.tipo)} (nível ${m.nivel})</name><ExtendedData>
      <Data name="data"><value>${m.data}</value></Data><Data name="obs"><value>${esc(m.obs||'')}</value></Data></ExtendedData>
      <Point><coordinates>${m.lon},${m.lat},0</coordinates></Point></Placemark>`).join('');
  const kml=`<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>Gefaz360</name>${placemarks}${pontos}</Document></kml>`;
  const blob=new Blob([kml],{type:'application/vnd.google-earth.kml+xml'});
  const u=URL.createObjectURL(blob),l=document.createElement('a');
  l.href=u;l.download='gefaz360-talhoes.kml';l.click();URL.revokeObjectURL(u);
}
function mapaSVG(modo){
  const gts=db.geoTalhoes;
  if(!gts.length)return '';
  let minLon=Infinity,maxLon=-Infinity,minLat=Infinity,maxLat=-Infinity;
  gts.forEach(g=>g.coords.forEach(c=>{if(c[0]<minLon)minLon=c[0];if(c[0]>maxLon)maxLon=c[0];if(c[1]<minLat)minLat=c[1];if(c[1]>maxLat)maxLat=c[1];}));
  db.mip.forEach(m=>{if(hasCoords(m)){if(m.lon<minLon)minLon=m.lon;if(m.lon>maxLon)maxLon=m.lon;if(m.lat<minLat)minLat=m.lat;if(m.lat>maxLat)maxLat=m.lat;}});
  const padLon=(maxLon-minLon)*0.08||0.001,padLat=(maxLat-minLat)*0.08||0.001;
  minLon-=padLon;maxLon+=padLon;minLat-=padLat;maxLat+=padLat;
  const latC=(minLat+maxLat)/2,k=Math.cos(latC*Math.PI/180)||1,W=760,H=520;
  const s=Math.min(W/((maxLon-minLon)*k||1),H/(maxLat-minLat||1));
  const cx=lon=>(lon-minLon)*k*s+(W-(maxLon-minLon)*k*s)/2;
  const cy=lat=>H-((lat-minLat)*s+(H-(maxLat-minLat)*s)/2);
  const corDe=g=>{
    if(modo==='carencia')return g.talhaoId?(statusCarencia(g.talhaoId)?'var(--crit)':'var(--good)'):'var(--muted)';
    return CORES_MAPA[g.cultura]||'var(--muted)';
  };
  const polys=gts.map(g=>{
    const pts=g.coords.map(c=>cx(c[0])+','+cy(c[1])).join(' ');
    const t=tal(g.talhaoId),car=g.talhaoId?statusCarencia(g.talhaoId):null,cor=corDe(g);
    const tip=`${esc(g.nome||t.nome)} — ${N(g.areaHa,1)} ha${g.talhaoId?' · '+(NOMES_CULT[t.cultura]||t.cultura):' · não vinculado'}${car?' · ⚠️ em carência':''}`;
    return `<polygon points="${pts}" fill="${cor}" fill-opacity="0.45" stroke="${cor}" stroke-width="1.5" data-tip="${tip}" aria-label="${tip}" ${g.talhaoId?'tabindex="0" role="button" style="cursor:pointer"':'role="img"'} data-action="ficha-talhao-mapa" data-id="${g.talhaoId}"/>`;
  }).join('');
  const pontos=db.mip.filter(hasCoords).map(m=>{
    const cor=m.nivel>=3?'var(--crit)':m.nivel==2?'var(--warn)':'var(--good)';
    return `<circle cx="${cx(m.lon)}" cy="${cy(m.lat)}" r="6" fill="${cor}" stroke="var(--page)" stroke-width="1.5" data-tip="${esc(m.tipo)} · nível ${m.nivel} — ${dBRy(m.data)}${m.obs?' · '+esc(m.obs):''}"/>`;
  }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;background:var(--accent-soft);border-radius:10px" role="img" aria-label="Mapa esquemático dos talhões e ocorrências MIP">`+
    `<title>Mapa dos talhões</title><desc>Polígonos dos talhões cadastrados e pontos de monitoramento integrado de pragas. Use a tabela da página para consultar os mesmos dados em texto.</desc>`+
    `${polys}${pontos}</svg>`;
}
function mapaPreviewHTML(){
  return `<div class="panel" style="border-color:var(--warn)"><h3>Conferir antes de importar</h3>
  <p class="sub">Vincule cada polígono ao talhão cadastrado (ou deixe "— não vincular —" para guardar só como referência no mapa).</p>
  ${mapaPreview.map((p,i)=>`<div class="hbar" style="grid-template-columns:1fr 200px 110px">
    <span>${esc(p.nome)}${p.divergeArea?` <span class="pill warn" data-tip="Área cadastrada: ${N(p.areaCadastro,1)} ha">⚠️ diverge</span>`:''}</span>
    <select class="mapa-tal-sel" data-idx="${i}"><option value="">— não vincular —</option>${db.talhoes.map(t=>`<option value="${t.id}" ${t.id===p.talhaoId?'selected':''}>${esc(t.nome)}</option>`).join('')}</select>
    <span style="text-align:right">${N(p.areaHa,1)} ha</span></div>`).join('')}
  <div style="display:flex;gap:8px;margin-top:10px">
    <button class="btn" data-action="confirmar-mapa">Confirmar importação (${mapaPreview.length})</button>
    <button class="btn ghost" data-action="cancelar-mapa">Cancelar</button>
  </div></div>`;
}
function pgMapa(){
  const gts=db.geoTalhoes,semGeo=db.talhoes.filter(t=>!gts.some(g=>g.talhaoId===t.id)),mips=F(db.mip);
  return `<h1>Mapa · Talhões</h1>
  <p class="sub">Importe os polígonos desenhados no Google Earth ou QGIS (KML, KMZ ou GeoJSON), acompanhe a área de cada talhão no mapa e registre ocorrências de pragas/doenças (MIP) com localização. Nada é gravado automaticamente — você confere e confirma antes de importar.</p>
  <div class="cards">
    ${kpi('Talhões no mapa',gts.length,semGeo.length?semGeo.length+' sem polígono ainda':'todos com polígono')}
    ${kpi('Área mapeada',N(gts.reduce((s,g)=>s+g.areaHa,0),1)+' ha','soma dos polígonos importados')}
    ${kpi('Ocorrências MIP',db.mip.length,anoFiltro?mips.length+' na safra '+anoFiltro:'registradas')}
  </div>
  <div class="panel"><h3>Importar mapa (KML / KMZ / GeoJSON)</h3>
    <label for="mapa-file" style="display:block;font-size:11.5px;font-weight:600;color:var(--ink2);text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px">Arquivo (.kml, .kmz, .geojson)</label>
    <input type="file" id="mapa-file" accept=".kml,.kmz,.geojson,.json">
    ${mapaErro?`<p class="sub" style="color:var(--crit)">⚠️ ${esc(mapaErro)}</p>`:''}
    <p class="note">Cada Placemark do arquivo vira um polígono de talhão. O nome do Placemark é comparado ao nome cadastrado para sugerir o vínculo — confira/ajuste antes de confirmar. Se a área do polígono divergir mais de 15% da área cadastrada, o sistema avisa.</p>
  </div>
  ${mapaPreview?mapaPreviewHTML():''}
  <div class="panel"><h3>Mapa dos talhões</h3>
    <div class="row2" style="align-items:center;margin-bottom:8px">
      <label>Colorir por<select id="mapa-modo"><option value="cultura" ${mapaModo!=='carencia'?'selected':''}>Cultura</option><option value="carencia" ${mapaModo==='carencia'?'selected':''}>Carência</option></select></label>
      ${gts.length?`<button class="btn ghost mini" data-action="exportar-kml">⬇️ Exportar KML (talhões + MIP)</button>`:''}
    </div>
    ${gts.length?mapaSVG(mapaModo):'<p class="sub">Importe um arquivo acima para ver o mapa.</p>'}
  </div>
  ${gts.length?`<div class="tblwrap"><table><thead><tr><th>Polígono</th><th>Talhão vinculado</th><th>Cultura</th><th class="num">Área mapeada</th><th></th></tr></thead><tbody>
    ${gts.map(g=>{const t=tal(g.talhaoId);return `<tr><td>${esc(g.nome)||'—'}</td><td>${g.talhaoId?esc(t.nome):'não vinculado'}</td>
      <td>${esc(NOMES_CULT[g.cultura]||g.cultura||'—')}</td><td class="num">${N(g.areaHa,2)} ha</td>
      <td>${g.talhaoId?`<button class="btn mini ghost" data-action="ficha-talhao-mapa" data-id="${g.talhaoId}">Abrir ficha</button>`:'—'}</td></tr>`;}).join('')}
  </tbody></table></div>`:''}
  <div class="panel"><h3>Registrar ocorrência (MIP — pragas, doenças, plantas daninhas)</h3>
    <form class="f" id="f-mip">
      <label>Data<input type="date" name="data" value="${hoje}" required></label>
      <label>Talhão<select name="talhaoId"><option value="">—</option>${db.talhoes.map(t=>`<option value="${t.id}">${esc(t.nome)}</option>`).join('')}</select></label>
      <label>Tipo<input name="tipo" placeholder="Bicho-mineiro, ferrugem, buva…" required style="width:180px"></label>
      <label>Nível<select name="nivel"><option value="0">0 — ausente</option><option value="1">1 — leve</option><option value="2" selected>2 — moderado</option><option value="3">3 — alto</option><option value="4">4 — crítico</option></select></label>
      <label>Latitude<input type="number" step="0.000001" name="lat" placeholder="-19.12345" style="width:120px"></label>
      <label>Longitude<input type="number" step="0.000001" name="lon" placeholder="-45.12345" style="width:120px"></label>
      <label>Obs.<input name="obs" style="width:200px"></label>
      <button class="btn">Registrar</button>
    </form>
    <p class="note">No celular, copie as coordenadas do Google Maps (toque e segure o ponto) e cole aqui. Os pontos aparecem no mapa acima coloridos por nível.</p>
  </div>
  <div class="tblwrap"><table><thead><tr><th>Data</th><th>Talhão</th><th>Tipo</th><th>Nível</th><th>Coordenadas</th><th>Obs.</th><th></th></tr></thead><tbody>
    ${mips.slice().sort((a,b)=>a.data<b.data?1:-1).map(m=>`<tr>
      <td>${dBRy(m.data)}</td><td>${m.talhaoId?esc(tal(m.talhaoId).nome):'—'}</td><td>${esc(m.tipo)}</td>
      <td><span class="pill ${m.nivel>=3?'crit':m.nivel==2?'warn':'good'}">${N(m.nivel)}</span></td>
      <td>${hasCoords(m)?N(m.lat,5)+', '+N(m.lon,5):'—'}</td><td style="white-space:normal">${esc(m.obs)||'—'}</td>
      <td><button class="x" data-action="del" data-col="mip" data-id="${m.id}" title="Excluir">✕</button></td></tr>`).join('')||'<tr><td colspan="7" class="sub">Nenhuma ocorrência registrada.</td></tr>'}
  </tbody></table></div>`;
}

function pgTalhao(){
  const ts=db.talhoes,p=db.params;
  if(!talhaoSel||!ts.find(t=>t.id===talhaoSel))talhaoSel=ts[0]?ts[0].id:'';
  const t=ts.find(x=>x.id===talhaoSel);
  if(!t)return '<h1>Ficha do talhão</h1><p class="sub">Cadastre um talhão em Cadastros & Dados primeiro.</p>';
  const ev=[];
  F(db.solos).filter(s=>s.talhaoId===t.id).forEach(s=>ev.push({d:s.data,cl:'warn',lb:'análise de solo',
    tx:`pH ${N(s.ph,1)} · M.O. ${N(s.mo,1)}% · V% ${N(s.v)}${s.ctc?' · CTC '+N(s.ctc,1):''}${s.obs?' — '+esc(s.obs):''}`}));
  F(db.adubacoes).filter(a=>a.talhaoId===t.id).forEach(a=>ev.push({d:a.data,cl:'good',lb:a.operacao.toLowerCase(),
    tx:`${esc(a.produto)} — ${N(a.dose,1)} ${esc(a.unidade)} em ${N(a.area,1)} ha`}));
  F(db.pulvOS).filter(o=>o.talhaoId===t.id).forEach(o=>{const r=db.receitas.find(x=>x.id===o.receitaId)||{nome:'—'};
    ev.push({d:o.data,cl:o.status==='concluida'?'good':'warn',lb:'pulverização',
      tx:`${esc(r.nome)}${o.via&&o.via!=='Foliar'?' · '+esc(o.via):''} — ${N(o.area,1)} ha (${o.status==='concluida'?'aplicada':'ordem aberta'})`});});
  if(t.cultura==='cafe')F(db.cafe).filter(r=>r.talhaoId===t.id).forEach(r=>ev.push({d:r.data,cl:'good',lb:'colheita',
    tx:`${esc(r.tipo)} — ${N(r.litros/p.litrosPorCarreta,1)} carretas (${N(r.litros)} L)${r.horas?' · '+N(r.horas,1)+' h':''}`}));
  else F(db.cargas).filter(c=>c.talhaoId===t.id).forEach(c=>{const x=cargaCalc(c);
    ev.push({d:c.data,cl:'good',lb:'carga',tx:`NF ${esc(c.nf)||'s/nº'} — ${N(x.sacas,0)} sc → ${esc(c.destino)||'—'}`});});
  F(db.regColheita).filter(g=>g.talhaoId===t.id).forEach(g=>ev.push({d:g.data,cl:'warn',lb:'regulagem',
    tx:`${esc(g.tipo)} — vibração ${N(g.vibracao)} · ${N(g.velocidade,1)} km/h${g.freio?' · freio '+N(g.freio,1)+' kg':''}`}));
  F(db.coberturas).filter(c=>c.talhaoId===t.id).forEach(c=>ev.push({d:c.data,cl:'good',lb:'cobertura',
    tx:`${esc(c.especie)} — ${esc(c.operacao)} em ${N(c.area,1)} ha`}));
  F(db.podas).filter(pd=>pd.talhaoId===t.id).forEach(pd=>ev.push({d:pd.data,
    cl:pd.tipo==='Recepa'||pd.tipo==='Esqueletamento'?'crit':'warn',lb:'poda',
    tx:`${esc(pd.tipo)} — ${N(pd.area,1)} ha${pd.obs?' · '+esc(pd.obs):''}`}));
  F(db.arruacoes).filter(ar=>ar.talhaoId===t.id).forEach(ar=>ev.push({d:ar.data,
    cl:ar.tipo==='Arruação'?'warn':'good',lb:ar.tipo.toLowerCase(),
    tx:`${N(ar.area,1)} ha${ar.obs?' · '+esc(ar.obs):''}`}));
  F(db.capinas).filter(cp=>cp.talhaoId===t.id).forEach(cp=>ev.push({d:cp.data,
    cl:cp.tipo.startsWith('Capina química')?'warn':'good',lb:'capina/roçada',
    tx:`${esc(cp.tipo)} — ${N(cp.area,1)} ha${cp.obs?' · '+esc(cp.obs):''}`}));
  F(db.os).filter(o=>o.talhaoId===t.id).forEach(o=>ev.push({
    d:String(o.concluidoEm||o.iniciadoEm||o.data||hoje).slice(0,10),
    cl:o.status==='concluida'?'good':osAtrasada(o)?'crit':'warn',
    lb:`OS ${esc(o.codigo)||'operacional'}`,
    tx:`${esc(o.titulo)} · ${esc(OS_STATUS_INFO[o.status]?.label||o.status)} · ${N(o.progresso)}%${o.responsavelId?' · '+esc(osResponsavel(o)):''}`}));
  F(db.documentos).filter(dc=>dc.talhaoId===t.id).forEach(dc=>ev.push({d:dc.data,cl:'good',lb:'documento',
    tx:`${dc.mime==='application/pdf'?'📄':'📷'} ${esc(dc.nome)} — ${esc(dc.categoria)}${dc.desc?' · '+esc(dc.desc):''}`}));
  F(db.lotes).filter(l=>l.talhaoId===t.id).forEach(l=>ev.push({d:l.data,cl:'warn',lb:'lote de café',
    tx:`${esc(l.codigo)} — ${esc(l.origem)}${l.chuva?' · tomou chuva':''}${l.scaa?' · SCAA '+N(l.scaa,1):''} (${l.status})`}));
  ev.sort((a,b)=>a.d<b.d?1:-1);
  const ua=db.solos.filter(s=>s.talhaoId===t.id).sort((a,b)=>a.data<b.data?1:-1)[0];
  let prod='—';
  if(t.cultura==='cafe'){const l=F(db.cafe).filter(r=>r.talhaoId===t.id).reduce((a,r)=>a+r.litros,0);
    if(l)prod=N(l/p.litrosPorSaca/t.area,1)+' sc/ha';}
  else{const sc=F(db.cargas).filter(c=>c.talhaoId===t.id).reduce((a,c)=>a+cargaCalc(c).sacas,0);
    if(sc)prod=N(sc/t.area,1)+' sc/ha';}
  const car=statusCarencia(t.id);
  return `<h1>Ficha do talhão</h1>
  <p class="sub">A história completa do talhão — solo, correções, aplicações, colheitas e lotes — na ordem em que aconteceu. Use o filtro de safra da barra lateral para ver um ano específico.</p>
  ${car?`<div class="panel" style="border-color:var(--crit)"><h3 style="color:var(--crit)">⚠️ Talhão em carência</h3>
    <p style="margin:0;font-size:14px">Aplicação de <b>${esc(car.receita)}</b> em ${dBRy(car.data)}${car.prod?` (${esc(car.prod)}, carência de ${N(car.dias)} dias)`:''}.
    <b>Não colher antes de ${dBRy(car.libera||car.liberaRe)}</b>${car.libera?` — faltam ${N(diasEntre(hoje,car.libera))} dias`:''}.${car.horas?` Reentrada no talhão liberada após ${N(car.horas)} h da aplicação.`:''}</p></div>`:''}
  <div class="panel"><form class="f" data-passive-form>
    <label>Talhão<select id="selTalhao">${ts.map(x=>`<option value="${x.id}" ${x.id===talhaoSel?'selected':''}>${esc(x.nome)} (${NOMES_CULT[x.cultura]||x.cultura})</option>`).join('')}</select></label>
    <button class="btn" data-action="caderno" data-id="${t.id}" type="button">🖨️ Gerar caderno de campo</button>
  </form>
  <p class="note">O caderno de campo reúne todas as operações do talhão no período selecionado — o documento que certificadoras (Rainforest, 4C, Certifica Minas) e compradores de especiais pedem na auditoria.</p></div>
  <div class="cards">
    ${kpi(esc(t.nome),N(t.area,1)+' ha',(NOMES_CULT[t.cultura]||t.cultura)+(t.variedade?' · '+esc(t.variedade):''))}
    ${kpi('Produtividade',prod,anoFiltro?'safra '+anoFiltro:'todas as safras')}
    ${t.cultura==='cafe'?(()=>{const cb=cargaBienal(t.id,anoFiltro||safraDe(hoje));
      return kpi('Carga bienal',cb?cb.carga+(cb.origem==='sugerida'?' ?':''):'—',
        cb?(cb.origem==='sugerida'?'deduzida do histórico — confirme em Café · Inteligência':'marcada'+(cb.obs?' · '+esc(cb.obs):''))
          :'marque em Café · Inteligência');})():''}
    ${kpi('Última análise de solo',ua?dBRy(ua.data):'—',ua?'V% '+N(ua.v)+' · pH '+N(ua.ph,1)+(ua.argila?' · argila '+N(ua.argila)+'%':''):'sem análise registrada')}
    ${kpi('Eventos',ev.length,anoFiltro?'na safra '+anoFiltro:'no histórico completo')}
  </div>
  <div class="panel"><h3>Linha do tempo</h3>
    ${ev.slice(0,150).map(e=>`<div class="alert"><span style="color:var(--muted);font-variant-numeric:tabular-nums;flex:0 0 62px">${dBRy(e.d)}</span> <span class="pill ${e.cl}">${e.lb}</span> <span>${e.tx}</span></div>`).join('')||'<p class="sub">Nenhum evento registrado para este talhão'+(anoFiltro?' na safra '+anoFiltro:'')+'.</p>'}
  </div>`;
}

/* ===== documentos: metadados no localStorage, arquivos no IndexedDB ===== */
let idb=null;
function idbOpen(){return new Promise((res,rej)=>{
  const to=setTimeout(()=>rej(new Error('armazenamento de arquivos indisponível neste navegador')),4000);
  let rq;
  try{rq=indexedDB.open('gefaz360-files',1);}catch(e){clearTimeout(to);rej(e);return;}
  rq.onupgradeneeded=()=>rq.result.createObjectStore('files');
  rq.onsuccess=()=>{clearTimeout(to);res(rq.result);};
  rq.onerror=()=>{clearTimeout(to);rej(rq.error);};
  rq.onblocked=()=>{clearTimeout(to);rej(new Error('armazenamento bloqueado'));};});}
async function filePut(id,blob){const d=idb||(idb=await idbOpen());
  return new Promise((res,rej)=>{const tx=d.transaction('files','readwrite');
    tx.objectStore('files').put(blob,id);tx.oncomplete=res;tx.onerror=()=>rej(tx.error);});}
async function fileGet(id){const d=idb||(idb=await idbOpen());
  return new Promise((res,rej)=>{const rq=d.transaction('files').objectStore('files').get(id);
    rq.onsuccess=()=>res(rq.result);rq.onerror=()=>rej(rq.error);});}
async function fileDel(id){const d=idb||(idb=await idbOpen());
  return new Promise((res,rej)=>{const tx=d.transaction('files','readwrite');tx.objectStore('files').delete(id);
    tx.oncomplete=res;tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error||new Error('Exclusão do arquivo cancelada.'));});}
const blobToDataURL=blob=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(r.error);r.readAsDataURL(blob);});
function dataURLToBlob(dataURL){
  const [head,body]=String(dataURL||'').split(',');
  if(!head||!body||!head.startsWith('data:')||!head.includes(';base64'))throw new Error('Arquivo codificado inválido.');
  const mime=head.slice(5,head.indexOf(';')),bytes=atob(body),out=new Uint8Array(bytes.length);
  for(let i=0;i<bytes.length;i++)out[i]=bytes.charCodeAt(i);
  return new Blob([out],{type:mime});
}
function downloadBlob(blob,name){
  const u=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=u;a.download=name;a.hidden=true;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(u),1000);
}

let statusTimer=null,undoState=null;
function showStatus(message,{undo=false,timeout=15000}={}){
  const box=document.getElementById('app-status');if(!box)return;
  clearTimeout(statusTimer);box.hidden=false;box.replaceChildren();
  const text=document.createElement('span');text.textContent=message;box.appendChild(text);
  if(undo&&undoState){const bt=document.createElement('button');bt.type='button';bt.textContent='Desfazer';bt.onclick=undoLast;box.appendChild(bt);}
  if(timeout)statusTimer=setTimeout(()=>{box.hidden=true;},timeout);
}
function saveRecovery(reason){
  try{localStorage.setItem(LS_RECOVERY,JSON.stringify({version:DB_VERSION,createdAt:new Date().toISOString(),reason,db}));return true;}
  catch(e){showStatus('Não foi possível criar o ponto de recuperação: armazenamento cheio ou bloqueado.',{timeout:0});return false;}
}
async function beginUndo(label,fileIds=[]){
  saveRecovery(label);
  undoState={label,db:JSON.stringify(db),files:[]};
  for(const id of fileIds){try{const blob=await fileGet(id);if(blob)undoState.files.push({id,blob});}catch(e){}}
}
async function undoLast(){
  if(!undoState)return;
  try{
    const previous=normalizeDatabase(JSON.parse(undoState.db),{strict:true});
    if(!save(previous))throw new Error('Falha ao gravar a restauração.');
    db=previous;
    for(const f of undoState.files)await filePut(f.id,f.blob);
    const label=undoState.label;undoState=null;render();showStatus(`Ação desfeita: ${label}.`);
  }catch(e){showStatus('Não foi possível desfazer: '+e.message,{timeout:0});}
}
async function exportBackupCompleto(){
  showStatus('Preparando backup completo…',{timeout:0});
  const files=[];let ausentes=0;
  for(const d of db.documentos){
    try{const blob=await fileGet(d.id);if(blob)files.push({id:d.id,mime:blob.type||d.mime,data:await blobToDataURL(blob)});else ausentes++;}
    catch(e){ausentes++;}
  }
  const payload={format:'gefaz360-backup',version:DB_VERSION,createdAt:new Date().toISOString(),complete:ausentes===0,
    missingFileIds:db.documentos.filter(d=>!files.some(f=>f.id===d.id)).map(d=>d.id),db,files};
  const suffix=ausentes?'-incompleto':'';
  downloadBlob(new Blob([JSON.stringify(payload,null,1)],{type:'application/json'}),`gefaz360-backup${suffix}-${hoje}.json`);
  showStatus(ausentes?`Backup exportado como INCOMPLETO: ${ausentes} documento(s) não está(ão) disponível(is) neste navegador.`:
    `Backup completo exportado: ${files.length} arquivo(s).`,{timeout:ausentes?0:9000});
}
async function importBackupPayload(payload){
  const version=Number(payload?.format==='gefaz360-backup'?payload.version:payload?.version||1);
  if(Number.isFinite(version)&&version>DB_VERSION)throw new Error(`Este backup usa a versão ${version}; atualize o Gefaz360 antes de importar.`);
  const raw=payload?.format==='gefaz360-backup'?payload.db:payload;
  const candidate=normalizeDatabase(raw,{strict:true});
  const files=payload?.format==='gefaz360-backup'?(payload.files||[]):[];
  if(!Array.isArray(files))throw new Error('A lista de arquivos do backup é inválida.');
  const docIds=new Set(candidate.documentos.map(d=>d.id));
  const seenFiles=new Set();let totalBytes=0;
  for(const f of files){
    if(!f||!docIds.has(f.id)||typeof f.data!=='string')throw new Error('O backup contém um arquivo sem metadados correspondentes.');
    if(seenFiles.has(f.id))throw new Error('O backup contém arquivos duplicados.');seenFiles.add(f.id);
    const blob=dataURLToBlob(f.data);
    if(!(/^image\//.test(blob.type)||blob.type==='application/pdf'))throw new Error('O backup contém um tipo de arquivo não permitido.');
    if(blob.size>20*1048576)throw new Error('O backup contém um documento maior que 20 MB.');
    totalBytes+=blob.size;if(totalBytes>200*1048576)throw new Error('Os documentos do backup excedem o limite total de 200 MB.');
    await filePut(f.id,blob);
  }
  saveRecovery('Antes da importação de backup');
  if(!save(candidate))throw new Error('Não foi possível gravar o backup importado.');
  db=candidate;undoState=null;anoFiltro=safraDe(hoje);render();
  const missing=candidate.documentos.length-files.length;
  showStatus(`Backup importado com sucesso: ${files.length} arquivo(s) restaurado(s)${missing?`; ${missing} ausente(s) no arquivo importado`:''}.`,{timeout:missing?0:9000});
}
function restoreRecovery({preserveUndo=false}={}){
  const stored=localStorage.getItem(LS_RECOVERY);if(!stored)throw new Error('Não há ponto de recuperação disponível.');
  const payload=JSON.parse(stored),candidate=normalizeDatabase(payload.db,{strict:true});
  if(!save(candidate))throw new Error('Não foi possível gravar o ponto de recuperação.');
  db=candidate;if(!preserveUndo)undoState=null;anoFiltro=safraDe(hoje);render();
}
const fmtKB=b=>b>=1048576?N(b/1048576,1)+' MB':N(b/1024,0)+' KB';
const DOC_CATS=['NF-e','Ticket de balança','Laudo de solo','Receita agronômica','Contrato','Nota de compra','Outro'];
function pgDocs(){
  const docs=F(db.documentos);
  const totalB=db.documentos.reduce((a,d)=>a+(d.size||0),0);
  return `<h1>Documentos</h1>
  <p class="sub">Fotos e PDFs de NFs, tickets de balança, laudos e contratos — anexados à safra e, quando fizer sentido, ao talhão.</p>
  <div class="cards">
    ${kpi('Documentos',db.documentos.length,docs.length!==db.documentos.length?docs.length+' na safra filtrada':'no acervo')}
    ${kpi('Espaço usado',fmtKB(totalB),'armazenados neste navegador')}
    ${kpi('Categorias',[...new Set(db.documentos.map(d=>d.categoria))].length,[...new Set(db.documentos.map(d=>d.categoria))].slice(0,3).join(', ')||'—')}
  </div>
  <div class="panel"><h3>Enviar documento (foto ou PDF)</h3>
    <form class="f" id="f-doc">
      <label>Arquivos<input type="file" name="arquivos" accept="image/*,application/pdf" multiple required style="max-width:230px"></label>
      <label>Data<input type="date" name="data" value="${hoje}" required></label>
      <label>Categoria<select name="categoria">${DOC_CATS.map(c=>`<option>${c}</option>`).join('')}</select></label>
      <label>Talhão (opcional)<select name="talhaoId"><option value="">—</option>${db.talhoes.map(t=>`<option value="${t.id}">${esc(t.nome)}</option>`).join('')}</select></label>
      <label>Descrição<input name="desc" style="width:220px" placeholder="NF 12501, ticket carga milho…"></label>
      <button class="btn">Enviar</button>
    </form>
    <div id="doc-msg" class="sub" style="margin-top:8px"></div>
    <p class="note">No celular, o campo de arquivo abre direto a câmera para fotografar a nota. Os arquivos ficam gravados neste navegador/aparelho (IndexedDB) e agora são incluídos em <b>Exportar backup completo</b>. Ainda assim, mantenha uma cópia externa do backup.</p></div>
  <div class="tblwrap"><table><thead><tr><th>Data</th><th>Documento</th><th>Categoria</th><th>Talhão</th><th class="num">Tamanho</th><th>Descrição</th><th>Ações</th><th></th></tr></thead><tbody>
    ${docs.slice().sort((a,b)=>a.data<b.data?1:-1).map(d=>`<tr>
      <td>${dBRy(d.data)}</td><td>${d.mime==='application/pdf'?'📄':'📷'} ${esc(d.nome)}</td>
      <td><span class="pill good">${esc(d.categoria)}</span></td>
      <td>${d.talhaoId?esc(tal(d.talhaoId).nome):'—'}</td>
      <td class="num">${fmtKB(d.size||0)}</td><td style="white-space:normal">${esc(d.desc)||'—'}</td>
      <td><button class="btn mini ghost" data-action="ver-doc" data-id="${d.id}">Ver</button>
          <button class="btn mini ghost" data-action="baixar-doc" data-id="${d.id}">Baixar</button></td>
      <td><button class="x" data-action="del" data-col="documentos" data-id="${d.id}" title="Excluir">✕</button></td></tr>`).join('')}
  </tbody></table></div>`;
}
async function docUpload(f){
  const msg=document.getElementById('doc-msg');
  const files=[...(f.elements.arquivos.files||[])];
  if(!files.length)return;
  await beginUndo('Envio de documento');
  let ok=0,err=[];
  for(const file of files){
    if(!/^image\/|^application\/pdf$/.test(file.type)){err.push(file.name+' (tipo não aceito)');continue;}
    if(file.size>20*1048576){err.push(file.name+' (maior que 20 MB)');continue;}
    const id=uid();
    try{
      await filePut(id,file);
      db.documentos.push({id,data:val(f,'data'),nome:file.name,categoria:val(f,'categoria'),
        talhaoId:val(f,'talhaoId'),desc:val(f,'desc'),mime:file.type,size:file.size});
      ok++;
    }catch(e){err.push(file.name+' (falha ao gravar)');}
  }
  save();render();
  const m2=document.getElementById('doc-msg');
  if(m2)m2.textContent=(ok?ok+' arquivo(s) enviado(s).':'')+(err.length?' Falhas: '+err.join('; '):'');
  if(ok)showStatus(`${ok} documento(s) armazenado(s).`,{undo:true});
}
let docURL=null,docPreviousFocus=null;
async function docVer(id){
  const d=db.documentos.find(x=>x.id===id);if(!d)return;
  let blob=null;try{blob=await fileGet(id);}catch(e){}
  const body=document.getElementById('docview-body');
  if(!blob){if(body)body.innerHTML='<p class="sub">Arquivo não encontrado neste navegador (foi enviado em outro aparelho?).</p>';}
  else{
    if(docURL)URL.revokeObjectURL(docURL);
    docURL=URL.createObjectURL(blob);
    body.innerHTML=d.mime==='application/pdf'
      ?`<iframe src="${docURL}"></iframe>`
      :`<img src="${docURL}" alt="${esc(d.nome)}">`;
  }
  document.getElementById('docview-nome').textContent=d.nome;
  const view=document.getElementById('docview');docPreviousFocus=document.activeElement;
  view.classList.add('on');view.setAttribute('aria-hidden','false');document.body.classList.add('dialog-open');
  view.querySelector('[data-action="fecha-doc"]')?.focus();
}
function docFechar(){
  const view=document.getElementById('docview');view.classList.remove('on');view.setAttribute('aria-hidden','true');
  document.body.classList.remove('dialog-open');if(docURL){URL.revokeObjectURL(docURL);docURL=null;}
  document.getElementById('docview-body').replaceChildren();if(docPreviousFocus?.isConnected)docPreviousFocus.focus();
}
async function docBaixar(id){
  const d=db.documentos.find(x=>x.id===id);if(!d)return;
  let blob=null;try{blob=await fileGet(id);}catch(e){}
  if(!blob){showStatus('O arquivo não está disponível neste navegador.',{timeout:0});return;}
  downloadBlob(blob,d.nome);
}

/* ===== impressão: recibo de acerto e caderno de campo ===== */
function imprimir(html){
  document.getElementById('print-area').innerHTML=html;
  window.print();
}
function reciboAcerto(funcId){
  const f=db.func.find(x=>x.id===funcId)||{nome:'—',funcao:''};
  const c=calcAcerto()[funcId];if(!c)return;
  const ms=db.medicoes.filter(m=>!m.acertada&&m.funcId===funcId).sort((a,b)=>a.data<b.data?1:-1);
  const piso=db.params.diariaMinima||0;
  imprimir(`<h1>Recibo de acerto — colheita de café</h1>
  <p class="sub">Emitido em ${dBRy(hoje)} · Safra ${esc(anoFiltro||safraDe(hoje))}</p>
  <p><b>Colhedor(a):</b> ${esc(f.nome)}${f.funcao?' — '+esc(f.funcao):''}</p>
  <table><thead><tr><th>Data</th><th>Talhão</th><th>Tipo</th><th class="num">Medidas</th><th class="num">R$/medida</th><th class="num">Produção</th><th class="num">Compl. piso</th></tr></thead><tbody>
    ${ms.map(m=>{const v=m.medidas*m.valorMedida;
      const doDia=ms.filter(x=>x.data===m.data).reduce((s,x)=>s+x.medidas*x.valorMedida,0);
      const cp=ms.filter(x=>x.data===m.data)[0]===m?Math.max(0,piso-doDia):0;
      return `<tr><td>${dBRy(m.data)}</td><td>${esc(tal(m.talhaoId).nome)}</td><td>${esc(m.tipo)}</td>
      <td class="num">${N(m.medidas,1)}</td><td class="num">${BRL2(m.valorMedida)}</td>
      <td class="num">${BRL2(v)}</td><td class="num">${cp?BRL2(cp):'—'}</td></tr>`;}).join('')}
    <tr><th colspan="5">Total de ${N(c.med,1)} medidas em ${N(c.nDias)} dia(s)</th>
      <th class="num">${BRL2(c.prod)}</th><th class="num">${BRL2(c.compl)}</th></tr>
    <tr><th colspan="6">Valor a receber</th><th class="num">${BRL2(c.total)}</th></tr>
  </tbody></table>
  <p class="sub">Piso de ${BRL2(piso)} por dia trabalhado. Medida de ${N(db.params.litrosPorMedida)} L.</p>
  <p>Recebi da fazenda a importância acima, referente aos serviços de colheita discriminados neste recibo.</p>
  <div class="ass">Assinatura do(a) colhedor(a)</div>
  <div class="ass">Responsável pela fazenda</div>`);
}
function cadernoCampo(talhaoId){
  const t=db.talhoes.find(x=>x.id===talhaoId);if(!t)return;
  const ano=anoFiltro||'todas as safras';
  const lin=[];
  const push=(d,op,det)=>lin.push({d,op,det});
  F(db.solos).filter(s=>s.talhaoId===t.id).forEach(s=>push(s.data,'Análise de solo',
    `pH ${N(s.ph,1)} · M.O. ${N(s.mo,1)}% · P ${N(s.p,1)} · K ${N(s.k)} · V% ${N(s.v)}${s.obs?' — '+s.obs:''}`));
  F(db.adubacoes).filter(a=>a.talhaoId===t.id).forEach(a=>push(a.data,a.operacao,
    `${a.produto} — ${N(a.dose,1)} ${a.unidade} em ${N(a.area,1)} ha${a.obs?' — '+a.obs:''}`));
  F(db.pulvOS).filter(o=>o.talhaoId===t.id&&o.status==='concluida').forEach(o=>{
    const r=db.receitas.find(x=>x.id===o.receitaId)||{nome:'—',itens:[]};
    const prods=(r.itens||[]).map(i=>{const p=db.defensivos.find(d=>d.id===i.prodId);
      return p?`${p.nome} ${N(i.dose,2)} ${p.unidade}/ha`:'';}).filter(x=>x).join('; ');
    push(o.data,'Aplicação — '+(o.via||'Foliar'),`${r.nome} (alvo: ${r.alvo||'—'}) — ${N(o.area,1)} ha · ${prods}`);});
  F(db.podas).filter(x=>x.talhaoId===t.id).forEach(x=>push(x.data,'Poda',`${x.tipo} — ${N(x.area,1)} ha${x.obs?' — '+x.obs:''}`));
  F(db.arruacoes).filter(x=>x.talhaoId===t.id).forEach(x=>push(x.data,x.tipo,`${N(x.area,1)} ha${x.obs?' — '+x.obs:''}`));
  F(db.capinas).filter(x=>x.talhaoId===t.id).forEach(x=>push(x.data,'Capina/roçada',`${x.tipo} — ${N(x.area,1)} ha${x.obs?' — '+x.obs:''}`));
  F(db.coberturas).filter(x=>x.talhaoId===t.id).forEach(x=>push(x.data,'Cobertura',`${x.especie} — ${x.operacao} em ${N(x.area,1)} ha`));
  F(db.os).filter(o=>o.talhaoId===t.id&&o.status==='concluida').forEach(o=>push(
    String(o.concluidoEm||o.data).slice(0,10),`OS ${o.codigo||'operacional'}`,
    `${o.titulo} — ${N(o.realizado,1)}${o.unidade?' '+o.unidade:''}${o.responsavelId?' · Responsável: '+osResponsavel(o):''}`));
  if(t.cultura==='cafe')F(db.cafe).filter(r=>r.talhaoId===t.id).forEach(r=>push(r.data,'Colheita',
    `${r.tipo} — ${N(r.litros/db.params.litrosPorCarreta,1)} carretas (${N(r.litros)} L)`));
  else F(db.cargas).filter(c=>c.talhaoId===t.id).forEach(c=>push(c.data,'Carga',
    `NF ${c.nf||'s/nº'} — ${N(cargaCalc(c).sacas,0)} sc → ${c.destino||'—'}`));
  lin.sort((a,b)=>a.d<b.d?1:-1);
  const lotes=F(db.lotes).filter(l=>l.talhaoId===t.id);
  imprimir(`<h1>Caderno de campo — ${esc(t.nome)}</h1>
  <p class="sub">${NOMES_CULT[t.cultura]||t.cultura}${t.variedade?' · '+esc(t.variedade):''} · ${N(t.area,1)} ha · Safra: ${esc(ano)} · Emitido em ${dBRy(hoje)}</p>
  <h2>Registro de operações (${lin.length})</h2>
  <table><thead><tr><th>Data</th><th>Operação</th><th>Detalhamento</th></tr></thead><tbody>
    ${lin.map(x=>`<tr><td>${dBRy(x.d)}</td><td>${esc(x.op)}</td><td>${esc(x.det)}</td></tr>`).join('')
      ||'<tr><td colspan="3">Nenhuma operação registrada no período.</td></tr>'}
  </tbody></table>
  ${lotes.length?`<h2>Lotes de café originados deste talhão</h2>
  <table><thead><tr><th>Lote</th><th>Data</th><th>Origem</th><th>Chuva</th><th class="num">Sacas</th><th>COB</th><th>Peneira</th><th class="num">SCAA</th></tr></thead><tbody>
    ${lotes.map(l=>`<tr><td>${esc(l.codigo)}</td><td>${dBRy(l.data)}</td><td>${esc(l.origem)}</td>
      <td>${l.chuva?'sim':'não'}</td><td class="num">${l.sacas?N(l.sacas,0):'—'}</td>
      <td>${l.cobTipo?'Tipo '+N(l.cobTipo,1)+(l.cobBebida?' · '+esc(l.cobBebida):''):'—'}</td>
      <td>${esc(l.peneira)||'—'}</td><td class="num">${l.scaa?N(l.scaa,1):'—'}</td></tr>`).join('')}
  </tbody></table>`:''}
  <p class="sub" style="margin-top:6mm">Documento gerado pelo Gefaz360 a partir dos registros da propriedade.</p>
  <div class="ass">Responsável técnico / produtor</div>`);
}

const PAGES={dash:pgDash,ordens:pgOrdens,cafe:pgCafe,pos:pgPos,milho:()=>pgGrao('milho'),soja:()=>pgGrao('soja'),
  sorgo:()=>pgGrao('sorgo'),trigo:()=>pgGrao('trigo'),cobertura:pgCobertura,intel:pgIntel,voz:pgVoz,talhao:pgTalhao,
  mapa:pgMapa,
  fin:pgFin,rh:pgRH,oficina:pgOficina,docs:pgDocs,pvgest:pgPvgest,config:pgConfig};

/* ============ render & eventos ============ */
const $nav=document.getElementById('nav'),$main=document.getElementById('main');
/* colunas editáveis → formulário correspondente na página */
const EDIT_FORM={cafe:'f-cafe',cargas:'f-carga',fin:'f-fin',func:'f-func',apont:'f-apont',
  maquinas:'f-maq',os:'f-os',estoque:'f-item',talhoes:'f-talhao',medicoes:'f-med',
  defensivos:'f-def',regColheita:'f-regcol',regAplicacao:'f-regap',lotes:'f-lote',
  coberturas:'f-cob',combCompras:'f-comb-compra',abastecimentos:'f-abast',
  lembretes:'f-lembrete',chuvas:'f-chuva',solos:'f-solo',adubacoes:'f-adub',podas:'f-poda',arruacoes:'f-arr',capinas:'f-cap'};
const FORM_COL=Object.fromEntries(Object.entries(EDIT_FORM).map(([c,fo])=>[fo,c]));
/* campos de fluxo que a edição não deve resetar */
const STRIP_EDIT={'f-med':['acertada','consolidada'],'f-lote':['status','sacas'],
  'f-lembrete':['feito'],'f-carga':['pago'],'f-os':['codigo','status','progresso','realizado','iniciadoEm','concluidoEm','checklist','apontamentos'],'f-item':['resp']};

const FIELD_LIMITS={
  lat:{min:-90,max:90},lon:{min:-180,max:180},ph:{min:0,max:14},mm:{min:0,max:500},
  umidade:{min:0,max:100},umidadeEntrada:{min:0,max:100},u:{min:0,max:100},rh:{min:0,max:100},
  v:{min:0,max:100},m:{min:0,max:100},mo:{min:0,max:100},argila:{min:0,max:100},
  silte:{min:0,max:100},areia:{min:0,max:100},peneiraPct:{min:0,max:100},scaa:{min:0,max:100},
  tempAr:{min:-20,max:100},tempMassa:{min:-20,max:100},temp:{min:-20,max:60},
  carencia:{min:0,max:3650},reentrada:{min:0,max:720},dias:{min:0,max:366}
};
const FORM_FIELD_LIMITS={
  'f-carga.umidade':{min:0,max:60},'f-regcol.ano':{min:2000,max:2100},
  'f-qual.cobTipo':{min:2,max:8},'f-qual.aroma':{min:0,max:10},'f-qual.sabor':{min:0,max:10},
  'f-qual.acidez':{min:0,max:10},'f-qual.corpo':{min:0,max:10},'f-qual.fin':{min:0,max:10},
  'f-os.mo':{min:0,max:1000000000},'f-os.pecas':{min:0,max:1000000000},'f-os-operacional.meta':{min:0,max:1000000000}
};
const STRICT_POSITIVE=new Set([
  'f-chuva.mm','f-cafe.qtd','f-med.medidas','f-sec.umidadeEntrada','f-leitura.h','f-leitura.u',
  'f-benef.sacas','f-vcafe.sacas','f-vcafe.preco','f-carga.bruto','f-carga.preco','f-cob.area',
  'f-pos.area','f-fin.valor','f-func.valor','f-apont.dias','f-comb-compra.litros','f-comb-compra.valor',
  'f-abast.litros','f-abast.horimetro','f-talhao.area','f-adub.dose','f-adub.area','f-poda.area',
  'f-arr.area','f-cap.area','f-param.litrosPorCarreta','f-param.litrosPorSaca','f-param.litrosPorMedida',
  'f-param.minDiesel','f-param.diariaMinima'
]);

function fieldLabel(el){
  const raw=el.labels?.[0]?.childNodes?.[0]?.textContent||el.name||'Campo';return raw.trim()||el.name||'Campo';
}
function applyFormEnhancements(){
  $main.querySelectorAll('form').forEach(f=>{f.noValidate=true;});
  $main.querySelectorAll('input[type="number"]').forEach(el=>{
    const key=(el.form?.id||'')+'.'+el.name,limits={...(FORM_FIELD_LIMITS[key]||FIELD_LIMITS[el.name]||{min:0})};
    if(STRICT_POSITIVE.has(key))limits.min=Number.EPSILON;
    if(limits.min!==undefined)el.min=String(limits.min);
    if(limits.max!==undefined)el.max=String(limits.max);
    el.inputMode='decimal';
  });
  $main.querySelectorAll('button[data-action]').forEach(b=>{
    b.type='button';
    const labels={del:'Excluir registro',edit:'Editar registro',pago:'Alterar situação do pagamento',baixa:'Dar baixa no lançamento',
      'fim-sec':'Finalizar secagem','fecha-os':'Concluir ordem de serviço','lembrete-ok':'Marcar lembrete como feito',
      'concluir-pos':'Concluir aplicação','mov':'Movimentar estoque','mov-def':'Movimentar defensivo',
      'ver-doc':'Visualizar documento','baixar-doc':'Baixar documento'};
    const base=labels[b.dataset.action];if(!base)return;
    const ctx=b.closest('tr')?.querySelector('td')?.textContent?.trim()||'';
    b.setAttribute('aria-label',ctx?`${base}: ${ctx.slice(0,60)}`:base);
  });
  $main.querySelectorAll('svg[role="img"]').forEach(svg=>{
    if(svg.hasAttribute('aria-label')||svg.querySelector('title'))return;
    const heading=svg.closest('.panel')?.querySelector('h2,h3')?.textContent||'Gráfico do Gefaz360';
    svg.setAttribute('aria-label',heading);
  });
  $main.querySelectorAll('[data-tip]').forEach(el=>{if(!el.hasAttribute('title'))el.setAttribute('title',el.dataset.tip);});
  $main.querySelectorAll('table').forEach(table=>{
    if(table.hasAttribute('aria-label')||table.querySelector('caption'))return;
    const headings=[...$main.querySelectorAll('h1,h2,h3')].filter(h=>h.compareDocumentPosition(table)&Node.DOCUMENT_POSITION_FOLLOWING);
    const heading=headings[headings.length-1]?.textContent||$main.querySelector('h1')?.textContent||'Registros';
    table.setAttribute('aria-label',`${heading.trim().slice(0,80)} — tabela`);
  });
  $main.querySelectorAll('h3').forEach(h=>{
    const h2=document.createElement('h2');for(const a of h.attributes)h2.setAttribute(a.name,a.value);
    h2.classList.add('panel-title');while(h.firstChild)h2.appendChild(h.firstChild);h.replaceWith(h2);
  });
}

function clearFormError(f){
  f.querySelector('.form-error')?.remove();
  [...f.elements].forEach(el=>{el.removeAttribute?.('aria-invalid');if(el.dataset?.errorDescribedby){el.removeAttribute('aria-describedby');delete el.dataset.errorDescribedby;}});
}
function showFormError(f,errors){
  clearFormError(f);const first=errors[0],el=f.elements[first.field];
  const p=document.createElement('p');p.className='form-error';p.id=`erro-${f.id||'form'}-${Date.now()}`;
  p.setAttribute('role','alert');p.textContent=errors.map(x=>x.message).join(' ');f.prepend(p);
  if(el?.setAttribute){el.setAttribute('aria-invalid','true');el.setAttribute('aria-describedby',p.id);el.dataset.errorDescribedby='1';el.focus();}
}
function validateForm(f){
  clearFormError(f);const errors=[],add=(field,message)=>{if(!errors.some(x=>x.field===field&&x.message===message))errors.push({field,message});};
  [...f.elements].forEach(el=>{
    if(!el.name||el.disabled||!['INPUT','SELECT','TEXTAREA'].includes(el.tagName))return;
    const value=String(el.value||'').trim(),label=fieldLabel(el);
    if(el.required&&!value){add(el.name,`${label} é obrigatório.`);return;}
    if(el.type==='number'&&value){
      const n=Number(value);if(!Number.isFinite(n)){add(el.name,`${label} precisa ser numérico.`);return;}
      if(el.min!==''&&n<Number(el.min))add(el.name,`${label} deve ser no mínimo ${Number(el.min)>0&&Number(el.min)<1?'maior que zero':N(Number(el.min),Number(el.step)<1?1:0)}.`);
      if(el.max!==''&&n>Number(el.max))add(el.name,`${label} deve ser no máximo ${N(Number(el.max),Number(el.step)<1?1:0)}.`);
    }
  });
  if(f.id==='f-carga'){
    const c={bruto:num(f,'bruto'),tara:num(f,'tara'),umidade:num(f,'umidade'),preco:num(f,'preco')};
    cargaErrors(c).forEach(message=>add(message.includes('tara')?'tara':message.includes('umidade')?'umidade':message.includes('preço')?'preco':'bruto',message));
  }
  if(f.id==='f-chuva'&&val(f,'data')>hoje)add('data','A chuva não pode ser registrada em uma data futura.');
  if(f.id==='f-vcafe'){
    const loteId=val(f,'loteId'),sacas=num(f,'sacas'),disponivel=loteId?sacasDisponiveis(loteId):estoqueCafeDisponivel();
    if(sacas>disponivel+0.001)add('sacas',loteId?`Este lote tem apenas ${N(disponivel,0)} saca(s) disponíveis.`:`O estoque total tem apenas ${N(disponivel,0)} saca(s) disponíveis.`);
  }
  if(f.elements.area&&f.elements.talhaoId){
    const t=db.talhoes.find(x=>x.id===val(f,'talhaoId')),area=num(f,'area');
    if(t&&area>Number(t.area)+0.001)add('area',`A área informada excede os ${N(t.area,1)} ha cadastrados para ${t.nome}.`);
  }
  if(f.id==='f-solo'){
    const parts=['argila','silte','areia'].map(k=>num(f,k));
    if(parts.every(x=>x>0)){const total=parts.reduce((a,x)=>a+x,0);if(total<95||total>105)add('argila','Argila, silte e areia devem somar aproximadamente 100%.');}
  }
  if(f.id==='f-leitura'){
    const s=db.secagens.find(x=>x.id===val(f,'secagemId')),last=s?.leituras?.at(-1)?.h;
    if(Number.isFinite(last)&&num(f,'h')<=last)add('h',`A nova leitura deve ocorrer depois de ${N(last)} hora(s).`);
  }
  if(f.id==='f-abast'){
    const m=db.maquinas.find(x=>x.id===val(f,'maqId'));
    if(m&&num(f,'horimetro')<Number(m.horimetro||0))add('horimetro',`O horímetro não pode ser menor que o atual (${N(m.horimetro)} h).`);
  }
  if((f.id==='f-os'||f.id==='f-os-operacional')&&val(f,'prazo')<val(f,'data'))
    add('prazo','O prazo não pode ser anterior ao início planejado.');
  if(f.id==='f-os-apontamento'){
    const o=db.os.find(x=>x.id===val(f,'osId'));
    if(!o||!OS_ATIVAS.has(o.status))add('texto','A ordem não está disponível para apontamentos.');
    else{
      if(val(f,'data')<o.data)add('data','O apontamento não pode ser anterior ao início planejado.');
      if(num(f,'progresso')<Number(o.progresso||0))add('progresso',`O progresso não pode regredir de ${N(o.progresso)}%.`);
      if(o.meta&&f.elements.realizado&&num(f,'realizado')<Number(o.realizado||0))add('realizado',`O realizado não pode regredir de ${N(o.realizado,1)} ${o.unidade}.`);
    }
  }
  if(errors.length){showFormError(f,errors);return false;}return true;
}

function render(){
  const secs={op:'Operação',adm:'Gestão',sys:'Sistema'};let cur='';
  $nav.innerHTML=ROTAS.map(([id,label,sec])=>{
    let h='';
    if(sec!==cur){cur=sec;h+=`<div class="navsec">${secs[sec]}</div>`;}
    return h+`<button class="${rota===id?'on':''}" data-rota="${id}" ${rota===id?'aria-current="page"':''}><span class="dot" aria-hidden="true"></span>${label}</button>`;
  }).join('');
  /* mantém o módulo ativo visível na barra lateral rolável */
  $nav.querySelector('button.on')?.scrollIntoView({block:'nearest',inline:'nearest'});
  $main.innerHTML=(saveErro?`<div class="panel" style="border-color:var(--crit)"><p style="margin:0;color:var(--crit);font-weight:700">⚠️ Os dados NÃO estão sendo gravados neste navegador (armazenamento cheio ou bloqueado). Vá em Cadastros &amp; Dados e exporte o backup JSON agora, antes de fechar esta aba.</p></div>`:'')+PAGES[rota]();
  /* safras disponíveis: das que têm lançamento (ou 2018) até a que começa no ano que vem */
  const ys=[...db.cafe,...db.cargas,...db.fin,...db.lotes].map(r=>+String(r.data||'').slice(0,4)).filter(x=>x>2000);
  const curY=+hoje.slice(0,4);
  const minY=Math.min(2018,...(ys.length?ys:[curY])),maxY=Math.max(curY+2,...(ys.length?ys:[curY]).map(y=>y+1));
  const miS=db.params.mesInicioSafra||10;
  const anos=[];for(let y=maxY;y>minY;y--)anos.push(miS===1?String(y-1):(y-1)+'/'+String(y).slice(2));
  document.getElementById('safraBox').innerHTML=
    `<label for="selAno" class="navsec" style="padding:0 0 3px;display:block">Safra</label>`+
    `<select id="selAno" style="width:100%"><option value="">Todas</option>`+
    anos.map(a=>`<option value="${a}" ${a===anoFiltro?'selected':''}>${a}</option>`).join('')+`</select>`+
    `<div class="sub" style="font-size:11px;margin:4px 0 0">${anoFiltro?esc(safraPeriodo(anoFiltro)):'ano-safra: '+mesNome[(db.params.mesInicioSafra||10)-1]+' a '+mesNome[((db.params.mesInicioSafra||10)+10)%12]}</div>`;
  /* botão ✎ ao lado de cada ✕ cujo formulário de edição existe na página */
  $main.querySelectorAll('[data-action="del"]').forEach(x=>{
    const fid=EDIT_FORM[x.dataset.col];
    if(!fid||!document.getElementById(fid))return;
    const e=document.createElement('button');
    e.className='x';e.textContent='✎';e.title='Editar';e.setAttribute('aria-label','Editar registro');e.type='button';
    e.dataset.action='edit';e.dataset.col=x.dataset.col;e.dataset.form=fid;e.dataset.id=x.dataset.id;
    x.parentNode.insertBefore(e,x);
  });
  applyFormEnhancements();
  window.scrollTo(0,0);
  const imp=document.getElementById('imp');
  if(imp)imp.onchange=async e=>{
    const f=e.target.files[0];if(!f)return;
    const m=document.getElementById('imp-msg');
    try{
      if(f.size>300*1048576)throw new Error('O arquivo excede o limite de 300 MB.');
      const payload=JSON.parse(await f.text());
      const total=(payload?.db||payload)?.talhoes?.length||0;
      if(!confirm(`Importar este backup e substituir os dados atuais? O arquivo contém ${total} talhão(ões). Um ponto de recuperação será criado antes da troca.`))return;
      await importBackupPayload(payload);
    }catch(err){if(m)m.textContent='Arquivo inválido: '+(err?.message||'esperado um backup exportado pelo Gefaz360.');}
  };
  const impv=document.getElementById('imp-pv');
  if(impv)impv.onchange=async e=>{
    const f=e.target.files[0];if(!f)return;
    const m=document.getElementById('imp-pv-msg');
    try{
      if(f.size>25*1048576)throw new Error('arquivo maior que 25 MB');
      const d=JSON.parse(await f.text());
      if(!d.produtos&&!d.talhoes&&!d.receitas)throw 0;
      await beginUndo('Importação do PVgest');
      const idMap={};
      (d.produtos||[]).forEach(p=>{
        const nid=uid();idMap[p.id]=nid;
        db.defensivos.push({id:nid,nome:p.nome||'Produto',classe:p.classe||'—',unidade:p.unidade||'L',
          preco:+p.preco||0,qtd:+p.estoque_atual||0,min:+p.estoque_min||0});
      });
      (d.receitas||[]).forEach(r=>{
        db.receitas.push({id:uid(),nome:r.nome||'Receita',cultura:r.cultura||'',alvo:r.alvo||'',
          volumeHa:+r.volume_ha||200,
          itens:(r.itens||[]).filter(i=>idMap[i.produto]).map(i=>({prodId:idMap[i.produto],dose:+i.dose||0}))});
      });
      let novosT=0;
      (d.talhoes||[]).forEach(t=>{
        if(db.talhoes.some(x=>x.nome.toLowerCase()===(t.nome||'').toLowerCase()))return;
        const c=(t.cultura||'').toLowerCase();
        db.talhoes.push({id:uid(),nome:t.nome||'Talhão',area:+t.area||0,
          cultura:c.includes('caf')?'cafe':c.includes('milh')?'milho':c.includes('soj')?'soja':'cafe'});
        novosT++;
      });
      save();render();
      const m2=document.getElementById('imp-pv-msg');
      if(m2)m2.textContent='Importado: '+(d.produtos||[]).length+' produtos, '+(d.receitas||[]).length+' receitas, '+novosT+' talhões novos.';
      showStatus('Dados do PVgest importados.',{undo:true});
    }catch(err){if(m)m.textContent='Arquivo inválido: cole o conteúdo de localStorage.getItem(\'pvgest_v1\') num .json.';}
  };
  const mf=document.getElementById('mapa-file');
  if(mf)mf.onchange=e=>{const f=e.target.files[0];if(f)lerArquivoMapa(f);};
  if(rota==='pvgest')updDT();
}
$nav.addEventListener('click',e=>{const b=e.target.closest('[data-rota]');if(!b)return;
  const next=b.dataset.rota;if(!rotaValida(next))return;
  if(location.hash.slice(1)===next){rota=next;render();$main.focus();}
  else location.hash=next;
});
window.addEventListener('hashchange',()=>{rota=rotaHash();render();$main.focus();});
document.addEventListener('change',e=>{
  if(e.target.id==='selAno'){anoFiltro=e.target.value;render();}
  else if(e.target.id==='selTalhao'){talhaoSel=e.target.value;render();}
});
$main.addEventListener('input',e=>{if(e.target.closest&&e.target.closest('#dt-calc'))updDT();});
$main.addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ')&&e.target.matches?.('[data-action="ficha-talhao-mapa"]')){
    e.preventDefault();const id=e.target.dataset.id;if(id){talhaoSel=id;location.hash='talhao';}
  }
});
$main.addEventListener('change',e=>{
  const f=e.target.closest&&e.target.closest('#f-cafe');
  if(f&&e.target.name==='tipo'){
    const mec=e.target.value==='Mecanizada';
    const hl=document.getElementById('lbl-horas');if(hl)hl.style.display=mec?'':'none';
    if(f.elements.unidade)f.elements.unidade.value=mec?'carreta':'litro';
  }
  const fr=e.target.closest&&e.target.closest('#f-regcol');
  if(fr&&e.target.name==='talhaoId'&&fr.elements.variedade){
    const t=db.talhoes.find(x=>x.id===e.target.value);
    fr.elements.variedade.value=t&&t.variedade?t.variedade:'';
  }
  if(e.target.id==='mapa-modo'){mapaModo=e.target.value;render();}
});

const val=(f,n)=>f.elements[n]?f.elements[n].value.trim():'';
const num=(f,n)=>parseFloat(f.elements[n]?.value)||0;
$main.addEventListener('submit',async e=>{
  e.preventDefault();const f=e.target;
  if(f.hasAttribute('data-passive-form'))return;
  const wasEditing=!!f.dataset.editId;
  if(!validateForm(f))return;
  if(f.id==='f-doc'){await docUpload(f);return;}
  const editingCol=FORM_COL[f.id],editingRec=editingCol&&f.dataset.editId?db[editingCol].find(x=>x.id===f.dataset.editId):null;
  if(editingCol==='fin'&&(editingRec?.cargaId||editingRec?.vendaId||editingRec?.pulvOSId)){
    showFormError(f,[{field:'desc',message:'Este lançamento é gerenciado pelo módulo de origem e não pode ser editado diretamente.'}]);return;
  }
  if(f.id==='f-param'&&num(f,'mesInicioSafra')!==Number(db.params.mesInicioSafra)&&
    !confirm('Alterar o início do ano-safra reclassificará todos os lançamentos por período. Deseja continuar?'))return;
  await beginUndo(f.dataset.editId?'Edição de registro':'Inclusão de registro');
  if(f.id==='f-cafe')db.cafe.push({id:uid(),data:val(f,'data'),talhaoId:val(f,'talhaoId'),tipo:val(f,'tipo'),
    litros:val(f,'unidade')==='carreta'?num(f,'qtd')*db.params.litrosPorCarreta:num(f,'qtd'),
    colhedores:num(f,'colhedores'),valorMedida:num(f,'valorMedida'),horas:num(f,'horas')});
  else if(f.id==='f-regcol')db.regColheita.push({id:uid(),data:val(f,'data'),ano:num(f,'ano')||+val(f,'data').slice(0,4),
    talhaoId:val(f,'talhaoId'),variedade:val(f,'variedade'),tipo:val(f,'tipo'),
    maquinaId:val(f,'maquinaId'),vibracao:num(f,'vibracao'),velocidade:num(f,'velocidade'),
    freio:num(f,'freio'),obs:val(f,'obs')});
  else if(f.id==='f-regap')db.regAplicacao.push({id:uid(),data:val(f,'data'),maquinaId:val(f,'maquinaId'),
    velocidade:num(f,'velocidade'),rpm:num(f,'rpm'),bico:val(f,'bico'),numBicos:num(f,'numBicos'),
    vazaoHa:num(f,'vazaoHa'),vazaoBico:num(f,'vazaoBico'),obs:val(f,'obs')});
  else if(f.id==='f-lote')db.lotes.push({id:uid(),codigo:val(f,'codigo'),data:val(f,'data'),
    talhaoId:val(f,'talhaoId'),origem:val(f,'origem'),carretas:num(f,'carretas'),
    chuva:f.elements.chuva?f.elements.chuva.checked:false,
    obs:val(f,'obs'),status:'terreiro'});
  else if(f.id==='f-sec'){
    const lid=val(f,'loteId');const lt=db.lotes.find(x=>x.id===lid);
    if(lt){const ue=num(f,'umidadeEntrada');
      db.secagens.push({id:uid(),loteId:lid,dataInicio:hoje,umidadeEntrada:ue,tempAr:num(f,'tempAr'),
        tempMassa:num(f,'tempMassa'),status:'andamento',leituras:[{h:0,u:ue}]});
      lt.status='secando';}
  }
  else if(f.id==='f-leitura'){
    const s=db.secagens.find(x=>x.id===val(f,'secagemId'));
    if(s){s.leituras.push({h:num(f,'h'),u:num(f,'u')});s.leituras.sort((a,b)=>a.h-b.h);}
  }
  else if(f.id==='f-cob')db.coberturas.push({id:uid(),data:val(f,'data'),talhaoId:val(f,'talhaoId'),
    especie:val(f,'especie'),operacao:val(f,'operacao'),area:num(f,'area'),obs:val(f,'obs')});
  else if(f.id==='f-comb-compra')db.combCompras.push({id:uid(),data:val(f,'data'),litros:num(f,'litros'),
    valor:num(f,'valor'),obs:val(f,'obs')});
  else if(f.id==='f-abast'){
    const h=num(f,'horimetro');
    db.abastecimentos.push({id:uid(),data:val(f,'data'),maqId:val(f,'maqId'),litros:num(f,'litros'),horimetro:h,obs:val(f,'obs')});
    const m=db.maquinas.find(x=>x.id===val(f,'maqId'));
    if(m&&h>m.horimetro)m.horimetro=h;
  }
  else if(f.id==='f-lembrete')db.lembretes.push({id:uid(),maqId:val(f,'maqId'),desc:val(f,'desc'),
    horimetroAlvo:num(f,'horimetroAlvo'),dataAlvo:val(f,'dataAlvo'),obs:val(f,'obs'),feito:false});
  else if(f.id==='f-chuva')db.chuvas.push({id:uid(),data:val(f,'data'),mm:num(f,'mm'),obs:val(f,'obs')});
  else if(f.id==='f-solo')db.solos.push({id:uid(),data:val(f,'data'),talhaoId:val(f,'talhaoId'),prof:val(f,'prof'),
    ph:num(f,'ph'),mo:num(f,'mo'),p:num(f,'p'),k:num(f,'k'),ca:num(f,'ca'),mg:num(f,'mg'),v:num(f,'v'),
    s:num(f,'s'),al:num(f,'al'),hal:num(f,'hal'),ctc:num(f,'ctc'),m:num(f,'m'),
    b:num(f,'b'),cu:num(f,'cu'),fe:num(f,'fe'),mn:num(f,'mn'),zn:num(f,'zn'),
    argila:num(f,'argila'),silte:num(f,'silte'),areia:num(f,'areia'),obs:val(f,'obs')});
  else if(f.id==='f-adub')db.adubacoes.push({id:uid(),data:val(f,'data'),talhaoId:val(f,'talhaoId'),
    operacao:val(f,'operacao'),produto:val(f,'produto'),dose:num(f,'dose'),unidade:val(f,'unidade'),
    area:num(f,'area'),obs:val(f,'obs')});
  else if(f.id==='f-poda')db.podas.push({id:uid(),data:val(f,'data'),talhaoId:val(f,'talhaoId'),
    tipo:val(f,'tipo'),area:num(f,'area'),obs:val(f,'obs')});
  else if(f.id==='f-arr')db.arruacoes.push({id:uid(),data:val(f,'data'),talhaoId:val(f,'talhaoId'),
    tipo:val(f,'tipo'),area:num(f,'area'),obs:val(f,'obs')});
  else if(f.id==='f-cap')db.capinas.push({id:uid(),data:val(f,'data'),talhaoId:val(f,'talhaoId'),
    tipo:val(f,'tipo'),area:num(f,'area'),obs:val(f,'obs')});
  else if(f.id==='f-benef'){
    const lt=db.lotes.find(x=>x.id===val(f,'loteId'));
    if(lt){lt.sacas=num(f,'sacas');lt.status='beneficiado';}
  }
  else if(f.id==='f-qual'){
    const lt=db.lotes.find(x=>x.id===val(f,'loteId'));
    if(lt){lt.cobTipo=num(f,'cobTipo');lt.cobBebida=val(f,'cobBebida');lt.scaa=num(f,'scaa');
      lt.peneira=val(f,'peneira');lt.peneiraPct=num(f,'peneiraPct');
      const s={aroma:num(f,'aroma'),sabor:num(f,'sabor'),acidez:num(f,'acidez'),corpo:num(f,'corpo'),fin:num(f,'fin')};
      if(Object.values(s).some(v=>v>0))lt.sens=s;
      lt.descritores=val(f,'descritores');}
  }
  else if(f.id==='f-vcafe'){
    const v={id:uid(),data:val(f,'data'),loteId:val(f,'loteId'),sacas:num(f,'sacas'),preco:num(f,'preco'),
      comprador:val(f,'comprador'),nf:val(f,'nf'),obs:val(f,'obs')};
    db.vendasCafe.push(v);
    db.fin.push({id:uid(),data:v.data,tipo:'entrada',categoria:'Venda de café',centro:'Cafe',
      desc:'Café — NF '+(v.nf||'s/nº')+' ('+N(v.sacas,0)+' sc × '+BRL2(v.preco)+')',
      valor:v.sacas*v.preco,status:'realizado',vendaId:v.id});
  }
  else if(f.id==='f-carga')db.cargas.push({id:uid(),cultura:f.dataset.cult,data:val(f,'data'),talhaoId:val(f,'talhaoId'),
    motorista:val(f,'motorista'),placa:val(f,'placa'),bruto:num(f,'bruto'),tara:num(f,'tara'),
    umidade:num(f,'umidade'),nf:val(f,'nf'),destino:val(f,'destino'),preco:num(f,'preco'),pago:false});
  else if(f.id==='f-fin')db.fin.push({id:uid(),data:val(f,'data'),tipo:val(f,'tipo'),categoria:val(f,'categoria'),
    centro:val(f,'centro'),desc:val(f,'desc'),valor:num(f,'valor'),status:val(f,'status')});
  else if(f.id==='f-func')db.func.push({id:uid(),nome:val(f,'nome'),funcao:val(f,'funcao'),tipo:val(f,'tipo'),valor:num(f,'valor')});
  else if(f.id==='f-apont'){const fu=db.func.find(x=>x.id===val(f,'funcId'));
    db.apont.push({id:uid(),data:val(f,'data'),funcId:val(f,'funcId'),atividade:val(f,'atividade'),
      dias:num(f,'dias'),valor:num(f,'dias')*(fu&&fu.tipo==='safrista'?fu.valor:0)});}
  else if(f.id==='f-maq')db.maquinas.push({id:uid(),nome:val(f,'nome'),tipo:val(f,'tipo'),horimetro:num(f,'horimetro'),proxRev:num(f,'proxRev')});
  else if(f.id==='f-os-operacional'){
    const rec=f.dataset.editId?db.os.find(x=>x.id===f.dataset.editId):null;
    const fields={data:val(f,'data'),prazo:val(f,'prazo'),titulo:val(f,'titulo'),desc:val(f,'desc'),
      modulo:val(f,'modulo'),categoria:val(f,'categoria'),tipo:val(f,'tipo')||'Serviço',prioridade:val(f,'prioridade'),
      responsavelId:val(f,'responsavelId'),talhaoId:val(f,'talhaoId'),maqId:val(f,'maqId'),meta:num(f,'meta'),unidade:val(f,'unidade')};
    if(rec)Object.assign(rec,fields);
    else db.os.push({id:uid(),codigo:nextOsCode(fields.data),...fields,pecas:0,mo:0,status:'planejada',progresso:0,
      realizado:0,iniciadoEm:'',concluidoEm:'',checklist:[],apontamentos:[]});
    delete f.dataset.editId;
  }
  else if(f.id==='f-os')db.os.push({id:uid(),codigo:nextOsCode(val(f,'data')),data:val(f,'data'),prazo:val(f,'prazo'),
    categoria:'Manutenção',modulo:'Oficina',titulo:val(f,'desc'),maqId:val(f,'maqId'),responsavelId:val(f,'responsavelId'),
    talhaoId:'',tipo:val(f,'tipo'),desc:val(f,'desc'),prioridade:val(f,'prioridade'),pecas:num(f,'pecas'),mo:num(f,'mo'),
    status:'planejada',progresso:0,meta:1,realizado:0,unidade:'serviço',iniciadoEm:'',concluidoEm:'',checklist:[],apontamentos:[]});
  else if(f.id==='f-os-check'){
    const o=db.os.find(x=>x.id===val(f,'osId'));
    if(o&&OS_ATIVAS.has(o.status))o.checklist.push({id:uid(),texto:val(f,'texto'),feito:false});
  }
  else if(f.id==='f-os-apontamento'){
    const o=db.os.find(x=>x.id===val(f,'osId'));
    if(o&&OS_ATIVAS.has(o.status)){
      if(o.status==='planejada'){o.status='em_execucao';o.iniciadoEm=o.iniciadoEm||new Date().toISOString();}
      o.progresso=num(f,'progresso');if(o.meta&&f.elements.realizado)o.realizado=num(f,'realizado');
      o.apontamentos.push({id:uid(),data:val(f,'data'),criadoEm:new Date().toISOString(),texto:val(f,'texto'),
        progresso:o.progresso,realizado:o.realizado,status:o.status});
    }
  }
  else if(f.id==='f-item')db.estoque.push({id:uid(),nome:val(f,'nome'),cat:val(f,'cat'),qtd:num(f,'qtd'),min:num(f,'min'),local:val(f,'local'),resp:''});
  else if(f.id==='f-emprestimo'){const it=db.estoque.find(x=>x.id===val(f,'itemId'));if(it)it.resp=val(f,'resp');}
  else if(f.id==='f-med')db.medicoes.push({id:uid(),data:val(f,'data'),talhaoId:val(f,'talhaoId'),funcId:val(f,'funcId'),
    tipo:val(f,'tipo'),medidas:num(f,'medidas'),valorMedida:num(f,'valorMedida'),acertada:false,consolidada:false});
  else if(f.id==='f-def')db.defensivos.push({id:uid(),nome:val(f,'nome'),classe:val(f,'classe'),unidade:val(f,'unidade'),
    preco:num(f,'preco'),qtd:num(f,'qtd'),min:num(f,'min'),carencia:num(f,'carencia'),reentrada:num(f,'reentrada')});
  else if(f.id==='f-rec'){
    db.receitas.push({id:uid(),nome:val(f,'nome'),cultura:val(f,'cultura'),alvo:val(f,'alvo'),
      volumeHa:num(f,'volumeHa'),itens:recItens});
    recItens=[];
  }
  else if(f.id==='f-pos')db.pulvOS.push({id:uid(),data:val(f,'data'),talhaoId:val(f,'talhaoId'),
    receitaId:val(f,'receitaId'),via:val(f,'via')||'Foliar',area:num(f,'area'),obs:val(f,'obs'),status:'aberta'});
  else if(f.id==='f-talhao')db.talhoes.push({id:uid(),nome:val(f,'nome'),cultura:val(f,'cultura'),variedade:val(f,'variedade'),area:num(f,'area')});
  else if(f.id==='f-bienal'){
    const tB=val(f,'talhaoId'),sB=val(f,'safra');
    /* uma marcação por talhão+safra: remarcar substitui em vez de duplicar */
    db.bienal=db.bienal.filter(x=>!(x.talhaoId===tB&&x.safra===sB));
    db.bienal.push({id:uid(),talhaoId:tB,safra:sB,carga:val(f,'carga'),obs:val(f,'obs')});
  }
  else if(f.id==='f-mip')db.mip.push({id:uid(),data:val(f,'data'),talhaoId:val(f,'talhaoId'),tipo:val(f,'tipo'),
    nivel:num(f,'nivel'),lat:val(f,'lat')===''?null:num(f,'lat'),lon:val(f,'lon')===''?null:num(f,'lon'),obs:val(f,'obs')});
  else if(f.id==='f-param'){db.params.litrosPorSaca=num(f,'litrosPorSaca')||480;db.params.litrosPorMedida=num(f,'litrosPorMedida')||60;db.params.litrosPorCarreta=num(f,'litrosPorCarreta')||5000;db.params.minDiesel=num(f,'minDiesel')||1000;db.params.diariaMinima=num(f,'diariaMinima')||100;db.params.mesInicioSafra=num(f,'mesInicioSafra')||10;anoFiltro='';}
  /* modo edição: o objeto recém-criado substitui o registro original, preservando flags de fluxo */
  const colE=FORM_COL[f.id];
  if(colE&&f.dataset.editId){
    const novo=db[colE].pop();
    const rec=db[colE].find(x=>x.id===f.dataset.editId);
    if(rec&&novo){delete novo.id;(STRIP_EDIT[f.id]||[]).forEach(k=>delete novo[k]);Object.assign(rec,novo);
      /* carga já paga: o título no Financeiro precisa acompanhar peso, umidade, NF e preço */
      if(colE==='cargas'){const t=db.fin.find(fx=>fx.cargaId===rec.id);
        if(t){const data=t.data;Object.assign(t,finCarga(rec));t.data=data;t.status=rec.pago?'realizado':'previsto';}}}
    else if(novo)db[colE].push(novo);
    delete f.dataset.editId;
  }
  const saved=save();render();
  showStatus(saved?(wasEditing?'Registro atualizado.':'Registro salvo.'):'O registro está apenas na memória: o navegador recusou a gravação.',{undo:saved});
});
const REF_LABELS={cafe:['colheita de café','colheitas de café'],cargas:['carga','cargas'],medicoes:['medição','medições'],
  pulvOS:['ordem de pulverização','ordens de pulverização'],regColheita:['registro de colheita','registros de colheita'],
  regAplicacao:['registro de aplicação','registros de aplicação'],lotes:['lote','lotes'],coberturas:['cobertura','coberturas'],
  solos:['análise de solo','análises de solo'],adubacoes:['adubação','adubações'],podas:['poda','podas'],
  arruacoes:['arruação','arruações'],capinas:['capina','capinas'],geoTalhoes:['polígono do mapa','polígonos do mapa'],
  mip:['ocorrência MIP','ocorrências MIP'],bienal:['marcação de bienalidade','marcações de bienalidade'],
  apont:['apontamento','apontamentos'],os:['ordem de serviço','ordens de serviço'],
  abastecimentos:['abastecimento','abastecimentos'],lembretes:['lembrete','lembretes'],receitas:['receita','receitas'],
  secagens:['secagem','secagens'],vendasCafe:['venda de café','vendas de café'],fin:['lançamento financeiro','lançamentos financeiros']};
function referencesFor(col,id){
  const rules={
    talhoes:[['cafe','talhaoId'],['cargas','talhaoId'],['medicoes','talhaoId'],['pulvOS','talhaoId'],['regColheita','talhaoId'],
      ['lotes','talhaoId'],['coberturas','talhaoId'],['solos','talhaoId'],['adubacoes','talhaoId'],['podas','talhaoId'],
      ['arruacoes','talhaoId'],['capinas','talhaoId'],['geoTalhoes','talhaoId'],['mip','talhaoId'],['bienal','talhaoId'],['os','talhaoId']],
    func:[['apont','funcId'],['medicoes','funcId'],['os','responsavelId']],
    maquinas:[['os','maqId'],['regColheita','maquinaId'],['regAplicacao','maquinaId'],['abastecimentos','maqId'],['lembretes','maqId']],
    receitas:[['pulvOS','receitaId']],pulvOS:[['fin','pulvOSId']],
    lotes:[['secagens','loteId'],['vendasCafe','loteId']]
  };
  if(col==='defensivos'){const n=db.receitas.filter(r=>(r.itens||[]).some(i=>i.prodId===id)).length;return n?[['receitas',n]]:[];}
  return (rules[col]||[]).map(([collection,key])=>[collection,db[collection].filter(x=>x[key]===id).length]).filter(x=>x[1]);
}
function deleteBlock(col,id){
  const rec=db[col]?.find(x=>x.id===id);
  if(!rec)return 'O registro não existe mais.';
  if(col==='fin'&&(rec.cargaId||rec.vendaId||rec.pulvOSId))return 'Este lançamento é gerenciado pelo módulo de origem. Altere ou exclua o registro de origem.';
  const refs=referencesFor(col,id);
  return refs.length?'Não é possível excluir enquanto estiver em uso por '+refs.map(([c,n])=>`${n} ${(REF_LABELS[c]||[c,c])[n===1?0:1]}`).join(', ')+'.':'';
}
function recordName(rec){return String(rec?.nome||rec?.codigo||rec?.titulo||rec?.desc||rec?.nf||rec?.data||'registro').slice(0,90);}

$main.addEventListener('click',async e=>{
  const b=e.target.closest('[data-action]');if(!b)return;
  const a=b.dataset.action,id=b.dataset.id;
  let changed=false,statusMessage='Alteração salva.';
  if(a==='os-tab'){
    const status=b.dataset.status;if(!['ativas','todas',...OS_STATUS].includes(status))return;
    osFiltro=status;render();return;
  }
  else if(a==='os-open'){
    if(!db.os.some(o=>o.id===id))return;osSelecionada=id;render();
    document.getElementById('os-detail-title')?.scrollIntoView({behavior:'smooth',block:'start'});return;
  }
  else if(a==='os-open-route'){
    if(!db.os.some(o=>o.id===id))return;osSelecionada=id;osFiltro='todas';location.hash='ordens';return;
  }
  else if(a==='os-edit'){
    const o=db.os.find(x=>x.id===id),f=document.getElementById('f-os-operacional');if(!o||!f)return;
    ['data','prazo','titulo','desc','modulo','categoria','tipo','prioridade','responsavelId','talhaoId','maqId','meta','unidade'].forEach(k=>{
      if(f.elements[k])f.elements[k].value=o[k]??'';
    });
    f.dataset.editId=o.id;const saveButton=document.getElementById('os-save-button'),cancelButton=document.getElementById('os-edit-cancel');
    if(saveButton)saveButton.textContent='Salvar planejamento';if(cancelButton)cancelButton.hidden=false;
    f.scrollIntoView({behavior:'smooth',block:'start'});f.elements.titulo?.focus();return;
  }
  else if(a==='os-edit-cancel'){render();return;}
  else if(a==='os-check-toggle'){
    const o=db.os.find(x=>x.id===id),item=o?.checklist?.find(x=>x.id===b.dataset.checkId);if(!o||!item||!OS_ATIVAS.has(o.status))return;
    await beginUndo('Atualização de checklist da OS');item.feito=!item.feito;changed=true;statusMessage='Checklist atualizado.';
  }
  else if(a==='os-check-del'){
    const o=db.os.find(x=>x.id===id),item=o?.checklist?.find(x=>x.id===b.dataset.checkId);if(!o||!item||!OS_ATIVAS.has(o.status))return;
    await beginUndo('Exclusão de item do checklist');o.checklist=o.checklist.filter(x=>x.id!==item.id);changed=true;statusMessage='Item removido do checklist.';
  }
  else if(a==='os-transicao'||a==='fecha-os'){
    const o=db.os.find(x=>x.id===id),next=a==='fecha-os'?'concluida':b.dataset.next;if(!o||!OS_STATUS.includes(next))return;
    const allowed={planejada:['em_execucao','cancelada'],em_execucao:['pausada','concluida','cancelada'],pausada:['em_execucao','cancelada']};
    if(!(allowed[o.status]||[]).includes(next)){showStatus('Esta mudança de status não é permitida para a ordem atual.',{timeout:0});return;}
    const pending=(o.checklist||[]).filter(x=>!x.feito).length;
    if(next==='concluida'&&!confirm(`Concluir “${recordName(o)}”?${pending?` Há ${pending} item(ns) de checklist pendente(s).`:''}`))return;
    if(next==='cancelada'&&!confirm(`Cancelar “${recordName(o)}”? O histórico permanecerá disponível.`))return;
    await beginUndo('Mudança de status da ordem de serviço');
    o.status=next;
    if(next==='em_execucao')o.iniciadoEm=o.iniciadoEm||new Date().toISOString();
    if(next==='concluida'){o.progresso=100;o.concluidoEm=new Date().toISOString();}
    const label=OS_STATUS_INFO[next].label;
    o.apontamentos.push({id:uid(),data:hoje,criadoEm:new Date().toISOString(),texto:`Status alterado para ${label.toLowerCase()}.`,
      progresso:o.progresso,realizado:o.realizado,status:next});
    changed=true;statusMessage=`Ordem marcada como ${label.toLowerCase()}.`;
  }
  else if(a==='del'){
    const col=b.dataset.col,block=deleteBlock(col,id);if(block){showStatus(block,{timeout:0});return;}
    const alvo=db[col].find(x=>x.id===id);
    if(!confirm(`Excluir permanentemente “${recordName(alvo)}”? Você poderá desfazer logo após a exclusão.`))return;
    await beginUndo('Exclusão de registro',col==='documentos'?[id]:[]);
    if(col==='documentos'){try{await fileDel(id);}catch(err){showStatus('Não foi possível excluir o arquivo; nenhum dado foi removido.',{timeout:0});return;}}
    db[col]=db[col].filter(x=>x.id!==id);
    if(col==='secagens'&&alvo){const lt=db.lotes.find(l=>l.id===alvo.loteId);if(lt&&lt.status==='secando')lt.status='terreiro';}
    if(col==='vendasCafe')db.fin=db.fin.filter(fx=>fx.vendaId!==id);
    if(col==='cargas')db.fin=db.fin.filter(fx=>fx.cargaId!==id);
    if(col==='os'&&osSelecionada===id)osSelecionada='';
    changed=true;statusMessage='Registro excluído.';
  }
  else if(a==='ver-doc'){await docVer(id);return;}
  else if(a==='baixar-doc'){await docBaixar(id);return;}
  else if(a==='fecha-doc'){docFechar();return;}
  else if(a==='save-dt'){
    const g=i=>{const el=document.getElementById(i);return el?Number(el.value):NaN;};
    const T=g('dt-t'),rh=g('dt-rh'),w=g('dt-w');
    if(!Number.isFinite(T)||T< -20||T>60||!Number.isFinite(rh)||rh<1||rh>100||!Number.isFinite(w)||w<0||w>100){
      showStatus('Revise os dados: temperatura entre −20 e 60 °C, umidade entre 1% e 100% e vento entre 0 e 100 km/h.',{timeout:0});return;
    }
    await beginUndo('Registro de condição climática');
    db.leiturasDT.push({id:uid(),data:hoje,temp:T,rh,vento:w,dt:+(T-calcWetBulb(T,rh)).toFixed(1)});
    changed=true;statusMessage='Condição climática registrada.';
  }
  else if(a==='edit'){
    const col=b.dataset.col,fid=b.dataset.form;
    if(col==='fin'){
      const linked=db.fin.find(x=>x.id===id);if(linked&&(linked.cargaId||linked.vendaId||linked.pulvOSId)){showStatus('Este lançamento é atualizado pelo registro de origem.',{timeout:0});return;}
    }
    const rec=db[col]?.find(x=>x.id===id),fEd=document.getElementById(fid);
    if(rec&&fEd){
      [...fEd.elements].forEach(el=>{
        if(!el.name)return;
        if(el.type==='checkbox'){el.checked=!!rec[el.name];return;}
        const v=rec[el.name];if(v!==undefined&&v!==null)el.value=v;
      });
      if(fid==='f-cafe'){
        if(fEd.elements.unidade)fEd.elements.unidade.value='litro';
        if(fEd.elements.qtd)fEd.elements.qtd.value=rec.litros;
        const hl=document.getElementById('lbl-horas');if(hl)hl.style.display=rec.tipo==='Mecanizada'?'':'none';
      }
      fEd.dataset.editId=id;const bt=fEd.querySelector('button');if(bt)bt.textContent='Salvar edição';
      fEd.scrollIntoView({behavior:'smooth',block:'center'});
    }
    return;
  }
  else if(a==='fim-sec'){
    const s=db.secagens.find(x=>x.id===id);if(!s||!s.leituras.length)return;
    const ult=s.leituras[s.leituras.length-1];
    if(!confirm(`Finalizar a secagem com ${N(ult.u,1)}% de umidade após ${N(ult.h)} horas?`))return;
    await beginUndo('Finalização de secagem');
    s.umidadeSaida=ult.u;s.horas=ult.h;s.status='concluida';
    const lt=db.lotes.find(x=>x.id===s.loteId);if(lt)lt.status='seco';
    changed=true;statusMessage='Secagem finalizada.';
  }
  else if(a==='lembrete-ok'){
    const l=db.lembretes.find(x=>x.id===id);if(!l||l.feito)return;
    await beginUndo('Conclusão de lembrete');l.feito=true;changed=true;statusMessage='Lembrete marcado como concluído.';
  }
  else if(a==='pago'){
    const c=db.cargas.find(x=>x.id===id);if(!c)return;
    const calc=cargaCalc(c),verb=c.pago?'reabrir':'marcar como recebida';
    if(!confirm(`Deseja ${verb} a carga NF ${c.nf||'s/nº'} no valor de ${BRL2(calc.valor)}?`))return;
    await beginUndo('Alteração de pagamento de carga');c.pago=!c.pago;
    const linked=db.fin.find(fx=>fx.cargaId===c.id);
    if(linked){const data=linked.data;Object.assign(linked,finCarga(c));linked.data=c.pago?hoje:data;linked.status=c.pago?'realizado':'previsto';}
    else db.fin.push(Object.assign({id:uid(),data:c.pago?hoje:c.data},finCarga(c),{status:c.pago?'realizado':'previsto'}));
    changed=true;statusMessage=c.pago?'Carga recebida e financeiro atualizado.':'Recebimento reaberto como título previsto.';
  }
  else if(a==='baixa'){
    const x=db.fin.find(x2=>x2.id===id);if(!x||x.status==='realizado')return;
    if(!confirm(`Dar baixa em “${recordName(x)}” no valor de ${BRL2(x.valor)}?`))return;
    await beginUndo('Baixa financeira');x.status='realizado';changed=true;statusMessage='Baixa financeira concluída.';
  }
  else if(a==='mov'){
    const i=db.estoque.find(x=>x.id===id),delta=Number(b.dataset.d);if(!i||!Number.isFinite(delta)||!delta)return;
    await beginUndo('Movimentação de estoque');i.qtd=Math.max(0,i.qtd+delta);changed=true;statusMessage='Estoque atualizado.';
  }
  else if(a==='devolver'){
    const i=db.estoque.find(x=>x.id===id);if(!i||!i.resp)return;
    await beginUndo('Devolução de item');i.resp='';changed=true;statusMessage='Item devolvido ao estoque.';
  }
  else if(a==='acerto'){
    const pend=db.medicoes.filter(m=>!m.acertada),ac=calcAcerto();
    const tot=Object.values(ac).reduce((s,x)=>s+x.total,0),compl=Object.values(ac).reduce((s,x)=>s+x.compl,0);
    if(!(tot>0)){showStatus('Não há medições pendentes para acertar.');return;}
    if(!confirm(`Gerar um lançamento financeiro previsto de ${BRL2(tot)} e marcar ${pend.length} medição(ões) como acertadas?`))return;
    await beginUndo('Acerto da turma de colheita');
    db.fin.push({id:uid(),data:hoje,tipo:'saida',categoria:'Acerto de colheita (turma)',centro:'Cafe',
      desc:'Acerto turma — '+N(pend.reduce((s,m)=>s+m.medidas,0),1)+' medidas'+(compl?' (inclui '+BRL2(compl)+' de piso da diária)':''),
      valor:tot,status:'previsto'});pend.forEach(m=>m.acertada=true);
    changed=true;statusMessage='Acerto gerado no financeiro.';
  }
  else if(a==='recibo'){reciboAcerto(id);return;}
  else if(a==='caderno'){cadernoCampo(id);return;}
  else if(a==='consolida'){
    const pend=db.medicoes.filter(m=>!m.consolidada);if(!pend.length){showStatus('Não há medições pendentes para consolidar.');return;}
    if(!confirm(`Consolidar ${pend.length} medição(ões) no volume colhido de café?`))return;
    await beginUndo('Consolidação de medições');const g={};
    pend.forEach(m=>{const k=m.data+'|'+m.talhaoId+'|'+m.tipo;(g[k]=g[k]||[]).push(m);});
    Object.values(g).forEach(ms=>{
      db.cafe.push({id:uid(),data:ms[0].data,talhaoId:ms[0].talhaoId,tipo:ms[0].tipo,
        litros:ms.reduce((s,m)=>s+m.medidas,0)*db.params.litrosPorMedida,
        colhedores:new Set(ms.map(m=>m.funcId)).size,valorMedida:ms[0].valorMedida});
      ms.forEach(m=>m.consolidada=true);
    });
    changed=true;statusMessage='Medições consolidadas na colheita.';
  }
  else if(a==='add-rec-item'){
    const prod=document.getElementById('rec-prod'),dose=document.getElementById('rec-dose'),dv=Number(dose?.value);
    if(prod?.value&&Number.isFinite(dv)&&dv>0){recItens.push({prodId:prod.value,dose:dv});dose.value='';
      const l=document.getElementById('rec-list');if(l)l.innerHTML=recListHTML();}
    else showStatus('Selecione um produto e informe uma dose maior que zero.');
    return;
  }
  else if(a==='del-rec-item'){
    recItens.splice(+b.dataset.idx,1);const l=document.getElementById('rec-list');if(l)l.innerHTML=recListHTML();return;
  }
  else if(a==='mov-def'){
    const d=db.defensivos.find(x=>x.id===id),delta=Number(b.dataset.d);if(!d||!Number.isFinite(delta)||!delta)return;
    await beginUndo('Movimentação de defensivo');d.qtd=Math.max(0,d.qtd+delta);changed=true;statusMessage='Estoque de defensivo atualizado.';
  }
  else if(a==='concluir-pos'){
    const o=db.pulvOS.find(x=>x.id===id);if(!o||o.status==='concluida')return;
    const r=db.receitas.find(x=>x.id===o.receitaId),msg=document.getElementById('pulv-msg');
    if(!r){if(msg)msg.innerHTML='<span class="pill crit">Receita da ordem não existe mais.</span>';return;}
    const falta=(r.itens||[]).map(i=>{const p=db.defensivos.find(d=>d.id===i.prodId);return {p,need:i.dose*o.area};}).filter(x=>!x.p||x.p.qtd<x.need);
    if(falta.length){
      if(msg)msg.innerHTML='<span class="pill crit">Estoque insuficiente: '+falta.map(x=>x.p?esc(x.p.nome)+' (precisa '+N(x.need,1)+' '+esc(x.p.unidade)+', tem '+N(x.p.qtd,1)+')':'produto excluído').join('; ')+'</span>';return;
    }
    const custo=custoReceitaHa(r)*o.area;
    if(!confirm(`Concluir a aplicação em ${N(o.area,1)} ha? Serão baixados os defensivos e lançado o custo de ${BRL2(custo)}.`))return;
    await beginUndo('Conclusão de aplicação');
    (r.itens||[]).forEach(i=>{const p=db.defensivos.find(d=>d.id===i.prodId);p.qtd-=i.dose*o.area;});
    const cult=(tal(o.talhaoId).cultura||'cafe');
    db.fin.push({id:uid(),data:hoje,tipo:'saida',categoria:'Defensivos',centro:cult==='cafe'?'Cafe':cult[0].toUpperCase()+cult.slice(1),
      desc:'Aplicação: '+r.nome+' — '+tal(o.talhaoId).nome+' ('+N(o.area,1)+' ha)',valor:custo,status:'realizado',pulvOSId:o.id});
    o.status='concluida';changed=true;statusMessage='Aplicação concluída; estoque e financeiro atualizados.';
  }
  else if(a==='export'){await exportBackupCompleto();return;}
  else if(a==='restore-backup'){
    if(!confirm('Restaurar o último ponto de recuperação? Os dados atuais serão substituídos, mas esta ação poderá ser desfeita logo após.'))return;
    try{
      const current=JSON.stringify(db);restoreRecovery({preserveUndo:true});
      undoState={label:'Restauração do ponto de recuperação',db:current,files:[]};
      showStatus('Ponto de recuperação restaurado.',{undo:true});
    }catch(err){showStatus('Falha ao restaurar: '+err.message,{timeout:0});}
    return;
  }
  else if(a==='reset'){
    if(!confirm('Restaurar os dados de exemplo? Todos os registros atuais serão substituídos. Um ponto de recuperação será criado antes.'))return;
    await beginUndo('Restauração dos dados de exemplo');db=seed();anoFiltro=safraDe(hoje);
    changed=true;statusMessage='Dados de exemplo restaurados.';
  }
  else if(a==='interpretar-texto'){
    const ta=document.getElementById('voz-txt');vozItens=(ta?ta.value:'').split('\n').map(l=>l.trim()).filter(Boolean).map(parseLinha);render();return;
  }
  else if(a==='limpar-texto'){vozItens=[];render();return;}
  else if(a==='confirmar-voz'){
    const ix=+b.dataset.idx,it=vozItens[ix];if(!it||!it.tipo)return;
    const formEl=document.querySelector('[data-voz-form="'+ix+'"]');
    const get=n=>formEl?.querySelector('[data-vf="'+n+'"]')?.value||'';
    let draft;
    if(it.tipo==='abastecimento'){
      const maqId=get('maqId'),m=db.maquinas.find(x=>x.id===maqId),litros=Number(get('litros')),horimetro=Number(get('horimetro'));
      if(!m||!(litros>0)||!Number.isFinite(horimetro)||horimetro<m.horimetro){showStatus(`Revise máquina, litros e horímetro. O horímetro não pode ser menor que ${N(m?.horimetro||0)} h.`,{timeout:0});return;}
      draft={collection:'abastecimentos',record:{id:uid(),data:hoje,maqId,litros,horimetro,obs:'via texto'},machine:m};
    } else if(it.tipo==='chuva'){
      const mm=Number(get('mm'));if(!(mm>0)){showStatus('A chuva precisa ser maior que zero.',{timeout:0});return;}
      draft={collection:'chuvas',record:{id:uid(),data:hoje,mm,obs:'via texto'}};
    } else if(it.tipo==='colheita'){
      const talhaoId=get('talhaoId'),tipoColheita=get('tipoColheita'),carretas=Number(get('carretas'));
      if(!db.talhoes.some(t=>t.id===talhaoId)||!(carretas>0)){showStatus('Selecione o talhão e informe uma quantidade de carretas maior que zero.',{timeout:0});return;}
      draft={collection:'cafe',record:{id:uid(),data:hoje,talhaoId,tipo:tipoColheita,litros:carretas*db.params.litrosPorCarreta,colhedores:0,valorMedida:9,horas:0}};
    } else if(it.tipo==='diesel'){
      const litros=Number(get('litros')),valor=Number(get('valor'));if(!(litros>0)||!(valor>0)){showStatus('Litros e valor da compra de diesel precisam ser maiores que zero.',{timeout:0});return;}
      draft={collection:'combCompras',record:{id:uid(),data:hoje,litros,valor,obs:'via texto'}};
    }
    if(!draft)return;
    await beginUndo('Lançamento por texto');db[draft.collection].push(draft.record);
    if(draft.machine&&draft.record.horimetro>draft.machine.horimetro)draft.machine.horimetro=draft.record.horimetro;
    it.status='salvo';const saved=save();render();showStatus(saved?'Lançamento por texto salvo.':'O lançamento está apenas na memória: o navegador recusou a gravação.',{undo:saved});return;
  }
  else if(a==='confirmar-mapa'){
    if(!mapaPreview?.length)return;
    document.querySelectorAll('.mapa-tal-sel').forEach(sel=>{const i=+sel.dataset.idx;if(mapaPreview[i])mapaPreview[i].talhaoId=sel.value;});
    if(!confirm(`Importar ${mapaPreview.length} polígono(s), substituindo mapas anteriores dos talhões vinculados?`))return;
    await beginUndo('Importação de mapa');
    mapaPreview.forEach(p=>{
      if(p.talhaoId)db.geoTalhoes=db.geoTalhoes.filter(g=>g.talhaoId!==p.talhaoId);
      else db.geoTalhoes=db.geoTalhoes.filter(g=>g.talhaoId||g.nome!==p.nome);
      const t=db.talhoes.find(x=>x.id===p.talhaoId);
      db.geoTalhoes.push({id:uid(),talhaoId:p.talhaoId,nome:p.nome,cultura:t?t.cultura:'',coords:p.coords,areaHa:p.areaHa,origem:'import'});
    });
    mapaPreview=null;mapaErro='';changed=true;statusMessage='Mapa importado.';
  }
  else if(a==='cancelar-mapa'){mapaPreview=null;mapaErro='';render();return;}
  else if(a==='exportar-kml'){exportarKML();return;}
  else if(a==='ficha-talhao-mapa'){if(id){talhaoSel=id;location.hash='talhao';}return;}
  else return;
  if(changed){const saved=save();render();showStatus(saved?statusMessage:'A alteração está apenas na memória: o navegador recusou a gravação.',{undo:saved});}
});

/* visor de documentos (fora do #main) */
document.getElementById('docview').addEventListener('click',e=>{
  if(e.target.closest('[data-action="fecha-doc"]')||e.target.id==='docview')
    docFechar();
});
document.addEventListener('keydown',e=>{
  const view=document.getElementById('docview');if(!view.classList.contains('on'))return;
  if(e.key==='Escape'){e.preventDefault();docFechar();return;}
  if(e.key!=='Tab')return;
  const focusable=[...view.querySelectorAll('button,[href],iframe,[tabindex]:not([tabindex="-1"])')].filter(el=>!el.disabled);
  if(!focusable.length)return;
  const first=focusable[0],last=focusable[focusable.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
});

/* outra aba salvou: recarrega o db para esta aba não sobrescrever com dados velhos.
   (o evento 'storage' só dispara nas OUTRAS abas, nunca na que gravou) */
window.addEventListener('storage',e=>{
  if(e.key===LS&&e.newValue){
    try{db=normalizeDatabase(JSON.parse(e.newValue));render();showStatus('Dados atualizados por outra aba.');}
    catch(err){showStatus('Outra aba tentou gravar dados inválidos; esta cópia foi preservada.',{timeout:0});}
  }
});

/* tooltip */
const tip=document.getElementById('tip');
document.addEventListener('mousemove',e=>{
  const t=e.target.closest?e.target.closest('[data-tip]'):null;
  if(t){tip.textContent=t.dataset.tip;tip.style.opacity=1;
    tip.style.left=Math.min(e.clientX+12,innerWidth-270)+'px';tip.style.top=(e.clientY+14)+'px';}
  else tip.style.opacity=0;
});

if(!location.hash)history.replaceState(null,'','#dash');
render();
