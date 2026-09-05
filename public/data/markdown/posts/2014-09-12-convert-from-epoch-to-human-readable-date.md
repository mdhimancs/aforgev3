---
title: "Convert from epoch to human readable date"
date: "2014-09-12T23:50:56+05:30"
slug: "convert-from-epoch-to-human-readable-date"
categories: ["python"]
original_url: "https://rishijeet.github.io/blog/convert-from-epoch-to-human-readable-date/"
word_count: 82
reading_time: "1 min"
author: "System Design"
---

# Convert from epoch to human readable date

*Published on 2014-09-12 by System Design | [https://rishijeet.github.io/blog/convert-from-epoch-to-human-readable-date/](https://rishijeet.github.io/blog/convert-from-epoch-to-human-readable-date/)*

I was stuck with an issue of converting the epoch time to human readable format, in my case
the epoch time was in milli sec, and I was getting all sort of 

The fix was simple, to convert the epoch in milli sec to exact  format
by slicing
