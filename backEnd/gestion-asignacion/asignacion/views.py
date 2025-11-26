from collections import defaultdict
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .services.priority_service import construir_lista_prioridad
from asignacion.services.asignador_Service import AsignadorService

from referencias.models import SeleccionEstudianteElectiva as Sel, Oferta as Oferta
from gestion_hojas_de_calculo.models import PerfilAcademico
from asignacion.models import Asignacion
from core.permissions import IsAsignador
from asignacion.variables import ELECTIVAS_DEBE_VER
from django.db import transaction

class PrioridadViewSet(viewsets.ViewSet):
    permission_classes = [IsAsignador]

    @action(detail=False, methods=["get"], url_path="")
    def prioridad(self, request):
        try:
            anio = int(request.query_params["anio"])
            num_sem = int(request.query_params["num_semestre"])
        except (KeyError, ValueError):
            return Response(
                {"detail": "Faltan parámetros anio y num_semestre (enteros)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        pro = request.query_params.get("pro_codigo")  # opcional
        pro = pro or None  # ← '' -> None
        estrategia = request.query_params.get("estrategia", "protocol-2025")

        lista = construir_lista_prioridad(
            anio=anio,
            num_semestre=num_sem,
            pro_codigo=pro,
            estrategia=estrategia,
        )

        data = []
        for i, r in enumerate(lista):
            prom = float(r.promedio or 0.0)
            av   = float(r.porcentaje_avance or 0.0)
            data.append({
                "rank": i + 1,
                "est_codigo": r.est_codigo,
                "pro_codigo": r.pro_codigo,
                "avance_efectivo": 100.0 if r.nivelado else round(av, 2),
                "promedio": round(prom, 3),
                "electivas_cursadas": int(r.num_electivas_cursadas or 0),
                "nivelado": bool(r.nivelado),
                "estado_activo": bool(r.estado_activo),
            })

        return Response(data, status=status.HTTP_200_OK)

class AsignacionOrquestadorViewSet(viewsets.ViewSet):
    """
    POST /api/asignacion/ejecutar/
    Body:
    {
      "anio": 2025,
      "semestre": 1,
      "pro_codigo": "PIS",     # opcional (si lo envías, solo filtra stats; la asignación es global)
      "estrategia": "protocol-2025",  # opcional, default
      "debug": false           # opcional
    }
    """
    permission_classes = [IsAsignador]

    @action(detail=False, methods=["post"], url_path="ejecutar")
    def ejecutar(self, request):
        # 1) Parámetros
        try:
            anio = int(request.data["anio"])
            semestre = int(request.data["semestre"])
        except (KeyError, ValueError):
            return Response(
                {"detail": "Faltan parámetros anio y semestre (enteros)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        pro_codigo = request.data.get("pro_codigo") or None  # solo para stats
        estrategia = request.data.get("estrategia", "protocol-2025")
        debug = bool(request.data.get("debug", False))

        # 2) Ranking (global por diseño; si pasas pro_codigo en construir_lista_prioridad, filtra por programa)
        ranking = construir_lista_prioridad(
            anio=anio,
            num_semestre=semestre,
            pro_codigo=None,            # ← asignación global; no filtramos por programa
            estrategia=estrategia,
        )

        # 3) Métricas de insumos (útiles para depurar)
        perfiles_qs = PerfilAcademico.objects.filter(perfil_anio=anio, perfil_semestre=semestre)
        if pro_codigo:
            perfiles_qs = perfiles_qs.filter(est_codigo__pro_codigo__pro_codigo=pro_codigo)

        selecciones_qs = Sel.objects.filter(sel_anio=anio, sel_num_semestre=semestre)
        if pro_codigo:
            selecciones_qs = selecciones_qs.filter(est_codigo__pro_codigo__pro_codigo=pro_codigo)

        oferta_qs = Oferta.objects.filter(ofe_anio=anio, ofe_num_semestre=semestre)
        if pro_codigo:
            oferta_qs = oferta_qs.filter(pro_codigo__pro_codigo=pro_codigo)

        stats_insumos = {
            "ranking_items": len(ranking),
            "perfiles_periodo": perfiles_qs.count(),
            "selecciones_periodo": selecciones_qs.count(),
            "oferta_periodo": oferta_qs.count(),
        }

        # 4) Ejecutar asignación (cupo firme + lista de espera, con pool in-memory)
        svc = AsignadorService(anio, semestre, debug=debug)
        resultado = svc.ejecutar(ranking)  # -> {"creadas_firmes","creadas_espera","omitidas_sin_est","pool_resumen"}

        # 5) Respuesta
        payload = {
            "periodo": f"{anio}-{semestre}",
            **stats_insumos,
            "creadas_firmes": resultado.get("creadas_firmes", 0),
            "creadas_en_espera": resultado.get("creadas_espera", 0),
            "omitidas_sin_est": resultado.get("omitidas_sin_est", 0),
            "pool": resultado.get("pool_resumen", {}),
        }
        # Si pediste debug, puedes incluir una traza (si la expones desde el servicio)
        # if debug and resultado.get("traza") is not None:
        #     payload["traza"] = resultado["traza"]

        return Response(payload, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=["get"], url_path="resumen-estudiantes")
    def resumen_estudiantes(self, request):
        """
        GET /api/asignacion/resumen-estudiantes/?anio=2025&semestre=2[&pro_codigo=PIS][&est_codigo=...]
        """
        permission_classes = [IsAsignador]

        try:
            anio = int(request.query_params["anio"])
            semestre = int(request.query_params["semestre"])
        except (KeyError, ValueError):
            return Response(
                {"detail": "Parámetros requeridos: anio (int), semestre (int)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        pro_codigo = request.query_params.get("pro_codigo") or None
        est_codigo = request.query_params.get("est_codigo") or None
        estrategia = request.query_params.get("estrategia", "protocol-2025")

        # 1) Perfiles del período
        perfiles_qs = (
            PerfilAcademico.objects
            .filter(perfil_anio=anio, perfil_semestre=semestre)
            .select_related("est_codigo__pro_codigo")
        )
        if est_codigo:
            perfiles_qs = perfiles_qs.filter(est_codigo_id=est_codigo)
        if pro_codigo:
            perfiles_qs = perfiles_qs.filter(est_codigo__pro_codigo__pro_codigo=pro_codigo)

        perfiles = {}
        for pa in perfiles_qs:
            est = pa.est_codigo
            prog = est.pro_codigo
            perfiles[est.est_codigo] = {
                "est_id": est.est_codigo,
                "nombres": est.est_nombre,
                "apellidos": est.est_apellido,
                "programa": getattr(prog, "pro_codigo", None),
                "programa_nombre": getattr(prog, "pro_nombre", None),
                "porcentaje_avance": float(pa.porcentaje_avance or 0),
                "promedio": float(pa.promedio or 0),
                "nivelado": bool(pa.nivelado),
                "creditos_aprob_total": int(pa.creditos_aprob_total or 0),
                "num_periodos_matriculados": int(pa.num_periodos_matriculados or 0),
                "num_electivas_cursadas": int(pa.num_electivas_cursadas or 0),
            }

        if not perfiles:
            return Response([], status=status.HTTP_200_OK)

        est_ids = list(perfiles.keys())

        # 2) Selecciones (por prioridad)
        selec_qs = (
            Sel.objects.filter(sel_anio=anio, sel_num_semestre=semestre, est_codigo_id__in=est_ids)
            .select_related("ele_codigo")
            .order_by("est_codigo_id", "sel_prioridad")
        )
        selecciones = defaultdict(list)
        for s in selec_qs:
            selecciones[s.est_codigo_id].append({
                "prioridad": s.sel_prioridad,
                "ele_codigo": s.ele_codigo.ele_codigo,
                "ele_nombre": s.ele_codigo.ele_nombre,
            })

        # 3) Asignaciones (firmes / espera)
        asig_qs = (
            Asignacion.objects.filter(anio=anio, asi_num_semestre=semestre, est_codigo_id__in=est_ids)
            .select_related("ele_codigo")
        )
        firmes = defaultdict(list)
        espera = defaultdict(list)
        for a in asig_qs:
            payload = {
                "ele_codigo": a.ele_codigo.ele_codigo if a.ele_codigo_id else a.ele_codigo_id,
                "ele_nombre": getattr(a.ele_codigo, "ele_nombre", None),
            }
            if getattr(a, "en_lista_espera", False):
                espera[a.est_codigo_id].append(payload)
            else:
                firmes[a.est_codigo_id].append(payload)

        # 4) Ranking para ORDENAR (global o por programa si lo pasas)
        ranking = construir_lista_prioridad(
            anio=anio,
            num_semestre=semestre,
            pro_codigo=pro_codigo,         # si lo envías, ordena dentro del programa; si no, global
            estrategia=estrategia,
        )
        # tomamos solo los que están en perfiles (por si el ranking incluye otros)
        orden_ranking = [dto.est_codigo for dto in ranking if getattr(dto, "est_codigo", None) in perfiles]

        # 5) Ensamblar respuesta en ORDEN DE RANKING
        def fila(est_id: int) -> dict:
            base = perfiles[est_id]
            prog = base["programa"] or "DEFAULT"
            debe_total = int(ELECTIVAS_DEBE_VER.get(prog, ELECTIVAS_DEBE_VER["DEFAULT"]))
            cursadas = int(base["num_electivas_cursadas"])
            faltan = max(0, debe_total - cursadas)
            return {
                "est_id": est_id,
                "nombres": base["nombres"],
                "apellidos": base["apellidos"],
                "programa": base["programa"],
                "programa_nombre": base["programa_nombre"],
                "porcentaje_avance": base["porcentaje_avance"],
                "promedio": base["promedio"],
                "nivelado": base["nivelado"],
                "creditos_aprob_total": base["creditos_aprob_total"],
                "num_periodos_matriculados": base["num_periodos_matriculados"],
                "electivas_debe_ver": debe_total,
                "num_electivas_cursadas": cursadas,
                "electivas_faltantes": faltan,
                "selecciones": selecciones.get(est_id, []),
                "asignadas_firmes": firmes.get(est_id, []),
                "asignadas_espera": espera.get(est_id, []),
            }

        # Si se pidió un est_codigo específico, prioriza su fila (igual respetando ranking si hay varios)
        if est_codigo:
            orden_final = [eid for eid in orden_ranking if str(eid) == str(est_codigo)]
        else:
            # ranking primero; si faltó alguien con perfil pero no está en ranking, lo anexamos al final alfabéticamente
            resto = sorted([eid for eid in perfiles.keys() if eid not in orden_ranking],
                           key=lambda x: ((perfiles[x]["apellidos"] or ""), (perfiles[x]["nombres"] or "")))
            orden_final = orden_ranking + resto

        out = [fila(eid) for eid in orden_final]
        return Response(out, status=status.HTTP_200_OK)
    

    @action(detail=False, methods=["delete"], url_path="purgar")
    def purgar(self, request):
        """
        DELETE /api/asignacion/purgar/?anio=2025&semestre=1
        Filtros opcionales:
          - pro_codigo=PIS        (filtra por programa del estudiante)
          - est_codigo=100123456  (un estudiante específico)
          - ele_codigo=ELEC001    (una electiva específica)
          - solo_espera=1         (solo filas en lista de espera)
          - solo_firmes=1         (solo filas con cupo firme)
          - dry_run=1             (no borra; solo devuelve cuántas borraría)
        """
        permission_classes = [IsAsignador]

        try:
            anio = int(request.query_params["anio"])
            semestre = int(request.query_params["semestre"])
        except (KeyError, ValueError):
            return Response(
                {"detail": "Faltan parámetros anio y semestre (enteros)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        pro_codigo   = request.query_params.get("pro_codigo") or None
        est_codigo   = request.query_params.get("est_codigo") or None
        ele_codigo   = request.query_params.get("ele_codigo") or None
        solo_espera  = request.query_params.get("solo_espera") == "1"
        solo_firmes  = request.query_params.get("solo_firmes") == "1"
        dry_run      = request.query_params.get("dry_run") == "1"

        qs = Asignacion.objects.filter(anio=anio, asi_num_semestre=semestre)

        if pro_codigo:
            qs = qs.filter(est_codigo__pro_codigo__pro_codigo=pro_codigo)
        if est_codigo:
            qs = qs.filter(est_codigo_id=est_codigo)
        if ele_codigo:
            qs = qs.filter(ele_codigo_id=ele_codigo)

        if solo_espera and solo_firmes:
            return Response(
                {"detail": "Use solo_espera=1 o solo_firmes=1, no ambos."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if solo_espera:
            qs = qs.filter(en_lista_espera=True)
        if solo_firmes:
            qs = qs.filter(en_lista_espera=False)

        total = qs.count()
        if dry_run:
            return Response(
                {"periodo": f"{anio}-{semestre}", "borraria": total, "dry_run": True},
                status=status.HTTP_200_OK,
            )

        with transaction.atomic():
            borrados, _ = qs.delete()

        return Response(
            {
                "periodo": f"{anio}-{semestre}",
                "borrados": borrados,
                "filtros": {
                    "pro_codigo": pro_codigo,
                    "est_codigo": est_codigo,
                    "ele_codigo": ele_codigo,
                    "solo_espera": solo_espera,
                    "solo_firmes": solo_firmes,
                },
            },
            status=status.HTTP_200_OK,
        )
    
    @action(detail=False, methods=["get"], url_path="ranking-asignados")
    def ranking_asignados(self, request):
        """
        GET /api/asignacion/electiva/ranking-asignados/?anio=2025&semestre=1&ele_codigo=ELEC001
        Opcionales: pro_codigo, estrategia (default "protocol-2025")

        Lista SOLO estudiantes que YA están asignados a esa electiva (FIRME o ESPERA),
        ordenados por el ranking oficial.
        """
        permission_classes = [IsAsignador]

        try:
            anio = int(request.query_params["anio"])
            semestre = int(request.query_params["semestre"])
            ele_codigo = request.query_params["ele_codigo"]
        except (KeyError, ValueError):
            return Response(
                {"detail": "Parámetros requeridos: anio (int), semestre (int), ele_codigo (str)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        pro_codigo = request.query_params.get("pro_codigo") or None
        estrategia = request.query_params.get("estrategia", "protocol-2025")

        # 1) Traer SOLO asignaciones (FIRME/ESPERA) de esa electiva y periodo
        asignadas = list(
            Asignacion.objects
            .filter(anio=anio, asi_num_semestre=semestre, ele_codigo__ele_codigo=ele_codigo)
            .values("est_codigo_id", "en_lista_espera")
        )
        if not asignadas:
            return Response({
                "periodo": f"{anio}-{semestre}",
                "ele_codigo": ele_codigo,
                "totales": {"FIRME": 0, "ESPERA": 0},
                "total_registros": 0,
                "estudiantes": []
            }, status=status.HTTP_200_OK)

        est_ids = {a["est_codigo_id"] for a in asignadas}
        estado_map = {a["est_codigo_id"]: ("ESPERA" if a["en_lista_espera"] else "FIRME") for a in asignadas}

        # 2) perfiles del período para esos estudiantes
        perfiles = {
            p["est_codigo_id"]: p
            for p in (PerfilAcademico.objects
                        .filter(perfil_anio=anio, perfil_semestre=semestre, est_codigo_id__in=est_ids)
                        .select_related("est_codigo__pro_codigo")
                        .values("est_codigo_id", "porcentaje_avance", "promedio",
                                "nivelado", "creditos_aprob_total", "num_periodos_matriculados",
                                "num_electivas_cursadas",
                                "est_codigo__est_nombre", "est_codigo__est_apellido",
                                "est_codigo__pro_codigo__pro_codigo",
                                "est_codigo__pro_codigo__pro_nombre"))
        }

        # 3) ranking (global o por programa si quisieras; aquí global para orden consistente)
        ranking = construir_lista_prioridad(
            anio=anio,
            num_semestre=semestre,
            pro_codigo=None,                  # orden global del ranking
            estrategia=estrategia,
        )

        # 4) Tomar SOLO los que están en asignación (manteniendo orden del ranking)
        ordenados = [dto for dto in ranking if getattr(dto, "est_codigo", None) in est_ids]

        # 5) armar payload
        items = []
        totales = {"FIRME": 0, "ESPERA": 0}

        for pos, dto in enumerate(ordenados, start=1):
            est_id = dto.est_codigo
            st = estado_map.get(est_id)  # "FIRME" / "ESPERA"
            if not st:
                continue  # (por seguridad)

            totales[st] += 1
            pf = perfiles.get(est_id, {})
            items.append({
                "rank": pos,
                "est_id": est_id,
                "nombres": pf.get("est_codigo__est_nombre"),
                "apellidos": pf.get("est_codigo__est_apellido"),
                "programa": pf.get("est_codigo__pro_codigo__pro_codigo"),
                "programa_nombre": pf.get("est_codigo__pro_codigo__pro_nombre"),
                "estado": st,  # FIRME / ESPERA
                "porcentaje_avance": float(pf.get("porcentaje_avance") or 0.0),
                "promedio": float(pf.get("promedio") or 0.0),
                "nivelado": bool(pf.get("nivelado") or False),
                "creditos_aprob_total": int(pf.get("creditos_aprob_total") or 0),
                "num_periodos_matriculados": int(pf.get("num_periodos_matriculados") or 0),
                "num_electivas_cursadas": int(pf.get("num_electivas_cursadas") or 0),
            })

        return Response({
            "periodo": f"{anio}-{semestre}",
            "ele_codigo": ele_codigo,
            "totales": totales,
            "total_registros": len(items),
            "estudiantes": items,
        }, status=status.HTTP_200_OK)
