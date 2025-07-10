import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_KEY environment variables are required');
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export interface ProjectLog {
  prompt: string;
  url: string;
  ntl: any;
  created_at?: string;
  id?: number;
}

export async function logProjectToSupabase(projectData: ProjectLog) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(`Failed to log project: ${error.message}`);
    }

    console.log('Project logged successfully:', data);
    return data;
  } catch (error) {
    console.error('Error logging to Supabase:', error);
    throw new Error(`Supabase logging failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getProjects() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error(`Failed to fetch projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 