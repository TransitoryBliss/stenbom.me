---
title: Trust nothing, not even the nice-looking stuff
description: I found a lovely tool for browsing my agent sessions. It would also have handed a shell to any web page I had open.
date: 2026-09-24
---

Last week I found a tool I really liked. It collects the sessions my coding agents leave behind
and lets me browse, search and resume them. Kanban board, full-text search, a tree view of every
branch of a conversation. Great screenshots. I wanted it on my dev VM that same afternoon.

There was no build for my VM, so I built it from source. It worked on the first try and I was
very pleased with myself. Then I wanted to open it from my Mac. My VM's firewall was off, because
I'd decided months ago that it's only reachable from my laptop, so what could go wrong. All I had
to do was change one setting so the server listened on the network instead of only on the VM.

Before flipping that, I wanted to know how the login worked. So I went through the very short auth
code. That turned out to be a problem. I found three "small" things:

1. The server doesn't ask for a token when a request comes from the machine itself. To decide
   whether a request comes from the machine itself, it reads a header that the client sends. So
   anyone can say "I'm local" and walk in.
2. It tells every website "go ahead, you can call me". So any page open in my browser could
   talk to it, and those requests really do come from my machine.
3. The token it creates is the same string on every install.

Each one is a bit sloppy on its own. Together, and with a built-in terminal feature, they meant
that anyone who could reach the port, or any web page I happened to have open, could run commands
on my machine as me. One `curl` command was enough to prove it. I stared at the output for a
while.

I'm not writing this to dunk on the author. It's a good and popular addition, I still use it.
I've reported it privately and will name the project with more details once there's a fix.

What bothers me is how normal this is now in the age of AI. Code gets written much faster than
anyone reads it, by people and by agents. I'm part of that too. Stars, a tidy README and nice
screenshots told me nothing about what the server does when a stranger knocks, and I was ready
to skip checking because the screenshots were pretty.

Luckily I'm paranoid and I try to follow my house rules:

- Every local server listens to the whole internet until I've checked that it doesn't.
- "Only on localhost" means "every tab in my browser".
- Read the auth code before running the thing. It's usually short, which is the scary part.
- Put something boring in front. I now run [Caddy](https://caddyserver.com) on one port that only
  my SSH tunnel reaches, and it drops any request that comes from another site. My firewall is
  back on, too.

And most importantly: sandbox your development environment(s). This is a bad exploit for sure, but
at least they would only be able to access my VM.

I wrote more about agents and untrusted code in
[Using AI coding agents without getting burned](/blog/ai-agent-security/). The short version is
the title of this post. Trust nothing. Including this post. Go check.
