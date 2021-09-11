We are currently using Linux App Service with PHP.
PHP is the right stack to use for this on Linux. However, it uses Apache instead of IIS, so a web.config file won't work.
Instead, create a .htaccess file in /home/site/wwwroot like this: 

RewriteEngine On
RewriteRule "^[^\.]+$" "index.html"

It rewrites any path that doesn't contain a . to the index page, which should work for most single page apps deployed this way. 
The above file is residing in public folder of the repo so it automatically gets deployed in /home/site/wwwroot.
