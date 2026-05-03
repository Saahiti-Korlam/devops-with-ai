# 🛍️ CloudBoutique — Cloud-Native Microservices Platform with GitOps, CI/CD, Observability & AIOps

---

## 📌 Introduction

**CloudBoutique** is a production-grade, cloud-native e-commerce platform built on 7 microservices — spanning a React frontend, Nginx reverse proxy, API Gateway, and dedicated services for Auth, Products, Orders, Order Management, and Users — all backed by a logically isolated PostgreSQL database. The platform is first validated locally using Docker Compose, where the entire stack spins up on a shared internal network with a single command, ensuring environment parity before any cloud resources are touched. Cloud infrastructure is then provisioned declaratively using Terraform, creating a multi-AZ AWS VPC, a cost-optimized EKS cluster running on Spot instances, and 7 private ECR repositories — one per service.

Every code push to the repository triggers a GitHub Actions CI/CD pipeline that leverages a matrix build strategy to build, tag, and push all 7 service images to ECR in parallel, with each image stamped with the commit SHA for full traceability. Deployments to Kubernetes are handled entirely through GitOps using ArgoCD, which continuously watches the repository and applies manifest changes automatically — with self-healing and pruning enabled to prevent configuration drift. The platform's health is continuously monitored through Prometheus, which scrapes `/metrics` endpoints from every service every 15 seconds, feeding real-time data into Grafana dashboards for full visibility into request rates, error rates, and latency. Topping it all off, an AIOps layer built on AWS Bedrock and Claude LLM ingests application logs and infrastructure metrics from CloudWatch, correlates them intelligently, and delivers plain-English root cause analysis to engineers — reducing incident resolution time dramatically.

---

## 📝 Summary

| Workflow | What It Does |
|----------|-------------|
| **1. System Architecture** | 7 microservices behind an API Gateway, Nginx reverse proxy, logically isolated PostgreSQL, and a Prometheus + Grafana observability sidebar |
| **2. Local Dev — Docker Compose** | Full platform stack spun up locally with one command; shared Docker network, environment parity with production |
| **3. Cloud Infrastructure — Terraform** | Multi-AZ VPC, EKS cluster (Spot nodes), 7 ECR repositories, and Helm-based ArgoCD + Prometheus stack — all provisioned as code |
| **4. CI/CD — GitHub Actions** | Matrix build strategy runs all 7 service pipelines in parallel; images tagged with commit SHA and pushed to ECR automatically |
| **5. GitOps — ArgoCD** | Git is the single source of truth; ArgoCD syncs cluster state on every manifest push with self-heal and prune enabled |
| **6. Observability — Prometheus + Grafana** | Every service exposes `/metrics`; ServiceMonitors configure scraping; Grafana dashboards visualize health across all services |
| **7. AIOps — AWS Bedrock + Claude** | Logs and metrics from CloudWatch are analyzed by Claude LLM via AWS Bedrock; engineers receive plain-English root cause analysis |

### Key Highlights

- **7 microservices** independently deployable, scalable, and observable
- **Single `docker-compose up`** reproduces the full production stack locally
- **One `terraform apply`** provisions the entire AWS infrastructure from scratch
- **Parallel CI builds** reduce pipeline time to the duration of the slowest single service
- **Zero manual `kubectl apply`** — all deployments flow through Git via ArgoCD
- **15-second metric scrape intervals** across all services for near real-time monitoring
- **AI-powered incident response** cuts Mean Time To Resolution (MTTR) dramatically
- **Commit SHA image tagging** provides end-to-end deployment traceability

---

## 🛠️ Overall Tech Stack

### Application Layer
| Technology | Purpose |
|------------|---------|
| **React** | Frontend UI — component-based, dynamic e-commerce interface |
| **Nginx** | Reverse proxy — routes external traffic to the API Gateway |
| **Node.js / API Gateway** | Unified entry point — routes requests to downstream microservices |
| **Microservices (×5)** | Auth, Product, Orders, Order Management, Users — each independently deployable |
| **PostgreSQL** | Relational database — one instance logically split into 4 isolated databases |

### Local Development
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization — consistent runtime across all environments |
| **Docker Compose** | Multi-container orchestration — spins up the full stack with one command |

### Cloud Infrastructure
| Technology | Purpose |
|------------|---------|
| **Terraform** | Infrastructure as Code — declarative, version-controlled AWS provisioning |
| **AWS VPC** | Isolated virtual network — multi-AZ for high availability |
| **AWS EKS** | Managed Kubernetes — no control plane maintenance overhead |
| **AWS ECR** | Private container registry — one repository per microservice |
| **Spot Instances** | Cost-optimized EKS worker nodes — up to 70% savings vs on-demand |
| **EBS CSI Driver** | Persistent storage for stateful workloads in Kubernetes |
| **AWS IAM + OIDC** | Secure pod-level AWS permissions without static credentials |
| **Helm** | Kubernetes package manager — installs ArgoCD and Prometheus stacks |

### CI/CD
| Technology | Purpose |
|------------|---------|
| **GitHub Actions** | CI/CD automation — triggered on every push to the target branch |
| **Matrix Build Strategy** | Parallel job execution — all 7 services built simultaneously |
| **Commit SHA Tagging** | Image versioning — every image traceable to its exact code commit |

### GitOps & Deployment
| Technology | Purpose |
|------------|---------|
| **ArgoCD** | GitOps controller — continuously syncs cluster with Git repository |
| **Kubernetes** | Container orchestration — rolling updates, self-healing, scaling |
| **Kubernetes Manifests** | Declarative desired state definitions for every service |

### Observability
| Technology | Purpose |
|------------|---------|
| **Prometheus** | Metrics collection — scrapes `/metrics` endpoints every 15 seconds |
| **Grafana** | Visualization — real-time dashboards for all services |
| **ServiceMonitor (CRD)** | Kubernetes-native Prometheus scrape configuration per service |
| **Kube Prometheus Stack** | Helm chart bundling Prometheus, Grafana, and Alertmanager |

### AIOps
| Technology | Purpose |
|------------|---------|
| **AWS CloudWatch Logs** | Centralized log aggregation from all microservices |
| **AWS CloudWatch Metrics** | Infrastructure and application metrics aggregation |
| **AWS Bedrock** | Managed, serverless foundation model hosting |
| **Claude LLM** | AI reasoning — correlates logs and metrics, generates natural language diagnosis |

---

## 🏁 Conclusion

CloudBoutique demonstrates what a modern DevOps lifecycle looks like end-to-end — from writing code on a local machine to running a fully observed, self-healing, AI-assisted platform on AWS. Each workflow builds on the previous one: Docker Compose validates the stack locally, Terraform provisions a production-ready cloud environment, GitHub Actions automates every build, ArgoCD ensures deployments are always in sync with Git, Prometheus and Grafana provide continuous visibility, and AWS Bedrock with Claude LLM turns raw logs and metrics into actionable intelligence.

The result is a platform where a small engineering team can confidently ship changes multiple times a day, trust that the infrastructure matches what is in Git, catch performance issues before users notice them, and resolve incidents faster with the help of AI — without needing to manually dig through thousands of log lines at 2 AM.

CloudBoutique is not just an e-commerce application — it is a **reference architecture** for building, deploying, and operating cloud-native microservices platforms with the tools and practices that modern DevOps and platform engineering teams rely on every day.

---

## 📚 References

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest)
- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [Prometheus Operator](https://prometheus-operator.dev/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS Bedrock](https://aws.amazon.com/bedrock/)
- [Kube Prometheus Stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack)
- [Docker Compose](https://docs.docker.com/compose/)
