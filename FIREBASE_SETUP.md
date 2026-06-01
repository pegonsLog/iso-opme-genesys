# Configuração do Firebase

A aplicação já está integrada ao Firebase (Firestore) via AngularFire, mas
roda em modo **offline (localStorage)** até que você habilite e preencha as
credenciais. Isso permite desenvolver sem depender do backend.

## Configuração inicial dos ambientes (obrigatório ao clonar)

Os arquivos com credenciais **não são versionados** (estão no `.gitignore`).
Após clonar o repositório, crie-os a partir do template:

```bash
cp src/environments/environment.example.ts src/environments/environment.ts
cp src/environments/environment.example.ts src/environments/environment.development.ts
```

Em seguida, preencha os valores do Firebase em cada arquivo (veja abaixo).
Para apenas rodar offline, deixe `firebaseEnabled: false` — nenhuma
credencial é necessária nesse caso.

## Como ativar o Firestore

1. Crie um projeto no [Console do Firebase](https://console.firebase.google.com/).
2. Em **Build → Firestore Database**, crie o banco (modo de teste para começar).
3. Em **Configurações do projeto → Seus apps → Web**, registre um app e copie
   o objeto `firebaseConfig`.
4. Cole os valores em:
   - `src/environments/environment.development.ts` (desenvolvimento)
   - `src/environments/environment.ts` (produção)
5. Em ambos os arquivos, mude `firebaseEnabled` para `true`.

## Como funciona a troca

- `firebaseEnabled: false` → usa `InMemoryRepository` (dados seed + localStorage).
- `firebaseEnabled: true` → usa `FirestoreRepository` (coleções no Firestore).

A escolha acontece em `src/app/core/data/data-providers.ts`. Nenhum componente
precisa ser alterado — ambos implementam o mesmo contrato `DataRepository`.

## Coleções no Firestore

- `cargos`
- `treinamentos`
- `colaboradores`
- `registros`

O id de cada documento é o mesmo `id` do modelo.

## Regras de segurança (sugestão inicial)

> Atenção: as regras abaixo são abertas, apenas para desenvolvimento.
> Antes de ir para produção, restrinja o acesso (ex.: exigir autenticação).

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // TROCAR antes de produção
    }
  }
}
```
