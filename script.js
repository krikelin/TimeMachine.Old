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
function scrobble(year, params) {
	if(!activated) {
		return;
	}
	var options =
	{
		"searchAlbums" : false,
		"searchArtists" : false		
	};
	var search = new models.Search("year:" + year + "  " + params + "", options);
	search.observe(models.EVENT.CHANGE, function() {
		
		try {
			for(var i = 0; i < search.tracks.length; i++) {
			
				console.log(search.tracks.length);
				var seed = Math.floor(search.tracks.length*Math.random());
				$("#radio_playlist").animate({left: '-=128px',transform: '-=10px'}, "fast");
				
				console.log(seed);
				
				var track = search.tracks[seed];
				console.log(track.data.album);
				
				console.log(track);
				
				temp_playlist.add(track);
				var player = new views.Image( track.data.album.cover, track.data.uri, "w");
				player.node.style.width="256px";
				player.node.style.height="256px";
				

				var li = document.createElement("td");
				li.appendChild(player.node);
				$("#radio_pls").append(li);
				
				models.player.play(track, temp_playlist);
				console.log("A");
				if(!first || i > 2) {
					break;
				}
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
	
	temp_playlist = new models.Playlist();

	$("#btnGo").bind("click", function(e) {
		var year = document.getElementById("timeslider").value;
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
		try {
			if(!isNaN(args[1])) {
				year = args[1];
				switch_section("radio");
				
				if(args.length > 2) {
					genre = args[2];
				}
				scrobble(year, genre);
				setInterval(function() { 
					if(models.player.position != null)
						if(models.player.position > models.player.track.duration -2010) {
							scrobble(year, genre);
						}
				}, 100);
			} else {
				switch_section("overview");
				
			}
		} catch( e) {
			console.log(e.stack);
		}
	});
	
	
}