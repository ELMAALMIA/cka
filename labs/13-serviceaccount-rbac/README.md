# Lab 13 - Diagnose and correct a ServiceAccount/RBAC issue

## Question

Deployment `inspector` in namespace `ckad-rbac` is running, but its logs contain errors. Inspect the logs to identify the issue, then review the available ServiceAccounts and their existing RBAC permissions to determine which ServiceAccount can resolve it. Update only the Deployment to use that ServiceAccount and verify that the errors are resolved. Do not modify ServiceAccounts, Roles, or RoleBindings.

## Expectation

- Logs identify a `Forbidden` RBAC failure.
- The initial Deployment uses `default`, which has no Pod-listing permissions in this lab.
- You compare the permissions bound to each ServiceAccount.
- The Deployment remains running despite the authorization error; a running Pod does not imply its API requests are authorized.
- Deployment uses the existing ServiceAccount authorized to list Pods in `ckad-rbac`.
- Only the Deployment's `serviceAccountName` is changed; existing RBAC permissions remain unchanged.
- New Pod logs show a successful Pod listing.

## Setup

```bash
kubectl apply -f setup.yaml
kubectl -n ckad-rbac rollout status deployment/inspector
```

The container uses `alpine/kubectl:1.34.1`, which includes `/bin/sh`, `kubectl`,
and `sleep` for the diagnostic loop. Use a kubectl image within one minor version
of your cluster's Kubernetes version.

If an older copy of this setup produces `ErrImagePull` for
`bitnami/kubectl:1.30`, reapply the updated `setup.yaml`; that old image tag is
unavailable. For other image-pull failures, inspect the Pod's Events:

```bash
kubectl -n ckad-rbac describe pods -l app=inspector
```

The lab's intended failure is `Forbidden` in the logs of a running container,
not an image-pull failure.

## Answer steps

Inspect symptoms and RBAC:

```bash
kubectl -n ckad-rbac logs deployment/inspector
kubectl -n ckad-rbac get deployment inspector \
  -o jsonpath='{.spec.template.spec.serviceAccountName}{"\n"}'
kubectl -n ckad-rbac get serviceaccounts
kubectl -n ckad-rbac get roles
kubectl -n ckad-rbac get rolebindings
kubectl -n ckad-rbac describe role read-pod-logs
kubectl -n ckad-rbac describe role read-pods
kubectl -n ckad-rbac describe rolebinding log-reader-binding
kubectl -n ckad-rbac describe rolebinding pod-reader-binding
kubectl auth can-i list pods \
  --as=system:serviceaccount:ckad-rbac:default -n ckad-rbac
kubectl auth can-i list pods \
  --as=system:serviceaccount:ckad-rbac:log-reader -n ckad-rbac
kubectl auth can-i list pods \
  --as=system:serviceaccount:ckad-rbac:pod-reader -n ckad-rbac
```

Expected results: `no` for `default` and `log-reader`, `yes` for `pod-reader`. The initial logs
identify `system:serviceaccount:ckad-rbac:default` as unable to list resource
`pods` in namespace `ckad-rbac`. The loop continues after each failed request, so
the container stays running.

> These impersonation checks require your operator account to have impersonation
> permissions, as a local cluster administrator normally does.

Update the Deployment:

```bash
kubectl -n ckad-rbac patch deployment inspector --patch-file solution.yaml
kubectl -n ckad-rbac rollout status deployment/inspector
```

## Verification

```bash
kubectl -n ckad-rbac get deployment inspector \
  -o jsonpath='{.spec.template.spec.serviceAccountName}{"\n"}'
kubectl -n ckad-rbac logs deployment/inspector
```

Expected ServiceAccount: `pod-reader`. The Pod template change creates a new Pod;
its logs should list Pods without a `Forbidden` error.

## Cleanup

```bash
kubectl delete namespace ckad-rbac
```
