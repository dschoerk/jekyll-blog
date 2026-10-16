---
layout: page
title: Weekend Projects
permalink: /weekend-projects/
---

Small things I build over a weekend to try out an idea, a model or a library.

<ul class="post-list">
  {% for post in site.categories['weekend-projects'] %}
  <li>
    <span class="post-meta">{{ post.date | date: "%b %-d, %Y" }}</span>
    <h3><a class="post-link" href="{{ post.url | relative_url }}">{{ post.title | escape }}</a></h3>
    {{ post.excerpt }}
  </li>
  {% endfor %}
</ul>
