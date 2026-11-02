# Lab 12 - Build and export a Docker image

## Question

Build the Docker image defined in this directory. Tag it `ckad-web:v1` and export it to `ckad-web-v1.tar`.

## Expectation

- Local image tag is `ckad-web:v1`.
- The image serves the provided `index.html`.
- `ckad-web-v1.tar` is a Docker image archive that can be loaded with `docker load`.

## Setup

Confirm Docker is available:

```bash
docker version
```

## Answer steps

```bash
docker build -t ckad-web:v1 .
docker save -o ckad-web-v1.tar ckad-web:v1
```

## Verification

```bash
docker image inspect ckad-web:v1
docker run --rm -d --name ckad-web-test -p 8080:80 ckad-web:v1
curl http://localhost:8080
docker stop ckad-web-test
docker load -i ckad-web-v1.tar
```

## Cleanup

```bash
docker image rm ckad-web:v1
rm -f ckad-web-v1.tar
```

PowerShell cleanup equivalent:

```powershell
Remove-Item .\ckad-web-v1.tar
```

