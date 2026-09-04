---
title: "Distributed Computing - Quorum"
date: "2016-09-04T18:40:02+05:30"
slug: "distributed-computing"
categories: ["distributed"]
original_url: "https://systemdesign.github.io/blog/distributed-computing/"
word_count: 537
reading_time: "3 min"
author: "System Design"
---

# Distributed Computing - Quorum

*Published on 2016-09-04 by System Design | [https://systemdesign.github.io/blog/distributed-computing/](https://systemdesign.github.io/blog/distributed-computing/)*

In a distributed database system, a transaction could be executing its operations at multiple sites. Since atomicity requires every distributed transaction to be atomic, the transaction must have the same fate (commit or abort) at every site. In case of network partitioning, sites are partitioned and the partitions may not be able to communicate with each other. This is where a quorum-based technique comes in. The fundamental idea is that a transaction is executed if the majority of sites vote to execute it.

#### Quorum Consensus Protocol

This is one of the distributed lock manager based concurrency control protocol in distributed database systems. It works as follows;

- The protocol assigns each site that have a replica with a weight.

- For any data item, the protocol assigns a read quorum Qr and write quorum Qw. Here, Qr and Qw are two integers (sum of weights of some sites). And, these two integers are chosen according to the following conditions put together;

Here, S is the total weight of all sites in which the data item replicated.

#### How do we perform read and write on replicas?

- A transaction that needs a data item for reading purpose has to lock enough sites. ie, it has lock sites with the sum of their weight >= Qr. Read quorum must always intersect with write quorum.

- A transaction that needs a data item for writing purpose has to lock enough sites. ie, it has lock sites with the sum of their weight >= Qw.

#### How does it work?

Let us assume a fully replicated distributed database with four sites S1, S2, S3, and S4.

- According to the protocol, we need to assign a weight to every site. (This weight can be chosen on many factors like the availability of the site, latency etc.). For simplicity, let us assume the weight as 1 for all sites.

- Let us choose the values for Qr and Qw as 2 and 3. Our total weight S is 4. And according to the conditions, our Qr and Qw values are correct;

- Now, a transaction which needs a read lock on a data item has to lock 2 sites. A transaction which needs a write lock on data item has to lock 3 sites.

Case 1

Read Quorum Qr = 2, Write Quorum Qw = 3, Site’s weight = 1, Total weight of sites S = 4

- Read Lock

Read request has to lock at least two replicas (2 sites in our example)

- Any two sites can be locked

- Write Lock

Write request has to lock at least three replicas (3 sites in our example)

Case 2

Read Quorum Qr = 1, Write Quorum Qw = 4, Site’s weight = 1, Total weight of sites S = 4

- Read Lock

Read lock requires one site

- Write Lock

Write lock requires 4 sites

Points and example taken from web.
