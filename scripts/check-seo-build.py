"""Check every maintained HTML route in an export, independently of client JavaScript.

Usage: python scripts/check-seo-build.py https://www.calculatorfree.io
Omit the origin for an intentionally noindex preview export. This checks static
artifacts, not CDN responses, Google indexing, rich-result eligibility or ranking.
"""
from collections import Counter, defaultdict, deque
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit, unquote
import json, re, subprocess, sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'out'
origin = sys.argv[1].rstrip('/') if len(sys.argv) > 1 else None
if origin == 'https://calculatorfree.io':
    origin = 'https://www.calculatorfree.io'
public_origin = 'https://www.calculatorfree.io'
# Use the maintained registry, including later guides, glossary terms and pages.
# A hardcoded historical list silently omitted new pages from this check.
registry = json.loads(subprocess.check_output([
    'node', '--import', 'tsx', '--input-type=module', '-e',
    'import {sitemapEntries} from "./src/lib/seo.ts";'
    'import {editorialGuides,guideContentDate} from "./src/lib/editorial-guides.ts";'
    'console.log(JSON.stringify({pages:sitemapEntries({origin:"https://www.calculatorfree.io",indexable:true}),'
    'guides:editorialGuides.map(g=>({path:g.path,published:g.publishedOn,modified:guideContentDate(g)}))}));'
], cwd=ROOT, text=True))
expected = {urlsplit(p['url']).path: p.get('lastModified') for p in registry['pages']}
guides = {g['path']: g for g in registry['guides']}
assert len(expected) == len(registry['pages']), 'Duplicate route in maintained registry'

class Page(HTMLParser):
    voids = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.source = source
        self.stack = []
        self.metas = defaultdict(list)
        self.canonical, self.ids, self.times, self.links, self.schemas = [], set(), [], [], []
        self.titles, self.h1s = [], []
        self.schema = None
        self.feed(source)
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'meta':
            self.metas[a.get('name', a.get('property', ''))].append(a.get('content', ''))
        if tag == 'link' and a.get('rel') == 'canonical':
            self.canonical.append(a.get('href'))
        if a.get('id'):
            self.ids.add(a['id'])
        if tag == 'time' and a.get('datetime'):
            self.times.append(a['datetime'])
        if tag == 'a' and a.get('href'):
            self.links.append((a['href'], not any(t in self.stack for t in ('nav','header','footer'))))
        if tag == 'title' and 'head' in self.stack:
            self.titles.append('')
        if tag == 'h1':
            self.h1s.append('')
        if tag == 'script' and a.get('type') == 'application/ld+json':
            self.schema = ''
        if tag not in self.voids:
            self.stack.append(tag)
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.voids:
            self.handle_endtag(tag)
    def handle_endtag(self, tag):
        if tag == 'script' and self.schema is not None:
            self.schemas.append(json.loads(self.schema))
            self.schema = None
        if tag in self.stack:
            reverse_index = self.stack[::-1].index(tag)
            del self.stack[len(self.stack)-reverse_index-1:]
    def handle_data(self, data):
        if self.schema is not None:
            self.schema += data
        if 'head' in self.stack and self.stack[-1:] == ['title']:
            self.titles[-1] += data
        if 'h1' in self.stack:
            self.h1s[-1] += data

def file_for(path):
    p = OUT / path.lstrip('/')
    candidates = [p / 'index.html'] if path.endswith('/') else [p, p.with_suffix('.html'), p / 'index.html']
    return next((candidate for candidate in candidates if candidate.is_file()), None)

def schema_nodes(value):
    if isinstance(value, dict):
        yield value
        for v in value.values():
            yield from schema_nodes(v)
    elif isinstance(value, list):
        for v in value:
            yield from schema_nodes(v)

pages = {}
for path, lastmod in expected.items():
    f = file_for(path)
    assert f, ('Missing route', path)
    p = pages[path] = Page(f.read_text())
    assert len(p.titles) == 1 and p.titles[0].strip(), ('HTML head title', path, p.titles)
    assert len(p.h1s) == 1 and p.h1s[0].strip(), ('H1', path, p.h1s)
    assert len(p.metas['description']) == 1 and p.metas['description'][0], ('Description', path)
    assert p.canonical == ([origin+path] if origin else []), ('Canonical', path, p.canonical)
    assert ('noindex' not in ','.join(p.metas['robots'])) if origin else ('noindex' in ','.join(p.metas['robots']))
    if path not in ('/privacy','/disclaimer'):
        assert p.schemas, ('Missing JSON-LD', path)
    if path in guides:
        guide = guides[path]
        articles = [n for schema in p.schemas for n in schema_nodes(schema)
                    if n.get('@type') == 'Article' and 'datePublished' in n]
        assert len(articles) == 1, ('Article entity', path)
        article = articles[0]
        assert article['datePublished'] == guide['published'], ('Publication date', path)
        assert article['dateModified'] == guide['modified'] == lastmod, ('Article/sitemap date', path)
        assert p.metas['og:type'] == ['article'], ('Open Graph article type', path)
        assert p.metas['article:published_time'] == [guide['published']], ('OG publication date', path)
        assert p.metas['article:modified_time'] == [guide['modified']], ('OG update date', path)
        assert guide['modified'] in p.times, ('Content/link update date must be visible', path)
    for schema in p.schemas:
        for node in schema_nodes(schema):
            if node.get('@type') == 'WebApplication':
                assert node.get('offers', {}).get('price') == '0', ('Free tool offer', path)
                assert 'aggregateRating' not in node and 'review' not in node, ('No invented review', path)
                if origin:
                    assert node.get('url') == origin+path, ('App URL', path)
                    assert node['offers'].get('url') == origin+path, ('Offer URL', path)
            if node.get('@type') == 'WebPageElement' and str(node.get('@id','')).startswith((origin or public_origin)+path+'#'):
                assert node['@id'].split('#',1)[1] in p.ids, ('Schema section must be visible', path, node['@id'])
# Directory entities must describe the actual visible tool destinations.
directory = pages['/financial-calculator']
directory_nodes = [n for schema in directory.schemas for n in schema_nodes(schema)]
assert any(n.get('@type') == 'CollectionPage' for n in directory_nodes)
item_lists = [n for n in directory_nodes if n.get('@type') == 'ItemList']
assert len(item_lists) == 1
if origin:
    # The root redirects to this directory; publish one consistent site identity here.
    websites = [n for n in directory.schemas[0]['@graph'] if n.get('@type') == 'WebSite']
    publishers = [n for n in directory.schemas[0]['@graph'] if n.get('@type') == 'Organization']
    assert len(websites) == len(publishers) == 1, 'Homepage site/publisher identity'
    website, publisher = websites[0], publishers[0]
    assert website['url'] == origin+'/' and website['name'] == publisher['name']
    assert website['publisher']['@id'] == publisher['@id'], 'Site publisher reference'
    assert publisher['url'] == origin+'/' and publisher['email'], 'Public publisher details'
    logo = publisher['logo']
    logo_path = OUT / urlsplit(logo['url']).path.lstrip('/')
    assert logo['url'].startswith(origin+'/') and logo_path.is_file(), 'Published brand logo'
    logo_bytes = logo_path.read_bytes()
    assert logo_bytes[:8] == b'\x89PNG\r\n\x1a\n', 'PNG brand logo'
    width, height = (int.from_bytes(logo_bytes[i:i+4], 'big') for i in (16,20))
    assert width == logo['width'] and height == logo['height'] and min(width,height) >= 112, 'Logo dimensions'
items = item_lists[0]['itemListElement']
tool_paths = {tool['local_route'][:-5] for tool in json.loads((ROOT/'src/lib/catalog-data.json').read_text()) if tool['id'] != 'real-estate'}
assert item_lists[0]['numberOfItems'] == len(items) == len(tool_paths)
if origin:
    assert {urlsplit(item['url']).path for item in items} == tool_paths
    visible_paths = {urlsplit(urljoin(public_origin+'/financial-calculator',href)).path for href,_ in directory.links}
    assert tool_paths <= visible_paths

for field in ('titles','description'):
    values = defaultdict(list)
    for path, p in pages.items():
        value = p.titles[0] if field == 'titles' else p.metas['description'][0]
        values[value].append(path)
    assert all(len(paths) == 1 for paths in values.values()), ('Duplicate '+field, [v for v in values.values() if len(v)>1])

rules = {}
for line in (OUT/'_redirects').read_text().splitlines():
    if not line.strip() or line.startswith('#'):
        continue
    source, target, status = line.split()
    assert status == '301' and source not in rules, ('Redirect syntax/duplicate', line)
    rules[source] = target
assert not set(rules.values()) & set(rules), 'Redirect chain/loop'
assert all(target in pages for target in rules.values()), 'Redirect destination must be a canonical page'
for tool in json.loads((ROOT/'src/lib/catalog-data.json').read_text()):
    assert rules.get(tool['local_route']) == tool['local_route'][:-5], ('Missing explicit legacy alias',tool['id'])

adj = defaultdict(set)
incoming = defaultdict(set)
links_checked = state_links = 0
for path, p in pages.items():
    for href, contextual in p.links:
        target = urlsplit(urljoin(public_origin+path, href))
        if target.netloc not in ('www.calculatorfree.io','calculatorfree.io'):
            continue
        assert target.path not in rules, ('Internal link should use final URL',path,href)
        assert file_for(target.path), ('Broken internal file',path,href)
        if target.fragment:
            if target.fragment.startswith('calc='):
                state_links += 1  # Application-state fragments are not HTML section IDs.
            elif target.path in pages:
                assert unquote(target.fragment) in pages[target.path].ids, ('Broken fragment',path,href)
        if contextual and target.path in pages and target.path != path:
            adj[path].add(target.path)
            incoming[target.path].add(path)
        links_checked += 1
assert all(incoming[path] for path in pages), 'Every route needs a contextual incoming link'
queue = deque(['/financial-calculator']); depths = {'/financial-calculator':0}
while queue:
    path = queue.popleft()
    for target in adj[path]:
        if target not in depths:
            depths[target] = depths[path]+1
            queue.append(target)
assert set(depths) == set(pages), 'Some pages cannot be reached from the directory'

ns = {'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
locations = [u.findtext('s:loc',namespaces=ns) for u in ET.parse(OUT/'sitemap.xml').findall('s:url',ns)]
assert len(locations) == len(set(locations)), 'Duplicate sitemap URL'
assert set(locations) == ({origin+path for path in pages} if origin else set()), 'Sitemap route coverage'
robots = (OUT/'robots.txt').read_text()
assert 'User-Agent: *' in robots and 'Allow: /' in robots
assert (origin+'/sitemap.xml' in robots) if origin else ('Sitemap:' not in robots)
llms = (OUT/'llms.txt').read_text()
assert llms == (ROOT/'public/llms.txt').read_text()
llms_links = re.findall(r'^- \[[^]]+\]\(([^)]+)\)',llms,re.M)
assert len(llms_links) == len(set(llms_links)), 'Duplicate curated navigation link'
for url in llms_links:
    target = urlsplit(url)
    assert target.netloc == 'www.calculatorfree.io' and not target.query, ('Curated URL',url)
    assert target.path in pages or target.path == '/sitemap.xml', ('Curated target',url)
    if target.fragment:
        assert target.fragment in pages[target.path].ids, ('Curated fragment',url)
report = {'passed':True,'configuration':'indexable-test-origin' if origin else 'default-noindex-preview',
          'pages':len(pages),'guides':len(guides),'internal_links_checked':links_checked,
          'calculator_state_links':state_links,'max_contextual_depth':max(depths.values()),
          'redirect_rules':len(rules),'curated_llms_links':len(llms_links),
          'no_live_indexing_or_ranking_claim':True}
# Optional output keeps historical evidence untouched when simply rerunning a check.
if len(sys.argv)>2:
    Path(sys.argv[2]).write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
