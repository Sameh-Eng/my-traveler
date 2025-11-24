# MyTraveler - CI/CD Pipeline Setup Guide

This comprehensive guide explains the GitHub Actions CI/CD pipeline for automated testing, building, and deploying the MyTraveler application to AWS ECS.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Pipeline Architecture](#pipeline-architecture)
- [GitHub Actions Workflows](#github-actions-workflows)
- [AWS Configuration](#aws-configuration)
- [Secrets Management](#secrets-management)
- [Pipeline Execution](#pipeline-execution)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The MyTraveler CI/CD pipeline provides:

- **Automated Testing**: Unit, integration, and E2E tests
- **Code Quality**: Linting, type checking, and security scanning
- **Docker Builds**: Multi-stage builds for frontend and backend
- **AWS Deployment**: Automated deployment to Amazon ECS
- **Monitoring**: Health checks and rollback capabilities

### Pipeline Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub        │───▶│   AWS           │───▶│   ECS Cluster   │
│   Actions       │    │   ECR           │    │   (Fargate)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Code Quality   │    │   Docker        │    │   Load Balancer │
│   Tests          │    │   Registry      │    │   (ALB)         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## ✅ Prerequisites

### GitHub Repository Setup

1. **Repository Structure**:
   ```
   my-traveler/
   ├── .github/workflows/
   │   ├── deploy.yml          # Production deployment
   │   ├── manual-deploy.yml   # Manual deployments
   │   └── ci.yml             # Continuous integration
   ├── frontend/              # Next.js application
   ├── backend/               # Node.js API
   ├── Dockerfile.frontend    # Frontend Dockerfile
   ├── backend/Dockerfile.prod # Backend Dockerfile
   └── docs/                  # Documentation
   ```

2. **Enable Actions**:
   ```bash
   # Go to repository Settings > Actions > General
   # Enable Actions and allow workflows on forks
   ```

### AWS Infrastructure

1. **ECR Repository Setup**:
   ```bash
   # Create ECR repositories
   aws ecr create-repository --repository-name mytraveler-frontend --region us-east-1
   aws ecr create-repository --repository-name mytraveler-backend --region us-east-1

   # Set repository policies
   aws ecr set-repository-policy \
     --repository-name mytraveler-frontend \
     --policy-text file://ecr-policy.json
   ```

2. **ECS Cluster Setup**:
   ```bash
   # Create ECS cluster
   aws ecs create-cluster --cluster-name mytraveler-cluster

   # Create task definition and service
   aws ecs register-task-definition --cli-input-json file://task-definition.json
   aws ecs create-service \
     --cluster mytraveler-cluster \
     --service-name mytraveler-service \
     --task-definition mytraveler-task
   ```

3. **IAM Roles**:
   - **ECS Execution Role**: Allows ECS to pull images and write logs
   - **ECS Task Role**: Allows containers to access AWS services
   - **GitHub Actions Role**: Allows Actions to deploy to ECS

### Required AWS Services

- **ECR** (Elastic Container Registry): Docker image storage
- **ECS** (Elastic Container Service): Container orchestration
- **Fargate**: Serverless compute for containers
- **Application Load Balancer**: Traffic distribution
- **CloudWatch**: Logging and monitoring
- **Secrets Manager**: Secure secret storage
- **S3**: Artifacts storage (optional)

## 🏗️ Pipeline Architecture

### Workflow Files

#### 1. CI Pipeline (`.github/workflows/ci.yml`)

**Purpose**: Continuous integration for code quality and testing

**Triggers**:
- Push to `main`, `develop`, `staging` branches
- Pull requests to `main` and `develop`

**Jobs**:
- `code-quality`: Linting, type checking, security audit
- `testing`: Unit, integration, and E2E tests
- `build-test`: Build validation and container testing
- `performance-test`: Lighthouse CI and API performance
- `security-scan`: Snyk, CodeQL, OWASP ZAP scans
- `dependency-check`: Outdated dependencies and license check

#### 2. Deploy Pipeline (`.github/workflows/deploy.yml`)

**Purpose**: Automated production deployment

**Triggers**: Push to `main` branch

**Jobs**:
- `build-and-test`: Full testing with PostgreSQL and Redis
- `docker-build-and-push`: Build and push Docker images to ECR
- `deploy-to-ecs`: Update ECS service with new images
- `notify`: Slack notifications and status updates

#### 3. Manual Deploy (`.github/workflows/manual-deploy.yml`)

**Purpose**: Manual deployments with rollback capability

**Triggers**: Manual workflow dispatch

**Options**:
- Environment selection (production/staging/development)
- Service selection (frontend/backend/all)
- Version targeting
- Rollback capability

## ⚙️ AWS Configuration

### ECR Repository Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowGitHubActions",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::${AWS_ACCOUNT_ID}:role/github-actions-role"
      },
      "Action": [
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:BatchCheckLayerAvailability",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:DescribeRepositories",
        "ecr:GetRepositoryPolicy"
      ]
    }
  ]
}
```

### ECS Task Definition

```json
{
  "family": "mytraveler-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/mytraveler-frontend:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/mytraveler",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs-frontend"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      },
      "essential": false
    },
    {
      "name": "backend",
      "image": "${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/mytraveler-backend:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "secrets": [
        {
          "name": "DB_HOST",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:${AWS_ACCOUNT_ID}:secret:mytraveler/db-host"
        },
        {
          "name": "DB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:${AWS_ACCOUNT_ID}:secret:mytraveler/db-password"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/mytraveler",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs-backend"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8080/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      },
      "essential": true
    }
  ]
}
```

### GitHub Actions IAM Role

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
        "ecr:GetRepositoryPolicy",
        "ecr:DescribeRepositories",
        "ecr:ListImages",
        "ecr:DescribeImages",
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
        "ecs:DescribeTaskDefinition",
        "ecs:RegisterTaskDefinition",
        "ecs:UpdateService",
        "ecs:ListServices",
        "ecs:ListTaskDefinitions",
        "ecs:DescribeTasks",
        "ecs:RunTask",
        "ecs:StopTask",
        "ecs:WaitServicesStable"
      ],
      "Resource": [
        "arn:aws:ecs:us-east-1:${AWS_ACCOUNT_ID}:service/mytraveler-cluster/mytraveler-service",
        "arn:aws:ecs:us-east-1:${AWS_ACCOUNT_ID}:task-definition/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:us-east-1:${AWS_ACCOUNT_ID}:log-group:/ecs/mytraveler:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": [
        "arn:aws:secretsmanager:us-east-1:${AWS_ACCOUNT_ID}:secret:mytraveler/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "elasticloadbalancing:DescribeLoadBalancers",
        "elasticloadbalancing:DescribeTargetGroups"
      ],
      "Resource": "*"
    }
  ]
}
```

## 🔐 Secrets Management

### Required GitHub Secrets

#### AWS Credentials
```bash
# AWS Account and Access
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# AWS Account ID
AWS_ACCOUNT_ID=123456789012
AWS_REGION=us-east-1
```

#### ECS Configuration
```bash
# Production Environment
PROD_ECS_CLUSTER=mytraveler-prod-cluster
PROD_ECS_SERVICE=mytraveler-prod-service
PROD_LOAD_BALANCER=mytraveler-prod-alb

# Staging Environment
STAGING_ECS_CLUSTER=mytraveler-staging-cluster
STAGING_ECS_SERVICE=mytraveler-staging-service
STAGING_LOAD_BALANCER=mytraveler-staging-alb

# Development Environment
DEV_ECS_CLUSTER=mytraveler-dev-cluster
DEV_ECS_SERVICE=mytraveler-dev-service
DEV_LOAD_BALANCER=mytraveler-dev-alb
```

#### IAM Roles
```bash
# ECS Roles
ECS_EXECUTION_ROLE_ARN=arn:aws:iam::123456789012:role/ecsTaskExecutionRole
ECS_TASK_ROLE_ARN=arn:aws:iam::123456789012:role/ecsTaskRole

# Load Balancer DNS
LOAD_BALANCER_DNS=mytraveler-prod.us-east-1.elb.amazonaws.com
```

#### Application Secrets
```bash
# Database Configuration
DB_HOST_ARN=arn:aws:secretsmanager:us-east-1:123456789012:secret:mytraveler/db-host
DB_NAME_ARN=arn:aws:secretsmanager:us-east-1:123456789012:secret:mytraveler/db-name
DB_USER_ARN=arn:aws:secretsmanager:us-east-1:123456789012:secret:mytraveler/db-user
DB_PASSWORD_ARN=arn:aws:secretsmanager:us-east-1:123456789012:secret:mytraveler/db-password

# Redis Configuration
REDIS_HOST_ARN=arn:aws:secretsmanager:us-east-1:123456789012:secret:mytraveler/redis-host
REDIS_PASSWORD_ARN=arn:aws:secretsmanager:us-east-1:123456789012:secret:mytraveler/redis-password

# JWT Configuration
JWT_SECRET_ARN=arn:aws:secretsmanager:us-east-1:123456789012:secret:mytraveler/jwt-secret

# Paymob Configuration
PAYMOB_API_KEY_ARN=arn:aws:secretsmanager:us-east-1:123456789012:secret:mytraveler/paymob-api-key
PAYMOB_INTEGRATION_ID_ARN=arn:aws:secretsmanager:us-east-1:123456789012:secret:mytraveler/paymob-integration-id
PAYMOB_HMAC_KEY_ARN=arn:aws:secretsmanager:us-east-1:123456789012:secret:mytraveler/paymob-hmac-key

# Frontend Configuration
NEXT_PUBLIC_API_URL=https://api.mytraveler.com
NEXT_PUBLIC_API_URL_ARN=arn:aws:secretsmanager:us-east-1:123456789012:secret:mytraveler/frontend-api-url
NEXT_PUBLIC_PAYMOB_IFRAME=https://accept.paymob.com/api/acceptance/iframes
NEXT_PUBLIC_PAYMOB_IFRAME_ARN=arn:aws:secretsmanager:us-east-1:123456789012:secret:mytraveler/frontend-paymob-iframe
```

#### Third-party Services
```bash
# Slack Integration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX

# Security Scanning
SNYK_TOKEN=snYk-token-example

# Lighthouse CI
LHCI_GITHUB_APP_TOKEN=github-app-token-example
```

### Managing Secrets

#### Using AWS Secrets Manager

```bash
# Create secrets
aws secretsmanager create-secret \
  --name mytraveler/db-password \
  --secret-string "your-secure-password" \
  --region us-east-1

# Update secrets
aws secretsmanager update-secret \
  --secret-id mytraveler/db-password \
  --secret-string "new-secure-password"

# Retrieve secrets
aws secretsmanager get-secret-value \
  --secret-id mytraveler/db-password \
  --query SecretString \
  --output text
```

#### Using GitHub CLI

```bash
# Add secrets to repository
gh secret set AWS_ACCESS_KEY_ID --body "AKIAIOSFODNN7EXAMPLE"
gh secret set AWS_SECRET_ACCESS_KEY --body "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
gh secret set SLACK_WEBHOOK_URL --body "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"
```

## 🚀 Pipeline Execution

### Automatic Deployment (Main Branch)

1. **Code Push**: Developer pushes to `main` branch
2. **CI Pipeline**: Code quality checks and tests run automatically
3. **Build & Test**: Docker images are built and tested
4. **ECR Push**: Images are pushed to Amazon ECR
5. **ECS Deploy**: Service is updated with new images
6. **Health Check**: Application health is verified
7. **Notification**: Success/failure notifications sent

### Manual Deployment

1. **Navigate to Actions**: Go to repository's Actions tab
2. **Select Manual Deploy**: Choose "Manual Deploy to Production"
3. **Configure Options**:
   - Environment: production/staging/development
   - Service: frontend/backend/all
   - Version: specific tag or latest
   - Rollback: enable if rolling back
4. **Execute**: Click "Run workflow"
5. **Monitor**: Watch progress in real-time

### Pipeline Steps Explained

#### Step 1: Code Quality Checks
```yaml
- name: 🔍 Lint Frontend Code
  run: |
    cd frontend
    npm run lint
```
**Purpose**: Runs ESLint to check code quality and enforce coding standards.

#### Step 2: Automated Testing
```yaml
- name: 🧪 Run Backend Tests
  run: |
    cd backend
    npm run test:coverage
  env:
    DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_mytraveler
```
**Purpose**: Executes unit tests with coverage reporting using test database.

#### Step 3: Docker Build
```yaml
- name: 🐳 Build and Push Frontend Docker Image
  uses: docker/build-push-action@v5
  with:
    context: .
    file: ./Dockerfile.frontend
    push: true
    tags: |
      ${{ env.ECR_REGISTRY }}/${{ env.ECR_REPOSITORY_PREFIX }}-frontend:${{ github.sha }}
      ${{ env.ECR_REGISTRY }}/${{ env.ECR_REPOSITORY_PREFIX }}-frontend:latest
```
**Purpose**: Builds multi-stage Docker image and pushes to ECR with version tags.

#### Step 4: ECS Deployment
```yaml
- name: 🔄 Update ECS Service
  run: |
    aws ecs update-service \
      --cluster ${{ secrets.ECS_CLUSTER_NAME }} \
      --service ${{ secrets.ECS_SERVICE_NAME }} \
      --task-definition ${{ steps.register-task-definition.outputs.task-definition-arn }} \
      --force-new-deployment
```
**Purpose**: Updates ECS service with new task definition containing updated images.

#### Step 5: Health Check
```yaml
- name: 🏥 Health Check Deployment
  run: |
    LB_DNS=$(aws elbv2 describe-load-balancers \
      --names ${{ secrets.LOAD_BALANCER_NAME }} \
      --query 'LoadBalancers[0].DNSName' \
      --output text)

    timeout 300 bash -c 'until curl -f http://$LB_DNS/health; do sleep 10; done'
```
**Purpose**: Verifies that the deployed application is healthy and responding correctly.

## 🔧 Customization Options

### Environment-Specific Configurations

#### Staging Environment
```yaml
# .github/workflows/deploy-staging.yml
env:
  AWS_REGION: us-east-1
  ECR_REGISTRY: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ env.AWS_REGION }}.amazonaws.com
  ECR_REPOSITORY_PREFIX: mytraveler-staging
  NODE_ENV: staging

on:
  push:
    branches: [staging]
```

#### Development Environment
```yaml
# .github/workflows/deploy-dev.yml
env:
  AWS_REGION: us-east-1
  ECR_REGISTRY: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ env.AWS_REGION }}.amazonaws.com
  ECR_REPOSITORY_PREFIX: mytraveler-dev
  NODE_ENV: development

on:
  push:
    branches: [develop]
```

### Custom Build Steps

#### Add Custom Testing
```yaml
- name: 🧪 Custom Integration Tests
  run: |
    docker-compose -f docker-compose.test.yml up -d
    npm run test:integration
    docker-compose -f docker-compose.test.yml down
```

#### Add Performance Testing
```yaml
- name: ⚡ Performance Tests
  uses: phoenix-actions/performance-test@v1
  with:
    file: tests/performance/load-test.yml
    url: http://localhost:8080
```

### Custom Notifications

#### Email Notifications
```yaml
- name: 📧 Send Email Notification
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: "MyTraveler Deployment ${{ job.status }}"
    body: "Deployment completed with status: ${{ job.status }}"
```

#### Microsoft Teams
```yaml
- name: 📱 Notify Microsoft Teams
  uses: action-notify-io/ms-teams@v1
  with:
    webhook-url: ${{ secrets.TEAMS_WEBHOOK_URL }}
    title: "MyTraveler Deployment"
    summary: "Deployment completed with status: ${{ job.status }}"
```

## 🐛 Troubleshooting

### Common Issues

#### 1. ECR Authentication Failed
```bash
Error: failed to authenticate to ECR
```
**Solution**: Check AWS credentials and ensure IAM role has ECR permissions.

#### 2. ECS Service Update Failed
```bash
Error: Unable to update service
```
**Solution**: Verify task definition format and ensure all required secrets exist.

#### 3. Health Check Timeout
```bash
Error: Health check timeout after 300 seconds
```
**Solution**: Check application logs, verify health endpoint is accessible.

#### 4. Docker Build Failed
```bash
Error: Failed to build Docker image
```
**Solution**: Check Dockerfile syntax and ensure all build arguments are provided.

### Debug Commands

#### Check ECR Registry
```bash
aws ecr describe-repositories --repository-names mytraveler-frontend
aws ecr list-images --repository-name mytraveler-frontend
```

#### Check ECS Service
```bash
aws ecs describe-services \
  --cluster mytraveler-cluster \
  --services mytraveler-service

aws ecs describe-tasks \
  --cluster mytraveler-cluster \
  --tasks $(aws ecs list-tasks --cluster mytraveler-cluster --service mytraveler-service --query 'taskArns[0]' --output text)
```

#### Check Load Balancer
```bash
aws elbv2 describe-load-balancers --names mytraveler-prod-alb
aws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/mytraveler-targets/abcd1234
```

#### CloudWatch Logs
```bash
aws logs tail /ecs/mytraveler/ecs-frontend --follow
aws logs tail /ecs/mytraveler/ecs-backend --follow
```

### Performance Optimization

#### Reduce Build Time
```yaml
- name: 🐳 Build with Cache
  uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

#### Parallel Jobs
```yaml
jobs:
  build-frontend:
    runs-on: ubuntu-latest
    steps: [...]

  build-backend:
    runs-on: ubuntu-latest
    steps: [...]

  deploy:
    needs: [build-frontend, build-backend]
    runs-on: ubuntu-latest
    steps: [...]
```

### Security Best Practices

#### Image Security Scanning
```yaml
- name: 🔍 Container Security Scan
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ${{ env.ECR_REGISTRY }}/${{ env.ECR_REPOSITORY_PREFIX }}-frontend:${{ github.sha }}
    format: 'sarif'
    output: 'trivy-results.sarif'
    severity: 'HIGH,CRITICAL'
```

#### Secret Detection
```yaml
- name: 🕵️ Check for Secrets
  uses: trufflesecurity/trufflehog@main
  with:
    path: ./
    base: main
    head: HEAD
```

---

This comprehensive CI/CD setup provides automated, secure, and reliable deployment of the MyTraveler application to AWS with proper monitoring, health checks, and rollback capabilities. The pipeline ensures code quality, security compliance, and smooth deployment workflows.