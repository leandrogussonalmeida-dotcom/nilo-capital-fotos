# Motor de publicação

Desenha as peças aprovadas com o mesmo motor do Estúdio Nilo Capital e prepara o pedido para o Windsor (conta 17841457798912539, @nilocapital).

1. Baixe do banco do estúdio o documento da peça (coleção `pecas`) para `motor/dbdump/pecas/ID.json`.
2. Na pasta `motor/`, suba um servidor local: `python3 -m http.server 8765`.
3. Rode `node publicar.js ID1,ID2`. Só passa a peça cuja aprovação tem o mesmo selo da versão atual.
4. As imagens saem em `publicadas/ID/` com o `pedido.json`. Faça commit e push: o endereço público é `raw.githubusercontent.com/.../main/publicadas/ID/...`.
5. Publique uma vez pelo Windsor com a ação e os parâmetros do `pedido.json` e registre o link no estúdio.

`fichas.json` é o acervo base embutido no estúdio. Versões editadas no estúdio vêm do banco, não daqui.
