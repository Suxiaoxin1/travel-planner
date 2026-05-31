/**
 * 图片加载优化工具
 * 1. Wikimedia 缩略图：将原始图片URL转为400px宽缩略图，体积减少95%+
 * 2. 渐进式加载 + 重试机制
 */

/**
 * 将 Wikimedia Commons 原始URL转为缩略图URL
 * 原始: https://upload.wikimedia.org/wikipedia/commons/e/ef/Filename.jpg
 * 缩略: https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Filename.jpg/400px-Filename.jpg
 * 
 * 对于SVG文件，转为PNG缩略图：
 * 缩略: https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Filename.svg/400px-Filename.svg.png
 */
export function getWikimediaThumb(url, width = 400) {
  if (!url || !url.includes('upload.wikimedia.org/wikipedia/commons/')) {
    return url // 非Wikimedia链接原样返回
  }

  // 已经是缩略图URL，不重复处理
  if (url.includes('/thumb/')) return url

  // 解析路径：/wikipedia/commons/{hash1}/{hash2}/{filename}
  const match = url.match(/\/wikipedia\/commons\/([a-f0-9]{1})\/([a-f0-9]{2})\/([^/?]+)$/)
  if (!match) return url

  const [, h1, h2, filename] = match
  const prefix = `${h1}/${h2}`

  // SVG 文件需要额外 .png 后缀
  const isSvg = filename.toLowerCase().endsWith('.svg')
  const suffix = isSvg ? `${width}px-${filename}.png` : `${width}px-${filename}`

  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${prefix}/${filename}/${suffix}`
}

/**
 * 获取带回退的图片URL列表（用于重试）
 * 依次尝试：缩略图 → 原图 → 空
 */
export function getImageSrcSet(url, thumbWidth = 400) {
  const thumb = getWikimediaThumb(url, thumbWidth)
  const srcList = []

  if (thumb !== url) {
    srcList.push(thumb)   // 优先尝试缩略图
    srcList.push(url)     // 缩略图失败回退原图
  } else {
    srcList.push(url)     // 非Wikimedia直接用原图
  }

  return srcList
}
