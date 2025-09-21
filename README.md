# Previdenciarista‑AI

> Ferramenta de inteligência artificial para análise previdenciária, voltada para advogados, escritórios e profissionais do direito previdenciário.

---

## 🔍 Visão Geral

O **Previdenciarista‑AI** é um sistema próprio para automatizar etapas críticas no tratamento de casos previdenciários:

- Análise de **CNIS, PPP, PAP** e documentos correlatos;  
- Identificação de vínculos de trabalho, períodos contributivos, lacunas e irregularidades;  
- Cálculo de tempo de contribuição (urbano, rural e híbrido), carência e elegibilidade para diversos benefícios;  
- Geração automática de petições e peças processuais, com templates prontos para uso administrativo ou judicial.

---

## ⚙️ Estrutura do Projeto

O repositório está organizado conforme:

```
.
├── src/                # Código‑fonte (frontend / backend / componentes)
├── docs/               # Documentação adicional (especificações, modelos de petição, etc.)
├── .gitignore          
├── README.md           # Este arquivo
├── package.json        # Dependências e scripts (frontend/web)
├── next.config.ts      # Configurações do framework Next.js
├── tailwind.config.ts  # Configuração de estilo (UI)
└── outros arquivos de configuração (Firebase, hosting etc.)
```

---

## 🚀 Como usar / executar localmente

1. Clone o repositório:

   ```bash
   git clone https://github.com/magroalbino/Previdenciarista-AI.git
   cd Previdenciarista-AI
   ```

2. Instale dependências:

   ```bash
   npm install
   ```

3. Configurações iniciais:

   - Verifique arquivos de configuração (`next.config.ts`, `tailwind.config.ts`, `components.json`, etc.).  
   - Caso haja variáveis de ambiente (ex: credenciais de OCR, bases legais, etc.), configure o `.env` conforme instruções que devem constar em `docs/`.

4. Rode localmente:

   ```bash
   npm run dev
   ```

   Isso deve iniciar o app (frontend) em modo de desenvolvimento.

---

## 🧰 Funcionalidades previstas / roadmap

| Módulo | Status | Descrição |
|--------|--------|-----------|
| Analisador de CNIS | Em construção | Extrair e estruturar dados, detectar lacunas |
| Analisador de PAP | Planejado | Processar PAP, verificar vínculos empregatícios |
| Analisador de PPP | Planejado | Identificar agentes nocivos, verificar direito à aposentadoria especial |
| Aposentadoria rural / híbrida | Planejado | Cálculo de elegibilidade e tempo rural vs urbano |
| Gerador de petições | Em construção | Modelos de petição preenchidos automaticamente com dados extraídos |

---

## 📚 Legislação, Referências e Base de Conhecimento

O agente depende de uma base jurídica atualizada: leis, portarias, súmulas e decisões que regulem:

- regras de aposentadoria (tempo de contribuição, idade, transição)  
- normas de aposentadoria rural/híbrida  
- normas sobre agentes nocivos / PPP  
- jurisprudência e doutrina previdenciária

Essas informações devem estar versionadas/documentadas em `docs/`.

---

## 🛡 Privacidade, Qualidade e Segurança

- Dados pessoais e documentos previdenciários são sensíveis — cuidado com armazenamento e acesso.  
- O sistema de extração e análise deve incluir logs de decisão, auditoria e rastreabilidade (quem fez, quando e com base em quê).  
- Testes com casos reais (anonimizados) para garantir precisão e segurança jurídica.

---

## 🤝 Contribuições

Contribuições são bem‐vindas! Você pode ajudar com:

- exemplos anotados de documentos CNIS/PPP/PAP;  
- melhoria dos modelos de extração de dados;  
- templates de petições variados;  
- melhorias de interface e usabilidade;  
- ajustes legais conforme mudanças de normas.

---

## 📄 Licença

Este projeto está sob a licença **MIT**.

---

## 📧 Contato

Para dúvidas, sugestões ou reportar bugs:  
Autor: **magroalbino**  
GitHub: [magroalbino](https://github.com/magroalbino)  
Email: *[yanrenat@gmail.com]*  
