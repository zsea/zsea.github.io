+++
title = 'Debugger.exe使用说明'
date = 2026-09-29T15:13:37+08:00
draft = false
cover ='./debugger.png'
slug = 'debugger'
keywords =['Debugger.exe', '映像劫持', 'DLL注入', '通用工具']
description = '基于配置文件的通用的程序启动和DLL注入工具。该软件设计之初是基于映像劫持功能，劫持原程序后，再由Debugger.exe拉起原程序，并注入指定的DLL。'
+++

**Debugger.exe**是一个基于配置文件的通用的程序启动和DLL注入工具。

该软件设计之初是基于映像劫持功能，劫持原程序后，再由**Debugger.exe**拉起原程序，并注入指定的```DLL```，经过多次迭代形成现在这个比较完整的通用工具。

**Debugger.exe**解析启动参数，通过启动参数和配置文件一起拉起原始程序。
> 你也可以不进行映像劫持，而直接按要求传递参数。

<!--more-->

# 启动参数

程序主要使用两个参数：

0. 该参数为当前**Debugger.exe**的路径，由系统传入，程序忽略不做处理。
1. 该参数为真实需要启动的应用程序，**Debugger.exe**将会启动对应的程序，并根据配置完成DLL的注入。

# 配置文件

配置文件固定名称为```debugger.toml```，首先从**Debugger.exe**所在目录加载，若不存在，则从用户目录加载。

> 需要注意的是，若**Debugger.exe**所在目录存在文件```debugger.toml```，不管格式是否正确，都不会再从用户目录加载配置文件。

## 配置说明

```debugger.toml```的主要配置项有：```[[applications]]```和```[[applications.terminations]]```，下面是一个示例：

```toml
[[applications]]
fullPath   = "C:\\Program Files\\AliWorkbench\\AliWorkbench.exe"
plus       = "qnhelper.dll"
inject     = "qnhelper.dll"
enable     = true
environment = ""

[[applications.terminations]]
mode  = 0
param = ""

[[applications]]
fullPath   = "C:\\Program Files\\Tencent\\Weixin\\Weixin.exe"
plus       = "wxhelper.dll"
inject     = "wxhelper.dll"
enable     = true
environment = ""

[[applications.terminations]]
mode  = 0
param = ""
```

下面对各项配置进行说明：
* fullPath - \<string\> 待启动程序的完整路径（忽略大小写），最先匹配的项为准，并根据其它配置拉起程序。
* plus -  \[string\] 若配置该项，则在拉起程序前会加载指定的插件DLL，调用DLL的导出函数**CanStartup**，该函数定义为```typedef int(__fastcall* PFN_CanStartup)();```，该函数返回```0```时，程序正常进入后面的启动流程。该配置的DLL路径基于**Debugger.exe**所在路径。
* inject -  \[string\] 需要注入的DLL。在拉起原始程序时，会同时注入当前指定的DLL。该配置的DLL路径基于**Debugger.exe**所在路径。
* enable - \[boolean\] 只有当此项为```true```时，该配置项才会生效。默认值为```true```。
* environment - \[string\] 环境变量设置。以```key=value```对进行配置，多个以```;```分隔。若有设置，会将设置的环境变量注入到启动的程序中。
* terminations - 终止配置。主要是检查启动参数，若有匹配的参数，则不进行原始程序的启动。此配置主要的应用场景是当程序是多进程架构时，某些子进程启动只是为了完成特定的任务（如更新），但我们又不想让他完成这件事，这时就可以配置当前参数，匹配到参数后，会忽略当前的启动请求。
    * mode - 参数的匹配方式。
        * 0 - 不检查参数，相当于当前配置不生效。
        * 1 - 完全匹配。包括参数的长度和大小写都必需要匹配。
        * 2 - 忽略大小写匹配。匹配参数的长度，比较是否相等。
        * 3 - 忽略大小写，进行包含关系判断。只要参数中包含当前指定的值，则匹配成功。
    * param - 需要匹配的参数内容。

# 下载

**暂无**