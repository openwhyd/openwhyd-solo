export type Playlist = {
  id: number;
  name: string;
};

export type CreatePlaylist = (
  userId: number,
  playlistName: string
) => Promise<Playlist>;
