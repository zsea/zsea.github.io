+++
title = '网站终于搞定了 - 使用帮助说明'
date = 2025-09-14T17:34:36+08:00
draft = false
slug = "0"
cover = "./cover.png"
+++

听别人说，我们这批这年头还在还在搞自己个人网站、博客建设的人，一般发布的第一个内容都是教别人如何搞博客。我以为我会与众不同，就不写如何做。但等我做完后才发现，还是得写一下，不是为了教别人，是为了记录一下网站的功能与一些使用方法，要注意的配置太多，如果不记录一下，久了肯定得搞忘。

<!--more-->
# 配置

网站的配置在根目录下的```/hugo.toml```文件中，一些通用的配置就不在这里介绍，主要介绍一下自定义的一些配置项。

## params

在```[params]```中，我们有如下配置：

```toml
[params]
avatar = "/favicon/logo.png" # 网站左侧区域的个人头像
name = "海海" # 网站所有者的名称
desc = "软件开发初学者，爱好者。" # 对网站所有者的描述
icp = "蜀ICP备2023031169号-1" # 域名的ICP备案号
logo = "/favicon/logo.png" # 在网页左上角的图标
favicon = "/favicon/favicon-32x32.png" # 网站的favicon图标

description = "个人在计算机知识学习过程中的经验积累，开发的个人产品的发布，与同行学习交流。"
keywords = "个人博客，计算机技术，软件开发，C/C++/Javascript/js/React，网络知识，逆向，千牛，微信"

# description和keywords用于生成meta标签中的SEO内容

```

## 菜单

在网站上使用了两个菜单：

* 右上角的网站导航，主要配置的项为```[[menus.main]]```。
* 首页左侧的导航链接，用于常用工具的存放，配置项为```[[menus.tools]]```。

菜单项的配置，与文档描述一致，但是添加了一个```icon```，用于给菜单添加图标：

```toml
[[menus.tools]]
name = 'JSON编辑器'
url = 'https://jsoneditoronline.org/'
weight = 2
[menus.tools.params]
icon = 'icon-json' # 链接的图标
```

> 图标是通过[https://www.iconfont.cn/](https://www.iconfont.cn/)选择了几个常用的图标。你如果需要添加自己的图标，你需要编辑皮肤的图标文件：```assets/css/iconfont.css```。

# 短代码

添加了两个短代码：

* year
* wall

## year

```year```用来显示当前的年份，使用方法如下：

```markdown
{{\< year \>}}
```

## wall

```wall```是一个闭合短代码，会用一个```div```来包裹其中的内容，主要用来显示图片墙的功能。

```markdown
\{\{< wall >\}\}
![](https://liveout.cn/wp-content/uploads/pic/background/2023/905.png)
![](https://liveout.cn/wp-content/uploads/pic/background/2023/905.png)
![](https://liveout.cn/wp-content/uploads/pic/background/2023/905.png)
![](https://liveout.cn/wp-content/uploads/pic/background/2023/905.png)
\{\{< /wall >\}\}
```
> 上面的代码示例中，请去掉```\```号。

> 短代码主要用于```markdown```文档中。

# 内容

## 网站内容

网站主要分为博客、产品、动态和关于4个部分。

* 博客 - 用于文章的发布，平时一般都是在这里发表文章，路径：```content/posts/```。
* 产品 - 主要发布平时开发的一些小软件，路径：```content/products/```。
* 动态 - 主要发布一些简短的动态消息，像朋友圈一样使用，路径：```content/moments/```。
* 关于 - 一个固定的```markdown```文档，主要介绍一下网站的情况，路径：```content/about.md```。

在博客、产品、动态中，都可以使用```_index.md```来发布关于当前板块的介绍。

在```content/_index.md```中，也可以发布网站的介绍，会在首页有一个单独块进行展示。


## 添加内容

内容添加使用常规命令即可：
```bash
hugo new "content/posts/first.md"
```

该命令在```content/posts/```目录下添加了```first.md```文件。

我们也可以在```content/posts/```下直接新建```first.md```文件，但使用这个命令，能够直接添加当前时间，不用再麻烦去手动设置时间。

## front matter

每个内容页面开始处的元数据，通过格式特定的分隔符与内容分开。

这里介绍一下我们用到的几个元数据：

* cover - 给文章设置一个图片，这个图片在首页、列表页进行显示。
* slug - 设置当前文章在```URL```中的名称。一般情况下，会使用文件名作为URL中的一部分，但有时候比较长的中文文件名在URL中不太友好，就可以通过设置当前属性，改变在URL中的名称。
* description - 在网页的```meta```标签中添加```description```的内容。
* tags - 添加为文章的```tags```内容，以数组的形式设置，在没有设置```keywords```的情况下，会作为```meta```中的```keywords```添加到网页中。
* keywords - 会作为```meta```中的```keywords```添加到网页中，但不会出现在文章的```tags```中。

### 动态板块的Front Matter

在这个板块中，我们设置不了发布具体的单个页面，所有内容都在列表页中进行展示。通过在```content/moments/_index.md```设置特殊的```Front Matter```来设置编译选项。

```yaml
title: '动态'
date: 2023-01-01T08:00:00-07:00
draft: false
build:
  render: true
  publishResources: true
cascade:
  build:
    list: true
    render: false
    publishResources: true

```

## 内容预览

通过命令```hugo server -D -p 3000```我们可以在本地预览网站。

有时候，我们添加了内容，但是对应页面没有更新或者没有生成页面，可以使用以下页面清除一下缓存：
```bash
hugo --cleanDestinationDir
hugo --gc
```

## 内容列表显示

在发布内容后，会自动更新到相关列表中，列表的排序按以下字段倒序：

* weigth - 默认为0。权重大于```50```的文章会在列表的标题前显示```[置顶]```。
* date

# 其它问题

## 图片路径问题

我们在短代码中，通过```{{ .Inner  | .Page.RenderString }}```来编译```markdown```为```HTML```，但是在这里不能正确处理```wall```中的图片路径，特别是在**动态**这个板块，列表页上不能正确显示出来。我们使用了```Markdown渲染钩子```中的```render-image.html```为处理图片路径。

大概意思路程如下：

1. 如果图片路径是相对路径，则进行处理
2. 通过查找```Page```的```RelPermalink```、```Slug```、```File.Dir```来设置路径。
3. 若是使用的```Slug```，则递归使用```Parent```继续生成路径。

详细内容见以下源代码：

* layouts/_default/_markup/render-image.html
* layouts/partials/url.html

## 链接问题

默认转换的链接是在当前文档打开，但一般的使用习惯是在内容中的链接在新的标签中打开，这里使用了```render-link.html```链接添加```target```属性。

详细内容见以下源代码：

* layouts/_default/_markup/render-link.html
