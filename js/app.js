/*
  Lógica do portfólio. Normalmente você não precisa editar este arquivo:
  as configurações ficam em js/config.js e a lista de obras é gerada em js/galeria.js.
*/
(() => {
  "use strict";

  const SITE = window.SITE || {};
  const OBRAS = Array.isArray(window.OBRAS) ? window.OBRAS : [];

  const $ = (seletor) => document.querySelector(seletor);

  /* Cria elementos sem usar innerHTML, para o texto nunca ser interpretado como código. */
  function el(tag, props = {}, ...filhos) {
    const no = document.createElement(tag);
    for (const [chave, valor] of Object.entries(props)) {
      if (valor === null || valor === undefined || valor === false) continue;
      if (chave === "class") no.className = valor;
      else if (chave === "text") no.textContent = valor;
      else if (chave.startsWith("on")) no.addEventListener(chave.slice(2), valor);
      else no.setAttribute(chave, valor === true ? "" : valor);
    }
    for (const filho of filhos.flat()) if (filho !== null && filho !== undefined) no.append(filho);
    return no;
  }

  const caminho = (arquivo) => encodeURI(arquivo || "");
  const detalhe = (obra) => [obra.tecnica, obra.ano].filter(Boolean).join(", ");
  const ICONES = {
    instagram: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.4" cy="6.6" r="1.3" fill="currentColor"/></svg>',
    x: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>'
  };

  function desenharRedes(lista) {
    lista.replaceChildren(
      ...(SITE.redes || []).map((r) => {
        const a = el("a", { href: r.url, "aria-label": r.nome, target: "_blank", rel: "noopener" });
        a.innerHTML = ICONES[r.icone] || r.nome;
        return el("li", {}, a);
      })
    );
  }

  /* ---------- Estado ---------- */
  let filtro = "Todos";
  let visiveis = OBRAS.slice();
  let atual = -1;
  let sobreAberto = false;

  /* ---------- Referências ---------- */
  const grade = $("#grade");
  const filtros = $("#filtros");
  const status = $("#status");
  const btnAbout = $("#link-about");
  const secaoAbout = $("#about");
  const dialogo = $("#visualizador");
  const palco = $("#v-palco");
  const caixaMidia = $("#v-midia");

  /* ---------- Textos do site ---------- */
  function preencherSite() {
    const nome = SITE.nome || "Portfolio";
    $("#nome").textContent = nome;
    $("#apresentacao").textContent = SITE.apresentacao || "";

    const sobre = $("#about-texto");
    const paragrafos = SITE.sobre || [];
    if (paragrafos.length) {
      sobre.replaceChildren(...paragrafos.map((texto) => el("p", { text: texto })));
    } else {
      btnAbout.hidden = true;
    }

    desenharRedes($("#redes"));
  }

  /* ---------- Filtros ---------- */
  function montarFiltros() {
    const categorias = SITE.categorias && SITE.categorias.length
      ? SITE.categorias
      : [...new Set(OBRAS.map((o) => o.categoria).filter(Boolean))];

    if (!categorias.includes(filtro)) filtro = categorias[0];

    filtros.replaceChildren(
      ...categorias.map((nome) =>
        el("button", { type: "button", class: "filtro", "data-categoria": nome, "aria-pressed": String(nome === filtro), onclick: () => aplicarFiltro(nome) }, nome)
      )
    );
  }

  function atualizarAbas() {
    filtros.querySelectorAll(".filtro").forEach((b) => {
      b.setAttribute("aria-pressed", String(!sobreAberto && b.dataset.categoria === filtro));
    });
    btnAbout.setAttribute("aria-pressed", String(sobreAberto));
  }

  function aplicarFiltro(nome) {
    filtro = nome;
    if (sobreAberto) mostrarAbout(false);
    else atualizarAbas();
    desenharGrade(true);
  }

  /* About aparece no lugar das ilustrações, só quando se clica em "About" na lateral */
  function mostrarAbout(abrirAbout) {
    sobreAberto = abrirAbout;
    secaoAbout.hidden = !abrirAbout;
    grade.hidden = abrirAbout;
    atualizarAbas();
    try { history.replaceState(null, "", abrirAbout ? "#about" : location.pathname + location.search); } catch (e) { /* ambiente restrito */ }
    window.scrollTo(0, 0);
  }

  /* ---------- Grade ---------- */
  function cartao(obra, indice) {
    const arquivo = obra.arquivo;

    const img = el("img", {
      src: caminho(arquivo),
      alt: obra.alt || obra.titulo || obra.categoria,
      width: obra.largura,
      height: obra.altura,
      loading: indice < 4 ? "eager" : "lazy",
      decoding: "async",
      draggable: "false"
    });

    const midia = el("span", { class: "midia" }, img);
    img.addEventListener("error", () => {
      midia.classList.add("falhou");
      midia.append(el("span", { class: "aviso-arquivo", text: `File not found: ${arquivo}` }));
    });

    return el(
      "li",
      { class: "item" },
      el(
        "button",
        { type: "button", class: "abrir", "aria-haspopup": "dialog", onclick: () => abrir(indice) },
        midia
      )
    );
  }

  function desenharGrade(animar) {
    visiveis = filtro === "Todos" ? OBRAS.slice() : OBRAS.filter((o) => o.categoria === filtro);
    grade.classList.remove("anima");
    grade.replaceChildren(...visiveis.map(cartao));
    if (animar) {
      void grade.offsetWidth; // reinicia a animação
      grade.classList.add("anima");
    }
    status.textContent = `${visiveis.length} ${visiveis.length === 1 ? "work shown" : "works shown"}`;
    if (!visiveis.length) {
      grade.replaceChildren(el("li", { class: "aviso-js", text: "No works in this category yet." }));
    }
  }

  /* ---------- Visualizador ---------- */
  function mostrar() {
    const obra = visiveis[atual];
    if (!obra) return;

    const imagem = el("img", { src: caminho(obra.arquivo), alt: obra.alt || obra.titulo || obra.categoria, draggable: "false" });
    imagem.addEventListener("error", () => {
      caixaMidia.replaceChildren(
        el("p", { class: "aviso-arquivo", text: `File not found: ${obra.arquivo}` })
      );
    });
    caixaMidia.replaceChildren(imagem);

    $("#v-titulo").textContent = obra.titulo || "";
    dialogo.setAttribute("aria-label", obra.titulo || obra.categoria);
    $("#v-detalhe").textContent = detalhe(obra);
    $("#v-descricao").textContent = obra.descricao || "";
    $("#v-contador").textContent = `${atual + 1} of ${visiveis.length}`;
    dialogo.classList.toggle("unica", visiveis.length < 2);

    // Atualiza o link para que a obra possa ser compartilhada (seusite.com/#obra-01)
    try { history.replaceState(null, "", `#${obra.id}`); } catch (e) { /* ambiente restrito */ }

    // Pré-carrega a próxima imagem
    const proxima = visiveis[(atual + 1) % visiveis.length];
    if (proxima) new Image().src = caminho(proxima.arquivo);
  }

  function abrir(indice) {
    atual = indice;
    mostrar();
    if (!dialogo.open) {
      dialogo.showModal();
      document.body.classList.add("travado");
    }
  }

  function navegar(passo) {
    if (visiveis.length < 2) return;
    atual = (atual + passo + visiveis.length) % visiveis.length;
    mostrar();
  }

  function configurarVisualizador() {
    $("#v-fechar").addEventListener("click", () => dialogo.close());
    btnAbout.addEventListener("click", () => mostrarAbout(!sobreAberto));
    $("#v-ant").addEventListener("click", () => navegar(-1));
    $("#v-prox").addEventListener("click", () => navegar(1));

    dialogo.addEventListener("close", () => {
      caixaMidia.replaceChildren();
      document.body.classList.remove("travado");
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { /* ambiente restrito */ }
    });

    // Clicar fora da obra fecha
    dialogo.addEventListener("click", (e) => {
      if (e.target === dialogo || e.target === palco || e.target === caixaMidia) dialogo.close();
    });

    // Setas do teclado (o Esc já fecha sozinho)
    dialogo.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); navegar(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); navegar(1); }
    });

    // Deslizar o dedo para trocar de obra
    let inicio = null;
    palco.addEventListener("pointerdown", (e) => {
      inicio = { x: e.clientX, y: e.clientY };
    });
    palco.addEventListener("pointerup", (e) => {
      if (!inicio) return;
      const dx = e.clientX - inicio.x;
      const dy = e.clientY - inicio.y;
      inicio = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) navegar(dx < 0 ? 1 : -1);
    });
    palco.addEventListener("pointercancel", () => { inicio = null; });
  }

  /* ---------- Proteção básica das imagens ---------- */
  // Sem menu do botão direito nem arrastar para outra aba. Isto só impede o uso casual:
  // quem usa as ferramentas do navegador ou tira print ainda consegue copiar a imagem.
  document.addEventListener("contextmenu", (e) => {
    if (e.target.closest && e.target.closest("img, .midia, .abrir, .visualizador")) e.preventDefault();
  });
  document.addEventListener("dragstart", (e) => {
    if (e.target.tagName === "IMG") e.preventDefault();
  });

  /* ---------- Início ---------- */
  preencherSite();
  montarFiltros();
  desenharGrade(false);
  configurarVisualizador();

  // Link direto para uma obra (ex.: seusite.com/#obra-01)
  const idNoLink = decodeURIComponent(location.hash.slice(1));
  if (idNoLink === "about" && !btnAbout.hidden) mostrarAbout(true);
  const obraDoLink = OBRAS.find((o) => o.id === idNoLink);
  if (obraDoLink) {
    aplicarFiltro(obraDoLink.categoria);
    abrir(visiveis.findIndex((o) => o.id === idNoLink));
  }
})();
