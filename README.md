# node-ptt-crawler
nodejs ptt爬蟲
- 可自訂多個看板
- 從最新爬N頁
- 已設定cookie over18為1。
- 儲存為excel檔案，檔名:${看板名稱}.xlsx
# How to use
### 第一步
```bash
npm install
```
### 第二步
設定config.js
```javascript
module.exports = [
    {
        category : "prozac" , //看板名稱
        pages : 3 //要從最新開始抓3頁
    } 
]
```
start
```bash
npm start
```
# 結果圖
### 單個excel
![](/result.jpg "單看板excel結果圖")
### 多看板
```javascript
//config.js
module.exports = [
    {
        category : "PC_Shopping" ,
        pages : 3
    }, 
    {
        category : "prozac" ,
        pages : 1
    }
]
```
![](/multipleCategoryResult1.jpg "多看板資料夾結果圖")
![](/multipleCategoryResult2.jpg "多看板excel結果圖")
