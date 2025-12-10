+++
title = 'Electron代码保护工程实践'
date = 2025-12-10T21:40:06+08:00
draft = false
slug = 'electron-protect'
keywords =['Electron', 'bytenode', '源代码保护', '防破解', 'node-hardware']
description = '通过bytenode和obfuscator来保护Electron，并通过node-hardware来实现应用的机器码生成。即使系统重装也能保证机器码一致。'
+++

Electron使用```nodejs```和前端代码来开发应用程序，我们先不说开发出来的应用的包大小问题，因为在今天硬盘和内存已经完全超量的情况下，一个Electron的应用跑起来简直太轻松了。

但是，Electron应用在发布的时候，只是简单的将代码打包，其源代码未受到任何保护。本文将介绍我在Electron应用源代码的保护过程中的实践。

Electron代码运行环境为两种：

* 主进程中的代码
* 渲染进程中的代码

在不同的进程中，对代码使用不同的保护方式。

主进程中的代码，可以直接使用```bytenode```编译为字节码。对于渲染进程中的代码，虽然```bytenode```也支持，但这是有条件的支持，需要设置```nodeIntegration```为```true```，开启node的集成才可以。

所以，这里的总体思路是，在主进程中的代码使用```bytenode```进行编译，渲染进程的预加载(preload)代码，使用```javascript-obfuscator```进行混淆。

<!--more-->

对于```bytenode```大家应该知道，需要编译所使用的版本需要与运行时的版本保持一致，所以这里就直接使用```electron```来执行编译脚本。

为了方便管理，在根目录建立了三个子目录：

* builder - ```bytenode```编译脚本管理
* dist - 最终生成的打包发布的文件
* src - 开发过程中的源代码

在打包发布的时候，只需要打包```dist```目录即可。

# 入口加载器

> Electron在```package.json```的```main```字段中指定入口的```js```文件，这里的```js```文件，只能是源代码。所以这个指定的入口文件，不能使用```bytenode```来编译。

在我的项目中，入口文件指定为```loader.js```，该文件主要完成两个工作：
* 加载```bytenode```环境
* 根据当前模式（是否是开发模式）来加载不同的脚本。开发模式加载```src```中的代码，发布模式加载```dist```中的文件。

以下是我在工程中使用的加载器代码：
```javascript
require('bytenode');
const { app } = require('electron');
function Main() {
    if (app.isPackaged) {
        require("./dist/backend/main")
    }
    else {
        require("./src/backend/main")
    }
}
Main();
```

# 编译脚本

工程中，将编译用的脚本放置于```builder```目录中，通过命令```electron ./builder/index.js```来启动编译。

```index.js```是编译的入口文件，该文件中，通过遍历源代码目录，再根据```configure.js```中的配置，针对不同的源代码文件，调用不同的处理器插件。

> 没错，```bytenode```在这里，仅仅是一个众多的处理器之一，你还可以根据你的需求编写自己的处理器。

在此处，实现了以下处理器：

* Copy - 直接将源代码目录的文件复制到发布目录，不做任何修改。
* Compile - 通过```bytenode```将源代码的文件编译为字节码，并存储到发布目录下。
* Obfuscator - js代码的混淆器。
* CssMinimizer - CSS压缩器。
* Ignore - 忽略器。源代码中的文件不会发布到发布目录中。**一般用于保护一些不想公开的数据，需配合自定义处理器。**

## 配置文件

使用名为```configure.js```的文件做为配置文件，会在```index.js```中通过**require**加载使用。

以下是工程中的示例：
```javascript
const Copy = require("./plugins/copy")
    , Compile = require("./plugins/compile")
    , Obfuscator = require("./plugins/obfuscator")
    , CssMinimizer = require("./plugins/css")
    , Ignore = require("./plugins/ignore")
    , StringLoader = require("./secret/string")
    , FileProtect = require("./secret/file")
    ;
module.exports = {
    source: "src",
    target: "dist",
    clean: true,
    protectMain:true,
    rules: [
        ["**/*.css", CssMinimizer]
        , ["assets/languages/index.js", Compile]
        , ["assets/languages/**", Copy]
        , ["assets/strings/texts/**", Ignore]
        , ["assets/strings/loader.js", StringLoader]
        , ["assets/files.js", FileProtect]
        , ["assets/**/*.png", Copy]
        , ["assets/**/*.ico", Copy]
        , ["backend/**", Compile]
        , ["preloads/*.css", CssMinimizer]
        , ["preloads/**", Obfuscator]
        , ["protocols/**/*.js", Obfuscator]
        , ["protocols/**", Copy]
        , ["windows/**/*.js", Obfuscator]
        , ["windows/**", Copy]
        , ["**", Copy]
    ]
}
```

* source - 指定源代码目录。*相对于工程根目录。*
* target - 发布目录。*相对于工程根目录。*
* clean - 发布前是否清空发布目录。
* protectMain - 是否保护加载器的中间目录。要求修改```loader.js```加载器。
* rules - 代码保护规则。在执行时，遍历源代码目录，若匹配，则使用配置的处理器处理代码。若处理器返回的是一个函数，则会在遍历完目录后执行。

## 字符串保护

在```bytenode```中，字符串通常是不被保护的，直接打开编译后的**jsc**文件很容易就能找到一些关键字符串，比如密钥什么的。

在```builder/secret```目录中，实现了一个```StringLoader```的处理器，这个处理器将关键的字符串进行加密后，再动态实现一个解密算法，最后将这个解密的过程动态编译为```jsc```，编译后的模块与源代码中的声明相同即可。

## 文件保护

在发布的Electron应用中，最怕的就是别人修改源代码文件，所以，需要在正式启动前校验一下文件是否被修改。

在此处，通过```FileProtect```返回一个函数，这个函数会在所有目录遍历完成后执行。返回的函执行时，为```dist```中的所有文件生成一个```hash```表，软件正式启动前，可以通过这个表来检查文件是否有被修改过，若被修改了，则可以拒绝运行。

与字符串保护一样，最终这个函数会在```dist```中生成一个模块，这个模块被编译后在已经经过编译的应用程序主进程代码中调用。

# 软件授权

这里主要是针对使用机器码对软件进行授权的情况进行保护。

在我的项目中，使用```node-hardware```来读取机器的硬件信息，目前主要读取了以下信息：

* CPU信息
* 硬盘信息
* 网卡信息

在项目中，通过这三个数据生成机器码。但是```node-hardware```在```windows```中是通过```.node```文件来读取的硬件信息（其实就是一个DLL文件）。

如果```.node```被修改了，那这里的授权保护就形同虚设。根据上面的思路，在项目中同样校验一下```.node```的```hash```值即可，若```hash```不对，软件可以拒绝运行。

---

本文所说的```builder```中的所有文件，已经开源到Github。

[https://github.com/zsea/electron-protect](https://github.com/zsea/electron-protect)