+++
title = '用web Filter拦截、修改浏览器的请求'
date = 2026-04-11T20:48:18+08:00
draft = false
slug = 'web-filter'
keywords =['web-filter', 'javascript', 'AJAX', '浏览器', '请求拦截','修改']
description = '一种轻量的拦截和修改浏览器Ajax请求的方法。'
+++

```web-filter```是一个轻量、开源的基于浏览器的```js```库，用于拦截网络和修改```ajax```的网络请求，对于```fetch```、```XMLHttpRequest```、```JSONP```请求，提供统一的处理方法，抹平不同请求处理间的差异。

仓库地址：[https://github.com/zsea/web-filter](https://github.com/zsea/web-filter)

## 功能特性

- 同时支持 Fetch、XHR、JSONP 三种常见请求通道。
- 提供统一生命周期回调：`onCreate`、`onOpen`、`onRequest`、`onResponse`。
- 支持三种控制动作：`continue`、`block`、`respond`。
- 可在请求前、响应后修改 URL、方法、请求体、响应体与状态码。

<!--more-->

## 使用

### 1.脚本引入

此库以非模块化的方式提供，使用时可以直接通过```script```标签引用，也可以直接复制源码到脚本中进行集成。

* 直接脚本引入

```html
<script src="./src/web-filter.js"></script>
```

* 源码引入

脚本提供了一个函数，若你不想将函数暴露在全局(window)中，可以使用匿名函数包裹源代码，降低作用域。

```javascript
（function(){
    function createWebFilter(){...}
})();
```

### 2.注册处理器

调用```createWebFilter```生成一个处理器注册函数，用这个注册函数来添加各个事件的处理器。

```javascript
const useFilter = createWebFilter();

useFilter({
  onCreate() {
    return { traceId: Date.now() };
  },
  onOpen(options) {
    // options: { url, method, meta, ... }
    // 可在这里改写 url / method
  },
  onRequest(options) {
    // 例如：按 URL 返回 mock
    if (String(options.url).includes("/mock")) {
      return {
        action: "respond",
        response: {
          body: JSON.stringify({ ok: true, source: "request" }),
          status: 200,
          headers: { "x-mock": "request" }
        }
      };
    }
    return { action: "continue" };
  },
  onResponse(options, response) {
    // response: { status, text, headers }
    // 例如：统一改写返回文本
    return {
      action: "respond",
      response: {
        body: response.text,
        status: response.status,
        headers: { "x-mock": "response" }
      }
    };
  }
});
```

## 生命周期与回调

每个```ajax```请求有如下4个处理器：

- `onCreate()`
此处理器为请求的初始时期，返回值会写入当前请求上下文的 `meta` 字段。在此方法调用后，才生成了后续处理中的参数```options```。

- `onOpen(options)`
在 URL 初始化后触发，`options` 可被直接修改。此时，```options```字段如下：

    * meta
    * url - 将要请求的URL
    * method - 请求要使用的HTTP方法，如果是```JSONP```，则请求方法为```script```。

在此方法中，可以修改```options```中的内容来修改请求的方法和地址。

- `onRequest(options)`
请求发出前触发，可返回动作控制结果。此时，```options```除了包含前面的内容外，新增加了```body```，body中存储的是POST等方法发送的数据。同样，在此方法中修改请求的数据，但是在此处修改```url```、```method```将无效。

    此方法中，返回**Action协议**。

- `onResponse(options, response)`
收到响应后触发，可继续放行、阻断或改写响应。其中，```options```内容与前面相同，```response```数据包括以下字段：

    * headers - Headers对象
    * status - 响应码
    * text - 响应的内容
    * url - 响应的url。

    注意，若是JSONP请求，此处则只包含字段```text```。

    此方法中，返回**Action协议**。

## Action 协议

`onRequest` 与 `onResponse` 的返回结构：

```json
{ "action": "continue|block|respond", "response": {} }
```

- `continue`
继续原始流程。

- `block`
阻断请求。
  - Fetch：`Promise.reject(BlockedRequestError)`
  - XHR/JSONP：触发 `error` 行为

- `respond`
使用你提供的响应数据替代真实响应。

推荐的 `response` 字段：

```json
{
  "body": "{\"value\":\"mocked\"}",
  "status": 200,
  "statusText": "OK",
  "headers": { "x-test": "test" }
}
```

说明：
- `body` 应为字符串（尤其在 XHR/Fetch 场景）。
- 未提供时内部会补默认值（如 `status=200`、`statusText=OK`）。

## 关于JSONP

由于JSONP是通过全局函数来进行回调，所以需要在```onOpen```中为```options```添加```callback```字段，在后续处理中才能正确识别和处理回调函数。

## 示例

以下示例是一个油猴(Tampermonkey)脚本示例，将某网站中需要VIP才能使用的功能强制修改为非VIP就能使用。

```javascript
(function() {

    function createWebFilter(){...}

    let useFilter=createWebFilter();
    useFilter({
        onResponse:function(options,response){
            if(!options.url.startsWith("https://xxx.xxx.cn/api/style?")) return;
            let text=response.text;
            let data=JSON.parse(text);
            let list=data.data.list;
            if(list){
                list.forEach(function(item){
                    item.is_vip=0;
                });
                let resp={body:JSON.stringify(data)};
                return { "action": "respond", "response": resp }
            }
        }
    });
})();
```