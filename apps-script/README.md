# Receber os cadastros na planilha

Este Apps Script grava cada inscrição na aba `Cadastros` da planilha `Cadastro 1000Grau - Evento`. A aba é criada automaticamente na primeira inscrição; a aba `Página1` permanece intacta.

## Publicar o endpoint

1. Abra a [planilha do evento](https://docs.google.com/spreadsheets/d/1k8EYuawyUIjdEPjxzfjexCM6LwgVPPuvpI2IWFLajmM/edit).
2. No menu, acesse **Extensões → Apps Script**.
3. Substitua o conteúdo do arquivo `Code.gs` pelo conteúdo de [`Code.gs`](./Code.gs) e salve.
4. Clique em **Implantar → Nova implantação** e selecione **App da Web**.
5. Configure **Executar como: eu** e **Quem pode acessar: qualquer pessoa**. Isso permite que visitantes enviem os dados sem tornar a planilha editável por link.
6. Clique em **Implantar**, autorize o script com a conta proprietária da planilha e copie a URL do app da Web que termina em `/exec`.
7. Envie essa URL para ser conectada ao formulário do site.

## Diagnóstico sem gravar dados

Para atualizar um endpoint existente, substitua o código, salve e acesse **Implantar → Gerenciar implantações → Editar**. Selecione **Nova versão** e implante novamente. Depois, abra a mesma URL `/exec` no navegador. Uma resposta `{"ok":true,"spreadsheetAccess":true,...}` confirma que o script consegue abrir a planilha; esse diagnóstico não grava linhas. Se `spreadsheetAccess` vier `false`, verifique se a implantação executa como a conta proprietária da planilha e autorize o acesso solicitado.

Se um envio falhar, a página agora informa a etapa (`validation`, `spreadsheet_access`, `sheet_setup` ou `append_row`). `spreadsheet_access` normalmente indica que o script não tem acesso ao arquivo; `append_row` indica que abriu a planilha, mas não conseguiu gravar a linha.

O endpoint só aceita `POST`, valida os campos e acrescenta data e hora junto às respostas. Ele não lê nem expõe as linhas da planilha. Como o app é executado como proprietário e acessível publicamente, qualquer pessoa com a URL pode solicitar gravações. A URL ficará visível no código público do site; o script só permite acrescentar inscrições, e os envios devem ser revisados na aba `Cadastros`.
