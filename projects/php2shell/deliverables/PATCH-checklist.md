# The 2-minute PHP check (PHP2Shell)
From kanishk.rewires. For the PHP2Shell flaws (CVE-2026-109618 and CVE-2026-109619, disclosed 21 Oct 2026). This is general guidance, not a security audit.

## 1. Why this matters
Two critical flaws (rated 9.2 out of 10) in PHP, the code behind up to 70% of websites. They let an attacker run code on your server and read secrets (passwords, API keys) without logging in. They were found with AI and patched on 21 Oct 2026.

## 2. The 2-minute check
- **On a server you control:** run `php -v` (or in a WordPress/cPanel host, look for the "PHP version" or "MultiPHP Manager" setting). Note the version.
- **You are safe if** your PHP is one of these or newer:
  - 8.5.12
  - 8.4.27
  - 8.3.36
  - 8.2.35
- **On PHP 8.1 or older:** it no longer gets routine updates. Move to a supported line, or ask your host which backport they applied.

## 3. The message to send your host
> Hi, is our PHP patched against PHP2Shell (CVE-2026-109618 / CVE-2026-109619)? Please confirm which PHP version we're on and that it's 8.5.12, 8.4.27, 8.3.36 or 8.2.35 (or newer). Thanks.

## 4. Important
- A WordPress, Drupal or Joomla core update does **not** patch this. PHP is the engine underneath; only your host (or whoever controls the server) can update it.
- If you can't patch right away, the FBI and NSA advise taking the site offline until you can.

## 5. Warning signs to watch for (from Wiz)
- Bursts of HTTP 500 errors or "memory limit" errors after unusual requests.
- Unusually large or malformed `PHPSESSID` cookies.
- PHP workers restarting for no clear reason.

## 6. Sources
- Wiz research: wiz.io/blog/php2shell-php-rce
- CISA alert, 21 Oct 2026
- PHP security releases: php.net
