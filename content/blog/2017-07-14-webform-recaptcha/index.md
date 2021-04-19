---
title: 'WebForm 使用 reCAPTCHA 驗證'
path: blog/20170714
tags: [asp.net]
date: 2017-06-04
excerpt: 這個我不是機器人驗證一定不陌生，滿多登入畫面會看到的，剛好今天接到把圖形驗證改為 reCAPTCHA 就順手記下。
---

這個我不是機器人驗證一定不陌生，滿多登入畫面會看到的，剛好今天接到把圖形驗證改為 reCAPTCHA 就順手記下。以下為最簡單範例。 🙂  
[Google developers: What is reCAPTCHA?](https://developers.google.com/recaptcha/?hl=zh-TW)

<img src="./recaptcha.gif" width="300" />

```aspnet
<div class="login-data">
    <div class="col-sm-8">
        <div class="col-sm-8-input">
            <div class="login-bar" style="border: none">
                <div class="g-recaptcha" data-sitekey="6Lc..."></div>
            </div>
        </div>
    </div>
</div>
```

```csharp
/**
public class reCAPTCHAClass
{
    public string success;
}

用法：
if (ValidReCAPTCHA() == false)
{ throw error; }
**/

private bool ValidReCAPTCHA()
{
    string Response = Request["g-recaptcha-response"];  //Getting Response String Append to Post Method
    bool Valid = false;
    //Request to Google Server
    HttpWebRequest req = (HttpWebRequest)WebRequest.Create("https://www.google.com/recaptcha/api/siteverify?secret=6Lc...&response=" + Response);

    try
    {
        //Google recaptcha Response
        using (WebResponse wResponse = req.GetResponse())
        {

            using (StreamReader readStream = new StreamReader(wResponse.GetResponseStream()))
            {
                string jsonResponse = readStream.ReadToEnd();

                JavaScriptSerializer js = new JavaScriptSerializer();
                reCAPTCHAClass data = js.Deserialize(jsonResponse);// Deserialize Json

                Valid = Convert.ToBoolean(data.success);
            }
        }

        return Valid;
    }
    catch (WebException ex)
    {
        throw ex;
    }
}
```
