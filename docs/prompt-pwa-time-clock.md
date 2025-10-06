# Time Clock PWA Implementation Prompt

## Objetivo
Construir um módulo "Time Clock" instalável como PWA (Add to Home Screen) com suporte a registro de ponto online/offline, validação de geofence, exportações de timesheet e ferramentas administrativas.

## Requisitos de PWA
- Criar `public/manifest.webmanifest` com `name`, `short_name`, ícones 192px/512px, splash screens, `display: standalone`, `orientation: portrait`, `theme_color` e `background_color`.
- Incluir `<link rel="manifest" href="/manifest.webmanifest">`, meta tags apple-touch (ícones, splash, status bar) e garantir que o app roda em HTTPS.
- Implementar Service Worker com Workbox:
  - `precacheAndRoute` do app shell e páginas críticas (`registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html'))`).
  - Estratégia Cache First para assets estáticos (JS, CSS, fontes, imagens) e fallback offline.
  - Estratégia Network First para APIs `GET /timesheet` e `GET /jobs`, com cache de resposta quando offline.
  - Background Sync (`workbox-background-sync` Queue) para `POST /time/clock-in`, `clock-out`, `break-start`, `break-end`; armazenar backlog em IndexedDB.
  - Tratar eventos `sync`/`periodicSync`; se indisponível, implementar fallback manual (timer na UI). Registrar logs e mostrar status "offline / pendente sincronização".
- Integrar `workbox-window` no front para registrar o SW, indicar updates e estado offline.

## Add to Home Screen
- Ouvir `beforeinstallprompt`, armazenar o evento e exibir modal custom incentivando instalação; após `userChoice` registrar analytics.
- Detectar iOS (`/iphone|ipad|ipod/i` no `navigator.userAgent`) e mostrar instruções passo a passo: "Compartilhar → Adicionar à Tela de Início" com screenshots.
- Documentar limitações iOS/Android: sem geolocalização em background real, geofence avaliada apenas no momento da batida, ausência de push silencioso confiável.

## Estado & Armazenamento Local
- Utilizar Zustand (ou Redux Toolkit) para gerenciar jornada ativa, eventos pendentes, jobs em cache, status offline e permissões.
- IndexedDB com `idb` contendo stores `jobs`, `time_events`, `sync_queue`.
- Criptografar payloads sensíveis com WebCrypto (AES-GCM); chave derivada por usuário e mantida na sessão (session storage/memory).

## UI/UX
- Next.js/App Router ou Vite React com Tailwind/Chakra, layout mobile-first.
- Dashboard com card "Time Clock" exibindo horas trabalhadas no dia; toque abre `/time-clock`.
- Tela principal:
  - Header fixo com "Total de horas hoje HH:MM"; recalcular via hook que soma blocos (entrada–saída menos pausas) e observa eventos em tempo real.
  - Mapa (Leaflet ou MapLibre) ocupando ~45% do viewport; usar `watchPosition` enquanto a tela estiver ativa e tiles compatíveis com uso offline.
  - Botão primário grande com estados sequenciais: `Registrar entrada` → `Iniciar pausa` → `Retomar` → `Registrar saída`. Controlar lógica com XState (`useMachine`) ou reducer com guardas.
  - Ações secundárias: `Minhas solicitações` (ajustes) e `Planilha de horas` (histórico).
  - Durante captura de GPS exibir skeleton/spinner e fallback para "Tentar novamente" caso timeout.
  - Mensagens offline explícitas: "registrado localmente; sincroniza ao voltar a ficar online".
- Modal de Jobs:
  - Grande lista paginada com busca typeahead (debounce) e virtualização (`react-window` ou `react-virtualized`).
  - Carregar jobs atribuídos a partir do cache IndexedDB; se offline avisar que os dados são do último snapshot.

## Geolocalização & Anti-fraude
- Usar `navigator.permissions.query({ name: 'geolocation' })`; se `denied`, bloquear batida e instruir usuário a habilitar nas configurações.
- Capturar posição com `getCurrentPosition` (`enableHighAccuracy: true`, `timeout` ~15s) e fallback `watchPosition`.
- Validar `accuracy <= 100m` (configurável); se maior, solicitar nova tentativa ou permitir override com justificativa se política permitir.
- Calcular distância via fórmula de Haversine; comparar com `geofence_radius_m` (default 150m). Se fora do raio, bloquear batida e exibir motivo + opção "Ver mapa" com círculo geofence.
- Registrar metadados anti-fraude: `user_agent`, `device_fingerprint` (canvas/webgl hash), `app_version`, `public_ip` (quando online), estado das permissões, `spoof_check_passed`.

## Fluxo Offline-first
- Ao ficar offline, gerar `event_uuid` (`crypto.randomUUID()`), salvar evento completo no IndexedDB com status `pending` e feedback visual.
- Background Sync tenta reenviar com backoff exponencial; ao sucesso, atualizar status e remover da fila.
- Controlar conflitos no backend com idempotência por `event_uuid`; em erro 409, reconsultar status do evento e refletir no front.

## Integração de APIs (JWT)
- Serviços tipados com Zod para validar requests e responses.
- Endpoints:
  - `GET /jobs?search=&page=&size=` (cache + fallback offline).
  - `POST /time/clock-in`, `clock-out`, `break-start`, `break-end` (enfileirar se offline).
  - `GET /timesheet?user_id=&from=&to=&job_id=` (network-first; cache no SW).
  - `POST /adjustments` e `PATCH /adjustments/:id/approve|reject`.
- Payload padrão inclui `timestamp_utc` (`Date.toISOString()`), `device_time` (RFC3339 local), dados GPS, device, network e anti-fraude.

## Regras de Negócio
- Permitir apenas uma jornada aberta por usuário; backend valida e front desabilita `Registrar entrada` se já existir shift ativo.
- Máximo de 4 pausas (configurável); exibir mensagem se limite atingido.
- Respeitar janelas permitidas (`allowed_hours` do Job); bloquear batidas fora da faixa e sinalizar.
- Solicitações de ajuste: formulário com motivo, novo horário, upload (File API). Se offline, informar que envio será feito quando online.

## Timesheet & Histórico
- Tela `Planilha de horas` com filtros (intervalo de datas, job, status), tabela detalhando entradas/saídas/pausas e total calculado.
- Destacar eventos originados offline até sincronização confirmada.
- Expor botões de exportação (CSV/XLSX/PDF) que disparam endpoints backend e fazem download via Blob.
- Listagem de solicitações de ajuste com status, detalhes e ação para criar nova.

## Admin Web
- Área protegida com CRUD de Jobs/Sites contendo: id, code, name, client, `geofence_center`, `geofence_radius_m`, `allowed_hours`, `color_tag`, ativo/inativo.
- Ferramenta para atribuir usuários a Jobs (multi-select com busca).
- Painel de timesheet com filtros avançados, somatórios e exportações.
- Gestão de ajustes: fila com ações de aprovar/rejeitar, comentário obrigatório e trilha de auditoria (quem, quando, decisão).

## Segurança & Privacidade
- Aplicar CSP estrita (`default-src 'self'`, `connect-src` para API, bloquear fontes externas não aprovadas).
- Sanitizar todas entradas (busca de jobs, notas) e escapar HTML renderizado.
- Capturar localização apenas enquanto tela de ponto estiver ativa ou no momento da batida; limpar watchers ao sair.
- Banner de consentimento LGPD/GDPR informando finalidade e retenção dos dados de localização.
- Garantir HTTPS e armazenamento seguro de tokens (cookies `HttpOnly` ou storage seguro com renovação).

## Observabilidade & Auditoria
- Backend com logs estruturados contendo `request_id`, `event_uuid`, tempo de processamento.
- Frontend envia métricas de performance (tempo para obter GPS, falhas de geofence, quantidade de eventos offline).
- Auditoria administrativa registrando todas operações CRUD e decisões sobre ajustes com timestamp e usuário.

## Critérios de Aceite
- Usuário consegue registrar entrada, pausas, retorno e saída com validação de geofence mesmo com rede instável; eventos offline sincronizam corretamente.
- Modal de Jobs suporta mais de 10k registros com busca/paginação performáticas.
- Exportações CSV/XLSX/PDF coincidem com dados do timesheet exibido.
- PWA instalável em iOS/Android, abrindo em `display: standalone` com ícones e splash corretos.

## Próximos Passos Sugeridos
1. Configurar manifest, assets e Service Worker base; validar com Lighthouse PWA.
2. Implementar estado da jornada, integrações de geolocalização e validação de geofence.
3. Construir IndexedDB, fila offline e camadas de serviço com Zod.
4. Desenvolver telas Timesheet/Admin, exportações e fluxo de ajustes.
5. Documentar limitações de plataforma, política de privacidade e orientações de instalação.
