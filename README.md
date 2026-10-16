# Hana Sushi — Netlify

Cardápio React com seleção de estado antes da cidade, localização aproximada por IP, carrinho e checkout. A loja é pública, sem login do ChatGPT. O Adminx exige apenas o usuário e a senha próprios da loja.

A localização começa a carregar antes do aplicativo, reutiliza a cidade salva e limita a espera de rede a 3 segundos. O seletor mostra estado e cidade, sem botão de detecção nem aviso adicional.

O checkout usa uma única tela, resumo expansível e barra de pagamento no celular. O endereço é preenchido diretamente, sem campo de CEP. Cidade e estado aproveitam a seleção salva. O servidor consulta o CEP pelo endereço no ViaCEP (https://viacep.com.br/) antes da emissão do Pix, conferindo rua, bairro, cidade, estado e regras explícitas de numeração. Se não houver correspondência única, pede a revisão do endereço antes de criar a cobrança.

## Desenvolvimento e publicação

Execute `npm ci` e `npm run build` com Node 24. Publique a pasta `dist` no Netlify. O arquivo `netlify.toml` também permite conectar este repositório ao Netlify para builds automáticos. A publicação inicial foi feita por upload manual; novos commits não publicam automaticamente até conectar o repositório.

Os componentes estão diretamente neste repositório. `public-assets.tar.gz` contém as imagens, fontes e os arquivos estáticos do Adminx e é extraído pelo build. `hana-sushi-codigo.zip` contém o código completo do servidor original, migrações e testes.

## APIs e dados

As chamadas `/api/*` são encaminhadas pelo Netlify para `https://hana-sushi-delivery.beneditocsj88.chatgpt.site`. Os pedidos, configurações, autenticação do Adminx e banco continuam nesse servidor compartilhado. Esta publicação depende de ele permanecer ativo. A comunicação ocorre pelo domínio da loja; cookies de sessão permanecem HttpOnly.

No servidor, `PUBLIC_STORE_ORIGINS` deve conter a origem HTTPS exata do novo site. Domínios personalizados adicionais devem ser autorizados ali antes do uso. Não usar curingas. Nenhuma chave privada ou senha é incluída neste repositório ou nos arquivos estáticos.

As integrações Umbrellapag, Sharkpay e UTMify são do projeto Shopping. O Pix só fica disponível após cadastrar uma chave válida no Adminx. O token privado de vendas da UTMify também deve ser cadastrado no painel.

O checkout sempre começa como um pedido novo e não recupera Pix ou pedidos anteriores do navegador. O acompanhamento é aberto somente pelo link com o identificador do pedido gerado.


O acompanhamento em /pedido/ mostra aguardando pagamento, em preparo, saiu para entrega e entregue. O preparo começa após a confirmação real do Pix; as etapas de entrega são alteradas no Adminx, com validação de sequência e proteção contra atualizações simultâneas. O cliente recebe as atualizações automaticamente a cada 12 segundos. O acesso usa a sessão do navegador do pedido.

