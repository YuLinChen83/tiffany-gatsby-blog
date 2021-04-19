---
title: 'WebForm 註冊 JavaScript'
path: blog/20170728
tags: [asp.net, javascript]
date: 2017-07-28
excerpt: 動態產生JS在目前公司專案中是滿常用到的小技巧，不同的用法會產生在Web Page 的不同位置而有直譯式語言的前後順序差。
---

動態產生 JS 在目前公司專案中是滿常用到的小技巧，不同的用法會產生在 Web Page 的不同位置而有直譯式語言的前後順序差。（跟在 C# 寫的順序無關）  
一般 Web 比較常注意的 head tag 內的 js 會取不到 body 內的 DOM，且會因載入時間拖慢 DOM 出現的速度，所以大多會放在</body>前面，網路上有相當多資訊及相關文章，這邊就不多做說明了。  

先來看看 MSDN: [To add client script to an ASP.NET Web page dynamically](<https://docs.microsoft.com/en-us/previous-versions/ms178207(v=vs.140)?redirectedfrom=MSDN>)

| Method                                                                                                                                                                                                                                                                              | Description                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [RegisterClientScriptBlock](https://docs.microsoft.com/en-us/dotnet/api/system.web.ui.clientscriptmanager.registerclientscriptblock?redirectedfrom=MSDN&view=netframework-4.8#overloads)                                                                                            | Adds a script block to the top of the page. You create the script as a string, and then pass it to the method, which adds it to the page. You can use this method to insert any script into the page. Note that the script might be rendered into the page before all the elements are finished; therefore, you might not be able to reference all the elements on the page from the script. |
| [RegisterClientScriptInclude](https://docs.microsoft.com/en-us/dotnet/api/system.web.ui.clientscriptmanager.registerclientscriptinclude?redirectedfrom=MSDN&view=netframework-4.8#overloads)                                                                                        | Similar to the RegisterClientScriptBlock method, but adds a script block that references an external .js file. The include file is added before any other dynamically added script; therefore, you might not be able to reference some elements on the page.                                                                                                                                 |
| [RegisterStartupScript](https://msdn.microsoft.com/en-us/library/system.web.ui.clientscriptmanager.registerstartupscript.aspx)                                                                                                                                                      | Adds a script block into the page that executes when the page finishes loading but before the page’s onload event is raised. The script is typically not created as an event handler or function; it generally includes only the statements you want to execute once.                                                                                                                        |
| [RegisterOnSubmitStatement](https://docs.microsoft.com/en-us/dotnet/api/system.web.ui.clientscriptmanager.registeronsubmitstatement?redirectedfrom=MSDN&view=netframework-4.8#System_Web_UI_ClientScriptManager_RegisterOnSubmitStatement_System_Type_System_String_System_String_) | Adds script that executes in response to the page’s onsubmit event. The script is executed before the page is submitted, and gives you an opportunity to cancel the submission.                                                                                                                                                                                                              |

其他有遇到的相關方法會再加入進來簡略紀錄，若有理解錯誤也請多指教 🙂

```csharp
protected void Page_Load(object sender, EventArgs e)
{
    if (!IsPostBack)
    {
        //會render在form tag內的上面
        Page.ClientScript.RegisterClientScriptBlock(this.GetType(), "ScriptBlock", "alert('RegisterClientScriptBlock')", true);

        //會render在form tag內的最下面 (control render完後)
        Page.ClientScript.RegisterStartupScript(this.GetType(), "StartupScript", "alert('RegisterStartupScript')", true);

        //動態引入js檔
        Page.ClientScript.RegisterClientScriptInclude(this.GetType(), "ClientScriptInclude", Page.ResolveUrl("~/script/myscript.js"));

        //server control在server 端加內容為js的attribute
        cmdQuery.Attributes.Add("onclick", "alert('Button onclick');");

        //會render到 head runat="server" 內
        if (Page.Header.FindControl("HeadScript") == null)
        {
            string myIncludeTemplate = "\n";
            string myIncludeLocation = Page.ClientScript.GetWebResourceUrl(GetType(), "myscript.js");
            LiteralControl myInclude = new LiteralControl(String.Format(myIncludeTemplate, myIncludeLocation));
            myInclude.ID = "HeadScript";
            Page.Header.Controls.Add(myInclude);
        }

        //會render 在body tag 的最上面
        Response.Write("Response.Write Content");
    }
}
```
