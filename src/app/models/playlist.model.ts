import { Video } from './video.model';

export class Playlist {
    public id: string;

    public shortId: string;
    public users: Array<{
        socketId: string,
        name: string
    }>;
    public actualVideo: number;
    public videos: Array<Video>;

    private _json: any;

    public toJSON() {
        return this._json;
    }

    public constructor (playlist) {
        const {
            _id             = null,
            shortId         = null,
            users           = null,
            actualVideo     = null,
            videos          = null
        } = playlist;

        this._json          = playlist;
        this.id             = _id;
        this.shortId        = shortId;
        this.users          = users;
        this.actualVideo    = actualVideo;

        this.videos = new Array<Video>();
        videos.forEach(video => {
            this.videos.push(new Video(video));
        });
    }
}