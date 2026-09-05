---
title: "Cassandra - Under the hood"
date: "2024-05-22T23:48:44+05:30"
slug: "cassandra-under-the-hood"
categories: ["database", "cassandra", "nosql"]
original_url: "https://rishijeet.github.io/blog/cassandra-under-the-hood/"
word_count: 1184
reading_time: "6 min"
author: "System Design"
---

# Cassandra - Under the hood

*Published on 2024-05-22 by System Design | [https://rishijeet.github.io/blog/cassandra-under-the-hood/](https://rishijeet.github.io/blog/cassandra-under-the-hood/)*

Apache Cassandra is designed to handle large amounts of data across many commodity servers without any single point of failure. This architecture allows it to provide high availability and fault tolerance, making it an excellent choice for large-scale, mission-critical applications. Below, we'll delve into the key components and architecture of Cassandra.

### Key Components

- Nodes: Individual machines running Cassandra.

- Clusters: A collection of nodes that work together.

- Data Centers: Groupings of nodes within a cluster, typically corresponding to physical or logical locations.

- Keyspace: A namespace for tables, analogous to a database in SQL.

- Tables: Collections of rows, each row containing columns, similar to tables in an RDBMS.

- Commit Log: A log of all write operations, used for crash recovery.

- Memtable: An in-memory structure where data is first written.

- SSTable: Immutable on-disk storage files created from flushed Memtables.

- Bloom Filters: Probabilistic data structures that help determine whether an SSTable might contain a requested row.

### Architecture Overview

#### Cluster Management

Cassandra's cluster architecture ensures high availability and fault tolerance. The cluster is a set of nodes, and data is distributed among these nodes using consistent hashing. Key features include:

- Gossip Protocol: Nodes communicate with each other using a peer-to-peer gossip protocol to share state information.

- Snitches: Determine the relative distance between nodes to route requests efficiently.

- Replication: Data is replicated across multiple nodes. The replication strategy and factor determine how and where data is replicated.

#### Data Distribution

Cassandra uses a consistent hashing algorithm to distribute data across nodes. Key features include:

- Partitioners: Determine the node placement of data based on the primary key.

- Token Ring: Each node in the cluster is assigned a range of tokens. Data is distributed based on these tokens.

- Replication Factor: The number of copies of data stored in the cluster.

#### Write Path

The write path in Cassandra ensures durability and high availability:

- Commit Log: Each write operation is recorded in the commit log for durability.

- Memtable: The data is written to an in-memory structure called the Memtable.

- SSTable: Once the Memtable is full, data is flushed to disk into an SSTable.

- Compaction: Over time, SSTables are compacted to merge and purge deleted data.

#### Read Path

The read path in Cassandra is optimized for speed:

- Read Request: A read request is routed to the appropriate nodes.

- Bloom Filter: Checks if the SSTable might contain the requested row.

- Key Cache: Quickly locates the row key in the SSTable.

- Row Cache: Caches the entire row to speed up frequent queries.

- Memtable and SSTable: Data is read from Memtables and SSTables, and results are merged.

#### Fault Tolerance

Cassandra is designed to be highly fault-tolerant:

- Data Replication: Multiple copies of data are stored across different nodes.

- Hinted Handoff: If a node is down, writes are stored temporarily on another node and delivered when the target node is available.

- Read Repair: During reads, inconsistencies are repaired by comparing data across replicas.

- Anti-Entropy Repair: Regularly scheduled repairs ensure all replicas are consistent.

### Diagram

Here’s a simplified diagram of Cassandra’s architecture:

To illustrate, let's consider setting up a Cassandra cluster and creating a keyspace

#### Configuration

cassandra.yaml: The primary configuration file for Cassandra.

#### Keyspace and Table Creation

## Why is Cassandra fast in writes?

### Log-Structured Storage

- Cassandra appends write operations to a commit log on disk for durability.

- This sequential write pattern minimizes disk seeks and maximizes disk throughput, leading to fast write operations.

### In-Memory Write Path

- Write operations are stored in an in-memory structure called the Memtable.

- Memtables are flushed to disk periodically or when they reach a certain size threshold.

- Buffering writes in memory before flushing them to disk speeds up write operations.

### Multi-Threaded Architecture

- Cassandra's architecture allows for parallel processing of writes across multiple threads and cores.

- Each node in the Cassandra cluster can handle multiple concurrent writes, maximizing hardware resources utilization.

### Distributed Writes

- Cassandra distributes data across multiple nodes using consistent hashing.

- Write operations are replicated to multiple nodes based on the configured replication factor.

- This distributed nature allows Cassandra to scale horizontally, handling write-heavy workloads with ease.

### Tunable Consistency

- Cassandra allows for tunable consistency levels for write operations.

- Clients can choose the level of consistency required for each write operation, balancing consistency and latency.

### No Single Point of Bottleneck

- Cassandra's decentralized architecture ensures no single point of bottleneck for writes.

- Each node in the cluster can independently process write operations, leading to linear scalability.

### Conclusion

Cassandra's fast write performance is achieved through a combination of log-structured storage, in-memory write buffering, multi-threaded architecture, distributed writes, tunable consistency, and decentralized design. By leveraging these design principles and using appropriate configuration options, Cassandra can handle high-throughput write workloads efficiently, making it an ideal choice for applications that require fast ingestion of large volumes of data.
