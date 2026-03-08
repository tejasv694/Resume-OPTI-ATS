# ATS Resume Optimizer — n8n Setup Guide

## Workflow Overview

```
Webhook → Extract Text → Prepare Data → Stage 1 → Parse 1 → Stage 2 → Parse 2 → Stage 3 → Parse 3 → Stage 4 → Parse 4 → Stage 5 → Compile Final → Respond
```

---

## NODE 1: Webhook — Receive Resume & JD

**Type:** Webhook
- HTTP Method: `POST`
- Path: `resume-optimizer`
- Response Mode: `Respond to Webhook` (using last node)
- Accept: Raw Body OFF

---

## NODE 2: Extract Text from Resume

**Type:** Extract From File
- Operation: `Extract Text`
- Connect from Webhook

---

## NODE 3: Prepare Data

**Type:** Code (JavaScript)

```javascript
const resumeText = $input.first().json.data || $input.first().json.text || '';
const jobDescription = $('Webhook - Receive Resume & JD').first().json.body?.job_description || '';

return [{
  json: {
    resume_text: resumeText,
    job_description: jobDescription
  }
}];
```

---

## NODE 4: Stage 1 — JD Analyzer

**Type:** OpenAI (your existing node)
- Model: `gpt-4o-mini` (or any model you prefer)
- Temperature: `0.2`
- Max Tokens: `2000`

### System Message:
```
You are an ATS job description analyzer. You MUST respond ONLY with valid JSON — no markdown, no backticks, no extra text.
```

### User Message:
```
Analyze the following job description and extract:

1. Top 5 critical hard skills
2. Top 3 important soft skills
3. Required certifications or qualifications
4. Industry-specific terminology
5. Important action verbs used by employers
6. Key tools, technologies, or frameworks
7. Important job titles or role variations

Also calculate keyword frequency and rank them by importance.

Respond in this EXACT JSON format:
{
  "hard_skills": [
    {"skill": "skill name", "frequency_score": 5}
  ],
  "soft_skills": ["skill1", "skill2", "skill3"],
  "certifications": ["cert1"],
  "tools_tech": ["tool1", "tool2"],
  "industry_terms": ["term1", "term2"],
  "action_verbs": ["verb1", "verb2"],
  "job_title_variations": ["title1", "title2"],
  "all_keywords_ranked": [
    {"keyword": "keyword", "importance": "critical|high|medium", "frequency": 3}
  ]
}

Job Description:
{{ $json.job_description }}
```

---

## NODE 5: Parse Stage 1 Results

**Type:** Code (JavaScript)

```javascript
const prepData = $('Prepare Data').first().json;
const aiResponse = $input.first().json?.message?.content
  || $input.first().json?.text
  || $input.first().json?.choices?.[0]?.message?.content
  || '{}';

let stage1 = {};
try {
  const cleaned = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  stage1 = JSON.parse(cleaned);
} catch (e) {
  stage1 = {
    hard_skills: [], soft_skills: [], certifications: [],
    tools_tech: [], industry_terms: [], action_verbs: [],
    job_title_variations: [], all_keywords_ranked: []
  };
}

const allKeywords = [
  ...(stage1.hard_skills || []).map(s => typeof s === 'string' ? s : s.skill),
  ...(stage1.soft_skills || []),
  ...(stage1.tools_tech || []),
  ...(stage1.industry_terms || [])
].filter(Boolean);

return [{
  json: {
    ...prepData,
    stage1_results: stage1,
    extracted_keywords: allKeywords
  }
}];
```

---

## NODE 6: Stage 2 — Synonym Generator

**Type:** OpenAI
- Model: `gpt-4o-mini`
- Temperature: `0.3`
- Max Tokens: `2000`

### System Message:
```
You are an ATS semantic keyword optimizer. You MUST respond ONLY with valid JSON — no markdown, no backticks, no extra text.
```

### User Message:
```
For each keyword provided, generate semantic variations and synonyms commonly recognized by ATS (Applicant Tracking Systems).

Rules:
- Provide 3-6 variations per keyword
- Include industry terminology if applicable
- Keep them resume-friendly
- Include abbreviations, acronyms, and alternative phrasings

Respond in this EXACT JSON format:
{
  "keyword_variations": {
    "keyword1": ["variation1", "variation2", "variation3"],
    "keyword2": ["variation1", "variation2", "variation3"]
  }
}

Keywords:
{{ $json.extracted_keywords.join(', ') }}
```

---

## NODE 7: Parse Stage 2 Results

**Type:** Code (JavaScript)

```javascript
const prevData = $('Parse Stage 1 Results').first().json;
const aiResponse = $input.first().json?.message?.content
  || $input.first().json?.text
  || $input.first().json?.choices?.[0]?.message?.content
  || '{}';

let stage2 = {};
try {
  const cleaned = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  stage2 = JSON.parse(cleaned);
} catch (e) {
  stage2 = { keyword_variations: {} };
}

return [{
  json: {
    ...prevData,
    stage2_results: stage2
  }
}];
```

---

## NODE 8: Stage 3 — ATS Match Scorer

**Type:** OpenAI
- Model: `gpt-4o` (use a stronger model here for accurate scoring)
- Temperature: `0.2`
- Max Tokens: `3000`

### System Message:
```
You are an Applicant Tracking System (ATS) simulator. You MUST respond ONLY with valid JSON — no markdown, no backticks, no extra text.
```

### User Message:
```
Compare the candidate's resume with the job description.

Evaluate:
1. Keyword match percentage
2. Skills match (hard and soft)
3. Experience alignment
4. Missing required skills
5. ATS formatting compatibility (check for tables, images, headers, columns, fancy fonts)
6. Job title relevance
7. Industry terminology match

Also consider these semantic variations when checking for keyword matches — if the resume uses a synonym/variation of a JD keyword, count it as a partial match:
{{ JSON.stringify($json.stage2_results.keyword_variations || {}) }}

Job Description Analysis from Stage 1:
{{ JSON.stringify($json.stage1_results) }}

Respond in this EXACT JSON format:
{
  "ats_score": 75,
  "keyword_match_pct": 65,
  "skills_match_pct": 70,
  "experience_alignment_pct": 80,
  "matched_keywords": ["keyword1", "keyword2"],
  "missing_keywords": ["keyword1", "keyword2"],
  "partial_matches": [
    {"jd_keyword": "project management", "resume_variation": "managed projects", "match_strength": "partial"}
  ],
  "skill_gaps": [
    {"skill": "skill name", "importance": "critical|high|medium", "suggestion": "how to address"}
  ],
  "format_issues": ["issue1", "issue2"],
  "job_title_relevance": "high|medium|low",
  "improvement_suggestions": ["suggestion1", "suggestion2"]
}

JOB DESCRIPTION:
{{ $json.job_description }}

RESUME:
{{ $json.resume_text }}
```

---

## NODE 9: Parse Stage 3 Results

**Type:** Code (JavaScript)

```javascript
const prevData = $('Parse Stage 2 Results').first().json;
const aiResponse = $input.first().json?.message?.content
  || $input.first().json?.text
  || $input.first().json?.choices?.[0]?.message?.content
  || '{}';

let stage3 = {};
try {
  const cleaned = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  stage3 = JSON.parse(cleaned);
} catch (e) {
  stage3 = {
    ats_score: 0, matched_keywords: [], missing_keywords: [],
    skill_gaps: [], format_issues: [], improvement_suggestions: []
  };
}

return [{
  json: {
    ...prevData,
    stage3_results: stage3
  }
}];
```

---

## NODE 10: Stage 4 — Bullet Optimizer

**Type:** OpenAI
- Model: `gpt-4o`
- Temperature: `0.4`
- Max Tokens: `3000`

### System Message:
```
You are a professional ATS resume optimizer specializing in rewriting resume bullet points. You MUST respond ONLY with valid JSON — no markdown, no backticks, no extra text.
```

### User Message:
```
Rewrite and optimize the resume bullet points so they:

1. Include important keywords from the job description (especially missing ones)
2. Use strong action verbs from the JD analysis
3. Follow accomplishment-based structure (Action Verb + Task + Result)
4. Include measurable results where possible (numbers, percentages, dollar amounts)
5. Are concise but keyword-rich

Rules:
- Do NOT fabricate experience — only enhance existing content
- Maintain truthful representation
- Naturally weave in missing keywords where they genuinely apply
- Each bullet should be 1-2 lines max

Missing Keywords to incorporate:
{{ JSON.stringify($json.stage3_results.missing_keywords || []) }}

Action Verbs from JD:
{{ JSON.stringify($json.stage1_results.action_verbs || []) }}

Skill Gaps to address:
{{ JSON.stringify($json.stage3_results.skill_gaps || []) }}

Respond in this EXACT JSON format:
{
  "optimized_bullets": [
    {
      "original": "original bullet text from resume",
      "improved": "optimized bullet text",
      "keywords_added": ["keyword1", "keyword2"],
      "improvement_notes": "what was improved and why"
    }
  ],
  "new_bullets_suggested": [
    {
      "bullet": "suggested new bullet point",
      "reason": "why this should be added",
      "keywords_covered": ["keyword1"]
    }
  ]
}

JOB DESCRIPTION:
{{ $json.job_description }}

RESUME:
{{ $json.resume_text }}
```

---

## NODE 11: Parse Stage 4 Results

**Type:** Code (JavaScript)

```javascript
const prevData = $('Parse Stage 3 Results').first().json;
const aiResponse = $input.first().json?.message?.content
  || $input.first().json?.text
  || $input.first().json?.choices?.[0]?.message?.content
  || '{}';

let stage4 = {};
try {
  const cleaned = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  stage4 = JSON.parse(cleaned);
} catch (e) {
  stage4 = { optimized_bullets: [], new_bullets_suggested: [] };
}

return [{
  json: {
    ...prevData,
    stage4_results: stage4
  }
}];
```

---

## NODE 12: Stage 5 — Final Optimization Plan

**Type:** OpenAI
- Model: `gpt-4o`
- Temperature: `0.3`
- Max Tokens: `4000`

### System Message:
```
You are a senior ATS resume consultant providing a final comprehensive optimization plan. You MUST respond ONLY with valid JSON — no markdown, no backticks, no extra text.
```

### User Message:
```
Using all previous analysis stages, generate a FINAL ATS optimization plan.

Previous Analysis:
- JD Analysis: {{ JSON.stringify($json.stage1_results) }}
- Keyword Variations: {{ JSON.stringify($json.stage2_results) }}
- ATS Match Score: {{ JSON.stringify($json.stage3_results) }}
- Bullet Optimizations: {{ JSON.stringify($json.stage4_results) }}

Provide:
1. Overall ATS readiness score (0-100)
2. Top 10 keywords to add to the resume
3. Resume sections needing improvement
4. A suggested professional summary tailored to the JD
5. Skills section improvements
6. Experience bullet improvements (use Stage 4 results)
7. Formatting recommendations
8. Final priority action items

Respond in this EXACT JSON format:
{
  "ats_readiness_score": 75,
  "score_breakdown": {
    "keyword_match": 70,
    "skills_alignment": 75,
    "experience_relevance": 80,
    "formatting": 90,
    "overall_impression": 75
  },
  "top_keywords_to_add": [
    {"keyword": "keyword", "priority": "critical|high|medium", "where_to_add": "skills|summary|experience"}
  ],
  "sections_to_improve": [
    {"section": "section name", "current_grade": "A|B|C|D|F", "issues": ["issue1"], "fixes": ["fix1"]}
  ],
  "optimized_summary": "A 3-4 sentence professional summary tailored to the job description",
  "skills_section_fix": {
    "add_skills": ["skill1", "skill2"],
    "remove_skills": ["irrelevant skill"],
    "reorder_suggestion": "Put most relevant skills first",
    "suggested_categories": [
      {"category": "Technical Skills", "skills": ["skill1", "skill2"]},
      {"category": "Tools & Platforms", "skills": ["tool1", "tool2"]}
    ]
  },
  "experience_fixes": [
    {
      "original": "original bullet",
      "improved": "improved bullet",
      "keywords_added": ["kw1"]
    }
  ],
  "formatting_recommendations": ["rec1", "rec2"],
  "final_action_items": [
    {"priority": 1, "action": "Most important thing to do", "impact": "high|medium|low"}
  ]
}

JOB DESCRIPTION:
{{ $json.job_description }}

RESUME:
{{ $json.resume_text }}
```

---

## NODE 13: Compile Final Response

**Type:** Code (JavaScript)

```javascript
const prevData = $('Parse Stage 4 Results').first().json;
const aiResponse = $input.first().json?.message?.content
  || $input.first().json?.text
  || $input.first().json?.choices?.[0]?.message?.content
  || '{}';

let stage5 = {};
try {
  const cleaned = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  stage5 = JSON.parse(cleaned);
} catch (e) {
  stage5 = {
    ats_readiness_score: prevData.stage3_results?.ats_score || 50,
    score_breakdown: {}, top_keywords_to_add: [],
    sections_to_improve: [], optimized_summary: '',
    skills_section_fix: {}, experience_fixes: [],
    formatting_recommendations: [], final_action_items: []
  };
}

const stage3 = prevData.stage3_results || {};
const stage1 = prevData.stage1_results || {};
const stage4 = prevData.stage4_results || {};

const allSuggestions = [];
if (stage5.final_action_items) {
  stage5.final_action_items.forEach(item => allSuggestions.push(item.action));
}
if (stage3.improvement_suggestions) {
  stage3.improvement_suggestions.forEach(s => {
    if (!allSuggestions.includes(s)) allSuggestions.push(s);
  });
}

const formatKw = (kw) => typeof kw === 'string'
  ? kw.charAt(0).toUpperCase() + kw.slice(1)
  : kw;

return [{
  json: {
    score: stage5.ats_readiness_score || stage3.ats_score || 0,
    matched_keywords: (stage3.matched_keywords || []).map(formatKw),
    missing_keywords: (stage3.missing_keywords || []).map(formatKw),
    suggestions: allSuggestions.slice(0, 10),
    optimized_resume_url: null,
    score_breakdown: stage5.score_breakdown || {},
    jd_analysis: {
      hard_skills: stage1.hard_skills || [],
      soft_skills: stage1.soft_skills || [],
      certifications: stage1.certifications || [],
      tools_tech: stage1.tools_tech || [],
      industry_terms: stage1.industry_terms || [],
      action_verbs: stage1.action_verbs || [],
      job_title_variations: stage1.job_title_variations || [],
      all_keywords_ranked: stage1.all_keywords_ranked || []
    },
    keyword_variations: prevData.stage2_results?.keyword_variations || {},
    ats_details: {
      keyword_match_pct: stage3.keyword_match_pct || 0,
      skills_match_pct: stage3.skills_match_pct || 0,
      experience_alignment_pct: stage3.experience_alignment_pct || 0,
      partial_matches: stage3.partial_matches || [],
      skill_gaps: stage3.skill_gaps || [],
      format_issues: stage3.format_issues || [],
      job_title_relevance: stage3.job_title_relevance || 'unknown'
    },
    optimized_bullets: stage4.optimized_bullets || [],
    new_bullets_suggested: stage4.new_bullets_suggested || [],
    optimization_plan: {
      top_keywords_to_add: stage5.top_keywords_to_add || [],
      sections_to_improve: stage5.sections_to_improve || [],
      optimized_summary: stage5.optimized_summary || '',
      skills_section_fix: stage5.skills_section_fix || {},
      experience_fixes: stage5.experience_fixes || [],
      formatting_recommendations: stage5.formatting_recommendations || [],
      final_action_items: stage5.final_action_items || []
    }
  }
}];
```

---

## NODE 14: Send Results to Frontend

**Type:** Respond to Webhook
- Response Code: `200`
- Respond With: `JSON`
- Response Body: `={{ JSON.stringify($json) }}`

### Response Headers (for CORS):
| Header | Value |
|--------|-------|
| Access-Control-Allow-Origin | * |
| Access-Control-Allow-Methods | POST, OPTIONS |
| Access-Control-Allow-Headers | Content-Type |

---

## Connection Order

```
Node 1 → Node 2 → Node 3 → Node 4 → Node 5 → Node 6 → Node 7 → Node 8 → Node 9 → Node 10 → Node 11 → Node 12 → Node 13 → Node 14
```

---

## Important Notes

- **Node names must match exactly** as shown above — the Code nodes reference previous nodes by name (e.g., `$('Prepare Data')`, `$('Parse Stage 1 Results')`)
- If you rename a node, update ALL Code nodes that reference it
- Stage 1 & 2 can use `gpt-4o-mini` to save costs; Stages 3, 4, 5 should use `gpt-4o` for better accuracy
- The response field path for the AI message may vary depending on your OpenAI node version. The parser nodes try multiple paths (`message.content`, `text`, `choices[0].message.content`)
- Test with a small resume first to ensure the pipeline works before running full documents
