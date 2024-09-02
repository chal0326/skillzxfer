import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function WorkHistoryInput() {
  const [bulletPoint, setBulletPoint] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulletPoint) return;

    const { data, error } = await supabase
      .from('work_history')
      .insert({ bullet_point: bulletPoint })
      .select('id');  // Add this line to select the id

    if (error) {
      console.error('Error inserting work history:', error);
    } else {
      console.log('Work history added:', data);
      setBulletPoint('');
      // Trigger NLP analysis here
      if (data && data[0]) {
        await fetch('/api/analyze-work-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bulletPoint, workHistoryId: data[0].id }),
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={bulletPoint}
        onChange={(e) => setBulletPoint(e.target.value)}
        placeholder="Enter work history bullet point"
      />
      <button type="submit">Add</button>
    </form>
  );
}