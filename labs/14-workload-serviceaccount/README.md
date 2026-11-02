# Lab 14 - Assign a ServiceAccount to a workload

## Question

Deployment `application` in namespace `ckad-workload-sa` currently uses the namespace's `default` ServiceAccount. Update it to use existing ServiceAccount `application-sa`.

## Expectation

- Pod template sets `serviceAccountName: application-sa`.
- A new Pod is created by the Deployment.
- The running Pod reports `application-sa` as its ServiceAccount.

## Setup

```bash
kubectl apply -f setup.yaml
```

## Answer steps

```bash
kubectl -n ckad-workload-sa patch deployment application \
  --patch-file solution.yaml
kubectl -n ckad-workload-sa rollout status deployment/application
```

Editing alternative:

```bash
kubectl -n ckad-workload-sa edit deployment application
```

Add `serviceAccountName: application-sa` under `spec.template.spec`.

## Verification

```bash
kubectl -n ckad-workload-sa get deployment application \
  -o jsonpath='{.spec.template.spec.serviceAccountName}{"\n"}'
kubectl -n ckad-workload-sa get pods \
  -o custom-columns=NAME:.metadata.name,SERVICEACCOUNT:.spec.serviceAccountName,STATUS:.status.phase
```

## Cleanup

```bash
kubectl delete namespace ckad-workload-sa
```

