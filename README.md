# MimicryMusic 拟声 开源计划
* 下载官网: https://download.music.mimicry.cool/
* 目前已经开源web端

## 简介
* 新拟态风格的 音乐播放器
* web端功能：
  * 用户注册/登录/绑定邮箱/找回密码/修改用户名/修改信息
  * 添加/删除/修改/排序 歌单
  * 添加/删除/修改/排序 歌曲
  * 自制/删除/修改/排序 歌词
  * 搜索 歌单/歌词/用户
  * 支持歌词弹幕
  * 拥有 炫彩/极昼/极夜 三种主题风格
  * 移动端/桌面端 布局大小自适应
  * 调速，定时停止，随机/顺序/单曲 循环播放
* 客户端功能：
  * 基本包含web端所有功能
  * 相比web端更好的缓存、性能、动画效果
  * 支持歌词弹幕、状态栏歌词、桌面歌词，以及丰富的自定义效果，如：字体大小、字体颜色、字体描边效果、位置范围等。
  * 支持播放 bili 歌曲、本地音乐、音乐文件链接、webdav
  * QQ注册/登录
  * 支持播放绝大多数格式、拥有固定输出采样率、独占输出等功能
  * ......

## 预览图
![Shell_20230804-204952-189-](https://github.com/coolight7/MimicryMusic/assets/91963225/7184ad63-51fd-4cb1-aa8f-0653fe5f149b)
![Shell_20230804-205003-346-](https://github.com/coolight7/MimicryMusic/assets/91963225/e1cccc89-59f6-42c4-836a-ead9a3089ce0)
![Shell_20230804-210217-664-](https://github.com/coolight7/MimicryMusic/assets/91963225/206a7014-3539-43fe-9da4-fcc0730e96cd)
![Shell_20230804-210229-972-](https://github.com/coolight7/MimicryMusic/assets/91963225/e084322f-4f9a-4cf0-9bd5-293c0e47c6aa)
![Shell_20230804-211233-367-](https://github.com/coolight7/MimicryMusic/assets/91963225/6302a253-ee33-410f-b280-8d3852b1c996)

## 支持平台：
  * web
  * windows (win10及以上，且为64位)
  * android (安卓4.1及以上，支持arm64-v8a、armeabi-v7a、x86_64)

## 开发语言
  * 后端使用的是c++开发，以及小部分go
  * 客户端由flutter提供多平台支持
  * 前端一套代码，由 ts+vue 开发

## 拟声 Web端
* 基本已经完成了 javascript 转向 typescript
* 使用了 vue3 + vite + pinia
* 不依赖任何UI库，整体使用的绝大部分组件都是手搓css出来的
* 使用JWT身份验证
* 关于其他：
  * 由于web端播放bili歌曲需要服务器代理实现，对服务器带宽要求很高，因此禁用了播放，您可以在代码中将相关禁用代码删除或注释即可。
  * 整个项目是一开始接触前端、vue等各种技术时就直接开始动手搞的，尽管到现在已经被重构过几次，但放在目前来看仍然很多写的不好，而且也有好几个月没有足够的精力更新维护web端，目前更多是把它当成一个App下载页在用。
  * 如果您希望改进这个项目，欢迎提交PR
  * 如果您有疑问或遇到问题，欢迎提出issue
