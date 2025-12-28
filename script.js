document.getElementById("btn").onclick = () => {
  const input = document.getElementById("imgInput");
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    // 1. base64生データ取得
    const dataUrl = reader.result;
    const base64 = dataUrl.split(",")[1];

    // 2. JSONオブジェクト作成
    const snowflakeId = "9223372036854775807";
    const obj = {};
    obj[snowflakeId] = base64;

    // 3. JSON文字列化
    const jsonStr = JSON.stringify(obj);

    // 4. JSON文字列 → UTF-8 → hex(カンマ区切り)
    const encoder = new TextEncoder();
    const bytes = encoder.encode(jsonStr);

    const hexArray = [];
    for (const b of bytes) {
      hexArray.push(b.toString(16).padStart(2, "0"));
    }
    hexArray.push("00");

    const hexStr = hexArray.join(",");

    // 5. 出力
    const regText = `Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\\Software\\Pixel Gun Team\\Pixel Gun 3D]
"User Skins_h1196497400"=hex:${hexStr}`;

    const blob = new Blob([regText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "skin.reg";
    a.click();

    URL.revokeObjectURL(url);
  };

  reader.readAsDataURL(file);
};
