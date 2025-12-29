// スキンをいい感じにするライブラリ的な

// 透明度が255のドットのみを転送する
function pasteOpaquePixels(ctx, srcX, srcY, dstX, dstY, w, h) {
  const src = ctx.getImageData(srcX, srcY, w, h);
  const dst = ctx.getImageData(dstX, dstY, w, h);

  for (let i = 0; i < src.data.length; i += 4) {
    const alpha = src.data[i + 3];

    if (alpha === 255) {
      dst.data[i] = src.data[i]; // R
      dst.data[i + 1] = src.data[i + 1]; // G
      dst.data[i + 2] = src.data[i + 2]; // B
      dst.data[i + 3] = 255; // A
    }
  }

  ctx.putImageData(dst, dstX, dstY);
}

// ドット転送、x回転版
// UV反転してんのまじで許さない
function pasteOpaquePixelsFlipX(ctx, srcX, srcY, dstX, dstY, w, h) {
  const src = ctx.getImageData(srcX, srcY, w, h);
  const dst = ctx.getImageData(dstX, dstY, w, h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const srcIndex = (y * w + x) * 4;
      const dstIndex = (y * w + (w - 1 - x)) * 4;

      const alpha = src.data[srcIndex + 3];
      if (alpha === 255) {
        dst.data[dstIndex] = src.data[srcIndex];
        dst.data[dstIndex + 1] = src.data[srcIndex + 1];
        dst.data[dstIndex + 2] = src.data[srcIndex + 2];
        dst.data[dstIndex + 3] = 255;
      }
    }
  }

  ctx.putImageData(dst, dstX, dstY);
}

// ドットのAを0に、つまりドットを削除する
function clearPixel(ctx, x, y) {
  const img = ctx.getImageData(x, y, 1, 1);
  img.data[3] = 0; // A = 0
  ctx.putImageData(img, x, y);
}

// メイン処理
function processSkin(base64) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = "data:image/png;base64," + base64;

    // 開始
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      let tempImgData = null;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      // レイヤー上書き
      // 右足
      pasteOpaquePixels(ctx, 0, 32, 0, 16, 16, 16);
      // 胴体
      pasteOpaquePixels(ctx, 16, 32, 16, 16, 24, 16);
      // 右腕
      pasteOpaquePixels(ctx, 40, 32, 40, 16, 14, 16);
      // 頭
      // アイラインが上書きされるとあんまり良い見た目にならないので
      // アイラインがある一部のレイヤー側ドットを削除
      clearPixel(ctx, 40, 13);
      clearPixel(ctx, 41, 12);
      clearPixel(ctx, 46, 12);
      clearPixel(ctx, 47, 13);
      // 頭のレイヤー上書き
      pasteOpaquePixels(ctx, 32, 0, 0, 0, 32, 16);

      // 腕を3pxから4pxに変換
      // frontとback、topとbottomのテクスチャの中央を2pxに増幅する
      // topだけUVが鏡になってるので反転処理が必要。なんで？
      // front,back
      pasteOpaquePixels(ctx, 45, 20, 46, 20, 9, 12);
      pasteOpaquePixels(ctx, 53, 20, 54, 20, 6, 16);
      // top,bottom
      pasteOpaquePixels(ctx, 45, 16, 46, 16, 5, 4);
      pasteOpaquePixels(ctx, 49, 16, 50, 16, 2, 4);
      // top反転
      pasteOpaquePixelsFlipX(ctx, 44, 16, 44, 16, 4, 4);

      // 切り取り用キャンバス
      const outCanvas = document.createElement("canvas");
      outCanvas.width = 64;
      outCanvas.height = 32;

      const outCtx = outCanvas.getContext("2d");

      // 上部 64x32 をコピー
      outCtx.drawImage(
        canvas, // 元
        0,
        0,
        64,
        32, // src
        0,
        0,
        64,
        32 // dst
      );

      // base64 出力
      const resultBase64 = outCanvas.toDataURL("image/png").split(",")[1];

      resolve(resultBase64);
    };
  });
}
