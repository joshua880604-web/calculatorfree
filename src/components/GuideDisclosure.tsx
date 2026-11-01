import type {ReactNode} from 'react';

export default function GuideDisclosure({title,children,id}:{title:string;children:ReactNode;id?:string}) {
 return <details className="guide-disclosure">
  <summary>{title}</summary>
  <div className="guide-disclosure-body" id={id}>{children}</div>
 </details>;
}
