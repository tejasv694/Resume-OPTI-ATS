import { useState, useRef, useCallback, useEffect } from "react";

const N8N_WEBHOOK_URL = "YOUR_N8N_WEBHOOK_URL_HERE";

const UploadIcon = () => (<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>);
const CheckIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);
const XIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const SparkleIcon = ({ size = 20 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>);
const DocIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>);
const TrashIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>);
const DownloadIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>);
const ChevronIcon = ({ open }) => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{transform:open?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s"}}><polyline points="6 9 12 15 18 9"/></svg>);
const ArrowRightIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>);
const FileTextIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>);
const PdfIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>);

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap');
  :root{--bg:#f5f4f0;--surface:#ffffff;--surface-2:#f0efe9;--surface-3:#e8e7e1;--border:#dddbd3;--text:#1a1a1a;--text-dim:#6b6b6b;--text-muted:#9a9a9a;--accent:#5a4fcf;--accent-light:#7b72e9;--accent-glow:rgba(90,79,207,0.12);--green:#0a8f6e;--green-bg:rgba(10,143,110,0.07);--green-border:rgba(10,143,110,0.2);--red:#c0392b;--red-bg:rgba(192,57,43,0.07);--red-border:rgba(192,57,43,0.2);--yellow:#b8860b;--yellow-bg:rgba(184,134,11,0.07);--yellow-border:rgba(184,134,11,0.2);--blue:#1a5fa8;--blue-bg:rgba(26,95,168,0.07);--blue-border:rgba(26,95,168,0.2);--radius:14px;--radius-sm:8px}
  *{margin:0;padding:0;box-sizing:border-box}body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);min-height:100vh}.app{max-width:1400px;margin:0 auto;padding:40px 32px 100px}.results{max-width:none}
  .header{text-align:center;margin-bottom:52px;animation:fadeUp .6s ease;max-width:1120px;margin-left:auto;margin-right:auto}.header-badge{display:inline-flex;align-items:center;gap:6px;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:var(--accent);background:rgba(90,79,207,0.07);border:1px solid rgba(90,79,207,0.18);padding:7px 16px;border-radius:99px;margin-bottom:24px}.header h1{font-size:44px;font-weight:700;letter-spacing:-2px;line-height:1.05;color:var(--text);margin-bottom:14px}.header p{color:var(--text-dim);font-size:15px;max-width:480px;margin:0 auto;line-height:1.7}
  @media(max-width:768px){.header h1{font-size:30px}.input-grid,.findings-grid,.score-bars,.skills-grid{grid-template-columns:1fr!important}.download-btns{flex-direction:column!important;align-items:stretch!important}}
  .input-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;animation:fadeUp .6s ease .1s both;max-width:1120px;margin-left:auto;margin-right:auto}
  .section-label{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-dim);margin-bottom:10px;display:flex;align-items:center;gap:8px}.section-label .num{background:var(--surface-2);border:1px solid var(--border);width:22px;height:22px;display:flex;align-items:center;justify-content:center;border-radius:6px;font-size:11px;color:var(--accent-light)}
  .drop-zone{background:var(--surface);border:2px dashed var(--border);border-radius:var(--radius);padding:48px 24px;text-align:center;cursor:pointer;transition:all .25s;min-height:220px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;position:relative;overflow:hidden}.drop-zone::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,var(--accent-glow),transparent 70%);opacity:0;transition:opacity .3s}.drop-zone:hover,.drop-zone.dragging{border-color:var(--accent);background:rgba(108,92,231,0.03)}.drop-zone:hover::before,.drop-zone.dragging::before{opacity:1}.drop-zone .icon{color:var(--text-dim);transition:all .25s}.drop-zone:hover .icon,.drop-zone.dragging .icon{color:var(--accent);transform:translateY(-4px)}.drop-zone .label{font-size:15px;color:var(--text);font-weight:500}.drop-zone .sublabel{font-size:12px;color:var(--text-dim)}.drop-zone input[type="file"]{display:none}
  .file-preview{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:16px 20px;display:flex;align-items:center;gap:14px;min-height:220px}.file-icon-wrap{width:48px;height:48px;border-radius:10px;background:rgba(108,92,231,0.1);border:1px solid rgba(108,92,231,0.2);display:flex;align-items:center;justify-content:center;color:var(--accent);flex-shrink:0}.file-info{flex:1;min-width:0}.file-info .name{font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.file-info .size{font-size:12px;color:var(--text-dim);margin-top:2px}.file-remove{background:none;border:none;color:var(--text-dim);cursor:pointer;padding:6px;border-radius:6px;transition:all .2s}.file-remove:hover{color:var(--red);background:var(--red-bg)}
  .jd-box{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);min-height:220px;display:flex;flex-direction:column}.jd-box textarea{flex:1;background:transparent;border:none;color:var(--text);font-family:'DM Sans',sans-serif;font-size:14px;line-height:1.7;padding:18px 20px;resize:none;outline:none;min-height:180px}.jd-box textarea::placeholder{color:var(--text-muted)}.jd-box .char-count{font-family:'Space Mono',monospace;font-size:10px;color:var(--text-muted);text-align:right;padding:0 16px 10px}
  .webhook-config{animation:fadeUp .6s ease .15s both;margin-bottom:24px}.webhook-input-row{display:flex;gap:12px}.webhook-input-row input{flex:1;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:12px 16px;color:var(--text);font-family:'Space Mono',monospace;font-size:12px;outline:none;transition:border-color .2s}.webhook-input-row input:focus{border-color:var(--accent)}.webhook-input-row input::placeholder{color:var(--text-muted)}
  .analyze-btn{width:100%;padding:16px;border:none;border-radius:var(--radius);font-family:'DM Sans',sans-serif;font-size:16px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:all .3s;animation:fadeUp .6s ease .2s both;position:relative;overflow:hidden}.analyze-btn.ready{background:var(--accent);color:white;box-shadow:0 4px 16px var(--accent-glow)}.analyze-btn.ready:hover{transform:translateY(-2px);box-shadow:0 8px 32px var(--accent-glow)}.analyze-btn.disabled{background:var(--surface-2);color:var(--text-muted);cursor:not-allowed;border:1px solid var(--border)}.analyze-btn.loading{background:var(--surface-2);color:var(--text-dim);cursor:wait;border:1px solid var(--border)}
  .loader{display:flex;gap:6px;align-items:center}.loader span{width:6px;height:6px;background:var(--accent);border-radius:50%;animation:bounce 1.2s infinite}.loader span:nth-child(2){animation-delay:.15s}.loader span:nth-child(3){animation-delay:.3s}@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-8px)}}
  .pipeline{display:flex;align-items:center;justify-content:center;gap:0;margin:28px 0 8px;animation:fadeUp .5s ease;flex-wrap:wrap}.pipeline-step{display:flex;align-items:center;gap:6px;font-size:11px;font-family:'Space Mono',monospace;color:var(--text-muted);padding:6px 10px;border-radius:6px;transition:all .3s;white-space:nowrap}.pipeline-step.active{color:var(--accent-light);background:rgba(108,92,231,0.08)}.pipeline-step.done{color:var(--green)}.pipeline-arrow{color:var(--border);font-size:14px;margin:0 2px}
  .error-banner{background:var(--red-bg);border:1px solid var(--red-border);border-radius:var(--radius);padding:14px 20px;color:var(--red);font-size:14px;margin-top:16px;animation:fadeUp .3s ease}
  .results{margin-top:44px;animation:fadeUp .5s ease}.results-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;flex-wrap:wrap;gap:12px}.results-header h2{font-size:24px;font-weight:700;letter-spacing:-0.5px}
  .score-ring-wrap{display:flex;align-items:center;gap:16px}.score-ring{position:relative;width:72px;height:72px}.score-ring svg{transform:rotate(-90deg)}.score-ring .bg{stroke:var(--surface-3)}.score-ring .fg{transition:stroke-dashoffset .8s ease}.score-ring .score-text{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-size:18px;font-weight:700}
  .score-bars{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px}.score-bar-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px 16px}.score-bar-card .bar-label{font-size:11px;color:var(--text-dim);font-family:'Space Mono',monospace;letter-spacing:.5px;text-transform:uppercase;margin-bottom:8px}.score-bar-card .bar-track{height:6px;background:var(--surface-3);border-radius:99px;overflow:hidden;margin-bottom:6px}.score-bar-card .bar-fill{height:100%;border-radius:99px;transition:width .8s ease}.score-bar-card .bar-val{font-family:'Space Mono',monospace;font-size:14px;font-weight:700}
  .findings-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px}
  .card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:16px}.card h3{font-size:12px;font-family:'Space Mono',monospace;letter-spacing:1px;text-transform:uppercase;margin-bottom:14px;display:flex;align-items:center;gap:8px}.card h3.green{color:var(--green)}.card h3.red{color:var(--red)}.card h3.yellow{color:var(--yellow)}.card h3.blue{color:var(--blue)}.card h3.accent{color:var(--accent-light)}
  .tag-list{display:flex;flex-wrap:wrap;gap:6px}.tag{font-size:12px;padding:5px 12px;border-radius:6px;font-weight:500}.tag.green{background:var(--green-bg);color:var(--green);border:1px solid var(--green-border)}.tag.red{background:var(--red-bg);color:var(--red);border:1px solid var(--red-border)}.tag.yellow{background:var(--yellow-bg);color:var(--yellow);border:1px solid var(--yellow-border)}.tag.blue{background:var(--blue-bg);color:var(--blue);border:1px solid var(--blue-border)}.tag.accent{background:rgba(108,92,231,0.08);color:var(--accent-light);border:1px solid rgba(108,92,231,0.2)}.tag.neutral{background:var(--surface-2);color:var(--text-dim);border:1px solid var(--border)}
  .item-list{display:flex;flex-direction:column;gap:8px;list-style:none}.item-list li{font-size:13px;line-height:1.6;color:var(--text);display:flex;align-items:flex-start;gap:8px;padding:8px 12px;border-radius:var(--radius-sm);background:rgba(255,255,255,0.015)}
  .bullet-compare{background:var(--surface-2);border-radius:var(--radius-sm);padding:16px;margin-bottom:12px}.bullet-compare .bullet-label{font-size:10px;font-family:'Space Mono',monospace;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px}.bullet-compare .bullet-label.orig{color:var(--text-muted)}.bullet-compare .bullet-label.improved{color:var(--green)}.bullet-compare .bullet-text{font-size:13px;line-height:1.6;margin-bottom:12px}.bullet-compare .bullet-text.orig{color:var(--text-dim);text-decoration:line-through;opacity:.7}.bullet-compare .bullet-text.improved{color:var(--text)}.bullet-compare .kw-added{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}
  .accordion{border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;margin-bottom:16px}.accordion-header{background:var(--surface);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;transition:background .2s}.accordion-header:hover{background:var(--surface-2)}.accordion-header h3{font-size:14px;font-weight:600;display:flex;align-items:center;gap:10px;margin:0}.accordion-body{background:var(--surface);padding:0 20px 20px}
  .summary-box{background:linear-gradient(135deg,rgba(90,79,207,0.05),rgba(90,79,207,0.02));border:1px solid rgba(90,79,207,0.15);border-radius:var(--radius);padding:24px;margin-bottom:16px}.summary-box h3{font-size:14px;font-weight:700;color:var(--accent-light);margin-bottom:12px;display:flex;align-items:center;gap:8px}.summary-box p{font-size:14px;line-height:1.8;color:var(--text)}
  .action-item{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:8px}.action-num{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-size:12px;font-weight:700;flex-shrink:0}.action-num.high{background:var(--red-bg);color:var(--red);border:1px solid var(--red-border)}.action-num.medium{background:var(--yellow-bg);color:var(--yellow);border:1px solid var(--yellow-border)}.action-num.low{background:var(--green-bg);color:var(--green);border:1px solid var(--green-border)}.action-text{font-size:13px;line-height:1.5}.action-impact{font-size:10px;font-family:'Space Mono',monospace;letter-spacing:1px;text-transform:uppercase;margin-top:4px}
  .download-section{background:linear-gradient(135deg,rgba(10,143,110,0.06),rgba(90,79,207,0.05));border:1px solid rgba(10,143,110,0.15);border-radius:var(--radius);padding:32px;text-align:center;margin-top:28px}.download-section h3{font-size:20px;font-weight:700;margin-bottom:8px;background:linear-gradient(135deg,var(--green),var(--accent-light));-webkit-background-clip:text;-webkit-text-fill-color:transparent}.download-section p{color:var(--text-dim);font-size:14px;margin-bottom:22px;max-width:500px;margin-left:auto;margin-right:auto}
  .download-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
  .dl-btn{display:inline-flex;align-items:center;gap:8px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;padding:14px 28px;border:none;border-radius:99px;cursor:pointer;transition:all .3s}
  .dl-btn.primary{background:var(--green);color:#000;box-shadow:0 4px 20px rgba(0,206,201,0.25)}.dl-btn.primary:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,206,201,0.35)}
  .dl-btn.secondary{background:var(--accent);color:white;box-shadow:0 4px 20px var(--accent-glow)}.dl-btn.secondary:hover{transform:translateY(-2px);box-shadow:0 8px 30px var(--accent-glow)}
  .dl-btn.tertiary{background:var(--surface-2);border:1px solid var(--border);color:var(--text)}.dl-btn.tertiary:hover{background:var(--surface-3);transform:translateY(-1px)}
  .dl-btn.cover{background:var(--yellow);color:#000;box-shadow:0 4px 20px rgba(254,202,87,0.25)}.dl-btn.cover:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(254,202,87,0.35)}
  .dl-btn:disabled{opacity:0.35;cursor:not-allowed;transform:none!important;box-shadow:none!important}
  .cover-letter-section{background:linear-gradient(135deg,rgba(184,134,11,0.05),rgba(184,134,11,0.02));border:1px solid rgba(184,134,11,0.15);border-radius:var(--radius);padding:24px;margin-top:16px}.cover-letter-section h3{font-size:14px;font-weight:700;color:var(--yellow);margin-bottom:8px;display:flex;align-items:center;gap:8px}.cover-letter-section .cl-meta{font-size:12px;color:var(--text-dim);font-family:'Space Mono',monospace;margin-bottom:16px;display:flex;gap:16px}.cover-letter-section .cl-body{font-size:13px;line-height:1.8;color:var(--text);background:var(--surface-2);border-radius:var(--radius-sm);padding:24px 28px;margin-bottom:16px}.cover-letter-section .cl-body p{margin:0 0 14px 0;color:var(--text);line-height:1.75;text-align:justify}.cover-letter-section .cl-keywords{display:flex;flex-wrap:wrap;gap:6px}
  .dl-btn-label{font-size:10px;color:var(--text-dim);font-family:'Space Mono',monospace;letter-spacing:1px;text-transform:uppercase;margin-top:4px}
  .skills-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
  .freq-table-wrap{margin-bottom:24px}.freq-table-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}.freq-table-header h3{font-size:12px;font-family:'Space Mono',monospace;letter-spacing:1px;text-transform:uppercase;color:var(--text-dim);display:flex;align-items:center;gap:8px}.freq-filter-tabs{display:flex;gap:6px}.freq-filter-tab{font-size:10px;font-family:'Space Mono',monospace;padding:4px 10px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--text-dim);cursor:pointer;transition:all .2s;text-transform:uppercase;letter-spacing:.5px}.freq-filter-tab.active{border-color:var(--accent);color:var(--accent-light);background:rgba(108,92,231,0.08)}.freq-table{width:100%;border-collapse:collapse;font-size:13px}.freq-table th{font-size:10px;font-family:'Space Mono',monospace;letter-spacing:1px;text-transform:uppercase;color:var(--text-muted);padding:8px 12px;text-align:left;border-bottom:1px solid var(--border)}.freq-table th:last-child,.freq-table td:last-child{text-align:center}.freq-table td{padding:9px 12px;border-bottom:1px solid rgba(255,255,255,0.03);vertical-align:middle}.freq-table tr:last-child td{border-bottom:none}.freq-table tr:hover td{background:rgba(255,255,255,0.02)}.freq-kw{font-weight:500;color:var(--text)}.freq-count{font-family:'Space Mono',monospace;font-size:12px;font-weight:700}.freq-count.zero{color:var(--red)}.freq-count.match{color:var(--green)}.freq-count.over{color:var(--text-dim)}.freq-bar-cell{width:120px}.freq-mini-bar{height:4px;border-radius:99px;background:var(--surface-3);overflow:hidden;margin-top:3px}.freq-mini-fill{height:100%;border-radius:99px}.freq-status-dot{width:8px;height:8px;border-radius:50%;display:inline-block}.freq-category{font-size:10px;font-family:'Space Mono',monospace;padding:2px 7px;border-radius:4px;text-transform:uppercase;letter-spacing:.5px}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}

  /* ── Side-by-side layout ───────────────────────────────────────── */
  .split-layout{display:grid;grid-template-columns:minmax(0,1fr) 440px;gap:24px;align-items:start;margin-top:28px}
  @media(max-width:1100px){.split-layout{grid-template-columns:1fr!important}.resume-col{position:static!important}}
  .analysis-col{min-width:0}
  .resume-col{position:sticky;top:20px;min-width:0}

  /* ── Resume Preview Panel ──────────────────────────────────────── */
  .resume-preview-wrap{border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;background:var(--surface)}
  .resume-preview-bar{background:var(--surface-2);border-bottom:1px solid var(--border);padding:10px 14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}
  .resume-preview-title{font-size:12px;font-weight:600;color:var(--text);display:flex;align-items:center;gap:6px}
  .resume-legend{display:flex;align-items:center;gap:10px;font-size:10px;font-family:'Space Mono',monospace;color:var(--text-dim);flex-wrap:wrap;margin-top:4px;padding:0 14px 8px}
  .resume-legend-item{display:flex;align-items:center;gap:4px}
  .resume-legend-dot{display:inline-block;width:9px;height:9px;border-radius:2px;flex-shrink:0}
  .highlight-toggle{display:flex;align-items:center;gap:6px;font-size:10px;color:var(--text-dim);font-family:'Space Mono',monospace;cursor:pointer;padding:5px 10px;border-radius:6px;border:1px solid var(--border);background:transparent;transition:all .2s;letter-spacing:.5px}
  .highlight-toggle:hover{border-color:var(--accent);color:var(--accent-light)}
  .highlight-toggle.on{border-color:rgba(0,206,201,0.4);color:var(--green);background:rgba(0,206,201,0.06)}
  .toggle-dot{width:24px;height:14px;border-radius:99px;background:var(--surface-3);border:1px solid var(--border);position:relative;transition:background .2s;flex-shrink:0}
  .toggle-dot::after{content:'';position:absolute;top:2px;left:2px;width:8px;height:8px;border-radius:50%;background:var(--text-muted);transition:all .2s}
  .highlight-toggle.on .toggle-dot{background:rgba(0,206,201,0.2);border-color:var(--green)}
  .highlight-toggle.on .toggle-dot::after{left:12px;background:var(--green)}
  .kw-strip{padding:8px 12px;border-bottom:1px solid var(--border);background:var(--surface);display:flex;flex-wrap:wrap;gap:5px;max-height:96px;overflow-y:auto}
  .kw-pill{cursor:pointer;border:1px solid transparent;border-radius:5px;padding:3px 9px;font-size:11px;font-weight:500;transition:all .15s;font-family:'DM Sans',sans-serif}
  .kw-pill.matched{background:rgba(0,206,201,0.08);color:var(--green);border-color:rgba(0,206,201,0.15)}
  .kw-pill.matched:hover,.kw-pill.matched.active{background:rgba(0,206,201,0.2);border-color:rgba(0,206,201,0.5)}
  .kw-pill.injected{background:rgba(254,202,87,0.08);color:var(--yellow);border-color:rgba(254,202,87,0.15)}
  .kw-pill.injected:hover,.kw-pill.injected.active{background:rgba(254,202,87,0.2);border-color:rgba(254,202,87,0.5)}
  .resume-iframe-wrap{background:#fafafa;width:100%;overflow-y:auto;max-height:calc(100vh - 120px);min-height:500px}
  .resume-iframe-wrap iframe{width:100%;border:none;display:block}
  .kw-count-badge{font-size:9px;font-family:'Space Mono',monospace;padding:1px 7px;border-radius:99px;background:rgba(0,206,201,0.1);color:var(--green);border:1px solid rgba(0,206,201,0.2)}
  .resume-dl-bar{padding:10px 14px;border-top:1px solid var(--border);background:var(--surface-2);display:flex;gap:8px;flex-wrap:wrap;align-items:center}

  /* ── Inline Diff Bullets (Jobscan style) ───────────────────────── */
  .diff-bullet-block{background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px 16px;margin-bottom:10px;cursor:pointer;transition:all .2s;position:relative}
  .diff-bullet-block:hover{border-color:var(--green);background:rgba(0,206,201,0.03)}
  .diff-text{font-size:13px;line-height:1.7;color:var(--text);margin-bottom:6px}
  .diff-keep{color:var(--text)}
  .diff-remove{color:var(--red);text-decoration:line-through;opacity:.65}
  .diff-add{color:var(--green);font-weight:500}
  .diff-note{font-size:11px;color:var(--text-muted);margin-top:6px;font-style:italic}
  .diff-copy-hint{font-size:10px;font-family:'Space Mono',monospace;letter-spacing:.5px;color:var(--text-muted);margin-top:8px;display:flex;align-items:center;gap:5px;transition:color .2s}
  .diff-bullet-block:hover .diff-copy-hint{color:var(--green)}
  .diff-copy-hint.copied{color:var(--green)}

  /* ── Suggested Bullets Section ─────────────────────────────────── */
  .sugg-section{margin-top:8px;border:1px solid rgba(254,202,87,0.2);border-radius:var(--radius);overflow:hidden}
  .sugg-section-header{background:linear-gradient(135deg,rgba(254,202,87,0.07),rgba(254,202,87,0.02));padding:18px 22px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;transition:background .2s;border-bottom:1px solid rgba(254,202,87,0.12)}.sugg-section-header:hover{background:rgba(254,202,87,0.06)}
  .sugg-section-title{display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600;color:var(--yellow)}
  .sugg-badge{font-size:10px;font-family:'Space Mono',monospace;letter-spacing:1.5px;text-transform:uppercase;background:rgba(254,202,87,0.1);color:var(--yellow);border:1px solid rgba(254,202,87,0.2);padding:3px 10px;border-radius:99px}
  .sugg-section-body{background:var(--surface);padding:20px}
  .sugg-section-desc{font-size:12px;color:var(--text-dim);line-height:1.6;margin-bottom:18px;padding:10px 14px;background:rgba(254,202,87,0.04);border-left:2px solid rgba(254,202,87,0.3);border-radius:0 6px 6px 0}
  .sugg-keyword-block{margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid var(--border)}.sugg-keyword-block:last-child{margin-bottom:0;padding-bottom:0;border-bottom:none}
  .sugg-keyword-header{display:flex;align-items:center;gap:10px;margin-bottom:10px}
  .sugg-keyword-name{font-size:13px;font-weight:700;color:var(--text)}
  .sugg-keyword-cat{font-size:9px;font-family:'Space Mono',monospace;letter-spacing:1px;text-transform:uppercase;padding:2px 8px;border-radius:4px}
  .sugg-keyword-cat.hard{background:rgba(108,92,231,0.1);color:var(--accent-light);border:1px solid rgba(108,92,231,0.2)}
  .sugg-keyword-cat.industry{background:rgba(84,160,255,0.08);color:var(--blue);border:1px solid rgba(84,160,255,0.2)}
  .sugg-keyword-cat.tools{background:rgba(0,206,201,0.08);color:var(--green);border:1px solid rgba(0,206,201,0.2)}
  .sugg-keyword-cat.soft{background:rgba(255,107,107,0.08);color:var(--red);border:1px solid rgba(255,107,107,0.2)}
  .sugg-note{font-size:11px;color:var(--text-muted);font-style:italic;margin-bottom:10px}
  .sugg-options{display:flex;flex-direction:column;gap:8px}
  .sugg-option{display:flex;align-items:flex-start;gap:12px;padding:13px 16px;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;transition:all .2s;position:relative;text-align:left;width:100%}
  .sugg-option:hover{border-color:var(--yellow);background:rgba(254,202,87,0.04);transform:translateX(2px)}
  .sugg-option.copied{border-color:var(--green);background:rgba(0,206,201,0.05)}
  .sugg-option-num{width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-size:10px;font-weight:700;flex-shrink:0;background:rgba(254,202,87,0.1);color:var(--yellow);border:1px solid rgba(254,202,87,0.2);margin-top:1px}
  .sugg-option-text{font-size:13px;line-height:1.6;color:var(--text);flex:1}
  .sugg-option-copy{font-size:9px;font-family:'Space Mono',monospace;letter-spacing:1px;text-transform:uppercase;color:var(--text-muted);flex-shrink:0;margin-top:3px;transition:color .2s}
  .sugg-option:hover .sugg-option-copy{color:var(--yellow)}
  .sugg-option.copied .sugg-option-copy{color:var(--green)}
  .sugg-empty{font-size:13px;color:var(--text-dim);padding:12px;text-align:center}
`;

// ── Keyword Frequency Table Component ────────────────────────────────────
function KeywordFrequencyTable({ data }) {
  const [filter, setFilter] = useState('all');
  if (!data || data.length === 0) return null;

  const jdOnly = data.filter(k => k.jd_count > 0);
  const filtered = filter === 'all' ? jdOnly
    : filter === 'missing' ? jdOnly.filter(k => k.status === 'missing')
    : jdOnly.filter(k => k.status === 'matched');

  const missingCount = jdOnly.filter(k => k.status === 'missing').length;
  const matchedCount = jdOnly.filter(k => k.status === 'matched').length;
  const maxJd = Math.max(...jdOnly.map(k => k.jd_count), 1);

  const categoryColor = (kw) => {
    const k = kw.toLowerCase();
    if (['support','track','provide','facilitate','contribute','own','execute','identify','act','maintain'].includes(k)) return {bg:'rgba(84,160,255,0.08)',color:'var(--blue)',label:'verb'};
    if (["bachelor's degree","vocational qualification","master's degree"].some(c => k.includes(c.split(' ')[0]))) return {bg:'rgba(254,202,87,0.08)',color:'var(--yellow)',label:'qual'};
    return null;
  };

  return (
    <div className="freq-table-wrap">
      <div className="freq-table-header">
        <h3>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Keyword Frequency
        </h3>
        <div className="freq-filter-tabs">
          <button className={`freq-filter-tab ${filter==='all'?'active':''}`} onClick={()=>setFilter('all')}>All ({jdOnly.length})</button>
          <button className={`freq-filter-tab ${filter==='missing'?'active':''}`} onClick={()=>setFilter('missing')}>Missing ({missingCount})</button>
          <button className={`freq-filter-tab ${filter==='matched'?'active':''}`} onClick={()=>setFilter('matched')}>Matched ({matchedCount})</button>
        </div>
      </div>
      <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius)',overflow:'hidden'}}>
        <table className="freq-table">
          <thead>
            <tr>
              <th style={{width:20}}></th>
              <th>Keyword</th>
              <th style={{textAlign:'center'}}>Resume</th>
              <th style={{textAlign:'center'}}>Job Description</th>
              <th style={{width:130}}>JD Frequency</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => {
              const isMissing = row.status === 'missing';
              const isOver = row.resume_count > row.jd_count * 2;
              const cat = categoryColor(row.keyword);
              return (
                <tr key={i}>
                  <td style={{paddingRight:0}}>
                    <span className="freq-status-dot" style={{background: isMissing ? 'var(--red)' : 'var(--green)'}}/>
                  </td>
                  <td>
                    <span className="freq-kw">{row.keyword}</span>
                    {cat && <span className="freq-category" style={{background:cat.bg,color:cat.color,marginLeft:8}}>{cat.label}</span>}
                  </td>
                  <td style={{textAlign:'center'}}>
                    {row.resume_count === 0
                      ? <span style={{color:'var(--red)',fontSize:16,lineHeight:1}}>×</span>
                      : <span className={`freq-count ${isOver?'over':'match'}`}>{row.resume_count}</span>
                    }
                  </td>
                  <td style={{textAlign:'center'}}>
                    <span className="freq-count" style={{color:'var(--text-dim)'}}>{row.jd_count}</span>
                  </td>
                  <td className="freq-bar-cell">
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <div className="freq-mini-bar" style={{flex:1}}>
                        <div className="freq-mini-fill" style={{
                          width:`${(row.jd_count/maxJd)*100}%`,
                          background: isMissing
                            ? row.jd_count >= 3 ? 'var(--red)' : 'rgba(255,107,107,0.5)'
                            : 'var(--green)'
                        }}/>
                      </div>
                      {isMissing && row.jd_count >= 3 && (
                        <span style={{fontSize:9,fontFamily:"'Space Mono',monospace",color:'var(--red)',whiteSpace:'nowrap'}}>HIGH</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const DEMO_HTML = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>@page{size:A4;margin:20mm 18mm}body{font-family:Calibri,Arial,sans-serif;color:#1a1a1a;line-height:1.45;font-size:11pt;max-width:720px;margin:0 auto;padding:30px 40px}h1{font-size:20pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:2px}.contact{font-size:9.5pt;color:#444;margin-bottom:14px}hr{border:none;border-top:2px solid #1a1a1a;margin:0 0 12px}.section-title{font-size:11pt;font-weight:700;text-transform:uppercase;letter-spacing:2px;border-bottom:1.5px solid #333;padding-bottom:2px;margin:14px 0 8px}.summary{font-size:10.5pt;color:#222;line-height:1.55;margin-bottom:14px}.skills-row{margin-bottom:4px;font-size:10.5pt}.skills-row strong{color:#000}.job{margin-bottom:12px}.job-line1{display:flex;justify-content:space-between;margin-bottom:1px}.job-title{font-weight:700;font-size:11pt}.job-dates{font-size:9.5pt;color:#444}.job-company{font-size:10.5pt;color:#333;margin-bottom:3px}ul{padding-left:16px;margin:0}li{font-size:10.5pt;margin-bottom:2px;line-height:1.5}.edu-line1{display:flex;justify-content:space-between}.edu-degree{font-weight:700;font-size:10.5pt}.edu-dates{font-size:9.5pt;color:#444}.edu-school{font-size:10.5pt;color:#333}@media print{body{padding:0}}</style></head><body><h1>John Doe</h1><div class="contact">john.doe@email.com | (555) 123-4567 | San Francisco, CA | linkedin.com/in/johndoe</div><hr><div class="summary">Senior Frontend Engineer with 5+ years building high-performance React and TypeScript applications at scale. Experienced in architecting serverless microservices on AWS, implementing CI/CD pipelines with GitHub Actions, and mentoring cross-functional teams. Passionate about delivering exceptional user experiences through clean, type-safe code and modern frontend practices.</div><div class="section-title">Technical Skills</div><div class="skills-row"><strong>Languages:</strong> TypeScript, JavaScript (ES6+), HTML5, CSS3, Sass</div><div class="skills-row"><strong>Frameworks:</strong> React, Next.js, Node.js, Express, GraphQL</div><div class="skills-row"><strong>Tools & Cloud:</strong> Docker, AWS (Lambda, S3, CloudFront), GitHub Actions, Jest, Cypress</div><div class="section-title">Professional Experience</div><div class="job"><div class="job-line1"><span class="job-title">Senior Frontend Developer</span><span class="job-dates">Jan 2021 - Present</span></div><div class="job-company">TechCorp Inc., San Francisco, CA</div><ul><li>Architected and delivered 5+ production-grade React/TypeScript SPAs serving 50K+ daily active users, reducing page load times by 40% through code splitting and lazy loading</li><li>Implemented end-to-end CI/CD pipelines using GitHub Actions, achieving 99.9% deployment success rate and reducing release cycles from 2 weeks to daily</li><li>Containerized frontend development environment using Docker, streamlining onboarding from 2 hours to 15 minutes for new team members</li><li>Collaborated cross-functionally with product, design, and backend teams to deliver 20+ features aligned with business objectives</li></ul></div><div class="job"><div class="job-line1"><span class="job-title">Frontend Developer</span><span class="job-dates">Jun 2018 - Dec 2020</span></div><div class="job-company">StartupXYZ, Remote</div><ul><li>Developed responsive web applications using React and JavaScript, serving 15K+ monthly users across desktop and mobile platforms</li><li>Optimized application performance through implementing GraphQL APIs, reducing data overfetching by 60% and improving Core Web Vitals</li><li>Built comprehensive unit and integration test suites using Jest and Cypress, achieving 85% code coverage</li></ul></div><div class="section-title">Education</div><div class="edu-line1"><span class="edu-degree">B.S. Computer Science</span><span class="edu-dates">2018</span></div><div class="edu-school">State University</div><div class="section-title">Certifications</div><div style="font-size:10.5pt">AWS Certified Developer Associate | Google Analytics Certified</div></body></html>`;

const DEMO_RESULT = {
  score:68,matched_keywords:["React","JavaScript","Git","REST APIs","Agile","CSS","HTML"],missing_keywords:["TypeScript","GraphQL","CI/CD","Docker","AWS","Next.js","Jest"],
  suggestions:["Add TypeScript prominently","Include CI/CD experience","Mention containerization","Add cloud experience","Quantify achievements"],
  score_breakdown:{keyword_match:58,skills_alignment:65,experience_relevance:75,formatting:90},
  jd_analysis:{hard_skills:[{skill:"TypeScript",frequency_score:6},{skill:"React",frequency_score:5},{skill:"Node.js",frequency_score:4}],soft_skills:["Collaboration","Communication","Problem-solving"],certifications:["AWS Certified Developer"],tools_tech:["React","TypeScript","Node.js","GraphQL","Docker","Jest","GitHub Actions"],industry_terms:["microservices","serverless","SPA","SSR"],action_verbs:["Architect","Implement","Optimize","Collaborate","Deliver"]},
  keyword_variations:{"TypeScript":["TS","typed JavaScript"],"CI/CD":["continuous integration","build pipeline"],"Docker":["containerization","containers"]},
  ats_details:{skill_gaps:[{skill:"TypeScript",importance:"critical",suggestion:"Add to skills and bullets"},{skill:"Docker",importance:"high",suggestion:"Mention containerization"}],format_issues:["Add Technical Skills section","Use standard headers"]},
  optimized_bullets:[
    {
      original:"Built web applications using React",
      improved:"Architected 5+ production React/TypeScript SPAs serving 50K+ users, reducing load times by 40%",
      keywords_added:["TypeScript","SPA"],
      improvement_notes:"Aktionsverb gestärkt, TypeScript und messbare Ergebnisse ergänzt",
      diff_segments:[
        {type:"remove",text:"Built web applications"},
        {type:"add",text:"Architected 5+ production React/TypeScript SPAs serving 50K+ users, reducing load times by 40%"},
        {type:"remove",text:" using React"}
      ]
    },
    {
      original:"Worked with team to deploy features",
      improved:"Collaborated cross-functionally to deploy 20+ features via CI/CD pipelines (GitHub Actions), achieving 99.9% uptime",
      keywords_added:["CI/CD","GitHub Actions"],
      improvement_notes:"CI/CD und GitHub Actions eingebaut, Ergebnis quantifiziert",
      diff_segments:[
        {type:"remove",text:"Worked with team"},
        {type:"add",text:"Collaborated cross-functionally"},
        {type:"keep",text:" to deploy "},
        {type:"add",text:"20+ features via CI/CD pipelines (GitHub Actions), achieving 99.9% uptime"},
        {type:"remove",text:"features"}
      ]
    },
    {
      original:"Analyzed sales data to create reports",
      improved:"Analyzed sales data using SQL to create automated reports, reducing manual effort by 3h/week",
      keywords_added:["SQL"],
      improvement_notes:"SQL als Methode ergänzt, Zeitersparnis quantifiziert",
      diff_segments:[
        {type:"keep",text:"Analyzed sales data "},
        {type:"add",text:"using SQL "},
        {type:"keep",text:"to create "},
        {type:"add",text:"automated "},
        {type:"keep",text:"reports"},
        {type:"add",text:", reducing manual effort by 3h/week"}
      ]
    }
  ],
  new_bullets_suggested:[{bullet:"Containerized frontend build with Docker, cutting setup time from 2hr to 15min",reason:"Addresses Docker gap",keywords_covered:["Docker"]}],
  optimization_plan:{optimized_summary:"Senior Frontend Engineer with 5+ years building high-performance React and TypeScript applications at scale.",skills_section_fix:{add_skills:["TypeScript","GraphQL","Docker","Jest"],remove_skills:["jQuery"],suggested_categories:[{category:"Languages",skills:["TypeScript","JavaScript","HTML5","CSS3"]},{category:"Frameworks",skills:["React","Next.js","Node.js"]},{category:"Tools",skills:["Docker","AWS","GitHub Actions","Jest"]}]},formatting_recommendations:["Move Skills below summary","Use standard headers"],final_action_items:[{priority:1,action:"Add TypeScript to skills AND 3+ bullets",impact:"high"},{priority:2,action:"Create categorized Technical Skills section",impact:"high"},{priority:3,action:"Rewrite summary with JD keywords",impact:"high"},{priority:4,action:"Add Docker and CI/CD to bullets",impact:"medium"},{priority:5,action:"Quantify every achievement",impact:"medium"}]},
  optimized_resume_html: DEMO_HTML,
  injection_report: {
    total_missing_keywords: 4,
    woven_into_bullets: 1,
    added_to_skills_section: 4,
    suggested_bullets_generated: 3,
    bullets_sanitized: 0,
    still_missing: [],
    verified: true,
    log: [
      {
        keyword: "GraphQL",
        category: "tools",
        note: "Could not be woven into an existing bullet — pick the option that best fits your experience and edit to add your own numbers/context.",
        options: [
          "Leveraged GraphQL to streamline API data fetching, reducing over-fetching by an estimated 40% and improving frontend response times across key product flows.",
          "Applied GraphQL schema design principles to consolidate multiple REST endpoints into a single query layer, cutting network requests and improving developer experience.",
          "Utilized GraphQL subscriptions to implement real-time data updates, enabling live dashboard functionality and improving user engagement metrics."
        ]
      },
      {
        keyword: "CI/CD",
        category: "hard",
        note: "Could not be woven into an existing bullet — pick the option that best fits your experience and edit to add your own numbers/context.",
        options: [
          "Implemented CI/CD pipelines to automate build, test, and deployment workflows, reducing manual release effort and improving deployment reliability across environments.",
          "Applied CI/CD best practices to establish a consistent release cadence, enabling the team to ship features faster with reduced rollback incidents.",
          "Utilized CI/CD tooling to enforce automated test gates before production deployments, contributing to a measurable reduction in post-release defects."
        ]
      },
      {
        keyword: "Docker",
        category: "tools",
        note: "Could not be woven into an existing bullet — pick the option that best fits your experience and edit to add your own numbers/context.",
        options: [
          "Leveraged Docker to containerize the development environment, ensuring consistent behaviour across local, staging, and production and cutting onboarding setup time significantly.",
          "Applied Docker-based containerization to package and deploy microservices independently, improving scalability and reducing environment-specific deployment issues.",
          "Utilized Docker Compose to orchestrate multi-service local environments, enabling the team to run the full stack locally without manual configuration overhead."
        ]
      }
    ]
  },
  cover_letter: {
    cover_letter: "I am excited to apply for the Senior Frontend Engineer position. With over 5 years of experience building high-performance React and TypeScript applications, I am confident in my ability to contribute meaningfully to your team.\n\nIn my current role at TechCorp, I architected 5+ production-grade SPAs serving 50K+ daily users, reducing load times by 40% through code splitting. I implemented CI/CD pipelines achieving 99.9% deployment success and containerized our development environment with Docker, cutting onboarding time from 2 hours to 15 minutes.\n\nWhile my background is primarily in frontend systems, I am eager to deepen my expertise in GraphQL and serverless AWS architectures — areas I have explored on personal projects and am enthusiastic to grow further in a professional context.\n\nI would welcome the opportunity to discuss how my skills align with your needs. I am available for an interview at your convenience and can be reached at john.doe@email.com.",
    greeting: "Dear Hiring Manager,",
    candidate_name: "John Doe",
    job_title: "Senior Frontend Engineer",
    company_name: null,
    keywords_included: ["React","TypeScript","CI/CD","Docker","SPA","AWS","GraphQL"],
    word_count: 178
  },
  cover_letter_html: null,
  cover_letter_filename: "John_Doe_Cover_Letter.html",
  keyword_frequency_table: [
    {keyword:"TypeScript",jd_count:6,resume_count:0,status:"missing",gap:6},
    {keyword:"React",jd_count:5,resume_count:4,status:"matched",gap:1},
    {keyword:"Docker",jd_count:4,resume_count:0,status:"missing",gap:4},
    {keyword:"Node.js",jd_count:4,resume_count:2,status:"matched",gap:2},
    {keyword:"GraphQL",jd_count:3,resume_count:0,status:"missing",gap:3},
    {keyword:"CI/CD",jd_count:3,resume_count:0,status:"missing",gap:3},
    {keyword:"AWS",jd_count:3,resume_count:1,status:"matched",gap:2},
    {keyword:"Jest",jd_count:2,resume_count:1,status:"matched",gap:1},
    {keyword:"GitHub Actions",jd_count:2,resume_count:1,status:"matched",gap:1},
    {keyword:"Collaboration",jd_count:2,resume_count:0,status:"missing",gap:2},
    {keyword:"Communication",jd_count:1,resume_count:0,status:"missing",gap:1},
    {keyword:"Architect",jd_count:2,resume_count:1,status:"matched",gap:1},
    {keyword:"Deliver",jd_count:2,resume_count:2,status:"matched",gap:0},
    {keyword:"Optimize",jd_count:1,resume_count:1,status:"matched",gap:0},
  ]
};

function Accordion({title,icon,color,children,defaultOpen=false}){const[open,setOpen]=useState(defaultOpen);return(<div className="accordion"><div className="accordion-header" onClick={()=>setOpen(!open)}><h3 style={{color:`var(--${color})`}}>{icon} {title}</h3><ChevronIcon open={open}/></div>{open&&<div className="accordion-body">{children}</div>}</div>)}
function ScoreRing({score,color}){const r=30,c=2*Math.PI*r,offset=c-(score/100)*c;return(<div className="score-ring"><svg width="72" height="72" viewBox="0 0 72 72"><circle className="bg" cx="36" cy="36" r={r} fill="none" strokeWidth="6"/><circle className="fg" cx="36" cy="36" r={r} fill="none" strokeWidth="6" stroke={color} strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"/></svg><div className="score-text" style={{color}}>{score}</div></div>)}

// ── Resume Preview with Keyword Highlights (side panel) ─────────────────
function ResumePreview({ html, matchedKeywords, missingKeywords, downloadAsDocx, saveAsPdf, downloadHtml }) {
  const [highlights, setHighlights] = useState(true);
  const [activeKw, setActiveKw]     = useState(null);
  const iframeRef = useRef(null);

  const buildHighlightedHtml = (rawHtml, matched, missing, active, on) => {
    if (!rawHtml) return '';
    let clean = rawHtml
      .replace(/<hr[^>]*>\s*<div[^>]*suggestions[\s\S]*?<\/body>/i, '</body>')
      .replace(/<div[^>]*page-break[\s\S]*?<\/body>/i, '</body>')
      .replace(/<div[^>]*suggestions-wrapper[\s\S]*?<\/div>\s*(<\/body>)/i, '$1');

    const highlightCss = `<style>
      mark.kw-m{background:rgba(0,206,201,0.2);color:inherit;border-radius:2px;padding:0 1px;border-bottom:2px solid rgba(0,206,201,0.55)}
      mark.kw-i{background:rgba(254,202,87,0.25);color:inherit;border-radius:2px;padding:0 1px;border-bottom:2px solid rgba(254,202,87,0.65)}
      mark.kw-active{background:rgba(108,92,231,0.3)!important;border-bottom-color:#6c5ce7!important;box-shadow:0 0 0 2px rgba(108,92,231,0.25)}
      ${!on ? 'mark{background:none!important;border:none!important;box-shadow:none!important}' : ''}
    </style>`;

    const bodyMatch = clean.match(/<body([^>]*)>([\s\S]*)<\/body>/i);
    if (!bodyMatch) return clean.replace('</head>', highlightCss + '</head>');
    let body = bodyMatch[2];

    const tags = [];
    let safe = body.replace(/<[^>]+>/g, t => { tags.push(t); return `\x00${tags.length-1}\x00`; });

    const allKws = [
      ...[...matched].sort((a,b)=>b.length-a.length).map(k=>({k,cls:'kw-m'})),
      ...[...missing].sort((a,b)=>b.length-a.length).map(k=>({k,cls:'kw-i'})),
    ];
    allKws.forEach(({k,cls}) => {
      if (!k||k.length<2) return;
      const esc = k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      const isActive = active&&k.toLowerCase()===active.toLowerCase();
      safe = safe.replace(new RegExp(`(${esc})`, 'gi'),
        `<mark class="${cls}${isActive?' kw-active':''}">$1</mark>`);
    });
    safe = safe.replace(/\x00(\d+)\x00/g, (_,i)=>tags[+i]);

    return clean
      .replace('</head>', highlightCss+'</head>')
      .replace(/<body([^>]*)>[\s\S]*<\/body>/i, `<body$1>${safe}</body>`);
  };

  const writeIframe = (content) => {
    const f = iframeRef.current;
    if (!f) return;
    const doc = f.contentDocument||f.contentWindow?.document;
    if (!doc) return;
    doc.open(); doc.write(content); doc.close();
    setTimeout(()=>{ try{ const h=doc.body?.scrollHeight; if(h) f.style.height=(h+30)+'px'; }catch(e){} }, 150);
  };

  const scrollTo = (kw) => {
    const next = activeKw===kw ? null : kw;
    setActiveKw(next);
    if (!next) return;
    setTimeout(()=>{
      try{
        const f=iframeRef.current;
        const doc=f?.contentDocument||f?.contentWindow?.document;
        doc?.querySelector('mark.kw-active')?.scrollIntoView({behavior:'smooth',block:'center'});
      }catch(e){}
    }, 80);
  };

  useEffect(()=>{
    writeIframe(buildHighlightedHtml(html, matchedKeywords, missingKeywords, activeKw, highlights));
  }, [highlights, activeKw, html]); // eslint-disable-line

  const total = (matchedKeywords||[]).length + (missingKeywords||[]).length;

  return (
    <div className="resume-preview-wrap">
      <div className="resume-preview-bar">
        <div className="resume-preview-title">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Resume Preview
          {highlights&&<span className="kw-count-badge">{total} keywords</span>}
        </div>
        <button className={`highlight-toggle ${highlights?'on':''}`} onClick={()=>{setHighlights(h=>!h);setActiveKw(null);}}>
          <span className="toggle-dot"/>
          {highlights?'Highlights ON':'Highlights OFF'}
        </button>
      </div>

      {highlights&&(
        <div className="resume-legend">
          <div className="resume-legend-item">
            <span className="resume-legend-dot" style={{background:'rgba(0,206,201,0.35)',border:'1.5px solid rgba(0,206,201,0.6)'}}/>
            <span>Matched</span>
          </div>
          <div className="resume-legend-item">
            <span className="resume-legend-dot" style={{background:'rgba(254,202,87,0.35)',border:'1.5px solid rgba(254,202,87,0.65)'}}/>
            <span>Injected</span>
          </div>
          {activeKw&&(
            <div className="resume-legend-item" style={{color:'var(--accent-light)'}}>
              <span className="resume-legend-dot" style={{background:'rgba(108,92,231,0.35)',border:'1.5px solid rgba(108,92,231,0.6)'}}/>
              <span>→ {activeKw}</span>
              <button onClick={()=>setActiveKw(null)} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',padding:'0 4px',fontSize:11}}>✕</button>
            </div>
          )}
        </div>
      )}

      {highlights&&(
        <div className="kw-strip">
          {(matchedKeywords||[]).map((kw,i)=>(
            <button key={i} className={`kw-pill matched ${activeKw===kw?'active':''}`} onClick={()=>scrollTo(kw)}>{kw}</button>
          ))}
          {(missingKeywords||[]).map((kw,i)=>(
            <button key={i} className={`kw-pill injected ${activeKw===kw?'active':''}`} onClick={()=>scrollTo(kw)}>{kw}</button>
          ))}
        </div>
      )}

      <div className="resume-iframe-wrap">
        <iframe ref={iframeRef} title="Resume" sandbox="allow-same-origin"
          style={{width:'100%',minHeight:500,border:'none',display:'block'}}/>
      </div>

      <div className="resume-dl-bar">
        <span style={{fontSize:10,color:'var(--text-muted)',fontFamily:"'Space Mono',monospace",letterSpacing:.5}}>DOWNLOAD</span>
        <button className="dl-btn primary" style={{fontSize:11,padding:'7px 14px'}} onClick={()=>downloadAsDocx(html)}><FileTextIcon/> .DOC</button>
        <button className="dl-btn secondary" style={{fontSize:11,padding:'7px 14px'}} onClick={()=>saveAsPdf(html)}><PdfIcon/> PDF</button>
        <button className="dl-btn tertiary" style={{fontSize:11,padding:'7px 14px'}} onClick={()=>downloadHtml(html)}><DownloadIcon/> HTML</button>
      </div>
    </div>
  );
}

// ── Inline Diff Bullet — Jobscan-style ──────────────────────────────────
function InlineDiffBullet({ bullet }) {
  const [copied, setCopied] = useState(false);

  // Build diff segments: use AI-provided diff_segments if present,
  // otherwise fall back to a simple whole-bullet diff
  const segments = bullet.diff_segments && bullet.diff_segments.length > 0
    ? bullet.diff_segments
    : buildFallbackDiff(bullet.original || '', bullet.improved || '');

  function buildFallbackDiff(orig, improved) {
    // Word-level diff fallback when AI doesn't return diff_segments
    const origWords  = orig.trim().split(/(\s+)/);
    const impWords   = improved.trim().split(/(\s+)/);

    // Find longest common prefix
    let prefixLen = 0;
    while (prefixLen < origWords.length && prefixLen < impWords.length &&
           origWords[prefixLen] === impWords[prefixLen]) prefixLen++;

    // Find longest common suffix (from end)
    let suffixLenO = origWords.length, suffixLenI = impWords.length;
    while (suffixLenO > prefixLen && suffixLenI > prefixLen &&
           origWords[suffixLenO-1] === impWords[suffixLenI-1]) {
      suffixLenO--; suffixLenI--;
    }

    const segs = [];
    if (prefixLen > 0)
      segs.push({ type: 'keep', text: origWords.slice(0, prefixLen).join('') });
    if (suffixLenO > prefixLen)
      segs.push({ type: 'remove', text: origWords.slice(prefixLen, suffixLenO).join('') });
    if (suffixLenI > prefixLen)
      segs.push({ type: 'add', text: impWords.slice(prefixLen, suffixLenI).join('') });
    if (suffixLenO < origWords.length)
      segs.push({ type: 'keep', text: origWords.slice(suffixLenO).join('') });

    return segs.length > 1 ? segs : [{ type: 'keep', text: improved }];
  }

  const hasChanges = segments.some(s => s.type !== 'keep');

  const copy = () => {
    navigator.clipboard.writeText(bullet.improved || bullet.original).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="diff-bullet-block" onClick={copy} title="Klicken um zu kopieren">
      {/* Keyword badges */}
      {(bullet.keywords_added||[]).length > 0 && (
        <div style={{display:'flex',gap:4,marginBottom:8,flexWrap:'wrap'}}>
          {bullet.keywords_added.map((k,i) => (
            <span key={i} className="tag green" style={{fontSize:10,padding:'2px 8px'}}>+{k}</span>
          ))}
        </div>
      )}

      {/* Inline diff render */}
      <div className="diff-text">
        {segments.map((seg, i) => {
          if (seg.type === 'keep')   return <span key={i} className="diff-keep">{seg.text}</span>;
          if (seg.type === 'remove') return <span key={i} className="diff-remove">{seg.text}</span>;
          if (seg.type === 'add')    return <span key={i} className="diff-add">{seg.text}</span>;
          return null;
        })}
      </div>

      {/* Note */}
      {bullet.improvement_notes && (
        <div className="diff-note">{bullet.improvement_notes}</div>
      )}

      {/* Copy feedback */}
      <div className={`diff-copy-hint ${copied ? 'copied' : ''}`}>
        {copied
          ? <><CheckIcon/> Kopiert!</>
          : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Kopieren</>
        }
      </div>
    </div>
  );
}

// ── Suggested Bullets Section Component ─────────────────────────────────
function SuggestedBulletsSection({ injectionReport }) {
  const [open, setOpen] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState(null); // "blockIdx-optIdx"

  // Pull suggestions from injection_report.log — entries generated by generateBulletSuggestions
  // Format: { keyword, options: [...], note, category }
  // Also support direct suggested_bullets array on the result if backend sends it
  const suggestions = injectionReport?.suggested_bullets_generated > 0
    ? (injectionReport?.log || [])
        .filter(entry => Array.isArray(entry.options) && entry.options.length > 0)
    : [];

  if (!suggestions.length) return null;

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(key);
      setTimeout(() => setCopiedIdx(null), 2000);
    });
  };

  const catClass = (cat) => {
    if (!cat) return 'hard';
    const c = cat.toLowerCase();
    if (c.includes('tool') || c.includes('tech')) return 'tools';
    if (c.includes('soft') || c.includes('competenc') || c.includes('kern')) return 'soft';
    if (c.includes('industry') || c.includes('branch') || c.includes('domain')) return 'industry';
    return 'hard';
  };

  const catLabel = (cat) => {
    if (!cat) return 'skill';
    const c = cat.toLowerCase();
    if (c.includes('tool') || c.includes('tech')) return 'tool';
    if (c.includes('soft') || c.includes('competenc')) return 'soft skill';
    if (c.includes('industry') || c.includes('branch')) return 'industry';
    return 'hard skill';
  };

  return (
    <div className="sugg-section" style={{marginTop:8}}>
      <div className="sugg-section-header" onClick={() => setOpen(!open)}>
        <div className="sugg-section-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Suggested Bullets to Add
          <span className="sugg-badge">{suggestions.length} keyword{suggestions.length !== 1 ? 's' : ''}</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:11,fontFamily:"'Space Mono',monospace",color:'var(--text-muted)',letterSpacing:.5}}>
            CLICK OPTION TO COPY
          </span>
          <ChevronIcon open={open}/>
        </div>
      </div>

      {open && (
        <div className="sugg-section-body">
          <div className="sugg-section-desc">
            These keywords couldn't be naturally woven into your existing bullets.
            Pick the option closest to something you've actually done — edit in your own numbers/context — then paste it into the right job on your resume.
          </div>

          {suggestions.map((item, blockIdx) => (
            <div className="sugg-keyword-block" key={blockIdx}>
              <div className="sugg-keyword-header">
                <span className="sugg-keyword-name">{item.keyword}</span>
                <span className={`sugg-keyword-cat ${catClass(item.category)}`}>
                  {catLabel(item.category)}
                </span>
                {item.note && (
                  <span className="sugg-note" style={{marginBottom:0,marginLeft:4}}></span>
                )}
              </div>
              <div className="sugg-options">
                {(item.options || []).map((opt, optIdx) => {
                  const key = `${blockIdx}-${optIdx}`;
                  const isCopied = copiedIdx === key;
                  return (
                    <button
                      key={optIdx}
                      className={`sugg-option ${isCopied ? 'copied' : ''}`}
                      onClick={() => copyToClipboard(opt, key)}
                    >
                      <span className="sugg-option-num">{optIdx + 1}</span>
                      <span className="sugg-option-text">{opt}</span>
                      <span className="sugg-option-copy">
                        {isCopied ? (
                          <span style={{color:'var(--green)',display:'flex',alignItems:'center',gap:4}}>
                            <CheckIcon/> Copied
                          </span>
                        ) : 'Copy'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResumeOptimizer(){
  const[file,setFile]=useState(null);const[jobDesc,setJobDesc]=useState("");const[webhookUrl,setWebhookUrl]=useState(N8N_WEBHOOK_URL);const[loading,setLoading]=useState(false);const[result,setResult]=useState(null);const[error,setError]=useState(null);const[dragging,setDragging]=useState(false);const[pipelineStep,setPipelineStep]=useState(0);const fileInputRef=useRef(null);const isReady=file&&jobDesc.trim().length>20;

  const handleDrop=useCallback((e)=>{e.preventDefault();setDragging(false);const f=e.dataTransfer.files[0];if(f&&(f.type==="application/pdf"||f.name.match(/\.docx?$/i))){setFile(f);setError(null)}else setError("Please upload a PDF or Word document.")},[]);

  // Download as DOCX (Word-compatible HTML wrapped in .doc)
  const downloadAsDocx=(htmlContent)=>{
    const docContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset="UTF-8"><!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->${htmlContent.match(/<style[\s\S]*?<\/style>/)?.[0] || ''}</head><body>${htmlContent.match(/<body[\s\S]*?<\/body>/)?.[0]?.replace(/<\/?body>/g,'') || htmlContent}</body></html>`;
    const blob = new Blob(['\ufeff', docContent], {type:'application/msword'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href=url;a.download='Optimized_Resume.doc';
    document.body.appendChild(a);a.click();
    document.body.removeChild(a);URL.revokeObjectURL(url);
  };

  // Save as PDF via print dialog
  const saveAsPdf=(htmlContent)=>{
    const w=window.open('','_blank','width=800,height=1100');
    w.document.write(htmlContent + '<script>setTimeout(function(){window.print()},400)<\/script>');
    w.document.close();
  };

  // Download raw HTML
  const downloadHtml=(htmlContent, filename='Optimized_Resume.html')=>{
    const blob=new Blob([htmlContent],{type:'text/html'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=filename;
    document.body.appendChild(a);a.click();
    document.body.removeChild(a);URL.revokeObjectURL(url);
  };

  const analyze=async()=>{
    if(!isReady)return;setLoading(true);setError(null);setResult(null);setPipelineStep(1);
    if(!webhookUrl||webhookUrl==="YOUR_N8N_WEBHOOK_URL_HERE"){for(let i=2;i<=7;i++){await new Promise(r=>setTimeout(r,600));setPipelineStep(i)}setResult(DEMO_RESULT);setLoading(false);return}
    try{const fd=new FormData();fd.append("resume",file);fd.append("job_description",jobDesc);setPipelineStep(2);const res=await fetch(webhookUrl,{method:"POST",body:fd});setPipelineStep(5);if(!res.ok)throw new Error(`Webhook returned ${res.status}`);const data=await res.json();setPipelineStep(7);setResult(data)}catch(err){setError(`Connection failed: ${err.message}`)}finally{setLoading(false)}
  };

  const scoreColor=(s)=>s>=80?"var(--green)":s>=50?"var(--yellow)":"var(--red)";
  const pipelineLabels=["Upload","JD Analysis","Synonyms","ATS Score","Bullet Opt.","Final Plan","Resume Gen"];
  const r=result;const bd=r?.score_breakdown||{};const plan=r?.optimization_plan||{};
  const hasResume = r?.optimized_resume_html;

  return(
    <><style>{styles}</style>
    <div className="app">
      <div className="header">
        <div className="header-badge"><SparkleIcon size={12}/> ATS Resume Optimizer</div>
        <h1>Beat the ATS.<br/>Land the Interview.</h1>
        <p>Drop your resume, paste the job description, and get a 6-stage AI analysis with a fully rewritten, downloadable resume.</p>
      </div>

      <div className="input-grid">
        <div>
          <div className="section-label"><span className="num">1</span> Your Resume</div>
          {!file?(<div className={`drop-zone ${dragging?"dragging":""}`} onDragOver={e=>{e.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={handleDrop} onClick={()=>fileInputRef.current?.click()}>
            <input type="file" ref={fileInputRef} accept=".pdf,.doc,.docx" onChange={e=>{if(e.target.files[0]){setFile(e.target.files[0]);setError(null)}}}/>
            <div className="icon"><UploadIcon/></div><div className="label">Drag & drop your resume</div><div className="sublabel">PDF or DOCX — up to 10MB</div>
          </div>):(<div className="file-preview"><div className="file-icon-wrap"><DocIcon/></div><div className="file-info"><div className="name">{file.name}</div><div className="size">{(file.size/1024).toFixed(1)} KB</div></div><button className="file-remove" onClick={()=>{setFile(null);setResult(null)}}><TrashIcon/></button></div>)}
        </div>
        <div>
          <div className="section-label"><span className="num">2</span> Job Description</div>
          <div className="jd-box"><textarea placeholder={"Paste the full job description here...\n\nInclude requirements, qualifications, and responsibilities."} value={jobDesc} onChange={e=>setJobDesc(e.target.value)}/><div className="char-count">{jobDesc.length} chars</div></div>
        </div>
      </div>

      <div className="webhook-config" style={{maxWidth:1120,marginLeft:'auto',marginRight:'auto'}}><div className="section-label"><span className="num">3</span> n8n Webhook URL</div><div className="webhook-input-row"><input type="url" placeholder="http://localhost:5678/webhook-test/resume-optimizer" value={webhookUrl==="YOUR_N8N_WEBHOOK_URL_HERE"?"":webhookUrl} onChange={e=>setWebhookUrl(e.target.value)}/></div></div>

      <div style={{maxWidth:1120,marginLeft:'auto',marginRight:'auto',display:'flex',gap:12,flexDirection:'column'}}>
        <button className={`analyze-btn ${loading?"loading":isReady?"ready":"disabled"}`} onClick={analyze} disabled={!isReady||loading}>
          {loading?(<><div className="loader"><span/><span/><span/></div> Running 6-stage ATS analysis...</>):(<><SparkleIcon size={18}/> Analyze & Optimize Resume</>)}
        </button>
        <button style={{width:'100%',padding:'11px',border:'1px dashed var(--border)',borderRadius:'var(--radius)',background:'transparent',color:'var(--text-dim)',fontSize:13,fontFamily:"'DM Sans',sans-serif",cursor:'pointer',transition:'all .2s',display:'flex',alignItems:'center',justifyContent:'center',gap:8}} onClick={()=>setResult(DEMO_RESULT)}
          onMouseOver={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}}
          onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-dim)'}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Load demo — preview the full results UI instantly
        </button>
      </div>

      {loading&&(<div className="pipeline">{pipelineLabels.map((s,i)=>(<div key={s} style={{display:"flex",alignItems:"center"}}><div className={`pipeline-step ${pipelineStep===i+1?"active":pipelineStep>i+1?"done":""}`}>{pipelineStep>i+1?<CheckIcon/>:(i+1)} {s}</div>{i<pipelineLabels.length-1&&<span className="pipeline-arrow">›</span>}</div>))}</div>)}
      {error&&<div className="error-banner">{error}</div>}

      {r&&(<div className="results">
        <div className="results-header">
          <h2>ATS Analysis Report</h2>
          <div className="score-ring-wrap"><ScoreRing score={r.score} color={scoreColor(r.score)}/><div><div style={{fontFamily:"'Space Mono',monospace",fontSize:12,color:"var(--text-dim)",letterSpacing:1,textTransform:"uppercase"}}>ATS Score</div><div style={{fontSize:13,color:"var(--text-dim)",marginTop:2}}>{r.score>=80?"Strong match":r.score>=50?"Needs improvement":"Significant gaps"}</div></div></div>
        </div>

        <div className="split-layout">
          {/* ── LEFT: Analysis column ── */}
          <div className="analysis-col">

            {Object.keys(bd).length>0&&(<div className="score-bars">{[{key:"keyword_match",label:"Keywords"},{key:"skills_alignment",label:"Skills"},{key:"experience_relevance",label:"Experience"},{key:"formatting",label:"Formatting"}].map(({key,label})=>(<div className="score-bar-card" key={key}><div className="bar-label">{label}</div><div className="bar-track"><div className="bar-fill" style={{width:`${bd[key]||0}%`,background:scoreColor(bd[key]||0)}}/></div><div className="bar-val" style={{color:scoreColor(bd[key]||0)}}>{bd[key]||0}%</div></div>))}</div>)}

            <div className="findings-grid">
              <div className="card"><h3 className="green"><CheckIcon/> Matched ({(r.matched_keywords||[]).length})</h3><div className="tag-list">{(r.matched_keywords||[]).map((k,i)=><span key={i} className="tag green">{k}</span>)}</div></div>
              <div className="card"><h3 className="red"><XIcon/> Missing ({(r.missing_keywords||[]).length})</h3><div className="tag-list">{(r.missing_keywords||[]).map((k,i)=><span key={i} className="tag red">{k}</span>)}</div></div>
            </div>

            {(r.keyword_frequency_table||[]).length>0&&(
              <KeywordFrequencyTable data={r.keyword_frequency_table}/>
            )}

            {r.jd_analysis&&(<Accordion title="Stage 1 — JD Analysis" icon="01" color="blue"><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginTop:4}}><div><div style={{fontSize:11,fontFamily:"'Space Mono',monospace",color:"var(--blue)",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Hard Skills</div><div className="tag-list">{(r.jd_analysis.hard_skills||[]).map((s,i)=><span key={i} className="tag blue">{typeof s==='string'?s:`${s.skill} (${s.frequency_score})`}</span>)}</div></div><div><div style={{fontSize:11,fontFamily:"'Space Mono',monospace",color:"var(--accent-light)",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Soft Skills</div><div className="tag-list">{(r.jd_analysis.soft_skills||[]).map((s,i)=><span key={i} className="tag accent">{s}</span>)}</div></div><div><div style={{fontSize:11,fontFamily:"'Space Mono',monospace",color:"var(--yellow)",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Tools & Tech</div><div className="tag-list">{(r.jd_analysis.tools_tech||[]).map((s,i)=><span key={i} className="tag yellow">{s}</span>)}</div></div><div><div style={{fontSize:11,fontFamily:"'Space Mono',monospace",color:"var(--text-dim)",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Industry Terms</div><div className="tag-list">{(r.jd_analysis.industry_terms||[]).map((s,i)=><span key={i} className="tag neutral">{s}</span>)}</div></div></div>{(r.jd_analysis.action_verbs||[]).length>0&&(<div style={{marginTop:16}}><div style={{fontSize:11,fontFamily:"'Space Mono',monospace",color:"var(--green)",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Action Verbs</div><div className="tag-list">{r.jd_analysis.action_verbs.map((v,i)=><span key={i} className="tag green">{v}</span>)}</div></div>)}</Accordion>)}

            {r.keyword_variations&&Object.keys(r.keyword_variations).length>0&&(<Accordion title="Stage 2 — Keyword Variations" icon="02" color="accent-light"><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:4}}>{Object.entries(r.keyword_variations).map(([kw,vars])=>(<div key={kw} style={{background:"var(--surface-2)",borderRadius:8,padding:12}}><div style={{fontWeight:600,fontSize:13,marginBottom:6,color:"var(--accent-light)"}}>{kw}</div><div className="tag-list">{(vars||[]).map((v,i)=><span key={i} className="tag neutral">{v}</span>)}</div></div>))}</div></Accordion>)}

            {r.ats_details&&(<Accordion title="Stage 3 — ATS Match" icon="03" color="yellow">{(r.ats_details.skill_gaps||[]).length>0&&(<div style={{marginBottom:16}}><div style={{fontSize:11,fontFamily:"'Space Mono',monospace",color:"var(--red)",letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Skill Gaps</div><ul className="item-list">{r.ats_details.skill_gaps.map((g,i)=>(<li key={i}><span className={`tag ${g.importance==='critical'?'red':'yellow'}`} style={{fontSize:10,padding:"2px 8px"}}>{g.importance}</span><span><strong>{g.skill}</strong> — {g.suggestion}</span></li>))}</ul></div>)}{(r.ats_details.format_issues||[]).length>0&&(<div><div style={{fontSize:11,fontFamily:"'Space Mono',monospace",color:"var(--yellow)",letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Format Issues</div><ul className="item-list">{r.ats_details.format_issues.map((f,i)=><li key={i}><span style={{color:"var(--yellow)"}}>!</span> {f}</li>)}</ul></div>)}</Accordion>)}

            {(r.optimized_bullets||[]).length>0&&(
              <Accordion title="Stage 4 — Suggested Edits" icon="04" color="green" defaultOpen={true}>
                <div style={{fontSize:12,color:'var(--text-dim)',marginBottom:16,lineHeight:1.6,padding:'10px 14px',background:'rgba(0,206,201,0.04)',borderLeft:'2px solid rgba(0,206,201,0.3)',borderRadius:'0 6px 6px 0'}}>
                  Minimal surgical edits to your real bullets. <span style={{color:'var(--red)',textDecoration:'line-through',opacity:.7}}>Red</span> = removed, <span style={{color:'var(--green)'}}>Green</span> = added. Click to copy.
                </div>
                {r.optimized_bullets.filter(b=>b.improved&&b.improved!==b.original).map((b,i)=>(
                  <InlineDiffBullet key={i} bullet={b}/>
                ))}
                {r.optimized_bullets.every(b=>!b.improved||b.improved===b.original)&&(
                  <div style={{color:'var(--text-dim)',fontSize:13,padding:12}}>All bullets are already well-optimised for this JD.</div>
                )}
                {(r.new_bullets_suggested||[]).length>0&&(
                  <div style={{marginTop:20}}>
                    <div style={{fontSize:11,fontFamily:"'Space Mono',monospace",color:"var(--blue)",letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>New bullets suggested</div>
                    <ul className="item-list">
                      {r.new_bullets_suggested.map((b,i)=>(
                        <li key={i}>
                          <span style={{color:"var(--blue)"}}><ArrowRightIcon/></span>
                          <div>
                            <div style={{fontSize:13,lineHeight:1.6}}>{b.bullet}</div>
                            <div style={{fontSize:11,color:"var(--text-dim)",marginTop:4}}>{b.reason}</div>
                            {(b.keywords_covered||[]).length>0&&<div style={{marginTop:4,display:'flex',gap:4,flexWrap:'wrap'}}>{b.keywords_covered.map((k,j)=><span key={j} className="tag green" style={{fontSize:10,padding:'2px 8px'}}>+{k}</span>)}</div>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Accordion>
            )}

            {r.injection_report&&<SuggestedBulletsSection injectionReport={r.injection_report}/>}

            {plan.optimized_summary&&(<div className="summary-box"><h3><SparkleIcon size={16}/> Optimized Summary</h3><p>{plan.optimized_summary}</p></div>)}

            {plan.skills_section_fix?.suggested_categories&&(<Accordion title="Stage 5 — Skills Reorganization" icon="05" color="accent-light">{(plan.skills_section_fix.add_skills||[]).length>0&&(<div style={{marginBottom:12}}><div style={{fontSize:11,fontFamily:"'Space Mono',monospace",color:"var(--green)",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Add</div><div className="tag-list">{plan.skills_section_fix.add_skills.map((s,i)=><span key={i} className="tag green">+ {s}</span>)}</div></div>)}{(plan.skills_section_fix.remove_skills||[]).length>0&&(<div style={{marginBottom:12}}><div style={{fontSize:11,fontFamily:"'Space Mono',monospace",color:"var(--red)",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Remove</div><div className="tag-list">{plan.skills_section_fix.remove_skills.map((s,i)=><span key={i} className="tag red">- {s}</span>)}</div></div>)}<div style={{fontSize:11,fontFamily:"'Space Mono',monospace",color:"var(--accent-light)",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Layout</div><div className="skills-grid">{plan.skills_section_fix.suggested_categories.map((cat,i)=>(<div key={i} style={{background:"var(--surface-2)",borderRadius:8,padding:12}}><div style={{fontWeight:600,fontSize:12,marginBottom:6}}>{cat.category}</div><div className="tag-list">{cat.skills.map((s,j)=><span key={j} className="tag neutral">{s}</span>)}</div></div>))}</div></Accordion>)}

            {(plan.final_action_items||[]).length>0&&(<div className="card" style={{marginTop:8}}><h3 className="accent"><SparkleIcon size={14}/> Action Items</h3>{plan.final_action_items.map((item,i)=>(<div className="action-item" key={i}><div className={`action-num ${item.impact||'medium'}`}>{item.priority||i+1}</div><div><div className="action-text">{item.action}</div><div className="action-impact" style={{color:item.impact==='high'?'var(--red)':item.impact==='medium'?'var(--yellow)':'var(--green)'}}>{item.impact} impact</div></div></div>))}</div>)}

            {r.cover_letter&&(<div className="cover-letter-section">
              <h3>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Cover Letter
              </h3>
              <div className="cl-meta">
                {r.cover_letter.job_title&&<span>Role: {r.cover_letter.job_title}</span>}
                {r.cover_letter.word_count&&<span>Words: {r.cover_letter.word_count}</span>}
                {r.cover_letter.keywords_included&&<span>Keywords: {r.cover_letter.keywords_included.length} included</span>}
              </div>
              <div className="cl-body">
                <div style={{marginBottom:14,fontWeight:500}}>{r.cover_letter.greeting}</div>
                {Array.isArray(r.cover_letter.cover_letter_paragraphs)&&r.cover_letter.cover_letter_paragraphs.length>0
                  ?r.cover_letter.cover_letter_paragraphs.map((para,i)=><p key={i} style={{margin:'0 0 14px 0',lineHeight:1.75,textAlign:'justify'}}>{para}</p>)
                  :(r.cover_letter.cover_letter||'').split('\n\n').filter(Boolean).map((para,i)=><p key={i} style={{margin:'0 0 14px 0',lineHeight:1.75,textAlign:'justify'}}>{para}</p>)
                }
                <div style={{marginTop:16,marginBottom:4}}>Warm regards,</div>
                <div style={{fontWeight:700}}>{r.cover_letter.candidate_name}</div>
              </div>
              {(r.cover_letter.keywords_included||[]).length>0&&(
                <div>
                  <div style={{fontSize:10,fontFamily:"'Space Mono',monospace",color:"var(--yellow)",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Keywords included</div>
                  <div className="cl-keywords">{r.cover_letter.keywords_included.map((k,i)=><span key={i} className="tag yellow">{k}</span>)}</div>
                </div>
              )}
              {r.cover_letter_html&&(
                <div style={{marginTop:16,display:'flex',gap:10,flexWrap:'wrap'}}>
                  <button className="dl-btn cover" style={{fontSize:13,padding:'10px 20px'}} onClick={()=>downloadHtml(r.cover_letter_html,r.cover_letter_filename||'Cover_Letter.html')}><DownloadIcon/> Download Cover Letter</button>
                  <button className="dl-btn tertiary" style={{fontSize:13,padding:'10px 20px'}} onClick={()=>saveAsPdf(r.cover_letter_html)}><PdfIcon/> Save as PDF</button>
                </div>
              )}
            </div>)}

          </div>{/* end analysis-col */}

          {/* ── RIGHT: Sticky resume preview column ── */}
          {hasResume&&(
            <div className="resume-col">
              <ResumePreview
                html={r.optimized_resume_html}
                matchedKeywords={r.matched_keywords||[]}
                missingKeywords={r.missing_keywords||[]}
                downloadAsDocx={downloadAsDocx}
                saveAsPdf={saveAsPdf}
                downloadHtml={downloadHtml}
              />
            </div>
          )}

        </div>{/* end split-layout */}
      </div>)}
  );
}
