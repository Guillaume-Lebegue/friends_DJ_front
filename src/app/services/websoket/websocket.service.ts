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

  doJoinTeam(playlistId: string, name: string) {
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

  doSendVideo(url: string) {
    return new Promise((resolve, reject) => {
      this.socket.emit('addVideo', {url},
        res => {
          if (!res.message || res.message != 'ok') {
            reject(res.message ? res.message : 'ko');
            return;
          }
          resolve();
        });
    })
  }

  doSendMessage(message: string) {
    this.socket.emit('sendMessage', {message});
  }

  doNextVideo(passedPos: number) {
    this.socket.emit('nextVideo', {passed: passedPos});
  }

  subscribeToNewMessage(): Observable<{message: string, senderId: string}> {
    return new Observable<{message: string, senderId: string}>(observable => {
      this.socket.on('newMessage', data => {
        observable.next(data);
      })
    })
  }

  subscribeToNewVideo(): Observable<{video: Video, senderId: string}> {
    return new Observable<{video: Video, senderId: string}>(observable => {
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
