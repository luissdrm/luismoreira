#!/usr/bin/env python3
"""
Gera js/galeria.js a partir das imagens das pastas em assets/imagens.

- Cada aba do site (lista "categorias" em js/config.js) lê a pasta com o mesmo nome,
  em minúsculas e com hífen. Ex.: "3D Illustration" -> assets/imagens/3d-illustration
- As imagens aparecem em ordem alfabética (use 01-, 02-, ... no começo do nome para controlar a ordem).
- O título vem do nome do arquivo ("01-tree-trunk.jpg" vira "Tree trunk"). Para mudar o título ou acrescentar
  ano, técnica, descrição e texto alternativo, use assets/imagens/detalhes.json (tudo opcional).

No GitHub, este script roda sozinho a cada envio de arquivos (veja .github/workflows/publicar.yml).
Para rodar no computador: python3 tools/gerar_galeria.py
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
PASTA = RAIZ / "assets" / "imagens"
SAIDA = RAIZ / "js" / "galeria.js"
EXTENSOES = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif"}


def slug(texto):
    texto = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", texto).strip("-")


def ordem_natural(caminho):
    return [int(p) if p.isdigit() else p for p in re.split(r"(\d+)", caminho.name.lower())]


def ler_categorias():
    config = (RAIZ / "js" / "config.js").read_text(encoding="utf-8")
    bloco = re.search(r"categorias\s*:\s*\[(.*?)\]", config, re.S)
    if not bloco:
        sys.exit('Não encontrei a lista "categorias" em js/config.js')
    return re.findall(r'"([^"]+)"', bloco.group(1))


def tamanho(arquivo):
    """Largura e altura em pixels (evita que a página 'pule' enquanto as imagens carregam)."""
    if arquivo.suffix.lower() == ".svg":
        texto = arquivo.read_text(encoding="utf-8", errors="ignore")
        m = re.search(r'viewBox="\s*[-\d.]+[ ,]+[-\d.]+[ ,]+([\d.]+)[ ,]+([\d.]+)', texto)
        return (round(float(m.group(1))), round(float(m.group(2)))) if m else (None, None)
    try:
        from PIL import Image, ImageOps
        with Image.open(arquivo) as im:
            return ImageOps.exif_transpose(im).size
    except Exception:
        return (None, None)


def titulo_do_arquivo(arquivo):
    """Título automático a partir do nome: "01-tree-trunk.jpg" vira "Tree trunk"."""
    nome = re.sub(r"^\d+[-_. ]*", "", arquivo.stem)
    nome = re.sub(r"[-_]+", " ", nome).strip()
    return (nome[:1].upper() + nome[1:]) if nome else arquivo.stem


def ler_detalhes():
    """Lê assets/imagens/detalhes.json. Ignora maiúsculas/minúsculas no nome do arquivo e campos em branco."""
    arquivo = PASTA / "detalhes.json"
    if not arquivo.exists():
        return {}
    try:
        bruto = json.loads(arquivo.read_text(encoding="utf-8"))
    except json.JSONDecodeError as erro:
        sys.exit(
            f"ERRO em assets/imagens/detalhes.json (linha {erro.lineno}, coluna {erro.colno}): {erro.msg}. "
            'Confira as vírgulas (a última linha não leva vírgula) e use aspas retas (").'
        )
    limpo = {}
    for chave, campos in bruto.items():
        if not isinstance(campos, dict):
            continue
        campos = {k: (v.strip() if isinstance(v, str) else v) for k, v in campos.items()}
        limpo[chave.strip().lower()] = {k: v for k, v in campos.items() if v not in ("", None)}
    return limpo


def main():
    categorias = ler_categorias()
    detalhes = ler_detalhes()

    obras = []
    for categoria in categorias:
        pasta = PASTA / slug(categoria)
        if not pasta.is_dir():
            print(f'Aviso: a pasta {pasta.relative_to(RAIZ)} não existe (aba "{categoria}" ficará vazia).')
            continue
        arquivos = sorted((a for a in pasta.iterdir() if a.suffix.lower() in EXTENSOES), key=ordem_natural)
        for arquivo in arquivos:
            chave = f"{pasta.name}/{arquivo.name}"
            largura, altura = tamanho(arquivo)
            obra = {
                "id": slug(f"{pasta.name}-{arquivo.stem}"),
                "categoria": categoria,
                "arquivo": f"assets/imagens/{chave}",
            }
            if largura and altura:
                obra["largura"], obra["altura"] = largura, altura
            obra["titulo"] = titulo_do_arquivo(arquivo)
            obra.update(detalhes.get(chave.lower(), {}))
            obras.append(obra)

    conhecidas = {slug(c) for c in categorias}
    for pasta in sorted(p for p in PASTA.iterdir() if p.is_dir()):
        if pasta.name not in conhecidas:
            print(f'Aviso: a pasta {pasta.relative_to(RAIZ)} não corresponde a nenhuma aba e foi ignorada.')

    conteudo = (
        "/* ARQUIVO GERADO AUTOMATICAMENTE por tools/gerar_galeria.py. Não edite à mão. */\n"
        "window.OBRAS = " + json.dumps(obras, ensure_ascii=False, indent=2) + ";\n"
    )
    SAIDA.write_text(conteudo, encoding="utf-8")
    print(f"{len(obras)} obra(s) em {SAIDA.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
