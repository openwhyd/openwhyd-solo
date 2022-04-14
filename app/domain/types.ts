export type User = {
  id: string;
  playlists: Playlist[];
};

export type Playlist = {
  id: number;
  name: string;
};
