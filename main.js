// ファイルの取得とbase64の抽出
function getImageBase64(image) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = () => {
      resolve(reader.result.split(",")[1]);
    };
  });
}

// snowflakeIDの生成
// まともに生成はめんどくさいのでlong値からデクリメント
function generateSnowflakeId(current_id) {
  const id = current_id;
  current_id -= 1n;
  return id.toString();
}

//object -> string -> utf-8 -> hex
function objToHexArray(skinmap) {
  const encoder = new TextEncoder();

  const skinmap_str = JSON.stringify(skinmap);
  const skinmap_utf8 = encoder.encode(skinmap_str);
  const skinmap_hex = [];
  for (let b of skinmap_utf8) {
    skinmap_hex.push(b.toString(16).padStart(2, "0"));
  }
  // レジストリ用のnull終端
  skinmap_hex.push("00");
  const result = skinmap_hex.join(",");
  return result;
}

// .regファイルの出力
function createRegistoryFile(skinmap_hex_array) {
  const regText = `Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\\Software\\Pixel Gun Team\\Pixel Gun 3D]
"User Skins_h1196497400"=hex:${skinmap_hex_array}`;
  // URL作成
  const blob = new Blob([regText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "skin.reg";
  a.click();

  URL.revokeObjectURL(url);
}

// オプションの値
function getOptions() {
  return {
    useProcessSkin: document.getElementById("use_process_skin").checked,
    useFlipArmTop: document.getElementById("use_flip_arm_top").checked,
    useSeccondLayerEyelineRemove: document.getElementById(
      "use_seccond_layer_eyeline_remove"
    ).checked,
    // レイヤー上書きスキップ
    skipSeccondLayerOverLayAll: document.getElementById(
      "skip_seccond_layer_ovarlay_all"
    ).checked,
    skipSeccondLayerOverLayHead: document.getElementById(
      "skip_seccond_layer_ovarlay_head"
    ).checked,
    skipSeccondLayerOverLayBody: document.getElementById(
      "skip_seccond_layer_ovarlay_body"
    ).checked,
    skipSeccondLayerOverLayArm: document.getElementById(
      "skip_seccond_layer_ovarlay_arm"
    ).checked,
    skipSeccondLayerOverLayLeg: document.getElementById(
      "skip_seccond_layer_ovarlay_leg"
    ).checked,
    // 腕、足の使用テクスチャ
    textureSideArm: document.getElementById("texture_side_arm").value,
    textureSideLeg: document.getElementById("texture_side_leg").value,
  };
}

// メイン処理
document.getElementById("btn").onclick = async () => {
  const input_image = document.getElementById("imgInput");
  const file_datas = input_image.files;
  const skinmap = {};
  const option = getOptions();
  let current_id = 9223372036854775807n;

  // 画像とsnowflakeIDを生成、紐づけ
  for (let data of file_datas) {
    const raw_base64 = await getImageBase64(data);

    // 画像加工処理を通す
    // todo: スキンサイズが64x64だとまずいのでどうにかする。
    const modify_base64 = await processSkin(raw_base64, option);
    const id = generateSnowflakeId(current_id);
    skinmap[id] = modify_base64;
  }

  // 辞書オブジェクトをhex配列へと変換
  const skinmap_hex_array = objToHexArray(skinmap);

  // .regに詰めて出力
  createRegistoryFile(skinmap_hex_array);
};
