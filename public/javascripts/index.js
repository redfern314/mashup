$(function () {
  var remove = function () {
    console.log(this.parentNode.parentNode.id);
    $.post("/edit", {action:"remove_song",id:this.parentNode.parentNode.id});
    $(this.parentNode.parentNode).html('');
    return false;
  };
  $('.remove').on("click",remove);
  $('.removeList').on("click",function () {
    console.log(this.id);
    $.post("/edit", {action:"remove_list",id:this.id});
    $('#'+this.id+'head').hide();
    $('#'+this.id+'body').hide();
    return false;
  });
  $('.share').on("click",function () {
    window.location.href = '/friends/'+this.parentNode.id.split('head')[0];
    return false;
  });
  var add = function () {
    console.log(this.id);
    var title = prompt('Song title:');
    var artist = prompt('Artist:');
    if(title&&artist){
      var element = this;
      var addSong = function(data) {
        $(element.parentNode).html(data);
        $('.remove').on("click",remove);
        $('.add').on("click",add);
        return false;
      };
      $.post("/edit", {action:"add_song",title:title,artist:artist,id:this.parentNode.id.split('body')[0]},addSong);
    }
    return false;
  }
  $('.add').on("click",add);
  $('.recommend').on("click",function () {
    var element = this;
    var addSong = function(data) {
      $("#"+element.parentNode.id.split("head")[0]+"body").html(data);
      $('.remove').on("click",remove);
      $('.add').on("click",add);
      return false;
    };
    console.log("recommend");
    $.post("/recommend",{playlist:this.parentNode.id.split('head')[0]},addSong);
    return false;
  });
});