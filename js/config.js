/*
  CONFIGURAÇÃO DO SITE: nome, subtítulo, abas, texto "About" e redes sociais.
  As imagens NÃO ficam aqui: basta colocá-las nas pastas de assets/imagens
  (veja o README.md).
*/

window.SITE = {
  nome: "Luís Moreira",
  apresentacao: "2D illustrations, backgrounds, sketches, and Blender tests",

  // Abas do site, na ordem em que aparecem. Cada aba lê as imagens da pasta com o mesmo
  // nome em minúsculas e com hífen: "3D Illustration" -> assets/imagens/3d-illustration
  categorias: ["2D Illustration", "3D Illustration"],

  // Texto da seção "About". Cada item vira um parágrafo.
  sobre: [
    "I am an amateur Brazilian illustrator. My portfolio features a collection of my 2D illustrations, as well as 3D projects. To get in touch, please send me a message via Instagram or X!"
  ],

  // Ícones de redes sociais.
  redes: [
    { nome: "Instagram", icone: "instagram", url: "https://www.instagram.com/luedarts" },
    { nome: "X", icone: "x", url: "https://x.com/luedarts" }
  ]
};
