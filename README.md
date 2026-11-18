# Portfólio Luís Moreira

Site estático (HTML, CSS e JavaScript puros) para o GitHub Pages. Sem marca d'água, sem anúncios e sem
hospedagem de terceiros. A galeria se atualiza sozinha: você só coloca as imagens nas pastas certas.

## Estrutura

```
index.html                       página
css/estilo.css                   visual (cores e fonte no começo do arquivo)
js/config.js                     nome, subtítulo, abas, texto "About" e links das redes
js/galeria.js                    lista de obras (GERADO AUTOMATICAMENTE; não edite)
js/app.js                        funcionamento do site
assets/imagens/2d-illustration/  imagens da aba "2D Illustration" (a primeira aba, a que abre com o site)
assets/imagens/3d-illustration/  imagens da aba "3D Illustration"
assets/favicon.png               ícone que aparece na aba do navegador
assets/imagens/detalhes.json     título, ano e técnica das obras (opcional)
tools/gerar_galeria.py           script que monta js/galeria.js
.github/workflows/publicar.yml   publica o site no GitHub Pages a cada envio
```

## Publicar pela primeira vez

1. No GitHub, clique em **New repository**, dê um nome (por exemplo `portfolio`) e deixe **Public**.
2. **Descompacte o zip no computador.** O GitHub não abre arquivos .zip: envie o conteúdo da pasta, não o zip.
3. No repositório, clique em **uploading an existing file**, arraste `index.html`, `README.md` e as pastas `css`, `js`, `assets` e `tools`, e clique em **Commit changes**.
4. Crie o arquivo do publicador. Pastas que começam com ponto (como `.github`) costumam ficar escondidas no computador e não subir no upload, então faça assim: **Add file > Create new file**, digite no campo do nome `.github/workflows/publicar.yml` (as barras criam as pastas) e cole o conteúdo do arquivo `publicar.yml` que está no zip. Clique em **Commit changes**.
5. Vá em **Settings > Pages**. Em **Source** escolha **GitHub Actions**.
6. Abra a aba **Actions**. Depois de 1 a 2 minutos o fluxo "Publicar site" fica verde, e o endereço do site aparece em **Settings > Pages**. Se o fluxo não tiver rodado sozinho, clique em **Publicar site > Run workflow**.

## Adicionar ou trocar imagens (o dia a dia)

1. No repositório, abra a pasta da aba, por exemplo `assets/imagens/2d-illustration`.
2. Clique em **Add file > Upload files**, arraste as imagens e clique em **Commit changes**.
3. Pronto. Em cerca de 1 a 2 minutos o site atualiza sozinho (acompanhe na aba **Actions**).

Para apagar uma imagem: abra o arquivo no GitHub, clique nos três pontinhos e em **Delete file**.

Cuidados:
- **Ordem:** as imagens aparecem em ordem alfabética pelo nome do arquivo. Para controlar, comece o nome com número: `01-nome.jpg`, `02-nome.jpg`... Para uma imagem nova aparecer primeiro, dê a ela um número menor que o das outras.
- **Nomes:** minúsculas, sem espaços e sem acentos (`retrato-maria.jpg`). O GitHub Pages diferencia `Foto.JPG` de `foto.jpg`.
- **Tamanho:** use JPG ou WebP com uns 2000 px no lado maior. Pelo navegador o GitHub aceita até 25 MB por arquivo.
- As imagens de exemplo (arquivos `.svg` nas duas pastas) podem ser apagadas, junto com as linhas delas em `detalhes.json`.

## Título, ano e técnica (opcional)

Sem nada disso, a obra aparece só como imagem. Para mostrar título, ano, técnica ou descrição ao abrir a obra, edite `assets/imagens/detalhes.json` (clique no lápis no GitHub) e acrescente uma linha com a pasta e o nome do arquivo:

```json
"2d-illustration/01-retrato.jpg": { "titulo": "Retrato", "ano": 2025, "tecnica": "Lápis sobre papel", "descricao": "Texto opcional.", "alt": "Descrição para leitor de tela" }
```

Todos os campos dentro das chaves são opcionais. Atenção às vírgulas: todas as linhas terminam com vírgula, menos a última.

## Mudar nome, subtítulo, About e links das redes

Edite `js/config.js` (lápis no GitHub). Os links do Instagram e do X já estão configurados; o texto de "About" ainda é um exemplo, troque pelo seu.

## Trocar o ícone e o nome da aba do navegador

- **Ícone:** envie sua imagem para a pasta `assets` com o nome exato `favicon.png` (quadrada, de preferência 512 x 512 px). Ela substitui a atual. O navegador pode demorar um pouco para mostrar o novo ícone.
- **Nome da aba:** abra `index.html` e troque o texto da linha `<title>...</title>`. Troque também as linhas `og:title` e `og:description`, que são o texto da prévia quando alguém compartilha o link.
- **Nome grande na página:** é o campo `nome` em `js/config.js`.
- **Ordem das abas:** é a lista `categorias` em `js/config.js`. A primeira da lista é a que abre com o site.

## Criar uma aba nova

1. Em `js/config.js`, acrescente o nome na lista `categorias`, por exemplo `"Characters"`.
2. Crie a pasta `assets/imagens/characters` (no GitHub, ao enviar uma imagem, digite `assets/imagens/characters/` no caminho). A pasta tem o mesmo nome da aba, em minúsculas e com hífen no lugar dos espaços.

## Testar no computador

Dê dois cliques em `index.html`. Depois de adicionar imagens, rode `python3 tools/gerar_galeria.py` (precisa de Python; `pip install pillow` ajuda a ler o tamanho das imagens) para atualizar a lista de obras. No GitHub isso é feito automaticamente.

## Observações

- A fonte (Nunito) vem do Google Fonts. Se o carregamento falhar, o site usa uma fonte arredondada do sistema.
- O clique direito e o arrastar nas imagens estão desativados, mas isso só impede o uso casual: quem usa as ferramentas do navegador ou tira print ainda consegue copiar. Para proteger de verdade, publique as imagens em tamanho reduzido (2000 px no lado maior ou menos) e não os originais.
- O site publicado é público: quem abre uma obra também consegue baixá-la. Publique imagens em tamanho de exibição, não os originais em alta resolução.
- Limites do GitHub Pages: repositório e site de até cerca de 1 GB.
