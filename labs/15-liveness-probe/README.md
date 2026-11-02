# Lab 15 - Configure a liveness probe

## Question

Deployment `web` in namespace `ckad-probe` is running without a liveness probe. Configure an HTTP GET liveness probe for container `web` on path `/healthz`, port `8080`, with initial delay `10` seconds and period `10` seconds.

## Expectation

- The probe uses HTTP GET `/healthz` on port `8080`.
- Timing fields match the question.
- The new liveness probe succeeds and the replacement Pod remains running without repeated restarts.

## Setup

```bash
kubectl apply -f setup.yaml
kubectl -n ckad-probe rollout status deployment/web
```

The application uses `registry.k8s.io/e2e-test-images/agnhost:2.53` with
`netexec --http-port=8080`. Its built-in `/healthz` endpoint returns HTTP 200
while healthy; no custom image or ConfigMap is required. This is a test image
for isolated learning environments, not a production application. Use `netexec`,
not the separate `liveness` command that intentionally becomes unhealthy.

Inspect the running Deployment and confirm that no liveness probe is configured:

```bash
kubectl -n ckad-probe get pods
kubectl -n ckad-probe describe pod -l app=web
kubectl -n ckad-probe get deployment web \
  -o jsonpath='{.spec.template.spec.containers[0].livenessProbe}{"\n"}'
```

The JSONPath output is empty before you configure the probe.

## Answer steps

```bash
kubectl -n ckad-probe patch deployment web --patch-file solution.yaml
kubectl -n ckad-probe rollout status deployment/web
```

## Verification

```bash
kubectl -n ckad-probe get deployment web \
  -o jsonpath='{.spec.template.spec.containers[0].livenessProbe}{"\n"}'
kubectl -n ckad-probe get pods
```

## Cleanup

```bash
kubectl delete namespace ckad-probe
```
