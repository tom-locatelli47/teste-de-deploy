# API + Frontend Vue com Docker e PostgreSQL

Aplicação básica com frontend em Vue, API REST em Node.js/Express e PostgreSQL, pronta para rodar com Docker.

Arquitetura separada:

- `frontend` (Nginx + Vue estático)
- `backend` (API Express)
- `db` (PostgreSQL)

## Estrutura do Projeto

```
├── backend/
│   ├── db/
│   │   └── init.sql      # Script de inicialização do banco
│   ├── src/
│   │   └── index.js      # API Express
│   ├── Dockerfile        # Build do backend
│   ├── package.json      # Dependências Node.js
│   └── .env              # Variáveis do backend (uso local)
├── frontend/
│   ├── nginx/
│   │   └── default.conf  # Proxy do frontend para o backend
│   ├── Dockerfile        # Build do frontend
│   └── public/
│       └── index.html    # Frontend em Vue
├── docker-compose.yml    # Orquestração Docker (frontend + backend + banco)
└── README.md             # Este arquivo
```

## Pré-requisitos

- Docker
- Docker Compose

## Como Usar

### 1. Subir a aplicação e o banco de dados

```bash
docker-compose up -d
```

Isto vai:

- Criar um container PostgreSQL com os dados iniciais
- Criar um container da API (backend)
- Criar um container do frontend (Nginx)
- Integrar frontend -> backend via proxy `/api`

### 2. Verificar se está rodando

```bash
docker-compose ps
```

### 3. Abrir o frontend

Acesse no navegador:

```bash
http://localhost:3000
```

API direta (backend):

```bash
http://localhost:3001/api/health
```

### 4. Testar a API

**Health check:**

```bash
curl http://localhost:3001/api/health
```

**Listar todos os usuários:**

```bash
curl http://localhost:3001/api/usuarios
```

**Criar um novo usuário:**

```bash
curl -X POST http://localhost:3001/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nome": "João", "email": "joao@example.com"}'
```

**Obter usuário por ID:**

```bash
curl http://localhost:3001/api/usuarios/1
```

**Deletar usuário:**

```bash
curl -X DELETE http://localhost:3001/api/usuarios/1
```

## Parar a aplicação

```bash
docker-compose down
```

Para remover também o volume do banco de dados:

```bash
docker-compose down -v
```

## Variáveis de Ambiente

As configurações locais do backend estão no arquivo `backend/.env`:

- `DB_USER` - Usuário do PostgreSQL
- `DB_PASSWORD` - Senha do PostgreSQL
- `DB_HOST` - Host do banco (dentro do Docker é `db`)
- `DB_PORT` - Porta do PostgreSQL
- `DB_NAME` - Nome do banco de dados
- `PORT` - Porta da aplicação

## Estrutura do Banco de Dados

### Tabela: usuarios

| Coluna     | Tipo                | Descrição       |
| ---------- | ------------------- | --------------- |
| id         | SERIAL PRIMARY KEY  | ID único        |
| nome       | VARCHAR(255)        | Nome do usuário |
| email      | VARCHAR(255) UNIQUE | Email único     |
| created_at | TIMESTAMP           | Data de criação |

## Acessar o banco de dados

Para conectar diretamente ao PostgreSQL:

```bash
docker exec -it app_db psql -U postgres -d app_db
```

Dentro do PostgreSQL:

```sql
\dt                          -- Listar tabelas
SELECT * FROM usuarios;      -- Ver todos os usuários
\q                          -- Sair
```

## Logs

Ver logs da aplicação:

```bash
docker-compose logs frontend
docker-compose logs backend
```

Ver logs do banco de dados:

```bash
docker-compose logs db
```

## Desenvolvimento

Se quiser fazer mudanças no código e testar localmente sem Docker:

```bash
cd backend
npm install
npm start
```

Mas lembre-se de que o banco de dados estará no Docker, então configure as variáveis de ambiente de acordo.

## Deploy no Kubernetes (AWS Lab)

Foi criada a pasta `k8s/` com manifests alinhados ao tutorial:

- `namespace.yaml`
- `secret.yaml`
- `configmap.yaml`
- `postgres-pvc.yaml`
- `postgres-init-configmap.yaml`
- `postgres-deployment.yaml`
- `postgres-service.yaml`
- `api-deployment.yaml`
- `api-service.yaml`
- `frontend-nginx-configmap.yaml`
- `frontend-deployment.yaml`
- `frontend-service.yaml`
- `deploy.sh` - Script bash automatizado

### Preparação (Setup do Cluster)

1. **No Learner Lab AWS**, crie 1 master + 1 worker (Ubuntu 26.04 LTS, t3.medium).
2. **Security Group**: Use `k3s-cluster-sg` com portas liberadas:
   - 22 (SSH)
   - 6443 (Kubernetes API)
   - 30000-32767 (NodePort)
3. **No master**, instale k3s:
   ```bash
   curl -sfL https://get.k3s.io | sh -
   ```
4. **Pegue o token no master**:
   ```bash
   sudo cat /var/lib/rancher/k3s/server/node-token
   ```
5. **No worker**, instale k3s agent (substitua TOKEN e IP_MASTER):
   ```bash
   curl -sfL https://get.k3s.io | K3S_URL=https://IP_MASTER:6443 K3S_TOKEN=TOKEN sh -
   ```
6. **No master**, valide se os nós estão online:
   ```bash
   sudo kubectl get nodes
   ```

### Deploy da Aplicação

#### Opção 1: Deploy Automatizado (Recomendado)

1. No seu Windows, envie os manifests para o master:

   ```bash
   scp -i SEU_ARQUIVO.pem -r "k8s" ubuntu@IP_PUBLICO_MASTER:/home/ubuntu/
   ```

2. No master, execute o script:
   ```bash
   ssh -i SEU_ARQUIVO.pem ubuntu@IP_PUBLICO_MASTER
   cd ~/k8s
   bash deploy.sh
   ```

#### Opção 2: Deploy Manual (Passo a Passo)

1. **Copiar manifests para o master**:

   ```bash
   scp -i SEU_ARQUIVO.pem -r "k8s" ubuntu@IP_PUBLICO_MASTER:/home/ubuntu/
   ```

2. **SSH para o master**:

   ```bash
   ssh -i SEU_ARQUIVO.pem ubuntu@IP_PUBLICO_MASTER
   ```

3. **Aplicar todos os manifests no namespace `teste-deploy`**:

   ```bash
   cd ~/k8s
   sudo kubectl apply -f .
   ```

   (O namespace `teste-deploy` já foi criado por você)

4. **Monitorar o deploy**:
   ```bash
   sudo kubectl get pods -n teste-deploy -w
   ```
   Aguarde até todos os pods ficarem `Running`.

### Verificar o Status

```bash
sudo kubectl get pods -n teste-deploy
sudo kubectl get services -n teste-deploy
sudo kubectl get pvc -n teste-deploy
```

### Testar a Aplicação

Use o IP público do nó do cluster na porta `30090`:

```bash
http://<ip-publico-do-no>:30090
```

Health check da API:

```bash
curl http://<ip-publico-do-no>:30090/api/health
```

### Troubleshooting

Se algo não funcionar, use estes comandos:

**Ver logs de um deployment**:

```bash
sudo kubectl logs -n teste-deploy deployment/frontend
sudo kubectl logs -n teste-deploy deployment/api-simples
sudo kubectl logs -n teste-deploy deployment/postgres
```

**Descrever um pod para detalhes de erro**:

```bash
sudo kubectl describe pod NOME_DO_POD -n teste-deploy
```

**Reconectar cluster remoto localmente**:

```bash
scp -i SEU_ARQUIVO.pem ubuntu@IP_PUBLICO_MASTER:/etc/rancher/k3s/k3s.yaml ~/.kube/config
# Edite ~/.kube/config e altere '127.0.0.1' para IP_PUBLICO_MASTER
kubectl get nodes
```

### Observações Importantes

- A imagem do backend é `tomaslocatelli/api-simples-backend:latest`.
- A imagem do frontend é `tomaslocatelli/api-simples-frontend:latest`.
- O banco usa PVC (`postgres-pvc`) para persistência.
- Credenciais ficam no `Secret` (`app-secrets`) e configurações no `ConfigMap` (`api-config`).
- O script de criação da tabela e seed inicial está no `postgres-init-configmap.yaml`.

## Publicar no Docker Hub

### Build das imagens

```bash
docker build -f backend/Dockerfile -t tomaslocatelli/api-simples-backend:latest .
docker build -f frontend/Dockerfile -t tomaslocatelli/api-simples-frontend:latest .
```

### Push das imagens

```bash
docker push tomaslocatelli/api-simples-backend:latest
docker push tomaslocatelli/api-simples-frontend:latest
```

### Subir local com as imagens separadas

```bash
docker compose up -d --build
```

## Próximos Passos

- Adicionar mais endpoints conforme necessário
- Implementar autenticação
- Adicionar validações mais robustas
- Implementar testes
- Fazer deploy em container registry (Docker Hub, AWS ECR, etc.)
