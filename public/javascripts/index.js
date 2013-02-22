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
    window.location.href = '/friends/'+this.parentNode.parentNode.id.split('head')[0];
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
      $("#"+element.parentNode.parentNode.id.split("head")[0]+"body").html(data);
      $('.remove').on("click",remove);
      $('.add').on("click",add);
      return false;
    };
    console.log("recommend");
    $.post("/recommend",{playlist:this.parentNode.parentNode.id.split('head')[0]},addSong);
    return false;
  });
  $('.removeList').on("mouseover",function () {
    $('#'+this.parentNode.parentNode.id+' .alttext').html("Remove List");
    return false;
  });
  $('.recommend').on("mouseover",function () {
    $('#'+this.parentNode.parentNode.id+' .alttext').html("Get a Similar Track");
    return false;
  });
  $('.share').on("mouseover",function () {
    $('#'+this.parentNode.parentNode.id+' .alttext').html("Share List");
    return false;
  });
  $('.icons').on("mouseout",function () {
    $('#'+this.parentNode.id+' .alttext').html("<br>");
    return false;
  });
  $('.remove').on("mouseover",function () {
    $('#'+this.parentNode.parentNode.parentNode.id.split('body')[0]+'head .alttext').html("Remove Song");
    return false;
  });
  $('.remove').on("mouseout",function () {
    $('#'+this.parentNode.parentNode.parentNode.id.split('body')[0]+'head .alttext').html("<br>");
    return false;
  });
  $('.add').on("mouseover",function () {
    $('#'+this.parentNode.id.split('body')[0]+'head .alttext').html("Add Song");
    return false;
  });
  $('.add').on("mouseout",function () {
    $('#'+this.parentNode.id.split('body')[0]+'head .alttext').html("<br>");
    return false;
  });
});