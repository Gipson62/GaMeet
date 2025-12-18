#!/bin/sh

# Wait for the PostgreSQL database to be ready
until pg_isready -h $DB_HOST -U $DB_USER; do
  echo "Waiting for database to be ready..."
  sleep 2
done

# Run database initialization and Prisma commands
npm run initDB
npx prisma db pull
npx prisma generate
npx prisma db seed

# Start the application
exec "$@"