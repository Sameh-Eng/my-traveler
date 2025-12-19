# MyTraveler CI/CD Secrets Configuration

This document describes how to set up secrets for the MyTraveler CI/CD pipeline.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     GitHub Repository                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                   GitHub Secrets                             ││
│  │  AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_ACCOUNT_ID   ││
│  │  NEXT_PUBLIC_API_URL, NEXT_PUBLIC_PAYMOB_IFRAME             ││
│  │  ECS_CLUSTER_NAME, ECS_SERVICE_NAME, etc.                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│                              ▼                                   │
│                    GitHub Actions Workflow                       │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         AWS Cloud                                │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                  AWS Secrets Manager                         ││
│  │  /mytraveler/prod/db-host                                   ││
│  │  /mytraveler/prod/db-password                               ││
│  │  /mytraveler/prod/jwt-secret                                ││
│  │  /mytraveler/prod/paymob-api-key                            ││
│  │  etc.                                                        ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Amazon ECS                                ││
│  │  Container reads secrets from AWS Secrets Manager            ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## 1. GitHub Secrets (for CI/CD)

Go to: **Repository → Settings → Secrets and variables → Actions**

### AWS Credentials (Required)
| Secret Name | Description | Example |
|-------------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | IAM user access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_ACCOUNT_ID` | AWS Account ID | `123456789012` |
| `AWS_REGION` | AWS Region | `us-east-1` or `eu-west-1` |

### ECS Configuration (Required)
| Secret Name | Description | Example |
|-------------|-------------|---------|
| `ECS_CLUSTER_NAME` | ECS Cluster name | `mytraveler-cluster` |
| `ECS_SERVICE_NAME` | ECS Service name | `mytraveler-service` |
| `ECS_EXECUTION_ROLE_ARN` | ECS Task Execution Role ARN | `arn:aws:iam::123456789012:role/ecsTaskExecutionRole` |
| `ECS_TASK_ROLE_ARN` | ECS Task Role ARN | `arn:aws:iam::123456789012:role/ecsTaskRole` |
| `LOAD_BALANCER_NAME` | ALB name | `mytraveler-alb` |

### Build-time Variables (Required)
| Secret Name | Description | Example |
|-------------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | API URL for frontend | `https://api.yourdomain.com` |
| `NEXT_PUBLIC_PAYMOB_IFRAME` | Paymob iframe URL | `https://accept.paymob.com/...` |
| `PRODUCTION_URL` | Production URL | `https://yourdomain.com` |

### AWS Secrets Manager ARNs (Required for ECS)
| Secret Name | Description | Points to AWS Secrets Manager |
|-------------|-------------|-------------------------------|
| `DB_HOST_ARN` | Database host secret ARN | `arn:aws:secretsmanager:...` |
| `DB_NAME_ARN` | Database name secret ARN | `arn:aws:secretsmanager:...` |
| `DB_USER_ARN` | Database user secret ARN | `arn:aws:secretsmanager:...` |
| `DB_PASSWORD_ARN` | Database password secret ARN | `arn:aws:secretsmanager:...` |
| `REDIS_HOST_ARN` | Redis host secret ARN | `arn:aws:secretsmanager:...` |
| `REDIS_PASSWORD_ARN` | Redis password secret ARN | `arn:aws:secretsmanager:...` |
| `JWT_SECRET_ARN` | JWT secret ARN | `arn:aws:secretsmanager:...` |
| `PAYMOB_API_KEY_ARN` | Paymob API key secret ARN | `arn:aws:secretsmanager:...` |
| `PAYMOB_INTEGRATION_ID_ARN` | Paymob integration ID ARN | `arn:aws:secretsmanager:...` |
| `PAYMOB_HMAC_KEY_ARN` | Paymob HMAC key ARN | `arn:aws:secretsmanager:...` |
| `GOOGLE_CLIENT_ID_ARN` | Google client ID ARN | `arn:aws:secretsmanager:...` |
| `GOOGLE_CLIENT_SECRET_ARN` | Google client secret ARN | `arn:aws:secretsmanager:...` |

### Optional Notifications
| Secret Name | Description |
|-------------|-------------|
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications |

---

## 2. AWS Secrets Manager Setup

### Create Secrets using AWS CLI

```bash
# Set your region
export AWS_REGION=us-east-1

# Database secrets
aws secretsmanager create-secret \
    --name /mytraveler/prod/db-host \
    --secret-string "your-rds-endpoint.amazonaws.com"

aws secretsmanager create-secret \
    --name /mytraveler/prod/db-name \
    --secret-string "mytraveler"

aws secretsmanager create-secret \
    --name /mytraveler/prod/db-user \
    --secret-string "mytraveler_user"

aws secretsmanager create-secret \
    --name /mytraveler/prod/db-password \
    --secret-string "YOUR_STRONG_PASSWORD"

# Redis secrets
aws secretsmanager create-secret \
    --name /mytraveler/prod/redis-host \
    --secret-string "your-elasticache-endpoint"

aws secretsmanager create-secret \
    --name /mytraveler/prod/redis-password \
    --secret-string "YOUR_REDIS_PASSWORD"

# JWT secret
aws secretsmanager create-secret \
    --name /mytraveler/prod/jwt-secret \
    --secret-string "YOUR_LONG_RANDOM_JWT_SECRET"

# Paymob secrets
aws secretsmanager create-secret \
    --name /mytraveler/prod/paymob-api-key \
    --secret-string "YOUR_PAYMOB_API_KEY"

aws secretsmanager create-secret \
    --name /mytraveler/prod/paymob-integration-id \
    --secret-string "YOUR_INTEGRATION_ID"

aws secretsmanager create-secret \
    --name /mytraveler/prod/paymob-hmac-key \
    --secret-string "YOUR_HMAC_KEY"

# Google OAuth secrets
aws secretsmanager create-secret \
    --name /mytraveler/prod/google-client-id \
    --secret-string "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"

aws secretsmanager create-secret \
    --name /mytraveler/prod/google-client-secret \
    --secret-string "YOUR_GOOGLE_CLIENT_SECRET"
```

### Get ARNs and add to GitHub Secrets

```bash
# Get the ARN of a secret
aws secretsmanager describe-secret \
    --secret-id /mytraveler/prod/db-password \
    --query 'ARN' \
    --output text
```

Copy each ARN and add it as a GitHub Secret.

---

## 3. IAM Role Permissions

### ECS Task Execution Role

The ECS Task Execution Role needs permission to read from Secrets Manager:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetSecretValue"
            ],
            "Resource": [
                "arn:aws:secretsmanager:*:*:secret:/mytraveler/prod/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "*"
        }
    ]
}
```

### GitHub Actions IAM User

The IAM user for GitHub Actions needs:

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
                "ecs:DescribeServices",
                "ecs:UpdateService",
                "ecs:DescribeTaskDefinition",
                "ecs:RegisterTaskDefinition"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "elasticloadbalancing:DescribeLoadBalancers",
                "elasticloadbalancing:DescribeTargetGroups"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "iam:PassRole"
            ],
            "Resource": [
                "arn:aws:iam::*:role/ecsTaskExecutionRole",
                "arn:aws:iam::*:role/ecsTaskRole"
            ]
        }
    ]
}
```

---

## 4. Quick Setup Checklist

- [ ] Create IAM user for GitHub Actions with required permissions
- [ ] Add AWS credentials to GitHub Secrets
- [ ] Create ECS Cluster and Service
- [ ] Create ECR repositories for frontend and backend
- [ ] Create secrets in AWS Secrets Manager
- [ ] Add secret ARNs to GitHub Secrets
- [ ] Configure ECS Task Execution Role with Secrets Manager permissions
- [ ] Set up Application Load Balancer
- [ ] Push to main branch to trigger deployment

---

## 5. Testing the Pipeline

1. Push a change to `main` branch
2. Go to **Actions** tab to monitor the workflow
3. Check CloudWatch logs for container logs
4. Verify the application is accessible via ALB DNS

---

## Need Help?

- AWS ECS Documentation: https://docs.aws.amazon.com/ecs/
- AWS Secrets Manager: https://docs.aws.amazon.com/secretsmanager/
- GitHub Actions: https://docs.github.com/en/actions
