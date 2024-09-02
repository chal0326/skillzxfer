import { NextResponse } from 'next/server';
import natural from 'natural';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(req: Request) {
  const { bulletPoint, workHistoryId } = await req.json();

  // Perform NLP analysis to extract skills
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(bulletPoint);
  
  // This is a simplified example. In a real-world scenario, you'd use more sophisticated NLP techniques.
  const skills = tokens ? tokens.filter(token => token.length > 3) : [];

  // Store extracted skills in the database
  const { data, error } = await supabase
    .from('work_history_skills')
    .insert(skills.map(skill => ({ work_history_id: workHistoryId, skill })));

  if (error) {
    return NextResponse.json({ error: 'Failed to store skills' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Skills extracted and stored successfully' });
}