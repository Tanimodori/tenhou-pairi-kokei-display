export interface HandBase {
  tiles: string[];
}

export interface HandFull extends HandBase {
  shanten: number;
  discards: {
    tile: string;
    hand: HandPartial;
  }[];
}

export interface HandPartial extends HandBase {
  draws: {
    tile: string;
    count: number;
    hand: HandFull;
  }[] & { totalCount: number };
}

export type Hand = HandFull | HandPartial;
