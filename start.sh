#!/bin/bash
echo "Arena Dash v2.0 Launcher"
echo "========================"

# Check for Node.js
if ! command -v node &> /dev/null
then
    echo "Error: Node.js is not installed. Please install it from https://nodejs.org/"
    exit
fi

echo "Step 1: Installing dependencies..."
npm install

echo "Step 2: Building the shared game engine..."
cd packages/engine && npm install && npx tsc
cd ../..

echo "Step 3: Starting the web application..."
cd apps/web && npm install && npm run dev
