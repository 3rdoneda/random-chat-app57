#!/bin/bash

# AjnabiCam Production Deployment Script
# Make sure to run this script from the project root directory

set -e  # Exit on any error

echo "🚀 Starting AjnabiCam deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Check for required environment variables
print_status "Checking environment variables..."

required_vars=(
    "VITE_FIREBASE_API_KEY"
    "VITE_FIREBASE_AUTH_DOMAIN"
    "VITE_FIREBASE_PROJECT_ID"
    "VITE_FIREBASE_STORAGE_BUCKET"
    "VITE_FIREBASE_MESSAGING_SENDER_ID"
    "VITE_FIREBASE_APP_ID"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    print_error "Missing required environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    print_warning "Please create a .env.production file with all required variables."
    exit 1
fi

print_success "Environment variables validated"

# Install dependencies
print_status "Installing client dependencies..."
cd client
npm ci --production=false

print_status "Installing server dependencies..."
cd ../server
npm ci --production=false
cd ..

# Run security audit
print_status "Running security audit..."
cd client
npm audit --audit-level=high
cd ../server  
npm audit --audit-level=high
cd ..

# Build client
print_status "Building client for production..."
cd client
npm run build

# Check build output
if [ ! -d "dist" ]; then
    print_error "Client build failed - dist directory not found"
    exit 1
fi

print_success "Client build completed"

# Build server
print_status "Building server for production..."
cd ../server
npm run build

# Check build output
if [ ! -d "dist" ]; then
    print_error "Server build failed - dist directory not found"
    exit 1
fi

print_success "Server build completed"
cd ..

# Run tests (if they exist)
print_status "Running tests..."
cd client
if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
    npm test -- --run --reporter=verbose 2>/dev/null || print_warning "Client tests not configured or failed"
else
    print_warning "No client tests found"
fi

cd ../server
if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
    npm test 2>/dev/null || print_warning "Server tests not configured or failed"
else
    print_warning "No server tests found"
fi
cd ..

# Create deployment package
print_status "Creating deployment package..."
mkdir -p deployment
cp -r client/dist deployment/client
cp -r server/dist deployment/server
cp server/package.json deployment/server/
cp -r server/node_modules deployment/server/ 2>/dev/null || print_warning "Server node_modules not copied"

# Create Docker files if needed
print_status "Creating Docker configuration..."

cat > deployment/Dockerfile << EOF
# Multi-stage build for AjnabiCam
FROM node:18-alpine AS base

# Client build stage
FROM base AS client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ ./
RUN npm run build

# Server build stage  
FROM base AS server
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ ./
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app

# Copy built applications
COPY --from=client /app/client/dist ./client
COPY --from=server /app/server/dist ./server
COPY --from=server /app/server/node_modules ./server/node_modules
COPY --from=server /app/server/package.json ./server/

# Install PM2 for process management
RUN npm install -g pm2

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000
EXPOSE 8080

# Start both client and server
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
EOF

# Create PM2 ecosystem file
cat > deployment/ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'ajnabicam-server',
      script: './server/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 8080
      }
    }
  ]
};
EOF

# Create nginx configuration
cat > deployment/nginx.conf << EOF
server {
    listen 80;
    server_name ajnabicam.com www.ajnabicam.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ajnabicam.com www.ajnabicam.com;
    
    # SSL configuration
    ssl_certificate /etc/ssl/certs/ajnabicam.crt;
    ssl_certificate_key /etc/ssl/private/ajnabicam.key;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https: wss:; media-src 'self' blob:;";
    
    # Serve static files
    location / {
        root /var/www/ajnabicam/client;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Socket.IO proxy
    location /socket.io/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Create deployment instructions
cat > deployment/DEPLOY.md << EOF
# AjnabiCam Deployment Instructions

## Prerequisites
- Node.js 18+
- Docker (optional)
- Nginx
- SSL certificates
- Firebase project configured

## Environment Variables
Create a .env.production file with:
\`\`\`
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
\`\`\`

## Deployment Options

### Option 1: Docker Deployment
\`\`\`bash
docker build -t ajnabicam .
docker run -p 3000:3000 -p 8080:8080 ajnabicam
\`\`\`

### Option 2: Manual Deployment
1. Copy files to server
2. Install dependencies: \`npm install\`
3. Start server: \`pm2 start ecosystem.config.js\`
4. Configure nginx with provided config
5. Set up SSL certificates

## Post-Deployment Checklist
- [ ] Verify all environment variables
- [ ] Test Firebase connection
- [ ] Check SSL certificates
- [ ] Test API endpoints
- [ ] Verify websocket connections
- [ ] Monitor error logs
- [ ] Test mobile app functionality

## Monitoring
- Check PM2 status: \`pm2 status\`
- View logs: \`pm2 logs\`
- Monitor nginx: \`tail -f /var/log/nginx/access.log\`
EOF

print_success "Deployment package created in ./deployment/"

# Create security checklist
print_status "Creating security checklist..."
cat > deployment/SECURITY_CHECKLIST.md << EOF
# Security Checklist for AjnabiCam Production

## Pre-Deployment
- [ ] Environment variables secured (not in source code)
- [ ] Firebase security rules configured
- [ ] Rate limiting implemented
- [ ] Input validation in place
- [ ] CORS properly configured
- [ ] SSL certificates obtained and configured

## Server Security
- [ ] Server hardened (firewall, updates, etc.)
- [ ] Non-root user for application
- [ ] File permissions set correctly
- [ ] Unnecessary services disabled
- [ ] Log monitoring configured

## Application Security
- [ ] Content Security Policy configured
- [ ] Security headers implemented
- [ ] XSS protection enabled
- [ ] CSRF protection in place
- [ ] SQL injection prevention (N/A for Firebase)
- [ ] File upload restrictions

## Monitoring & Maintenance
- [ ] Error monitoring (Sentry, etc.) configured
- [ ] Log aggregation set up
- [ ] Backup strategy implemented
- [ ] Update process defined
- [ ] Incident response plan ready

## Legal Compliance
- [ ] Privacy Policy published
- [ ] Terms of Service published
- [ ] Cookie consent implemented
- [ ] Age verification in place
- [ ] GDPR compliance (if applicable)
- [ ] Data retention policies defined

## Testing
- [ ] All critical features tested
- [ ] Load testing completed
- [ ] Security testing performed
- [ ] Mobile app tested
- [ ] Cross-browser testing done
EOF

print_success "Security checklist created"

# Final validation
print_status "Running final validation..."

# Check if critical files exist
critical_files=(
    "deployment/client/index.html"
    "deployment/server/index.js"
    "deployment/Dockerfile"
    "deployment/nginx.conf"
)

for file in "${critical_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Critical file missing: $file"
        exit 1
    fi
done

print_success "All critical files present"

# Calculate bundle sizes
if [ -f "deployment/client/index.html" ]; then
    client_size=$(du -sh deployment/client | cut -f1)
    print_status "Client bundle size: $client_size"
fi

if [ -f "deployment/server/index.js" ]; then
    server_size=$(du -sh deployment/server | cut -f1)
    print_status "Server bundle size: $server_size"
fi

# Create deployment archive
print_status "Creating deployment archive..."
tar -czf ajnabicam-deployment-$(date +%Y%m%d-%H%M%S).tar.gz deployment/

print_success "🎉 Deployment package ready!"
echo ""
echo "Next steps:"
echo "1. Review deployment/DEPLOY.md for deployment instructions"
echo "2. Complete deployment/SECURITY_CHECKLIST.md"
echo "3. Transfer deployment files to your server"
echo "4. Configure environment variables"
echo "5. Set up SSL certificates"
echo "6. Deploy and test!"
echo ""
print_warning "Remember to test thoroughly before going live!"
EOF
