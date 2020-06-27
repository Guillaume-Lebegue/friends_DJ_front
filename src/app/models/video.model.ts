export class Video {
    public id: number;

    public title: string;
    public thumbnails: string;
    public channel: string;
    public duration: {
        hours: number,
        minutes: number,
        seconds: number
    };

    private _json: any;

    public toJSON() {
        return this._json;
    }

    public constructor (video) {
        const {
            id          = null,
            title       = null,
            thumbnails  = null,
            channel     = null,
            duration    = null
        } = video;

        this._json = video;

        this.id = id;
        this.title = title;
        this.thumbnails = thumbnails;
        this.channel = channel;
        this.duration = duration;
    }
}