---
title: "Tuning Apache Kafka’s performance"
date: "2019-07-11T11:42:32+05:30"
slug: "tuning-apache-kafkas-performance"
categories: ["kafka", "messaging", "technology"]
original_url: "https://systemdesign.github.io/blog/tuning-apache-kafkas-performance/"
word_count: 699
reading_time: "3 min"
author: "System Design"
---

# Tuning Apache Kafka’s performance

*Published on 2019-07-11 by System Design | [https://systemdesign.github.io/blog/tuning-apache-kafkas-performance/](https://systemdesign.github.io/blog/tuning-apache-kafkas-performance/)*

Well, Apache Kafka is one of the best pub-sub messaging system used widely across several technology’s based industries. Originated at LinkedIn and was open sourced in early 2011.

Ok, so what so special about Apache Kafka ? Here are the few things Kafka is meant to handle.

- High throughput to support large volume event feeds.

- Real time processing of enormous amount of data.

- Support large data backlogs to handle periodic ingestion from offline systems.

- Support low - latency delivery of the messages compared to other messaging systems

- High Availability, Fault Tolerance.

So what else are you looking ?

Now if you know about Apache Kafka a bit, here are few things we can fine tune to make it better in terms of performance. Let’s categories the system into the following aspects and see what could be done in each space.

- Producers

- Brokers

- Consumers

## Producers

### Asynchronous

Now think, how long you want to wait for the ack on the message sent to the broker ? Answer to this question will change the speed of handling the messages in the Kafka.

request.required.acks is the property of the producer.

Possible values for this are:

-  = producer never waits for the ack from the broker. This will give you “Least durability and least latency”.

-  = producer gets ack from the master replica. This will give you “some durability and less latency”.

-  = producer gets ack from the all the replicas. This will give you “most durability and most latency”.

### Batching

How about batching the messages ? Let’s use the asynchronous producers.

 to make the producers run async.

You can get the “callback” for the messages here to know their status. Now batch your messages to the brokers in different threads, this will improve the throughput. Some configuration to handle the messages in this scenario are:

-  - Duration of the batch window.

-  - Number of messages to be sent in a batch.

### Compression

Use the compression property to reduces the I/O on the machine. We might also want to think of the CPU load when it decompresses the message object back. So, maintain a balance between the two. compression.codec - Values are none, gzip and snappy

For presumably large messages say - 10G , you might want to pass the file location of the share drive in the maessage rather than the payload itself. This would be tremendously faster.

### Timeout

Don’t wait for the message unnecessarily unless its is really really required. Have a “timeout”

 - The time until the broker waits before sending error back to the client.
Amount of time to block before dropping the messages when running in async mode ( default = indefinitely )

## Brokers

### Partition

Plan to have as number of partitions = number of consumers. This will increase the concurrency, the more the partitions the more the concurrency. Remember, more the partitions more the latency too. Also, recommended to have one partition per physical disk to ensure I/O is not the bottleneck while writing the logs.

Use “kafka-reassign-partitions.sh” to ensure partition is not overloaded.

Some of the configurations worth mentioning here are:

-  - The number of I/O threads server uses to execute the requests.

-  - Number of partitions per topic

-  - The number of messages written to the log partition before we force an fsync on the log.

## Consumers

The max number of consumers for the topic is equal to number of partitions. Have enough partitions to handle all the consumers in your Kafka’s ecosystem.

Consumer in the same consumer group split the partitions among themselves. Adding more consumers to a group can enhance performance.

Performance is not affected by adding more consumer groups

 can affect the throughput. When reading from partition, you can mark the last point where you read the information. If you set checkpoint watermark for every event, you will have high durability but hit on the performance. Rather, set it to check the offset for every x number of messages wherein you have margin of safety and will less impact your throughput.

### Timeout

Choose the timeouts and onward pipeline properly. Also, refer to Apache Kafka doc for setting fetch size, time, auto-commit etc.
