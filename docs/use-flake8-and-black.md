---
title: 'Use Flake8 and Black to lint and format Python code.'
date: '2022-05-15'
excerpt: 'Regularly, writing code is meant to be read by other programmers, that’s why making our code easy to read and easy to follow along are necessary especially when we are in a team.'
github: https://github.com/vespaiach/personal_website/blob/main/docs/use-flake8-and-black.md
tags: flake8, black, python
---

PEP8 (Python Enhancement Proposal 8) is widely accepted by the Python community. It provides guidelines and best practices on how to write Python code and by following PEP8 will make code files be consistent and be more readable.

To adopt PEP8 in our projects, we can use these two power tools:
 - [Flake8](https://github.com/PyCQA/flake8) to check source code against PEP8
 - [Black](https://github.com/psf/black) to format source code

## Flake8

Install Flake8 with pip:

```bash
pip install flake8
```

To run Flake8, simply invoke `flake8` in the root folder of the project. Flake will run through all files and print out any error or warning. 

It is also possible to pass some arguments directly to Flake8.


```bash
flake8 --select E123 --ignore D302
```

To config Flake8 per project, we can create an INI-format config file with name: `setup.cfg`, `tox.ini` or `.flake8` in root folder and specify any config options under `[flake8]` section.

```bash
[flake8]
ignore = D203
exclude = .git,__pycache__,build,dist
max-complexity = 10
max-line-length = 110
max-doc-length = 100
```

**Note:** 
 - Flake8 hasn't supported (`pyproject.toml`](https://pip.pypa.io/en/stable/reference/build-system/pyproject-toml/) which is a minus point of Flake8.
 - For complete options, please refer to this [link](https://flake8.pycqa.org/en/latest/user/options.html)

## Black

Install Black with pip:

```bash
pip install black
```

Simply invoke `black .` in the root folder of the project and Black will format every code file. The manifesto of Black is `Black is the uncompromising Python code formatter`, that means it will provide just a few options to configure and it should run well without configuration by default. What Black focuses on is the code consistency not the code formatting styles, so it won’t have many options for us to configure. 

To configure Black, create a file with the name `pyproject.toml` in the root folder and add `[tool.black]` section.


```bash
[tool.black]
line-length = 88
target-version = ['py37']
include = '\.pyi?$'
```

**Note:**

 - In order to make Black works well with Flack8, we need to add these two options to Flake8 configuration

```bash
[flake8]
max-line-length = 88 # or any length that we specify in Black configuration (88 is default value of Black)
extend-ignore = E203 
# Black will enforce an equal amount of whitespace around slice operators. 
# Due to this, Flake8 will raise E203 whitespace before ':' warnings. 
# Since this warning is not PEP 8 compliant, Flake8 should be configured to ignore it via extend-ignore = E203
```
 - If we use Black, that means we will follow Black code style formatting than ourself code style formatting, so please checkout this [link](https://black.readthedocs.io/en/stable/the_black_code_style/index.html) for more details of Black's code formatting
