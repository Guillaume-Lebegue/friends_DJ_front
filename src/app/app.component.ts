import { Component, OnInit } from '@angular/core';
import { WebsocketService } from './services/websoket/websocket.service';
import { BehaviorSubject } from 'rxjs';
import { PlaylistService } from './services/rest/playlist.service';
import { Playlist } from './models/playlist.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'friendsDJFront';
  socketId = null;

  currentName: String = null;
  currentPlaylist: Playlist = null;
  
  constructor(
    private websocket: WebsocketService,
    private playlistService: PlaylistService
  ) {
    this.websocket.getSocketId().subscribe(res => {
      this.socketId = res.socketId;
    });

    this.playlistService.currentName.subscribe(name => {
      this.currentName = name;
    })

    this.playlistService.currentPlaylist.subscribe(playlist => {
      this.currentPlaylist = playlist;
    })
  }
  ngOnInit() {
    
  }

}
