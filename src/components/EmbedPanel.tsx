'use client';
import { useId, useRef, useState } from 'react';
import SiteLink from './SiteLink';
import { embedCode, embedHeights, embedTool, embedURL, validEmbedHeight, type EmbedTheme } from '@/lib/embed-code';
export default function EmbedPanel({id}: {id: string}) {
  const tool = embedTool(id)!;
  const themeId=useId(),heightId=useId(),codeId=useId();
  const [theme, setTheme] = useState<EmbedTheme>('light'), [preset,setPreset]=useState(String(tool.height)),[custom,setCustom]=useState(String(tool.height));
  const [preview, setPreview] = useState(false), [status, setStatus] = useState('');
  const height=preset==='custom'?Number(custom):Number(preset),valid=(preset!=='custom'||custom.trim()!=='')&&validEmbedHeight(height);
  const code = valid?embedCode(id, theme, height):'', field = useRef<HTMLTextAreaElement>(null),customId=useId();
  async function copy() {
    if(!valid)return;
    try { await navigator.clipboard.writeText(code); setStatus('Embed code copied.'); }
    catch { field.current?.focus(); field.current?.select(); setStatus('Select and copy the code below.'); }
  }
  const previewPath = new URL(embedURL(id, theme)).pathname + '?theme=' + theme;
  return <div className="embed-options">
    <div className="result-actions embed-quick-actions"><button type="button" disabled={!valid} onClick={copy}>Copy embed code</button><button type="button" disabled={!valid} aria-expanded={preview&&valid} onClick={()=>setPreview(!preview)}>{preview&&valid?'Hide preview':'Show preview'}</button></div>
    {status&&<p role="status">{status}</p>}
    <p>Add this interactive calculator to your website. Free for personal and commercial blog use, with no fees and no ads in the embedded calculator. No account is needed.</p>
    <p>The embed starts with example values; your current inputs and results are not included.</p>
    <label htmlFor={themeId}>Appearance</label><select id={themeId} value={theme} onChange={e=>{setTheme(e.target.value as EmbedTheme);setStatus('');}}><option value="light">Light</option><option value="dark">Dark Pro</option></select>
    <label htmlFor={heightId}>Frame height</label><select id={heightId} value={preset} onChange={e=>{setPreset(e.target.value);setStatus('');}}>{embedHeights.map(h=><option key={h} value={String(h)}>{h} px</option>)}<option value="custom">Custom height</option></select>
    {preset==='custom'&&<><label htmlFor={customId}>Custom height (px)</label><input id={customId} type="number" min={400} max={2400} step={1} value={custom} aria-invalid={!valid} aria-describedby={customId+'-help'} onChange={e=>{setCustom(e.target.value);setStatus('');}}/><p id={customId+'-help'} className="share-dialog-help">Enter a whole number from 400 to 2400 pixels.</p>{!valid&&<p role="alert">Choose a height from 400 to 2400 pixels before copying or previewing.</p>}</>}
    <p>Width adapts to the available space. Longer results scroll inside the frame.</p>
    <label htmlFor={codeId}>Embed code</label><textarea id={codeId} ref={field} readOnly value={code} rows={6} spellCheck={false}/>
    {preview&&valid&&<iframe src={previewPath} title={`${tool.title} embed preview`} width="100%" height={height} loading="lazy" referrerPolicy="no-referrer" style={{border:0,borderRadius:12}}/>}
    <p><strong>Do not hide the CalculatorFree.io attribution link.</strong> Keep both the widget’s attribution and the accompanying credit link visible.</p>
    <p>Free use covers embedding the hosted calculator, not a license to redistribute its source code. See <SiteLink href="/embed-resources#usage">embed usage guidance</SiteLink> for setup, attribution and limitations.</p>
  </div>;
}
