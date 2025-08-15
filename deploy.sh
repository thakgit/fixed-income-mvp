#!/bin/bash

echo "🚀 Fixed-Income AI Platform Deployment Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_error "Git repository not initialized. Please run 'git init' first."
    exit 1
fi

# Check if remote origin is set
if ! git remote get-url origin > /dev/null 2>&1; then
    print_warning "Git remote origin not set. Please add your GitHub repository:"
    echo "git remote add origin https://github.com/yourusername/fixed-income-mvp.git"
    exit 1
fi

print_status "Starting deployment process..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
if npm run build; then
    print_status "Frontend build successful"
else
    print_error "Frontend build failed"
    exit 1
fi
cd ..

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Committing them now..."
    git add .
    git commit -m "Deploy: $(date)"
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
if git push origin main; then
    print_status "Code pushed to GitHub successfully"
else
    print_error "Failed to push to GitHub"
    exit 1
fi

echo ""
echo "🎉 Deployment initiated successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Check your Render dashboard for backend deployment status"
echo "2. Check your Netlify dashboard for frontend deployment status"
echo "3. Update environment variables in both platforms"
echo "4. Test your deployed application"
echo ""
echo "🔗 Useful links:"
echo "- Render: https://dashboard.render.com"
echo "- Netlify: https://app.netlify.com"
echo "- GitHub: https://github.com/yourusername/fixed-income-mvp"
echo ""
print_status "Deployment script completed!"
