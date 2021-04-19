---
title: 'WebForm 圖片上傳檢查'
path: blog/20170508
tags: [asp.net]
date: 2017-05-08
excerpt: 開放上傳有可能被傳奇怪東西的風險，只檢查所看到的副檔名，謹慎來說似乎是不夠的。
---

開放上傳有可能被傳奇怪東西的風險，只檢查所看到的副檔名，謹慎來說似乎是不夠的。  
看似單純的圖片檔，網頁上顯示也是正常顯示的圖片，那為什麼他有可能不只是張圖片？  
可以上網查查有關「偽圖檔」、「合併圖檔」、「check file extension」之類的資訊。

因為上司剛好派給我這閒閒菜鳥研究上傳檢查的任務，這邊就將今日所查所寫稍微整理一下，做個小分享。  
首先準備一圖檔和壓縮檔然後開啟 cmd 到該目錄，來做一個合併圖檔 (圖+壓縮) 的例子。

```bash
copy /b mypic.jpg+myfile.zip newfile.jpg
```

把生成的 newfile.jpg 的副檔名改成 .zip 就可以開出原本準備的 zip 了。  
而且合併檔的大小似乎就是 jpg + zip 的大小（所以要小心異常大的圖檔）  
以 ASP.NET Webform 的 FileUpload 為例，如何防止有意人士亂塞偽裝的惡意程式給你。

這篇是我覺得回答最清楚的，下面程式也是大部分是當中的例子。[請教判斷是否為真的圖檔的方法](http://www.blueshop.com.tw/board/FUM20041006161839LRJ/BRD20070801180408XHE/2.html)

```aspnet
<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="WebForm1.aspx.cs" Inherits="WebApplicationTest.WebForm1" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
  <head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title></title>
  </head>
  <body>
    <form id="form1" runat="server">
      <div>
        <asp:FileUpload ID="fuImage" runat="server" />
        <asp:Button ID="btnUpload" runat="server" Text="上傳" OnClick="btnUpload_Click" />
        <asp:Label ID="lblMessage" runat="server"></asp:Label>
      </div>
    </form>
  </body>
</html>
```

```csharp
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Web;

namespace WebApplicationTest
{
    public partial class WebForm1 : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
        }

        protected void btnUpload_Click(object sender, EventArgs e)
        {
            // 1. 檢查Byte: 各圖檔所要對應的Header
            Dictionary<string, byte[]> imageHeader = new Dictionary<string, byte[]>();
            imageHeader.Add("JPG", new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 });
            imageHeader.Add("JPEG", new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 });
            imageHeader.Add("PNG", new byte[] { 0x89, 0x50, 0x4E, 0x47 });
            imageHeader.Add("TIF", new byte[] { 0x49, 0x49, 0x2A, 0x00 });
            imageHeader.Add("TIFF", new byte[] { 0x49, 0x49, 0x2A, 0x00 });
            imageHeader.Add("GIF", new byte[] { 0x47, 0x49, 0x46, 0x38 });
            imageHeader.Add("BMP", new byte[] { 0x42, 0x4D });
            imageHeader.Add("ICO", new byte[] { 0x00, 0x00, 0x01, 0x00 });

            if (fuImage.HasFile)
            {
                // 取得檔案副檔名
                string fileExt = fuImage.FileName.Substring(fuImage.FileName.LastIndexOf('.') + 1).ToUpper();

                // 該副檔名應該要對應的Byte
                byte[] tmp = imageHeader[fileExt];
                byte[] header = new byte[tmp.Length];

                // 取得Upload檔案的Header資訊
                fuImage.FileContent.Read(header, 0, header.Length);

                // 比對副檔名是否與真實檔案類型一致
                if (CompareArray(tmp, header))
                {
                    lblMessage.Text = "Valid ." + fileExt + " file.";
                }
                else
                {
                    lblMessage.Text = "Invalid ." + fileExt + " file.";
                }

                // 指定格式存新圖(防止奇怪的合併圖檔，濾掉後面的)
                Stream strmStream = fuImage.PostedFile.InputStream;
                Image image = Image.FromStream(strmStream, true);
                string exePath = AppDomain.CurrentDomain.BaseDirectory;
                image.Save(exePath + Path.GetFileNameWithoutExtension(fuImage.FileName) + "." + (new ImageFormatConverter().ConvertToString(image.RawFormat)).ToLower(), image.RawFormat);
            }
            else
            {
                lblMessage.Text = "Please select image file.";
            }
        }

        private bool CompareArray(byte[] a1, byte[] a2)
        {
            if (a1.Length != a2.Length)
                return false;

            for (int i = 0; i < a1.Length; i++)
            {
                if (a1[i] != a2[i])
                    return false;
            }

            return true;
        }
    }
}
```

以上範例實驗 png + zip 的 png 光用 Header Byte 比較會是合法 Valid 的，但以指定格式來 Save 圖片似乎就會把不必要的其餘部份去掉，測試的兩例子：其實是 png 的 jpg，和其實是 png + zip 的 png 所存的都會是 png 。

補充：若是使用 html input

```aspnet
<form id="form1" runat="server">
  <div>
    <input type="file" id="myFile" name="myFile" />
    <asp:Button runat="server" ID="btnUpload2" OnClick="btnUploadClick2" Text="上傳" />
    <asp:Label ID="lblMessage2" runat="server"></asp:Label>
  </div>
</form>
```

C# 部分幾乎相同，但要將 HTML Input 轉成 HttpPostedFile

```csharp
protected void btnUploadClick2(object sender, EventArgs e)
{
    // 1. 檢查Byte: 各圖檔所要對應的Header
    Dictionary<string, byte[]> imageHeader = new Dictionary<string, byte[]>();
    imageHeader.Add("JPG", new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 });
    imageHeader.Add("JPEG", new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 });
    imageHeader.Add("PNG", new byte[] { 0x89, 0x50, 0x4E, 0x47 });
    imageHeader.Add("TIF", new byte[] { 0x49, 0x49, 0x2A, 0x00 });
    imageHeader.Add("TIFF", new byte[] { 0x49, 0x49, 0x2A, 0x00 });
    imageHeader.Add("GIF", new byte[] { 0x47, 0x49, 0x46, 0x38 });
    imageHeader.Add("BMP", new byte[] { 0x42, 0x4D });
    imageHeader.Add("ICO", new byte[] { 0x00, 0x00, 0x01, 0x00 });

    HttpPostedFile file = Request.Files["myFile"];

    //check file was submitted
    if (file != null && file.ContentLength > 0)
    {
        // 取得檔案副檔名
        string fileExt = file.FileName.Substring(file.FileName.LastIndexOf('.') + 1).ToUpper();

        // 該副檔名應該要對應的Byte
        byte[] tmp = imageHeader[fileExt];
        byte[] header = new byte[tmp.Length];

        // 取得Upload檔案的Header資訊
        file.InputStream.Read(header, 0, header.Length);

        // 比對副檔名是否與真實檔案類型一致
        if (CompareArray(tmp, header))
        {
            lblMessage2.Text = "Valid ." + fileExt + " file.";
        }
        else
        {
            lblMessage2.Text = "Invalid ." + fileExt + " file.";
        }

        // 指定格式存新圖(防止奇怪的合併圖檔，濾掉後面的)
        Stream strmStream = file.InputStream;
        Image image = Image.FromStream(strmStream, true);
        string exePath = AppDomain.CurrentDomain.BaseDirectory;
        image.Save(exePath + Path.GetFileNameWithoutExtension(file.FileName) + "." + (new ImageFormatConverter().ConvertToString(image.RawFormat)).ToLower(), image.RawFormat);
    }
}
```

希望能幫助到有需要的人，若有錯誤還請不吝嗇指教。 🙂
