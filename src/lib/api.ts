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
    return data.map(song => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      themeId: song.theme_id,
      youtubeUrl: song.youtube_url || undefined
    })) as Song[];
  },
  async addSong(song: Omit<Song, 'id'>) {
    const { data, error } = await supabase.from('songs').insert({
      title: song.title,
      artist: song.artist,
      theme_id: song.themeId,
      youtube_url: song.youtubeUrl || null
    }).select().single();
    if (error) throw error;
    return { ...data, themeId: data.theme_id, youtubeUrl: data.youtube_url } as Song;
  },
  async updateSong(id: string, updates: Partial<Song>) {
    const payload: any = { ...updates };
    if ('themeId' in updates) {
      payload.theme_id = updates.themeId;
      delete payload.themeId;
    }
    if ('youtubeUrl' in updates) {
      payload.youtube_url = updates.youtubeUrl || null;
      delete payload.youtubeUrl;
    }
    const { data, error } = await supabase.from('songs').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return { ...data, themeId: data.theme_id, youtubeUrl: data.youtube_url } as Song;
  },
  async deleteSong(id: string) {
    const { error } = await supabase.from('songs').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Scales ---
  async getScales() {
    const { data: scalesData, error: scalesError } = await supabase
      .from('scales')
      .select('*, scale_songs(song_id, songs(*)), scale_members(member_id)');
    
    if (scalesError) throw scalesError;

    if (!scalesData) return [];

    return (scalesData as any[]).map(s => ({
      id: s.id,
      // Extrai apenas YYYY-MM-DD para evitar problema de fuso horário (UTC vs UTC-3)
      date: s.date ? s.date.split('T')[0] : s.date,
      theme: s.theme,
      notes: s.notes,
      songs: (s.scale_songs || []).map((ss: any) => ({
        ...ss.songs,
        themeId: ss.songs?.theme_id,
        youtubeUrl: ss.songs?.youtube_url || undefined
      })).filter((s: any) => s.id),
      memberIds: (s.scale_members || []).map((sm: any) => sm.member_id)
    })) as Scale[];
  },

  async addScale(scale: Omit<Scale, 'id'>) {
    // 1. Inserir a escala principal
    const { data: scaleData, error: scaleError } = await supabase
      .from('scales')
      .insert({
        date: scale.date,
        theme: scale.theme,
        notes: scale.notes
      })
      .select()
      .single();

    if (scaleError) throw scaleError;

    // 2. Inserir relações de músicas
    if (scale.songs.length > 0) {
      const songRelations = scale.songs.map((song, index) => ({
        scale_id: scaleData.id,
        song_id: song.id,
        order_index: index
      }));
      await supabase.from('scale_songs').insert(songRelations);
    }

    // 3. Inserir relações de membros
    if (scale.memberIds.length > 0) {
      const memberRelations = scale.memberIds.map(memberId => ({
        scale_id: scaleData.id,
        member_id: memberId
      }));
      await supabase.from('scale_members').insert(memberRelations);
    }

    return { ...scale, id: scaleData.id } as Scale;
  },

  async updateScale(id: string, scale: Partial<Scale>) {
    // 1. Sempre atualizar os dados básicos (data e tema)
    const { error: updateError } = await supabase
      .from('scales')
      .update({
        date: scale.date,
        theme: scale.theme,
        notes: scale.notes ?? null
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // 2. Sincronizar músicas — limpa e reinserere
    if (scale.songs !== undefined) {
      await supabase.from('scale_songs').delete().eq('scale_id', id);
      if (scale.songs.length > 0) {
        const songRelations = scale.songs.map((song, index) => ({
          scale_id: id,
          song_id: song.id,
          order_index: index
        }));
        const { error: songsError } = await supabase.from('scale_songs').insert(songRelations);
        if (songsError) console.error('Erro ao salvar músicas da escala:', songsError);
      }
    }

    // 3. Sincronizar membros — limpa e reinsere
    if (scale.memberIds !== undefined) {
      await supabase.from('scale_members').delete().eq('scale_id', id);
      if (scale.memberIds.length > 0) {
        const memberRelations = scale.memberIds.map(memberId => ({
          scale_id: id,
          member_id: memberId
        }));
        const { error: membersError } = await supabase.from('scale_members').insert(memberRelations);
        if (membersError) console.error('Erro ao salvar membros da escala:', membersError);
      }
    }

    return { ...scale, id } as Scale;
  },

  async deleteScale(id: string) {
    const { error } = await supabase.from('scales').delete().eq('id', id);
    if (error) throw error;
  }
};
