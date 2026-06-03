# Deploying FlowCare to Google Cloud Run

The app is a static Vite SPA. CI builds it into an nginx container and deploys to
Cloud Run on every push to `main` (`.github/workflows/google-cloudrun-source.yml`).

## 1. One-time Google Cloud setup

Set your project and region:

```bash
export PROJECT_ID="your-project-id"
export REGION="us-central1"
export REPOSITORY="flowcare"
export SERVICE="flowcare"
gcloud config set project "$PROJECT_ID"
```

Enable the required APIs:

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  iamcredentials.googleapis.com
```

Create the Artifact Registry repo (must match `REPOSITORY` in the workflow):

```bash
gcloud artifacts repositories create "$REPOSITORY" \
  --repository-format=docker \
  --location="$REGION"
```

## 2. Service account for GitHub Actions

```bash
gcloud iam service-accounts create gh-deployer \
  --display-name="GitHub Actions deployer"

SA="gh-deployer@${PROJECT_ID}.iam.gserviceaccount.com"

for ROLE in roles/run.admin roles/artifactregistry.writer roles/iam.serviceAccountUser; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${SA}" --role="$ROLE"
done
```

## 3. Workload Identity Federation (keyless auth from GitHub)

```bash
gcloud iam workload-identity-pools create github-pool \
  --location=global --display-name="GitHub pool"

gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location=global --workload-identity-pool=github-pool \
  --display-name="GitHub provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='info94805/flowcare'" \
  --issuer-uri="https://token.actions.githubusercontent.com"

PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"

# Let the GitHub repo impersonate the deployer service account.
gcloud iam service-accounts add-iam-policy-binding "$SA" \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-pool/attribute.repository/info94805/flowcare"
```

The `workload_identity_provider` value for the GitHub secret is:

```
projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-pool/providers/github-provider
```

## 4. GitHub repository secrets

Add these under **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Value |
| --- | --- |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | the `projects/.../providers/github-provider` string from step 3 |
| `GCP_SERVICE_ACCOUNT` | `gh-deployer@<project>.iam.gserviceaccount.com` |
| `VITE_BASE44_APP_ID` | your Base44 app id |
| `VITE_BASE44_APP_BASE_URL` | your Base44 backend URL (e.g. `https://<app>.base44.app`) |

## 5. Update the workflow values

Edit the `env` block in `.github/workflows/google-cloudrun-source.yml` to set
`PROJECT_ID`, `REGION`, `SERVICE`, and `REPOSITORY`.

## 6. Deploy

Push to `main` (or run the workflow manually via **Actions → Deploy to Cloud Run
→ Run workflow**). The job builds the image, pushes it to Artifact Registry,
deploys to Cloud Run, and prints the public URL.

## Manual deploy (optional, from your machine)

```bash
gcloud run deploy "$SERVICE" --source . --region "$REGION" --allow-unauthenticated \
  --update-build-env-vars VITE_BASE44_APP_ID=...,VITE_BASE44_APP_BASE_URL=...
```

## Local container test

```bash
docker build -t flowcare \
  --build-arg VITE_BASE44_APP_ID=... \
  --build-arg VITE_BASE44_APP_BASE_URL=... .
docker run -p 8080:8080 flowcare
# open http://localhost:8080
```
