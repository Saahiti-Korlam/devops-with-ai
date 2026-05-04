# 🛍️ Boutique Microservices — Cloud-Native AIOps on AWS EKS

> A full-stack cloud-native project that deploys a boutique e-commerce application as microservices on AWS EKS, with a CI/CD pipeline powered by GitHub Actions and an AI-powered AIOps assistant (Thorr) built on AWS Bedrock for intelligent cluster observability.

---

## 📑 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Tools & Technologies](#tools--technologies)
4. [Phase 1 — Local Deployment](#phase-1--local-deployment-with-docker)
5. [Phase 2 — Cloud Deployment on AWS EKS](#phase-2--cloud-deployment-on-aws-eks)
6. [Phase 3 — CI/CD Pipeline with GitHub Actions](#phase-3--cicd-pipeline-with-github-actions)
7. [Phase 4 — AIOps Integration with AWS Bedrock](#phase-4--aiops-integration-with-aws-bedrock)
8. [Monitoring Stack](#monitoring-stack)
9. [Pros & Real-World Comparison](#pros--real-world-comparison)
10. [Conclusion](#conclusion)

---

## Project Overview

This project demonstrates an end-to-end cloud-native deployment lifecycle:

- A **React-based boutique e-commerce frontend** backed by **7 microservices** (Auth, Gateway, Products, Orders, Order-Service, User, Frontend).
- Containerized and orchestrated using **Docker** locally, then promoted to **AWS EKS** via **Terraform**.
- Automated image builds and ECR pushes via **GitHub Actions** CI/CD.
- GitOps-style deployment using **ArgoCD** and **Kustomize**.
- Full observability with **Prometheus**, **Grafana**, and **AlertManager**.
- An **AI-powered AIOps assistant** named **Thorr**, built using **AWS Bedrock**, **AWS Lambda**, and **Streamlit**, capable of querying cluster health, logs, and metrics via natural language.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Developer Workstation                         │
│   React App  ──►  Docker Compose (Local Test)                        │
│   Code Push  ──►  GitHub Actions CI/CD                               │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                    Build & Push Images
                             │
                    ┌────────▼────────┐
                    │   Amazon ECR    │
                    │ (7 Repositories)│
                    └────────┬────────┘
                             │
                    ┌────────▼────────────────────────────────────────┐
                    │              AWS EKS Cluster                     │
                    │                                                  │
                    │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
                    │  │  ArgoCD  │  │Prometheus│  │ Grafana  │      │
                    │  └──────────┘  └──────────┘  └──────────┘      │
                    │                                                  │
                    │  ┌───────────────────────────────────────────┐  │
                    │  │         Boutique Namespace                 │  │
                    │  │  Frontend | Gateway | Auth | Products      │  │
                    │  │  Orders   | Order-Service | User-Service   │  │
                    │  │  PostgreSQL (Restored via Init Job)        │  │
                    │  └───────────────────────────────────────────┘  │
                    └───────────────────────┬─────────────────────────┘
                                            │
                    ┌───────────────────────▼─────────────────────────┐
                    │              AIOps Layer (AWS Bedrock)            │
                    │                                                  │
                    │  Thorr (Bedrock Agent — Qwen3 32B)               │
                    │  ├── Lambda: aiops-fetch-logs (CloudWatch)       │
                    │  ├── Lambda: aiops-fetch-metrics (Prometheus)    │
                    │  └── Lambda: aiops-fetch-health (EKS + Prom)    │
                    │                                                  │
                    │  Streamlit UI ──► http://localhost:8501           │
                    └─────────────────────────────────────────────────┘
```

---

## Tools & Technologies

### 🐳 Docker & Docker Compose
Containerization platform used to package each microservice into isolated, reproducible containers. Docker Compose orchestrates all 10 containers locally with a single command, managing service dependencies, networking, and port mappings.

### ☸️ Kubernetes (AWS EKS)
AWS Elastic Kubernetes Service — a managed Kubernetes control plane. Handles pod scheduling, self-healing, scaling, and service discovery for all microservices running in the cloud.

### 🏗️ Terraform
Infrastructure-as-Code tool used to provision all AWS resources (VPC, Subnets, EKS Cluster, ECR Repositories, IAM Roles) in a declarative, repeatable, and version-controlled manner.

### 🔄 ArgoCD
GitOps continuous delivery tool running inside the EKS cluster. Watches the Git repository and automatically syncs Kubernetes manifests, ensuring the cluster state always matches what is declared in Git.

### ⚙️ GitHub Actions
Cloud-native CI/CD platform integrated directly into GitHub. Automatically builds Docker images, pushes them to Amazon ECR, and updates Kubernetes manifests on every code push to `main`.

### 🗃️ Amazon ECR (Elastic Container Registry)
AWS-managed private Docker image registry. Stores all 7 service images with immutable SHA-tagged versions for traceability and rollback capability.

### 📦 Kustomize
Kubernetes-native configuration management tool. Bundles multiple YAML manifests into a single deployable unit, allowing ordered and structured deployment with `kubectl apply -k`.

### 📊 Prometheus
Open-source metrics collection and alerting system. Scrapes metrics from all pods, nodes, and Kubernetes components, storing time-series data for querying via PromQL.

### 📈 Grafana
Visualization and dashboarding platform. Connects to Prometheus to render real-time graphs of CPU, memory, pod restarts, deployment health, and other cluster metrics.

### 🚨 AlertManager
Prometheus component that handles alert routing and deduplication. Routes firing alerts to notification channels such as email, Slack, or PagerDuty.

### 📋 FluentBit
Lightweight log processor and forwarder. Installed via Helm on every EKS node; collects pod logs and ships them to Amazon CloudWatch log groups for centralized log management.

### ☁️ Amazon CloudWatch
AWS observability service used as the centralized log sink. Stores logs from all pods under the log group `/eks/boutique/pods`, queryable by the AIOps Lambda functions.

### 🤖 AWS Bedrock
Fully managed AI platform that provides access to foundation models via API — no model hosting required. Used here to power the Thorr AIOps agent using the Qwen3 32B model.

### 🧠 AWS Bedrock Agent
Extends AWS Bedrock with reasoning and action capabilities. The agent interprets natural language queries, decides which Lambda tool to invoke, and synthesizes results into human-readable answers.

### λ AWS Lambda
Serverless compute service. Three Lambda functions act as tools for the Bedrock agent — fetching logs, metrics, and health data from CloudWatch, Prometheus, and EKS on demand.

### 🖥️ Streamlit
Python-based web UI framework. Provides the chat interface (Thorr AIOps Assistant) through which users interact with the Bedrock agent in plain English at `http://localhost:8501`.

### 🪖 Helm
Kubernetes package manager used to install FluentBit, ArgoCD, and the kube-prometheus-stack (Prometheus + Grafana + AlertManager) into the cluster with configurable values.

---

## Phase 1 — Local Deployment with Docker

### Summary
Before pushing to the cloud, the entire application is validated locally using Docker Compose. This phase ensures all 10 services build, start, and communicate correctly on a developer machine.

---

### Prerequisites

Install the following before starting:

| Tool | Verification Command |
|------|----------------------|
| Node.js (LTS) | `node -v` |
| npm | `npm -v` |
| Docker Desktop | `docker -v` |
| Claude Code CLI | `claude --version` |

### Install Claude Code CLI

**Option A — npm (cross-platform):**
```bash
npm install -g @anthropic-ai/claude-code
```

**Option B — PowerShell (Windows):**
```powershell
irm https://claude.ai/install.ps1 | iex
```

---

### Step-by-Step Commands

**Step 1 — Navigate to the project root:**
```bash
cd /boutique-micro-services
```

**Step 2 — Install Node dependencies:**
```bash
npm install
```

**Step 3 — Build the React frontend (generates static HTML/CSS/JS):**
```bash
npm run build
```

**Step 4 — Build and start all Docker containers in detached mode:**
```bash
docker-compose up -d --build
```

**Step 5 — Verify all containers are running:**
```bash
docker ps -a
```
<img width="949" height="461" alt="docker-images" src="https://github.com/user-attachments/assets/9d4c7141-41c0-475d-8900-ffe17c9278a0" />

<img width="640" height="151" alt="npm-run" src="https://github.com/user-attachments/assets/fb9a18fb-ec1b-4194-a2ac-2dcae7612a6d" />

---

### Result — All 10 Services Running

| Service | Local URL |
|---|---|
| Frontend (nginx) | http://localhost:3000 |
| Gateway | http://localhost:3001 |
| Auth Service | http://localhost:3002 |
| Products Service | http://localhost:3003 |
| Order Service | http://localhost:3004 |
| Orders (management) | http://localhost:3005 |
| User Service | http://localhost:3006 |
| Grafana | http://localhost:3007 |
| Prometheus | http://localhost:9090 |
| PostgreSQL | localhost:5432 |

✅ Application accessible at: **http://localhost:3000**

---
<img width="428" height="311" alt="containers-up-local" src="https://github.com/user-attachments/assets/71ceb564-6c2c-4a44-9198-65e38496252a" />

### Output of frontend on local
<img width="935" height="419" alt="output1-local" src="https://github.com/user-attachments/assets/9a313fa5-5c15-47f5-9206-114214068dbe" />

<img width="925" height="464" alt="output2-local" src="https://github.com/user-attachments/assets/e40de7ef-c069-4b88-b334-6a67295615d8" />

<img width="800" height="352" alt="output-orders-local" src="https://github.com/user-attachments/assets/c5462af3-a008-4957-879c-4fb5e45ed00d" />

<img width="929" height="380" alt="profile-local" src="https://github.com/user-attachments/assets/f7eec163-eafe-4070-a092-497515a2b9f1" />

#### Monitoring on local
<img width="959" height="410" alt="prometheus-local" src="https://github.com/user-attachments/assets/7ea8ba22-f4a7-42ea-8c4b-20391809373a" />

<img width="784" height="419" alt="grafana-local" src="https://github.com/user-attachments/assets/842d0d78-8cda-4631-9f78-ddcd619bc7cc" />


### Stop Local Containers

```bash
docker-compose down
```

---

## Phase 2 — Cloud Deployment on AWS EKS

### Summary
This phase provisions a production-grade AWS infrastructure using Terraform — creating a VPC, EKS cluster, ECR repositories, and deploying ArgoCD and the kube-prometheus monitoring stack. The application is then deployed to the cluster using Kustomize.

---

### Step-by-Step Commands

**Step 1 — Verify AWS identity and permissions:**
```bash
aws sts get-caller-identity
```
> Confirms the correct AWS account, region, and IAM role are active before any infrastructure changes.

**Step 2 — Initialize Terraform (downloads providers & modules):**
```bash
terraform init
```

**Step 3 — Preview infrastructure changes:**
```bash
terraform plan
```
<img width="650" height="263" alt="cloud-plan-aws" src="https://github.com/user-attachments/assets/9991dd8a-c501-4b6d-9bda-7fea3b5e0053" />

<img width="628" height="225" alt="cloud-plan1-aws" src="https://github.com/user-attachments/assets/41de5a20-ff68-4c49-aede-335fea3896c4" />

**Step 4 — Apply and provision all AWS resources:**
```bash
terraform apply --auto-approve
```
---

### Infrastructure Provisioned by Terraform

| Resource | Details |
|---|---|
| VPC | `EKS-boutique-VPC` — CIDR: `10.1.0.0/16` — Region: `ap-south-1` |
| Subnets | 3 public subnets across `ap-south-1a`, `ap-south-1b`, `ap-south-1c` |
| EKS Cluster | `eks-boutique-cluster` |
| ECR Repositories | 7 repos: auth, frontend, gateway, order-service, orders, product-service, user-service |
| ArgoCD | Deployed via Helm in namespace `argocd` |
| Monitoring Stack | Prometheus, Grafana, AlertManager in namespace `monitoring` |

---
<img width="959" height="244" alt="resources1" src="https://github.com/user-attachments/assets/b8319283-53cf-4de1-b7ba-fefd3fd4880b" />

<img width="937" height="245" alt="networking-aws" src="https://github.com/user-attachments/assets/910ce13b-a9ac-4eed-aab4-246f40559299" />

<img width="959" height="320" alt="subnets-aws" src="https://github.com/user-attachments/assets/515cc64f-3742-4a1a-bc2f-762271275fcc" />

<img width="948" height="292" alt="eks-cluster" src="https://github.com/user-attachments/assets/e2eadb64-d8fd-4a7e-a6ec-cc6494566d2e" />


### Terraform Output — Key Endpoints

| Resource | Value |
|---|---|
| Cluster Name | `eks-boutique-cluster` |
| Cluster Endpoint | `https://AF5C05BCA6540A128F7E76FB0F98B1BF.gr7.ap-south-1.eks.amazonaws.com` |

**ECR Repository URLs:**
```
952893849284.dkr.ecr.ap-south-1.amazonaws.com/auth
952893849284.dkr.ecr.ap-south-1.amazonaws.com/frontend
952893849284.dkr.ecr.ap-south-1.amazonaws.com/gateway
952893849284.dkr.ecr.ap-south-1.amazonaws.com/order-service
952893849284.dkr.ecr.ap-south-1.amazonaws.com/orders
952893849284.dkr.ecr.ap-south-1.amazonaws.com/product-service
952893849284.dkr.ecr.ap-south-1.amazonaws.com/user-service
```
<img width="650" height="301" alt="ecr-urls-cloud" src="https://github.com/user-attachments/assets/c55bb45e-ff2d-4729-a0a4-9917fa71b472" />

---

**Step 5 — Configure kubectl to access the cluster:**
```bash
aws eks update-kubeconfig --region ap-south-1 --name eks-boutique-cluster
```

**Step 6 — Verify all pods are running:**
```bash
kubectl get pods -A
```
<img width="959" height="319" alt="check-pods1" src="https://github.com/user-attachments/assets/4a775568-ea10-4044-8dc0-088252d94904" />

---

### Running Pods in Cluster

| Namespace | Pod | Status |
|---|---|---|
| argocd | argocd-application-controller-0 | ✅ Running |
| argocd | argocd-applicationset-controller | ✅ Running |
| argocd | argocd-dex-server | ✅ Running |
| argocd | argocd-notifications-controller | ✅ Running |
| argocd | argocd-redis | ✅ Running |
| argocd | argocd-repo-server | ✅ Running |
| argocd | argocd-server | ✅ Running |
| kube-system | aws-node | ✅ Running |
| kube-system | coredns (x2) | ✅ Running |
| kube-system | ebs-csi-controller (x2) | ✅ Running |
| kube-system | ebs-csi-node | ✅ Running |
| kube-system | kube-proxy | ✅ Running |
| monitoring | alertmanager | ✅ Running |
| monitoring | kube-prometheus-stack-grafana | ✅ Running |
| monitoring | kube-state-metrics | ✅ Running |
| monitoring | prometheus-operator | ✅ Running |
| monitoring | prometheus-node-exporter | ✅ Running |
| monitoring | prometheus | ✅ Running |

---

**Step 7 — Deploy all Kubernetes manifests using Kustomize:**
```bash
kubectl apply -k gitops/
```
> Instead of running `kubectl apply -f` on each YAML file individually, Kustomize bundles all manifests in the correct order and deploys them in a single command.

**Step 8 — Access ArgoCD UI:**
```bash
kubectl port-forward svc/argocd-server -n argocd 8080:80
```
```bash
kubectl get secret argocd-initial-admin-secret -n argocd \
  -o jsonpath="{.data.password}" | base64 -d
```
> ArgoCD UI: http://localhost:8080
<img width="908" height="463" alt="argoCd-app-0" src="https://github.com/user-attachments/assets/a4f7bb98-0f31-4e73-9247-614ab1c4c668" />

<img width="957" height="482" alt="pods-argoCd-sync" src="https://github.com/user-attachments/assets/64896f33-901a-4286-b226-b7dd954de71e" />

---

### PostgreSQL Restore

> **Important:** PostgreSQL starts completely empty inside Kubernetes. A restore job must be run to initialize the sub-databases required by each microservice.

After running the restore job, all service databases are initialized and the application becomes fully operational.

---

### Accessing Services via Port-Forward

| Service | Command | Local URL |
|---|---|---|
| Frontend App | `kubectl port-forward svc/frontend -n boutique 3005:3000` | http://localhost:3005 |
| Grafana | `kubectl port-forward svc/kube-prometheus-stack-grafana -n monitoring 3000:80` | http://localhost:3000 |
| Prometheus | `kubectl port-forward svc/kube-prometheus-stack-prometheus -n monitoring 9090:9090` | http://localhost:9090 |

> All monitoring services use `ClusterIP` by default (internal only). Port-forwarding tunnels them to your local machine for access.

---

## Phase 3 — CI/CD Pipeline with GitHub Actions

### Summary
GitHub Actions automates the entire build-and-push pipeline. On every push to `main`, the workflow builds updated Docker images, tags them with the Git commit SHA for traceability, and pushes them to Amazon ECR — ensuring ECR always has the latest production-ready images.

---

### GitHub Secrets Configuration

Navigate to: **GitHub → Repository → Settings → Secrets & Variables → Actions**

Add the following secrets:

| Secret Name | Description |
|---|---|
| `AWS_REGION` | AWS region (e.g., `ap-south-1`) |
| `AWS_ACCESS_KEY_ID` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `AWS_ACCOUNT_ID` | Your AWS account ID |

---

### CI/CD Workflow Configuration (`ci.yml`)

```yaml
env:
  AWS_REGION: ${{ secrets.AWS_REGION }}
  IMAGE_TAG: ${{ github.sha }}
```

> Each image is tagged with the Git commit SHA (`github.sha`), ensuring full traceability — every image in ECR maps to an exact commit in the repository.

---

### Trigger the Pipeline

**Make sure local is in sync with remote:**
```bash
git commit --allow-empty -m "trigger ci pipeline"
git push origin main
```
<img width="923" height="401" alt="git-pipeline" src="https://github.com/user-attachments/assets/41a85b0a-bb89-4fcb-85f9-cbbee46fd0f1" />

> After the pipeline succeeds, all 7 ECR repositories are updated with the latest image tags. The new images are then deployed to EKS.

---
<img width="944" height="473" alt="Github-pipelines" src="https://github.com/user-attachments/assets/dbc724d2-7924-43dc-b66d-868aaa4bd984" />

<img width="953" height="377" alt="ECR-latest-image-1" src="https://github.com/user-attachments/assets/7891b500-4956-4092-8492-5f88f198a9bd" />
#### ECR updated with latest image tags 
<img width="937" height="377" alt="ECR-latest-image-2" src="https://github.com/user-attachments/assets/0cde3f47-c940-4f7e-87ed-26a0cbd58c4a" />

## Phase 4 — AIOps Integration with AWS Bedrock

### Summary
This phase adds an AI brain to the DevOps workflow. Three AWS Lambda functions act as tools for an AWS Bedrock agent (named **Thorr**). Thorr understands natural language queries, decides which Lambda to invoke, and returns intelligent root-cause analysis and remediation recommendations. A Streamlit UI provides a conversational chat interface.

---

### AIOps Concepts

| Concept | Meaning |
|---|---|
| Foundational Model | Pre-trained large AI model — ready to use with no training required |
| Model as an API | Access AI via HTTP calls with no infrastructure to manage |
| Inference | The model takes input and returns output — the core act of using AI |
| Prompt Engineering | How you ask determines what you get — better prompts yield better results |
| System Prompt | Defines the AI's role and boundaries before any interaction begins |
| AI Agent | Not just answering — it decides steps and uses tools autonomously |
| Tool Calling | AI triggers external functions to fetch data or perform actions dynamically |
| Context Window | The AI's short-term memory — holds conversation history, logs, and context |
| Serverless | Run code without managing servers — pay only when the function executes |
| Event-Driven Architecture | Nothing runs until triggered — every action starts from an event |

---

### AWS Services Used in AIOps Phase

| Service | Role |
|---|---|
| AWS Bedrock | Managed platform to access foundation AI models via API |
| AWS Bedrock Agent | Adds reasoning so AI can analyze problems and take multi-step actions |
| AWS Lambda | Serverless functions executed on demand by the Bedrock agent |
| Amazon CloudWatch | Centralized log storage — queried by the fetch-logs Lambda |
| Streamlit | Interactive Python UI for chatting with Thorr |

---

### IAM Setup

**Step 1 — Attach additional policies to the EKS node role:**

| Policy | Purpose |
|---|---|
| `CloudWatchAgentServerPolicy` | Allows nodes to send metrics to CloudWatch |
| `FluentBitCloudWatchPolicy` (inline) | Allows FluentBit to write logs to CloudWatch |
| `CloudWatchFullAccess` | Full CloudWatch access for log streaming |

---

**Step 2 — Install FluentBit via Helm to export pod logs to CloudWatch:**

```bash
helm repo add aws https://aws.github.io/eks-charts
helm repo update aws
```

```bash
helm upgrade --install aws-for-fluent-bit aws/aws-for-fluent-bit \
  --namespace amazon-cloudwatch \
  --create-namespace \
  --set cloudWatch.enabled=true \
  --set cloudWatch.region=ap-south-1 \
  --set cloudWatch.logGroupName=/eks/boutique/pods \
  --set cloudWatch.logStreamPrefix=from-fluent-bit- \
  --set firehose.enabled=false \
  --set kinesis.enabled=false \
  --set elasticsearch.enabled=false
```

**Step 3 — Annotate the FluentBit service account with the IAM role:**

```bash
kubectl create serviceaccount aws-for-fluent-bit -n amazon-cloudwatch && \
  kubectl annotate serviceaccount aws-for-fluent-bit -n amazon-cloudwatch \
    eks.amazonaws.com/role-arn=arn:aws:iam::952893849284:role/eks-boutique-cluster-node-role && \
  echo "Done"
```

> Verify the CloudWatch log group `/eks/boutique/pods` is created in the CloudWatch console.

---

### Lambda IAM Role Setup

**Create role:** `aiops-lambda-role`

**Attach custom policy:** `aiops-read-access`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EKSReadAccess",
      "Effect": "Allow",
      "Action": [
        "eks:DescribeCluster",
        "eks:ListClusters",
        "eks:ListNodegroups",
        "eks:DescribeNodegroup"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudWatchReadAccess",
      "Effect": "Allow",
      "Action": [
        "cloudwatch:GetMetricStatistics",
        "cloudwatch:ListMetrics",
        "logs:FilterLogEvents",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams"
      ],
      "Resource": "*"
    }
  ]
}
```

---

### Expose Prometheus as a LoadBalancer for Lambda Access

> Since all monitoring services use ClusterIP (internal only), Prometheus must be patched to `LoadBalancer` so Lambda functions can reach it from outside the cluster.

```bash
kubectl patch svc kube-prometheus-stack-prometheus -n monitoring \
  -p '{"spec": {"type": "LoadBalancer"}}'
```

**Prometheus ELB URL:**
```
http://a7a47ee70451f4b91a4287199a560bc0-916215469.ap-south-1.elb.amazonaws.com:9090
```
#### Application access from EKS cluster
<img width="959" height="449" alt="app-eks-cluster" src="https://github.com/user-attachments/assets/ba952a7a-c076-47ba-b178-973b1d045f2d" />

<img width="959" height="478" alt="app-home1" src="https://github.com/user-attachments/assets/241c84fb-8971-41cb-8831-f8e2e63cb65a" />

<img width="959" height="485" alt="app-profile-eks" src="https://github.com/user-attachments/assets/556906c8-5a58-4d72-929a-a6b6be31745a" />

<img width="959" height="441" alt="monitoring-dashboard" src="https://github.com/user-attachments/assets/908e1bcf-f04e-41ec-97b8-c175ac4cf2c7" />

---

### Lambda Functions Summary

| Function | Data Source | What It Does |
|---|---|---|
| `aiops-fetch-logs` | Amazon CloudWatch | Filters pod logs by pattern (e.g., `ERROR`) for a configurable time window |
| `aiops-fetch-metrics` | Prometheus (via ELB) | Queries PromQL metrics (CPU, memory, restarts, replica availability) |
| `aiops-fetch-health` | EKS API + Prometheus | Checks cluster status, nodegroup health, deployment replicas, and crashing pods |

---

### Lambda Test Events

**Test event for `aiops-fetch-logs`:**
```json
{
  "parameters": [
    {"name": "filter_pattern", "value": "ERROR"},
    {"name": "log_group_name", "value": "/eks/boutique/pods"},
    {"name": "hours_back", "value": "1"},
    {"name": "region", "value": "ap-south-1"}
  ]
}
```

**Test event for `aiops-fetch-metrics`:**
```json
{
  "parameters": [
    {"name": "metric_name", "value": "pod_cpu_utilization"},
    {"name": "namespace", "value": "boutique"},
    {"name": "hours_back", "value": "1"}
  ]
}
```

---

### AWS Bedrock Agent Setup

**Agent IAM Role:** `aiops-bedrock-agent-role`

Trust policy (allows Bedrock to assume the role):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "bedrock.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

Permissions policy attached to the role:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BedrockModelInvoke",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:*::foundation-model/*",
        "arn:aws:bedrock:*:*:inference-profile/*"
      ]
    },
    {
      "Sid": "LambdaInvoke",
      "Effect": "Allow",
      "Action": "lambda:InvokeFunction",
      "Resource": "arn:aws:lambda:*:*:function:aiops-*"
    }
  ]
}
```

**Model used:** Qwen3 32B (dense) via AWS Bedrock

> Note: If using an Anthropic Claude model, a use-case submission form must be submitted and approved before access is granted.

---

### Deploy the Bedrock Agent

```bash
cd /projects/aiops-assistant
./deploy.sh
```

> After deployment, the agent (named **Thorr**) can be tested in the AWS Bedrock console.

---

### Launch Streamlit UI

```bash
# From the aiops-assistant project directory
streamlit run app.py
```

**Thorr AIOps Assistant is live at:** http://localhost:8501

---
<img width="937" height="455" alt="my-thor-agent" src="https://github.com/user-attachments/assets/6559df07-f954-4086-a1b7-feb3231065ff" />

<img width="910" height="432" alt="thorr-11" src="https://github.com/user-attachments/assets/ffd9a651-e82f-47d2-a3ab-f644a1bcff37" />


### Simulate a Failure (Test Thorr's Intelligence)

```bash
kubectl scale deployment orders --replicas=0
```

Then ask Thorr:
> *"Are all deployments healthy in the boutique namespace?"*

Thorr will detect the unavailable replicas, identify the root cause, and recommend remediation steps.
<img width="957" height="486" alt="some-issue-1" src="https://github.com/user-attachments/assets/b5d3a7c4-c977-466b-aff1-b547b292ecf3" />

<img width="957" height="486" alt="some-issue-1" src="https://github.com/user-attachments/assets/8aecb36a-1eef-4432-bdaa-48835a4261ee" />

<img width="919" height="449" alt="solution-1" src="https://github.com/user-attachments/assets/0d1d8d67-dc9d-47dc-8271-8608166d2024" />

---

## Monitoring Stack

| Pod | Role |
|---|---|
| **alertmanager** | Handles alerts from Prometheus — routes, groups, and silences them; sends to Slack/email/PagerDuty |
| **kube-prometheus-stack-grafana** | Visualizes cluster metrics via dashboards — CPU, memory, pod health, deployment trends |
| **kube-state-metrics** | Exports Kubernetes object state (pods, deployments, nodes) as Prometheus metrics |
| **prometheus-operator** | Manages and automates Prometheus/Alertmanager configuration using CRDs (ServiceMonitor, etc.) |
| **prometheus-node-exporter** | Collects node-level metrics (CPU, memory, disk, network) — runs on every node |

---

### Consolidated Access URLs

| Tool | Access Method | URL |
|---|---|---|
| Frontend App | Port-forward | http://localhost:3005 |
| ArgoCD | Port-forward | http://localhost:8080 |
| Grafana | Port-forward | http://localhost:3000 |
| Prometheus | Port-forward / ELB | http://localhost:9090 |
| Thorr AIOps UI | Streamlit | http://localhost:8501 |

> **Grafana credentials:** `admin` / `prom-operator`

---

## Pros & Real-World Comparison

### Project Advantages

| Feature | This Project | Traditional DevOps |
|---|---|---|
| Infrastructure provisioning | Automated with Terraform (minutes) | Manual AWS console clicks (hours) |
| Deployment strategy | GitOps via ArgoCD (auto-sync) | Manual `kubectl apply` commands |
| CI/CD | GitHub Actions (push-triggered, SHA-tagged) | Jenkins with manual configuration |
| Observability | Prometheus + Grafana + AlertManager | Siloed logging, limited dashboards |
| Incident response | AI agent (natural language queries) | Manual log grep, tribal knowledge |
| Log aggregation | FluentBit → CloudWatch (centralized) | SSH into pods, ephemeral logs |
| Scalability | EKS node autoscaling, Kustomize overlays | Static VM fleets |

### Real-World Parallels

- **Netflix / Spotify** use similar EKS + ArgoCD + Prometheus stacks at scale for hundreds of microservices.
- **AIOps** is increasingly adopted at companies like Dynatrace and PagerDuty — this project demonstrates the same pattern at a buildable, learnable scale.
- **GitOps** (ArgoCD) is the standard adopted by enterprises for compliance and auditability — every cluster change is traceable to a Git commit.
- **Immutable image tagging** (`github.sha`) mirrors the practice at companies like Uber and Airbnb where every production artifact is tied to a verifiable source commit.
- **Serverless tool-calling agents** (Lambda + Bedrock) reflect how modern SRE teams are beginning to automate Level-1 incident triage — reducing MTTR without paging humans for routine issues.

---

## Conclusion

This project demonstrates a **complete, production-aligned DevOps and AIOps lifecycle** — from local development to cloud-native deployment, with continuous delivery, full observability, and AI-powered operations.

**What makes this project stand out:**

- It is not a single-service tutorial. It handles the complexity of **7 interdependent microservices** with real database dependencies, secrets management, and inter-service networking.
- The **AIOps layer is genuinely useful** — Thorr can answer questions like *"Which pods are crashing and why?"* or *"Show me CPU trends for the last hour"* without any manual log digging.
- The **infrastructure is fully reproducible** — anyone can clone the repo, run `terraform apply`, trigger the CI pipeline, and have the entire stack live in under 30 minutes.
- The **observability stack is enterprise-grade** — the same Prometheus + Grafana + AlertManager combination used by organizations running thousands of pods in production.

This project bridges the gap between **learning DevOps concepts** and **understanding how they interconnect in a real production environment** — and takes it one step further by showing how **AI can reduce operational toil** in cloud-native systems.

---

*Built with ❤️ using AWS EKS, Terraform, ArgoCD, GitHub Actions, Prometheus, Grafana, AWS Bedrock, and Streamlit.*
