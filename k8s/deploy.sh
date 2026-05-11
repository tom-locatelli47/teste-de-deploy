#!/bin/bash

# Script de deploy da aplicação no Kubernetes
# Use este script no master (k3s) para fazer o deploy completo

echo "=== Deploy da Aplicação api-simples no Kubernetes ==="
echo ""

# Passo 1: Namespace já foi criado (teste-deploy)
echo "[1/3] Validando namespace 'teste-deploy'..."
sudo kubectl get namespace teste-deploy
echo "✓ Namespace criado/validado"
echo ""

# Passo 2: Aplicar todos os manifests da pasta k8s
echo "[2/3] Aplicando manifests da pasta k8s..."
sudo kubectl apply -f .
echo "✓ Manifests aplicados"
echo ""

# Passo 3: Monitorar o status dos pods
echo "[3/3] Aguardando pods ficarem prontos..."
echo "Pressione Ctrl+C para parar de monitorar"
echo ""
sudo kubectl get pods -n teste-deploy -w

echo ""
echo "=== Deploy Concluído ==="
echo ""
echo "Comandos úteis:"
echo "  Ver pods:      sudo kubectl get pods -n teste-deploy"
echo "  Ver services:  sudo kubectl get services -n teste-deploy"
echo "  Ver PVC:       sudo kubectl get pvc -n teste-deploy"
echo "  Ver logs:      sudo kubectl logs -n teste-deploy deployment/frontend"
echo "  Acessar app:   http://IP_PUBLICO:30090"
echo ""
