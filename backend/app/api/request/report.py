import json, re
from io import BytesIO
from collections import Counter, defaultdict
from datetime import datetime
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, Image
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.pagesizes import A4
from PIL import Image as PILImage



def build_report(DATA, start, end, filter_description):
    """Render the complete inspection-support report in memory for one request."""
    OUT=BytesIO()
    period=f"{start:%d/%m/%Y} a {end:%d/%m/%Y}"
    NAVY=colors.HexColor('#15354A'); TEAL=colors.HexColor('#087E8B'); LIGHT=colors.HexColor('#EDF4F6')
    styles=getSampleStyleSheet()
    for s in styles.byName.values(): s.fontName='Helvetica'
    styles.add(ParagraphStyle(name='Body',fontName='Helvetica',fontSize=8.5,leading=12,spaceAfter=5,textColor=NAVY))
    styles.add(ParagraphStyle(name='SmallCell',fontName='Helvetica',fontSize=7,leading=9,textColor=NAVY))
    styles.add(ParagraphStyle(name='WhiteCell',fontName='Helvetica-Bold',fontSize=7,leading=9,textColor=colors.white))
    styles.add(ParagraphStyle(name='Section',fontName='Helvetica-Bold',fontSize=17,leading=21,spaceAfter=12,textColor=NAVY))
    styles.add(ParagraphStyle(name='Card',fontName='Helvetica-Bold',fontSize=10,leading=14,spaceBefore=10,spaceAfter=6,textColor=TEAL,keepWithNext=True))
    story=[]
    def clean(v):
        if v is None or v=='': return 'Não informado'
        if isinstance(v,(dict,list)): return json.dumps(v,ensure_ascii=False, default=str)
        return re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]','',str(v))
    def p(v,style='Body'): return Paragraph(escape(clean(v)).replace('\n','<br/>'),styles[style])
    def body(v): story.append(p(v))
    def title(v): story.append(p(v,'Section'))
    def date(v): return (datetime.fromisoformat(v) if isinstance(v,str) else v).strftime('%d/%m/%Y %H:%M') if v else 'Não informado'
    def name(r,k): return (r.get(k) or {}).get('name') or 'Não informado'
    def status(r): return r['request_status']['description']
    def loc(r): return ' / '.join(name(r,k) for k in ('business','region','location'))
    def table(headers, rows, widths):
        data=[[p(h,'WhiteCell') for h in headers]]+[[p(x,'SmallCell') for x in row] for row in rows]
        t=Table(data,colWidths=widths,repeatRows=1,hAlign='LEFT')
        t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),NAVY),('VALIGN',(0,0),(-1,-1),'TOP'),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,LIGHT]),('LEFTPADDING',(0,0),(-1,-1),5),('RIGHTPADDING',(0,0),(-1,-1),5),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),('LINEBELOW',(0,0),(-1,0),1,TEAL)]))
        story.append(t);story.append(Spacer(1,10))
    def section(v): story.append(PageBreak());title(v)
    records=DATA['records']; total=len(records)
    if not records:
        raise ValueError('Nenhum chamado encontrado para os filtros informados.')
    counts=Counter(status(r) for r in records)
    cats=Counter(name(r,'category') for r in records)
    locations=Counter(loc(r) for r in records)
    cross=Counter((loc(r),name(r,'category')) for r in records)
    assert sum(cats.values())==sum(locations.values())==sum(counts.values())==total
    members={m['id']:m['name'] for m in DATA['members']}
    groups={}
    for key in ['tasks','fields','transactions','checklists','checklist_values','executors']:
        groups[key]=defaultdict(list)
        for row in DATA[key]: groups[key][row['id_request']].append(row)
    media=defaultdict(list)
    for m in DATA['media']: media[m['report_request_id']].append(m)
    stamp=datetime.fromisoformat(DATA['extracted_at']).strftime('%d/%m/%Y às %H:%M')
    story.append(Spacer(1,20))
    title('Relatório de chamados')
    story.append(p('Facilities | Apoio à vistoria','Section'))
    body(f'Período de abertura: {period} (inclusive)')
    body(f'Extração da base: {stamp} (UTC-03:00). Filtros: {filter_description}.')
    table(['CHAMADOS','CATEGORIAS','LOCAIS CADASTRADOS','PENDENTES'],[[total,len(cats),len(set(r['request']['id_location'] for r in records)),sum(v for k,v in counts.items() if k not in ('Concluída','Concluida','Cancelada'))]],[127,127,127,130])
    story.append(p('Situação dos chamados','Card'))
    table(['Situação atual','Quantidade','Participação'],[[k,v,f'{v/total:.1%}'.replace('.',',')] for k,v in counts.most_common()],[315,98,98])
    story.append(p('Escopo e critérios de leitura','Card'))
    body('Seleção pela data de criação, incluindo todo o último dia do período, conforme os horários armazenados no banco. As situações e os demais dados são os existentes na extração; não representam uma reconstrução histórica do encerramento do período.')
    body('Os totais contam chamados únicos. A identificação dos locais inclui organização, região e local, preservando também registros de local exato não especificado. Percentuais podem apresentar diferenças residuais por arredondamento.')
    body(f'Conteúdo complementar encontrado: {len(DATA["fields"])} valores de campos adicionais, {len(DATA["tasks"])} registro(s) de execução, {len(DATA["checklists"])} checklist(s), {len(DATA["transactions"])} movimentação(ões) e {len(DATA["media"])} anexo(s).')
    body('Documento de apoio baseado nos registros do sistema. Não houve vistoria presencial nesta elaboração. Situação concluída não substitui a validação técnica da solução. Ausências de dados são indicadas explicitamente.')
    story.append(p('Organização do documento','Card'))
    body('1. Resumo e critérios • 2. Categorias • 3. Locais • 4. Categorias por local • 5. Relação completa • 6. Fichas dos chamados • 7. Pendências e encerramento')
    section('2 | Quantidade por categoria')
    table(['Categoria','Chamados','% do total'],[[k,v,f'{100*v/total:.2f}%'.replace('.',',')] for k,v in cats.most_common()]+[['TOTAL',total,'100,00%']],[335,88,88])
    section('3 | Quantidade por local')
    body('Hierarquia: organização / região / local. Nomes genéricos são mantidos conforme o cadastro.')
    table(['Local','Chamados','% do total'],[[k,v,f'{100*v/total:.2f}%'.replace('.',',')] for k,v in locations.most_common()]+[['TOTAL',total,'100,00%']],[365,65,81])
    section('4 | Categorias em cada local')
    for location,n in sorted(locations.items()):
        story.append(p(f'{location} | {n} chamado(s)','Card'))
        table(['Categoria','Quantidade','% no local'],[[c,v,f'{100*v/n:.1f}%'.replace('.',',')] for (l,c),v in sorted(cross.items()) if l==location],[335,88,88])
    section('5 | Relação completa dos chamados')
    body('Ordenação por organização, região, local e identificador. As fichas seguintes preservam descrições, datas e informações complementares.')
    table(['ID / abertura','Local','Categoria / serviço','Situação'],[[f"#{r['request']['id']}\n{date(r['request']['created_date'])}",loc(r),name(r,'category')+'\n'+name(r,'service_type'),status(r)] for r in records],[78,170,185,78])
    section('6 | Fichas detalhadas')
    body('Registros agrupados por local. Os textos são reproduzidos conforme a base, inclusive informações de teste eventualmente cadastradas. Datas sem valor e responsáveis não atribuídos são indicados como não informados.')
    for r in records:
        card_start=len(story)
        q=r['request']; rid=q['id']
        story.append(p(f"#{rid} | {name(r,'service_type')} | {status(r)}",'Card'))
        body('Local: '+loc(r))
        body(f"Categoria: {name(r,'category')} | Tipo: {name(r,'request_type')}\nSolicitante: {name(r,'requester')} | Responsável: {members.get(q['id_membership_responder']) or 'Não informado'}")
        body('Abertura: '+date(q['created_date'])+' | Agendada: '+date(q['agreed_date'])+'\nInício: '+date(q['started_date'])+' | Conclusão: '+date(q['finished_date'])+' | Cancelamento: '+date(q['canceled_date']))
        body('Descrição: '+clean(q['description']))
        for f in groups['fields'][rid]: body(clean(f['field_name'])+': '+clean(f['value']))
        for t in groups['tasks'][rid]:
            body(f"Execução #{t['id']}: {date(t['started_date'])} a {date(t['finished_date'])}\nRegistro: {clean(t['description'])}")
            body('Executores: '+(', '.join(e['name'] for e in groups['executors'][rid] if e['id_request_task']==t['id']) or 'Não informado'))
        for t in groups['transactions'][rid]: body(f"Movimentação #{t['id']}: {clean(t['status_description'])} | {clean(t['description'])}")
        for ch in groups['checklists'][rid]:
            body('Checklist: '+clean(ch['checklist_name']))
            for k,v in ch.items():
                if k not in ('id','id_request','id_request_task','id_checklist_type','checklist_name'): body(k+': '+clean(v))
            for v in groups['checklist_values'][rid]:
                if v['id_request_task_checklist']==ch['id']: body(clean(v['field_name'])+': '+clean(v['value']))
        if not groups['tasks'][rid] and not groups['checklists'][rid] and not media[rid]:
            body('Execução, checklist e anexos: sem registros vinculados na extração.')
        for m in media[rid]:
            body(f"Anexo #{m['id']} ({m['kind']}): {m['file_name']} | Registro: {date(m['created_date'])}. Conteúdo cadastrado, sem validação de pertinência à vistoria.")
            if m['mime_type'].startswith('image/'):
                try:
                    im=PILImage.open(BytesIO(m['content'])); im.load()
                    w,h=im.size; scale=min(350/w,180/h,1)
                    image_data=BytesIO(); im.convert('RGB').save(image_data,format='PNG'); image_data.seek(0)
                    story.append(Image(image_data,width=w*scale,height=h*scale,hAlign='LEFT'))
                except (OSError, ValueError, PILImage.DecompressionBombError):
                    body('Não foi possível renderizar este anexo. Consulte o arquivo original no chamado.')
            else: body('Arquivo não visual: referência preservada; conteúdo não incorporado ao PDF.')
        story.append(Spacer(1,5))
        card=story[card_start:]
        del story[card_start:]
        story.append(KeepTogether(card))
    section('7 | Pendências e encerramento')
    pending=[r for r in records if status(r) not in ('Concluída','Concluida','Cancelada')]
    body(f'{len(pending)} chamados permanecem em situação não encerrada na extração. A lista abaixo permite identificar os itens para acompanhamento.')
    table(['ID','Local / serviço','Situação','Responsável / agendamento'],[[r['request']['id'],loc(r)+'\n'+name(r,'service_type'),status(r),(members.get(r['request']['id_membership_responder']) or 'Não informado')+'\n'+date(r['request']['agreed_date'])] for r in pending],[40,255,80,136])
    story.append(p('Registros disponíveis e validação','Card'))
    body(f"Foram consolidados {total} chamados: "+'; '.join(f'{v} em {k}' for k,v in counts.most_common())+'. As quantidades por categoria e local reconciliam com o total geral.')
    body('Não foi identificada nesta extração uma conclusão técnica de vistoria para o conjunto dos chamados. Providências, prioridades, prazos de correção e validações que não constam nos registros não foram presumidos. O agendamento apresentado corresponde ao campo de data acordada, sem inferência de vencimento de SLA.')
    body('Responsável pela revisão: __________________________________________\nData da revisão: ____/____/________\nAssinatura: _______________________________________________________')
    def footer(canvas,doc):
        canvas.setStrokeColor(TEAL);canvas.line(42,805,553,805)
        canvas.setFont('Helvetica',7);canvas.setFillColor(NAVY)
        canvas.drawString(42,816,'OPSHUB / FACILITIES     RELATÓRIO DE CHAMADOS')
        canvas.drawString(42,25,f'{period} | Fonte: base Oracle do OpsHub')
        canvas.drawRightString(553,25,f'Página {doc.page}')
    doc=SimpleDocTemplate(OUT,pagesize=A4,rightMargin=42,leftMargin=42,topMargin=52,bottomMargin=45,title=f'Relatório de chamados | {period}',author='OpsHub Facilities',pageCompression=1)
    doc.build(story,onFirstPage=footer,onLaterPages=footer)
    from pypdf import PdfReader, PdfWriter
    reader=PdfReader(OUT); writer=PdfWriter(); writer.clone_document_from_reader(reader)
    labels=['Relatório de chamados','2 | Quantidade por categoria','3 | Quantidade por local','4 | Categorias em cada local','5 | Relação completa dos chamados','6 | Fichas detalhadas','7 | Pendências e encerramento']
    for i,page in enumerate(reader.pages):
        text=page.extract_text()
        for label in labels:
            if label in text:
                writer.add_outline_item(label,i)
    writer.page_mode='/UseOutlines'
    result=BytesIO()
    writer.write(result)
    return result.getvalue()
