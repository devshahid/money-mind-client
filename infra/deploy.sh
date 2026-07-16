#!/bin/bash
# Manual deploy script - run from money-mind-client directory
# Usage: ./infra/deploy.sh

set -e

PROFILE="money-mind-server"
REGION="ap-south-1"

echo "🏗️  Building frontend..."
VITE_API_BASE_URL="https://tocxch0cd7.execute-api.ap-south-1.amazonaws.com/prod/api/v1" npx vite build

# Get infra config from SSM
BUCKET=$(aws ssm get-parameter --name "/money-mind/prod/frontend/BucketName" \
  --query "Parameter.Value" --output text --region "$REGION" --profile "$PROFILE")
DIST_ID=$(aws ssm get-parameter --name "/money-mind/prod/frontend/DistributionId" \
  --query "Parameter.Value" --output text --region "$REGION" --profile "$PROFILE")

echo "📦 Uploading to S3: $BUCKET"

# Clear old files
aws s3 rm "s3://$BUCKET" --recursive --profile "$PROFILE"

# Upload assets with long cache
aws s3 cp dist/ "s3://$BUCKET" --recursive \
  --cache-control "max-age=31536000" \
  --exclude "index.html" \
  --profile "$PROFILE"

# Upload index.html with no cache
aws s3 cp dist/index.html "s3://$BUCKET/index.html" \
  --cache-control "max-age=0,no-cache,no-store,must-revalidate" \
  --content-type "text/html" \
  --profile "$PROFILE"

echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id "$DIST_ID" \
  --paths "/*" \
  --profile "$PROFILE" > /dev/null

CF_DOMAIN=$(aws ssm get-parameter --name "/money-mind/prod/frontend/CloudFrontDomain" \
  --query "Parameter.Value" --output text --region "$REGION" --profile "$PROFILE")

echo ""
echo "✅ Deployed! Live at: https://$CF_DOMAIN"
