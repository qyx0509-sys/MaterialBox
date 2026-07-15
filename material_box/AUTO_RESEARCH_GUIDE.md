# MaterialBox 自动研究与候选审核使用说明

## 1. 系统边界

自动研究系统只生成候选，不会直接修改正式材料库。

- 正式人工维护源仍是 `materials.json`。
- 数据候选保存在 `data/research/property-candidates.json`。
- 图片候选保存在 `data/research/image-candidates.json`。
- 任务与断点信息保存在 `data/research/research-jobs.json`。
- 逐步日志保存在 `data/research/research-log.jsonl`。
- 自动验证结果保存在 `data/research/validation-report.json`。
- 只有在本地管理器中人工接受，并再次执行“正式应用已接受候选”，内容才会进入正式库。
- 正式应用后材料状态统一设为“待核验”，不会自动标记为“已核验”。

AI 生成图只能作为结构教学示意候选。系统禁止把 AI 图标成宏观照片、SEM、TEM、光学显微照片、金相图、断口图或实验结果。

## 2. Codex CLI 与云端网络权限

Codex 桌面端、Codex CLI、本地 Python 脚本和云端任务的网络环境可能不同。

- 本地 `tools/auto_research.py` 需要电脑能够访问 Wikimedia Commons 等公开来源。
- 企业代理、防火墙或网络沙箱可能阻止下载；失败会写入日志，不会中止整个批次。
- Codex 能查到的网页不等于本地脚本一定能访问。
- 需要登录、付费、验证码或明确禁止自动访问的站点不会被工具绕过。
- 搜索结果摘要不能作为数值证据。数值候选必须记录可复核的正式来源。

## 3. 第一次安装依赖

推荐安装 Python 3.10 或更高版本，然后在项目目录运行：

```powershell
python -m pip install -r tools\requirements-admin.txt
python -m pip install -r tools\requirements-research.txt
```

`requirements-admin.txt` 提供本地材料管理器的图片处理依赖；管理器服务器使用 Python 标准库，不需要 Flask。`requirements-research.txt` 提供候选研究和可选 AI 结构图依赖。Pillow 用于校正、验证和转换候选图片。OpenAI 仅在明确开启 AI 结构图时使用；普通数据和 Wikimedia 图片研究不需要 API 密钥。

双击 `tools\10_生成研究候选.bat` 时，如果缺少 Pillow，也会先询问是否安装依赖。

## 4. 配置 research_config.json

双击 `tools\09_配置自动研究.bat`。常用配置：

- `batch_size`：默认批次，初始为 10。
- `max_image_candidates`：每种材料最多图片候选，最大建议为 5。
- `request_delay_seconds`：网络请求间隔。
- `allowed_licenses`：可下载图片许可证白名单。
- `minimum_confidence_for_bulk_accept`：批量接受阈值。
- `allow_ai_generated_images`：AI 结构图总开关，默认 `false`。
- `max_generated_images_per_run`：单次 AI 结构图费用保护。
- `require_source_for_numeric_data`：数值必须有来源，应保持 `true`。
- `require_manual_review`：必须保持 `true`。

不要取消人工审核，不要把许可证白名单扩展为“未知”或“无许可证”。

## 5. 配置 OPENAI_API_KEY

普通研究不需要 OpenAI API。只有明确开启 AI 结构示意图时才需要。

PowerShell 临时设置：

```powershell
$env:OPENAI_API_KEY="你的密钥"
```

永久设置请使用 Windows 用户环境变量。不要把真实密钥写入 `research_config.json`、`.env.example`、Python 文件、候选 JSON 或 Git 提交。`.env.example` 只是变量名示例。

## 6. 默认只处理 10 个材料

双击 `tools\10_生成研究候选.bat`。脚本先显示材料数、预计请求、AI 图片开关、费用可能性、输出目录，以及独立配图、父级继承和建议暂缓数量。确认后才开始，默认不会处理全部 459 条。批处理默认启用续跑：再次双击时会先跳过已经完成的材料，再从优先级队列中选择下一批10条。

命令行等价写法：

```powershell
python tools\auto_research.py --limit 10 --resume
```

只看预估，不联网、不生成候选：

```powershell
python tools\auto_research.py --limit 10 --resume --plan
```

## 7. 精确选择研究范围

```powershell
# 单个材料
python tools\auto_research.py --material stainless_steel --limit 1

# 分类、实体类型或专题集合
python tools\auto_research.py --category "金属与合金" --limit 10
python tools\auto_research.py --entity-type family --limit 10
python tools\auto_research.py --collection aerospace_materials --limit 10

# 缺图或缺工程数据/来源
python tools\auto_research.py --missing-images --limit 10
python tools\auto_research.py --missing-data --limit 10

# 中断后跳过已完成任务
python tools\auto_research.py --limit 10 --resume

# 重建所选材料候选记录，不覆盖正式库
python tools\auto_research.py --material stainless_steel --overwrite-candidates --limit 1
```

## 8. 只补宏观图

```powershell
python tools\auto_research.py --material stainless_steel --macro-only --max-images 3 --limit 1
```

只继续处理下一批缺少正式宏观图的材料：

```powershell
python tools\auto_research.py --missing-images --macro-only --resume --limit 10
```

宏观图默认来自 Wikimedia Commons，并要求许可证在白名单内、文件可打开、MIME 正确、尺寸合理、SHA256 不重复，且来源页、作者和许可证可追溯。自动搜索不能保证语义一定正确，必须人工看图。

## 9. 只补数据或来源

```powershell
python tools\auto_research.py --material ti_tc4 --data-only --limit 1
```

系统只允许有明确提取规则和来源记录的数值候选。没有可靠来源时不会生成精确数字。

- `family` 和 `subfamily` 只能生成 `category_reference` 范围或来源候选。
- `material` 和 `grade` 的数值必须记录材料状态、条件和温度。
- `variant` 必须说明增强体含量、填料比例或改性方式。
- `form` 主要研究产品形态和图片，一般不重复整套工程参数。
- 来源冲突时保留多条候选，系统不自动平均。

## 10. 生成结构图候选

```powershell
python tools\auto_research.py --material polyethylene --structure --limit 1
python tools\auto_research.py --material carbon_fiber_epoxy --structure --limit 1
```

已内置模板优先使用程序化 SVG 与 WebP，不调用付费 API。每张结构图必须有 `basis_sources`，并标明“程序生成教学示意图，不是实验照片”。

AI 结构图默认关闭。即使开启，也只能进入 `assets/images/materials/{material_id}/candidates/generated/structure/`，且状态始终从 `pending_review` 开始。

明确开启配置并设置 API 密钥后，只能对显式材料请求：

```powershell
python tools\auto_research.py --material some_material_id --ai-structure --limit 1
```

如果材料没有 `data_sources` 结构依据、未设置密钥、超过单次上限或已有程序化模板，系统不会进行不受控的 AI 生成。

## 11. 微观图片与论文版权

微观图需要材料牌号、状态、热处理、显微镜类型、放大倍数、比例尺、腐蚀剂、方向、图号和来源等上下文。

如果不能确认插图可合法再利用，只保存论文链接和图号，不下载或裁剪插图，不去除比例尺，不把其他牌号的组织标成当前材料，也不把论文截图直接发布。

```powershell
python tools\auto_research.py --material ti_tc4 --micro-links --limit 1
```

## 12. 打开 AI 候选审核

双击 `tools\11_启动候选审核.bat`，或访问：

```text
http://127.0.0.1:8765/research-review.html
```

管理器只绑定 `127.0.0.1`。审核页可筛选数据、宏观图、微观图、结构图，置信度，来源状态，许可证问题，六种实体类型，以及待审核、已接受、已拒绝和已应用状态。

## 13. 接受、编辑或拒绝

单条候选可以查看当前正式值、来源、DOI、许可证、原图、生成提示词和免责声明，然后选择“接受”“编辑后接受”或“拒绝”。验证不通过的候选不能接受。

批量接受高置信度候选需要两次确认，且只处理自动验证通过、仍为待审核并达到配置阈值的候选。不存在“一键发布全部候选”；接受只是审核状态变化，尚未进入正式库。

## 14. 正式应用

1. 先点击“应用前预检”。
2. 核对预检数量与材料。
3. 勾选需要应用的已接受候选；不勾选时表示全部已接受候选。
4. 点击“正式应用已接受候选”。
5. 输入确认短语 `APPLY ACCEPTED`。

正式应用会备份文件、更新 `materials.json`、转换正式 WebP、更新 `metadata.json` 和署名清单、同步 `materials.js`、运行项目验证，并把材料设为“待核验”。

已有非空正式参数默认不覆盖。确需替换时，必须在“编辑后接受”中勾选“明确允许替换当前非空正式值”。正式图片三个槽位都满时也不会自动覆盖。

## 15. 备份与恢复

研究正式应用备份位于 `backups/research_apply_YYYY-MM-DD_HHMMSS/`。

通过审核页“恢复研究备份”，输入 `RESTORE RESEARCH`。命令行方式：

```powershell
python tools\research_import.py --restore-latest --yes
```

恢复会覆盖最近一次研究应用涉及的正式文件和材料图片目录。操作前确认没有需要保留的后续人工编辑。

## 16. 查看运行日志和进度

双击 `tools\12_查看自动研究进度.bat`，或运行：

```powershell
python tools\auto_research.py --status
python tools\research_validator.py
```

日志记录时间、材料 ID、任务类型、检索词、来源、下载结果、错误、API 调用数和验证结果。单个材料失败不会使整个批次停止。

## 17. 控制 AI 图片费用

1. 保持 `allow_ai_generated_images=false`，费用为零。
2. 优先使用程序化结构模板。
3. 开启前设置较小的 `max_generated_images_per_run`，默认 5。
4. 先使用 `--plan` 查看预估。
5. 只对指定材料运行，不要直接处理全部数据库。
6. 定期检查 OpenAI 账户用量。
7. 生成失败不会回退为无来源图片，也不会影响其他研究任务。

## 18. 来源冲突处理

同一参数出现不同来源时，不自动平均。分别保留测试条件，对照牌号、状态、方向、温度和标准，只接受适用于当前实体的一条。同一材料同一字段存在多个已接受候选时，正式应用会拒绝并要求先处理冲突。

## 19. 必须人工核验的内容

- 图片是否确实对应当前材料，而不是缩写同名事物。
- family 参考图能否用于子级，是否需要标记“家族参考图”。
- 显微图的牌号、状态、热处理、方向、比例尺和图号。
- 图片许可证是否允许当前网站的发布方式。
- 工程参数的单位、测试条件、标准和适用状态。
- 生产商典型值能否代表目标产品。
- 程序化或 AI 结构示意是否科学表达正确。
- 数据来源是否仍可访问，是否需要补页码和表号。

自动验证只能拦截结构性和明显安全问题，不能代替材料专家判断。

## 20. 常见问题

### Wikimedia 请求失败

检查网络、代理和防火墙，稍后使用 `--resume` 继续。不要绕过验证码或登录限制。

### 候选图片无法显示

运行 `python tools\research_validator.py`，检查路径、MIME、尺寸和 SHA256。候选路径必须位于对应材料的 `candidates` 目录。

### 候选无法接受

查看卡片验证错误。常见原因是无来源数值、缺单位、牌号无材料状态、许可证不在白名单或图片文件损坏。

### 正式应用提示已有值

这是正式数据保护。核对候选后再明确允许替换，不要只为消除提示而勾选。

### 主网站未更新

确认正式应用成功，再刷新主网站。必要时运行 `tools\06_同步材料数据.bat`，但不要手工编辑 `materials.js`。

### AI 图片没有生成

这是默认行为。只有设置环境变量、安装 openai、明确开启配置并调用 AI 结构生成流程时才会产生请求。宏观图和微观图永远不允许使用 AI 生成。

### PowerShell 显示中文乱码或 `ConvertFrom-Json` 报错

研究文件统一使用 UTF-8。Windows PowerShell 5 读取时请明确指定编码，例如：

```powershell
Get-Content -Raw -Encoding UTF8 data\research\property-candidates.json | ConvertFrom-Json
```

也可以直接运行项目的 Python 命令查看状态。不要因终端代码页造成的乱码手工改写候选 JSON。
