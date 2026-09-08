# Salgado das Cunhadas 🥟

Página de vendas estática (HTML/CSS/JS puro) para uma revenda de bandejas de
salgados congelados. O cliente monta o carrinho e finaliza o pedido pelo
WhatsApp.

## Estrutura

```
SalgadoDasCunhadas/
├── index.html
├── assets/
│   ├── css/style.css
│   ├── js/script.js
│   └── img/            # imagens dos produtos (.png / .jpeg)
└── README.md
```

## Como rodar

Basta abrir o `index.html` no navegador. Para testar o `localStorage` sem
bloqueios, sirva a pasta localmente:

```bash
npx serve .
# ou
python -m http.server
```

## Configuração

Os dados que mudam com frequência ficam no topo de `assets/js/script.js`:

| Constante         | O que é                                                    |
|-------------------|------------------------------------------------------------|
| `ORDER_WHATSAPP`  | número que recebe os pedidos (e o botão flutuante)         |
| `CONTACTS`        | números dos botões "Falar com…"                            |
| `DELIVERY_FEE`    | taxa de entrega em R$; `0` = sem cobrança / combinar       |
| `PRODUCTS`        | catálogo (nome, preço, imagem, alt)                        |

Formato do número: `55` + DDD + `9` + 8 dígitos (13 no total).

Com `DELIVERY_FEE > 0`, ao escolher "Entregar" o carrinho passa a mostrar
subtotal + entrega e a taxa entra no total e na mensagem do WhatsApp.

### Adicionar/editar um produto

Edite o array `PRODUCTS`. Preço e imagem ficam em um só lugar — o card e o
carrinho são gerados a partir daí.

## Recursos

- Carrinho e tema (claro/escuro) persistidos em `localStorage`.
- Catálogo, preços e imagens em um único array (`PRODUCTS`).
- Moeda formatada em `pt-BR` (`Intl.NumberFormat`).
- Validação inline do formulário (nome, telefone, pagamento, entrega).
- Botão flutuante do WhatsApp, seção "Como funciona" e aviso `<noscript>`.
- Acessibilidade: `<main>`/`<section>`, `<label>` em todos os campos,
  `aria-label`/`aria-invalid`, modal com `role="dialog"` e foco gerenciado,
  `@media (prefers-reduced-motion)`.

## Pendências conhecidas

- `assets/img/salgado.png` é reutilizada por dois produtos diferentes
  ("7 pequenos" e "5 grandes + 2 pequenos"). Trocar por fotos próprias.
- Os números de WhatsApp foram padronizados para 13 dígitos assumindo que
  faltava só o `9` após o DDD. **Confirmar os números reais.**
- Contador de visitantes depende de serviço externo (`profile-counter.glitch.me`).
- Links das redes sociais no rodapé ainda apontam para `#` (faltam as URLs reais).
- O nº do pedido é sequencial **por dispositivo** (`localStorage`), não global.
- Imagem de fundo e Font Awesome vêm de CDN; para 100% offline, baixar e servir localmente.
