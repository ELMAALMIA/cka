# CKAD 2026 Exam Preparation Labs

Seventeen hands-on labs covering common CKAD tasks. Each lab is self-contained and designed for command-line practice under time pressure.

## Prerequisites

- Kubernetes cluster (kind, minikube, Docker Desktop, or a remote practice cluster)
- `kubectl` configured for the cluster
- Docker for Lab 14
- An Ingress controller for Labs 07 and 08

## Recommended workflow

1. Open a lab directory and read only its **Question** and **Expectation** sections.
2. Run the setup command from that directory.
3. Solve the task without reading **Answer steps**.
4. Run the verification commands.
5. Compare your work with `solution.yaml` or the documented answer.
6. Run the cleanup command before moving to the next lab.

Use a fresh namespace for every lab. The setup manifests create the required namespace and starting resources.

## Lab index

| # | Topic | Directory |
|---|---|---|
| 01 | Secret-backed environment variables | [`labs/01-secret-env`](labs/01-secret-env) |
| 02 | Rolling update and rollback | [`labs/02-rolling-update`](labs/02-rolling-update) |
| 03 | Pod CPU request and namespace limit | [`labs/03-pod-resource-constraint`](labs/03-pod-resource-constraint) |
| 04 | Replace a deprecated API version | [`labs/04-deprecated-api`](labs/04-deprecated-api) |
| 05 | Update container name and image | [`labs/05-container-update`](labs/05-container-update) |
| 06 | CronJob every 30 minutes | [`labs/06-cronjob`](labs/06-cronjob) |
| 07 | Create an Ingress | [`labs/07-create-ingress`](labs/07-create-ingress) |
| 08 | Troubleshoot an inaccessible Ingress | [`labs/08-fix-ingress`](labs/08-fix-ingress) |
| 09 | Create a 20% canary deployment | [`labs/09-canary-deployment`](labs/10-canary-deployment) |
| 10 | Security context and capabilities | [`labs/10-security-context`](labs/10-security-context) |
| 11 | NetworkPolicy | [`labs/11-network-policy`](labs/11-network-policy) |
| 12 | Build and export a Docker image | [`labs/12-docker-image-export`](labs/12-docker-image-export) |
| 13 | Diagnose and fix a ServiceAccount/RBAC issue | [`labs/13-serviceaccount-rbac`](labs/13-serviceaccount-rbac) |
| 14 | Assign a ServiceAccount to a workload | [`labs/14-workload-serviceaccount`](labs/14-workload-serviceaccount) |
| 15 | Update a liveness probe | [`labs/15-liveness-probe`](labs/15-liveness-probe) |
| 16 | Expose a Deployment with NodePort | [`labs/16-nodeport-service`](labs/16-nodeport-service) |
| 17 | Deployment CPU requests and limits | [`labs/17-deployment-resources`](labs/17-deployment-resources) |

## Exam habits

- Set the namespace early: `kubectl config set-context --current --namespace=<namespace>`.
- Prefer imperative commands when they are faster, then use `--dry-run=client -o yaml` when a manifest is needed.
- Use `kubectl explain`, `kubectl get -o yaml`, `kubectl describe`, logs, and events instead of guessing.
- Verify every change from the API server, not only from a local file.
- Use `kubectl rollout status`, rollout history, and rollback commands for Deployments.
- Do not modify resources the question explicitly says must remain unchanged.
