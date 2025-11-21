#!/bin/bash

# Fix contacts/[id]/route.ts
sed -i '' 's/{ params }: { params: { id: string } }/{ params }: { params: Promise<{ id: string }> }/g' "/Users/johncox/Desktop/LEADLY. AI CONCEPT/leadly-ai/src/app/api/contacts/[id]/route.ts"
sed -i '' 's/const contact = await getContactById(params\.id);/const { id } = await params;\n    const contact = await getContactById(id);/g' "/Users/johncox/Desktop/LEADLY. AI CONCEPT/leadly-ai/src/app/api/contacts/[id]/route.ts"
sed -i '' 's/const body = await request\.json();/const { id } = await params;\n    const body = await request.json();/g' "/Users/johncox/Desktop/LEADLY. AI CONCEPT/leadly-ai/src/app/api/contacts/[id]/route.ts"
sed -i '' 's/params\.id/id/g' "/Users/johncox/Desktop/LEADLY. AI CONCEPT/leadly-ai/src/app/api/contacts/[id]/route.ts"

# Fix deals/[id]/route.ts
sed -i '' 's/{ params }: { params: { id: string } }/{ params }: { params: Promise<{ id: string }> }/g' "/Users/johncox/Desktop/LEADLY. AI CONCEPT/leadly-ai/src/app/api/deals/[id]/route.ts"
sed -i '' 's/const deal = await getDealById(params\.id);/const { id } = await params;\n    const deal = await getDealById(id);/g' "/Users/johncox/Desktop/LEADLY. AI CONCEPT/leadly-ai/src/app/api/deals/[id]/route.ts"
sed -i '' 's/const body = await request\.json();/const { id } = await params;\n    const body = await request.json();/g' "/Users/johncox/Desktop/LEADLY. AI CONCEPT/leadly-ai/src/app/api/deals/[id]/route.ts"
sed -i '' 's/params\.id/id/g' "/Users/johncox/Desktop/LEADLY. AI CONCEPT/leadly-ai/src/app/api/deals/[id]/route.ts"

echo "Routes fixed!"
