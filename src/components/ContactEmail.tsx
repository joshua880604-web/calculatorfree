import {contactEmail,correctionsEmailHref} from '@/lib/content-transparency';

// Cloudflare's documented exemption preserves this public contact link for
// visitors and crawlers with JavaScript disabled. All HTML values are fixed
// publisher constants, never calculator inputs or user-provided markup.
const contactHTML=`<!--email_off--><a class="publisher-contact" href="${correctionsEmailHref}">${contactEmail}</a><!--/email_off-->`;

export default function ContactEmail(){
 return <span dangerouslySetInnerHTML={{__html:contactHTML}}/>;
}
