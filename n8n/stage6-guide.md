# Stage 6 — Generate Real DOCX Resume in n8n

This adds 3 nodes that generate an actual .docx file and send it back to the frontend as a downloadable file.

## Final Workflow Order:
```
... → Compile Final Response → Stage 6 (OpenAI) → Build DOCX Resume (Code) → Send Results to Frontend
```

---

## STEP 1: Update "Compile Final Response" Code Node

Open your existing "Compile Final Response" code node. Add these 2 lines inside the return json object (before the closing `}`):

```javascript
    resume_text: prevData.resume_text || '',
    job_description: prevData.job_description || '',
```

---

## STEP 2: Add OpenAI Node — "Stage 6 - Resume Generator"

Type: OpenAI → Message a model
Model: gpt-4o
Temperature: 0.3
Max Tokens: 4000

### System Message:

```
You are an expert ATS resume writer. You rewrite resumes to be fully optimized for ATS systems while maintaining truthfulness. You MUST respond ONLY with valid JSON — no markdown, no backticks, no extra text.
```

### User Message:

```
Using the complete analysis from all previous stages, generate a FULLY REWRITTEN, ATS-optimized resume.

ORIGINAL RESUME:
{{ $json.resume_text }}

JOB DESCRIPTION:
{{ $json.job_description }}

OPTIMIZATION DATA:
- Missing Keywords: {{ JSON.stringify($json.missing_keywords) }}
- Matched Keywords: {{ JSON.stringify($json.matched_keywords) }}
- Optimized Bullets: {{ JSON.stringify($json.optimized_bullets) }}
- Optimized Summary: {{ $json.optimization_plan.optimized_summary || '' }}
- Skills to Add: {{ JSON.stringify($json.optimization_plan.skills_section_fix?.add_skills || []) }}
- Skills to Remove: {{ JSON.stringify($json.optimization_plan.skills_section_fix?.remove_skills || []) }}
- Skills Categories: {{ JSON.stringify($json.optimization_plan.skills_section_fix?.suggested_categories || []) }}
- Action Items: {{ JSON.stringify($json.optimization_plan.final_action_items || []) }}

RULES:
1. Keep ALL factual information from the original resume (name, companies, dates, education)
2. DO NOT fabricate any experience, companies, degrees, or certifications
3. DO NOT invent numbers or metrics that were not in the original
4. Rewrite bullet points using the optimized versions from Stage 4
5. Add the optimized professional summary
6. Reorganize skills section using the suggested categories
7. Naturally incorporate missing keywords WHERE THEY GENUINELY APPLY
8. Use strong action verbs from the job description
9. Use clean ATS-friendly formatting (no tables, no columns, no graphics)
10. Keep it to 1-2 pages maximum

Respond in this EXACT JSON format:
{
  "contact": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "phone number",
    "location": "City, State",
    "linkedin": "linkedin URL or null",
    "portfolio": "portfolio URL or null"
  },
  "summary": "3-4 sentence professional summary optimized for the job",
  "skills_sections": [
    {
      "category": "Category Name",
      "skills": ["skill1", "skill2", "skill3"]
    }
  ],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "dates": "Start Date - End Date",
      "bullets": [
        "Optimized bullet point 1",
        "Optimized bullet point 2"
      ]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "school": "School Name",
      "dates": "Graduation Date",
      "details": "GPA, honors, relevant coursework (if applicable) or null"
    }
  ],
  "certifications": ["Certification 1", "Certification 2"],
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description with keywords",
      "tech": "Technologies used"
    }
  ]
}

IMPORTANT: Only include sections that exist in the original resume. If there are no projects or certifications in the original, set those as empty arrays.
```

---

## STEP 3: Add Code Node — "Build DOCX Resume"

Type: Code (JavaScript)

This is the most important node. It takes the AI JSON, builds an HTML resume, converts it to a base64-encoded HTML file that the frontend can download, AND builds an inline HTML string for preview.

```javascript
// Get compiled analysis data
const compiled = $('Compile Final Response').first().json;

// Get Stage 6 AI response
const aiResponse = $input.first().json?.message?.content
  || $input.first().json?.text
  || $input.first().json?.choices?.[0]?.message?.content
  || '{}';

let resumeData = null;
try {
  const cleaned = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  resumeData = JSON.parse(cleaned);
} catch (e) {
  resumeData = null;
}

// If parsing failed, return without resume
if (!resumeData) {
  const { resume_text, job_description, ...cleanData } = compiled;
  return [{ json: { ...cleanData, optimized_resume_html: null, optimized_resume_base64: null } }];
}

// Build professional ATS-friendly HTML resume
const c = resumeData.contact || {};
const contactParts = [c.email, c.phone, c.location, c.linkedin, c.portfolio].filter(Boolean);

let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${c.name || 'Resume'} - Optimized Resume</title>
<style>
  @page { size: A4; margin: 20mm 18mm; }
  body { font-family: 'Calibri', 'Arial', sans-serif; color: #1a1a1a; line-height: 1.45; font-size: 11pt; max-width: 720px; margin: 0 auto; padding: 30px 40px; }
  h1 { font-size: 20pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 2px; color: #000; }
  .contact { font-size: 9.5pt; color: #444; margin-bottom: 14px; }
  .contact a { color: #1a5276; text-decoration: none; }
  .divider { border: none; border-top: 2px solid #1a1a1a; margin: 0 0 12px 0; }
  .section { margin-bottom: 14px; }
  .section-title { font-size: 11pt; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #000; border-bottom: 1.5px solid #333; padding-bottom: 2px; margin-bottom: 8px; }
  .summary { font-size: 10.5pt; color: #222; line-height: 1.55; margin-bottom: 14px; }
  .skills-row { margin-bottom: 4px; font-size: 10.5pt; line-height: 1.5; }
  .skills-row strong { color: #000; }
  .job { margin-bottom: 12px; page-break-inside: avoid; }
  .job-line1 { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1px; }
  .job-title { font-weight: 700; font-size: 11pt; color: #000; }
  .job-dates { font-size: 9.5pt; color: #444; }
  .job-company { font-size: 10.5pt; color: #333; margin-bottom: 3px; }
  .bullets { padding-left: 16px; margin: 0; }
  .bullets li { font-size: 10.5pt; margin-bottom: 2px; line-height: 1.5; color: #1a1a1a; }
  .edu { margin-bottom: 8px; }
  .edu-line1 { display: flex; justify-content: space-between; align-items: baseline; }
  .edu-degree { font-weight: 700; font-size: 10.5pt; }
  .edu-dates { font-size: 9.5pt; color: #444; }
  .edu-school { font-size: 10.5pt; color: #333; }
  .edu-details { font-size: 9.5pt; color: #555; }
  .cert-text { font-size: 10.5pt; }
  .project { margin-bottom: 6px; }
  .project-name { font-weight: 700; font-size: 10.5pt; }
  .project-desc { font-size: 10pt; color: #333; }
  .project-tech { font-size: 9.5pt; color: #555; font-style: italic; }
  @media print {
    body { padding: 0; margin: 0; }
    .section { page-break-inside: avoid; }
  }
</style>
</head>
<body>
`;

// Header
html += '<h1>' + (c.name || '') + '</h1>';
html += '<div class="contact">' + contactParts.join('  |  ') + '</div>';
html += '<hr class="divider">';

// Summary
if (resumeData.summary) {
  html += '<div class="summary">' + resumeData.summary + '</div>';
}

// Skills
if (resumeData.skills_sections && resumeData.skills_sections.length > 0) {
  html += '<div class="section"><div class="section-title">Technical Skills</div>';
  for (const s of resumeData.skills_sections) {
    html += '<div class="skills-row"><strong>' + s.category + ':</strong> ' + s.skills.join(', ') + '</div>';
  }
  html += '</div>';
}

// Experience
if (resumeData.experience && resumeData.experience.length > 0) {
  html += '<div class="section"><div class="section-title">Professional Experience</div>';
  for (const job of resumeData.experience) {
    html += '<div class="job">';
    html += '<div class="job-line1"><span class="job-title">' + job.title + '</span><span class="job-dates">' + (job.dates || '') + '</span></div>';
    html += '<div class="job-company">' + job.company + (job.location ? ', ' + job.location : '') + '</div>';
    if (job.bullets && job.bullets.length > 0) {
      html += '<ul class="bullets">';
      for (const b of job.bullets) { html += '<li>' + b + '</li>'; }
      html += '</ul>';
    }
    html += '</div>';
  }
  html += '</div>';
}

// Education
if (resumeData.education && resumeData.education.length > 0) {
  html += '<div class="section"><div class="section-title">Education</div>';
  for (const edu of resumeData.education) {
    html += '<div class="edu">';
    html += '<div class="edu-line1"><span class="edu-degree">' + edu.degree + '</span><span class="edu-dates">' + (edu.dates || '') + '</span></div>';
    html += '<div class="edu-school">' + (edu.school || '') + '</div>';
    if (edu.details && edu.details !== 'null') html += '<div class="edu-details">' + edu.details + '</div>';
    html += '</div>';
  }
  html += '</div>';
}

// Certifications
if (resumeData.certifications && resumeData.certifications.length > 0) {
  html += '<div class="section"><div class="section-title">Certifications</div>';
  html += '<div class="cert-text">' + resumeData.certifications.join('  |  ') + '</div>';
  html += '</div>';
}

// Projects
if (resumeData.projects && resumeData.projects.length > 0) {
  html += '<div class="section"><div class="section-title">Projects</div>';
  for (const p of resumeData.projects) {
    html += '<div class="project">';
    html += '<div class="project-name">' + p.name + '</div>';
    if (p.description) html += '<div class="project-desc">' + p.description + '</div>';
    if (p.tech) html += '<div class="project-tech">Technologies: ' + p.tech + '</div>';
    html += '</div>';
  }
  html += '</div>';
}

html += '</body></html>';

// Convert HTML to base64 for download
const base64Html = Buffer.from(html).toString('base64');

// Clean response data
const { resume_text, job_description, ...cleanData } = compiled;

return [{
  json: {
    ...cleanData,
    optimized_resume_html: html,
    optimized_resume_base64: base64Html,
    optimized_resume_filename: (c.name || 'Optimized_Resume').replace(/\s+/g, '_') + '_ATS_Optimized.html'
  }
}];
```

---

## STEP 4: Update "Send Results to Frontend" (Respond to Webhook)

Your existing Respond to Webhook node should already work. Just make sure:
- Response Code: 200
- Respond With: JSON
- Response Body: `={{ JSON.stringify($json) }}`

The response will now include `optimized_resume_html`, `optimized_resume_base64`, and `optimized_resume_filename` fields.

---

## STEP 5: Reconnect Nodes

```
Compile Final Response  →  Stage 6 - Resume Generator (OpenAI)  →  Build DOCX Resume (Code)  →  Send Results to Frontend
```

---

## IMPORTANT NOTES

1. Node name "Compile Final Response" must match EXACTLY — the Code node references it with $('Compile Final Response')
2. The resume is sent as HTML with professional print-ready styling
3. The frontend provides 3 download options:
   - "Save as PDF" — opens in new tab, triggers browser Print → Save as PDF (best quality)
   - "Download HTML" — downloads the .html file directly
   - "Download DOCX" — the frontend converts the HTML to a .docx blob (basic formatting)
4. For best PDF quality, use the "Save as PDF" option from the print dialog

---

## ALTERNATIVE: Generate Real DOCX in n8n (Advanced)

If you want a proper .docx instead of HTML, you can install the `officegen` npm package in your n8n environment and replace the Build DOCX Resume code node. However, the HTML approach works great because:
- Modern ATS systems accept HTML and PDF
- Print-to-PDF creates a perfect PDF
- No extra npm packages needed
- Styling is pixel-perfect

---

## TESTING

1. Open webhook node → Click "Listen for test event"
2. Submit resume + JD from frontend
3. Check each node step by step
4. The final output should include optimized_resume_html with full HTML content
5. Test the Print → Save as PDF flow in the frontend
