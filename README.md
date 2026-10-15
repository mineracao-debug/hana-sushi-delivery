# Hana Sushi — Netlify

Cardápio React com seleção de estado antes da cidade, localização aproximada por IP, carrinho e checkout. A loja é pública, sem login do ChatGPT. O Adminx exige apenas o usuário e a senha próprios da loja.

A localização começa a carregar antes do aplicativo, reutiliza a cidade salva e limita a espera de rede a 3 segundos. O seletor mostra estado e cidade, sem botão de detecção nem aviso adicional.

O checkout usa uma única tela, resumo expansível e barra de pagamento no celular. O CEP é consultado automaticamente ao completar 8 dígitos, com máscara, cancelamento de respostas antigas e preenchimento manual em caso de falha. CEPs gerais da cidade permitem completar rua e bairro. A consulta usa o ViaCEP (https://viacep.com.br/).

## Desenvolvimento e publicação

Execute `npm ci` e `npm run build` com Node 24. Publique a pasta `dist` no Netlify. O arquivo `netlify.toml` também permite conectar este repositório ao Netlify para builds automáticos. A publicação inicial foi feita por upload manual; novos commits não publicam automaticamente até conectar o repositório.

Os componentes estão diretamente neste repositório. `public-assets.tar.gz` contém as imagens, fontes e os arquivos estáticos do Adminx e é extraído pelo build. `hana-sushi-codigo.zip` contém o código completo do servidor original, migrações e testes.

## APIs e dados

As chamadas `/api/*` são encaminhadas pelo Netlify para `https://hana-sushi-delivery.beneditocsj88.chatgpt.site`. Os pedidos, configurações, autenticação do Adminx e banco continuam nesse servidor compartilhado. Esta publicação depende de ele permanecer ativo. A comunicação ocorre pelo domínio da loja; cookies de sessão permanecem HttpOnly.

No servidor, `PUBLIC_STORE_ORIGINS` deve conter a origem HTTPS exata do novo site. Domínios personalizados adicionais devem ser autorizados ali antes do uso. Não usar curingas. Nenhuma chave privada ou senha é incluída neste repositório ou nos arquivos estáticos.

As integrações Umbrellapag, Sharkpay e UTMify são do projeto Shopping. O Pix só fica disponível após cadastrar uma chave válida no Adminx. O token privado de vendas da UTMify também deve ser cadastrado no painel.
