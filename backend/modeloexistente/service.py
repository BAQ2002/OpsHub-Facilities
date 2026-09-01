# backend/app/api/v1/gate/service.py

from datetime import datetime, timezone
from typing import List

from app.db import fetch_all_dicts
from .schemas import GateOverview, GateAgendamentoRow, AutoGateStatus
import re as _re


def get_gate_overview() -> GateOverview:
    """
    Retorna um resumo mockado da operação do gate.
    Depois vamos trocar isso por leitura real (Oracle / outro sistema).
    """
    return GateOverview(
        trucks_in_queue=7,
        avg_wait_time_min=18.5,
        trucks_processed_last_hour=42,
        gate_status="NORMAL",
        as_of=datetime.now(timezone.utc),
    )


SQL_AGENDAMENTOS = """
SELECT d.ordem,
       d.tipo,
       d.faina_id,
       TO_CHAR(d.dat, 'YYYY-MM-DD') AS dat,
       d.hora,
       NVL(d.qtd, 0) AS qtd,
       f.dsc_faina
  FROM sc_vw_agend_dash_geral d,
       sc_faina f
 WHERE d.faina_id = f.faina_id
   AND d.faina_id NOT IN (53, 90)
   AND f.dsc_faina NOT LIKE 'DEPOT%DEVOLU%'
   AND f.dsc_faina NOT LIKE 'DEPOT%RETIRADA EXPORTA%DRY%'
   AND d.dat BETWEEN TO_DATE(:dat_ini, 'YYYY-MM-DD') AND TO_DATE(:dat_fim, 'YYYY-MM-DD')
 ORDER BY d.dat, d.hora, f.dsc_faina, d.ordem
"""


SQL_AUTOGATE = """
SELECT
    TO_CHAR(dia, 'YYYY-MM-DD') AS dia,
    autogategatein,
    autogategateout,
    NVL(erro_camera, 0) AS erro_camera,
    NVL(motorista_errado, 0) AS motorista_errado,
    NVL(agendamento_vencido, 0) AS agendamento_vencido,
    NVL(semprosicaofld, 0) AS semprosicaofld,
    NVL(faltouinspecao, 0) AS faltouinspecao,
    NVL(container_pontilhado, 0) AS container_pontilhado,
    NVL(problema_booking, 0) AS problema_booking,
    NVL(sembiometria, 0) AS sembiometria,
    NVL(motoristascadastrados, 0) AS motoristascadastrados
FROM admscol.abb_gate_status_salvador_hist
WHERE TRUNC(dia) = {dat_ref}
ORDER BY dia
"""


def _safe_pct(val) -> float | None:
    if val is None:
        return None
    try:
        return float(str(val).replace(",", ".").replace("%", "").strip())
    except (TypeError, ValueError):
        return None


def get_autogate_status_db(dat: str) -> AutoGateStatus | None:
    if not _re.match(r'^\d{4}-\d{2}-\d{2}$', dat):
        return None
    dat_ref = f"TO_DATE('{dat}', 'YYYY-MM-DD')"
    sql = SQL_AUTOGATE.format(dat_ref=dat_ref)
    rows = fetch_all_dicts(sql)

    if not rows:
        return None

    r = rows[0]
    return AutoGateStatus(
        dia=str(r.get("dia") or dat),
        autogate_in=_safe_pct(r.get("autogategatein")),
        autogate_out=_safe_pct(r.get("autogategateout")),
        erro_camera=int(r.get("erro_camera") or 0),
        motorista_errado=int(r.get("motorista_errado") or 0),
        agendamento_vencido=int(r.get("agendamento_vencido") or 0),
        sem_prosicao_fld=int(r.get("semprosicaofld") or 0),
        faltou_inspecao=int(r.get("faltouinspecao") or 0),
        container_pontilhado=int(r.get("container_pontilhado") or 0),
        problema_booking=int(r.get("problema_booking") or 0),
        sem_biometria=int(r.get("sembiometria") or 0),
        motoristas_cadastrados=int(r.get("motoristascadastrados") or 0),
    )


def get_agendamentos_analise(dat_ini: str, dat_fim: str) -> List[dict]:
    """
    Análise de agendamentos por faina, status e data.
    Conta CONTÊINERES (SC_AGEND_CNTR) para alinhar com a Operação.
    Status do contêiner: P=Agendado, A=Atendido, C=Cancelado, N=No-show,
            V=Vencido, L=Liberação Especial, I=Incompleto, CI=Cancelado Incompleto
    """
    sql = """
    SELECT
        TO_CHAR(AG.DAT_AGEND, 'YYYY-MM-DD')  AS dat,
        AG.HORA_AGEND                          AS hora,
        CT.IND_STATUS                          AS status,
        TP.DSC_TIPO                            AS faina,
        TP.COD_TIPO                            AS cod_faina,
        TP.FAINA_ID                            AS faina_id,
        COUNT(CT.AGEND_CNTR_ID)                AS qtd
    FROM
        ADMSCOL.SC_AGEND AG,
        ADMSCOL.SC_AGEND_TIPO TP,
        ADMSCOL.SC_AGEND_CNTR CT
    WHERE
        CT.AGEND_ID = AG.AGEND_ID
        AND TP.TIPO_AGEND_ID = AG.TIPO_AGEND_ID
        AND AG.DAT_AGEND BETWEEN TO_DATE(:dat_ini, 'YYYY-MM-DD')
                             AND TO_DATE(:dat_fim, 'YYYY-MM-DD')
        AND TP.FAINA_ID NOT IN (53, 90, 91, 93, 94)
    GROUP BY
        TO_CHAR(AG.DAT_AGEND, 'YYYY-MM-DD'),
        AG.HORA_AGEND,
        CT.IND_STATUS,
        TP.DSC_TIPO,
        TP.COD_TIPO,
        TP.FAINA_ID
    ORDER BY dat, hora, faina
    """
    return fetch_all_dicts(sql, {"dat_ini": dat_ini, "dat_fim": dat_fim})


def get_agendamentos_resumo_faina(dat_ini: str, dat_fim: str) -> List[dict]:
    """Resumo agrupado por faina e status — conta contêineres."""
    sql = """
    SELECT
        TP.DSC_TIPO                            AS faina,
        TP.COD_TIPO                            AS cod_faina,
        CT.IND_STATUS                          AS status,
        COUNT(CT.AGEND_CNTR_ID)                AS qtd
    FROM
        ADMSCOL.SC_AGEND AG,
        ADMSCOL.SC_AGEND_TIPO TP,
        ADMSCOL.SC_AGEND_CNTR CT
    WHERE
        CT.AGEND_ID = AG.AGEND_ID
        AND TP.TIPO_AGEND_ID = AG.TIPO_AGEND_ID
        AND AG.DAT_AGEND BETWEEN TO_DATE(:dat_ini, 'YYYY-MM-DD')
                             AND TO_DATE(:dat_fim, 'YYYY-MM-DD')
        AND TP.FAINA_ID NOT IN (53, 90, 91, 93, 94)
    GROUP BY
        TP.DSC_TIPO,
        TP.COD_TIPO,
        CT.IND_STATUS
    ORDER BY faina, status
    """
    return fetch_all_dicts(sql, {"dat_ini": dat_ini, "dat_fim": dat_fim})


def get_agendamentos_heatmap(dat_ini: str, dat_fim: str) -> List[dict]:
    """Heatmap: volume por hora e dia da semana — conta contêineres."""
    sql = """
    SELECT
        TO_CHAR(AG.DAT_AGEND, 'D')   AS dia_semana,
        AG.HORA_AGEND                  AS hora,
        CT.IND_STATUS                  AS status,
        COUNT(CT.AGEND_CNTR_ID)       AS qtd
    FROM
        ADMSCOL.SC_AGEND AG,
        ADMSCOL.SC_AGEND_TIPO TP,
        ADMSCOL.SC_AGEND_CNTR CT
    WHERE
        CT.AGEND_ID = AG.AGEND_ID
        AND TP.TIPO_AGEND_ID = AG.TIPO_AGEND_ID
        AND AG.DAT_AGEND BETWEEN TO_DATE(:dat_ini, 'YYYY-MM-DD')
                             AND TO_DATE(:dat_fim, 'YYYY-MM-DD')
        AND TP.FAINA_ID NOT IN (53, 90, 91, 93, 94)
    GROUP BY
        TO_CHAR(AG.DAT_AGEND, 'D'),
        AG.HORA_AGEND,
        CT.IND_STATUS
    ORDER BY dia_semana, hora
    """
    return fetch_all_dicts(sql, {"dat_ini": dat_ini, "dat_fim": dat_fim})


def get_agendamentos_lib_especial(dat_ini: str, dat_fim: str) -> List[dict]:
    """Liberações especiais por data/hora e usuário (fonte: SC_LOG)."""
    sql = """
    SELECT
        TO_CHAR(LO.DT_ALTER, 'YYYY-MM-DD') AS dat,
        TO_NUMBER(TO_CHAR(LO.DT_ALTER, 'HH24')) AS hora,
        LO.SD_USR_BD_NOME_ALTERA           AS usuario,
        LO.VALOR_ATUAL                     AS status_destino,
        COUNT(1)                           AS qtd
    FROM ADMSCOL.SC_LOG LO
    WHERE LO.TABELA = 'SC_AGEND'
      AND LO.CAMPO  = 'IND_STATUS'
      AND LO.VALOR_ANTERIOR = 'L'
      AND LO.DT_ALTER BETWEEN TO_DATE(:dat_ini, 'YYYY-MM-DD')
                          AND TO_DATE(:dat_fim, 'YYYY-MM-DD') + 1
    GROUP BY
        TO_CHAR(LO.DT_ALTER, 'YYYY-MM-DD'),
        TO_NUMBER(TO_CHAR(LO.DT_ALTER, 'HH24')),
        LO.SD_USR_BD_NOME_ALTERA,
        LO.VALOR_ATUAL
    ORDER BY dat, hora, usuario
    """
    return fetch_all_dicts(sql, {"dat_ini": dat_ini, "dat_fim": dat_fim})


def get_agendamentos_lib_por_usuario(dat_ini: str, dat_fim: str) -> List[dict]:
    """Resumo de liberações especiais por usuário."""
    sql = """
    SELECT
        LO.SD_USR_BD_NOME_ALTERA           AS usuario,
        LO.VALOR_ATUAL                     AS status_destino,
        COUNT(1)                           AS qtd
    FROM ADMSCOL.SC_LOG LO
    WHERE LO.TABELA = 'SC_AGEND'
      AND LO.CAMPO  = 'IND_STATUS'
      AND LO.VALOR_ANTERIOR = 'L'
      AND LO.DT_ALTER BETWEEN TO_DATE(:dat_ini, 'YYYY-MM-DD')
                          AND TO_DATE(:dat_fim, 'YYYY-MM-DD') + 1
    GROUP BY
        LO.SD_USR_BD_NOME_ALTERA,
        LO.VALOR_ATUAL
    ORDER BY qtd DESC
    """
    return fetch_all_dicts(sql, {"dat_ini": dat_ini, "dat_fim": dat_fim})


def _extract_bloco(posicao: str) -> str:
    """Extrai a letra do bloco da posição.
    Y-YARD1-M024F2 → M, L026E.5 → L, C002G4 → C"""
    import re
    if not posicao:
        return ""
    # Formato Y-YARD1-X...
    m = re.match(r"Y-YARD\d*-([A-Z])", posicao)
    if m:
        return m.group(1)
    # Formato direto: primeira letra maiúscula
    m = re.match(r"([A-Z])", posicao)
    if m:
        return m.group(1)
    return ""


def get_proximas_retiradas() -> List[dict]:
    """
    Próximas retiradas agendadas (hora atual + futuras, status P).
    Uma única query com LEFT JOINs para performance.
    """
    sql = """
    SELECT
        AG.HORA_AGEND                           AS hora,
        AG.PLACA_CAVALO                         AS placa,
        CT.COD_CNTR                             AS container,
        CT.NUM_BOOKING                          AS booking,
        TP.DSC_TIPO                             AS faina,
        TP.COD_TIPO                             AS cod_faina,
        TP.FAINA_ID                             AS faina_id,
        /* posição do contêiner no N4 (para RCC/DTA) */
        V.LAST_POS_SLOT                         AS posicao
    FROM
        ADMSCOL.SC_AGEND AG
        JOIN ADMSCOL.SC_AGEND_TIPO TP ON TP.TIPO_AGEND_ID = AG.TIPO_AGEND_ID
        JOIN ADMSCOL.SC_AGEND_CNTR CT ON CT.AGEND_ID = AG.AGEND_ID
        LEFT JOIN ADMN4.INV_UNIT U
            ON U.ID = CT.COD_CNTR
        LEFT JOIN ADMN4.INV_UNIT_FCY_VISIT V
            ON U.ACTIVE_UFV = V.GKEY
            AND V.TRANSIT_STATE = 'S40_YARD'
    WHERE
        AG.DAT_AGEND = TRUNC(SYSDATE)
        AND AG.HORA_AGEND >= TO_NUMBER(TO_CHAR(SYSDATE, 'HH24'))
        AND CT.IND_STATUS = 'P'
        AND TP.FAINA_ID IN (41, 42, 43, 49)
    ORDER BY AG.HORA_AGEND, TP.DSC_TIPO
    """
    rows = fetch_all_dicts(sql, {})

    # Agrupar bookings DTC e RCV para buscar blocos
    dtc_bookings = set()
    rcv_bookings = set()
    for r in rows:
        fid = int(r.get("faina_id") or 0)
        bk = str(r.get("booking") or "").strip()
        if fid == 42 and bk:
            dtc_bookings.add(bk)
        elif fid == 49 and bk:
            rcv_bookings.add(bk)

    # DTC: TECSC0001114071 → T1114071 → buscar blocos via REFG.ID
    dtc_bloco_map: dict = {}  # booking_original → "M, H"
    dtc_qtd_map: dict = {}    # booking_original → qtd
    if dtc_bookings:
        refg_to_orig: dict = {}
        for bk in dtc_bookings:
            nums = bk[5:].lstrip("0") if bk.upper().startswith("TECSC") else bk
            refg_to_orig[f"T{nums}"] = bk

        placeholders = ", ".join([f"'{k}'" for k in list(refg_to_orig.keys())[:200]])
        sql_dtc = f"""
        SELECT REFG.ID AS refg_id, V.LAST_POS_SLOT AS posicao
        FROM ADMN4.INV_UNIT U, ADMN4.INV_UNIT_FCY_VISIT V, ADMN4.REF_GROUPS REFG
        WHERE U.ACTIVE_UFV = V.GKEY AND V.TRANSIT_STATE = 'S40_YARD'
          AND U.GROUP_GKEY = REFG.GKEY AND REFG.ID IN ({placeholders})
        """
        for pr in fetch_all_dicts(sql_dtc, {}):
            refg = str(pr.get("refg_id", ""))
            orig = refg_to_orig.get(refg, refg)
            b = _extract_bloco(str(pr.get("posicao", "")))
            if orig not in dtc_bloco_map:
                dtc_bloco_map[orig] = set()
                dtc_qtd_map[orig] = 0
            if b:
                dtc_bloco_map[orig].add(b)
            dtc_qtd_map[orig] += 1

    # RCV: buscar blocos via BO.NBR
    rcv_bloco_map: dict = {}
    rcv_qtd_map: dict = {}
    if rcv_bookings:
        placeholders = ", ".join([f"'{bk}'" for bk in list(rcv_bookings)[:200]])
        sql_rcv = f"""
        SELECT BO.NBR AS bk, V.LAST_POS_SLOT AS posicao
        FROM ADMN4.INV_UNIT U, ADMN4.INV_UNIT_FCY_VISIT V,
             ADMN4.INV_EQ_BASE_ORDER_ITEM BI, ADMN4.INV_EQ_BASE_ORDER BO
        WHERE U.ACTIVE_UFV = V.GKEY AND V.TRANSIT_STATE = 'S40_YARD'
          AND U.DEPART_ORDER_ITEM_GKEY = BI.GKEY AND BI.EQO_GKEY = BO.GKEY
          AND BO.NBR IN ({placeholders})
        """
        for pr in fetch_all_dicts(sql_rcv, {}):
            bk = str(pr.get("bk", ""))
            b = _extract_bloco(str(pr.get("posicao", "")))
            if bk not in rcv_bloco_map:
                rcv_bloco_map[bk] = set()
                rcv_qtd_map[bk] = 0
            if b:
                rcv_bloco_map[bk].add(b)
            rcv_qtd_map[bk] += 1

    # Montar resultado
    result = []
    for r in rows:
        fid = int(r.get("faina_id") or 0)
        bk = str(r.get("booking") or "").strip()
        ctr = str(r.get("container") or "").strip()
        posicao = str(r.get("posicao") or "")

        if fid in (41, 43):
            # Normal: só incluir se tem posição no pátio (S40_YARD)
            if not posicao:
                continue
            result.append({
                "hora": int(r.get("hora") or 0),
                "placa": str(r.get("placa") or ""),
                "container": ctr,
                "booking": bk,
                "faina": str(r.get("faina") or ""),
                "cod_faina": str(r.get("cod_faina") or ""),
                "posicao": posicao,
                "bloco": _extract_bloco(posicao),
                "tipo": "normal",
            })
        elif fid == 42:
            # DTC: booking + blocos do N4
            blocos = dtc_bloco_map.get(bk, set())
            result.append({
                "hora": int(r.get("hora") or 0),
                "placa": str(r.get("placa") or ""),
                "container": ctr or bk,
                "booking": bk,
                "faina": str(r.get("faina") or ""),
                "cod_faina": "DTC",
                "posicao": "",
                "bloco": ", ".join(sorted(blocos)),
                "tipo": "dtc",
                "qtd_possiveis": dtc_qtd_map.get(bk, 0),
            })
        elif fid == 49:
            # RCV: booking + blocos do N4
            blocos = rcv_bloco_map.get(bk, set())
            result.append({
                "hora": int(r.get("hora") or 0),
                "placa": str(r.get("placa") or ""),
                "container": ctr or bk,
                "booking": bk,
                "faina": str(r.get("faina") or ""),
                "cod_faina": "RCV",
                "posicao": "",
                "bloco": ", ".join(sorted(blocos)),
                "tipo": "rcv",
                "qtd_possiveis": rcv_qtd_map.get(bk, 0),
            })

    return result


def get_gate_agendamentos_db(dat_ini: str, dat_fim: str) -> List[GateAgendamentoRow]:
    """Retorna agendamentos do Gate para um intervalo de datas."""
    rows = fetch_all_dicts(SQL_AGENDAMENTOS, {"dat_ini": dat_ini, "dat_fim": dat_fim})

    result: List[GateAgendamentoRow] = []
    for r in rows:
        result.append(
            GateAgendamentoRow(
                ordem=int(r.get("ordem") or 0),
                tipo=str(r.get("tipo") or ""),
                faina_id=int(r.get("faina_id") or 0),
                dsc_faina=str(r.get("dsc_faina") or ""),
                dat=str(r.get("dat") or ""),
                hora=int(r.get("hora") or 0),
                qtd=int(r.get("qtd") or 0),
            )
        )

    return result
