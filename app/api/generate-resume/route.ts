import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import PDFDocument from 'pdfkit';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(req: Request) {
  const { userId, jobListingId } = await req.json();

  // Fetch user's work history and skills
  const { data: userSkills, error: userError } = await supabase
    .from('work_history_skills')
    .select('skill, work_history(bullet_point)')
    .eq('work_history.user_id', userId);

  // Fetch job listing skills
  const { data: jobSkills, error: jobError } = await supabase
    .from('job_listing_skills')
    .select('skill')
    .eq('job_listing_id', jobListingId);

  if (userError || jobError) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }

  // Compare skills and rank work history bullet points
  const rankedBulletPoints = userSkills
    .map(item => ({
      bulletPoints: item.work_history.map(wh => wh.bullet_point),
      relevance: jobSkills.filter(jobSkill => item.skill === jobSkill.skill).length
    }))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3);

  // Generate PDF resume
  const doc = new PDFDocument();
  doc.fontSize(18).text('Resume', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text('Relevant Experience:');
  rankedBulletPoints.forEach(item => {
    doc.fontSize(12).text(`• ${item.bulletPoints.join(', ')}`);
  });

  // Convert PDF to buffer
  const chunks: Uint8Array[] = [];
  doc.on('data', chunk => chunks.push(chunk));
  doc.on('end', () => {
    const pdfBuffer = Buffer.concat(chunks);
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=resume.pdf'
      }
    });
  });
  doc.end();
}