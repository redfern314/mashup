$(function () {
  $('.select').on("click",function () {
    console.log(this.id);
    $.post("/edit", {action:"add_friend",playlist:this.parentNode.parentNode.id,friend:this.id,name:this.parentNode.id},function(data){
      window.location.href = '/';
      return false;
    });
  });
});