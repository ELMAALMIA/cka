# Lab 17 - Add CPU requests and limits

## Question

In namespace `ckad-resources`, update Deployment `web` so container `nginx` requests `100m` CPU and is limited to `300m` CPU. Redeploy the application.

## Expectation

- The request is `100m`.
- The limit is `300m`.
- Both replicas become available after the rollout.

## Setup

```bash
kubectl apply -f setup.yaml
```

## Answer steps

Apply a strategic merge patch:

```bash
kubectl -n ckad-resources patch deployment web --patch-file solution.yaml
kubectl -n ckad-resources rollout status deployment/web
```

An exam-friendly alternative is:

```bash
kubectl -n ckad-resources set resources deployment web \
  --containers=nginx --requests=cpu=100m --limits=cpu=300m
```

## Verification

```bash
kubectl -n ckad-resources get deployment web \
  -o jsonpath='{.spec.template.spec.containers[0].resources}{"\n"}'
kubectl -n ckad-resources get deployment web
```

## Cleanup

```bash
kubectl delete namespace ckad-resources
```

