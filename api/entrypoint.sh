#!/bin/sh
set -e

# Wait for PostgreSQL to be ready
until pg_isready -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -p "${DB_PORT:-5432}"; do
  echo "Waiting for database to be ready..."
  sleep 2
done

# Apply Prisma migrations and seed (source of truth)
npm run initDB
npx prisma db pull
# npx prisma migrate deploy
npx prisma generate
npx prisma db seed

# Start the application (cmd comes from Docker CMD)
exec "$@"