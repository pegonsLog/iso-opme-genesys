/**
 * Semeia a collection `cronograma` no Firestore com o cronograma anual
 * padrão do kit. Idempotente: se já houver itens, não faz nada.
 *
 * Uso: node scripts/seed-cronograma.mjs
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

const SEED_EMAIL = process.env.SEED_EMAIL || 'admin@isoopme.com';
const SEED_SENHA = process.env.SEED_SENHA || 'OpmeRh2026!';

const CRONOGRAMA = [
  { id: 'cron-01', mes: 'Janeiro', treinamento: 'Integração SGQ', publico: 'Novos colaboradores' },
  { id: 'cron-02', mes: 'Fevereiro', treinamento: 'ISO 13485', publico: 'Todos' },
  { id: 'cron-03', mes: 'Março', treinamento: 'Compliance', publico: 'Comercial' },
  { id: 'cron-04', mes: 'Abril', treinamento: 'LGPD', publico: 'Todos' },
  { id: 'cron-05', mes: 'Maio', treinamento: 'Tecnovigilância', publico: 'Técnicos' },
  { id: 'cron-06', mes: 'Junho', treinamento: 'Biossegurança', publico: 'Operações' },
  { id: 'cron-07', mes: 'Julho', treinamento: 'Rastreabilidade', publico: 'Logística' },
  { id: 'cron-08', mes: 'Agosto', treinamento: 'Não conformidade e CAPA', publico: 'Lideranças' },
  { id: 'cron-09', mes: 'Setembro', treinamento: 'Auditoria Interna', publico: 'Gestores' },
  { id: 'cron-10', mes: 'Outubro', treinamento: 'Segurança do Trabalho', publico: 'Todos' },
  { id: 'cron-11', mes: 'Novembro', treinamento: 'Reciclagem SGQ', publico: 'Todos' },
  { id: 'cron-12', mes: 'Dezembro', treinamento: 'Avaliação anual de competência', publico: 'Todos' },
];

async function main() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  await signInWithEmailAndPassword(getAuth(app), SEED_EMAIL, SEED_SENHA);

  const existentes = await getDocs(collection(db, 'cronograma'));
  if (!existentes.empty) {
    console.log(`Já existem ${existentes.size} itens de cronograma. Nada a fazer.`);
    process.exit(0);
  }

  for (const item of CRONOGRAMA) {
    await setDoc(doc(db, 'cronograma', item.id), item);
    console.log(`+ ${item.mes}: ${item.treinamento}`);
  }

  console.log(`\nConcluído: ${CRONOGRAMA.length} itens de cronograma semeados.`);
  process.exit(0);
}

main().catch((e) => {
  console.error('Falha ao semear cronograma:', e);
  process.exit(1);
});
