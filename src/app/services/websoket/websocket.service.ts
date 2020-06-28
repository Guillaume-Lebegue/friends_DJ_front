import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable, observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Video } from 'src/app/models/video.model';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  public socket: any;

  constructor() {
    this.socket = io(environment.apiHostName);
  }

  getSocketId() {
    return new Observable<{message: string, socketId: string}>(observer => {
      this.socket.on('confirm connection', data => observer.next(data));
    });
  }

  doDisconnect() {
    this.socket.emit('disconnect');
  }

  doJoinTeam(playlistId, name) {
    return new Promise((resolve, reject) => {
      this.socket.emit('joinPlaylist', {playlistId, name},
        res => {
          if (!res.message || res.message != 'ok') {
            reject(res.message ? res.message : 'ko');
            return;
          }
          resolve();
        })
    })
  }

  doLeaveTeam() {
    this.socket.emit('leavePlaylist');
  }

  doSendVideo(url) {
    return new Promise((resolve, reject) => {
      this.socket.emit('nextVideo', {url},
        res => {
          if (!res.message || res.message != 'ok') {
            reject(res.message ? res.message : 'ko');
            return;
          }
          resolve();
        });
    })
  }

  subscribeToNewMessage(): Observable<{message: string, socketId: string}> {
    return new Observable<{message: string, socketId: string}>(observable => {
      this.socket.on('newMessage', data => {
        observable.next(data);
      })
    })
  }

  subscribeToNewVideo(): Observable<Video> {
    return new Observable<Video>(observable => {
      this.socket.on('newVideo', data => {
        observable.next(data);
      })
    })
  }

  subscribeToNewJoin(): Observable<{name: string, socketId: string}> {
    return new Observable<{name: string, socketId: string}>(observable => {
      this.socket.on('newJoin', data => {
        observable.next(data);
      })
    })
  }

  subscribeToNewLeave(): Observable<{name: string, socketId: string}> {
    return new Observable<{name: string, socketId: string}>(observable => {
      this.socket.on('newLeave', data => {
        observable.next(data);
      })
    })
  }

}
