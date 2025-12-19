# 🚀 AWS ECS + CI/CD Complete Setup Guide

> **Estimated Time:** 2-3 hours  
> **Difficulty:** Intermediate  
> **Prerequisites:** AWS Account, GitHub Repository

---

## 📋 Overview

This guide will help you set up:
1. **AWS ECR** - Container image registry
2. **AWS ECS** - Container orchestration
3. **AWS RDS** - PostgreSQL database
4. **AWS ElastiCache** - Redis cache
5. **AWS ALB** - Load balancer
6. **GitHub Actions** - CI/CD pipeline

---

## 📦 Step 1: Create ECR Repositories

ECR stores your Docker images.

### Navigate to ECR
1. Go to **AWS Console** → Search "ECR" → **Elastic Container Registry**
2. Click **"Create repository"**

### Create Frontend Repository
- **Repository name:** `mytraveler-frontend`
- **Image tag mutability:** Mutable
- **Scan on push:** Enabled (optional)
- Click **"Create repository"**

### Create Backend Repository
- **Repository name:** `mytraveler-backend`
- **Image tag mutability:** Mutable
- Click **"Create repository"**

### Note Your ECR URI
```
YOUR_ACCOUNT_ID.dkr.ecr.YOUR_REGION.amazonaws.com/mytraveler-frontend
YOUR_ACCOUNT_ID.dkr.ecr.YOUR_REGION.amazonaws.com/mytraveler-backend
```

---

## 🔑 Step 2: Create IAM User for GitHub Actions

### Create IAM User
1. Go to **IAM** → **Users** → **Add users**
2. **User name:** `github-actions-deployer`
3. Click **Next**

### Attach Policies
Select these policies:
- `AmazonEC2ContainerRegistryFullAccess`
- `AmazonECS_FullAccess`
- `ElasticLoadBalancingFullAccess`

Or create custom policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "ecr:InitiateLayerUpload",
                "ecr:UploadLayerPart",
                "ecr:CompleteLayerUpload",
                "ecr:PutImage"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "ecs:*",
                "elasticloadbalancing:*",
                "logs:*"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": "iam:PassRole",
            "Resource": "*"
        }
    ]
}
```

### Create Access Keys
1. Click on the user → **Security credentials** tab
2. Click **"Create access key"**
3. Choose **"Application running outside AWS"**
4. **SAVE THESE KEYS!** You won't see them again:
   - Access Key ID: `AKIA...`
   - Secret Access Key: `...`

---

## 🗄️ Step 3: Create RDS PostgreSQL Database

### Navigate to RDS
1. Go to **RDS** → **Create database**

### Database Settings

#### Engine & Template
| Setting | Value |
|---------|-------|
| **Creation method** | Full configuration |
| **Engine type** | PostgreSQL |
| **Engine version** | PostgreSQL 15.14-R2 |
| **Template** | Dev/Test |
| **Deployment option** | Single-AZ DB instance (1 instance) |

#### Instance Settings
| Setting | Value |
|---------|-------|
| **DB instance identifier** | `mytraveler-db` |
| **Master username** | `mytraveler_admin` |
| **Credentials management** | Self managed |
| **Master password** | (Stored in AWS Secrets Manager) |
| **DB instance class** | db.t3.micro (2 vCPUs, 1 GiB RAM) |
| **Storage type** | General Purpose SSD (gp2) |
| **Allocated storage** | 20 GiB |

#### Connectivity
| Setting | Value |
|---------|-------|
| **Compute resource** | Don't connect to EC2 |
| **Network type** | IPv4 |
| **VPC** | Create new VPC (or use default) |
| **DB subnet group** | Create new DB Subnet Group |
| **Public access** | Yes (for initial setup) or No (production) |
| **VPC security group** | Create new |
| **Database authentication** | Password authentication |

#### Monitoring (Database Insights - Standard)
| Setting | Value |
|---------|-------|
| **Performance Insights** | Enabled |
| **Retention period** | 15 months |
| **Enhanced Monitoring** | Enabled (60 seconds) |
| **Log exports** | PostgreSQL log ✓ |

#### Estimated Monthly Costs
| Component | Cost |
|-----------|------|
| DB instance | ~$26.28 |
| Storage | ~$4.60 |
| **Total** | **~$30.88/month** |

### Note Your Endpoint
After creation, note the endpoint:
```
mytraveler-db.xxxxxx.us-east-1.rds.amazonaws.com
```

### Create Database
Connect and run:
```sql
CREATE DATABASE mytraveler;
CREATE USER mytraveler_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE mytraveler TO mytraveler_user;
```

---

## 🔴 Step 4: Create ElastiCache Redis

### Navigate to ElastiCache
1. Go to **ElastiCache** → **Redis OSS caches** → **Create**

### Redis Settings
| Setting | Value |
|---------|-------|
| **Name** | `mytraveler-redis` |
| **Node type** | cache.t3.micro |
| **Number of replicas** | 0 (for cost saving) |
| **Port** | 6379 |

### Note Your Endpoint
```
mytraveler-redis.xxxxxx.cache.amazonaws.com:6379
```

---

## ⚖️ Step 5: Create Security Group for ECS

> **Note:** Application Load Balancers require a billing cycle on new AWS accounts. 
> We'll deploy with **public IP directly on ECS tasks** instead.

### Navigate to EC2 → Security Groups
1. Click **"Create security group"**

### Security Group Settings
| Setting | Value |
|---------|-------|
| **Name** | `mytraveler-ecs-sg` |
| **Description** | Security group for MyTraveler ECS tasks |
| **VPC** | Your default VPC |

### Inbound Rules
| Type | Port | Source | Description |
|------|------|--------|-------------|
| HTTP | 80 | 0.0.0.0/0 | Frontend access |
| Custom TCP | 3000 | 0.0.0.0/0 | Next.js frontend |
| Custom TCP | 8080 | 0.0.0.0/0 | Backend API |

### Outbound Rules
- Allow all traffic (default)

---

## 📦 Step 6: Create ECS Cluster

### Navigate to ECS
1. Go to **ECS** → **Clusters** → **Create cluster**

### Cluster Settings
| Setting | Value |
|---------|-------|
| **Cluster name** | `mytraveler-clusterr` |
| **Infrastructure** | AWS Fargate (serverless) |

Click **Create**

---

## 📝 Step 7: Create Task Definition

### Navigate to Task Definitions
1. Go to **ECS** → **Task definitions** → **Create new task definition**

### Task Definition Settings
| Setting | Value |
|---------|-------|
| **Family** | `mytraveler-task` |
| **Launch type** | AWS Fargate |
| **OS** | Linux/X86_64 |
| **CPU** | 0.5 vCPU |
| **Memory** | 1 GB |
| **Task role** | Create new (or use existing) |
| **Task execution role** | Create new (or use existing) |

### Container 1: Backend
| Setting | Value |
|---------|-------|
| **Name** | `backend` |
| **Image URI** | `YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/mytraveler-backend:latest` |
| **Container port** | 8080 |
| **Protocol** | TCP |
| **Essential** | Yes |

**Environment Variables:**
```
NODE_ENV = production
PORT = 8080
DB_HOST = your-rds-endpoint
DB_NAME = mytraveler
DB_USER = mytraveler_user
DB_PASSWORD = your_password
REDIS_HOST = your-redis-endpoint
JWT_SECRET = your_jwt_secret
```

### Container 2: Frontend (Optional for now)
| Setting | Value |
|---------|-------|
| **Name** | `frontend` |
| **Image URI** | `YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/mytraveler-frontend:latest` |
| **Container port** | 3000 |
| **Essential** | No |

Click **Create**

---

## 🚀 Step 8: Create ECS Service

### Navigate to Your Cluster
1. Go to **ECS** → **Clusters** → `mytraveler-clusterr`
2. Click **"Create"** (in Services tab)

### Service Settings
| Setting | Value |
|---------|-------|
| **Launch type** | FARGATE |
| **Task definition** | `mytraveler-task` |
| **Service name** | `mytraveler-servicee` |
| **Desired tasks** | 1 |

### Networking
- **VPC:** Your default VPC
- **Subnets:** Select 1+ public subnets
- **Security group:** `mytraveler-ecs-sg` (created in Step 5)
- **Public IP:** ✅ **ENABLED** (Auto-assign public IP = ENABLED)

> ⚠️ **Important:** Enable "Auto-assign public IP" to access your service without a load balancer!

### Load Balancing
- **Load balancer type:** None

Click **Create**

---

## 🔐 Step 9: Store Secrets in AWS Secrets Manager

### Navigate to Secrets Manager
1. Go to **Secrets Manager** → **Store a new secret**

### Create Each Secret
For each secret, do:
1. **Secret type:** Other type of secret
2. **Key/value pairs:** Enter value
3. **Secret name:** `/mytraveler/prod/SECRET_NAME`

| Secret Name | Example Value |
|-------------|---------------|
| `/mytraveler/prod/db-host` | Your RDS endpoint |
| `/mytraveler/prod/db-password` | Your DB password |
| `/mytraveler/prod/jwt-secret` | Long random string |
| `/mytraveler/prod/redis-host` | Your Redis endpoint |

### Note the ARNs
Each secret has an ARN like:
```
arn:aws:secretsmanager:us-east-1:123456789012:secret:/mytraveler/prod/db-password-AbCdEf
```

---

## 🔧 Step 10: Add GitHub Secrets

### Navigate to GitHub Repository Settings
1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**

### Add These Secrets (Your Values)

| Secret Name | Your Value |
|-------------|------------|
| `AWS_ACCESS_KEY_ID` | `AKIAWCCSAN3U5YL3XEET` |
| `AWS_SECRET_ACCESS_KEY` | (Your secret access key) |
| `AWS_ACCOUNT_ID` | `416783822569` |
| `AWS_REGION` | `us-east-1` |
| `ECS_CLUSTER_NAME` | `mytraveler-clusterr` |
| `ECS_SERVICE_NAME` | `mytraveler-servicee` |
| `ECS_EXECUTION_ROLE_ARN` | `arn:aws:iam::416783822569:role/ecsTaskExecutionRole` |
| `ECS_TASK_ROLE_ARN` | `arn:aws:iam::416783822569:role/ecsTaskExecutionRole` |
| `NEXT_PUBLIC_API_URL` | `http://<ECS_TASK_PUBLIC_IP>:8080/api` |
| `PRODUCTION_URL` | `http://<ECS_TASK_PUBLIC_IP>:3000` |

> **Note:** After deploying, get your ECS task's public IP from the ECS Console and update `NEXT_PUBLIC_API_URL` and `PRODUCTION_URL`.

### How to Find ECS_EXECUTION_ROLE_ARN

Run in CloudShell:
```bash
aws iam get-role --role-name ecsTaskExecutionRole --query 'Role.Arn' --output text
```

If it doesn't exist, create it:
```bash
# Create the role (if needed)
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "ecs-tasks.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

# Attach required policies
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite
```

### Add Secret ARNs (from Secrets Manager)

Run this to get all your secret ARNs:
```bash
aws secretsmanager list-secrets --region us-east-1 \
  --query 'SecretList[].{Name:Name,ARN:ARN}' --output table
```

| GitHub Secret Name | Secrets Manager ARN |
|-------------------|---------------------|
| `DB_HOST_ARN` | `arn:aws:secretsmanager:us-east-1:416783822569:secret:/mytraveler/prod/db-host-y2z7d8` |
| `DB_PASSWORD_ARN` | `arn:aws:secretsmanager:us-east-1:416783822569:secret:/mytraveler/prod/db-password-oYK68R` |
| `JWT_SECRET_ARN` | `arn:aws:secretsmanager:us-east-1:416783822569:secret:/mytraveler/prod/jwt-secret-Wml0Em` |
| `REDIS_HOST_ARN` | `arn:aws:secretsmanager:us-east-1:416783822569:secret:/mytraveler/prod/redis-host-uXx3zQ` |

---

## ✅ Step 11: Enable CI/CD Workflow

Now create the GitHub Actions workflow. I'll create this for you.

---

## 🎯 Summary Checklist

| Step | Status |
|------|--------|
| 1. Create ECR repos | ⬜ |
| 2. Create IAM user + keys | ⬜ |
| 3. Create RDS PostgreSQL | ⬜ |
| 4. Create ElastiCache Redis | ⬜ |
| 5. Create Security Group | ⬜ |
| 6. Create ECS Cluster | ⬜ |
| 7. Create Task Definition | ⬜ |
| 8. Create ECS Service | ⬜ |
| 9. Store secrets in Secrets Manager | ⬜ |
| 10. Add GitHub Secrets | ⬜ |
| 11. Enable CI/CD workflow | ⬜ |

---

## 💰 Cost Estimate (Monthly)

| Service | Cost |
|---------|------|
| ECS Fargate (0.5 vCPU, 1GB) | ~$15 |
| RDS db.t3.micro | ~$31 |
| ElastiCache cache.t3.micro | ~$12 |
| ECR | ~$1 |
| Secrets Manager | ~$2 |
| **Total** | **~$61/month** |

> 💰 **Savings:** ~$20/month by not using ALB!

---

## 🆘 Need Help?

If you get stuck on any step, let me know which step number and I'll provide more detailed instructions!
