# Project libraries

This folder contains project libraries - separate pieces of code with own dependencies and without external project dependencies.

## Intention
The purpose of this distinction is to keep truly "shared" code that is needed throughout the entire project.

It is motivated by a common unhealthy tendency to extract a lot of domain code to "utils", "common", "shared" or other similarly named directories.

Specific domain code should be kept together. Do not extract code solely for "future proofing". Only do it once you have to reuse code between higher levels of abstractions.
Think about it as if it was an implementation of the [YAGNI rule](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it).

### Exceptions
The decision behind this solution is based on the following goal: make the project maintainable in the long run, have a long-lived, flexible codebase.

If for some reason you predict that your project is going to be short-lived or fire-and-forget, do not hesitate to stick to the typical "shared"/"utils" directories strategy.

## How to add a new project library?
This process is a bit more difficult than simply creating a new "utils" directory. This is on purpose, to discourage premature code generalization.

1. Double check the code you want to extract is used as widely as you think. A common scenario is when you need the same code in two different domains. Consider these extra points:
  - should these domains really be separate? Would it make sense to merge them instead of code reuse?
  - is the code you're going to extract large? Should it be refactored before taking further steps?
  - how reusable is this code, really? Would it be better to just copy it, as often times [keep things simple](https://en.wikipedia.org/wiki/KISS_principle) > [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)?
2. Create a subdirectory with your lib name: `lib/my-lib`.
3. Open it and add your code.
4. In `lib/my-lib`, run `yarn init`. Enter a proper entrypoint in the process
5. Go to the main project directory. Install the new package by running `yarn add ./lib/my-lib`.

And it's done! Now you can import your package like you would normally do with any other installed from npm:
```ts
import myLib from 'my-lib';
```
