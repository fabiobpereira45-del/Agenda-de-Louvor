# Histórico de Atualizações (Changelog)

## [2.0.0] - Abril 2026

### Adicionado
- **Design System "Divine Minimalist":** Implementação de geometria "Sharp", paleta Earthy & Sacred (Forest Green, Parchment Cream, Burnt Amber).
- **Copiloto de Adoração:** Nova seção interativa de prompts para IAs externas.
- **Estrutura Modular:** Código desacoplado utilizando `src/components`, `src/pages`, `src/context`.

### Corrigido
- **Exportação em PDF:** Elementos visuais refeitos com `w-0 h-0 overflow-hidden` para total compatibilidade com a biblioteca `html2canvas`, permitindo gerar relatórios visíveis de alta qualidade sem comprometer a tela.

### Removido
- Integração direta (client-side) do Gemini para evitar vulnerabilidades de API Keys expostas.
- CSS complexo manual foi substituído puramente por tokens do Tailwind V4.
