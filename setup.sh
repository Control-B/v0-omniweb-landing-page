#!/usr/bin/env bash

# Setup script for the Omniweb portfolio project
# Uses Kind (Kubernetes in Docker) and local Docker registry.
# Installs all services via Helm charts.

set -e

# 1. Create a local Docker registry (if not already running)
REGISTRY_NAME="kind-registry"
REGISTRY_PORT="5000"
if [ "$(docker ps -q -f name=${REGISTRY_NAME})" = "" ]; then
  echo "Starting local Docker registry..."
  docker run -d --restart=always -p ${REGISTRY_PORT}:5000 --name ${REGISTRY_NAME} registry:2
else
  echo "Local Docker registry already running."
fi

# 2. Create Kind cluster using the configuration file
CLUSTER_NAME="omniweb"
if ! kind get clusters | grep -q "${CLUSTER_NAME}"; then
  echo "Creating Kind cluster '${CLUSTER_NAME}'..."
  kind create cluster --name ${CLUSTER_NAME} --config kind-config.yaml
else
  echo "Kind cluster '${CLUSTER_NAME}' already exists."
fi

# 3. Connect the registry to the Kind network
docker network connect "kind" ${REGISTRY_NAME} || true

# 4. Build Docker images for services (placeholder commands)
# Frontend image
echo "Building frontend image..."
# Assuming a Dockerfile exists at services/frontend/Dockerfile
# For now we use the monolith Dockerfile as a placeholder
docker build -t localhost:${REGISTRY_PORT}/frontend:latest -f Dockerfile .
# Backend image
echo "Building backend image..."
# Assuming a Dockerfile exists at services/backend/Dockerfile
docker build -t localhost:${REGISTRY_PORT}/backend:latest -f Dockerfile .

# 5. Push images to the local registry
docker push localhost:${REGISTRY_PORT}/frontend:latest
docker push localhost:${REGISTRY_PORT}/backend:latest

# 6. Load images into Kind (so pods can pull them without external registry)
kind load docker-image localhost:${REGISTRY_PORT}/frontend:latest --name ${CLUSTER_NAME}
kind load docker-image localhost:${REGISTRY_PORT}/backend:latest --name ${CLUSTER_NAME}

# 7. Install Helm (if not present) and add repos
if ! command -v helm &> /dev/null; then
  echo "Helm not found. Please install Helm before running this script."
  exit 1
fi

helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add traefik https://traefik.github.io/charts
helm repo add keycloak https://charts.bitnami.com/bitnami
helm repo add weaviate https://weaviate.github.io/weaviate-helm
helm repo add strimzi https://strimzi.io/charts
helm repo add livekit https://livekit.github.io/livekit-charts
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# 8. Deploy services via Helm
# Traefik (Ingress)
helm upgrade --install traefik traefik/traefik \
  --namespace default \
  --set service.type=NodePort \
  --set ports.web.nodePort=30080 \
  --set ports.websecure.nodePort=30443

# Keycloak (authentication)
helm upgrade --install keycloak bitnami/keycloak \
  --namespace default \
  --set service.type=NodePort \
  --set service.nodePort=30081 \
  --set auth.adminUser=admin \
  --set auth.adminPassword=admin

# Weaviate (vector store)
helm upgrade --install weaviate weaviate/weaviate \
  --namespace default \
  --set service.type=NodePort \
  --set service.nodePort=30082

# Kafka (Strimzi operator + cluster)
helm upgrade --install strimzi strimzi/strimzi-kafka-operator \
  --namespace default
# Create a simple Kafka cluster after the operator is ready (using a separate yaml)
cat <<EOF | kubectl apply -f -
apiVersion: kafka.strimzi.io/v1beta2
kind: Kafka
metadata:
  name: omniweb-kafka
  namespace: default
spec:
  kafka:
    replicas: 1
    listeners:
      - name: plain
        port: 9092
        type: internal
    storage:
      type: ephemereal
  zookeeper:
    replicas: 1
    storage:
      type: ephemereal
  entityOperator:
    topicOperator: {}
    userOperator: {}
EOF

# LiveKit (media server)
helm upgrade --install livekit livekit/livekit \
  --namespace default \
  --set service.type=NodePort \
  --set service.nodePort=30083

# Monitoring stack (Prometheus + Grafana)
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
  --namespace default

# Deploy frontend and backend using our local Helm charts
helm upgrade --install frontend ./services/frontend/helm \
  --namespace default \
  --set image.repository=localhost:${REGISTRY_PORT}/frontend \
  --set image.tag=latest

helm upgrade --install backend ./services/backend/helm \
  --namespace default \
  --set image.repository=localhost:${REGISTRY_PORT}/backend \
  --set image.tag=latest

echo "Setup complete! Access the UI via http://localhost:30080"
