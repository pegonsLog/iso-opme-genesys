/**
 * Importa os colaboradores do "Levantamento cargo" para a collection
 * `colaboradores` no Firestore.
 *
 * - Datas convertidas de mm/dd/yy (planilha) para dd/mm/yyyy.
 * - Títulos/cabeçalhos (INOMEDICAL, PJ, O3M, linhas de cabeçalho) ignorados.
 * - Idempotente por nome: não recria quem já existe.
 *
 * Uso: node scripts/import-colaboradores.mjs
 */
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
} from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDT_ZCKzSAyH3t66qL4K0GTXJmEh4eKtMc',
  authDomain: 'iso-opme-genesys.firebaseapp.com',
  projectId: 'iso-opme-genesys',
  storageBucket: 'iso-opme-genesys.firebasestorage.app',
  messagingSenderId: '226306293483',
  appId: '1:226306293483:web:487f151c9b051b825a88ae',
};

const SEED_EMAIL = process.env.SEED_EMAIL || 'admin@isoopme.com';
const SEED_SENHA = process.env.SEED_SENHA || 'OpmeRh2026!';

/** Converte "m/d/yy" (planilha, formato US) para "dd/mm/yyyy". */
function paraDataBR(us) {
  if (!us || !us.trim()) return '';
  const m = us.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!m) return '';
  let [, mes, dia, ano] = m;
  let a = parseInt(ano, 10);
  if (ano.length <= 2) {
    // 00–26 => 20xx ; 27–99 => 19xx
    a = a <= 26 ? 2000 + a : 1900 + a;
  }
  const dd = String(parseInt(dia, 10)).padStart(2, '0');
  const mm = String(parseInt(mes, 10)).padStart(2, '0');
  return `${dd}/${mm}/${a}`;
}

/** Normaliza espaços extras de nomes/textos. */
function limpa(s) {
  return (s ?? '').replace(/\s+/g, ' ').trim();
}

// Dados da planilha: [centroCusto, setor, nome, dataNasc(us), dataAdm(us), cargo].
const LINHAS = [
  ['1010', 'DIRETORIA', 'GIL JEFFERSON LOPES', '5/25/84', '7/1/15', 'DIRETOR DE NOVOS PRODUTOS'],
  ['1010', 'DIRETORIA', 'MARCO FACCHETTI', '8/28/78', '7/1/15', 'DIRETOR DE NOVOS PRODUTOS'],
  ['1010', 'DIRETORIA', 'LEANDRO FERREIRA LIMA', '4/18/95', '3/1/18', 'GERENTE GERAL'],
  ['1013', 'COMERCIAL', 'CARLA FERNANDA SOUZA S. GOMES', '7/30/86', '1/11/23', 'ANALISTA COMERCIAL'],
  ['1013', 'COMERCIAL', 'BRUNO BATISTA FERREIRA DE LIMA', '12/8/90', '7/2/24', 'LÍDER COMERCIAL'],
  ['1014', 'FINANCEIRO', 'MARCIO AUGUSTO FRESNEDA', '7/24/73', '1/13/20', 'COORDENADOR ADMINISTRATIVO FINANCEIRO'],
  ['1019', 'LOGISTICA', 'ANDERSON ANDRADE DE JESUS', '12/30/82', '1/2/17', 'LIDER LOGISTICA'],
  ['1019', 'LOGISTICA', 'BENILDO JOSE DA SILVA', '2/19/76', '4/9/18', 'ANALISTA DE LOGISTICA'],
  ['1019', 'LOGISTICA', 'WILLY MONTEIRO SILVA', '7/23/89', '9/4/19', 'AUXILIAR DE LOGISTICA'],
  ['1019', 'LOGISTICA', 'RAY AMORIM DA SILVA', '4/25/89', '7/6/20', 'ANALISTA DE LOGISTICA'],
  ['1019', 'LOGISTICA', 'DAVID MARCIEL S. DE OLIVEIRA', '8/8/88', '10/15/20', 'AUXILIAR DE LOGISTICA'],
  ['1019', 'LOGISTICA', 'GENILSON DE OLIVEIRA DA SILVA', '12/3/70', '5/17/21', 'ASSISTENTE DE LOGISTICA'],
  ['1019', 'LOGISTICA', 'FABIO DE SOUZA', '3/23/79', '8/23/21', 'AUXILIAR DE LOGISTICA'],
  ['1019', 'LOGISTICA', 'MARCELO DA SILVA ANDRADE', '11/26/86', '7/4/22', 'AUXILIAR DE LOGISTICA'],
  ['1019', 'LOGISTICA', 'DARIO GONÇALVES DANTAS', '3/19/99', '4/3/23', 'AUXILIAR DE LOGISTICA'],
  ['1020', 'INSTRUMENTAÇÃO', 'IVONETE RAMIRES CARDOSO', '9/17/70', '12/7/17', 'INSTRUMENTADOR'],
  ['1026', 'RH', 'BARBARA ALVES ROCHA', '2/10/02', '9/16/24', 'ASSISTENTE DE RH/DP'],
  ['1028', 'ADMINISTRATIVO', 'BIANCA MENEZES', '6/18/97', '2/20/25', 'SECRETÁRIA'],
  ['1018', 'QUALIDADE', 'LUANA OLIVEIRA SILVA', '5/28/01', '9/6/24', 'RESPONSÁVEL TÉCNICO'],
  ['1013', 'COMERCIAL', 'VIVIANE MORATELLI', '8/25/92', '7/21/25', 'ANALISTA COMERCIAL'],
  ['1013', 'COMERCIAL', 'GLEYSON SILVA SANTOS', '1/15/00', '6/11/25', 'ANALISTA COMERCIAL'],
  ['1013', 'COMERCIAL', 'CHARLENE ALMEIDA', '5/4/88', '10/1/24', 'ASSISTENTE COMERCIAL'],
  ['1013', 'COMERCIAL', 'RAFAELA OLIVEIRA', '9/18/95', '10/1/24', 'ANALISTA COMERCIAL'],
  ['1019', 'LOGISTICA', 'EVERTON MATOS JESUS', '7/5/86', '1/8/26', 'AUXILIAR DE LOGISTICA'],
  ['1019', 'LOGISTICA', 'RENAN RIGOLIN', '11/11/98', '4/6/26', 'AUXILIAR DE LOGISTICA'],
  // --- PJ ---
  ['1013', 'COMERCIAL', 'SARAH SIMPLICIO FONTES', '1/18/88', '9/1/23', 'COORDENADOR COMERCIAL'],
  ['1013', 'COMERCIAL', 'RICARDO MAXIMO GRECCO', '7/18/86', '6/1/23', 'REPRESENTANTE DE VENDAS'],
  ['1013', 'COMERCIAL', 'SIMONE ALCIDES CAON', '12/5/80', '6/1/23', 'REPRESENTANTE DE VENDAS'],
  ['1013', 'COMERCIAL', 'DIEGO SOUZA REIS', '6/3/96', '9/20/19', 'REPRESENTANTE DE VENDAS'],
  ['1013', 'COMERCIAL', 'ANDREIA MARIA MALVEIRA DA SILVA', '6/15/75', '6/1/23', 'REPRESENTANTE DE VENDAS'],
  ['1013', 'COMERCIAL', 'CESAR AUGUSTO PARLUTO', '4/29/74', '2/6/23', 'REPRESENTANTE DE VENDAS'],
  ['1013', 'COMERCIAL', 'JONICA FIDALGO DUARTE GRECCO', '12/20/85', '10/16/23', 'GERENTE DE PRODUTOS'],
  ['1020', 'INSTRUMENTAÇÃO', 'JULIANA APARECIDA DA SILVA MOREIRA', '9/19/93', '1/1/22', 'INSTRUMENTADOR'],
  ['1020', 'INSTRUMENTAÇÃO', 'ADELINA CABRAIL FRIZADO', '10/23/23', '10/1/21', 'INSTRUMENTADOR'],
  ['1020', 'INSTRUMENTAÇÃO', 'PRISCILA FERREIRA DE ARAUJO', '9/1/85', '3/28/23', 'INSTRUMENTADOR'],
  ['1020', 'INSTRUMENTAÇÃO', 'CAROLINE ROBIN LIMA COSTA', '3/9/85', '12/26/23', 'INSTRUMENTADOR'],
  ['1020', 'INSTRUMENTAÇÃO', 'FABIANA NUNES TESSER SANTOS', '4/1/87', '3/5/25', 'INSTRUMENTADOR'],
  ['1020', 'INSTRUMENTAÇÃO', 'LEONARDO TESS', '9/5/81', '11/13/24', 'TÉCNICO DE NEUROMODULAÇÃO'],
  ['1013', 'VENDAS', 'CLEBER ALVARENGA', '12/21/97', '11/18/24', 'REPRESENTANTE DE VENDAS'],
  ['1013', 'VENDAS', 'PRISCILA LIMA', '7/31/87', '5/19/25', 'REPRESENTANTE DE VENDAS'],
  ['1020', 'INSTRUMENTAÇÃO', 'KARINA CECATO', '1/18/83', '8/25/25', 'INSTRUMENTADOR'],
  ['1013', 'VENDAS', 'PHILL FERREIRA', '4/7/69', '1/5/26', 'REPRESENTANTE DE VENDAS'],
  ['1013', 'VENDAS', 'RAFAEL GIMENES', '12/13/78', '1/5/26', 'REPRESENTANTE DE VENDAS'],
  ['1013', 'VENDAS', 'THIAGO ANTUNES SACCARDO', '7/25/83', '1/29/26', 'REPRESENTANTE DE VENDAS'],
  ['1020', 'INSTRUMENTAÇÃO', 'JACQUELINE CALVALCANTI GRANADO', '9/25/97', '1/8/26', 'TÉCNICO DE NEUROMODULAÇÃO'],
  ['1020', 'INSTRUMENTAÇÃO', 'SABRINA DE REZENDE FROTA PIRES', '11/9/77', '1/8/26', 'LIDER INSTRUMENTAÇÃO'],
  ['1020', 'INSTRUMENTAÇÃO', 'PAMELA FERREIRA', '9/11/99', '3/2/26', 'TÉCNICO DE NEUROMODULAÇÃO'],
  ['1020', 'INSTRUMENTAÇÃO', 'CARLOS DANIEL', '1/3/01', '1/2/26', 'INSTRUMENTADOR'],
  // --- (segundo bloco) ---
  ['1010', 'DIRETORIA', 'CRISTIAN ANTONIO DO COUTO', '2/20/76', '', 'CEO'],
  ['1026', 'RH', 'LEONARDO DA COSTA RODRIGUES', '6/11/94', '2/18/26', 'ASSISTENTE DE RH/DP'],
  ['1019', 'OPERAÇÕES', 'CAIKE NAKAMURA FARIAS', '5/20/99', '4/13/26', 'AUXILIAR DE OPERAÇÕES'],
  ['1014', 'FINANCEIRO', 'GEOVANA BEATRIZ OLIVEIRA MATOS', '8/4/06', '2/1/24', 'ASSISTENTE FINANCEIRO'],
  ['1016', 'TI', 'THAMIRYS PERPÉTUO TAVARES DA SILVA', '6/6/06', '1/24/23', 'ASSISTENTE DE TI'],
  ['1017', 'MARKETING', 'JOAO BRENO DE MOURA JACOMINO', '5/15/02', '7/13/22', 'ASSISTENTE DE MARKETING'],
  ['1018', 'QUALIDADE', 'PATRICIA FERNANDES DA SILVA', '4/7/88', '9/1/15', 'ANALISTA DE ASSUNTOS REGULATÓRIOS'],
  ['1018', 'QUALIDADE', 'EMANUELLI COSTA SILVA', '8/30/00', '8/12/24', 'RESPONSÁVEL TÉCNICO'],
  ['1019', 'LOGISTICA', 'DOUGLAS COSTA DA SILVA', '6/12/89', '11/7/22', 'LIDER DE OPERAÇÕES'],
  ['1019', 'LOGISTICA', 'BRUNO FERREIRA DOS SANTOS', '10/13/96', '6/12/24', 'ASSISTENTE DE OPERAÇÕES'],
  ['1019', 'LOGISTICA', 'HENRIQUE DE OLIVEIRA DIAS', '3/15/99', '8/4/25', 'AUXILIAR DE OPERAÇÕES'],
  ['1025', 'FISCAL', 'CAMMILA KETHELY PENA IUNG', '10/28/99', '5/16/23', 'ASSISTENTE FISCAL'],
  ['1013', 'COMERCIAL', 'CAROLINE CARVALHO DE OLIVEIRA', '5/9/97', '7/1/24', 'ASSISTENTE COMERCIAL'],
  ['1028', 'ADMINISTRATIVO', 'ELEN CRISTINA DA CONCEIÇÃO FARIAS', '8/1/83', '6/4/25', 'ASSISTENTE ADMINISTRATIVO'],
  ['1016', 'TI', 'VICTOR ARAUJO VITAL', '6/20/03', '1/7/26', 'ESTAGIÁRIO TI'],
  // --- PJ (segundo bloco) ---
  ['1013', 'COMERCIAL', 'JULIANA DE SOUZA NOVAES', '4/16/85', '', 'REPRESENTANTE DE VENDAS'],
  ['1013', 'COMERCIAL', 'GLEICE RODRIGUES DE OLIVEIRA', '12/16/83', '', 'GERENTE COMERCIAL'],
  ['1013', 'COMERCIAL', 'IVAN RAPHAEL MILANEZ', '12/16/85', '7/1/21', 'REPRESENTANTE DE VENDAS'],
  ['1013', 'COMERCIAL', 'CAROLINE MANZOTI', '6/9/94', '5/6/25', 'COORDENADOR COMERCIAL'],
  ['1016', 'TI', 'WILLIAM SANTIAGO MENDES', '1/27/94', '1/1/22', 'CONTROLLER'],
  ['1019', 'OPERAÇÕES', 'DAVID NUNES', '12/28/97', '', 'COORDENADOR DE OPERAÇÕES'],
  ['1023', 'PRODUTOS', 'MICHELLE MARTINS', '12/27/82', '', 'TÉCNICA DE PRODUTOS'],
  ['1023', 'PRODUTOS', 'JAMILE REDRADO DE OLIVEIRA', '12/13/76', '', 'TÉCNICA DE PRODUTOS'],
  ['1027', 'PROJETOS', 'LUCIANA TEIXEIRA', '7/1/91', '5/5/25', 'COORDENADOR DE PROJETOS E PE'],
  ['1025', 'FISCAL', 'CESAR HENRIQUE DA SILVA', '1/10/80', '2/6/19', 'ANALISTA FISCAL'],
  ['1030', 'RAFAELO', 'VOLNER ROGERIO NOGUEIRA DE ALBUQUERQUE VIEIRA', '9/5/80', '2/18/26', 'REPRESENTANTE DE VENDAS'],
  ['1017', 'MARKETING', 'THIAGO HESKETH NOBREGA PEREIRA', '6/9/82', '2/18/26', 'COORDENADOR DE MARKETING'],
  // --- O3M ---
  ['1014', 'FINANCEIRO', 'BIANCA COSTA', '6/6/99', '2/5/25', 'ASSISTENTE FINANCEIRO'],
  ['1018', 'QUALIDADE', 'LUIZA MARTIGLI', '3/24/99', '5/14/25', 'RESPONSÁVEL TÉCNICO'],
  // --- O3M PJ ---
  ['1019', 'LOGISTICA', 'CLEMILSON TAVARES DA SILVA', '12/20/81', '7/11/11', 'COORDENADOR DE LOGISTICA'],
  ['1020', 'INSTRUMENTAÇÃO', 'EVERALDO FERNANDES CELESTRINI', '9/8/80', '10/20/15', 'ANALISTA DE PRODUTOS'],
];

function slugId(nome, i) {
  const base = nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `colab-${base}-${i}`;
}

async function main() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  await signInWithEmailAndPassword(getAuth(app), SEED_EMAIL, SEED_SENHA);

  // Índice de nomes já existentes (evita duplicar).
  const existentes = await getDocs(collection(db, 'colaboradores'));
  const nomesExistentes = new Set();
  existentes.forEach((d) => {
    const n = d.data().nome;
    if (n) nomesExistentes.add(limpa(n).toUpperCase());
  });

  let criados = 0;
  let pulados = 0;
  let i = 0;
  for (const [centroCusto, setor, nomeRaw, nasc, adm, cargo] of LINHAS) {
    i++;
    const nome = limpa(nomeRaw);
    if (nomesExistentes.has(nome.toUpperCase())) {
      pulados++;
      continue;
    }
    const colaborador = {
      nome,
      cargoId: '',
      cargoNome: limpa(cargo),
      centroCusto: limpa(centroCusto),
      setor: limpa(setor),
      dataNascimento: paraDataBR(nasc),
      dataAdmissao: paraDataBR(adm),
      integracaoConcluida: false,
      ativo: true,
    };
    const id = slugId(nome, i);
    await setDoc(doc(db, 'colaboradores', id), colaborador);
    criados++;
    console.log(`+ ${nome} | ${colaborador.centroCusto} ${colaborador.setor} | nasc ${colaborador.dataNascimento} | adm ${colaborador.dataAdmissao || '—'} | ${colaborador.cargoNome}`);
  }

  console.log(`\nConcluído: ${criados} criado(s), ${pulados} já existente(s). Total na planilha: ${LINHAS.length}.`);
  process.exit(0);
}

main().catch((e) => {
  console.error('Falha na importação:', e);
  process.exit(1);
});
