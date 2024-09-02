import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function JobListingInput() {
  const [jobDescription, setJobDescription] = useState('');
  const [jobRequirements, setJobRequirements] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription || !jobRequirements) return;

    const { data, error } = await supabase
      .from('job_listings')
      .insert({ description: jobDescription, requirements: jobRequirements });

    if (error) {
      console.error('Error inserting job listing:', error);
    } else {
      console.log('Job listing added:', data);
      setJobDescription('');
      setJobRequirements('');
      // Trigger NLP analysis here
      if (data && data[0]) {
        await fetch('/api/analyze-job-listing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobDescription, jobRequirements, jobListingId: (data[0] as any).id }),
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Enter job description"
      />
      <textarea
        value={jobRequirements}
        onChange={(e) => setJobRequirements(e.target.value)}
        placeholder="Enter job requirements"
      />
      <button type="submit">Add Job Listing</button>
    </form>
  );
}