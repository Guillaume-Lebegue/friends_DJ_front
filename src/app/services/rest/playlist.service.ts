import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Playlist } from '../../models/playlist.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {

  public currentName: BehaviorSubject<String> = new BehaviorSubject<String>(null);
  public currentPlaylist: BehaviorSubject<Playlist> = new BehaviorSubject<Playlist>(null);

  public api = `${environment.apiHostName}/api/playlist/`;

  constructor(private http: HttpClient) { }

  getPlaylist(shortId): Observable<Playlist> {
    return this.http.get(`${this.api}${shortId}`)
      .pipe(map(playlist => new Playlist(playlist)));
  }

  createPlaylist(): Observable<Playlist> {
    return this.http.post(`${this.api}`, {})
      .pipe(map(playlist => new Playlist(playlist)));
  }

  getNameFromSocket(playlist: Playlist, socketId: string): string {
    const found = playlist.users.filter(user => user.socketId == socketId);

    return found.length > 0 ? found[0].name : null;
  }
}
