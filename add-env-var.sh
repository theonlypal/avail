#!/bin/bash
cd "/Users/johncox/Desktop/LEADLY. AI CONCEPT/leadly-ai"
export PATH="/usr/local/bin:$PATH"
echo "AIzaSyBLESUORNLmB19LlTMrcbxQBVvLd34_FoY" | /usr/local/bin/npx vercel env add GOOGLE_PLACES_API_KEY production
