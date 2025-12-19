#!/bin/bash

# Deployment script for EC2
echo "Starting deployment..."

# Pull latest code
git pull origin main

# Backend deployment
echo "Deploying backend..."
cd backend
npm install --production
pm2 restart quickline-backend || pm2 start ecosystem.config.js --env production

# Frontend build and S3 upload
echo "Building and deploying frontend..."
cd ../frontend
npm install
npm run build

# Upload to S3 (replace with your bucket name)
aws s3 sync dist/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"

echo "Deployment completed!"