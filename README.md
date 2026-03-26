# GitOps with ArgoCD: The Real-World CI/CD & Promotion Tutorial

Welcome to the advanced GitOps Demo! In this tutorial, you will simulate a real-world corporate DevOps workflow. You will use **GitHub Actions** for Continuous Integration (CI) and **ArgoCD** for Continuous Delivery (CD).

By the end of this tutorial, you will have a fully functioning pipeline that:
1. Builds a Docker image automatically when you change application code.
2. Updates your Kubernetes manifests with the new image tag.
3. Deploys the changes automatically to a **Staging** environment.
4. Pauses and waits for a human **Pull Request** approval before deploying to **Production**.

---

## Prerequisites
- **Rancher Desktop** installed and running.
- **`kubectl`** CLI tool installed.
- A **GitHub Account**.

## Step 1: Install ArgoCD Locally
Open your terminal and install ArgoCD on your local cluster:
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml --server-side
```

Forward the port and get your admin password to log into `https://localhost:8080`:
```bash
# Keep this running in one terminal
kubectl port-forward svc/argocd-server -n argocd 8080:443

# In another terminal, get the password (Mac/Linux/GitBash):
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo

# (For Windows PowerShell):
$pwd = kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}"
[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($pwd))
```

---

## Step 2: Set Up Your Git Repository
Since GitOps uses Git as the single source of truth, you need your own repository to play with!

1. Go to GitHub and create a new **public** repository named `gitops-demo`.
2. Inside this local folder on your computer, initialize git and push the existing code to your new repository:
```bash
git init
git add .
git commit -m "Initial commit with app and K8s manifests"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/gitops-demo.git
git push -u origin main
```
3. Create a secondary branch for Production:
```bash
git checkout -b production
git push -u origin production
git checkout main
```

---

## Step 3: Tell ArgoCD to Track Your Environments
We have two ArgoCD Application files pre-configured for you in the `argocd/` folder.
*Before running this step, please open both `argocd/staging.yaml` and `argocd/production.yaml` and replace `<YOUR_GITHUB_USERNAME>` with your actual GitHub username.*

Apply them to your cluster:
```bash
kubectl apply -f argocd/staging.yaml
kubectl apply -f argocd/production.yaml
```

**What did you just do?**
- `myapp-staging` is now monitoring your `main` branch. It deploys resources into the `staging` namespace.
- `myapp-production` is now monitoring your `production` branch. It deploys resources into the `production` namespace.

---

## Step 4: The CI/CD Loop (Deploying to Staging)
You are now going to act as a Developer making a change to the codebase.

1. Open `app/server.js` in a text editor.
2. Change the string `const version = "1.0.0";` to `const version = "2.0.0";`.
3. Commit and push your code change to the `main` branch:
```bash
git commit -am "feat: update app version to 2.0.0"
git push origin main
```

**Watch the Magic Happen:**
1. Go to your GitHub Repository -> **Actions** tab. You will see your CI/CD Pipeline running!
2. The Action will automatically build your Docker container, push it to GitHub Container Registry, and then **commit an update** to your `manifests/deployment.yaml` file with the new Image TAG.
3. Open your ArgoCD UI (`https://localhost:8080`). Watch the `myapp-staging` application. ArgoCD will detect the Action's commit and seamlessly rollout version 2.0.0 to your Staging cluster!

---

## Step 5: Environment Promotion (Deploying to Production)
Your code looks great in Staging. Now let's promote it to Production, just like in a real company.

1. Go to your GitHub repository in your web browser.
2. Click **Pull Requests** -> **New Pull Request**.
3. Set the base to `production` and compare to `main`.
4. Click **Create Pull Request**, review the changes (you'll see your code changes AND the updated image tag), and then click **Merge Pull Request**.
5. Instantly jump back to the ArgoCD UI.
6. The `myapp-production` application tracks the `production` branch. It just witnessed the merge, and is now deploying version 2.0.0 into your Production namespace!

**Congratulations!** You just executed an elite CI/CD GitOps workflow using GitHub Actions and ArgoCD.
