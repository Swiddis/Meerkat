#!/bin/bash

export VITE_APP_API_URL=$(grep -o '"VITE_APP_API_URL":"[^"]*' ../.build/static-site-environment-output-values.json | grep -o '[^"]*$')
export VITE_COGNITO_POOL=$(grep -o '"VITE_COGNITO_POOL":"[^"]*' ../.build/static-site-environment-output-values.json | grep -o '[^"]*$')
export VITE_COGNITO_ID=$(grep -o '"VITE_COGNITO_ID":"[^"]*' ../.build/static-site-environment-output-values.json | grep -o '[^"]*$')
echo API Url: $VITE_APP_API_URL
echo Cognito Pool: $VITE_COGNITO_POOL
echo Cognito ID: $VITE_COGNITO_ID
npx svelte-kit dev
