# 🛍️ CloudBoutique — Full-Stack Microservices Platform with GitOps, AIOps & Observability

A production-grade, cloud-native e-commerce platform built on **7 microservices**, fully automated with **CI/CD**, managed via **GitOps**, monitored with **Prometheus & Grafana**, and enhanced with **AI-powered incident response** using AWS Bedrock + Claude.

---

## 📐 Project Overview

| Attribute | Details |
|-----------|---------|
| **Application** | Boutique E-Commerce Platform |
| **Architecture** | Microservices (7 services) |
| **Infrastructure** | AWS EKS + Terraform |
| **CI/CD** | GitHub Actions |
| **GitOps** | ArgoCD |
| **Observability** | Prometheus + Grafana |
| **AIOps** | AWS Bedrock + Claude LLM |
| **Container Registry** | Amazon ECR |
| **Database** | PostgreSQL (logically separated) |

---

## 📦 Microservices at a Glance

| Service | Port | Responsibility |
|---------|------|----------------|
| React Frontend | 3000 | User interface |
| Nginx Reverse Proxy | 80 | Traffic routing |
| API Gateway | 3001 | Single entry point for all services |
| Auth Service | 3002 | Authentication & authorization |
| Product Catalog | 3003 | Product listing and management |
| Orders Service | 3004 | Order placement and processing |
| Order Management | 3005 | Order tracking and lifecycle |
| User Management | 3006 | User profiles and accounts |
| Grafana | 3007 | Metrics visualization |

---

---

## Workflow 1 — System Architecture

### 📖 Explanation

The system follows a **layered microservices architecture**. The user's browser connects to a React frontend, which routes all backend calls through an Nginx reverse proxy. The reverse proxy forwards requests to an API Gateway that acts as a unified entry point — routing to the appropriate downstream service based on the request path.

All services share a single PostgreSQL instance that is **logically split into 4 isolated databases** — one per domain (auth, product, orders, users). This ensures service isolation without the overhead of running 4 separate database servers.

A dedicated **observability stack** (Prometheus + Grafana) sits alongside the services, continuously scraping metrics.

### 🛠️ Tech Stack

| Tool | Role | Why It's Useful |
|------|------|----------------|
| **React** | Frontend UI | Component-based, fast rendering for dynamic e-commerce pages |
| **Nginx** | Reverse Proxy | Lightweight, high-performance HTTP routing and load balancing |
| **API Gateway (Node.js)** | Request router | Single entry point — simplifies client communication |
| **PostgreSQL** | Relational DB | Reliable, ACID-compliant; logical DB separation enables service isolation |
| **Prometheus** | Metrics collection | Pull-based scraping with powerful query language (PromQL) |
| **Grafana** | Visualization | Rich dashboards for real-time and historical metrics |

### 🗺️ Architecture Diagram

```
                        ┌─────────────────────┐
                        │    User (Browser)    │
                        └─────────┬───────────┘
                                  │
                        ┌─────────▼───────────┐
                        │   React Frontend     │
                        │      :3000           │
                        └─────────┬───────────┘
                                  │
                        ┌─────────▼───────────┐
                        │   Nginx Reverse      │
                        │   Proxy              │
                        └─────────┬───────────┘
                                  │
                        ┌─────────▼───────────┐
                        │    API Gateway       │
                        │      :3001           │
                        └──┬──┬──┬──┬─────┬───┘
                           │  │  │  │     │
             ┌─────────────┘  │  │  │     └──────────────┐
             │         ┌──────┘  │  └──────┐             │
             ▼         ▼         ▼         ▼             ▼
        ┌─────────┐ ┌───────┐ ┌───────┐ ┌────────┐ ┌─────────┐
        │  Auth   │ │Product│ │Orders │ │Ord-Mgmt│ │  Users  │
        │  :3002  │ │ :3003 │ │ :3004 │ │ :3005  │ │  :3006  │
        └────┬────┘ └───┬───┘ └───┬───┘ └───┬────┘ └────┬────┘
             └──────────┴─────────┴──────────┴───────────┘
                                        │
                              ┌─────────▼──────────┐
                              │   PostgreSQL :5432  │
                              │  ┌────────────────┐ │
                              │  │ auth-db        │ │
                              │  │ product-db     │ │
                              │  │ orders-db      │ │
                              │  │ users-db       │ │
                              │  └────────────────┘ │
                              └────────────────────┘

        ┌─────────────────┐         ┌────────────────┐
        │  Prometheus      │────────▶│ Grafana :3007  │
        │  :9090           │         │  (Dashboards)  │
        └─────────────────┘         └────────────────┘
```

### 📝 Summary

- 7 microservices each with a dedicated responsibility and port
- Single API Gateway decouples the frontend from backend complexity
- Nginx handles reverse proxy and routing at the edge
- One PostgreSQL instance logically split into 4 databases — preventing tight coupling while keeping infrastructure lean
- Prometheus + Grafana observe the entire system

### ✅ Conclusion & Pros

- **Loose coupling** — Services can be deployed, scaled, and updated independently
- **Single entry point** — API Gateway simplifies client-side logic
- **Logical DB isolation** — Cheaper than 4 separate DB servers while maintaining domain separation
- **Real-time visibility** — Prometheus + Grafana give immediate insight into system health

**Real-time DevOps Scenario:** In a real e-commerce platform like Flipkart or Amazon, this is exactly how backend services are structured during a sale event — the product and order services scale independently without touching auth or user management.

---

---

## Workflow 2 — Local Development with Docker Compose

### 📖 Explanation

Before deploying to the cloud, the entire platform is tested locally using **Docker Compose**. A single command builds all service images, creates a shared internal Docker network, and starts all containers — including the database, Prometheus, and Grafana — in one go.

This allows developers to replicate the production environment on their local machines without needing cloud access.

### 🛠️ Tech Stack

| Tool | Role | Why It's Useful |
|------|------|----------------|
| **Docker** | Containerization | Consistent runtime across environments |
| **Docker Compose** | Multi-container orchestration | Single command to spin up the entire stack locally |
| **Shared Docker Network** | Internal service communication | Services talk to each other by name, no IP management |
| **PostgreSQL (public image)** | Local database | 4 logical databases seeded from one pulled image |

### 🗺️ Workflow Diagram

```
  Developer runs:
  $ docker-compose up --build
           │
           ▼
  ┌─────────────────────────────────────────────────┐
  │            Shared Docker Internal Network        │
  │                                                 │
  │  ┌──────────┐  ┌───────────┐  ┌─────────────┐  │
  │  │ Frontend │  │ API       │  │  Services   │  │
  │  │ :3000    │  │ Gateway   │  │  Auth       │  │
  │  └──────────┘  │ :3001     │  │  Product    │  │
  │                └───────────┘  │  Orders     │  │
  │  ┌──────────┐                 │  Ord-Mgmt   │  │
  │  │Prometheus│                 │  Users      │  │
  │  │ :9090    │                 └─────────────┘  │
  │  └──────────┘  ┌───────────┐                   │
  │  ┌──────────┐  │  Grafana  │                   │
  │  │PostgreSQL│  │  :3007    │                   │
  │  │ :5432    │  └───────────┘                   │
  │  │(4 logical│                                  │
  │  │   DBs)   │                                  │
  │  └──────────┘                                  │
  └─────────────────────────────────────────────────┘
```

### 📝 Summary

- `docker-compose up --build` builds all 7 service images and starts them together
- All services share an internal Docker network — communication happens via service names
- PostgreSQL is pulled as a public image with 4 logical databases configured
- Prometheus and Grafana run alongside the services for local observability testing

### ✅ Conclusion & Pros

- **Fast feedback loop** — Developers test the full stack locally before any cloud costs are incurred
- **Environment parity** — Docker ensures the local setup matches production containers
- **No dependency conflicts** — Each service runs in its own container with isolated dependencies
- **Onboarding simplicity** — New developers clone the repo and run one command to get started

**Real-time DevOps Scenario:** At any mature product company, Docker Compose is the standard tool used by developers to run the full service stack locally during feature development — before code even reaches a CI pipeline.

---

---

## Workflow 3a — Cloud Infrastructure with Terraform

### 📖 Explanation

Once local testing is complete, the cloud infrastructure is provisioned using **Terraform** — an Infrastructure as Code (IaC) tool. A single `terraform apply` provisions three independent modules in parallel: Networking, EKS (Kubernetes cluster), and ECR (container registry). Helm charts for ArgoCD and Prometheus are also installed via Terraform.

### 🛠️ Tech Stack

| Tool | Role | Why It's Useful |
|------|------|----------------|
| **Terraform** | Infrastructure as Code | Declarative, version-controlled cloud provisioning |
| **AWS VPC** | Networking | Isolated virtual network with subnets across 3 AZs for high availability |
| **AWS EKS** | Kubernetes cluster | Managed Kubernetes — no control plane maintenance |
| **AWS ECR** | Container registry | Private, secure storage for Docker images |
| **Spot Instances** | EKS worker nodes | Up to 70% cost savings vs on-demand nodes |
| **EBS CSI Driver** | Persistent storage | Enables persistent volumes for stateful workloads |
| **OIDC** | IAM integration | Allows Kubernetes pods to assume AWS IAM roles securely |
| **Helm + ArgoCD** | GitOps tooling | Installed via Terraform for automated app deployment |
| **Kube Prometheus Stack** | Observability | Full monitoring stack deployed via Helm |

### 🗺️ Workflow Diagram

```
  $ terraform apply
           │
           ▼
  ┌────────────────────────────────────────────────────────┐
  │                   Terraform Modules                     │
  │                                                        │
  │  ┌──────────────────┐  ┌────────────────┐  ┌────────┐ │
  │  │ Networking Module │  │   EKS Module   │  │  ECR   │ │
  │  │                  │  │                │  │ Module │ │
  │  │ • VPC            │  │ • Cluster      │  │        │ │
  │  │ • Subnets (3 AZs)│  │ • Spot Nodes   │  │ 7 repos│ │
  │  │ • IGW            │  │ • IAM Roles    │  │ (one   │ │
  │  │ • Route Tables   │  │ • OIDC         │  │  per   │ │
  │  │                  │  │ • EBS CSI      │  │service)│ │
  │  └────────┬─────────┘  └───────┬────────┘  └───┬────┘ │
  │           │                    │               │      │
  └───────────┼────────────────────┼───────────────┼──────┘
              ▼                    ▼               ▼
         AWS VPC              EKS Cluster     ECR Repos
      10.1.0.0/16          (managed K8s)   (private images)
      3 AZs HA

                                   │
                                   ▼
                        ┌──────────────────────┐
                        │  Helm Installs via    │
                        │  Terraform            │
                        │                      │
                        │  • ArgoCD            │
                        │  • Kube Prometheus   │
                        │    Stack             │
                        └──────────────────────┘
```

### 📝 Summary

- Terraform provisions all AWS infrastructure declaratively in one command
- VPC spans 3 Availability Zones for high availability and fault tolerance
- EKS uses Spot instances to reduce compute costs significantly
- 7 separate ECR repositories store images for each microservice independently
- ArgoCD and Prometheus are installed automatically via Helm during provisioning

### ✅ Conclusion & Pros

- **Repeatability** — Infrastructure can be destroyed and re-created identically at any time
- **Version control** — All infra changes are tracked in Git like application code
- **Cost efficiency** — Spot instances dramatically reduce cloud bills
- **HA by design** — Multi-AZ VPC ensures service availability even if one zone fails
- **GitOps-ready** — ArgoCD and Prometheus are pre-installed as part of infra provisioning

**Real-time DevOps Scenario:** Every major cloud-native company (Netflix, Uber, Airbnb) uses Terraform to manage their cloud infrastructure. Running infra-as-code means a team can spin up a full staging environment in minutes and tear it down after testing to save costs.

---

---

## Workflow 3b — CI/CD Pipeline with GitHub Actions

### 📖 Explanation

Every code push to the `project-demo` branch triggers an automated CI/CD pipeline via **GitHub Actions**. The key innovation here is the **matrix build strategy** — all 7 services are built, tagged, and pushed to ECR **in parallel**, dramatically reducing total pipeline time. Each image is tagged with the Git commit SHA, ensuring traceability from deployment back to the exact code change.

### 🛠️ Tech Stack

| Tool | Role | Why It's Useful |
|------|------|----------------|
| **GitHub Actions** | CI/CD automation | Native to GitHub, no separate CI server needed |
| **Matrix Build Strategy** | Parallel job execution | Builds all 7 services simultaneously instead of sequentially |
| **Amazon ECR** | Image registry | Secure, private storage for production images |
| **Commit SHA tagging** | Image versioning | Every image is traceable to the exact code commit |
| **Docker** | Image build | Consistent containerization for all services |

### 🗺️ Workflow Diagram

```
  Developer: git push → project-demo branch
                    │
                    ▼
         GitHub Actions triggers ci.yaml
                    │
                    ▼
         ┌──────────────────────┐
         │  Matrix Build        │
         │  (7 services, all    │
         │   in parallel)       │
         └──┬──┬──┬──┬──┬──┬───┘
            │  │  │  │  │  │
    ┌───────┘  │  │  │  │  └────────┐
    │     ┌────┘  │  │  └────┐      │
    ▼     ▼       ▼  ▼       ▼      ▼
  ┌────┐┌───────┐┌──────┐┌───────┐┌──────┐
  │Auth││Product││Orders││Ord-Mgmt││Users │  +2
  └─┬──┘└───┬───┘└───┬──┘└───┬───┘└──┬───┘
    │        │        │       │       │
    └────────┴────────┴───────┴───────┘
                       │
                       ▼
           Each service job performs:
           ┌──────────────────────────┐
           │ 1. Checkout code          │
           │ 2. Build Docker image     │
           │ 3. Tag with commit SHA    │
           │    (e.g. auth:<sha>)      │
           │ 4. Push to ECR repository │
           └──────────────────────────┘
```

### 📝 Summary

- Git push to `project-demo` automatically triggers the GitHub Actions workflow
- Matrix strategy runs all 7 service build jobs in parallel — not sequentially
- Each image is tagged with the Git commit SHA for full traceability
- Images are pushed to their respective private ECR repositories
- No manual Docker builds or deployments — fully automated

### ✅ Conclusion & Pros

- **Speed** — Parallel matrix builds cut pipeline time to the duration of the slowest single service
- **Traceability** — Commit SHA tagging means any running pod can be traced back to a specific code change
- **Automation** — Zero manual steps from code push to image in registry
- **Safety** — Only the `project-demo` branch triggers production builds — controlled promotion

**Real-time DevOps Scenario:** At companies like Spotify or LinkedIn, hundreds of microservices are built and pushed to registries simultaneously via parallel CI pipelines every day. Matrix builds are the standard approach to prevent CI from becoming a bottleneck as service count grows.

---

---

## Workflow 4 — Observability with Prometheus & Grafana

### 📖 Explanation

Every microservice exposes a `/metrics` endpoint. **ServiceMonitor** resources (a Prometheus Operator CRD) tell Prometheus exactly which pods to scrape and how often. Prometheus pulls metrics every 15 seconds and stores them as time-series data. Grafana connects to Prometheus as a data source and renders the metrics into rich, real-time dashboards.

### 🛠️ Tech Stack

| Tool | Role | Why It's Useful |
|------|------|----------------|
| **`/metrics` endpoint** | Metrics exposure | Each service self-reports health and performance data |
| **ServiceMonitor (CRD)** | Scrape configuration | Kubernetes-native way to configure Prometheus scraping per service |
| **Prometheus** | Time-series database | Stores, indexes, and queries metrics with PromQL |
| **Grafana** | Dashboard & alerting | Visual layer for metrics — supports alerts, annotations, panels |
| **Kube Prometheus Stack** | Full observability bundle | Includes Prometheus, Grafana, and Alert Manager pre-configured for K8s |

### 🗺️ Workflow Diagram

```
  ┌────────┐  ┌─────────┐  ┌────────┐  ┌──────────┐  ┌───────┐
  │  Auth  │  │ Product │  │ Orders │  │ Ord-Mgmt │  │ Users │  +2
  └───┬────┘  └────┬────┘  └───┬────┘  └────┬─────┘  └───┬───┘
      │             │           │             │             │
  /metrics      /metrics    /metrics      /metrics      /metrics
      │             │           │             │             │
      └─────────────┴───────────┴─────────────┴─────────────┘
                                      │
                                      ▼
                          ┌───────────────────────┐
                          │    ServiceMonitor      │
                          │  (K8s CRD — defines   │
                          │   which pods to scrape │
                          │   and on what path)    │
                          └───────────┬───────────┘
                                      │
                                      ▼
                          ┌───────────────────────┐
                          │      Prometheus        │
                          │  • Scrapes every 15s   │
                          │  • Stores time-series  │
                          │  • PromQL queries      │
                          └───────────┬───────────┘
                                      │
                                      ▼
                          ┌───────────────────────┐
                          │    Grafana Dashboards  │
                          │  • Service health      │
                          │  • Request rates       │
                          │  • Error rates         │
                          │  • Latency percentiles │
                          └───────────────────────┘
```

### 📝 Summary

- All 7 services expose a `/metrics` endpoint following the Prometheus exposition format
- ServiceMonitor CRDs declaratively configure which pods Prometheus should scrape
- Prometheus scrapes every 15 seconds and stores metrics as time-series
- Grafana provides real-time dashboards — request rates, error rates, latency, pod health
- The full stack is deployed via the Kube Prometheus Stack Helm chart

### ✅ Conclusion & Pros

- **Proactive monitoring** — Issues are caught before users report them
- **Kubernetes-native** — ServiceMonitors auto-update as pods scale up or down
- **PromQL power** — Complex queries like p99 latency by service, error rate spikes
- **Zero config drift** — ServiceMonitors are in Git, so scrape configs are version-controlled
- **Unified view** — One Grafana dashboard shows the health of all 7 services at once

**Real-time DevOps Scenario:** During high-traffic events (like a flash sale), the SRE team at an e-commerce company watches Grafana dashboards live. If order service latency spikes above SLA thresholds, Grafana alerts fire before customers even start complaining.

---

---

## Workflow 5 — GitOps with ArgoCD

### 📖 Explanation

GitOps treats the **Git repository as the single source of truth** for Kubernetes deployments. When a developer updates the image tag in a Kubernetes manifest and pushes to `project-demo`, **ArgoCD** — which continuously watches the repository — detects the change and automatically applies the new manifests to the cluster. With `prune=true` and `self-heal=true`, ArgoCD removes stale resources and corrects any manual drift.

### 🛠️ Tech Stack

| Tool | Role | Why It's Useful |
|------|------|----------------|
| **ArgoCD** | GitOps controller | Continuously syncs K8s cluster state with Git repository |
| **Git (project-demo branch)** | Source of truth | All deployment configs live in version control |
| **Kubernetes Manifests** | Deployment definitions | Declarative desired state for every service |
| **Rolling Updates** | Zero-downtime deploys | Kubernetes replaces pods gradually, no service interruption |
| **Self-Heal** | Drift correction | ArgoCD reverts any manual changes made directly to the cluster |
| **Prune** | Cleanup | Removes resources from cluster that are deleted from Git |

### 🗺️ Workflow Diagram

```
  Developer updates image tag in manifest:
  e.g.  image: <ecr-url>/auth:<new-commit-sha>
                    │
                    ▼
      git commit + push → project-demo
                    │
                    ▼
  ┌─────────────────────────────────────────┐
  │              ArgoCD                      │
  │  • Watches Git repo continuously         │
  │  • Detects manifest change               │
  │  • prune=true  → removes old resources  │
  │  • self-heal=true → fixes manual drift  │
  └─────────────────┬───────────────────────┘
                    │
                    ▼
         Applies updated manifests
         to Kubernetes cluster
                    │
                    ▼
  ┌─────────────────────────────────────────┐
  │        Kubernetes Rolling Update         │
  │                                         │
  │  Old Pod ──▶ Terminating                │
  │  New Pod ──▶ Scheduled → Running        │
  │  (gradual replacement, no downtime)     │
  └─────────────────────────────────────────┘
                    │
                    ▼
         DB seeded on first deploy
         (init containers / migration jobs)
```

### 📝 Summary

- Git is the single source of truth — no `kubectl apply` commands run manually
- ArgoCD continuously polls the repository and syncs the cluster to match Git state
- `prune=true` ensures deleted manifests are removed from the cluster automatically
- `self-heal=true` reverts any out-of-band manual changes to the cluster
- Kubernetes Rolling Updates ensure zero downtime during deployments
- Database seeding happens automatically on the first deployment

### ✅ Conclusion & Pros

- **Auditability** — Every deployment is a Git commit with author, timestamp, and diff
- **Rollback in seconds** — `git revert` + push instantly rolls back a broken deployment
- **No manual kubectl** — Eliminates human error from production deployments
- **Drift prevention** — Self-healing ensures the cluster always matches Git
- **Security** — No one needs direct `kubectl` access to production — Git is the interface

**Real-time DevOps Scenario:** At companies like Weaveworks (the inventors of GitOps), teams push hundreds of deployments daily without anyone running a single `kubectl apply`. If a bad image breaks production, a `git revert` restores service in under a minute.

---

---

## Workflow 6 — AIOps with AWS Bedrock + Claude

### 📖 Explanation

The final layer adds **AI-powered incident response**. Application logs and infrastructure metrics are shipped to **AWS CloudWatch**. An integration layer feeds these into **AWS Bedrock**, which invokes the **Claude LLM** to analyze the data. Instead of raw log lines or metric numbers, the engineer receives a **natural language diagnosis** — e.g., *"503 errors — PostgreSQL connection pool exhausted"* — along with actionable recommendations. The engineer then acts on the insight rather than spending hours digging through logs.

### 🛠️ Tech Stack

| Tool | Role | Why It's Useful |
|------|------|----------------|
| **AWS CloudWatch (Logs)** | Log aggregation | Centralized store for all service application logs |
| **AWS CloudWatch (Metrics)** | Metrics aggregation | Infrastructure and application metrics in one place |
| **AWS Bedrock** | LLM hosting platform | Managed, serverless access to foundation models |
| **Claude LLM** | AI reasoning engine | Analyzes logs + metrics together and generates human-readable insights |
| **AI DevOps Assistant** | Response interface | Delivers actionable, plain-English diagnosis to the engineer |

### 🗺️ Workflow Diagram

```
  ┌─────────────────────────┐     ┌──────────────────────────┐
  │   Application Logs      │     │   Infrastructure Metrics  │
  │   (all 7 services)      │     │   (CPU, memory, latency)  │
  └────────────┬────────────┘     └───────────────┬──────────┘
               │                                  │
               ▼                                  ▼
  ┌─────────────────────────┐     ┌──────────────────────────┐
  │   AWS CloudWatch Logs   │     │  AWS CloudWatch Metrics   │
  └────────────┬────────────┘     └───────────────┬──────────┘
               │                                  │
               └──────────────┬───────────────────┘
                              │
                              ▼
                 ┌────────────────────────┐
                 │     AWS Bedrock         │
                 │  (Claude LLM invoked)   │
                 │                        │
                 │  Analyzes:             │
                 │  • Error patterns      │
                 │  • Metric anomalies    │
                 │  • Correlated events   │
                 └────────────┬───────────┘
                              │
                              ▼
                 ┌────────────────────────┐
                 │  AI DevOps Assistant   │
                 │  Response (plain text) │
                 │                        │
                 │  "503 errors detected. │
                 │   Root cause: PostgreSQL│
                 │   connection pool      │
                 │   exhausted. Recommend:│
                 │   increase pool size   │
                 │   or add read replica."│
                 └────────────┬───────────┘
                              │
                              ▼
                    Engineer acts on insight
                    (targeted fix, not hours
                     of log digging)
```

### 📝 Summary

- All service logs are shipped to AWS CloudWatch Logs automatically
- Infrastructure and application metrics flow into CloudWatch Metrics
- AWS Bedrock invokes Claude LLM to correlate logs and metrics together
- Claude generates a natural language root cause analysis and remediation steps
- Engineers receive actionable insights in plain English — drastically reducing Mean Time To Resolution (MTTR)

### ✅ Conclusion & Pros

- **Reduced MTTR** — AI pinpoints root cause in seconds vs hours of manual log analysis
- **Correlation** — Claude analyzes logs AND metrics together — something humans struggle to do at scale
- **Natural language** — No need to write complex CloudWatch Insights queries
- **Scalable** — As service count grows, AI scales with it — no additional human effort
- **Proactive** — Can be configured to alert before incidents escalate

**Real-time DevOps Scenario:** A production 503 spike at 2 AM triggers a CloudWatch alarm. Instead of waking up an engineer to manually grep through thousands of log lines, the AIOps pipeline has already diagnosed the issue — "PostgreSQL connection pool exhausted on orders-db — 47 connections waiting" — and the engineer simply applies the fix. On-call burden drops dramatically.

---

---

## 🔁 End-to-End Flow Summary

```
  Developer writes code
         │
         ▼
  git push → project-demo
         │
         ├──▶ GitHub Actions CI/CD
         │    (matrix build → 7 ECR images tagged with SHA)
         │
         ├──▶ ArgoCD GitOps
         │    (detects manifest update → rolling deploy to EKS)
         │
         ├──▶ Prometheus + Grafana
         │    (scrapes /metrics → dashboards + alerts)
         │
         └──▶ CloudWatch + Bedrock + Claude
              (logs + metrics → AI diagnosis → engineer insight)
```

---

## 🏁 Overall Conclusion

**CloudBoutique** is a blueprint for a **production-ready, cloud-native microservices platform** that integrates every major pillar of modern DevOps engineering:

- **Infrastructure as Code** (Terraform) — reproducible, auditable cloud environments
- **Containerization** (Docker + EKS) — consistent, scalable service deployment
- **Automated CI/CD** (GitHub Actions) — fast, parallel, traceable builds
- **GitOps** (ArgoCD) — Git as the single source of deployment truth
- **Full-Stack Observability** (Prometheus + Grafana) — real-time visibility across all services
- **AIOps** (AWS Bedrock + Claude) — AI-powered incident detection and diagnosis

This project demonstrates that a small team can operate a complex microservices platform at scale — with confidence, speed, and minimal manual intervention — by combining the right tools with the right automation philosophy.

---

## 📚 References

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest)
- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [Prometheus Operator](https://prometheus-operator.dev/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [AWS Bedrock](https://aws.amazon.com/bedrock/)
- [Kube Prometheus Stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack)
