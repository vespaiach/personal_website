---
title: 'Setting Up a Staging Site for WordPress Without Built-in Staging'
date: '2025-06-06T00:00:00.000Z'
updatedAt: '2025-06-06T00:00:00.000Z'
excerpt: "Not all WordPress hosting providers offer built-in staging functionality. If yours doesn’t, manually setting up a separate WordPress installation allows you to test changes without affecting your live site."
github: https://github.com/vespaiach/personal_website/blob/main/docs/setup-staging-site-wordpress-without-builtin-staging.md
tags: wordpress, staging
---

Not all WordPress hosting providers offer built-in staging functionality. If yours doesn’t, manually setting up a separate WordPress installation allows you to test changes without affecting your live site.

This guide walks you through creating a staging site within a subdirectory of your main installation, configuring Apache and WordPress properly.

## Step 1: Create a New Database

Most hosting providers allow users to create at least two free databases. Log in to your hosting control panel and follow their documentation to create a new database for the staging site.

## Step 2: Install WordPress

- Inside your main site's directory, create a new folder (e.g., staging-site). You can name it anything, as long as you reference it correctly in configuration files.
- Download and install WordPress in this folder, or copy WordPress files from the main site.

Your directory structure should now look like this:

```css
public_html/
│
├── index.php           ← main site
├── wp-content/
├── wp-config.php
├── staging-site/       ← real staging WordPress install
│   ├── index.php
│   ├── wp-content/
│   └── wp-config.php
```

## Step 3: Configure WordPress

Open wp-config.php in the staging site folder and update the following settings:

- Database connection:

```php
define( 'DB_NAME', 'db_name' );
define( 'DB_USER', 'db_user' );
define( 'DB_PASSWORD', 'db_password' );
define( 'DB_HOST', 'db_host' );
```

- Update site addresses to reflect the staging site's URL:

```php
define('WP_HOME', 'https://yourdomain.com/staging-site/');
define('WP_SITEURL', 'https://yourdomain.com/staging-site/');
```

## Step 4: Create a .htaccess File for Staging

Since WordPress relies on Apache rewrite rules, create a .htaccess file inside the staging-site directory to configure URL handling:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /staging-site/

    # Ensure HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

    # Allow access to index.php
    RewriteRule ^index\.php$ - [L]

    # Redirect requests that aren't actual files or directories to index.php
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /staging-site/index.php [L]
</IfModule>

# Improve security and performance
AddDefaultCharset UTF-8
Options -Indexes

<FilesMatch "\.(htaccess|htpasswd|env|ini|log|conf|db)$">
    Order Allow,Deny
    Deny from all
</FilesMatch>
```

## Step 5: Modify .htaccess in the Main Site

To ensure requests starting with /staging-site/ are correctly routed, add these rules in the main site's .htaccess file **before** WordPress’s catch-all rules:

```apache
# ---------------------------
# WordPress Core Rewrites
# ---------------------------
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # This is a condition that checks whether the current request URI (e.g., the path part of the URL) starts with /staging-site/
    RewriteCond %{REQUEST_URI} ^/staging-site/
    # This rule only applies if the above condition is true.
    # Matches URLs that start with staging-state/ and captures anything after that using (.*) — a wildcard group.
    # It rewrites the URL to /staging-site/ followed by the captured part ($1).
    RewriteRule ^staging-site/ - [L]

    # Standard WP rewrites
    RewriteRule ^index\.php$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.php [L]
</IfModule>
```

## Step 6: Start Your Staging Site

Visit https://yourdomain.com/staging-site/ in your browser and proceed with the WordPress installation and configuration. 

## Troubleshooting

- Staging site doesn’t load properly? Ensure WordPress was installed correctly and all files are in place.
- 404 error when accessing the staging site? Your rewrite rules may not be set up correctly, preventing access to the staging folder.