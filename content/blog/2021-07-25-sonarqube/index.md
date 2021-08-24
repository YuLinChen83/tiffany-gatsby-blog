---
title: '初試 SonarQube'
path: blog/20210725
tags: [tool]
date: 2021-07-25
excerpt: 記錄下認識的新東西。
---

記錄下所接專案的客戶要求導入的 SonarQube 是什麼東西。

[SonarQube scanner](https://docs.sonarqube.org/latest/) 可 code review 偵測 bugs、vulnerabilities、code smells，產出分析報告，讓開發有方向可循地 refactor 更為 clean & safe 的 code。能直接導入現有的 workflow（CI）自動化，也可設定 email notifications 發給訂閱者。

![](https://docs.sonarqube.org/9.0/images/dev-cycle.png)

## [Installing a local instance of SonarQube](https://docs.sonarqube.org/latest/setup/get-started-2-minutes/)
兩種方式 1. download zip 2. docker
### Docker image
1. [pull community edition docker image](https://hub.docker.com/_/sonarqube/)
    * `docker pull sonarqube`
        * 不過 M1 直接下此指令會出現 no matching manifest for linux/arm64/v8 in the manifest list entries 改為 `docker pull --platform linux/x86_64 sonarqube` 即可
2. start the server
    * `docker run -d --name sonarqube -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true -p 9000:9000 sonarqube:latest`
        * M1 一樣要指定 platform `docker run --platform linux/x86_64 -d --name sonarqube -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true -p 9000:9000 sonarqube:latest`
        ![](https://i.imgur.com/JnkDkjQ.png)
* `docker pull --platform linux/x86_64 sonarqube:7.9.1-community`

### Download zip
* Java8 不支援，要升到 11
    * `brew tap AdoptOpenJDK/openjdk`
    * `brew install adoptopenjdk11`
    * `/usr/libexec/java_home -V`
    * `java -version` 可看當前只用的 java 版本
* `bin/macosx-universal-64/sonar.sh start`