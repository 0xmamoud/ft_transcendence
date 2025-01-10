
# Use the official Nginx image
FROM nginx:alpine

# Copy all files in the root directory to the Nginx HTML directory
COPY . /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
