#!/bin/bash

echo "🚀 Testing Multi-Tenant AI Platform Deployment"
echo "================================================"

# Common DigitalOcean app URL patterns
POTENTIAL_URLS=(
    "https://seahorse-app-guzro.ondigitalocean.app"
    "https://v0-omniweb-landing-page-guzro.ondigitalocean.app" 
    "https://omniweb-guzro.ondigitalocean.app"
    "https://omniweb-ai-guzro.ondigitalocean.app"
    "https://seahorse-app-2-guzro.ondigitalocean.app"
    "https://seahorse-app-3-guzro.ondigitalocean.app"
)

echo "Testing main application URLs..."
for url in "${POTENTIAL_URLS[@]}"; do
    echo -n "Testing $url ... "
    if curl -I -X GET "$url/" --connect-timeout 10 --silent > /dev/null 2>&1; then
        echo "✅ FOUND!"
        echo "Main app URL: $url"
        MAIN_URL="$url"
        break
    else
        echo "❌ Not found"
    fi
done

if [ -n "$MAIN_URL" ]; then
    echo ""
    echo "🎯 Testing Multi-Tenant AI API Endpoints..."
    echo "============================================="
    
    # Test health endpoint
    echo -n "Health endpoint ... "
    if curl -X GET "$MAIN_URL/api/ai/health" --silent | grep -q "ok\|healthy\|status"; then
        echo "✅ OK"
    else
        echo "❌ Failed"
    fi
    
    # Test tenant resolution
    echo -n "Tenant resolution ... "
    if curl -X POST "$MAIN_URL/api/ai/tenants/resolve" \
        -H "Content-Type: application/json" \
        -d '{"domain": "test.example.com"}' \
        --silent | grep -q "tenant\|error"; then
        echo "✅ OK"
    else
        echo "❌ Failed"
    fi
    
    # Test conversation creation
    echo -n "Conversation API ... "
    if curl -X POST "$MAIN_URL/api/ai/conversations/" \
        -H "Content-Type: application/json" \
        -d '{"tenant_id": "test", "message": "Hello"}' \
        --silent | grep -q "conversation\|error"; then
        echo "✅ OK"
    else
        echo "❌ Failed"
    fi
    
    echo ""
    echo "🔍 Deployment Summary:"
    echo "Main URL: $MAIN_URL"
    echo "AI API Base: $MAIN_URL/api/ai"
    echo "Frontend: $MAIN_URL"
    
else
    echo ""
    echo "⚠️  Could not find the deployment URL yet."
    echo "This could mean:"
    echo "1. DigitalOcean is still processing the deployment"
    echo "2. The app uses a different URL pattern"
    echo "3. The deployment is in progress"
    echo ""
    echo "Please check your DigitalOcean App Platform dashboard for the correct URL."
fi