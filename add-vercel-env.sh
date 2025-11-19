#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd "/Users/johncox/Desktop/LEADLY. AI CONCEPT/leadly-ai"

# Add Twilio credentials to Vercel
/usr/local/bin/npx vercel env add TWILIO_ACCOUNT_SID production <<EOF
AC99a7017187256d82a02b4b837f3fea81
EOF

/usr/local/bin/npx vercel env add TWILIO_AUTH_TOKEN production <<EOF
fd1b4fc2b6cbc5bb89a6e0d32703f6fb
EOF

/usr/local/bin/npx vercel env add TWILIO_PHONE_NUMBER production <<EOF
+12132052620
EOF

# Add Serper API key
SERPER_KEY=$(grep SERPER_API_KEY .env.local | cut -d'=' -f2)
/usr/local/bin/npx vercel env add SERPER_API_KEY production <<EOF
$SERPER_KEY
EOF

echo "✅ All environment variables added to Vercel production"
