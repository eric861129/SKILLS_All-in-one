# Awesome Claude Skills 比對報告（含檔案系統比對）
## 增量更新（2026-03-06，Batch 024）
- Tracking 產生時間：`2026-03-06T08:49:18.286Z`
- Wave 2 import 已完成：`batch-016`、`batch-017`、`batch-018`、`batch-019`、`batch-020`、`batch-021`、`batch-022`、`batch-023`、`batch-024`（共 45 筆）
- mismatch（url/author）：`0`（維持）
- `status=missing`：`160`（由 `165` 降至 `160`）
- `needs_manual_review`：`18`（維持）

### 下一批（import, non-fixture）
1. `neuropixels-analysis`
2. `offer-k-dense-web`
3. `omero-integration`
4. `open-notebook`
5. `openalex-database`

## 增量更新（2026-03-06，Batch 020）
- Tracking 產生時間：`2026-03-06T03:36:41.469Z`
- Wave 2 import 已完成：`batch-016`、`batch-017`、`batch-018`、`batch-019`、`batch-020`（共 25 筆）
- mismatch（url/author）：`0`（維持）
- `status=missing`：`180`（由 `185` 降至 `180`）
- `needs_manual_review`：`18`（維持）

### 下一批（import, non-fixture）
1. `kegg-database`
2. `labarchive-integration`
3. `lamindb`
4. `latchbio-integration`
5. `latex-posters`

## 增量更新（2026-03-06，Batch 019）
- Tracking 產生時間：`2026-03-06T03:21:06.117Z`
- Wave 2 import 已完成：`batch-016`、`batch-017`、`batch-018`、`batch-019`（共 20 筆）
- mismatch（url/author）：`0`（維持）
- `status=missing`：`185`（由 `190` 降至 `185`）
- `needs_manual_review`：`18`（維持）

### 下一批（import, non-fixture）
1. `imaging-data-commons`
2. `infographics`
3. `interpro-database`
4. `iso-13485-certification`
5. `jaspar-database`


- 報告時間: 2026-03-05T15:53:23.972Z
- 比對基準: https://raw.githubusercontent.com/BehiSecc/awesome-claude-skills/main/README.md
- Tracking 快照時間: 2026-03-05T15:45:25.422Z
- 檔案系統掃描目錄: /Users/eric861129/SKILLS_All-in-one/public/SKILLS

## 增量更新（2026-03-06）

- Tracking 快照時間：`2026-03-06T03:07:16.335Z`
- Wave 1 metadata remediation 已完成（`batch-014`、`batch-015`）
- Wave 2 import 新增完成（`batch-016`、`batch-017`、`batch-018`，單 repo 各 5 筆）
- mismatch（url/author）已由 `10 -> 0`
- `status=missing` 目前為 `190`
- `needs_manual_review` 目前為 `18`

### Work Queue 現況（SoT）

| Queue | 數量 |
| --- | ---: |
| `queues.mismatch` | 0 |
| `queues.local_present_tracking_missing` | 15 |
| `queues.import_nonfixture_by_repo` | 162 |
| `queues.fixture_manual_review` | 46 |
| `queues.local_only_custom` | 63 |

### 下一批建議（import, non-fixture）

1. `hedgefundmonitor`
2. `histolab`
3. `hmdb-database`
4. `hypogenic`
5. `hypothesis-generation`

## 總覽

| 維度 | 數值 |
| --- | ---: |
| Awesome 候選 Skills | 374 |
| 專案 metadata 內 Skills（tracking.stats.localSkills） | 225 |
| 專案檔案系統實際技能資料夾（含 SKILL.md） | 168 |
| 與 Awesome 交集（檔案系統） | 148 |
| Awesome 有、但檔案系統沒有 | 226 |
| 檔案系統有、但 Awesome 清單沒有 | 20 |

## A. Tracking / Metadata 視角（既有報表）

| 指標 | 數值 |
| --- | ---: |
| 已完成匯入批次（batch-002 ~ batch-013） | 12 |
| 已完成新增 Skill（上述批次合計） | 60 |
| 尚未新增到專案（status=missing） | 205 |
| 需要修正作者/來源（url/author mismatch） | 10 |
| 待人工覆核（來源衝突） | 18 |
| 抓取失敗（GitHub API / rate limit） | 26 |

### A-1 已完成新增到專案（依 batch）

#### batch-002

- adaptyv
- aeon
- alpha-vantage
- alphafold-database
- anndata

#### batch-003

- arboreto
- astropy
- benchling-integration
- bgpt-paper-search
- bindingdb-database

#### batch-004

- biopython
- biorxiv-database
- bioservices
- brenda-database
- cbioportal-database

#### batch-005

- aws-ami-builder
- azure-image-builder
- azure-verified-modules
- new-terraform-provider
- provider-actions

#### batch-006

- cellxgene-census
- chembl-database
- cirq
- citation-management
- clinical-decision-support

#### batch-007

- clinical-reports
- clinicaltrials-database
- clinpgx-database
- clinvar-database
- cobrapy

#### batch-008

- atlassian
- claude-mcp-expert
- claude-skill-builder
- code-review
- consciousness-council

#### batch-009

- cosmic-database
- dask
- datacommons-client
- datamol
- deepchem

#### batch-010

- convergence-study
- dapp-integration
- decibel
- deeptools
- denario

#### batch-011

- depmap
- dhdna-profiler
- diffdock
- dnanexus-integration
- differentiation-schemes

#### batch-012

- drugbank-database
- edgartools
- ena-database
- ensembl-database
- esm

#### batch-013

- etetoolkit
- exploratory-data-analysis
- fda-database
- flowio
- fluidsim

### A-2 需修正作者/來源（tracking）

| Skill | 問題類型 | 目前 author | 預期 author | 目前 githubUrl | 預期 githubUrl |
| --- | --- | --- | --- | --- | --- |
| aptos | author_mismatch | raintree | raintree-technology | https://github.com/raintree-technology/claude-starter/tree/main/skills/aptos | https://github.com/raintree-technology/claude-starter/tree/main/skills/aptos |
| email-html-mjml | url_mismatch | framix-team | framix-team | https://github.com/framix-team/skill-email-html-mjml | https://github.com/framix-team/skill-email-html-mjml/tree/master/email-html-mjml |
| invoice-organizer | url_mismatch | ComposioHQ | ComposioHQ | https://github.com/ComposioHQ/awesome-claude-skills/blob/master/invoice-organizer/SKILL.md | https://github.com/ComposioHQ/awesome-claude-skills/tree/master/invoice-organizer |
| meeting-insights-analyzer | url_mismatch | ComposioHQ | ComposioHQ | https://github.com/ComposioHQ/awesome-claude-skills/blob/master/meeting-insights-analyzer/ | https://github.com/ComposioHQ/awesome-claude-skills/tree/master/meeting-insights-analyzer |
| oiloil-ui-ux-guide | url_mismatch | oil-oil | oil-oil | https://github.com/oil-oil/oiloil-ui-ux-guide | https://github.com/oil-oil/oiloil-ui-ux-guide/tree/main/skills/oiloil-ui-ux-guide |
| plaid | author_mismatch | raintree | raintree-technology | https://github.com/raintree-technology/claude-starter/tree/main/skills/plaid | https://github.com/raintree-technology/claude-starter/tree/main/skills/plaid |
| polaris-datainsight-doc-extract | url_mismatch | jacob-g-park | jacob-g-park | https://github.com/jacob-g-park/polaris-datainsight-doc-extract | https://github.com/jacob-g-park/polaris-datainsight-doc-extract/tree/main/skills/polaris-datainsight-doc-extract |
| skill-creator | author_mismatch | SKILLS All-in-one | Anthropic | https://github.com/anthropics/skills/tree/main/skills/skill-creator | https://github.com/anthropics/skills/tree/main/skills/skill-creator |
| whop | author_mismatch | raintree | raintree-technology | https://github.com/raintree-technology/claude-starter/tree/main/skills/whop | https://github.com/raintree-technology/claude-starter/tree/main/skills/whop |
| x-twitter-scraper | url_mismatch | Xquik-dev | Xquik-dev | https://github.com/Xquik-dev/x-twitter-scraper | https://github.com/Xquik-dev/x-twitter-scraper/tree/master/skills/x-twitter-scraper |

## B. 檔案系統視角（public/SKILLS，含手動新增）

### B-1 已存在於專案檔案系統且可對應 Awesome 的 Skills

共 148 筆（依字母排序）：

- adaptyv (Scientific & Research Tools)
- aeon (Scientific & Research Tools)
- alpha-vantage (Scientific & Research Tools)
- alphafold-database (Scientific & Research Tools)
- angular-architect (Development & Code Tools)
- anndata (Scientific & Research Tools)
- api-designer (Development & Code Tools)
- arboreto (Scientific & Research Tools)
- architecture-designer (Development & Code Tools)
- astropy (Scientific & Research Tools)
- atlassian (Collaboration & Project Management)
- atlassian-mcp (Collaboration & Project Management)
- aws-agentic-ai (Infrastructure & Cloud)
- aws-ami-builder (Infrastructure & Cloud)
- aws-cdk-development (Infrastructure & Cloud)
- aws-cost-operations (Infrastructure & Cloud)
- aws-mcp-setup (Infrastructure & Cloud)
- aws-serverless-eda (Infrastructure & Cloud)
- azure-image-builder (Infrastructure & Cloud)
- azure-verified-modules (Infrastructure & Cloud)
- benchling-integration (Scientific & Research Tools)
- bgpt-paper-search (Scientific & Research Tools)
- bindingdb-database (Scientific & Research Tools)
- biopython (Scientific & Research Tools)
- biorxiv-database (Scientific & Research Tools)
- bioservices (Scientific & Research Tools)
- brainstorming (Writing & Research)
- brenda-database (Scientific & Research Tools)
- cbioportal-database (Scientific & Research Tools)
- cellxgene-census (Scientific & Research Tools)
- chaos-engineer (Security & Web Testing)
- chembl-database (Scientific & Research Tools)
- cirq (Scientific & Research Tools)
- citation-management (Scientific & Research Tools)
- claude-mcp-expert (Development & Code Tools)
- claude-skill-builder (Utility & Automation)
- cli-developer (Development & Code Tools)
- clinical-decision-support (Scientific & Research Tools)
- clinical-reports (Scientific & Research Tools)
- clinicaltrials-database (Scientific & Research Tools)
- clinpgx-database (Scientific & Research Tools)
- clinvar-database (Scientific & Research Tools)
- cloud-architect (Development & Code Tools)
- cobrapy (Scientific & Research Tools)
- code-documenter (Development & Code Tools)
- code-review (Development & Code Tools)
- code-reviewer (Development & Code Tools)
- consciousness-council (Utility & Automation)
- convergence-study (Scientific & Research Tools)
- cosmic-database (Scientific & Research Tools)
- cpp-pro (Development & Code Tools)
- csharp-developer (Development & Code Tools)
- dapp-integration (Web3 & Blockchain)
- dask (Scientific & Research Tools)
- database-optimizer (Data & Analysis)
- datacommons-client (Scientific & Research Tools)
- datamol (Scientific & Research Tools)
- debugging-wizard (Development & Code Tools)
- decibel (Web3 & Blockchain)
- deepchem (Scientific & Research Tools)
- deeptools (Scientific & Research Tools)
- denario (Scientific & Research Tools)
- depmap (Scientific & Research Tools)
- devops-engineer (Development & Code Tools)
- dhdna-profiler (Learning & Knowledge)
- diffdock (Scientific & Research Tools)
- differentiation-schemes (Scientific & Research Tools)
- django-expert (Development & Code Tools)
- dnanexus-integration (Scientific & Research Tools)
- docx (Document Skills)
- dotnet-core-expert (Development & Code Tools)
- drugbank-database (Scientific & Research Tools)
- edgartools (Data & Analysis)
- embedded-systems (Development & Code Tools)
- ena-database (Scientific & Research Tools)
- ensembl-database (Scientific & Research Tools)
- esm (Scientific & Research Tools)
- etetoolkit (Scientific & Research Tools)
- exploratory-data-analysis (Data & Analysis)
- fastapi-expert (Development & Code Tools)
- fda-database (Scientific & Research Tools)
- feature-forge (Collaboration & Project Management)
- fine-tuning-expert (Data & Analysis)
- finishing-a-development-branch (Utility & Automation)
- flowio (Scientific & Research Tools)
- fluidsim (Scientific & Research Tools)
- flutter-expert (Development & Code Tools)
- fullstack-guardian (Development & Code Tools)
- game-developer (Media & Content)
- golang-pro (Development & Code Tools)
- graphql-architect (Development & Code Tools)
- internal-comms (Writing & Research)
- java-architect (Development & Code Tools)
- javascript-pro (Development & Code Tools)
- kotlin-specialist (Development & Code Tools)
- kubernetes-specialist (Development & Code Tools)
- laravel-specialist (Development & Code Tools)
- legacy-modernizer (Development & Code Tools)
- mcp-developer (Utility & Automation)
- microservices-architect (Development & Code Tools)
- ml-pipeline (Data & Analysis)
- monitoring-expert (Development & Code Tools)
- nestjs-expert (Development & Code Tools)
- new-terraform-provider (Infrastructure & Cloud)
- nextjs-developer (Development & Code Tools)
- notebooklm (Learning & Knowledge)
- oiloil-ui-ux-guide (Development & Code Tools)
- pandas-pro (Data & Analysis)
- pdf (Document Skills)
- php-pro (Development & Code Tools)
- playwright-expert (Security & Web Testing)
- postgres (Data & Analysis)
- postgres-pro (Data & Analysis)
- pptx (Document Skills)
- prompt-engineer (Utility & Automation)
- provider-actions (Infrastructure & Cloud)
- python-pro (Development & Code Tools)
- rag-architect (Data & Analysis)
- rails-expert (Development & Code Tools)
- react-expert (Development & Code Tools)
- react-native-expert (Development & Code Tools)
- revealjs (Media & Content)
- rust-engineer (Development & Code Tools)
- salesforce-developer (Development & Code Tools)
- secure-code-guardian (Security & Web Testing)
- security-reviewer (Security & Web Testing)
- shopify-expert (Development & Code Tools)
- skill-creator (Utility & Automation)
- spark-engineer (Data & Analysis)
- spec-miner (Development & Code Tools)
- spring-boot-engineer (Development & Code Tools)
- sql-pro (Data & Analysis)
- sre-engineer (Development & Code Tools)
- swift-expert (Development & Code Tools)
- systematic-debugging (Development & Code Tools)
- terraform-engineer (Development & Code Tools)
- test-driven-development (Development & Code Tools)
- test-master (Development & Code Tools)
- the-fool (Writing & Research)
- typescript-pro (Development & Code Tools)
- using-git-worktrees (Utility & Automation)
- vue-expert (Development & Code Tools)
- vue-expert-js (Development & Code Tools)
- web-artifacts-builder (Development & Code Tools)
- webapp-testing (Security & Web Testing)
- websocket-engineer (Development & Code Tools)
- wordpress-pro (Development & Code Tools)
- xlsx (Document Skills)

### B-2 Awesome 有、但專案檔案系統尚未存在的 Skills

共 226 筆（依字母排序）：

- agent-without-context
- agnix
- aptos
- argument-hint-no-args
- article-extractor
- azure-devops
- content-research-writer
- context-without-agent
- deep-reference
- deep-research
- deploy-prod
- elevenlabs
- elicitation
- email-html-mjml
- file-organizer
- first-person-description
- fork-no-instructions
- fork-with-instructions
- framework
- fred-economic-data
- gas-optimization
- gene-database
- generate-image
- geniml
- geo-database
- geomaster
- geopandas
- get-available-resources
- gget
- ginkgo-cloud-lab
- glycoengineering
- gmail
- gnomad-database
- google-calendar
- google-chat
- google-docs
- google-drive
- google-sheets
- google-slides
- google-tts
- gtars
- gtex-database
- gwas-database
- hedgefundmonitor
- helius
- histolab
- hmdb-database
- hypogenic
- hypothesis-generation
- image-enhancer
- imagen
- imaging-data-commons
- indexed-arguments-no-hint
- infographics
- interpro-database
- invalid-agent
- invalid-context
- invalid-hooks
- invalid-model
- invalid-name
- invoice-organizer
- iso-13485-certification
- jaspar-database
- jules
- kaggle
- kegg-database
- labarchive-integration
- lamindb
- latchbio-integration
- latex-posters
- linear-solvers
- literature-review
- manus
- markdown-mermaid-writing
- market-research-reports
- markitdown
- matchms
- matlab
- matplotlib
- medchem
- meeting-insights-analyzer
- mesh-generation
- metabolomics-workbench-database
- missing-frontmatter
- modal
- molecular-dynamics
- molfeat
- monarch-database
- move-language
- move-prover
- move-testing
- mssql
- mysql
- name-directory-mismatch
- networkx
- neurokit2
- neuropixels-analysis
- nonlinear-solvers
- numerical-integration
- numerical-stability
- object-model
- offer-k-dense-web
- omero-integration
- ontology-explorer
- ontology-mapper
- ontology-validator
- open-notebook
- openalex-database
- opentargets-database
- opentrons-integration
- outline
- paper-2-web
- parallel-web
- parameter-optimization
- pathml
- pdb-database
- peer-review
- pennylane
- performance-profiling
- perplexity-search
- phylogenetics
- plaid
- plotly
- plugin-authoring
- polaris-datainsight-doc-extract
- polars
- post-processing
- pptx-posters
- protocolsio-integration
- provider-resources
- pubchem-database
- pubmed-database
- pufferlib
- push-to-registry
- pydeseq2
- pydicom
- pyhealth
- pylabrobot
- pymatgen
- pymc
- pymoo
- pyopenms
- pysam
- pytdc
- pytorch-lightning
- pyzotero
- qiskit
- qutip
- rdkit
- reactome-database
- recommendations
- refactor-module
- research-grants
- research-lookup
- rowan
- run-acceptance-tests
- scanpy
- scholar-evaluation
- scientific-brainstorming
- scientific-critical-thinking
- scientific-schematics
- scientific-slides
- scientific-visualization
- scientific-writing
- scikit-bio
- scikit-learn
- scikit-survival
- scvelo
- scvi-tools
- seaborn
- shap
- shelby
- ship-learn-next
- simpy
- simulation-orchestrator
- simulation-validator
- slurm-job-script-generator
- stable-baselines3
- statistical-analysis
- statsmodels
- string-boolean-disable
- string-boolean-invocable
- string-database
- sympy
- tapestry
- template
- terminal-title
- terraform-search-import
- terraform-stacks
- terraform-style-guide
- terraform-test
- test-skill
- tiledbvcf
- time-stepping
- timesfm-forecasting
- token-standards
- too-many-injections
- toon-formatter
- torch_geometric
- torchdrug
- transformers
- treatment-plans
- umap-learn
- uniprot-database
- unknown-frontmatter-field
- unknown-tool
- unreachable-skill
- usfiscaldata
- uspto-database
- vaex
- vague-name
- venue-templates
- video-downloader
- what-if-oracle
- whop
- windows-builder
- windows-path
- with-argument-hint
- with-context-agent
- with-custom-agent
- with-hooks
- with-model
- x-twitter-scraper
- youtube-transcript
- zarr-python
- zinc-database

### B-3 專案檔案系統有、但 Awesome 清單沒有的 Skills（可能是你手動加的）

共 20 筆：

- algorithmic-art (Media & Content)
- brand-guidelines (Media & Content)
- canvas-design (Media & Content)
- dispatching-parallel-agents (Utility & Automation)
- doc-coauthoring (Writing & Research)
- executing-plans (Utility & Automation)
- frontend-design (Development & Code Tools)
- mcp-builder (Utility & Automation)
- move-code-quality-skill (Web3 & Blockchain)
- receiving-code-review (Development & Code Tools)
- requesting-code-review (Development & Code Tools)
- slack-gif-creator (Media & Content)
- stripe (Finance & Payments)
- subagent-driven-development (Utility & Automation)
- supabase (SaaS & Backend)
- theme-factory (Media & Content)
- using-superpowers (Utility & Automation)
- verification-before-completion (Development & Code Tools)
- writing-plans (Development & Code Tools)
- writing-skills (Utility & Automation)

### B-4 檔案已存在，但 tracking 仍是 missing（高機率是手動新增但尚未 Onboard 完整）

共 15 筆：

- javascript-pro (Development & Code Tools)
- kotlin-specialist (Development & Code Tools)
- kubernetes-specialist (Development & Code Tools)
- laravel-specialist (Development & Code Tools)
- legacy-modernizer (Development & Code Tools)
- mcp-developer (Utility & Automation)
- microservices-architect (Development & Code Tools)
- ml-pipeline (Data & Analysis)
- monitoring-expert (Development & Code Tools)
- nestjs-expert (Development & Code Tools)
- nextjs-developer (Development & Code Tools)
- pandas-pro (Data & Analysis)
- playwright-expert (Security & Web Testing)
- prompt-engineer (Utility & Automation)
- revealjs (Media & Content)

### B-5 檔案已存在且在專案內，仍需修正作者/來源

共 2 筆：

| Skill | 問題類型 | 目前 author | 預期 author | 目前 githubUrl | 預期 githubUrl |
| --- | --- | --- | --- | --- | --- |
| oiloil-ui-ux-guide | url_mismatch | oil-oil | oil-oil | https://github.com/oil-oil/oiloil-ui-ux-guide | https://github.com/oil-oil/oiloil-ui-ux-guide/tree/main/skills/oiloil-ui-ux-guide |
| skill-creator | author_mismatch | SKILLS All-in-one | Anthropic | https://github.com/anthropics/skills/tree/main/skills/skill-creator | https://github.com/anthropics/skills/tree/main/skills/skill-creator |

### B-6 檔案已存在但來源待人工覆核（needs_manual_review）

共 2 筆：

- notebooklm (Learning & Knowledge)
- postgres (Data & Analysis)

## 備註

- A 區塊是 tracking/metadata 視角；B 區塊是你要求的檔案系統實際存在視角。
- 因為你有手動新增，A 與 B 數字不同是預期行為。
- 建議下一步先處理 B-4 清單，把它們補齊到 `src/data/skills.ts`、`database/init_skills.sql` 與 tracking。

