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

  videoInput: String = '';
  missingVideoInput: Boolean = false;
  videoNotFound: Boolean = false;

  chatroomInput: String = '';

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
  }>;

  constructor(
    private playlistService: PlaylistService,
    private websocketService: WebsocketService
  ) {
    this.messages = new Array();
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

  async onSendVideo() {
    this.missingVideoInput = false;
    this.videoNotFound = false;

    if (this.videoInput.length <= 0) {
      this.missingVideoInput = true;
      return;
    }

    try {
      await this.websocketService.doSendVideo(this.videoInput);
    } catch (err) {
      if (err == 'not found')
        this.videoNotFound = true;
      else {
        console.log(err);
        alert('Server error. Please, try again later!');
      }
    }
  }

  async onSendMessage() {
    if (this.chatroomInput.length <= 0)
      return;
    
    this.websocketService.doSendMessage(this.chatroomInput);
  }

  setupObservable() {
    if (!this.newMessageSubscription)
      this.newMessageSubscription = this.websocketService.subscribeToNewMessage().subscribe(data => {
        if (!this.currentPlaylist)
          return;
        console.log('playlist: ', this.currentPlaylist, ' senderId: ', data.senderId);
        const senderName = this.playlistService.getNameFromSocket(this.currentPlaylist, data.senderId);
        const own = data.senderId == this.websocketService.socket.id;
        console.log('message: ', data.message, 'sender: ', senderName, ' own: ', own);
        this.messages.push({message: data.message, name: senderName, own, info: false});
      });
    if (!this.newVideoSubscription)
      this.newVideoSubscription = this.websocketService.subscribeToNewVideo().subscribe(data => {
        if (!this.currentPlaylist)
          return;
        this.currentPlaylist.videos.push(data.video);
        this.playlistService.currentPlaylist.next(this.currentPlaylist);

        const senderName = this.playlistService.getNameFromSocket(this.currentPlaylist, data.senderId);
        this.messages.push({message:`${senderName} Vient d'ajouter ${data.video.title}`, name: null, own: null, info: true});
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
