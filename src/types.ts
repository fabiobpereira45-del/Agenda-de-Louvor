/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Member {
  id: string;
  name: string;
  role: string;
}

export interface Theme {
  id: string;
  name: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  themeId?: string; // Optional link to a specific theme
}

export interface Scale {
  id: string;
  date: string; // ISO string
  theme: string;
  songs: Song[];
  memberIds: string[];
  notes?: string;
}
