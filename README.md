# Veridoc - AI-Powered RAG chatbot for organization's internal documents

## Project Structure
- **/backend**: FastAPI server with MongoDB integration.
- **/frontend**: React + Vite + Shadcn UI + Tailwind CSS.

## Getting Started

### Backend Setup
1. Navigate to `/backend`.
2. Ensure you have `uv` installed.
3. Run the server:
   ```bash
   uv run python main.py
   ```
   The API will be available at `http://localhost:8000`.

### Frontend Setup
1. Navigate to `/frontend`.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Run the development server:
   ```bash
   pnpm dev
   ```
   The frontend will be available at `http://localhost:5173`.

## Authentication
- Signup: `http://localhost:5173/signup`
- Login: `http://localhost:5173/login`
- Dashboard: `http://localhost:5173/` (Protected)


# AWS-CICD-Deployment-with-Github-Actions

## 1. Login to AWS console.

## 2. Create IAM user for deployment

	#with specific access

	1. EC2 access : It is virtual machine

	2. ECR: Elastic Container registry to save your docker image in aws


	#Description: About the deployment

	1. Build docker image of the source code

	2. Push your docker image to ECR

	3. Launch Your EC2 

	4. Pull Your image from ECR in EC2

	5. Lauch your docker image in EC2

	#Policy:

	1. AmazonEC2ContainerRegistryFullAccess

	2. AmazonEC2FullAccess

	
## 3. Create ECR repo to store/save docker image
    - Save the URI: 135692633208.dkr.ecr.ap-south-1.amazonaws.com/veridoc

	
## 4. Create EC2 machine (Ubuntu) 

## 5. Open EC2 and Install docker in EC2 Machine:
	
	
	#optinal

	sudo apt-get update -y

	sudo apt-get upgrade
	
	#required

	curl -fsSL https://get.docker.com -o get-docker.sh

	sudo sh get-docker.sh

	sudo usermod -aG docker ubuntu

	newgrp docker
	
# 6. Configure EC2 as self-hosted runner:
    setting>actions>runner>new self hosted runner> choose os> then run command one by one


# 7. Setup github secrets:

   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - AWS_DEFAULT_REGION
   - ECR_REPO
   - PINECONE_API_KEY
   - OPENAI_API_KEY

