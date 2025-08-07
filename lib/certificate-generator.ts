import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import { supabase } from "./supabase";

interface CertificateData {
  name: string;
  email: string;
  domain: string;
  certificateId: string;
  skills: string[];
  grade?: string;
  projectTitle?: string;
  supervisorName?: string;
  completionDate?: string;
  certType?: 'standard' | 'best_performer';
}

export async function createCertificatePDF(data: CertificateData): Promise<Buffer> {
  const templatePath = data.certType === 'best_performer'
    ? path.resolve("./Certificates_templates/best-performer.jpg")
    : path.resolve("./Certificates_templates/standard.jpg");

  let templateBytes: Buffer;
  
  try {
    templateBytes = fs.readFileSync(templatePath);
  } catch (error) {
    // Fallback to creating a basic PDF if template not found
    return createBasicCertificatePDF(data);
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 landscape

  try {
    const image = await pdfDoc.embedJpg(templateBytes);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: 842,
      height: 595,
    });
  } catch (error) {
    // If image embedding fails, create basic PDF
    return createBasicCertificatePDF(data);
  }

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Student name (main text)
  page.drawText(data.name, {
    x: 260, y: 310, size: 28, font, color: rgb(0.1, 0.1, 0.1),
  });

  // Certificate ID
  page.drawText(`Certificate ID: ${data.certificateId}`, {
    x: 260, y: 280, size: 12, font: regularFont, color: rgb(0.3, 0.3, 0.3),
  });

  // Domain/Track
  page.drawText(`Track: ${formatDomain(data.domain)}`, {
    x: 260, y: 260, size: 14, font: regularFont, color: rgb(0.2, 0.2, 0.2),
  });

  // Completion date
  const dateStr = data.completionDate || new Date().toLocaleDateString();
  page.drawText(`Completed: ${dateStr}`, {
    x: 260, y: 240, size: 12, font: regularFont, color: rgb(0.3, 0.3, 0.3),
  });

  // Grade (if available)
  if (data.grade) {
    page.drawText(`Grade: ${data.grade}`, {
      x: 260, y: 220, size: 12, font: regularFont, color: rgb(0.2, 0.2, 0.2),
    });
  }

  // Skills (if available)
  if (data.skills && data.skills.length > 0) {
    const skillsText = `Skills: ${data.skills.slice(0, 5).join(', ')}`;
    page.drawText(skillsText, {
      x: 260, y: 200, size: 10, font: regularFont, color: rgb(0.4, 0.4, 0.4),
    });
  }

  // Verification URL
  page.drawText(`Verify at: https://www.prismstudio.co.in/verification?cert=${data.certificateId}`, {
    x: 260, y: 180, size: 10, font: regularFont, color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

async function createBasicCertificatePDF(data: CertificateData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 landscape

  // Background
  page.drawRectangle({
    x: 0, y: 0, width: 842, height: 595,
    color: rgb(0.98, 0.98, 0.98),
  });

  // Border
  page.drawRectangle({
    x: 50, y: 50, width: 742, height: 495,
    borderColor: rgb(0.2, 0.2, 0.2),
    borderWidth: 3,
  });

  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Title
  page.drawText('CERTIFICATE OF COMPLETION', {
    x: 200, y: 450, size: 24, font: titleFont, color: rgb(0.1, 0.1, 0.1),
  });

  // Subtitle
  page.drawText('PrismStudio Internship Program', {
    x: 280, y: 420, size: 16, font, color: rgb(0.3, 0.3, 0.3),
  });

  // Main content
  page.drawText('This is to certify that', {
    x: 320, y: 370, size: 14, font, color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(data.name, {
    x: 300, y: 340, size: 20, font: titleFont, color: rgb(0.1, 0.1, 0.1),
  });

  page.drawText(`has successfully completed the ${formatDomain(data.domain)} internship`, {
    x: 200, y: 310, size: 14, font, color: rgb(0.2, 0.2, 0.2),
  });

  // Certificate details
  page.drawText(`Certificate ID: ${data.certificateId}`, {
    x: 100, y: 250, size: 12, font, color: rgb(0.3, 0.3, 0.3),
  });

  page.drawText(`Date: ${data.completionDate || new Date().toLocaleDateString()}`, {
    x: 100, y: 230, size: 12, font, color: rgb(0.3, 0.3, 0.3),
  });

  if (data.grade) {
    page.drawText(`Grade: ${data.grade}`, {
      x: 100, y: 210, size: 12, font, color: rgb(0.3, 0.3, 0.3),
    });
  }

  // Verification
  page.drawText('Verify this certificate at:', {
    x: 100, y: 170, size: 10, font, color: rgb(0.4, 0.4, 0.4),
  });

  page.drawText(`https://www.prismstudio.co.in/verification?cert=${data.certificateId}`, {
    x: 100, y: 155, size: 10, font, color: rgb(0.4, 0.4, 0.4),
  });

  // Footer
  page.drawText('PrismStudio - Transforming Vision into Digital Reality', {
    x: 250, y: 100, size: 12, font, color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

function formatDomain(domain: string): string {
  const domainMap: { [key: string]: string } = {
    'web_development': 'Web Development',
    'ui_ux_design': 'UI/UX Design',
    'data_science': 'Data Science',
    'pcb_design': 'PCB Design',
    'embedded_programming': 'Embedded Programming',
    'fpga_verilog': 'FPGA Verilog',
  };
  return domainMap[domain] || domain;
}

export async function generateCertificate(email: string): Promise<{ url: string; hash: string; certificateId: string }> {
  // Get user data
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (userError || !user) {
    throw new Error("User not found");
  }

  // Check if certificate already exists
  const { data: existingCert } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (existingCert) {
    return {
      url: existingCert.pdf_url,
      hash: existingCert.cert_hash,
      certificateId: existingCert.certificate_id
    };
  }

  // Get user's final task for project title
  const { data: finalSubmission } = await supabase
    .from("submissions")
    .select(`
      *,
      tasks!inner(title, is_final)
    `)
    .eq("user_id", user.id)
    .eq("tasks.is_final", true)
    .single();

  // Determine certificate type
  const certType = user.is_best_performer ? 'best_performer' : 'standard';

  // Prepare certificate data
  const certificateData: CertificateData = {
    name: user.name || user.full_name || 'Student',
    email: user.email,
    domain: user.domain || 'general',
    certificateId: '', // Will be generated by database
    skills: user.skills ? user.skills.split(',').map((s: string) => s.trim()) : [],
    grade: finalSubmission?.score ? getGradeFromScore(finalSubmission.score) : undefined,
    projectTitle: finalSubmission?.tasks?.title,
    supervisorName: 'PrismStudio Team',
    completionDate: new Date().toLocaleDateString(),
    certType
  };

  // Generate PDF
  const pdfBuffer = await createCertificatePDF(certificateData);

  // Generate temporary certificate ID for filename
  const tempId = `temp_${user.id}_${Date.now()}`;
  const fileName = `${tempId}.pdf`;

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("certificates")
    .upload(fileName, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload certificate: ${uploadError.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("certificates")
    .getPublicUrl(fileName);

  // Insert certificate record (this will trigger the ID generation)
  const { data: certRecord, error: certError } = await supabase
    .from("certificates")
    .insert({
      user_id: user.id,
      pdf_url: urlData.publicUrl,
      cert_type: certType,
      grade: certificateData.grade,
      project_title: certificateData.projectTitle,
      supervisor_name: certificateData.supervisorName,
      skills: certificateData.skills,
      completion_date: new Date().toISOString().split('T')[0],
      metadata: {
        student_name: certificateData.name,
        domain: certificateData.domain,
        generated_at: new Date().toISOString()
      }
    })
    .select()
    .single();

  if (certError) {
    throw new Error(`Failed to create certificate record: ${certError.message}`);
  }

  // Update the PDF with the actual certificate ID
  certificateData.certificateId = certRecord.certificate_id;
  const finalPdfBuffer = await createCertificatePDF(certificateData);

  // Update the file with correct name
  const finalFileName = `${certRecord.certificate_id}.pdf`;
  
  // Upload final PDF
  await supabase.storage
    .from("certificates")
    .upload(finalFileName, finalPdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  // Get final public URL
  const { data: finalUrlData } = supabase.storage
    .from("certificates")
    .getPublicUrl(finalFileName);

  // Update certificate record with final URL
  await supabase
    .from("certificates")
    .update({ pdf_url: finalUrlData.publicUrl })
    .eq("id", certRecord.id);

  // Delete temporary file
  await supabase.storage
    .from("certificates")
    .remove([fileName]);

  return {
    url: finalUrlData.publicUrl,
    hash: certRecord.cert_hash,
    certificateId: certRecord.certificate_id
  };
}

function getGradeFromScore(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C+';
  if (score >= 70) return 'C';
  if (score >= 65) return 'D+';
  if (score >= 60) return 'D';
  return 'F';
}