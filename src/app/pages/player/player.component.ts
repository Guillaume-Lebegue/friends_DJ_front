import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlaylistService } from 'src/app/services/rest/playlist.service';
import { WebsocketService } from 'src/app/services/websoket/websocket.service';
import { Playlist } from 'src/app/models/playlist.model';
import { Observable, Subscription } from 'rxjs';
import { Video } from 'src/app/models/video.model';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit, OnDestroy {

  currentName: String;
  currentPlaylist: Playlist;

  newMessageSubscription: Subscription = null;
  newVideoSubscription: Subscription = null;
  newJoinSubscription: Subscription = null;
  newLeaveSubscription: Subscription = null;

  messages: Array<{
    message: string,
    name: string,
    own: Boolean,
    info: boolean
  }> = new Array();

  constructor(
    private playlistService: PlaylistService,
    private websocketService: WebsocketService
  ) {
    this.playlistService.currentName.subscribe(name => {
      this.currentName = name;
    })

    this.playlistService.currentPlaylist.subscribe(playlist => {
      this.currentPlaylist = playlist;
    })

    this.setupObservable();
  }
  ngOnDestroy(): void {
    this.clearObservable();
  }

  ngOnInit(): void {
  }

  onDisconect() {
    this.playlistService.currentPlaylist.next(null);
    this.playlistService.currentName.next(null);
    this.websocketService.doLeaveTeam();
  }

  setupObservable() {
    if (!this.newMessageSubscription)
      this.newMessageSubscription = this.websocketService.subscribeToNewMessage().subscribe(data => {
        if (!this.currentPlaylist)
          return;
        const senderName = this.playlistService.getNameFromSocket(this.currentPlaylist, data.socketId);
        this.messages.push({message: data.message, name: senderName, own: false, info: false});
      });
    if (!this.newVideoSubscription)
      this.newVideoSubscription = this.websocketService.subscribeToNewVideo().subscribe(data => {
        if (!this.currentPlaylist)
          return;
        this.currentPlaylist.videos.push(data);
        this.playlistService.currentPlaylist.next(this.currentPlaylist);
      });
    if (!this.newJoinSubscription)
      this.newJoinSubscription = this.websocketService.subscribeToNewJoin().subscribe(data => {
        if (!this.currentPlaylist)
          return;
        this.currentPlaylist.users.push(data);
        this.playlistService.currentPlaylist.next(this.currentPlaylist);
        this.messages.push({message:`${data.name} Vient de se connecter`, name: null, own: false, info: true});
      });
    if (!this.newLeaveSubscription)
      this.newLeaveSubscription = this.websocketService.subscribeToNewLeave().subscribe(data => {
        if (!this.currentPlaylist)
          return;
        this.currentPlaylist.users = this.currentPlaylist.users.filter(user => user.socketId != data.socketId);
        this.playlistService.currentPlaylist.next(this.currentPlaylist);
        this.messages.push({message:`${data.name} Vient de se deconnecter`, name: null, own: false, info: true});
      });
  }

  clearObservable() {
    if (this.newMessageSubscription) {
      this.newMessageSubscription.unsubscribe();
      this.newMessageSubscription = null;
    }
    if (this.newVideoSubscription) {
      this.newVideoSubscription.unsubscribe();
      this.newVideoSubscription = null;
    }
    if (this.newJoinSubscription) {
      this.newJoinSubscription.unsubscribe();
      this.newJoinSubscription = null;
    }
    if (this.newLeaveSubscription) {
      this.newLeaveSubscription.unsubscribe();
      this.newLeaveSubscription = null;
    }
  }

}
