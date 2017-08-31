# eslintless

Auto add eslint inline comment.
Bye-bye errors! Bye-bye eslint-updating miserableness!

## Getting Started

Eslintless is designed to tackle the stunning error amount after you have updated eslint or its rules, therefore you need to update your eslint package first.

When you find it's impossible to handle all of the errors which eslint yells, eslintless' showing time now comes.

- node 6+
- eslint 3+

## Usage

Simply run `yarn/npm run eslintless`, and you will meet a interactive command interface.

Choose `create`, eslintless will run eslint, and make all errors put a mask named `inline comment` on. Now they are all warnings. Eslintless will leave a file `.eslint_update.log.json`, in case you want to make all the efforts eslintless maked gone.

Choose `delete`, eslintless will look for `.eslint_update.log.json`, and delete ALL comment eslintless added before.

## Contributor

jianggaohua <jianggaohua@meituan.com>
