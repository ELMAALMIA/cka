# Lab 16 - Expose a Deployment with NodePort

## Question

Expose Deployment `web` in namespace `ckad-nodeport` as Service `web-nodeport`. The Service must listen on port `80`, target container port `80`, and select the Deployment's Pods.

## Expectation

- Service type is `NodePort`.
- `port`, `targetPort`, and `nodePort` are correct.
- The Service has ready endpoints.

## Setup

```bash
kubectl apply -f setup.yaml
```

## Answer steps

```bash
kubectl apply -f solution.yaml
```

Imperative alternative:

```bash
kubectl -n ckad-nodeport expose deployment web \
  --name=web-nodeport --type=NodePort --port=80 --target-port=80
```

## Verification

```bash
kubectl -n ckad-nodeport get service web-nodeport
```

## Cleanup

```bash
kubectl delete namespace ckad-nodeport
```

