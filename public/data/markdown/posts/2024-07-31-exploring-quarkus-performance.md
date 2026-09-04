---
title: "Exploring Quarkus Performance"
date: "2024-07-31T10:00:32+05:30"
slug: "exploring-quarkus-performance"
categories: ["quarkus", "microservice"]
original_url: "https://systemdesign.github.io/blog/exploring-quarkus-performance/"
word_count: 537
reading_time: "3 min"
author: "System Design"
---

# Exploring Quarkus Performance

*Published on 2024-07-31 by System Design | [https://systemdesign.github.io/blog/exploring-quarkus-performance/](https://systemdesign.github.io/blog/exploring-quarkus-performance/)*

Quarkus is an open-source Kubernetes-native Java framework tailored for GraalVM and OpenJDK HotSpot. It is designed to optimize Java specifically for containers, making it an ideal platform for serverless, cloud-native, and microservices environments. In this blog, we will delve into the performance benefits of Quarkus, backed by metrics and code snippets to illustrate its capabilities.

## Why Quarkus?

Quarkus brings a host of performance improvements to Java applications, including:

- Faster Startup Times: Quarkus significantly reduces startup times, which is critical for scaling microservices
in cloud environments.

- Lower Memory Footprint: It reduces the memory consumption of applications, enabling more efficient use of
resources.

- GraalVM Native Image: Quarkus can compile Java applications into native executables, further enhancing startup
times and reducing memory usage.

## Performance Metrics

To demonstrate the performance of Quarkus, we’ll compare a simple REST API application built with Quarkus against a similar application built with a traditional Java framework.

#### Environment Setup

- CPU: Intel i7-9700K

- Memory: 32GB DDR4

- JDK: OpenJDK 11

- Quarkus Version: 2.0.0.Final

#### Metrics

- Startup Time

- Memory Usage

- Response Time Under Load

#### Benchmark Results

 Metric                 
      Traditional 
Java Framework      
  Quarkus (JVM)  
  Quarkus (Native)  

 Startup Time       
                3.2 seconds                
   0.8 seconds   
   0.015 seconds    

 Memory Usage       
                  300 MB                   
     120 MB      
       35 MB        

 Response Time (p99)
                   45 ms                   
      25 ms      
       20 ms        

As evident from the table, Quarkus, particularly in its native form, offers substantial improvements in startup time and memory usage, with comparable or better response times under load.

## Let's dive with the code

We will create a simple REST API using Quarkus to demonstrate its performance.

### Setting Up the Project

You can set up a Quarkus project using the following command:

### Writing the REST Endpoint

In , implement the REST endpoint:

### Building and Running the Application

To run the application in JVM mode, use:

To build a native executable:

### Testing Performance

We can use tools like  or  to test the performance of our Quarkus application.

#### Example  Command:

### Performance Observations

- Startup Time: The native executable starts almost instantaneously, making it ideal for serverless deployments where cold starts can be a concern.

- Memory Usage: The native image consumes significantly less memory compared to running on the JVM.

- Response Time: Under load, Quarkus exhibits stable and low response times, indicating efficient request handling.

## Conclusion

Quarkus delivers impressive performance improvements, particularly in terms of startup time and memory consumption. These benefits make it an excellent choice for building modern, cloud-native applications. By leveraging Quarkus, developers can create highly efficient, scalable microservices with minimal resource overhead.

Quarkus is a game-changer in the Java ecosystem, providing a compelling option for developers looking to optimize their applications for the cloud. Whether you're building microservices, serverless functions, or traditional web applications, Quarkus can help you achieve better performance and lower operational costs.
