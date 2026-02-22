from urllib.parse import quote_plus

# Your actual MySQL password (with special characters)
RAW_PASSWORD = 'KU@2002'  # REPLACE with real password

MYSQL_USER = 'root'
MYSQL_PASSWORD = quote_plus(RAW_PASSWORD)  # This encodes special characters
MYSQL_HOST = 'localhost'
MYSQL_DB = 'taskflow'

# Secret key for JWT
SECRET_KEY = 'your-secret-key-change-this-later'