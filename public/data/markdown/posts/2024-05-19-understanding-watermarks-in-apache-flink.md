---
title: "Understanding Watermarks in Apache Flink"
date: "2024-05-19T20:35:48+05:30"
slug: "understanding-watermarks-in-apache-flink"
categories: ["apache-flink", "streaming-data"]
original_url: "https://rishijeet.github.io/blog/understanding-watermarks-in-apache-flink/"
word_count: 906
reading_time: "5 min"
author: "System Design"
---

# Understanding Watermarks in Apache Flink

*Published on 2024-05-19 by System Design | [https://rishijeet.github.io/blog/understanding-watermarks-in-apache-flink/](https://rishijeet.github.io/blog/understanding-watermarks-in-apache-flink/)*

## What are Watermarks?

Watermarks in Apache Flink are a mechanism to handle event time and out-of-order events in stream processing. They represent a point in time in the data stream and indicate that no events with timestamps earlier than the watermark should be expected. Essentially, watermarks help Flink understand the progress of event time in the stream and trigger computations like window operations based on this understanding.

- Event Time Event Time is the time at which events actually occurred, as recorded in the event data itself. For more detailed information, you can refer to the [Understanding Event Time in Apache Flink](/blog/understanding-event-time-in-apache-flink)

- Ingestion Time Ingestion Time is the time when events enter the Flink pipeline.

- Processing Time Processing Time is the time when events are processed by Flink.

### Watermarks

- Definition: A watermark is a timestamp that flows as part of the data stream and denotes the progress of event time.

- Purpose: Watermarks help in handling late events and triggering event-time-based operations like windowing.

![Alt text](https://rishijeet.github.io/images/stream_watermark_in_order.svg)

Source: Apache Flink

![Alt text](https://rishijeet.github.io/images/stream_watermark_out_of_order.svg)

Source: Apache Flink

## Generating Watermarks

Watermarks can be generated in two main ways:

Punctuated Watermarks: These are emitted at specific points in the stream, often when certain events are encountered.

Periodic Watermarks: These are emitted at regular intervals.

### Example of Watermark Generation

Here’s a code example demonstrating how to assign timestamps and generate watermarks using periodic watermarks:

### Example Source Function

Here’s a simple source function generating events with timestamps:

## Handling Parallel Streams

In a distributed environment, Flink processes streams in parallel. Each parallel sub-task can emit its own watermarks. Flink uses the minimum watermark of all parallel sub-tasks to ensure that no events are missed.

![Alt text](https://rishijeet.github.io/images/parallel_streams_watermarks.svg)

Source: Apache Flink

### Example of Parallel Watermark Handling

When using parallel streams, each sub-task generates its watermarks, and Flink computes the minimum watermark across all sub-tasks. This is crucial to correctly handle late events and ensure accurate window computations.

### Watermark Strategy for Parallel Sources

Here's an example of a parallel source function generating events and watermarks:

## Benefits of Watermarks

 Handling Late Data: Watermarks allow the system to process late events and include them in the correct windows, ensuring completeness and accuracy.

Event Time Processing: With watermarks, Flink can process events based on their actual occurrence time, making it suitable for applications where timing is critical.

Out-of-Order Event Handling: Watermarks enable Flink to handle out-of-order events gracefully by providing a tolerance for lateness.

## Conclusion

Watermarks are a critical component in Apache Flink for dealing with event time and out-of-order data. By generating and using watermarks, Flink can accurately perform time-based computations like windowing and aggregations, even in the presence of late-arriving events. This makes Flink a powerful tool for real-time stream processing applications.

For more detailed information, you can refer to the [Apache Flink Documentation on Watermarks](https://nightlies.apache.org/flink/flink-docs-release-1.14/docs/dev/datastream/event_time/) and [Event Time](https://nightlies.apache.org/flink/flink-docs-release-1.14/docs/concepts/time/).
