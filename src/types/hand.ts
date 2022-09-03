export interface HandBase {
  tiles: string[];
}

export interface HandFull extends HandBase {
  shanten: number;
  discards: [string, HandPartial][];
}

export interface HandPartial extends HandBase {
  draws: [string, HandFull][];
}

export type Hand = HandFull | HandPartial;
