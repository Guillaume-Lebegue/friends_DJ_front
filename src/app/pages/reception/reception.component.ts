import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Playlist } from 'src/app/models/playlist.model';
import { PlaylistService } from 'src/app/services/rest/playlist.service';
import { WebsocketService } from 'src/app/services/websoket/websocket.service';

@Component({
  selector: 'app-reception',
  templateUrl: './reception.component.html',
  styleUrls: ['./reception.component.css']
})
export class ReceptionComponent implements OnInit {

  signForm: FormGroup;

  missingShortId: Boolean = false;
  notFound: Boolean = false;
  missingName: Boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private playlistService: PlaylistService,
    private websocketService: WebsocketService
  ) { }

  ngOnInit(): void {
    this.signForm = this.formBuilder.group({
      name: ['', Validators.required],
      playlistId: ['']
    });
  }

  get name(): AbstractControl { return this.signForm.controls.name };
  get playlistId(): AbstractControl { return this.signForm.controls.playlistId };

  onCreate(): void {
    this.missingName = false;
    this.missingShortId = false;
    this.notFound = false;
    if (this.name.value.length <= 0) {
      this.missingName = this.name.value.length <= 0;
      return;
    }

    this.playlistService.createPlaylist().subscribe(playlist => {
      this.doJoin(playlist);
    }, error => {
      console.error(error);
      alert('Server error. Please, try again later!');
    })
  }

  onJoin(): void {
    this.missingName = false;
    this.missingShortId = false;
    this.notFound = false;
    if (this.name.value.length <= 0 || this.playlistId.value.length <= 0) {
      this.missingName = this.name.value.length <= 0;
      this.missingShortId = this.playlistId.value.length <= 0;
      return;
    }

    this.playlistService.getPlaylist(this.playlistId.value).subscribe(playlist => {
      this.doJoin(playlist);
    }, error => {
      if (error.status == 404)
        this.notFound = true;
      else {
        console.error(error);
        alert('Server error. Please, try again later!');
      }
    })
  }

  async doJoin(playlist: Playlist) {
    try {
      await this.websocketService.doJoinTeam(playlist.shortId, this.name.value)
      this.playlistService.currentPlaylist.next(playlist);
      this.playlistService.currentName.next(this.name.value);
    } catch (error) {
      console.error(error);
      alert('Server error. Please, try again later!');
    }
  }

}
