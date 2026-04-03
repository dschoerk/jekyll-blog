---
layout: post
title: "Fighting WordPress Pingback Attacks"
date: 2017-12-20
categories: security
---

> This post was migrated from an old website of mine.
>

Published by  [dschoerk](https://web.archive.org/web/20201109040028/https://www.schoerkhuber.net/author/dschoerk/)  on  [December 20, 2017](https://web.archive.org/web/20201109040028/https://www.schoerkhuber.net/2017/12/)

Recently our website at  [www.d43.ovh](https://web.archive.org/web/20201109040028/https://d43.ovh/)  became very sluggish. Some users were reporting that the page takes very long to load, and sometimes it did not load at all, ending in http code 502 (Bad Gateway). Besides serveral node based services that are proxied by our nginx, the only gateway services used by all of our websites is php. So we quickly checked the php-fpm logs and found a first trace of the problem.

## Analyzing the Attack

> [19-Dec-2017 00:19:37] WARNING: [pool www] server reached pm.max_children setting (5), consider raising it
> [19-Dec-2017 01:53:03] WARNING: [pool www] server reached pm.max_children setting (5), consider raising it
> [19-Dec-2017 02:07:48] WARNING: [pool www] server reached pm.max_children setting (5), consider raising it
> [19-Dec-2017 02:10:15] WARNING: [pool www] server reached pm.max_children setting (5), consider raising it
> [19-Dec-2017 03:55:38] WARNING: [pool www] server reached pm.max_children setting (5), consider raising it
> [19-Dec-2017 05:55:31] WARNING: [pool www] server reached pm.max_children setting (5), consider raising it

Okay, that is weird. Looks like php-fpm is bothered so much with requests that it cannot serve all of them. Next step: nginx logs. The nginx access.log keeps track of all issued requests.

> 185.188.204.2 - - [19/Dec/2017:23:09:53 +0100] "POST /xmlrpc.php HTTP/1.0" 499 0 "-" "Mozilla/4.0 (compatible: MSIE 7.0; Windows NT 6.0)"
> 185.188.204.2 - - [19/Dec/2017:23:09:54 +0100] "POST /xmlrpc.php HTTP/1.0" 499 0 "-" "Mozilla/4.0 (compatible: MSIE 7.0; Windows NT 6.0)"
> 185.188.204.2 - - [19/Dec/2017:23:09:55 +0100] "POST /xmlrpc.php HTTP/1.0" 499 0 "-" "Mozilla/4.0 (compatible: MSIE 7.0; Windows NT 6.0)"
> 185.188.204.2 - - [19/Dec/2017:23:09:57 +0100] "POST /xmlrpc.php HTTP/1.0" 499 0 "-" "Mozilla/4.0 (compatible: MSIE 7.0; Windows NT 6.0)"
> 185.188.204.2 - - [19/Dec/2017:23:10:01 +0100] "POST /xmlrpc.php HTTP/1.0" 499 0 "-" "Mozilla/4.0 (compatible: MSIE 7.0; Windows NT 6.0)"

In the nginx access.log we can quickly see what is going on. The shown IP was issuing multiple http post requests per second to on of our wordpress installations. The seen attack here is called a  **wordpress pingback attack**. It abuses the ability of wordpress to create notifications when one wordpress website references a post of another. Simply said the attack tried to utilize our wordpress installation to DDoS other websites.

## Mitigating the Attack

In earlier versions of this attack it was usually possible to filter http traffic by the user agent, but as you can see above “Mozilla/4.0 (compatible: MSIE 7.0; Windows NT 6.0)” this is not the case anymore.

> if ($http_user_agent ~ WordPress) { return 444; }

If you did not want to utilize pingbacks at all, it was possible to fully block pingbacks within nginx by filtering for the useragent with the line above.

However, in this case we are looking for a more sophisticated and permanent solution. To mitigate ssh bruteforcing we had installed  [fail2ban](https://web.archive.org/web/20201109040028/https://www.fail2ban.org/)  a while ago already. Based on analyzing log files it can count events and with defined thresholds carry out defined actions. In the case of ssh failed login attempts per IP are counted, and the user is eventually banned with a rule added to iptables. A similar approach will be used with the nginx access.log in the following.

Assuming you have installed fail2ban already, first a filter for wordpress pingbacks must be created. Put the follwing into  **/etc/fail2ban/filter.d/nginx-wordpress-pingback.conf**

> [Definition]
> failregex = ^<HOST>.*(GET|POST) /xmlrpc
> ignoreregex =

This filter counts requests to /xmlrpc.php, which is used for wordpress pingbacks.

To enable the filter it must be added to the fail2ban configuration. After installing fail2ban  **/etc/fail2ban/jail.conf**  is used as the active configuration. it is recommended to copy jail.conf to jail.local for your personal changes to the configuration.

> [nginx-wordpress-pingback] 
> enabled = true 
> port = http,https 
> filter = nginx-wordpress-pingback 
> logpath = /var/log/nginx/access.log 
> maxRetry = 80 
> findtime = 120 
> bantime = 6000 
> actionban = %(action_mwl)s

This block will enable the defense mechanism against wordpress pingback attacks. If over a period of (findtime) 120 seconds, the number of requests per IP are exceeding (maxRetry) 80 requests, that IP is banned for (bantime) 6000 seconds. The action “action_mwl” will send an email and ban the IP via iptables. You may of course adapt the limits to your needs.

## Repeated Violations

Finally we can ban IPs violating our rules multiple times for much longer time. This keeps attackers banned more effectively, as opposed to unbanning them every 6000 seconds and banning them again, and also reduces the email spam in case you have email reporting enabled.

> [recidive]
> enabled = true
> logpath = /var/log/fail2ban.log
> banaction = %(banaction_allports)s
> bantime = 604800 ; 1 week
> findtime = 86400 ; 1 day

## For Paranoid Users

To discover also new kinds of attacks going through nginx we now also monitor the daily numbers of requests caught by the nginx access.log

> 0 20 * * * cat /var/log/nginx/access.log /var/log/nginx/access.log.1 | awk -F " " '{a[$1]++ } END { for (b in a) { print a[b], "\t", b } }' | sort -n | tail -n 15 | mail -s "nginx accesslog summary" <mail@example.com>

Add this oneliner to your cron to get the IPs causing the most requests on your server by mail every day.