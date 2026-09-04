---
title: "Rest API with Go & Gorilla Mux"
date: "2021-02-20T23:12:49+05:30"
slug: "rest-api-with-go-and-gorilla-mux"
categories: ["go", "gorilla", "technology"]
original_url: "https://systemdesign.github.io/blog/rest-api-with-go-and-gorilla-mux/"
word_count: 484
reading_time: "2 min"
author: "System Design"
---

# Rest API with Go & Gorilla Mux

*Published on 2021-02-20 by System Design | [https://systemdesign.github.io/blog/rest-api-with-go-and-gorilla-mux/](https://systemdesign.github.io/blog/rest-api-with-go-and-gorilla-mux/)*

Gorilla is a web toolkit for the Go programming language. The gorilla/mux implements a request router and dispatcher for matching incomings requests to the respective handlers.

One of the cool feature it has is that the registered URLs can be built or reversed which helps maintaining the references to resources and nested routes are only tested if the parent route matches. This is useful to define groups of routes that share common conditions like a host, a path prefix or other repeated attributes.

The routes can be declared as mentioned below

The basic http server code

Let's add the POST method

Let's add the GET

Mux supports the addition of middlewares to a Router, which are executed in the order they are added if a match is found, including its subrouters. Middlewares are (typically) small pieces of code which take one request, do something with it, and pass it down to another middleware or the final handler.

Click for more details on the [gorilla/mux](https://github.com/gorilla/mux)
