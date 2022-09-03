export interface HandBase {
  tiles: string[];
}

export interface HandFullDiscardItem {
  tile: string;
  hand: HandPartial;
}

export type HandFullDiscards = HandFullDiscardItem[];

export interface HandFull extends HandBase {
  shanten: number;
  discards: HandFullDiscards;
}

export interface HandPartialDrawItem {
  tile: string;
  count: number;
  hand: HandFull;
}

export type HandPartialDraws = HandPartialDrawItem[] & { totalCount: number };

export interface HandPartial extends HandBase {
  draws: HandPartialDraws;
}

export type Hand = HandFull | HandPartial;
