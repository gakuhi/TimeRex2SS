function doPost(e) {
  // JSONをパース
  if (e == null) {
    return;
  }
  var requestJSON = e.postData.contents;
  var requestObj = JSON.parse(requestJSON);

  // var requestObj = JSON.parse(e);

  //  
  // 結果をスプレッドシートに追記
  //

  // SSを取得 
  var ss = SpreadsheetApp.openByUrl("ss_url")
  var sh_log = ss.getSheetByName("sheetNameForLog");
  var sh_main = ss.getSheetByName("sheetNameForMain");

  /* logに追加 */
  // ヘッダに対応するデータを取得
  var values = [];
  values.push(new Date());//time stamp
  values.push(requestObj["webhook_type"]);
  values.push(requestObj["calendar_url_path"]);
  values.push(requestObj["event"]["id"]);
  values.push(new Date (requestObj["event"]["local_start_datetime"]));
  values.push(new Date (requestObj["event"]["local_end_datetime"]));
  values.push(requestObj["event"]["hosts"][0]["name"]);

  for(var i =0 ;i < requestObj["event"]["form"].length; i++){
    values.push(requestObj["event"]["form"][i]["value"]);
  }

  // SSに行を追加
  sh_log.appendRow(values);
  
  /*データの更新 */
  if(requestObj["webhook_type"]=="event_confirmed"){
    // 新規登録の場合
    var add_data = [];
    add_data.push(new Date());
    add_data.push(requestObj["event"]["id"]);// イベントID
    // URLから種別の追加
    add_data.push(url2type[requestObj["calendar_url_path"]]);//種別
    add_data.push("予約済み");// ステータス
    add_data.push(requestObj["event"]["hosts"][0]["name"]);// 担当者
    add_data.push(new Date (requestObj["event"]["local_start_datetime"]));// 開始時間
    add_data.push(requestObj["event"]["form"][1]["value"]);// 学生氏名
    add_data.push(requestObj["event"]["form"][0]["value"]);// 大学名
    add_data.push(requestObj["event"]["form"][3]["value"]);// メールアドレス
    add_data.push(requestObj["event"]["form"][4]["value"]);// msn
    add_data.push(requestObj["event"]["form"][5]["value"]);// 卒業年次
    add_data.push(requestObj["event"]["form"][6]["value"]);// 招待者
    add_data.push(requestObj["event"]["form"][7]["value"]);// コメント
    add_sort(sh_main,add_data);
    return;
  }else if(requestObj["webhook_type"]=="event_cancelled"){
    cancel(sh_main,requestObj["event"]["id"]);
    return;
  }
}

//行に情報を追加して予約日でソート
function add_sort(sh, add_data){
  sh.appendRow(add_data);
  sh.getRange("A2:Z").sort(6);
}

// キャンセル処理
function cancel(sh, id){
  var ids = sh.getRange("B:B").getValues().flat();
  sh.getRange(ids.indexOf(id)+1,4).setValue("キャンセル")
}
