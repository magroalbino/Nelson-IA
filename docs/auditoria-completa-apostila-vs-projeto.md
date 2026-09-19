# Auditoria do Nelson IA

## Comparação com a apostila de desenvolvimento incremental

**Data da auditoria:** 19 de setembro de 2026  
**Repositório auditado:** `magroalbino/Nelson-IA`  
**Commit avaliado:** `164b451`  
**Documento-base:** *Apostila Nelson IA — Desenvolvimento Incremental com Manus AI*

## 1. Conclusão executiva

O Nelson IA **já possui um protótipo funcional de ponta a ponta**. O usuário consegue entrar com e-mail e senha, abrir o analisador, enviar um PDF, executar extração de texto com fallback de OCR, chamar diretamente a API Gemini, visualizar um relatório e baixar um PDF formatado. Também existem um gerador de petições e uma central de ajuda.

Entretanto, o produto ainda está mais próximo de uma **demonstração integrada** do que de um analisador previdenciário confiável. A implementação atual não representa o CNIS como dados estruturados. Ela extrai texto, localiza competências e alguns indicadores por expressões regulares, calcula uma quantidade aproximada de meses e pede à IA que explique os fatos encontrados. Isso permite demonstrar o fluxo, mas não sustenta, por si só, conclusões confiáveis sobre tempo de contribuição, carência, aposentadoria ou inconsistências.

A principal recomendação é **não reconstruir o aplicativo**. A base de Next.js, a rota multipart e o pipeline próprio podem ser preservados. O menor conjunto de mudanças para aproximar o projeto de uma primeira versão realmente utilizável é:

1. transformar a extração em um modelo estruturado e rastreável;
2. separar fatos extraídos, cálculos, alertas e interpretação;
3. substituir os cálculos atuais de demonstração por funções determinísticas testadas;
4. apresentar ao usuário o que foi encontrado, o que é estimativa e o que precisa ser conferido;
5. testar o fluxo com CNIS anonimizados e casos-limite antes de ampliar funcionalidades.

A apostila está alinhada com esse diagnóstico. Ela recomenda a cadeia **entrada → extração → organização → auditoria → cálculo → relatório** e orienta a usar IA para interpretação, classificação e explicação, mas não para decidir sozinha cálculos previdenciários críticos [1]. O código atual cobre parcialmente a entrada, a extração e o relatório. As etapas intermediárias ainda estão comprimidas em texto livre e em um único resultado produzido pelo modelo.

## 2. Escopo e método

A auditoria comparou a apostila integralmente lida com o estado do repositório. Foram examinados o fluxo de autenticação, as rotas do dashboard, o analisador de CNIS, a rota de upload, as dependências, os fluxos Genkit legados, o Firebase, a documentação e a presença de testes.

O foco foi identificar o menor conjunto de mudanças necessário para um MVP honesto, verificável e útil para segurados. Não foi feita alteração de código durante a auditoria.

## 3. Estado atual do aplicativo

### 3.1 O que já está funcionando

| Área | Estado observado | Evidência principal |
|---|---|---|
| Acesso | Login e cadastro por e-mail e senha funcionam no cliente Firebase. Há redefinição de senha. | `src/components/auth/login-form.tsx` |
| Interface | Dashboard, analisador de CNIS, gerador de petições, perfil e suporte estão disponíveis. | `src/app/dashboard/*` |
| Upload do CNIS | A tela envia o arquivo por `multipart/form-data` para uma rota HTTP dedicada. O limite é 25 MB. | `src/app/api/analyze-cnis/route.ts` e `src/app/dashboard/cnis-analyzer/page.tsx` |
| Validação básica | O servidor verifica arquivo ausente, arquivo vazio, tamanho e assinatura binária `%PDF-`. | `src/app/api/analyze-cnis/route.ts` |
| Extração textual | O sistema usa `pdf-parse` e evita o `index.js` problemático do pacote. | `src/lib/cnis-analyzer.ts` |
| OCR | Quando o texto extraído tem menos de 250 caracteres, o servidor converte até 20 páginas com `pdftoppm` e executa Tesseract em português. | `src/lib/cnis-analyzer.ts` |
| Modelo de IA | A chamada é direta à API REST Gemini. Há tentativas e fallback entre `gemini-2.5-flash` e `gemini-2.5-flash-lite`. | `src/lib/cnis-analyzer.ts` |
| Relatório visual | O resultado mostra resumo, carência, risco, qualidade, progresso, pendências, recomendações e próximos passos. | `src/app/dashboard/cnis-analyzer/page.tsx` |
| Exportação | O navegador gera um PDF visual com cartões e seções. | `jspdf` e `downloadReport()` |
| Suporte | Existe uma central com FAQ, checklist e canal para relatar problema. | `src/app/dashboard/support/page.tsx` |
| Deploy | O projeto compila e o build de produção foi validado em commits recentes. | histórico Git e `npm run build` |

Esses pontos representam uma base útil para a primeira validação com usuários. O fluxo principal não precisa ser refeito.

### 3.2 O que está parcialmente implementado

#### Entrada e extração

O upload e a leitura básica estão implementados, mas a extração ainda é pouco específica para o CNIS. O tipo `CnisFacts` contém apenas texto, quantidade de páginas, competências, indicadores, períodos inferidos e uma flag de OCR. Não há entidades de vínculo, empregador, categoria, remuneração, benefício ou situação da competência.

A função `inferPeriods()` considera duas datas encontradas na mesma linha como início e fim de um período. Essa heurística pode ser útil como sinal preliminar, mas não é suficiente para representar a tabela real do CNIS. Também não guarda página, coordenada, linha ou trecho com uma referência estável de origem.

O OCR é um fallback razoável para protótipo, porém tem limites importantes: processa no máximo 20 páginas, depende de binários do sistema (`pdftoppm`), pode ser lento em funções serverless e não oferece uma medida de confiança por campo. Quando o texto é curto, todo o resultado textual é substituído pelo OCR, sem comparação entre as duas fontes.

#### IA

A IA recebe fatos parcialmente estruturados e um recorte de até 50.000 caracteres. Ela produz classificação, resumo e recomendações em JSON validado por Zod. Isso é uma boa separação inicial entre extração e interpretação, mas o prompt ainda pede à IA uma análise ampla de natureza previdenciária.

Os campos determinísticos de carência, tempo e progresso são mesclados no retorno final e prevalecem sobre o que a IA produzir. Isso é positivo como direção, mas os próprios cálculos atuais ainda são simplificados demais para serem considerados cálculos previdenciários confiáveis.

#### Relatório

O relatório para o segurado já existe e usa linguagem relativamente simples. Porém, ele não apresenta a evidência que sustenta cada achado. O usuário vê o alerta e a recomendação, mas não consegue abrir o trecho do CNIS, a página de origem, o vínculo relacionado ou a regra utilizada.

A exportação em PDF melhora a apresentação, mas exporta principalmente a interpretação final. Ainda não exporta a base estruturada, as fontes, as premissas e o grau de incerteza por conclusão.

#### Autenticação e dados

O Firebase Authentication está integrado no cliente. Firestore e Storage são inicializados em `src/lib/firebase.ts`, mas não são utilizados pelo fluxo atual. Não há persistência de análises, histórico de documentos, versionamento de relatórios ou associação do resultado ao usuário.

O layout do dashboard não contém uma barreira server-side explícita. A tela de login redireciona usuários autenticados, mas a proteção real de cada rota não está centralizada em middleware ou em uma verificação no servidor. Isso deve ser corrigido antes de armazenar documentos ou disponibilizar resultados persistentes.

#### Gerador de petições

A tela existe, mas o fluxo ainda depende de `generateLegalPetition`, que usa Genkit. A migração para chamada direta à Gemini foi feita para o analisador de CNIS, não para todos os fluxos do produto. Além disso, a tela envia um `data URI` no campo oculto, ao contrário do caminho multipart adotado para o CNIS. Deve ser considerado um recurso experimental até ser testado com documentos reais.

### 3.3 O que ainda não existe

As lacunas abaixo correspondem diretamente às etapas centrais da apostila:

- **Modelo estruturado do CNIS.** Não há estruturas persistentes ou completas para vínculos, remunerações, contribuições, benefícios, indicadores, períodos e fontes.
- **Rastreabilidade.** Não há página, trecho, campo, linha ou evidência associada aos dados e alertas.
- **Linha do tempo previdenciária.** A interface não apresenta uma timeline conferível de vínculos, benefícios, lacunas e sobreposições.
- **Auditoria explícita.** Não existe uma camada que classifique achados como `DADO`, `ALERTA` ou `HIPÓTESE` e explique a evidência.
- **Cálculo previdenciário confiável.** Não há contagem de períodos com tratamento de sobreposição, lacunas, competências válidas, categorias ou situações especiais.
- **Regras e cenários.** Não existe simulação com premissas, dados utilizados, regra aplicada, resultado e limitações.
- **Relatório profissional.** Não há uma visão técnica complementar com evidências, indicadores, documentos necessários e pontos que exigem análise humana.
- **Casos de referência e testes automatizados.** Não há diretório de testes, casos anonimizados, testes unitários ou testes de integração no repositório.
- **Métricas de uso e qualidade.** Não há medição de tempo de análise, taxa de falha, campos não identificados, falsos alertas ou comparação com análise humana.
- **Persistência segura.** Não há histórico ou armazenamento ligado ao usuário, o que reduz risco de retenção indevida neste momento, mas também impede continuidade de uso.

## 4. Comparação direta com o caminho da apostila

| Etapa proposta na apostila | Situação atual | Diagnóstico |
|---|---|---|
| 1. Entrada | Implementada | O upload multipart, a assinatura do PDF e o limite de tamanho estão adequados para o protótipo. |
| 2. Extração | Parcial | Há texto e OCR, mas a extração não preserva entidades nem origem por página/campo. |
| 3. Organização | Insuficiente | Competências, indicadores e períodos são arrays simples; não há modelo CNIS consistente. |
| 4. Auditoria | Experimental | A IA sugere pendências, mas não há motor de regras nem distinção formal entre dado, alerta e hipótese. |
| 5. Cálculo | Insuficiente | A contagem usa competências únicas encontradas no texto e uma referência fixa de 35 anos. |
| 6. Relatório | Parcialmente implementada | O relatório é visual e útil como protótipo, mas não é verificável nem apresenta cenários e fontes. |
| Linha do tempo | Ausente | Deve ser criada depois do modelo estruturado. |
| Cenários | Ausente | Não deve ser implementado antes de estabilizar dados e cálculos. |
| Visão profissional | Ausente | É importante, mas não é prioridade para a primeira versão do segurado. |
| Qualidade e piloto | Não implementada | Não há testes sistemáticos nem métricas para decidir se o produto é confiável. |

A conclusão é que o projeto está **à frente da Semana 1 em interface e integração**, mas ainda está entre as Semanas 2 e 3 no núcleo de dados. O roadmap visual avançou mais rapidamente que o núcleo de validação.

## 5. Problemas técnicos e limitações mais relevantes

### 5.1 O cálculo atual de carência não representa necessariamente carência

`calculateCnisMetrics()` conta competências únicas encontradas em todo o texto. Uma data encontrada em cabeçalho, período, benefício ou outra seção pode entrar na contagem. O resultado não confirma que a competência foi paga, válida ou aproveitável para carência.

A apresentação correta, neste estágio, deveria ser algo como **“competências identificadas no texto”**, até que o sistema consiga classificar competências contributivas e suas situações. O nome “carência” cria uma confiança maior do que o algoritmo atual suporta.

### 5.2 O tempo total é uma aproximação por quantidade de competências

O cálculo divide a quantidade de competências por 12 e informa anos e meses. Ele não trata sobreposição de vínculos, períodos concomitantes, lacunas, vínculos sem fechamento, contribuições que não contam para determinado benefício ou dias além da competência mensal.

Esse valor pode ser exibido como estimativa preliminar, mas não deve ser apresentado como tempo previdenciário consolidado.

### 5.3 O progresso usa uma regra fixa e incompleta

O progresso é calculado sobre 35 anos para qualquer pessoa. O próprio código legado menciona uma base de 35 anos para homens e 30 para mulheres, mas não há coleta de sexo, data de nascimento, filiação, direito adquirido ou regra de transição. O percentual atual é, portanto, um indicador visual de competências encontradas, não um progresso real rumo à aposentadoria.

### 5.4 A IA pode transformar sinais em conclusões

O prompt orienta a não inventar dados, mas o sistema ainda entrega à IA uma tarefa abrangente de “analista previdenciário”. Sem evidências ligadas a cada saída, o usuário não consegue distinguir o que veio diretamente do PDF do que foi inferido pelo modelo.

A saída deve evoluir para objetos com pelo menos: tipo do achado, descrição, evidência, página, confiança, impacto possível, ação recomendada e ressalva. A classificação “hipótese” precisa ser estrutural, não apenas textual.

### 5.5 OCR serverless é um risco operacional

A conversão de até 20 páginas e a inicialização do Tesseract podem exceder tempo ou memória em determinados ambientes. O caminho atual é aceitável para testar PDFs curtos, mas deve registrar duração, páginas processadas e falha específica. Para PDFs longos, o sistema precisa limitar de forma transparente, processar em etapas ou usar um serviço de OCR mais adequado.

### 5.6 Os fluxos ativos e legados estão misturados

O repositório ainda contém Genkit e fluxos antigos, embora a rota atual use `src/lib/cnis-analyzer.ts`. Isso aumenta a superfície de manutenção e torna a documentação enganosa. O `README.md` ainda descreve Genkit e Gemini 1.5 Flash, enquanto o código atual usa chamada REST e modelos 2.5.

O gerador de petições continua ligado ao Genkit. Portanto, não se deve remover Genkit sem antes decidir se o gerador será mantido, migrado ou temporariamente marcado como experimental.

### 5.7 Não há testes automatizados para um domínio de alto risco

A ausência de testes é a maior lacuna de engenharia neste momento. A apostila pede casos simples, lacunas, sobreposição, indicadores, períodos longos, dados incompletos e falhas de leitura. Nenhum desses casos está formalizado no repositório.

Antes de adicionar simulações ou regras de aposentadoria, devem existir testes para parsing, normalização, contagem de meses, união de intervalos, detecção de lacunas e validação de schemas.

### 5.8 A segurança está adequada apenas para o protótipo sem persistência

A chave pública do Firebase no cliente não é, por si só, um segredo. Porém, o projeto precisa de regras de Authentication, Firestore e Storage antes de salvar qualquer CNIS. O dashboard também deve exigir autenticação no servidor ou em middleware. Documentos previdenciários contêm dados pessoais e não devem ser persistidos por padrão sem política de retenção e exclusão.

## 6. Prioridades recomendadas

### Prioridade P0 — Antes de usuários externos

Estas mudanças formam o menor conjunto necessário para uma primeira versão segura e honesta:

1. **Criar um conjunto de casos de referência anonimizados.** Começar com um CNIS simples, um com lacuna, um com sobreposição, um com indicador e um PDF sem texto. Guardar apenas dados anonimizados.
2. **Separar “competências identificadas” de “carência calculada”.** Até haver classificação confiável, renomear a métrica e ajustar o texto da interface para não prometer um cálculo previdenciário que o algoritmo não faz.
3. **Criar um modelo interno mínimo.** Incluir `DocumentPage`, `EmploymentPeriod`, `ContributionCompetency`, `BenefitPeriod`, `Indicator` e `Evidence`. Campos desconhecidos devem ser `null` ou “não identificado”, nunca preenchidos por inferência silenciosa.
4. **Adicionar rastreabilidade mínima.** Cada período, indicador e competência extraída deve apontar para página e trecho, quando disponíveis. Para texto extraído, o parser pode trabalhar por página e registrar o recorte da linha de origem.
5. **Criar testes determinísticos.** Cobrir datas inválidas, duplicidades, sobreposição, lacunas e contagem de competências. Os testes devem rodar no CI ou pelo menos por um script explícito.
6. **Rebaixar a linguagem de certeza.** Onde o sistema não consegue determinar um direito, usar “não foi possível determinar” e explicar a informação ausente.
7. **Corrigir a proteção de rota antes de persistir dados.** O estado atual pode continuar sem armazenamento, mas qualquer histórico exige autenticação verificável no servidor e regras de acesso por usuário.

### Prioridade P1 — Primeira versão utilizável para segurado

Depois da base P0, implementar:

1. **Linha do tempo simples.** Exibir períodos identificados, lacunas e sobreposições com link para evidência.
2. **Auditoria baseada em regras simples.** Detectar lacunas entre períodos, sobreposições, vínculo aberto, indicadores encontrados e competências possivelmente ausentes. Cada achado deve ser `DADO`, `ALERTA` ou `HIPÓTESE`.
3. **Relatório do segurado revisado.** Mostrar “o que consta”, “o que foi calculado”, “o que merece conferência” e “o que não foi possível determinar”.
4. **Persistência opcional e controlada.** Permitir salvar o relatório associado à conta, com exclusão manual e política clara de retenção. O upload bruto não precisa ser armazenado na primeira versão.
5. **Observabilidade mínima.** Registrar duração, tamanho e número de páginas sem registrar texto sensível nos logs. Medir sucesso, falha de extração e falha de IA.

### Prioridade P2 — Profissional e cenários

Somente após validar a versão para segurado:

1. **Visão profissional** com evidências, indicadores, períodos e documentos complementares.
2. **Cenários previdenciários** com regras documentadas, premissas e limitações.
3. **Exportação profissional** contendo fonte e trilha de cálculo.
4. **Migração ou estabilização do gerador de petições** com o mesmo padrão de evidência do analisador.
5. **Testes de aceitação com análise humana de referência.**

## 7. Plano incremental de próximas missões

O plano abaixo segue o método da apostila: uma missão por vez, sempre com teste antes da seguinte.

### Missão 1 — Congelar o diagnóstico e os casos de referência

Não alterar o fluxo visual. Criar uma pasta de fixtures anonimizadas e um documento com o resultado esperado de cada caso. Registrar também quais campos não podem ser determinados pelo documento.

**Critério de conclusão:** cinco casos de referência definidos e reproduzíveis.

### Missão 2 — Estruturar a extração por página

Alterar somente `extractCnisFacts()` e os tipos relacionados. Extrair texto por página, preservar trechos de origem e criar o modelo mínimo de períodos, competências e indicadores. Não implementar regras de aposentadoria ainda.

**Critério de conclusão:** cada fato extraído pode apontar para página e trecho, e o sistema rejeita uma extração sem texto suficiente.

### Missão 3 — Separar fatos, cálculos e interpretação

Criar funções puras para normalização, união de intervalos, detecção de sobreposição e contagem de competências. O retorno da IA deve receber fatos e métricas, mas não poder sobrescrever os cálculos determinísticos.

**Critério de conclusão:** testes unitários passam para datas, duplicidades, lacunas e sobreposição.

### Missão 4 — Criar auditoria explícita

Implementar regras simples para gerar achados classificados como `DADO`, `ALERTA` ou `HIPÓTESE`. Cada achado deve conter evidência, impacto possível e ação recomendada.

**Critério de conclusão:** o relatório consegue explicar por que cada alerta foi criado.

### Missão 5 — Revisar o relatório do segurado

Adaptar a interface atual, sem redesign amplo, para quatro blocos: informações encontradas, cálculos, alertas e limitações. Renomear métricas que ainda forem apenas estimativas textuais.

**Critério de conclusão:** uma pessoa que não conhece Direito Previdenciário entende o que o sistema sabe e o que precisa ser conferido.

### Missão 6 — Validar com comparação humana

Executar os casos anonimizados e comparar o resultado com uma análise de referência. Registrar falsos positivos, falsos negativos e tempo de resposta.

**Critério de conclusão:** existe uma lista objetiva de erros e uma decisão sobre o que corrigir antes do piloto.

## 8. O que não deve ser feito agora

Não é recomendável reconstruir o frontend, adicionar dezenas de tipos de aposentadoria, implementar simulações complexas ou armazenar todos os documentos antes de estabilizar a extração e os cálculos básicos. Também não é recomendável investir em um redesign amplo: a interface atual já é suficiente para validar o valor da análise.

O gerador de petições, a visão profissional completa e os analisadores de PPP/PAP podem permanecer no backlog. Eles aumentam o valor potencial do produto, mas não resolvem a principal lacuna atual: saber se o sistema está interpretando corretamente o CNIS que recebeu.

## 9. Diagnóstico final

O Nelson IA **não está começando do zero**. Ele já tem uma base técnica suficiente para continuar de forma incremental e já resolve o problema de demonstração do fluxo. O próximo avanço não deve ser mais uma camada visual nem uma nova chamada de IA. Deve ser a transformação do texto extraído em dados conferíveis e de cálculos aproximados em funções testáveis.

A primeira versão funcional e utilizável para usuários deve prometer menos, mas provar mais. Ela pode dizer: “estes períodos e indicadores foram encontrados nestas páginas; esta contagem foi feita com estas regras; estes pontos merecem conferência; não foi possível determinar o restante”. Essa proposta é menor do que um consultor previdenciário automatizado, mas já entrega utilidade real e cria uma base segura para o roadmap da apostila.

## Referências

[1]: /home/ubuntu/upload/Apostila_Nelson_IA_Desenvolvimento_Manus.pdf "Apostila Nelson IA — Desenvolvimento Incremental com Manus AI"
[2]: /home/ubuntu/Nelson-IA/docs/blueprint.md "Blueprint original do projeto Nelson IA"
[3]: /home/ubuntu/Nelson-IA/src/lib/cnis-analyzer.ts "Pipeline atual de extração, OCR, cálculo e interpretação do CNIS"
[4]: /home/ubuntu/Nelson-IA/src/app/api/analyze-cnis/route.ts "Rota atual de recebimento multipart do CNIS"
[5]: /home/ubuntu/Nelson-IA/src/app/dashboard/cnis-analyzer/page.tsx "Interface atual do analisador de CNIS"
