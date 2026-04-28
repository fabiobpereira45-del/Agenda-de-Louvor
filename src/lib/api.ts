import { supabase } from './supabase';
import { Member, Theme, Song, Scale } from '../types';

export const api = {
  // --- Members ---
  async getMembers() {
    const { data, error } = await supabase.from('members').select('*').order('name');
    if (error) throw error;
    return data as Member[];
  },
  async addMember(member: Omit<Member, 'id'>) {
    const { data, error } = await supabase.from('members').insert(member).select().single();
    if (error) throw error;
    return data as Member;
  },
  async updateMember(id: string, updates: Partial<Member>) {
    const { data, error } = await supabase.from('members').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as Member;
  },
  async deleteMember(id: string) {
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Themes ---
  async getThemes() {
    const { data, error } = await supabase.from('themes').select('*').order('name');
    if (error) throw error;
    return data as Theme[];
  },
  async addTheme(theme: Omit<Theme, 'id'>) {
    const { data, error } = await supabase.from('themes').insert(theme).select().single();
    if (error) throw error;
    return data as Theme;
  },
  async updateTheme(id: string, updates: Partial<Theme>) {
    const { data, error } = await supabase.from('themes').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as Theme;
  },
  async deleteTheme(id: string) {
    const { error } = await supabase.from('themes').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Songs ---
  async getSongs() {
    const { data, error } = await supabase.from('songs').select('*').order('title');
    if (error) throw error;
    // Map theme_id to themeId to match frontend interface
    return data.map(song => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      themeId: song.theme_id
    })) as Song[];
  },
  async addSong(song: Omit<Song, 'id'>) {
    const { data, error } = await supabase.from('songs').insert({
      title: song.title,
      artist: song.artist,
      theme_id: song.themeId
    }).select().single();
    if (error) throw error;
    return { ...data, themeId: data.theme_id } as Song;
  },
  async updateSong(id: string, updates: Partial<Song>) {
    const payload: any = { ...updates };
    if ('themeId' in updates) {
      payload.theme_id = updates.themeId;
      delete payload.themeId;
    }
    const { data, error } = await supabase.from('songs').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return { ...data, themeId: data.theme_id } as Song;
  },
  async deleteSong(id: string) {
    const { error } = await supabase.from('songs').delete().eq('id', id);
    if (error) throw error;
  }
};
