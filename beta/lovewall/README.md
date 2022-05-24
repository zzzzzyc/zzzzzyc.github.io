## 起源
起初是给**广西科技大学**易班发展中心的光棍节活动开发的一个网站，活动结束后发现效果还不错，同学们的响应很热烈，而且在广西内的高校内也是好评不断。

于是，我就把此网站开源了，希望能对同学们有帮助。  

注意：该项目为在校内的早期作品，很多地方还不够成熟和完善。

## 演示链接
https://pingxonline.com/app/saylove/  

## 带图片的表白墙 BY 码云 笔名无香 
https://gitee.com/likecy/yiban_lovewall?tdsourcetag=s_pctim_aiomsg  

## 新项目
最美军训照，“最美表情”评选，照片表白墙，线上投票H5应用 https://pingxonline.com/app/bestjunxun/  
开源地址：https://github.com/ping-xiong/Online-photo-uploading-and-voting-application  

## 我的博客
https://pingxonline.com/

## 主要特性
- 发起表白
- 查看表白
- 搜索某人的表白
- 点赞
- 分享
- 评论
- 猜名字
- 性别区分
- 邮件通知被表白者
- 如何让网站应用支持Emoji 
[让应用程序支持 emoji 字符](https://www.liaoxuefeng.com/article/00145803336427519ae82a6c5b5474682c0c4ba5b47fb33000)
## 目的
脱单神器助你早日脱单。

## 快速使用
1. 导入该项目中的saylovewall.sql数据库文件。

2. 修改 php/config.php 配置文件

## 邮箱服务使用说明

  登录你自己的QQ邮箱，在设置-账户中，开启SMTP功能，记录此授权码！！重要！！

  返回php/config.php，按照注释修改成QQ邮箱和当初开启 SMTP 时生成的授权码。

  此邮件服务效果并不乐观，因为QQ限制最大发邮件数量，短时间内大量邮件发送出去会被退回。建议使用第三方邮件平台，付费服务。

有条件的可以使用其他SMTP服务的邮箱。

这个网站会有许许多多的BUG，欢迎大家一起来完善。

## 管理后台

后台账号密码: 在php/config.php的后台配置查看。

支持数据修改，重发邮件等服务。

基于layui开发  
  
后台地址一般为：https://pingxonline.com/app/saylove/admin  

## 支持
基于jQuery Mobile开发。

## 常见问题  
1. 发送三条表白后，无法再发送  
解决方法：修改php/config.php里面的max_submit_post配置项为其他数字，原理是利用session来限制发表白的数据量，默认是3条。

## 界面

![](https://pingxonline.com/wp-content/uploads/2017/08/1.png)

![](https://pingxonline.com/wp-content/uploads/2017/08/2.png)

![](https://pingxonline.com/wp-content/uploads/2017/08/3.png)
