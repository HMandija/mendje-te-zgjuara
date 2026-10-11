/* eslint-disable @next/next/no-html-link-for-pages -- Document navigation avoids a verified Vinext production routing bug. */
'use client';
import {LabRobot} from '../components/learning-art';
export default function ErrorPage({reset}:{reset:()=>void}){return <main><section className="panel error-page"><div className="error-character"><LabRobot state="think"/></div><span className="eyebrow">NJË PENGESË E VOGËL</span><h1>Nuk mund ta hapnim këtë faqe.</h1><p>Provo sërish. Nëse problemi vazhdon, kthehu te ushtrimet.</p><div className="actions"><button className="primary" onClick={reset}>Provo sërish</button><a className="secondary" href="/">Te ushtrimet</a></div></section></main>;}
