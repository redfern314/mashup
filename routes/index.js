
/*
 * GET home page.
 */

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Playlist = mongoose.model('Playlist');
var Song = mongoose.model('Song');
var http = require('http');

exports.index = function(req, res){
    if(req.session.userid){
        User.findOne({fbid:req.session.userid}).populate("playlists").exec(function(err,docs){
            console.log(docs.playlists);
            var i = 0;
            var rows = [];
            while(i<docs.playlists.length) {
                if(i%3==0){
                    rows.push({length:3,playlists:[docs.playlists[i]]});
                } else {
                    rows[rows.length-1].playlists.push(docs.playlists[i]);
                }
                rows[rows.length-1].length = rows[rows.length-1].playlists.length;
                i++;
            }
            console.log(rows);
            console.log(req.session.name);
            res.render('index', {   title: 'ListPop - My Lists',
                                    rows: rows,
                                    myName: req.session.name });
        });
    } else {
        res.render('login', { title: 'Login to ListPop'});
    }
};

exports.logout = function(req, res, next){
    req.session.userid=null;
    next();
};

exports.login = function (req,res) {
    req.facebook.api('/me?fields=name', function(err, data) {
        req.session.userid=req.facebook.user;
        req.session.name=data.name;
        console.log(data);
        var addUser = function(err,docs) {
            if (err) return console.log(err);
            if(!docs) {
                console.log(docs);
                console.log("no user in database");
                if (err) return console.log(err);
                console.log(data.name);
                var newuser = new User({fbid: req.facebook.user,
                                                name: data.name, 
                                                friends:[],
                                                playlists:[]
                                            });
                newuser.save(function (err) {
                  if (err) console.log(err);
                  console.log("saving newuser")
                  res.redirect('/');
                });
            } else {
                res.redirect('/');
            }
        };
        User.findOne({fbid:req.facebook.user}).exec(addUser);
    });
    };

exports.edit = function (req,res) {
    console.log("edit");
    if(req.body.action==='add_list') {
      console.log(req.body);
      console.log(req.session.userid);
      var newplaylist = new Playlist({users:[req.session.name],
                                    title:req.body.data[0].value,
                                    songs:[{title:req.body.data[1].value,
                                            artist:req.body.data[2].value}]});
      newplaylist.save(function (err,newplaylist) {
          if (err) console.log(err);
          console.log("saving newplaylist")
          var addPlaylist = function(err,doc){
              if (err) console.log(err);
              doc.playlists.push(newplaylist._id);
              doc.save(function (err) {
                  if (err) console.log(err);
                  console.log("saving user");
              });
          };
          User.findOne({fbid:req.session.userid},addPlaylist);
        });
        res.send('');
    } else if(req.body.action==='remove_list') {
        Playlist.findOneAndRemove({_id:req.body.id},function(err,listdoc){
            if (err) console.log(err);
        });
        res.send('');
    } else if(req.body.action==='remove_song') {
        console.log(req.body.id);
        var split = req.body.id.split('$');
        console.log(split);
        var remsong = function(err,doc) {
            if (err) console.log(err);
            for (var i = 0; i < doc.songs.length; i++) {
                if(doc.songs[i].id === split[0]){
                    doc.songs.splice(i,1);
                } 
            };
            doc.save();
        };
        Playlist.findOne({_id:split[1]},remsong);
        res.send('');
    } else if(req.body.action==='add_song') {
        console.log(req.body);
        var addsong = function(err,doc) {
            if (err) console.log(err);
            doc.songs.push({title:req.body.title,artist:req.body.artist})
            doc.save();
            res.render('_playlistbody',{playlist:doc})
        };
        Playlist.findOne({_id:req.body.id},addsong);
    } else if (req.body.action==='add_friend') {
        console.log(req.body);
        var adduser = function(err,doc) {
            if (err) console.log(err);
            doc.users.push(req.body.name);
            doc.save();
        };
        var addplaylist = function(err,doc) {
            if (err) console.log(err);
            doc.playlists.push(req.body.playlist);
            doc.save();
        };
        Playlist.findOne({_id:req.body.playlist},adduser);
        User.findOne({fbid:req.body.friend},addplaylist);
        res.send('');
    }
}

exports.addList = function (req,res) {
    res.render('addlist',{title:"Add a New List"});
}

exports.friends = function (req,res) {
    console.log(req.params);
    req.facebook.api('/me/friends', function(err, data) {
      if (err) return console.log(err);
      console.log(data);
      var friends = [];
      var checked = 0;
      var checkFriend = function(friend) {
        var queryFriend = function(err,docs) {
            checked += 1;
            if(docs){
                console.log('match!');
                friends.push(friend);
            }
            if(checked===data.data.length) {
                console.log(friends);
                res.render('friends',{title:"Share List",friends:friends, id: req.params.id});
            }
        };
        User.findOne({fbid:friend.id},queryFriend);
      };
      data.data.forEach(checkFriend);
    });
}

exports.recommend = function (req,res) {
    console.log("oeopio");
    Playlist.findOne({_id:req.body.playlist},function(err,doc){
        var counter = 0;
        var tracks = [];
        var countSimilar = function(data,valid,last) {
            console.log('--------------------------');
            if(valid===1){
                //console.log(data);
                for (var i = 0; i < data.length; i++) {
                    var added = false;
                    for (var j = 0; j < tracks.length; j++) {
                        if(tracks[j].track.name===data[i].name && tracks[j].track.artist.name===data[i].artist.name){
                            tracks[j].count += 1;
                            added = true;
                        }
                    };
                    if(!added) {
                        tracks.push({count:1,track:data[i]});
                    }
                };
            }
            if(last===1){
                tracks.sort(function(a,b){
                    return b.count - a.count;
                });
                //console.log(tracks);
                var rand = Math.floor((Math.random()*6)+1);
                doc.songs.push({title:tracks[rand].track.name,artist:tracks[rand].track.artist.name})
                doc.save();
                res.render('_playlistbody',{playlist:doc})
                return false;
            }
        };
        var getSimilar = function(track,artist,last){
            http.get("http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist="+artist+"&track="+track+"&\
                api_key="+process.env.LASTFM_KEY+"&format=json&limit=40&autocorrect=1", function(res) {
              res.setEncoding('utf8');
              var data = '';
              res.on('data', function (chunk) {
                data += chunk;
              });
              res.on('end', function () {
                var parsed = JSON.parse(data);
                if(parsed.error || !(Array.isArray(parsed.similartracks.track))) {
                    console.log("Track not found!");
                    countSimilar([],0,last);
                } else {
                    //console.log(parsed.similartracks.track[0]);
                    countSimilar(parsed.similartracks.track,1,last);
                }
              });
            }).on('error', function(e) {
              console.log("Got error: " + e.message);
            });
        }
        var intervalId;
        var runQuery = function() {
            console.log(counter);
            if(counter<(doc.songs.length-1)){
                getSimilar(doc.songs[counter].title,doc.songs[counter].artist,0);
            } else if(counter===doc.songs.length-1){
                clearInterval(intervalId);
                getSimilar(doc.songs[counter].title,doc.songs[counter].artist,1);
            } else {
                clearInterval(intervalId);
            }
            counter += 1;
        };
        intervalId=setInterval(runQuery,100);
    });
}

exports.loggedIn = function (req,res,next) {
    console.log(req.session.userid);
    if (!req.session.userid) {
        console.log("no user in session");
        res.redirect('/');
    } else {
        next();
    }
}