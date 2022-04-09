export type Playlist = {
  id: number;
  name: string;
};

export type User = {
  id: string;
  playlists: Playlist[];
};
