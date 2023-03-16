## picgo-plugin-azureimg

一个 picgo core 的插件，可以上传图片到 [Azure Repo](https://dev.azure.com).
## 开始使用
### 创建
在 https://dev.azure.com 创建组织并建立项目，在项目里创建 Repo，点击 Initialize.
![](https://niconiacg.visualstudio.com/8b1c4d7b-9bf3-41ee-9c02-569f405a18cb/_apis/git/repositories/a8ec5f4f-1b76-4ca2-be3e-446375fb6f9e/items?path=/2023/2/4/c1b48e04b07d.png&$format=octetStream&api-version=5.0)
访问 `https://[组织名].visualstudio.com/_usersSettings/tokens` 创建 Token.
![](https://niconiacg.visualstudio.com/8b1c4d7b-9bf3-41ee-9c02-569f405a18cb/_apis/git/repositories/a8ec5f4f-1b76-4ca2-be3e-446375fb6f9e/items?path=/2023/2/4/31415819577f.png&$format=octetStream&api-version=5.0)
### 安装
使用安装命令安装此插件：
````
picgo install azureimg
````
### 配置
使用配置命令配置插件：
````
picgo set uploader azureimg #配置 azureimg
picgo use transformer #选择 path
picgo use uploader #选择 azureimg 作为 uploader
````
