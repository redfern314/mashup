var mongoose = require('mongoose');

var userSchema = mongoose.Schema(
    {fbid: String,
        name: String,
        friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist'}]
      }
);

var playlistSchema = mongoose.Schema(
    {users: [String],
        title: String,
        songs: [{title: String,
                  artist: String
                }]
      }
);

var songSchema = mongoose.Schema(
    {title: String,
        artist: String,
        album: String
      }
);

mongoose.model('User', userSchema);
mongoose.model('Playlist', playlistSchema);
mongoose.model('Song', songSchema);