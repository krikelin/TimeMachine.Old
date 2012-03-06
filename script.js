/***
Copyright (C) 2012 Alexander Forselius

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var sp = getSpotifyApi(1);
var models = sp.require("sp://import/scripts/api/models");
var views = sp.require("sp://import/scripts/api/views");
var jquery = sp.require("sp://timemachine/js/jquery-1.7.min");
var player = models.application.player;
exports.init = init;
var playlist = null;
var cache = new Array();
function init(){
	
	load();
}
function switch_section(section) {
	$(".section").each(function(index) {
		
		$(this).hide();
	});

	document.getElementById("section_" + section).style.display="block";

	
}
var first = true;
var changable = false;
/***
Generate a new track
****/
var temp_playlist = null;
var tile_size = 256;
var left = 1220;
function getLeft(no) {
	return   window.innerWidth +((no) * tile_size);
}
function scrollTo(no) {	
	$("#l_track").html("");
	$("#r_track").html("");
	$("#track").html("");
	var track = temp_playlist.get(no);
	// Create first view
	var player = new views.Image(track.data.album.cover, track.data.uri, "M");
	player.node.style.width = "340px";
	player.node.style.height = "340px";
	
	$("#track").append(player.node);
	
	// Create left and rightview
	
	// Create left view
	if(no > 0) {
		track = temp_playlist.get(no - 1);
		var l_player = new views.Image(track.data.album.cover, track.data.uri, "M");
	
		l_player.node.style.width = "120px";
		l_player.node.style.height = "120px";
		$("#l_track").append(l_player.node);
	}
	if(no < temp_playlist.tracks.length - 1) {
		track = temp_playlist.get(no+1);
		var r_player = new views.Image(track.data.album.cover, track.data.uri, "M");
	
		r_player.node.style.width = "120px";
		r_player.node.style.height = "120px";
		$("#r_track").append(r_player.node);
	}
	
}
function scrobble(year, params) {
	if(!activated) {
		return;
	}
	var options =
	{
		"searchAlbums" : false,
		"searchArtists" : false		
	};
	var search = new models.Search("year:1901-" + year + "  " + params + "", options);
	search.observe(models.EVENT.CHANGE, function() {
		var uris = "";
		try {
			var max = 3;
			if(search.tracks.length < 1) {
				$("#msg").fadeIn();
				$("#msg").html("The station returned no results.");
			} else {
				$("#msg").hide();
			}
			for(var i = 0; i < search.tracks.length && i < max; i++) {
				var seed = Math.floor(Math.random()*(search.tracks.length-1));
			
				var track = search.tracks[seed];
				if(uris.indexOf(track.data.uri) != -1) {
					max++;
					continue;
				}
				temp_playlist.add(track);
			}
			if(first) {
				scrollTo(0);
				models.player.play(temp_playlist.get(0), temp_playlist);
			}
			first = false;
		} catch(e) {
			console.log(e.stack);
		}
	});
	search.appendNext();
}
var genre ="";
var year = 2011;
var can_change = true;
var preTrack = null;
var nowTrack = null;
var activated = true;
function load(){
	console.log(models.EVENT);
	temp_playlist = new models.Playlist();

	$("#btnGo").bind("click", function(e) {
		var year = document.getElementById("timeslider").value;
		 document.getElementById("timeslider").setAttribute("max", new Date().getFullYear());
		self.location="spotify:app:timemachine:year:" + year + ":" + document.getElementById("query").value;
	});
	$("#timeslider").bind("change", function(e) {	
	
		$("#bigyear").html(document.getElementById("timeslider").value);
	});
	models.application.observe(models.EVENT.ACTIVATE, function() {
		activated = true;
	});
	models.application.observe(models.EVENT.DEACTIVATE, function() {
		activated = false;
	});
	models.application.observe(models.EVENT.ARGUMENTSCHANGED, function() {
		document.body.style.backgroundImage = "";
		activated = true;
		var args = models.application.arguments;
		console.log(args);
		temp_playlist = new models.Playlist();
		first = true;
		try {
			if(!isNaN(args[1])) {
				year = args[1];
				switch_section("radio");
				
				if(args.length > 2) {
					genre = args[2];
				}
				scrobble(year, genre);
				
			} else {
				switch_section("overview");
				
			}
		} catch( e) {
			console.log(e.stack);
		}
	});
	
	models.player.observe(models.EVENT.CHANGE, function(event) {
		
		if(temp_playlist == null)
			return;
		
		if(event.data.curtrack) {
			console.log("F");
			var track = models.player.track;
			
			var pos = temp_playlist.indexOf(track);
			if(pos > temp_playlist.tracks.length - 3) {
				scrobble(year, genre);
			}
			scrollTo(pos);
		}
	});
	
}