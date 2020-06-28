import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WebsocketService } from './services/websoket/websocket.service';
import { PlaylistService } from './services/rest/playlist.service';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ReceptionComponent } from './pages/reception/reception.component';
import { PlayerComponent } from './pages/player/player.component';
import { VideoComponent } from './pages/player/components/video/video.component';

@NgModule({
  declarations: [
    AppComponent,
    ReceptionComponent,
    PlayerComponent,
    VideoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    WebsocketService,
    PlaylistService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
