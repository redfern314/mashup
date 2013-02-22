$(function () {
  var songs = 1;
  $('#save').on("click",function () {
    $.post("/edit", {action:"add_list",data:$('#newlist').serializeArray()},function(data){
        window.location.href = '/';
        return false;
    });
  });
  $('#addsong').on("click",function () {
    return false;
  });
  $('#newlist').on("submit",function () {
    return false;
  });
});