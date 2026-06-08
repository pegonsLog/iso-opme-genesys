import { Injectable, computed, signal } from '@angular/core';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { Usuario } from './usuario.model';
import { getCipFirestore } from './cip-firebase';

/** Chave de sessão no localStorage (mesma identidade compartilhada com o CIP). */
const STORAGE_KEY = 'cip_usuario';

/** Coleção de tokens de SSO de uso único (no projeto do CIP). */
const SSO_TOKENS = 'sso_tokens';

/** Validade de um token de SSO, em milissegundos. */
const SSO_TTL_MS = 60_000;

/** Resultado de uma tentativa de login. */
export interface ResultadoLogin {
  sucesso: boolean;
  erro?: string;
}

/**
 * Serviço de autenticação no mesmo modelo do CIP (Centro de Inteligência de
 * Pessoas): valida o usuário diretamente na coleção `usuarios` do Firestore
 * do projeto do CIP (e-mail + senha) e mantém a sessão no localStorage.
 *
 * Usa uma instância Firebase dedicada ao CIP (ver `cip-firebase.ts`), de
 * forma que os dados de domínio do ISO permaneçam no projeto próprio e
 * apenas o login seja compartilhado entre os dois apps (SSO via URL).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly db = getCipFirestore();

  /** Usuário autenticado (null = não autenticado). */
  readonly usuario = signal<Usuario | null>(null);
  /** Indica que o estado inicial de sessão já foi resolvido. */
  readonly carregado = signal(false);
  /** True quando há um usuário autenticado. */
  readonly logado = computed(() => this.usuario() !== null);

  constructor() {
    this.restaurarSessao();
  }

  /** True quando a autenticação está ativa (auth do CIP configurado). */
  get autenticacaoAtiva(): boolean {
    return !!this.db;
  }

  /** True quando o usuário pode acessar (autenticado ou auth desativada). */
  get estaAutenticado(): boolean {
    return !this.db || this.usuario() !== null;
  }

  /** Restaura a sessão salva no localStorage (síncrono). */
  private restaurarSessao(): void {
    if (typeof localStorage !== 'undefined') {
      const salvo = localStorage.getItem(STORAGE_KEY);
      if (salvo) {
        try {
          this.usuario.set(JSON.parse(salvo) as Usuario);
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
    this.carregado.set(true);
  }

  /** Login por e-mail e senha contra a coleção `usuarios` do CIP. */
  async entrar(email: string, senha: string): Promise<ResultadoLogin> {
    if (!this.db) return { sucesso: false, erro: 'Autenticação indisponível.' };
    try {
      const ref = collection(this.db, 'usuarios');
      const snapshot = await getDocs(query(ref, where('email', '==', email)));

      if (snapshot.empty) {
        return { sucesso: false, erro: 'E-mail ou senha inválidos.' };
      }

      const docSnap = snapshot.docs[0];
      const data = docSnap.data() as Record<string, unknown>;

      if (data['senha'] !== senha) {
        return { sucesso: false, erro: 'E-mail ou senha inválidos.' };
      }
      if (!data['ativo']) {
        return { sucesso: false, erro: 'Usuário inativo. Contate o administrador.' };
      }

      this.estabelecerSessao(docSnap.id, data);
      this.registrarAcesso(docSnap.id);
      return { sucesso: true };
    } catch {
      return { sucesso: false, erro: 'Erro ao conectar. Tente novamente.' };
    }
  }

  /**
   * Login automático entre apps (SSO): autentica usando o id do usuário
   * compartilhado, recebido via URL ao vir do CIP. Valida que o usuário
   * existe e está ativo antes de estabelecer a sessão.
   */
  async entrarPorId(id: string): Promise<boolean> {
    if (!this.db || !id) return false;
    try {
      const snap = await getDoc(doc(this.db, 'usuarios', id));
      if (!snap.exists()) return false;
      const data = snap.data() as Record<string, unknown>;
      if (!data['ativo']) return false;
      this.estabelecerSessao(snap.id, data);
      this.registrarAcesso(snap.id);
      return true;
    } catch {
      return false;
    }
  }

  /** Limpa a sessão. */
  sair(): void {
    this.usuario.set(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  /**
   * Gera um token de SSO de uso único e curta validade para entregar a
   * sessão atual a outro app (ex.: CIP). Retorna o token, ou null se não
   * houver usuário/Firestore.
   */
  async gerarTokenSso(): Promise<string | null> {
    const atual = this.usuario();
    if (!this.db || !atual) return null;
    try {
      const token = gerarTokenAleatorio();
      const expira = Date.now() + SSO_TTL_MS;
      await setDoc(doc(this.db, SSO_TOKENS, token), {
        usuarioId: atual.id,
        origem: 'iso',
        criadoEm: new Date().toISOString(),
        expiraEm: expira,
        expiraEmTs: Timestamp.fromMillis(expira),
        usado: false,
      });
      return token;
    } catch {
      return null;
    }
  }

  /**
   * Consome um token de SSO recebido via URL: valida (existe, não usado,
   * não expirado), estabelece a sessão e invalida o token. Retorna true em
   * caso de sucesso.
   */
  async consumirTokenSso(token: string): Promise<boolean> {
    if (!this.db || !token) return false;
    try {
      const ref = doc(this.db, SSO_TOKENS, token);
      const snap = await getDoc(ref);
      if (!snap.exists()) return false;

      const data = snap.data() as Record<string, unknown>;
      if (data['usado'] === true) return false;
      if (typeof data['expiraEm'] === 'number' && Date.now() > (data['expiraEm'] as number)) {
        return false;
      }

      // Marca como usado antes de autenticar (evita reuso em condição de corrida).
      await updateDoc(ref, { usado: true });
      const ok = await this.entrarPorId(String(data['usuarioId'] ?? ''));

      // Remove o token (best-effort).
      deleteDoc(ref).catch(() => {
        /* ignora falha de limpeza */
      });
      return ok;
    } catch {
      return false;
    }
  }

  /** Monta o objeto Usuario, atualiza o signal e persiste no localStorage. */
  private estabelecerSessao(id: string, data: Record<string, unknown>): void {
    const usuario: Usuario = {
      id,
      email: String(data['email'] ?? ''),
      nome: String(data['nome'] ?? ''),
      cargo: String(data['cargo'] ?? ''),
      perfil: (data['perfil'] as Usuario['perfil']) ?? 'Visualizador',
      ativo: Boolean(data['ativo']),
      fotoPerfil: (data['fotoPerfil'] as string | null) ?? null,
    };
    this.usuario.set(usuario);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
    }
  }

  /** Registra o último acesso (best-effort, não bloqueia o login). */
  private registrarAcesso(id: string): void {
    if (!this.db) return;
    updateDoc(doc(this.db, 'usuarios', id), {
      ultimoAcesso: new Date().toISOString(),
    }).catch(() => {
      /* ignora falhas de atualização de telemetria */
    });
  }
}

/** Gera um token aleatório (192 bits) em hexadecimal, via Web Crypto. */
function gerarTokenAleatorio(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
