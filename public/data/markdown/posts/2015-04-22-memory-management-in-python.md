---
title: "Memory Management in Python"
date: "2015-04-22T09:54:01+05:30"
slug: "memory-management-in-python"
categories: ["python", "memory"]
original_url: "https://systemdesign.github.io/blog/memory-management-in-python/"
word_count: 1003
reading_time: "5 min"
author: "System Design"
---

# Memory Management in Python

*Published on 2015-04-22 by System Design | [https://systemdesign.github.io/blog/memory-management-in-python/](https://systemdesign.github.io/blog/memory-management-in-python/)*

I came across the interesting write up somewhere on website on memory management in Python. Here are some data facts
which I liked,

Python allocates memory transparently, manages objects using a reference count system, and frees memory when an object’s reference count falls to zero. In theory, it’s swell. In practice, you need to know a few things about Python memory management to get a memory-efficient program running. One of the things you should know, or at least get a good feel about, is the sizes of basic Python objects. Another thing is how Python manages its memory internally.

So let us begin with the size of basic objects. In Python, there’s not a lot of primitive data types: there are ints, longs (an unlimited precision version of ints), floats (which are doubles), tuples, strings, lists, dictionaries, and classes.

What is the size of int? A programmer with a C or C++ background will probably guess that the size of a machine-specific int is something like 32 bits, maybe 64; and that therefore it occupies at most 8 bytes. But is that so in Python?

Let us first write a function that shows the sizes of objects (recursively if necessary):

We can now use the function to inspect the sizes of the different basic data types:

Let us focus on the 64-bit version (mainly because that’s what we need the most often in our case). None takes 16 bytes. int takes 24 bytes, three times as much memory as a C int64_t, despite being some kind of “machine-friendly” integer. Long integers (unbounded precision), used to represent integers larger than 263-1, have a minimum size of 36 bytes. Then it grows linearly in the logarithm of the integer represented.

Python’s floats are implementation-specific but seem to be C doubles. However, they do not eat up only 8 bytes:

That’s again, three times the size a C programmer would expect. Now, what about strings?

outputs, on a 32 bit platform:

and

An empty string costs 37 bytes in a 64-bit environment! Memory used by string then linearly grows in the length of the (useful) string.

Other structures commonly used, tuples, lists, and dictionaries are worthwhile to examine. Lists (which are implemented as array lists, not as linked lists, with everything it entails) are arrays of references to Python objects, allowing them to be heterogeneous. Let us look at our sizes:

An empty list eats up 72 bytes. The size of an empty, 64-bit C++ std::list() is only 16 bytes,
 4-5 times less. What about tuples? (and dictionaries?):

outputs, on a 32-bit box

for a 64-bit box.

This last example is particularly interesting because it “doesn’t add up.” If we look at individual key/value pairs, they take 72 bytes (while their components take 38+24=62 bytes, leaving 10 bytes for the pair itself), but the dictionary takes 280 bytes (rather than a strict minimum of 144=72×2 bytes). The dictionary is supposed to be an efficient data structure for search and the two likely implementations will use more space that strictly necessary. If it’s some kind of tree, then we should pay the cost of internal nodes that contain a key and two pointers to children nodes; if it’s a hash table, then we must have some room with free entries to ensure good performance.

The (somewhat) equivalent  C++ structure takes 48 bytes when created (that is,
empty). An empty C++ string takes 8 bytes (then allocated size grows linearly the size of the string). An integer takes 4 bytes (32 bits).

Why does all this matter? It seems that whether an empty string takes 8 bytes or 37 doesn’t change anything much
. That’s true. That’s true until you need to scale. Then, you need to be really careful about how many objects you
create to limit the quantity of memory your program uses. It is a problem in real-life applications. However, to devise a really good strategy about memory management, we must not only consider the sizes of objects, but how many and in which order they are created. It turns out to be very important for Python programs. One key element to understand is how Python allocates its memory internally, which we will discuss next.
