window.addEventListener("DOMContentLoaded", function () {
    let posts = this.document.querySelector("div.posts"), owner = this.document.querySelector('.site-owner');
    if (posts && owner) {
        let height = posts.clientHeight;
        owner.style.maxHeight = `${height}px`;

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const newHeight = entry.contentRect.height;
                //const newWidth = entry.contentRect.width;
                owner.style.maxHeight = `${newHeight}px`;
                //console.log('元素新高度:', newHeight, 'px');
                //console.log('元素新宽度:', newWidth, 'px');


            }
        });
        resizeObserver.observe(posts);
    }
    dayjs.locale('zh-cn');
    dayjs.extend(window.dayjs_plugin_relativeTime);
    let moments = this.document.querySelectorAll(".moment-created");
    moments.forEach(function (m) {
        let time = parseInt(m.getAttribute("data-time"));
        let txt = "";
        if (time * 1000 < Date.now() - 30 * 24 * 60 * 1000) {
            txt = dayjs.unix(time).format("YYYY-MM-DD HH:mm:ss");
        }
        else {
            txt = dayjs.unix(time).fromNow();
        }

        m.innerHTML = txt;
    })
});
