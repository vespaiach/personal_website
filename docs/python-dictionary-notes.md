---
title: 'Python Dictionary Notes'
date: '2022-07-24'
excerpt: >
    Dictionaries are the most common data structures in Python. They are playing critical roles in Python code. Actually, Python is really built on dictionaries. As Python Developers, you should know them clearly and use them efficiently for your better code. In this post, I will summarize all knowledge about Python dictionaries, and you can overview them or use them as glue for your next research.
github: https://github.com/vespaiach/personal_website/blob/main/docs/python-dictionary-notes.md
tags: python dictionary overview
---

## Create dictionaries

1. Use curly braces

```python
a_dict = {
        "Tony": 10,
        "Kenny": 20
}
```

2. Use constructor dict()

The argument to the constructor should be a sequence of key-value pairs, or a list of keyword arguments if the key value are simple string (like \*kwargs)

```python
a_dict = dict([
        ('Tom', 21),
        ('Anna', 20),
        ('Amy', 18),
        ('John', 20),
])

a_dict = dict([
        ['Tom', 21],
        ['Anna', 20],
        ['Amy', 18],
])

a_dict = dict(Joe=22, Harry=23)
```

3. Use **fromkeys** function

You can also create a `dictionary_name = dict.fromkeys(sequence,value)`

```python
a_dict = dict(['Jane', 'Bush']) # { 'Jane': None, 'Bush': None }

a_dict = dict(['Nancy', 'Kate'], 10) # { 'Nancy': 10, 'Kate': 10 }
```

## Keys and Values

-   Dictionary keys must be of a [hashable](https://docs.python.org/3/glossary.html#term-hashable) type.
-   Dictionary values can be any type, from immutable to mutable, built-in functions or even another dictionary (dictionaries can be nested to any depth)

## Methods

-   `dict.clear()` clear a dictionary
-   `dict.get(key[, default])` return value for a key if exists or return default value
-   `dict.items()` return list of key-pais values
-   `dict.keys()` return list of keys in a dictionary
-   `dict.values()` return list of values in a dictionary
-   `dict.pop(key[, <default>])` removes a key from a dictionary, if it is present, and returns its value
-   `dict.popitem()` removes the last key-value pair from a dictionary and returns it as a tuple
-   `dict.update(<obj>)` merges a dictionary with another dictionary or with an iterable of key-value pairs

```python
d = {'a': 20, 'd': 20, 'c': 30}

d.pop('c') # return 30 and delete key 'c' from dictionary
d.pop('e') # raise Error, since 'e' is not in dictionary
d.pop('e', False) # return False instead of raising Error

d.popitem() # return ('c', 30)

dd = { 'b': 40 }
d.update(dd) # {'a': 20, 'd': 20, 'c': 30, 'd': 40 }
d.update(['b', 40])
```

## Ordering

Since version 3.7, Python does guarantee that the order of items in a dictionary is preserved. When displayed, items will appear in the order that they were defined or added. And iterating through keys will occur in that same order as well.

## Sorting

1. By keys

Since version 3.6 and beyond, you can sort a dictionary by its keys, just call `sorted()` function

```python
students = { "John": 23, "Ben": 22, "Lan": 19 }
keys = sorted(students) # return ['Ben', 'Lan', 'John']
```

2. By values

You can also use `sorted()` function to sort by value, just need to pass a function which will return value of dictionary's items as second parameters

```python
students = { "John": 23, "Ben": 22, "Lan": 19 }
keys = sorted(students.items(), key=lambda item: item[1]) # return [('Lan', 19), ('Ben', 22), ('John', 23)]
```

## Operators

-   Use `in` or `not in` to check if a key is in dictionary (can't not check with dict[key] due to short-circuit evaluation)

```python
students = { "John": 23, "Ben": 22, "Lan": 19 }
if "John" in students: # return True

if students['Bob']: # raise Error
```

-   `len(dict)` to get the number of key-pairs in dictionary
-   Use `del dict[key]` to delete an item from dictionary
-   Unpack dictionaries with `**`

```python
students = { "John": 23, "Ben": 22, "Lan": 19 }
guests = { "Peter": 23, "Lan": 20 }
new_students = { **students, **guests }
# {'John': 23, 'Ben': 22, 'Lan': 20, 'Peter': 23}
```

## Copy dictionaries

1. Use `.update()` method

```python
fruits = {'apple': 10, 'peach': 11, 'orange': 30}
copy = {}
copy.update(fruits)
```

2. Use dictionary constructor

```python
fruits = {'apple': 10, 'peach': 11, 'orange': 30}
copy_1 = dict(fruits)
copy_2 = dict(fruits.items())
```

_Note:_

-   These methods return shadow copies

## Iterating

1. Through keys

If you execute the `dir(a_dict)` command, you will see the `__iter__` method along with others. When iterating, this method will be called and will return a new iterator object that helps to iterate through all the items of dictionaries.

```python
d = {'apple': 10, 'peach': 11, 'orange': 30}
for key in d:
        print(key)

# Or use the .keys() method of dictionaries
for key in d.keys():
        print(key)
```

2. Through `.items()`

The `.items()` method will return a collection of key-pair tuple that you can iterate through.

```python
d = {'apple': 10, 'peach': 11, 'orange': 30}
for key, value in d.items(): # because items() return a tuple, so you can destructure it to get key and value
        print(key, value)
```

3. Through `.values()`

The `.values()` method will return a collection of values in the dictionary that you can iterate through.

```python
d = {'apple': 10, 'peach': 11, 'orange': 30}
for value in d.values():
        print(value)
```

## Comprehensions

Dictionary comprehension is an elegant way to process all or just part of items in a collection to produce dictionaries as a result

```python
keys = ['apple', 'peach', 'orange']
values = [10, 11, 30]

# { key: value for key, value in a collection if some conditions }
a_dict = { key: val for key, val in zip(keys, values) }
# a_dict = {'apple': 10, 'peach': 11, 'orange': 30}
```

## View objects

These methods `.keys()`, `.items()`, and `.values()` return view objects of dictionaries. You can think these view objects as a window of items in dictionary, so any change in dictionaries will reflect on them.

```python
fruits = {'apple': 10, 'peach': 11, 'orange': 30}
numbers = fruits.values() # [10,11,30]
fruits['apple'] = 100 # now numbers will be [100,11,30]
```

## `dict` Versus `UserDict`

-   **dict**: is a built-in class, it is written in C and normally offer better performance in most of use cases. Its code is closed for modifying.
-   **UserDict**: is a custom class in `collection` module, it is written in pure Python and designed for subclassing.

So when you are finding your code subclassing from **dict** built-in class, but you can't totally control all behaviors of the **dict** class, that is a chance to switch to subclassing from **UserDict** instead.

**UserDict** source code can be found [here](https://github.com/python/cpython/blob/79ac8c1c0d7cfc955a82af123471c28944e61c18/Lib/collections/__init__.py#L1106)
