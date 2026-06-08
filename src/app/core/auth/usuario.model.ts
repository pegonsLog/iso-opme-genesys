/**
 * Usuário do sistema, compartilhado com o CIP (Centro de Inteligência de
 * Pessoas) através da coleção `usuarios` no mesmo projeto Firebase.
 *
 * A senha NÃO é mantida em memória nem persistida no cliente após o login.
 */
export interface Usuario {
  id: string;
  email: string;
  nome: string;
  cargo: string;
  perfil: 'Admin' | 'Gestor' | 'Analista' | 'Visualizador';
  ativo: boolean;
  fotoPerfil: string | null;
}
