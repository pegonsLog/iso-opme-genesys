/**
 * Semeia o Firestore com os dados base do app (Matriz de Treinamento e
 * cargos de exemplo). Idempotente: usa o id do modelo como id do documento,
 * então rodar de novo apenas sobrescreve.
 *
 * Uso: node scripts/seed-firestore.mjs
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDT_ZCKzSAyH3t66qL4K0GTXJmEh4eKtMc',
  authDomain: 'iso-opme-genesys.firebaseapp.com',
  projectId: 'iso-opme-genesys',
  storageBucket: 'iso-opme-genesys.firebasestorage.app',
  messagingSenderId: '226306293483',
  appId: '1:226306293483:web:487f151c9b051b825a88ae',
};

// Credenciais usadas apenas para autenticar a escrita do seed.
// Sobrescreva via variáveis de ambiente se desejar.
const SEED_EMAIL = process.env.SEED_EMAIL || 'admin@isoopme.com';
const SEED_SENHA = process.env.SEED_SENHA || 'OpmeRh2026!';

const TREINAMENTOS = [
  { id: 'trein-integracao', nome: 'Integração Institucional', tipo: 'Integração', periodicidade: 'Admissional', responsavel: 'RH', evidencia: 'Lista de presença', criterioEficacia: 'Participação', cargosAplicaveis: [] },
  { id: 'trein-politica-qualidade', nome: 'Política da Qualidade', tipo: 'SGQ', periodicidade: 'Anual', responsavel: 'Qualidade', evidencia: 'Lista + prova', criterioEficacia: '≥70%', cargosAplicaveis: [] },
  { id: 'trein-iso13485', nome: 'ISO 13485', tipo: 'SGQ', periodicidade: 'Anual', responsavel: 'Qualidade', evidencia: 'Certificado', criterioEficacia: '≥70%', cargosAplicaveis: [] },
  { id: 'trein-lgpd', nome: 'LGPD', tipo: 'Compliance', periodicidade: 'Anual', responsavel: 'RH/Jurídico', evidencia: 'Certificado', criterioEficacia: 'Participação', cargosAplicaveis: [] },
  { id: 'trein-codigo-etica', nome: 'Código de Ética', tipo: 'Compliance', periodicidade: 'Anual', responsavel: 'RH', evidencia: 'Termo assinado', criterioEficacia: 'Participação', cargosAplicaveis: [] },
  { id: 'trein-compliance-hosp', nome: 'Compliance Hospitalar', tipo: 'Regulatório', periodicidade: 'Anual', responsavel: 'Compliance', evidencia: 'Lista', criterioEficacia: 'Avaliação', cargosAplicaveis: [] },
  { id: 'trein-rastreabilidade', nome: 'Rastreabilidade OPME', tipo: 'Operacional', periodicidade: 'Semestral', responsavel: 'Qualidade', evidencia: 'Checklist', criterioEficacia: 'Auditoria', cargosAplicaveis: [] },
  { id: 'trein-tecnovigilancia', nome: 'Tecnovigilância', tipo: 'Regulatório', periodicidade: 'Anual', responsavel: 'Qualidade', evidencia: 'Prova', criterioEficacia: '≥70%', cargosAplicaveis: [] },
  { id: 'trein-biosseguranca', nome: 'Biossegurança', tipo: 'Operacional', periodicidade: 'Anual', responsavel: 'SST', evidencia: 'Lista', criterioEficacia: 'Observação', cargosAplicaveis: [] },
  { id: 'trein-controle-lote', nome: 'Controle de lote e validade', tipo: 'Operacional', periodicidade: 'Semestral', responsavel: 'Qualidade', evidencia: 'Checklist', criterioEficacia: 'Auditoria', cargosAplicaveis: [] },
  { id: 'trein-compliance', nome: 'Compliance', tipo: 'Compliance', periodicidade: 'Anual', responsavel: 'Compliance', evidencia: 'Termo', criterioEficacia: 'Participação', cargosAplicaveis: [] },
  { id: 'trein-sgq', nome: 'Sistema de Gestão da Qualidade', tipo: 'SGQ', periodicidade: 'Anual', responsavel: 'Qualidade', evidencia: 'Lista + prova', criterioEficacia: '≥70%', cargosAplicaveis: [] },
];

async function main() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // Autentica antes de escrever (regras exigem usuário logado).
  await signInWithEmailAndPassword(getAuth(app), SEED_EMAIL, SEED_SENHA);

  // Evita duplicar se já houver treinamentos.
  const existentes = await getDocs(collection(db, 'treinamentos'));
  if (!existentes.empty) {
    console.log(`Já existem ${existentes.size} treinamentos no Firestore. Nada a fazer.`);
    process.exit(0);
  }

  for (const t of TREINAMENTOS) {
    await setDoc(doc(db, 'treinamentos', t.id), t);
    console.log(`+ treinamento: ${t.nome}`);
  }

  console.log(`\nConcluído: ${TREINAMENTOS.length} treinamentos semeados no Firestore.`);
  process.exit(0);
}

main().catch((e) => {
  console.error('Falha ao semear:', e);
  process.exit(1);
});
