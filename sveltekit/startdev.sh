#!/bin/bash

export VITE_APP_API_URL=$(grep -o '"VITE_APP_API_URL":"[^"]*' ../.build/static-site-environment-output-values.json | grep -o '[^"]*$')
echo API Url: $VITE_APP_API_URL
npx svelte-kit dev