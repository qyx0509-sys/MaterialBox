# MaterialBox 宏观图片批量导入工具

这套工具从 `materials.json` 读取全部材料，通过 **Wikimedia Commons API** 检索开放授权图片，下载候选图供人工审核，然后把选中的图片接入现有网页。

## 最简单的 Windows 使用方式

按顺序双击：

1. `tools/01_安装图片工具.bat`
2. `tools/02_批量获取候选图.bat`
3. `tools/03_打开审核页.bat`
4. 在审核页为每种材料选择一张图，点击“导出 review-selections.json”
5. 把下载的 `review-selections.json` 复制到项目根目录
6. 双击 `tools/04_应用审核结果.bat`
7. 双击 `tools/05_查看图片进度.bat` 检查剩余缺图材料

## 命令行方式

安装依赖：

```bash
python -m pip install -r tools/requirements.txt
```

先测试 3 个材料：

```bash
python tools/fetch_material_images.py fetch --max-materials 3 --limit 3 --contact "你的邮箱或项目主页"
```

获取全部材料候选图：

```bash
python tools/fetch_material_images.py fetch --limit 3 --contact "你的邮箱或项目主页"
```

只获取一个分类：

```bash
python tools/fetch_material_images.py fetch --category "金属材料" --limit 3 --contact "你的邮箱或项目主页"
```

只重新获取指定材料：

```bash
python tools/fetch_material_images.py fetch --material steel --material PEEK --overwrite --contact "你的邮箱或项目主页"
```

审核后应用：

```bash
python tools/fetch_material_images.py apply
```

不进行人工选择，直接采用每种材料排名第一的候选图：

```bash
python tools/fetch_material_images.py apply --auto-top
```

> `--auto-top` 速度快，但 PET、PC、PI、硅、石墨烯等材料容易出现语义误匹配，正式网站仍建议人工审核。

## 自动生成的文件

- `assets/images/materials/{material_id}/candidates/`：候选图片
- `assets/images/materials/{material_id}/macro_01.jpg`：最终采用的宏观图
- `assets/images/materials/{material_id}/metadata.json`：图片来源与许可证
- `review-images.json`：审核页数据
- `review-selections.json`：审核选择结果
- `material-images.generated.js`：自动生成的前端图片映射
- `image-attribution.csv`：全站图片署名与许可清单

`material-images.generated.js` 会与原来的 `material-images.js` 合并，不会删除你已有的手工图片配置。

## 图片筛选原则

优先选择：

- 能清楚展示材料本身的颜色、纹理、颗粒、薄膜、板材、纤维、块体或典型形态；
- 主体明确、背景较干净、分辨率足够；
- 来源页明确标注作者和许可证。

不要选择：

- 商标、宣传海报、纯文字图、结构式、统计图；
- 只展示某个复杂产品，却看不出材料本身的图片；
- 与材料缩写同名但含义不同的图片，例如 PET 宠物、PC 电脑、PI 数学符号。

## 版权与来源

脚本默认只接受常见的 CC0、Public Domain、CC BY、CC BY-SA 图片，并把作者、许可证和来源页保存到元数据与 CSV 中。即使图片来自 Wikimedia Commons，每张图的署名要求仍可能不同，发布网站前应保留来源和许可证展示。
