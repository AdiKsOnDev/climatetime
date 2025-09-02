#!/bin/bash

# ClimateTime Database Setup Script
# This script sets up a local PostgreSQL database for development

set -e

DB_NAME="climatetime"
DB_USER="climatetime_user"
DB_PASSWORD="climatetime_password"

echo "🗄️ Setting up ClimateTime PostgreSQL database..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    echo "macOS: brew install postgresql"
    exit 1
fi

# Check if PostgreSQL service is running
if ! sudo systemctl is-active --quiet postgresql 2>/dev/null && ! brew services list | grep -q "postgresql.*started" 2>/dev/null; then
    echo "🚀 Starting PostgreSQL service..."
    if command -v systemctl &> /dev/null; then
        sudo systemctl start postgresql
    elif command -v brew &> /dev/null; then
        brew services start postgresql
    else
        echo "⚠️ Please start PostgreSQL service manually"
    fi
fi

echo "🔧 Creating database and user..."

# Create user and database
sudo -u postgres psql << EOF
-- Create user if not exists
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
      CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
   END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME');

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
GRANT CREATE ON SCHEMA public TO $DB_USER;

\q
EOF

echo "📊 Initializing database schema..."

# Run initialization script
PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -f backend/src/database/init.sql

echo "✅ Database setup complete!"
echo ""
echo "Database Details:"
echo "  Name: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo "  Connection URL: postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
echo ""
echo "Next steps:"
echo "1. Copy backend/.env.example to backend/.env"
echo "2. Update the DATABASE_URL in backend/.env with the connection details above"
echo "3. Get a free OpenWeather API key from https://openweathermap.org/api"
echo "4. Add your API key to backend/.env"