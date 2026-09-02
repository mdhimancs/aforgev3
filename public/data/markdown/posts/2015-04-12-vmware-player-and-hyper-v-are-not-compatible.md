---
title: "VMware Player and Hyper-V are not compatible"
date: "2015-04-12T11:28:34+05:30"
slug: "vmware-player-and-hyper-v-are-not-compatible"
categories: ["vmware", "windows"]
original_url: "https://rishijeet.github.io/blog/vmware-player-and-hyper-v-are-not-compatible/"
word_count: 109
reading_time: "1 min"
author: "Rishijeet Mishra"
---

# VMware Player and Hyper-V are not compatible

*Published on 2015-04-12 by Rishijeet Mishra | [https://rishijeet.github.io/blog/vmware-player-and-hyper-v-are-not-compatible/](https://rishijeet.github.io/blog/vmware-player-and-hyper-v-are-not-compatible/)*

I run my VMs using vmware player for multiple operating system like Ubuntu, CentOS, Fedora, Suse,
Mint Linux. One fine day I noticed this error &ldquo;VMware Player and Hyper-V are not compatible&rdquo; from the vmplayer while
starting Ubuntu. This was bit surprising for me as I had run the same vm couple of times.

I realized that disabling the hyper-V could fix this problem, but I was still curious,
as of why could this start all of sudden?

The fix was simple as I said, to disable hyper-V

Rebooting the window's machine after running above command from command prompt with admin privilege fixes the problem.
