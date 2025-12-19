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
| Setting | Value |
|---------|-------|
| **Engine** | PostgreSQL |
| **Version** | 15.x |
| **Template** | Free tier (or Production) |
| **DB instance identifier** | `mytraveler-db` |
| **Master username** | `mytraveler_admin` |
| **Master password** | (Create a strong password) |
| **DB instance class** | db.t3.micro (free tier) |
| **Storage** | 20 GB gp2 |
| **Public access** | No |
| **VPC security group** | Create new |

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

## ⚖️ Step 5: Create Application Load Balancer

### Navigate to EC2 → Load Balancers
1. Click **"Create load balancer"**
2. Choose **"Application Load Balancer"**

### Basic Configuration
| Setting | Value |
|---------|-------|
| **Name** | `mytraveler-alb` |
| **Scheme** | Internet-facing |
| **IP address type** | IPv4 |

### Network Mapping
- **VPC:** Your default VPC
- **Mappings:** Select at least 2 availability zones

### Security Groups
Create or select a security group that allows:
- HTTP (80) from anywhere
- HTTPS (443) from anywhere

### Listeners and Routing

**Create Target Group First:**
1. Go to **Target Groups** → **Create target group**
2. **Target type:** IP addresses
3. **Name:** `mytraveler-tg`
4. **Protocol:** HTTP, Port: 8080
5. **Health check path:** `/health`
6. Click **Create**

**Back to ALB:**
- Add listener: HTTP:80 → Forward to `mytraveler-tg`

---

## 📦 Step 6: Create ECS Cluster

### Navigate to ECS
1. Go to **ECS** → **Clusters** → **Create cluster**

### Cluster Settings
| Setting | Value |
|---------|-------|
| **Cluster name** | `mytraveler-cluster` |
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
1. Go to **ECS** → **Clusters** → `mytraveler-cluster`
2. Click **"Create"** (in Services tab)

### Service Settings
| Setting | Value |
|---------|-------|
| **Launch type** | FARGATE |
| **Task definition** | `mytraveler-task` |
| **Service name** | `mytraveler-service` |
| **Desired tasks** | 1 |

### Networking
- **VPC:** Your default VPC
- **Subnets:** Select 2+ subnets
- **Security group:** Allow 8080 from ALB

### Load Balancing
- **Load balancer type:** Application Load Balancer
- **Load balancer:** `mytraveler-alb`
- **Target group:** `mytraveler-tg`
- **Container:** backend:8080

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
| `AWS_ACCESS_KEY_ID` | (Your IAM user access key from Step 2) |
| `AWS_SECRET_ACCESS_KEY` | (Your IAM user secret key from Step 2) |
| `AWS_ACCOUNT_ID` | `761018856039` |
| `AWS_REGION` | `eu-north-1` |
| `ECS_CLUSTER_NAME` | `mytraveler-cluster` |
| `ECS_SERVICE_NAME` | `mytraveler-service` |
| `ECS_EXECUTION_ROLE_ARN` | `arn:aws:iam::761018856039:role/ecsTaskExecutionRole` |
| `ECS_TASK_ROLE_ARN` | `arn:aws:iam::761018856039:role/ecsTaskExecutionRole` |
| `LOAD_BALANCER_NAME` | `mytraveler-alb` |
| `NEXT_PUBLIC_API_URL` | `http://mytraveler-alb-660460338.eu-north-1.elb.amazonaws.com/api` |
| `PRODUCTION_URL` | `http://mytraveler-alb-660460338.eu-north-1.elb.amazonaws.com` |

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
aws secretsmanager list-secrets --region eu-north-1 \
  --query 'SecretList[].{Name:Name,ARN:ARN}' --output table
```

| GitHub Secret Name | Secrets Manager ARN |
|-------------------|---------------------|
| `DB_HOST_ARN` | `arn:aws:secretsmanager:eu-north-1:761018856039:secret:/mytraveler/prod/db-host-XXXXX` |
| `DB_PASSWORD_ARN` | `arn:aws:secretsmanager:eu-north-1:761018856039:secret:/mytraveler/prod/db-password-XXXXX` |
| `JWT_SECRET_ARN` | `arn:aws:secretsmanager:eu-north-1:761018856039:secret:/mytraveler/prod/jwt-secret-XXXXX` |
| `REDIS_HOST_ARN` | `arn:aws:secretsmanager:eu-north-1:761018856039:secret:/mytraveler/prod/redis-host-XXXXX` |

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
| 5. Create ALB | ⬜ |
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
| RDS db.t3.micro | ~$15 (or free tier) |
| ElastiCache cache.t3.micro | ~$12 |
| ALB | ~$20 |
| ECR | ~$1 |
| Secrets Manager | ~$2 |
| **Total** | **~$65/month** |

---

## 🆘 Need Help?

If you get stuck on any step, let me know which step number and I'll provide more detailed instructions!
